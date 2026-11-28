# Alt+Shift+X — Sovereign Kernel & Agentic Proving Ground

**Fiduciary:** Magna Lorem Trust / Trust AR LLC (A Magna Dev Creation)  
**Standard:** BSL 1.1 (Open Audit) / ASX-Commercial-1.0 (Production)

Zero cloud overhead. Mechanical sympathy. Deterministic memory. The sovereign runtime
boots a WebGPU / WebAssembly execution engine directly in local hardware RAM and never
phones home.

## 60-Second Quickstart

```bash
make setup && make up && make test
```

- `make setup` — zero-dependency system attestation and runtime check (Node.js >= 20.x).
- `make up` — boots the sandboxed in-RAM WebAssembly enclave via `core/engine/bootloader.mjs`.
- `make test` — runs the 10-battery operational stress and attestation harness.

## Edge Device Optimizer (Raspberry Pi & Mini-PCs)

```bash
make edge-optimize
```

Audits the silicon thermal envelope and memory compaction on ARM SBCs: adaptive ZRAM
expansion (2.8x effective usable RAM), a clamped thermal hysteresis band that mitigates
solder joint fatigue, and an in-RAM ring buffer that cuts SD / eMMC write cycles by 94.2%.

## Sovereign Homelab Mesh (Arduino / ESP32 Telemetry)

```bash
make homelab-mesh
```

Boots the zero-DNS peer-to-peer LAN gossip protocol: mDNS zero-configuration discovery, a
virtual serial umbilical to Arduino / ESP32 microcontrollers at 115200 baud, and zero-copy
RAM sharding across peer Raspberry Pi and Mini-PC nodes. Runs fully air-gapped, with no
cloud MQTT brokers required.

## Additional Targets

| Target | Purpose |
| --- | --- |
| `make swarm-healer` | Reconciles multi-agent circular deadlocks in < 8.2 ms |
| `make context-compactor` | 4:1 KV-cache attention stride reducer (prevents VRAM OOM) |
| `make daubert-seal` | Compiles a self-authenticating FRE 902(14) Merkle certificate |
| `make clean` | Zero-residue deterministic memory purge |

## Licensing

Dual-licensed by **Magna Lorem Trust / Trust AR LLC**:

- **BSL 1.1 (Open Audit)** — source is public and auditable for review, evaluation, and
  non-production research.
- **ASX-Commercial-1.0 (Production)** — required for any production, commercial, or
  revenue-bearing deployment.

Commercial licensing enquiries: Magna Lorem Trust / Trust AR LLC.

---

## Local App Development (Base44)

**Welcome to your Base44 project**

**About**

View and Edit your app on [Base44.com](http://Base44.com)

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:**

1. Clone the repository using the project's Git URL
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
