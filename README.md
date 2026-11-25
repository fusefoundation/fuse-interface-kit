# FUSE Interface Kit

Build an independent website that connects to FUSE on the Internet Computer. You build the interface; FUSE records participation, calculates rounds, and tracks payouts.

1. Start with the [FUSE Interface Guide](https://fuse-foundation.gitbook.io/fuse-foundation-docs/). You can read public round results without a wallet, registration, or bond.
2. Follow [Register and activate your website](docs/QUICKSTART.md). After activation, save the assigned `interface_id` and deposit `memo`.
3. Read the [API reference](docs/API.md), validate your configuration, and test the integration before enabling participant payments.

| Resource | File |
| --- | --- |
| Registration, domain verification, bond, and earnings | [Operator quick start](docs/QUICKSTART.md) |
| Methods, permissions, amounts, pagination, and error handling | [API reference](docs/API.md) |
| Root canister contract and JavaScript bindings | [Candid](api/fuse-interface.did) · [JavaScript](api/fuse-interface.idl.mjs) |
| Read interface details and statistics without signing in | [Read-only example](examples/read-interface.mjs) |
| Prepare, sign, and check an existing deposit | [OISY example](examples/oisy-deposit.mjs) |
| Guidance for Codex | [FUSE Interface skill](skills/fuse-interface/SKILL.md) |

## Run the kit without transfers

Use Node.js 22 or later. The read example takes an active interface ID and sends only public queries to FUSE and the ckUSDT ledger.

```bash
npm ci
npm test
npm run read -- "$FUSE_INTERFACE_ID"
```

The tests run locally. Use an agreed test environment for payment flows. For help with registration, email [partners@fuseprotocol.org](mailto:partners@fuseprotocol.org).

## Install the Codex skill

From the root of your project, in Bash:

```bash
FUSE_KIT_DIR=$(mktemp -d)
git clone --depth 1 https://github.com/burzhuy3/fuse-interface-kit.git "$FUSE_KIT_DIR"
mkdir -p .agents/skills
cp -R "$FUSE_KIT_DIR/skills/fuse-interface" .agents/skills/
```

Open a new Codex session and invoke `$fuse-interface`. Give it the domain, the interface ID if assigned, and the task. Public configuration is enough for read-only work. Do not share keys or wallet credentials.
