import { Actor, HttpAgent } from '@icp-sdk/core/agent';
import { IDL } from '@icp-sdk/core/candid';
import { idlFactory } from '../api/fuse-interface.idl.mjs';

export const ROOT = 'ouuix-fyaaa-aaaai-aygia-cai';
export const LEDGER = 'cngnf-vqaaa-aaaar-qag4q-cai';
export const GATEWAY = 'https://icp-api.io';
export const OISY = 'https://signer.oisy.com/';

export const accountType = IDL.Record({
  owner: IDL.Principal,
  subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
});

export function mainnetAgent() {
  return HttpAgent.createSync({
    host: GATEWAY,
    shouldFetchRootKey: false,
    verifyQuerySignatures: true,
  });
}

export function rootActor(agent = mainnetAgent()) {
  return Actor.createActor(idlFactory, { agent, canisterId: ROOT });
}

export function ledgerQueries(agent = mainnetAgent()) {
  return Actor.createActor(() => IDL.Service({
    icrc1_fee: IDL.Func([], [IDL.Nat], ['query']),
    icrc1_decimals: IDL.Func([], [IDL.Nat8], ['query']),
  }), { agent, canisterId: LEDGER });
}

export function unwrap(result) {
  if ('Err' in result) throw new Error(result.Err);
  return result.Ok;
}

export function interfaceNumber(id) {
  if (typeof id !== 'bigint' && typeof id !== 'string') {
    throw new Error('Pass interface_id as a string or BigInt');
  }
  if (!/^[1-9]\d{0,19}$/.test(String(id)) || BigInt(id) >= (1n << 64n)) {
    throw new Error('Invalid interface_id');
  }
  return BigInt(id);
}

export function microUnits(text) {
  if (typeof text !== 'string' || !/^\d{1,33}(?:\.\d{1,6})?$/.test(text)) {
    throw new Error('Enter the amount as a string with a decimal point and up to six decimal places');
  }
  const [whole, fraction = ''] = text.split('.');
  const amount = BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, '0'));
  if (amount <= 0n || amount >= (1n << 128n)) throw new Error('Amount is out of range');
  return amount;
}

export function hex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function assertMainnet(source) {
  if (source?.app.toText() !== ROOT || source.ledger.toText() !== LEDGER ||
      source.local_test !== false) {
    throw new Error('FUSE Root or the ckUSDT ledger does not match the configuration');
  }
}

export async function readInterface(id, root = rootActor()) {
  id = interfaceNumber(id);
  const [activeResult, memoResult] = await Promise.all([
    root.interface_info(id),
    root.interface_deposit_memo(id),
  ]);
  const [active] = unwrap(activeResult);
  if (!active) throw new Error('The interface is not active yet. Check the bond and domain in FUSE');
  const [binding] = unwrap(memoResult);
  const saved = binding?.registration;
  if (!saved || !binding.memo.length || binding.memo.length > 32 ||
      active.id !== id || binding.interface_id !== id || saved.id !== id ||
      saved.registered_at_ns !== active.registered_at_ns ||
      saved.controller.toText() !== active.controller.toText() ||
      saved.payout_principal.toText() !== active.payout_principal.toText()) {
    throw new Error('Interface configuration does not match. Stop accepting deposits through this interface');
  }
  return { id, registration: active, memoHex: hex(binding.memo) };
}
