---
name: fuse-interface
description: Connect an external website to FUSE on the Internet Computer. Use for public Candid reads, domain verification, interface bonds, ckUSDT attribution, OISY integration, or operator earnings and payout recovery.
---

# FUSE Interface

## Start here

1. Read the [interface guide](https://fuse-foundation.gitbook.io/fuse-foundation-docs/), the [operator quick start](../../docs/QUICKSTART.md), and the [API reference](../../docs/API.md). If only this skill was installed, use the [public kit](https://github.com/burzhuy3/fuse-interface-kit) to resolve the latter two files.
2. Establish the network, exact hostname, and assigned `interface_id`. If the site is not yet active, direct the operator to the [interface dashboard](https://int.fuseprotocol.org/site). The operator signs in, confirms the bond, publishes the file, verifies HTTPS, and activates the site.
3. Match the ID, controller, payout recipient, and registration timestamp between `interface_info` and `interface_deposit_memo`. Verify `source.app`, `source.ledger`, and `source.local_test` against the target network. Use the exact memo bytes. Stop new deposits if the site is inactive.

## Integrate and verify

- For public data, use the [Candid contract](../../api/fuse-interface.did) and [read-only example](../../examples/read-interface.mjs). Respect `history_complete`, `caught_up`, and returned cursors; deduplicate prize events by `event_id`.
- Use the [OISY example](../../examples/oisy-deposit.mjs) for deposits. Show conditions before confirmation, keep the revision, validate `arg` and `operation_id`, and use `BigInt` and the live fee. ICRC-2 approval is for the bond, not a default for participant deposits.
- On ambiguity, check the same `revision` with `my_incoming_choice` and `scan_incoming_choice`, or `confirm_incoming_block` when the block is known. Keep the UI in a checking state until resolved; a confirmed transfer is distinct from a recorded credit.
- For operator payouts, use the dashboard or an authenticated controller actor. Check recipient, gross, fee, net, reserved amount, and reconciliation. For `Pending` or `Unknown`, check the same `request_id`.
- Treat Internet Identity as origin-specific. Keep the controller distinct from the configured payout principal. Do not request secrets or reuse test endpoints on mainnet.

Run `npm ci` and `npm test`. With an active ID, run `npm run read -- "$FUSE_INTERFACE_ID"`. Check amount precision, changed attribution, popup closure, and recovery after a reload without resubmission. Exercise payment paths only in an agreed test environment. Report what you verified and which actions still need the operator.
