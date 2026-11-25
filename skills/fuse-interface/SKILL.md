---
name: fuse-interface
description: Build or review an independent FUSE interface on ICP. Use for public round and forecast reads, interface registration, or integrating ckUSDT with OISY and tracking operator earnings.
---

# FUSE Interface

## Pick the entry point

Use the [public kit](https://github.com/fusefoundation/fuse-interface-kit) as your source of examples, Candid, and tests. The links below resolve even if this skill is installed by itself. If the kit is already checked out, read the corresponding local files.

| Goal | Start here |
| --- | --- |
| Display public results or an upcoming forecast | [Guest round example](https://github.com/fusefoundation/fuse-interface-kit/blob/main/examples/read-rounds.mjs) and [API reference](https://github.com/fusefoundation/fuse-interface-kit/blob/main/docs/API.md). No account, bond, or interface ID. |
| Register or validate an independent website | [Operator quick start](https://github.com/fusefoundation/fuse-interface-kit/blob/main/docs/QUICKSTART.md) and [interface dashboard](https://int.fuseprotocol.org/site). |
| Integrate OISY or recover a deposit | [OISY example](https://github.com/fusefoundation/fuse-interface-kit/blob/main/examples/oisy-deposit.mjs) and [API reference](https://github.com/fusefoundation/fuse-interface-kit/blob/main/docs/API.md). |
| Understand the protocol or look up IDs | [FUSE Developer Docs](https://fuse-foundation.gitbook.io/fuse-foundation-docs/) and the [Candid contract](https://github.com/fusefoundation/fuse-interface-kit/blob/main/api/fuse-interface.did). |

## Integration rules that matter

- Match the network, Root, and ledger before combining data. Keep mainnet separate from test. Never fetch a replacement root key on mainnet. Use stable integer units and `BigInt`. Preserve missing values and label stale data. Continue with returned pagination cursors, not with fabricated offsets.
- For a public prototype, start read-only. Distinguish a published result from a forecast and do not divide by zero or use virtual units as eligible wallets.
- Before new deposits through a partner site, match active registration, controller, payout principal, and registration time across both registration reads. Use the actual memo bytes and live ledger fee. Stop new deposits if registration or source does not match.
- Show the prepared conditions before asking for confirmation. Preserve the revision, signed argument and operation ID. If the popup closes or a response is lost, check the same revision; never create another transfer just to see whether the first worked. Separate a ledger transfer from a Root accounting credit.
- Use the dashboard for registration and bond funding unless the task specifically requires integration. The operator confirms any live financial action. For ambiguous operator payouts check the same request ID and reservation; do not resubmit. Never request secrets.

## Verify

Run `npm ci` and `npm test` from the kit. For public data, use `npm run rounds`; for an active registration use `npm run read -- "$FUSE_INTERFACE_ID"`. Give the user the verification result and list any untested live steps. Exercise wallet and payment flows only in an agreed test environment; do not submit live transactions.
