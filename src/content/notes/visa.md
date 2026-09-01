---
id: visa
title: Visa
folder: Experience
order: 1
tags: [mobile-security, agents, pentesting, ios, android, internship]
summary: Cybersecurity Engineering Intern on Mobile, Mac & IoT Security. Owned the orchestration layer for the team's agentic mobile pen-testing pipeline.
---

![|logo](/img/visa.webp)

**Cybersecurity Engineering Intern**
Mobile, Mac & IoT Security · Austin, TX · June to August 2026

Two jobs that fed each other: I ran hands-on mobile assessments, and I built the automation meant to run them at scale.

> [!info] On specifics
> Everything below is described functionally. No internal project, framework, or tooling names, and no people.

## The orchestration layer

I owned the part that decides what runs, in what order, on which device, and what happens when a stage dies halfway through. Temporal, PostgreSQL, Docker. Nine containers on a private network, one orchestrator and six agents behind a shared contract, six stages:

```
intake → static → smoke → dynamic → traffic → closure
```

A run that crashes resumes at the exact stage it crashed on, not the beginning. Designed for 50 apps/day. More in [[Orchestration Engine]].

## Hands-on assessment

Frida, Objection, Magisk, ADB, palera1n, Corellium, Appium for runtime. Burp Suite and mitmproxy for interception. JADX, Ghidra, MobSF for static. Defeated jailbreak and root detection, anti-instrumentation checks, and pinned TLS.

**8+ CVSS-scored findings**, concentrated in broken authentication and sensitive data exposure. The recurring shape was authorization decided client-side. An app that trusts a value it computed locally is an app that trusts whoever controls the device.

Two pieces got their own notes: [[Adaptive Bypass Loop]] and [[LLM Red Teaming]].

## Outside the day job

The intern hackathon, which became [[Trust Layer for Agentic Payments]]. And I ran the summer out of an Obsidian vault, which is why this site looks the way it does. See [[About This Site]].

Back to [[Experience]]
