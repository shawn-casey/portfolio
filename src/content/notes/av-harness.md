---
id: av-harness
title: Adversarial Testing Harness for AV Perception
folder: Projects
order: 4
tags: [autonomous-vehicles, security, simulation, perception, in-progress]
summary: An open-source harness that attacks autonomous-vehicle perception in simulation, and scores each attack against a natural-degradation baseline.
---

Started September 2026.

> [!warning] Status
> Early. The design is settled, the code is not. Nothing below is a result yet, and there are no measurements to report. I will update this page as the first experiments land.

## The problem

Published work on attacking machine-learning perception has a reporting problem. A paper shows an adversarial input degrading a detector, reports the drop in detection accuracy, and stops there. What it almost never says is how that degradation compares to conditions the system already deals with every day.

An attack that drops detection confidence fifteen percent sounds alarming until you learn that a light rain does twenty.

## What I am building

A harness that sits on top of CARLA and does two things.

**Runs attacks as plugins.** Each attack implements one function: take a sensor frame and some parameters, return a modified frame. Phantom LiDAR returns, point removal, adversarial patches on signage, adversarial laser spots on cameras, radar ghost objects, GNSS drift, and multi-sensor timing desync. The orchestrator, the scenario definitions, and the scoring never have to change when a new attack is added.

**Runs campaigns, not one-offs.** A seeded, resumable runner sweeps scenario by attack by parameter space and reports every finding with the exact command to reproduce it. This is the part that separates a maintained tool from the abandoned paper code it sits next to. Most published attack implementations are a script that produced one figure and was never run again.

## The part I actually care about

A severity framework that scores every attack against a **natural degradation baseline**: fog, rain, low sun angle, sensor dropout. Which attacks are meaningfully worse than weather? Which are noise wearing a threat costume? At what parameter value does an attack leave the envelope the system is already expected to tolerate?

This is the same problem I worked on at [[Belcan]], where the job was setting the thresholds that separated a real engine fault from ordinary sensor variation across an operational fleet. Different fleet, same question: where is the line between something breaking and something being noisy.

## Why the architecture looks the way it does

It is deliberately the same shape as the orchestration layer I built at [[Visa]]: a durable runner, a single shared contract that every plugin implements, and findings that come out scored and reproducible. That was a pipeline for testing mobile applications. This is a pipeline for testing perception. The domain changed, the problem did not.

## Honest limits

Simulation only. Nothing here touches a real vehicle, and it never will. Every attack implemented is from published research and cited in the repository. The contribution is the harness and the severity framing, not the attacks themselves.

Related: [[Adversarial Latency on Edge Inference]] · [[Belcan]] · [[Visa]] · back to [[Projects]]
