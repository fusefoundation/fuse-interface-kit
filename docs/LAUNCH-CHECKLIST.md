# Interface launch checklist

Use an agreed test environment for wallet and financial scenarios. Mainnet guest reads do not require a wallet. The kit is an integration reference; it does not deploy or operate a website for you.

## Public prototype

- Run `npm ci`, `npm test`, and `npm run rounds`. Compare one published cycle against the official app.
- Display “No published rounds” and “Forecast unavailable” separately. On a failed request, keep the last successful timestamp and do not turn missing data into a zero amount or zero chance.
- Check how the app behaves when pagination returns an empty cursor or a network request fails.

## Registered site

- Complete the [operator quick start](QUICKSTART.md). Save the exact domain, network, Root, ledger, decimal interface ID, and raw memo bytes separately from the test setup.
- Run `npm run read -- "$FUSE_INTERFACE_ID"`. Compare the reported controller, recipient, memo, and ledger with the dashboard.
- Check expired domain verification and inactive registration: read-only pages remain available, but the interface must not start new deposits.

## Wallet and recovery

| Scenario | What to verify |
| --- | --- |
| Cancel or close the signer before approval | The site does not report a transfer or create another operation automatically. |
| Close the signer after approval or refresh before the response | Recover the same revision with the same principal; do not start a new transfer. |
| Wallet balance drops but the deposit still says checking | Distinguish a ledger confirmation from a Root accounting credit; keep the original revision until resolved. |
| Change amount, account, memo, source, or fee before confirmation | Do not use the stale preview. Check the current operation before preparing anything new. |
| Start a second action in another tab | Do not violate the first operation's pending state. |
| Operator withdrawal is ambiguous | Check the original request ID and reserved amount. Never make a second withdrawal as a probe. |

Record the cycle or operation ID, network, expected result and observed state. Do not paste credentials, secrets, or signed payloads into a public issue.
