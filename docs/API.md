# FUSE API for interface operators

Use the [Candid contract](../api/fuse-interface.did) or the [JavaScript bindings](../api/fuse-interface.idl.mjs). FUSE Root checks `caller` for account-specific requests; partner sites do not receive a server API key.

| Mainnet configuration | Value |
| --- | --- |
| FUSE Root | `ouuix-fyaaa-aaaai-aygia-cai` |
| ckUSDT ledger | `cngnf-vqaaa-aaaar-qag4q-cai` |
| ICP gateway | `https://icp-api.io` |
| OISY Signer | `https://signer.oisy.com/` |
| Interface dashboard | [int.fuseprotocol.org/site](https://int.fuseprotocol.org/site) |
| Participant dashboard | [app.fuseprotocol.org/account](https://app.fuseprotocol.org/account) |

- **Types:** Candid `nat`, `nat64`, and `int` map to `BigInt`; `nat32` maps to `Number`. Options are `[]` or `[value]`. A variant is a single-key object. Root typically returns `{ Ok: value }` or `{ Err: message }`. Handle transport errors separately.
- **Amounts:** 1 ckUSDT is 1,000,000 micro-units. Use integers, serialize large values as decimal strings in JSON, and pass `memo` as raw bytes. Read `icrc1_fee` from the configured ledger before signing.
- **Network:** Use the agent's trusted mainnet root key on ICP. For tests use the test Root, ledger, gateway, and key. `wallet_runtime_capabilities().Ok.deposits` describes API support, not whether deposits are currently open. Root checks admission at operation selection and in `my_incoming_status`.

## Public reads

| Root method | Use |
| --- | --- |
| `interface_info(interface_id)` | Active registration, `controller`, `payout_principal`, `registered_at_ns`. An empty option means no active registration. |
| `interface_deposit_memo(interface_id)` | Assigned memo and registration. It can outlive eligibility for new deposits; cross-check with `interface_info`. |
| `public_interface_deposits(interface_id)` | Confirmed original deposits, bond release threshold, and `history_complete`. If incomplete, show `confirmed_at_least_micro_units` only as a lower bound. |
| `wallet_runtime_capabilities()` | API version, deposit support, and `source.app`, `source.ledger`, `source.local_test`. |
| `public_protocol_status()` | Pause status, round count and `next_cycle_day` when set. |
| `interface_data_capabilities()` | Public API version, publishing capabilities and page limits. |
| `interface_data_automation_status()` | Public data processing status. |
| `project_statistics()` | Aggregates and `progress.caught_up`. Expose the last indexed round if behind. |
| `current_tour_summary()` | Latest published summary and optional data for the pending round. |
| `tour_summary(cycle_id)` | Summary for one published round, including recipient and audit-data counts. |
| `tour_winners_page(cycle_id, start, limit)` | Published recipients. Start at `0n` and follow `next_start`. |
| `tour_random_words_page(cycle_id, start, limit)` | Stored random words, when available. Follow the same pagination pattern. |
| `tour_statistics_page(after, limit)` | Start with `after = []` and continue with `next_after_cycle`. |
| `public_prize_events(after, limit)` | Prize credits. Start with `after = []`, continue with `next_after`, and deduplicate by `event_id`. A credit and a confirmed payout are separate. |

```js
import { readInterface, rootActor, unwrap } from './examples/fuse.mjs';

const binding = await readInterface(process.env.FUSE_INTERFACE_ID);
const progress = unwrap(await rootActor().public_interface_deposits(binding.id));
console.log(binding.memoHex, String(progress.confirmed_at_least_micro_units));
```

Respect `max_page_items` and cache public statistics. Label stale data with the last successful read time. Recheck registration before creating a new operation.

### Published results, forecasts, and audit data

Run `npm run rounds` with no account or interface ID. Missing optional data is returned as `null`. Do not label a missing or unavailable forecast as zero.

- **Forecast:** use `distribution.forecast[0]` when present. `real_wallets` and `winners` are from the same forecast snapshot. Label the figures estimated and show `calculated_at_ns`. Do not combine forecast counts with a published result or a prepared round.
- **Published:** use `tour_summary(cycle_id)` or the `latest_tour` field. The published recipient share is `winners_count / quote.real_wallets` when the denominator is positive. For example, 2 of 800 eligible wallets is 0.25%. Virtual units are not eligible wallets.
- **Audit:** check `roster_audit_available` and `random_words_count`. For pages, request the same cycle ID and follow `next_start` until the option is empty. The [ICP management canister](https://docs.internetcomputer.org/references/management-canister/#raw_rand) supplies the randomness. Stored words alone are not enough to replay the draw independently; exact selection rules and the eligible roster are also needed.

## Registration, bond, and operator earnings

The [interface dashboard](https://int.fuseprotocol.org/site) already implements these flows. Use the table below to map an action to its Root state.

| Action | Root methods | Checks |
| --- | --- | --- |
| Prepare registration | `my_site_claim()`; `request_site_claim_from_view(expected_generation, domain, payout_principal)` | Use `expected_generation = []` for a new claim. Use the current claim binding from `my_site_bond_context()` when replacing it. Refresh on conflict. |
| Approve bond | `bond_approval_quote()`; `my_site_approval_status()`; `choose_site_approval_from_view(revision, claim_binding, expected_allowance, expected_fee)` | Root is the spender. Verify the controller account and exact allowance. Preserve the prepared request and confirmation before funding. |
| Fund bond | `site_bond_action_from_view(claim_id, claim_binding, { Fund: null })` | Requires confirmed approval. Check `my_interface_bond()`; use `scan_pending_interface_bond(16)` to check a previous operation. |
| Verify domain | `verify_site_claim_from_view(claim_binding, last_checked_at_ns)` | Use `claim_binding` from `my_site_bond_context()` and the displayed claim timestamp. Check `valid_until_ns`. |
| Activate | `site_bond_action_from_view(claim_id, claim_binding, { Activate: null })` | Verify the bond and HTTPS proof first, then read `my_interface()` and public configuration. |
| Check earnings | `my_interface_funds()`; `my_income_funds_v3({ Interface: interface_id })` | Check available and reserved amounts, recipient, previous payout, and reconciliation status. |
| Withdraw earnings | `request_income_payout_v3(revision, input, expected_fee)` | From `my_income_funds_v3` use the revision, source, account and kind; include the chosen recipient and gross amount. For `OwnAccount` use `own_recipient`. Display net = gross − fee. |
| Check a previous payout | `my_payout_choice_v3(revision)`; `income_payout_status_v3(request_id)`; `scan_income_payout_v3(request_id, 16)` | Reuse the same request ID. `Paid.ledger_block` confirms payout; `Pending` or `Unknown` retains the reservation. One page with no match does not settle an uncertain payout. |
| Recover bond or close | `site_bond_action_from_view`; `my_interface_bond()` | Use the dashboard for release, closing at the current revision, or release after closure. Check the separate bond account, recipient, and fee. |

Prepare a payout preview with the authenticated controller actor before any withdrawal is submitted:

```js
const kind = { Interface: interfaceId };
const funds = unwrap(await signedRoot.my_income_funds_v3(kind));
const fee = await ledger.icrc1_fee();
const gross = 10_000_000n; // 10 ckUSDT, including the ledger fee
if (funds.needs_reconciliation || funds.pending_payout_id.length ||
    gross <= fee || gross > funds.available) {
  throw new Error('Check the previous payout and available earnings.');
}
const input = {
  account: funds.account, source: funds.source, kind,
  recipient: { OwnAccount: null }, gross,
};
// Show funds.own_recipient, gross, fee, and gross - fee.
// Save the revision and conditions before calling after explicit confirmation.
// signedRoot.request_income_payout_v3(funds.revision, input, fee)
```

## Deposits with OISY

The [browser example](../examples/oisy-deposit.mjs) uses `@icp-sdk/core` and `@icp-sdk/signer`. Include it in a build that resolves npm imports. Offer an account selection when OISY returns more than one primary account.

Serve the page over HTTPS and preserve the `postMessage` channel to the signer popup. If the page sets `Cross-Origin-Opener-Policy`, use `same-origin-allow-popups` for that page. If it sets CSP, permit `https://icp-api.io` in `connect-src`. Call `connectOisy()` directly from a click so the browser permits the popup.

```js
import {
  connectOisy, prepareDeposit, sendPreparedDeposit, recoverDeposit,
} from './examples/oisy-deposit.mjs';

// Connect OISY.
const connection = await connectOisy();
const session = connection.select(chosenPrincipal); // From connection.accounts.

// Prepare a deposit and display the conditions.
const preview = await prepareDeposit(session, configuredInterfaceId, '10.25');
// Show preview.owner, preview.receiver, preview.id, preview.amount,
// preview.fee, and preview.total. Keep the preview until confirmation.

// Submit only after the participant explicitly confirms.
const payment = await sendPreparedDeposit(session, preview);
console.log(payment.state, payment.row.revision);

// Check the previous deposit, including after a reload.
const restored = await recoverDeposit(session);
console.log(restored.state);
// For awaiting-confirmation, show restored.preview for explicit confirmation.
```

1. `my_incoming_status()` returns `next_revision` and the previous request. `choose_wallet_incoming_from_view(revision, { Deposit: { interface_id, amount } }, fee)` prepares the request without moving funds.
2. Verify `owner`, source, interface ID, amount, fee, destination, and memo. `content` contains the prepared CBOR ingress for `icrc1_transfer`. The example checks it, passes `arg` unchanged, and uses `operation_id` as the signing nonce. `SignerAgent` checks that the certified response belongs to the expected participant, ledger, and call.
3. If the ledger returns `Ok(block)` or `Err.Duplicate.duplicate_of`, pass that block to `confirm_incoming_block(revision, block)`. Root verifies the operation against the ledger.
4. If the popup closes, transport fails, or confirmation is delayed, keep the same revision. Read `my_incoming_choice(revision)`, search with `scan_incoming_choice(revision, 16)`, or confirm a known block again. On another device, call `recoverDeposit(session, revision)` with the verified revision and the same principal.

| Example state | Meaning |
| --- | --- |
| `credited` | `Ledger.credited = true`: the deposit is recorded in FUSE accounting. |
| `confirmed` | Root confirmed the transfer; accounting is pending. Recent Root versions can expose `confirmed_pending_micro_units`. |
| `checking` | Credit is not established. If `Ledger.unattributed = true`, investigate the same operation rather than starting another. |
| `awaiting-confirmation` | A saved request exists but this site has not started sending it. Show its conditions and wait for explicit confirmation. |
| `not-sent` | Root established the request did not produce a transfer. A new deposit requires a fresh user action. |

The example stores a pointer in `localStorage`, without keys, delegations, or signed envelopes. Web Locks prevent duplicate clicks across tabs of the same origin. It records `checking` before submitting the ledger transfer and only checks the old operation if the response is lost. Keep the revision for support. Before using this in production, connect every state to your UI and test recovery with the same account in a test environment.

## Internet Identity and the participant account

The [interface dashboard](https://int.fuseprotocol.org/site) uses Internet Identity for management. Participants can also use it in the [official account](https://app.fuseprotocol.org/account). An account is identified by its ICP principal; Internet Identity principals are origin-specific unless separately configured and verified for the intended origin relationship.

A custom participant client that uses Internet Identity can sign prepared ingress via `choose_incoming_from_view` and `arm_incoming_choice`, then check it via `observe_incoming_choice`, `confirm_incoming_block`, and `scan_incoming_choice`. Check the signed request ID and conditions against the prepared request. A link to the official participant dashboard does not transfer your interface's attribution. Use the OISY example for your first integration.

## References

- [Internet Computer developer documentation](https://docs.internetcomputer.org/) and [Candid](https://internetcomputer.org/docs/references/candid-ref)
- [ICP JavaScript Signer SDK](https://js.icp.build/signer/) and [OISY Signer](https://github.com/dfinity/oisy-wallet-signer)
- [ICRC standards](https://github.com/dfinity/ICRC-1/tree/main/standards)
