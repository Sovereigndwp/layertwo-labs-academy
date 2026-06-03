# LayerTwo Labs — Interactive Lessons

Beginner, first-principles lessons that rebuild LayerTwo Labs educational
content into a guided, interactive simulator. The first lesson is **"Create a
Sidechain Without Breaking Bitcoin."**

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # type-check + production build to dist/
npm run preview  # serve the built app
```

## What's inside

A 10-step lesson that turns Paul Sztorc's "Creating a Sidechain" article into
hands-on modules: a 256-slot grid, an address-byte identity game, a software
version selector, a miner-ACK timeline (mine toward ~95% of 2016 blocks),
activation, and a Bitcoin full-node connection map — plus a reflection quiz and
an advanced-topics preview.

It is built as a **content/engine split**: all copy lives in
`src/data/lessonData.ts` and the components are reusable renderers, so new
lessons drop in a new data file and reuse the same engine.

See [`docs/spec.md`](docs/spec.md) for the full design (storyboard, copy, quiz,
glossary, data model, accessibility) and [`CLAUDE.md`](CLAUDE.md) for
architecture and conventions.

> **Note:** Drivechain is a *proposed* Bitcoin soft fork (BIP300/BIP301).
> DriveNet and Testchain are LayerTwo Labs *testing* software — not live on
> Bitcoin mainnet. This lesson is an educational simulation.
