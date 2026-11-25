import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Cbor, requestIdOf } from '@icp-sdk/core/agent';
import { IDL } from '@icp-sdk/core/candid';
import { Principal } from '@icp-sdk/core/principal';
import { idlFactory } from '../api/fuse-interface.idl.mjs';
import { LEDGER, ROOT, hex, interfaceNumber, microUnits, readInterface } from '../examples/fuse.mjs';
import {
  depositStatus, prepareDeposit, recoverDeposit, sendPreparedDeposit, transferArg, transferResult,
  validateDeposit,
} from '../examples/oisy-deposit.mjs';

const principal = Principal.fromUint8Array(Uint8Array.of(50, 1));
const rootId = Principal.fromText(ROOT);
const ledgerId = Principal.fromText(LEDGER);
const id = 42n;
const amount = 10_250_000n;
const fee = 10_000n;
const memo = Uint8Array.of(1, 2, 42);
const nonce = new Uint8Array(32).fill(23);
const created = 1_795_000_000_000_000_000n;
const expiry = created + 120_000_000_000n;
const source = { app: rootId, ledger: ledgerId, local_test: false };
const active = { id, controller: principal, payout_principal: principal, registered_at_ns: created };
const selected = { id, revision: 0n, amount, fee, memoHex: hex(memo) };
const ok = value => ({ Ok: value });

function makeRow(overrides = {}) {
  const arg = new Uint8Array(IDL.encode([transferArg], [{
    from_subaccount: [], to: { owner: rootId, subaccount: [] }, amount, fee: [fee],
    memo: [memo], created_at_time: [created], ...overrides,
  }]));
  const template = {
    request_type: 'call', sender: principal.toUint8Array(), canister_id: ledgerId.toUint8Array(),
    method_name: 'icrc1_transfer', nonce, ingress_expiry: expiry, arg,
  };
  return {
    revision: 0n,
    owner: principal,
    source,
    operation_id: nonce,
    request: { DepositTransfer: { interface_id: id, amount, fee, memo, created_at_time: created } },
    ingress_expiry: expiry,
    content: new Uint8Array(Cbor.encode(template)),
    request_id: requestIdOf(template),
    ready: true,
    wallet_transport: [true],
    stage: { Pending: null },
    confirmed_pending_micro_units: [],
    scan_next: 8n,
    storage_bytes: 400n,
  };
}

const binding = () => ({ registration: active, memo, issued_at_ns: created + 1n, interface_id: id });
const publicRoot = {
  interface_info: async () => ok([active]),
  interface_deposit_memo: async () => ok([binding()]),
  wallet_runtime_capabilities: async () => ok({ deposits: true, source }),
};

function setBrowserGlobals(t) {
  const storage = new Map();
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
    locks: { request: (_key, run) => run() },
  } });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  } });
  t.after(() => {
    delete globalThis.localStorage;
    if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator);
    else delete globalThis.navigator;
  });
}

function makeSession(t, reply = () => { throw new Error('The OISY response was lost'); }) {
  setBrowserGlobals(t);
  const row = makeRow();
  let choice;
  let calls = 0;
  const confirmations = [];
  const credited = { ...row, stage: { Ledger: {
    ledger_block: 9n, credited: true, unattributed: false,
  } } };
  const session = {
    owner: principal.toText(),
    open: async () => {},
    publicRoot,
    ledger: { icrc1_fee: async () => fee, icrc1_decimals: async () => 6 },
    root: {
      my_incoming_status: async () => ok({
        root_available: true, next_revision: choice ? 1n : 0n, latest: choice ? [choice] : [],
      }),
      my_incoming_choice: async revision => {
        assert.equal(revision, 0n);
        return ok(choice ? [choice] : []);
      },
      choose_wallet_incoming_from_view: async (revision, request, expectedFee) => {
        assert.equal(revision, 0n);
        assert.equal(expectedFee, fee);
        assert.deepEqual(request, { Deposit: { interface_id: id, amount } });
        choice = row;
        return ok(row);
      },
      scan_incoming_choice: async (revision, maxBlocks) => {
        assert.equal(revision, 0n);
        assert.equal(maxBlocks, 16);
        if (calls) choice = credited;
        return ok(choice);
      },
      confirm_incoming_block: async (revision, block) => {
        assert.equal(revision, 0n);
        confirmations.push(block);
        choice = credited;
        return ok(choice);
      },
    },
    agent: { update: async (canister, payload) => {
      calls++;
      assert.equal(canister, LEDGER);
      assert.equal(payload.methodName, 'icrc1_transfer');
      assert.deepEqual(payload.nonce, nonce);
      assert.deepEqual(payload.arg, Cbor.decode(row.content).arg);
      return reply();
    } },
  };
  return { session, calls: () => calls, confirmations };
}

test('interface_id and amounts retain Candid precision', () => {
  assert.equal(interfaceNumber('18446744073709551615'), (1n << 64n) - 1n);
  assert.equal(microUnits('10.25'), amount);
  assert.equal(microUnits('0.000001'), 1n);
  assert.throws(() => interfaceNumber(42));
  assert.throws(() => interfaceNumber('18446744073709551616'));
  assert.throws(() => microUnits('0.0000001'));
  assert.throws(() => microUnits('1e3'));
});

test('the public client checks the ID, active registration, and memo', async () => {
  assert.equal((await readInterface('42', publicRoot)).memoHex, hex(memo));
  await assert.rejects(readInterface('41', publicRoot), /Interface configuration does not match/);
  await assert.rejects(readInterface('42', { ...publicRoot, interface_info: async () => ok([]) }),
    /not active yet/);
});

test('JavaScript Candid decodes the prepared request and optional field', () => {
  const methods = new Map(idlFactory({ IDL })._fields);
  const returns = methods.get('choose_wallet_incoming_from_view').retTypes;
  const row = makeRow();
  const [decoded] = IDL.decode(returns, IDL.encode(returns, [ok(row)]));
  assert.deepEqual(decoded.Ok.confirmed_pending_micro_units, []);
  assert.deepEqual(validateDeposit(decoded.Ok, principal.toText(), selected).nonce, nonce);
});

test('a request with changed details is not sent to OISY', () => {
  assert.throws(() => validateDeposit(makeRow({ amount: amount + 1n }), principal.toText(), selected));
  assert.throws(() => validateDeposit(makeRow({ to: { owner: ledgerId, subaccount: [] } }),
    principal.toText(), selected));
  assert.throws(() => validateDeposit(makeRow(), principal.toText(), { ...selected, id: 41n }));
  assert.throws(() => validateDeposit(makeRow(), ledgerId.toText(), selected));
});

test('a lost response is recovered against the same request without resubmission', async t => {
  const { session, calls } = makeSession(t);
  const preview = await prepareDeposit(session, '42', '10.25');
  await assert.rejects(sendPreparedDeposit(session, preview), /The OISY response was lost/);
  await assert.rejects(sendPreparedDeposit(session, preview), /New submissions are disabled/);
  await assert.rejects(prepareDeposit(session, '42', '10.25'), /saved deposit/);
  const result = await recoverDeposit(session);
  assert.equal(result.state, 'credited');
  assert.equal(result.row.stage.Ledger.ledger_block, 9n);
  assert.equal(calls(), 1);
});

test('before submission, recovery returns the same confirmation preview', async t => {
  const { session, calls } = makeSession(t);
  const preview = await prepareDeposit(session, id, '10.25');
  const restored = await recoverDeposit(session);
  assert.equal(restored.state, 'awaiting-confirmation');
  assert.deepEqual(restored.preview, preview);
  assert.equal(calls(), 0);
});

test('a Duplicate response is checked against the original block', async t => {
  const reply = () => ({
    reply: IDL.encode([transferResult], [{ Err: { Duplicate: { duplicate_of: 9n } } }]),
  });
  const { session, calls, confirmations } = makeSession(t, reply);
  const preview = await prepareDeposit(session, id, '10.25');
  assert.equal((await sendPreparedDeposit(session, preview)).state, 'credited');
  assert.deepEqual(confirmations, [9n]);
  assert.equal(calls(), 1);
});

test('transfer confirmation and accounting credit have distinct states', () => {
  const row = makeRow();
  const stage = { Ledger: { ledger_block: 9n, credited: false, unattributed: false } };
  assert.equal(depositStatus({ ...row, stage }), 'checking');
  assert.equal(depositStatus({ ...row, stage, confirmed_pending_micro_units: [amount] }), 'confirmed');
});
