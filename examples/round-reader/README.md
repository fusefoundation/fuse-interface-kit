# Round reader

An independent browser interface for public FUSE round results. The browser uses the kit’s anonymous agent and verifies query signatures against the ICP mainnet root key.

[Official FUSE website](https://fuseprotocol.org/) · [Live demo](https://rounds.fuseprotocol.org/) · [FUSE Interface Kit](../../README.md)

## Run your own copy

Install Node.js 22 or later, npm and Python 3. Run the commands from a clone of this repository, or from the directory containing `package.json` after extracting the source ZIP from the live demo.

```sh
npm ci
node examples/round-reader/build.mjs
python3 -m http.server 8000 --bind 127.0.0.1 --directory examples/round-reader/dist
```

Open http://127.0.0.1:8000. To host your copy, serve the contents of the generated dist directory on an HTTPS static host.

## Public queries

The latest result is the optional latest_tour in current_tour_summary(). The archive reads tour_statistics_page([], 5) and passes each returned next_after_cycle unchanged to the next query. Previous revisits a saved cursor. The archive can lag publication while indexing. Prize pools are ckUSDT amounts converted from integer micro-units. The timestamp records the browser time of the most recent successful query.

Each (?) button opens a local explanation and a copyable JavaScript call using the kit’s rootActor() as root. Opening help or copying an example only changes local UI state. On a failed fetch the affected panel offers a retry.
