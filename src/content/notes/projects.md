---
id: projects
title: Projects
folder: Projects
order: 0
hub: true
tags: [moc, building]
summary: Ten notes. An air-gapped AI operator for CNC machines and a field note from IMTS, two adversarial-testing harnesses in progress, a RISC-V core, open-source RP2040 firmware, a quantum encryption compiler, a trust layer for agentic payments, Formula SAE telemetry, and a lunar mission capstone.
---

Things I built because I wanted them to exist.

- [[Adversarial Testing Harness for AV Perception]] · attacking perception in simulation, and scoring each attack against a natural-degradation baseline. In progress.
- [[Adversarial Latency on Edge Inference]] · what adversarial inputs do to inference time rather than accuracy, on a Jetson Orin Nano. In progress.
- [[Marcel]] · an air-gapped AI operator for CNC machines. Read-only on real machines so far.
- [[The Screen Is the Common Interface]] · what I found at IMTS 2026 about current CNC controls, and the assumption it overturned.
- [[Quantum Public Key Encryption for NISQ Devices]] · a tunable quantum encryption compiler for noisy hardware.
- [[Trust Layer for Agentic Payments]] · attenuating delegation for a budget shared across many agents. North America Winner at the [[Visa]] intern hackathon.
- [[Tie Rod Force Anomaly Detection]] · Formula SAE telemetry, flagging steering load that doesn't match the cornering causing it.
- [[RV32I Processor]] · a single-core RISC-V CPU in SystemVerilog, in progress.
- [[Kiwi-Pico Firmware]] · open-source RP2040 firmware, dual-core rendering with DVI output and USB HID input.
- [[Lunar Payload Delivery Mission]] · concept of operations in SysML. UConn capstone, sponsored by Draper Laboratory.

Two are about **authority**: who is allowed to do what to a machine that can hurt someone or spend someone's money. [[Marcel]] answers with a ladder: read-only first, then technician-approved actions from a short reviewed list. [[Trust Layer for Agentic Payments]] answers by making every delegation strictly narrower than its parent.

Two more are about **timing budgets set by hardware**. [[RV32I Processor]] is built around an SRAM that answers late, and [[Kiwi-Pico Firmware]] splits video output and framebuffer work across two cores because one core has no slack.

Back to [[Shawn Casey]] · see also [[Experience]] and [[Toolbox]]
