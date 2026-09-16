---
id: edge-latency
title: Adversarial Latency on Edge Inference
folder: Projects
order: 5
tags: [jetson, cuda, tensorrt, edge-ai, real-time, security, in-progress]
summary: Measuring what adversarial inputs do to inference time rather than accuracy on a Jetson Orin Nano, and reporting severity as deadline-miss rate.
---

Started September 2026. NVIDIA Jetson Orin Nano.

> [!warning] Status
> Early. I have the board and the design. No measurements yet. Every number on this page will be one I took myself, and until then there are none.

## The thesis

An autonomous system has a hard real-time budget. A detection that arrives after the deadline is, functionally, a detection that never happened.

So an adversarial input that leaves accuracy completely intact but inflates inference time is still a safety failure. And almost nobody reports it that way.

> [!info] The reframe
> Severity as **deadline-miss rate**, not accuracy loss. The question is not "did the model get it wrong," it is "did the answer arrive in time to matter."

## Prior work this builds on

The idea that adversarial inputs can inflate latency is not mine. The Overload line of work measured roughly eleven to thirteen times inference-time inflation on a Jetson NX, by inflating the number of candidate detections and therefore the cost of postprocessing.

What I have not found is anyone tying that to an actual deadline budget on current-generation hardware, or comparing it across the precisions people actually deploy at the edge.

## The first experiment

Deploy one object detector three ways through TensorRT on the Orin Nano: FP32, FP16, and INT8. Run the same adversarial inputs against all three. Report both accuracy degradation and latency inflation per precision.

Quantization is the core of the pitch for edge deployment: smaller, faster, cheaper. What I have not seen answered cleanly is whether it also changes **how the model fails under attack**. Either outcome is worth knowing. If quantization increases vulnerability that is a real warning for anyone shipping INT8 to a device. If it decreases vulnerability, that is quantization as an accidental defense.

## Measuring it correctly is most of the work

GPU work is asynchronous. Wrapping an inference call in a wall-clock timer measures when the call *returned*, which is queueing plus whatever else was in flight, not how long the compute took.

So the harness is instrumented with **CUDA events** around the inference region, with preprocessing and postprocessing split into separate timed regions, clocks pinned, proper warmup before collection, and reporting of p50, p95, p99, max, and run-over-run variance rather than a single mean. Power draw, thermals, and clock throttling are sampled alongside and aligned to each run.

This matters more than it sounds. A long parameter sweep will thermally throttle on its own, and if you have not characterized that first, you will publish a thermal curve and call it an attack.

I built real-time latency profiling tools for embedded hardware at [[Cytrence Technologies]]. Same discipline, much bigger chip.

## Honest limits

One board, one model, one attack family. My own hardware, on my own bench, always. The attack technique is from published research and is cited in the repository. If the mechanism turns out not to survive TensorRT conversion, because TensorRT may fuse or replace the very postprocessing stage the attack targets, then that is the finding and I will write that up instead.

Related: [[Adversarial Testing Harness for AV Perception]] · [[Cytrence Technologies]] · [[Kiwi-Pico Firmware]] · back to [[Projects]]
