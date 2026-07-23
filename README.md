# Distributed Intelligence

Interactive exam preparation for the Distributed Systems module.

The project uses the proven foundation of Algo Arena: native JavaScript modules,
custom responsive CSS, a manifest-driven topic registry, local progress and
Node-based smoke tests. The initial release provides the application shell and
the complete lecture-topic map. Interactive tutorials, code-reading exercises
and exam tasks can be added as independent topic modules.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Development

```bash
npm install
npm test
npm run check
```

No build step or backend is required.
