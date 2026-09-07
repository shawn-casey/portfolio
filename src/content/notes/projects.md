---
id: projects
title: Projects
folder: Projects
order: 0
hub: true
tags: [moc, building]
summary: A CNC diagnostic agent, a quantum encryption compiler, a trust layer for agentic payments, and Formula SAE telemetry.
---

Things I built because I wanted them to exist.

- [[Marcel]] · a CNC diagnostic agent for machine shops. Deliberately read-only.
- [[Quantum Public Key Encryption for NISQ Devices]] · a tunable quantum encryption compiler for noisy hardware.
- [[Trust Layer for Agentic Payments]] · attenuating delegation for a budget shared across many agents. North America Winner at the [[Visa]] intern hackathon.
- [[Tie Rod Force Anomaly Detection]] · Formula SAE telemetry, flagging steering load that doesn't match the cornering causing it.
- [[RV32I Processor]] · a single-core RISC-V CPU in SystemVerilog, in progress.
- [[Kiwi-Pico Firmware]] · open-source RP2040 firmware, dual-core rendering with DVI output and USB HID input.

Two are about **authority**: who is allowed to do what to a machine that can hurt someone or spend someone's money. [[Marcel]] answers by refusing to write. [[Trust Layer for Agentic Payments]] answers by making every delegation strictly narrower than its parent.

Two more are about **timing budgets set by hardware**. [[RV32I Processor]] is built around an SRAM that answers late, and [[Kiwi-Pico Firmware]] splits video output and framebuffer work across two cores because one core has no slack.

Back to [[Shawn Casey]] · see also [[Experience]] and [[Toolbox]]
