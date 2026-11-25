import { Cbor, requestIdOf } from '@icp-sdk/core/agent';
import { IDL } from '@icp-sdk/core/candid';
import { Principal } from '@icp-sdk/core/principal';
import { Signer } from '@icp-sdk/signer';
import { SignerAgent } from '@icp-sdk/signer/agent';
import { PostMessageTransport } from '@icp-sdk/signer/web';
import {
  LEDGER, OISY, ROOT, accountType, assertMainnet, hex, interfaceNumber, ledgerQueries,
  mainnetAgent, microUnits, readInterface, rootActor, unwrap,
} from './fuse.mjs';

const bytes = IDL.Vec(IDL.Nat8);
export const transferArg = IDL.Record({
  from_subaccount: IDL.Opt(bytes),
  to: accountType,
  amount: IDL.Nat,
  fee: IDL.Opt(IDL.Nat),
  memo: IDL.Opt(bytes),
  created_at_time: IDL.Opt(IDL.Nat64),
});
export const transferResult = IDL.Variant({
  Ok: IDL.Nat,
  Err: IDL.Variant({
    BadFee: IDL.Record({ expected_fee: IDL.Nat }),
    BadBurn: IDL.Record({ min_burn_amount: IDL.Nat }),
    InsufficientFunds: IDL.Record({ balance: IDL.Nat }),
    TooOld: IDL.Null,
    CreatedInFuture: IDL.Record({ ledger_time: IDL.Nat64 }),
    Duplicate: IDL.Record({ duplicate_of: IDL.Nat }),
    TemporarilyUnavailable: IDL.Null,
    GenericError: IDL.Record({ error_code: IDL.Nat, message: IDL.Text }),
  }),
});

export async function connectOisy() {
  const signer = new Signer({
    transport: new PostMessageTransport({ url: OISY }),
    autoCloseTransportChannel: false,
  });
  // Call this from a click handler so the browser allows the popup.
  await signer.openChannel();
  const methods = ['icrc27_accounts', 'icrc49_call_canister'];
  const permissions = await signer.requestPermissions(methods.map(method => ({ method })));
  if (!methods.every(method => permissions.some(({ scope, state }) =>
    scope.method === method && (state === 'granted' || state === 'ask_on_use')))) {
    throw new Error('OISY did not grant account and signing permissions');
  }
  const returned = await signer.getAccounts();
  const accounts = [...new Set(returned.filter(({ subaccount }) =>
    !subaccount?.length || subaccount.length === 32 && subaccount.every(byte => byte === 0),
  ).map(({ owner }) => owner.toText()))];
  if (!accounts.length) throw new Error('Select a primary ckUSDT account in OISY');
  return {
    accounts,
    select(owner) {
      if (!accounts.includes(owner)) throw new Error('This account is not available in OISY');
      const http = mainnetAgent();
      const agent = SignerAgent.createSync({ signer, account: Principal.fromText(owner), agent: http });
      return { owner, agent, root: rootActor(agent), publicRoot: rootActor(http),
        ledger: ledgerQueries(http), open: () => signer.openChannel() };
    },
  };
}

function checkOwner(row, owner, revision) {
  assertMainnet(row.source);
  if (row.owner.toText() !== owner || row.revision !== revision ||
      !row.request.DepositTransfer || row.operation_id.length !== 32) {
    throw new Error('The request belongs to a different participant or operation');
  }
}

export function validateDeposit(row, owner, selected) {
  const { revision, id, amount, fee, memoHex } = selected;
  checkOwner(row, owner, revision);
  const saved = row.request.DepositTransfer;
  if (row.wallet_transport[0] !== true || !row.ready || !('Pending' in row.stage) ||
      saved.interface_id !== id || saved.amount !== amount || saved.fee !== fee ||
      hex(saved.memo) !== memoHex) {
    throw new Error('The prepared request does not match the selected conditions');
  }

  const template = Cbor.decode(Uint8Array.from(row.content));
  const arg = Uint8Array.from(template.arg);
  const nonce = Uint8Array.from(row.operation_id);
  const [actual] = IDL.decode([transferArg], arg);
  const expected = {
    from_subaccount: [],
    to: { owner: Principal.fromText(ROOT), subaccount: [] },
    amount, fee: [fee], memo: [saved.memo], created_at_time: [saved.created_at_time],
  };
  if (template.request_type !== 'call' || template.method_name !== 'icrc1_transfer' ||
      Principal.fromUint8Array(template.sender).toText() !== owner ||
      Principal.fromUint8Array(template.canister_id).toText() !== LEDGER ||
      BigInt(template.ingress_expiry) !== row.ingress_expiry ||
      hex(template.nonce) !== hex(nonce) || hex(requestIdOf(template)) !== hex(row.request_id) ||
      hex(new Uint8Array(IDL.encode([transferArg], [actual]))) !==
        hex(new Uint8Array(IDL.encode([transferArg], [expected])))) {
    throw new Error('A transfer with modified details will not be sent to OISY');
  }
  return { arg, nonce };
}

export function depositStatus(row) {
  if (row.stage.Ledger?.credited === true) return 'credited';
  if (row.confirmed_pending_micro_units?.[0] > 0n) return 'confirmed';
  if ('NotSent' in row.stage) return 'not-sent';
  return 'checking';
}

function withJournal(session, action) {
  const key = ['fuse-deposit', ROOT, LEDGER, session.owner].join(':');
  const locks = globalThis.navigator?.locks;
  if (!locks) throw new Error('The payment example requires HTTPS and Web Locks');
  return locks.request(key, () => action({
    load: () => JSON.parse(localStorage.getItem(key) ?? 'null'),
    save: entry => localStorage.setItem(key, JSON.stringify(entry)),
    finish: () => localStorage.removeItem(key),
  }));
}

function result(row, journal) {
  const state = depositStatus(row);
  if (state !== 'checking') journal.finish();
  return { state, row };
}

function preparedPreview(row, owner, selection) {
  validateDeposit(row, owner, selection);
  return { ...selection, owner, receiver: ROOT, operation: hex(row.operation_id),
    total: selection.amount + selection.fee };
}

export async function prepareDeposit(session, interfaceId, amountText) {
  await session.open();
  return withJournal(session, async journal => {
    if (journal.load()) throw new Error('Check the saved deposit first');
    const id = interfaceNumber(interfaceId);
    const amount = microUnits(amountText);
    const [binding, fee, decimals, runtime, status] = await Promise.all([
      readInterface(id, session.publicRoot),
      session.ledger.icrc1_fee(),
      session.ledger.icrc1_decimals(),
      session.publicRoot.wallet_runtime_capabilities().then(unwrap),
      session.root.my_incoming_status().then(unwrap),
    ]);
    assertMainnet(runtime.source);
    if (!runtime.deposits || !status.root_available || decimals !== 6) {
      throw new Error('FUSE is not ready to accept deposits');
    }
    if (status.latest[0] && depositStatus(status.latest[0]) === 'checking') {
      throw new Error('This wallet already has a request. Check it in FUSE');
    }
    const revision = status.next_revision;
    const selection = { id, revision, amount, fee, memoHex: binding.memoHex };
    const pointer = { revision: String(revision), phase: 'preparing', id: String(id),
      amount: String(amount), fee: String(fee), memoHex: binding.memoHex };
    journal.save(pointer);
    const choice = await session.root.choose_wallet_incoming_from_view(
      revision, { Deposit: { interface_id: id, amount } }, fee,
    );
    if ('Err' in choice) journal.finish();
    const preview = preparedPreview(unwrap(choice), session.owner, selection);
    journal.save({ ...pointer, phase: 'prepared', operation: preview.operation });
    return preview;
  });
}

export async function sendPreparedDeposit(session, preview) {
  await session.open();
  return withJournal(session, async journal => {
    const pointer = journal.load();
    if (pointer?.phase !== 'prepared' || pointer.revision !== String(preview.revision) ||
        pointer.operation !== preview.operation || preview.owner !== session.owner ||
        preview.receiver !== ROOT || preview.total !== preview.amount + preview.fee) {
      throw new Error('Check the saved operation. New submissions are disabled');
    }
    const [status, binding, fee] = await Promise.all([
      session.root.my_incoming_status().then(unwrap),
      readInterface(preview.id, session.publicRoot),
      session.ledger.icrc1_fee(),
    ]);
    const row = status.latest[0];
    if (!status.root_available || !row || fee !== preview.fee || binding.memoHex !== preview.memoHex ||
        hex(row.operation_id) !== pointer.operation) {
      throw new Error('The conditions changed. Check the previous request');
    }
    const payload = validateDeposit(row, session.owner, preview);
    // Record the attempt before signing to prevent resubmission if the popup closes.
    journal.save({ ...pointer, phase: 'checking' });
    const { reply } = await session.agent.update(LEDGER, { methodName: 'icrc1_transfer', ...payload });
    const [outcome] = IDL.decode([transferResult], reply);
    const block = 'Ok' in outcome ? outcome.Ok : outcome.Err.Duplicate?.duplicate_of;
    if (block === undefined) {
      throw new Error('The ledger did not confirm the transfer. Check the saved request');
    }
    journal.save({ ...pointer, phase: 'checking', block: String(block) });
    const confirmed = unwrap(await session.root.confirm_incoming_block(preview.revision, block));
    checkOwner(confirmed, session.owner, preview.revision);
    return result(confirmed, journal);
  });
}

export async function recoverDeposit(session, savedRevision) {
  await session.open();
  return withJournal(session, async journal => {
    const pointer = journal.load();
    const revision = pointer ? BigInt(pointer.revision) : savedRevision;
    if (typeof revision !== 'bigint' || revision < 0n || revision >= (1n << 64n)) {
      throw new Error('Enter the previous request number');
    }
    const [previous] = unwrap(await session.root.my_incoming_choice(revision));
    if (!previous) return { state: 'checking', revision };
    checkOwner(previous, session.owner, revision);
    if (pointer?.operation && pointer.operation !== hex(previous.operation_id)) {
      throw new Error('The operation number does not match the saved request');
    }
    if (depositStatus(previous) !== 'checking') return result(previous, journal);
    const knownBlock = previous.stage.Ledger?.ledger_block ??
      (pointer?.block === undefined ? undefined : BigInt(pointer.block));
    const observed = unwrap(await (knownBlock === undefined
      ? session.root.scan_incoming_choice(revision, 16)
      : session.root.confirm_incoming_block(revision, knownBlock)));
    checkOwner(observed, session.owner, revision);
    if (depositStatus(observed) === 'checking' && 'Pending' in observed.stage &&
        (pointer?.phase === 'preparing' || pointer?.phase === 'prepared')) {
      // This tab has not contacted the signer. It can display the previous conditions.
      const preview = preparedPreview(observed, session.owner, {
        revision, id: BigInt(pointer.id), amount: BigInt(pointer.amount),
        fee: BigInt(pointer.fee), memoHex: pointer.memoHex,
      });
      journal.save({ ...pointer, phase: 'prepared', operation: preview.operation });
      return { state: 'awaiting-confirmation', row: observed, preview };
    }
    return result(observed, journal);
  });
}
