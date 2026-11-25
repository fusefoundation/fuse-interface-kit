import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Principal } from '@icp-sdk/core/principal';
import { IDL } from '@icp-sdk/core/candid';
import { idlFactory } from '../api/fuse-interface.idl.mjs';
import { LEDGER, ROOT } from '../examples/fuse.mjs';
import { cycleId, readRounds } from '../examples/read-rounds.mjs';

const src = { app: Principal.fromText(ROOT), ledger: Principal.fromText(LEDGER), local_test: false };
const sample = { cycle_id: 12n, utc_day: 20101n, owner_fund_units: [], roster_audit_available: false,
  random_words_count: 0n, winners_count: 2n,
  quote: { gross: 0n, operator: 0n, interfaces: 0n, charity: 0n, prize: 0n,
    virtual_reserve_credit: 0n, virtual_units: 7n, real_wallets: 800n, winners: 2n } };
const day = { latest_tour: [sample], pending_utc_day: [], distribution: [], saved_random_chunks: [] };
const methods = Object.fromEntries(idlFactory({ IDL })._fields);

test('guest round reads need no interface registration and distinguish empty forecast', async () => {
  const root = {
    wallet_runtime_capabilities: async () => ({ Ok: { source: src } }),
    current_tour_summary: async () => ({ Ok: day }),
  };
  assert.deepEqual(await readRounds(root), {
    published: sample, forecast: null, forecastUnavailable: null, pendingUtcDay: null,
  });
  assert.equal((await readRounds({ ...root, current_tour_summary: async () =>
    ({ Ok: { ...day, latest_tour: [] } }) })).published, null);
  await assert.rejects(readRounds({ ...root,
    wallet_runtime_capabilities: async () => ({ Ok: { source: { ...src, local_test: true } } }),
  }), /does not match/);
});

test('historical read preserves nat64 and never falls back to another round on error', async () => {
  const id = 18446744073709551615n;
  assert.equal(cycleId(String(id)), id);
  for (const invalid of ['-1', '1e3', '01', '18446744073709551616', 5]) assert.throws(() => cycleId(invalid));
  const root = {
    wallet_runtime_capabilities: async () => ({ Ok: { source: src } }),
    current_tour_summary: async () => ({ Ok: day }),
    tour_summary: async n => { assert.equal(n, id); return { Err: 'Not found' }; },
  };
  await assert.rejects(readRounds(root, String(id)), /Not found/);
});

test('Candid round and audit methods remain query-only and retain paged data', () => {
  const winner = { wallet_principal: 'example', participant_index: 4n, amount: 10n };
  const page = { start: 0n, total: 2n, cycle_id: 12n, next_start: [1n] };
  const fixtures = {
    current_tour_summary: day, tour_summary: sample,
    tour_random_words_page: { ...page, items: [(1n << 64n) - 1n] },
    tour_winners_page: { ...page, items: [winner] },
  };
  for (const [name, value] of Object.entries(fixtures)) {
    const f = methods[name];
    assert.deepEqual(f.annotations, ['query'], name);
    const [result] = IDL.decode(f.retTypes, IDL.encode(f.retTypes, [{ Ok: value }]));
    if (name.endsWith('_page')) {
      assert.deepEqual(result.Ok.next_start, [1n]);
      assert.deepEqual(Array.from(result.Ok.items), value.items);
    } else {
      assert.deepEqual(result.Ok, value);
    }
  }
});
