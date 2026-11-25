# Register and activate your website

You need an HTTPS website where you can publish a verification file, an Internet Identity account for managing the interface, and ckUSDT for the registration bond and fees. You can build a read-only interface without registering or funding a bond. For a pilot, ask FUSE for the test environment configuration; keep it separate from mainnet.

## 1. Sign in to the interface dashboard

Open [My website](https://int.fuseprotocol.org/site) and sign in with Internet Identity. Your principal becomes the site `controller`. It manages registration, bond recovery, and operator withdrawals. Keep access to that account and never enter a seed phrase on the site.

## 2. Create a claim for the exact domain

Enter the hostname that will serve participants, such as `example.com` or `www.example.com`. Do not include the protocol, port, path, or a wildcard. Use the ASCII Punycode form for an internationalized domain. Enter the ICP principal that should receive operator earnings; this can differ from the controller.

Prepare the registration and save the verification URL and file. If you create a replacement claim, use the new file. Check the network and token displayed by the dashboard before signing anything.

## 3. Approve and fund the bond

Follow the dashboard's prompts for the **100 ckUSDT refundable bond**.

1. Approve the exact allowance shown. This uses `icrc2_approve` on the configured ckUSDT ledger with FUSE Root as spender.
2. Fund the bond. FUSE uses `icrc2_transfer_from` to collect it into a separate bond account. Check the balance required for the bond, the approval fee, and the collection fee.

Do not send the bond manually to Root. If the response is interrupted, use the dashboard to check the existing operation before trying again.

## 4. Verify your domain over HTTPS

Place the downloaded verification file at `https://YOUR_DOMAIN/.well-known/ccto-verification.txt`. It must return HTTP 200 on the exact hostname, without authentication, redirects, or an HTML app shell. Compare the response with the file downloaded from the current claim:

```bash
SITE=example.com
SOURCE=./ccto-verification.txt
CHECKED=$(mktemp)
trap 'rm -f "$CHECKED"' EXIT
STATUS=$(curl -fsS -o "$CHECKED" -w '%{http_code}' \
  "https://$SITE/.well-known/ccto-verification.txt") &&
  test "$STATUS" = 200 && cmp "$SOURCE" "$CHECKED"
```

Verify the domain in the dashboard after the bond is confirmed. The domain check is valid for 30 days; keep the file reachable and renew before the expiry shown in the dashboard.

## 5. Activate and copy your configuration

After the bond and HTTPS checks are confirmed, activate the site and verify it is active.

| Field | What to keep |
| --- | --- |
| `interface_id` | Exact ID, as a decimal string or `BigInt`. |
| `memo` | Exact bytes shown in hex. Do not send the hex text as the memo. |
| `canister` | FUSE Root for your selected network. |
| `ledger` | The ledger for that same network. |
| `network` | `ic` for mainnet. Use a separate test profile. |

These configuration values are public. A link to the [official participant account](https://app.fuseprotocol.org/account) can help users view funds and withdrawals, but deposits initiated in the official form are attributed to the default interface.

## 6. Check the configuration from code

Run in this repository with Node.js 22 or later:

```bash
npm ci
npm test
read -r -p 'Interface ID: ' FUSE_INTERFACE_ID
npm run read -- "$FUSE_INTERFACE_ID"
```

Compare `root`, `ledger`, `interfaceId`, `controller`, `commissionRecipient`, and `memoHex` with the dashboard. The script also reads the ledger fee and reports whether the deposit history is complete. If the registration is missing, check activation and the domain verification expiry.

## 7. Test the participant flow

Use the [OISY example](API.md#deposits-with-oisy) with your own `interface_id` in an agreed test environment. Show the account, destination, amount, network, fee, and total before the participant signs. The example uses one `icrc1_transfer` and one ledger fee; signing requests to Root can require separate prompts.

Test a successful credit and closure of the OISY window after submission. Recover the same `revision` and preserve the selected account and operation when the popup closes. If the response is uncertain, check the original operation. Do not submit another payment to determine what happened.

Internet Identity can give different principals on different origins. Unless a verified identity link is configured, do not treat a login on your domain as the same account as the official FUSE login. For your first integration, use the same OISY account on your site and in the participant dashboard.

## 8. Track earnings and the bond

Your interface earns **4% of eligible, attributed real daily contributions used in rounds**, not 4% of deposits. Unused prepaid funds remain on the participant balance. FUSE applies attribution in deposit order as prepaid funds are used.

- **Withdraw operator earnings:** check the recipient, gross amount, fee, and net amount in the dashboard. If a withdrawal result is uncertain, check that same withdrawal.
- **Recover the bond and keep the site active:** the dashboard shows progress toward the 100 ckUSDT threshold in confirmed original deposits attributed to the site. The bond is returned once to the original controller account, less the fee, when eligible.
- **Close the site:** closure takes effect after seven days. Then you can request recovery of any bond still held. Existing earnings remain available. Remove the deposit form: after closure, transfers using the old memo are attributed to the default interface.

For help, email [partners@fuseprotocol.org](mailto:partners@fuseprotocol.org) with the domain, interface ID if available, error message, and the operation or block number if relevant. Never send keys, delegations, seed phrases, or login codes.
