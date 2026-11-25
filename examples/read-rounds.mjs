import { pathToFileURL } from 'node:url';
import { assertMainnet, rootActor, unwrap } from './fuse.mjs';

export function cycleId(value) {
  if (typeof value !== 'string' || !/^(0|[1-9]\d{0,19})$/.test(value) ||
      BigInt(value) >= 1n << 64n) {
    throw new Error('Pass the cycle ID as a decimal string (nat64).');
  }
  return BigInt(value);
}

export async function readRounds(root, requestedCycle) {
  const runtime = unwrap(await root.wallet_runtime_capabilities());
  assertMainnet(runtime.source);
  const day = unwrap(await root.current_tour_summary());
  const published = requestedCycle === undefined
    ? day.latest_tour[0] ?? null
    : unwrap(await root.tour_summary(cycleId(requestedCycle)));
  const distribution = day.distribution[0];
  const forecast = distribution?.forecast[0];
  return {
    published,
    forecast: forecast ?? null,
    forecastUnavailable: forecast ? null : distribution?.forecast_unavailable[0] ?? null,
    pendingUtcDay: day.pending_utc_day[0] ?? null,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.length > 3) throw new Error('Usage: npm run rounds -- [cycle_id]');
    console.log(JSON.stringify(await readRounds(rootActor(), process.argv[2]),
      (_, value) => typeof value === 'bigint' ? value.toString() : value, 2));
  } catch (error) {
    console.error(`FUSE round read failed: ${error.message}`);
    process.exitCode = 1;
  }
}
