---
id: us-bank
title: U.S. Bank
folder: Experience
order: 5
tags: [ios, swift, payments, rag, internship]
summary: Software Engineering Intern on Zelle Money Movement. iOS payment features, biometric auth, and on-device privacy-preserving insights.
---

![|logo](/img/usbank.webp)

**Software Engineering Intern**
Zelle Money Movement · Atlanta, GA · June to August 2025

![|inset](/img/usbank-office.webp)

Ten weeks inside the part of a bank where money actually moves, writing Swift.

**Payment features for Zelle**, with biometric authentication, in a codebase serving millions of users. A payment flow is a state machine where every state has to be safe to be interrupted in. Users background the app mid-transfer, Face ID fails, the network drops between authorization and settlement. None of those may produce a double-send or a silent drop.

**Fraud-prevention workflows for small-business payments**, which carry a different risk profile than consumer: larger amounts, more first-time payees, and fraud built on social engineering rather than stolen credentials.

**Hybrid RAG over GraphQL and REST** for on-device banking insights, keeping the sensitive computation on-device instead of shipping transaction history to a model endpoint. Backing data came out of a Hogan core banking database, a mainframe older than I am, reached through a modern API layer.

## What stuck

**Irreversibility changes engineering.** A bug in most software is an inconvenience. A bug in money movement is somebody's rent, gone, with a settlement window that already closed. First codebase where "what happens if this is interrupted right here" was the first question about every change.

**Biometric auth is a UX problem in a security costume.** The cryptography is easy. Everything hard is in the fallbacks: Face ID failing three times, the passcode changing, the enrolled biometric set being modified since the key was created. That last one is the real defense and the one that's easy to skip.

Led into mobile *offense* the next summer at [[Visa]]. Follows on from [[Cytrence Technologies]].

Back to [[Experience]]
