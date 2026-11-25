import {
  LEDGER, ROOT, assertMainnet, interfaceNumber, ledgerQueries, readInterface, rootActor, unwrap,
} from './fuse.mjs';

try {
  const id = interfaceNumber(process.argv[2]);
  const root = rootActor();
  const ledger = ledgerQueries();
  const [site, runtime, progress, stats, fee, decimals] = await Promise.all([
    readInterface(id, root),
    root.wallet_runtime_capabilities().then(unwrap),
    root.public_interface_deposits(id).then(unwrap),
    root.project_statistics().then(unwrap),
    ledger.icrc1_fee(),
    ledger.icrc1_decimals(),
  ]);
  assertMainnet(runtime.source);
  if (decimals !== 6 || stats.ledger !== LEDGER || progress.interface_id !== id) {
    throw new Error('The data source or ckUSDT format does not match');
  }
  console.log(JSON.stringify({
    root: ROOT,
    ledger: LEDGER,
    interfaceId: site.id,
    controller: site.registration.controller.toText(),
    commissionRecipient: site.registration.payout_principal.toText(),
    memoHex: site.memoHex,
    feeMicroUnits: fee,
    tokenDecimals: decimals,
    runtimeSupportsDeposits: runtime.deposits,
    interfaceHistoryComplete: progress.history_complete,
    confirmedDepositsAtLeastMicroUnits: progress.confirmed_at_least_micro_units,
    confirmedDepositsTotalMicroUnits: progress.confirmed_original_total_micro_units[0] ?? null,
    projectStatsCaughtUp: stats.progress.caught_up,
  }, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
