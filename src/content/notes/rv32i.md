---
id: rv32i
title: RV32I Processor
folder: Projects
order: 5
tags: [hardware, rtl]
summary: A single-core RISC-V processor in SystemVerilog, built with SiliconJackets at Georgia Tech. In progress.
---

In progress with **SiliconJackets** at [[Georgia Institute of Technology]].

I'm building a single-core RISC-V processor in SystemVerilog: instruction fetch, register file, ALU, and SRAM-backed load and store. It's verified against an RTL testbench suite covering arithmetic, memory, branch, and shift instructions, simulated in **Cadence Xcelium**.

## The memory interface shapes the datapath

The design decision everything else follows from: **the SRAM read does not return data in one cycle.** A textbook single-cycle datapath assumes memory answers within the same clock edge it was asked. Real SRAM does not, so a design that assumes it either runs at a clock slow enough to be useless or reads stale data.

So the datapath is built around a multi-cycle memory interface. Instruction fetch and load and store stall until memory hands back valid data, and the control path holds the rest of the machine still while that happens. That moves the hard part out of the ALU, which is straightforward, and into control: knowing exactly which registers must hold, which must not advance, and what the machine looks like on the cycle memory finally answers.

Same lesson as [[Belcan|the telemetry work]] from the other direction. The physical component sets the terms and the logic accommodates it, not the reverse.

## Where it is

Fetch, register file, ALU, and the load and store path run against the testbench. Not finished, not taped out, and not a complete RV32I implementation yet.

Back to [[Projects]] · [[Toolbox]]
