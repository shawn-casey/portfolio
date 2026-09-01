---
id: orchestration-engine
title: Orchestration Engine
folder: Experience
order: 2
tags: [agents, distributed-systems, temporal, docker, architecture]
summary: Durable-execution orchestration for an agentic mobile pen-testing pipeline. Nine containers, six stages, resumes from the exact stage it died on.
---

The piece of [[Visa]] I owned end to end. Described functionally throughout.

## The problem

A mobile penetration test is a chain of slow, stateful, failure-prone steps: provision a device, install the build, pull it apart statically, get it running, instrument it, watch its traffic, write it up. Any one can fail for reasons unrelated to the app. A device wedges, a proxy drops, a container dies at minute thirty-eight of a forty-minute crawl.

By hand that's a day per app. In a naive job queue, every transient failure costs the whole run. The target was 50 apps/day, which rules out both.

## The shape

One Temporal orchestrator owning workflow state, retries, and stage ordering. Six agents, each a FastAPI server owning exactly one stage. PostgreSQL for findings and run metadata. Nine containers on a private Docker network.

| Stage | What it does |
|---|---|
| `intake` | Ingest the build, fingerprint it, provision a device |
| `static` | Decompile and scan without running anything |
| `smoke` | Prove the app launches under instrumentation |
| `dynamic` | Runtime instrumentation, hooks, defense bypass |
| `traffic` | Proxied capture of what the app actually sends |
| `closure` | Normalize findings, score them, write the report |

![One pipeline per app, every box its own containerized agent, tests landing on virtual devices or real hardware depending on the stage.|wide](/img/scaling.webp)

## Why durable execution

Temporal's model: workflow code is deterministic and its history is replayable, so every stage boundary is a durable checkpoint. When a worker dies, a new one replays the history and picks up at the exact stage in flight.

Without that, time per app is dominated by re-running work you already paid for. It also changes failure handling day to day. A stage that fails is a stage you fix and resume, so a flaky agent is an annoyance instead of an outage.

## The shared-contract pattern

Six agents, six teammates, six favorite tools.

> [!success] One function, one swap.
> Every agent implements the same HTTP contract. Swapping the tool behind a stage means replacing one function body. The orchestrator, the schema, and the other five agents don't move.

That did most of the work of keeping six people out of each other's way.

> [!warning] Honest scope
> The orchestration is real and it ran. The full agent suite was still coming together while I was there, so the end-to-end demo ([[Adaptive Bypass Loop]]) used stand-in agents against a fictional target app.

Back to [[Visa]] · [[Experience]]
