---
id: adaptive-bypass-loop
title: Adaptive Bypass Loop
folder: Experience
order: 3
tags: [agents, mobile-security, frida, demo]
summary: Two agents negotiating past a mobile app's defenses in escalating rounds. Demo run took four.
---

The demo I built on the [[Orchestration Engine]] at [[Visa]], and the thing I'd most want to explain on a whiteboard.

## The idea

Getting past a hardened mobile app isn't one move, it's a negotiation. Hook SSL pinning and the app notices Frida is attached. Hide Frida and a root check fires. Spoof the root check and an integrity check catches the spoof. Each fix reveals the next defense.

So make that loop the architecture. Two agents talking across rounds. The **script-builder** proposes a Frida script for the defenses it currently believes are present. The **device-driver** runs it on a target and reports back: did the app launch, did it crash, what tripped. The script-builder reads the failure and escalates.

```
round 1  ssl-pinning
round 2  ssl-pinning + root-detection
round 3  ssl-pinning + root-detection + anti-frida
round 4  full-chain          → app running, traffic readable
```

## Why escalate instead of starting maximal

The maximal script is the one most likely to break the app. Every hook is a chance to crash the process, trip an integrity check, or shift timing enough that something else fails. Escalating only on evidence means the winning script is the smallest one that works, which is also the one least likely to make the app behave differently than it does for a real user. That matters for findings: a vulnerability you can only reproduce under fifteen hooks is one somebody will argue with.

It's a feedback controller with a language model in it. Signal is the failure mode, actuator is the next script, plant is a phone that fights back. Structuring it that way put the interesting behavior in the interpretation step instead of a pile of hardcoded branches.

> [!warning] Scope
> This ran against a fictional demo app with stand-in agents. The orchestration underneath is real; the agents were placeholders.

Related: [[LLM Red Teaming]] · back to [[Visa]]
