# WELOS

WELOS is an integrated renewable-energy and rainwater product concept with a local, offline-first control OS. This repository contains the public site, an interactive 3D product model, a browser control simulator and ESP32-S3 reference firmware.

This fork adds **WELOS Sentinel**, a bounded AI operations layer powered by NVIDIA Nemotron 3 Super through Nebius Token Factory. Sentinel converts the live simulator snapshot into an evidence-backed assessment and operator action queue. It is advisory only: deterministic safety logic retains actuator authority.

## Run
```bash
npm install
npm run dev
```

Open the local URL shown by Vite. The product tools are separate entry points:

- `/` — concise problem statement, concept-study numbers, innovation overview and a single exploration hub
- `/model.html` — integrated rooftop 3D appliance with selectable hardware, software stack and full-system separation
- `/explore.html` — scroll-driven exploded-view story of the same appliance, with supplied reference visuals tied to each subsystem
- `/model.html?exploded=1` — opens the 3D assembly with its components separated
- `/configure.html` — climate-informed or manual site configurator with a live 3D add-on preview
- `/control.html` — live WELOS OS simulator
- `/control.html#sentinel` — Nemotron-powered operator assessment inside the simulator

## Nemotron on Nebius

The Vercel function at `api/operator.js` calls Nebius Token Factory's OpenAI-compatible endpoint using `nvidia/nemotron-3-super-120b-a12b`. Configure these server-side variables:

```bash
NEBIUS_API_KEY=your-key
WELOS_MODEL=nvidia/nemotron-3-super-120b-a12b
NEBIUS_BASE_URL=https://api.tokenfactory.us-central1.nebius.com/v1
```

If no API key is present, Sentinel visibly returns a deterministic demo assessment so the UI can still be evaluated. Personal telemetry is sent only when the operator explicitly requests an assessment; no model output can directly actuate the simulated or physical system.

## Product foundation

- Solar photovoltaic canopy with integrated rain catchment
- Compact vertical-axis wind module with independent braking
- First-flush, filtration, UV, tank, pumping and water-quality instrumentation
- 48 V LiFePO4 storage, MPPT, wind rectification and hybrid inverter
- ESP32-S3 edge controller, local API, authenticated commands and offline operation
- Deterministic safety-oriented control modes and fault handling

See [hardware/bom.json](hardware/bom.json) for the structured concept BOM and [docs/HARDWARE_ARCHITECTURE.md](docs/HARDWARE_ARCHITECTURE.md) for interfaces and prototype gates. The 3D model and BOM are an engineering concept, not production CAD or a substitute for licensed structural, electrical, grid and water-safety design.

## Verify

```bash
npm run check
npm run firmware:build  # requires PlatformIO
```
