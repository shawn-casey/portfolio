---
id: trust-layer
title: Trust Layer for Agentic Payments
folder: Projects
order: 3
aliases: [Hasta La Visa, Maya]
tags: [agents, payments, fintech, hackathon]
summary: A shared budget across many agents with attenuating delegation. Every sub-agent inherits a strictly tighter cap.
---

Built at the [[Visa]] intern hackathon with a team called Hasta La Visa. We named it Maya.

> [!success] North America Winner; global finalist, 1 of 4 teams worldwide.
> Organizers named the outright global winner and gave no placement to anyone else. Four finalists, one winner named, we were one of the four.

![|wide](/img/hackathon.webp)

## The problem

Give an agent a credit card and you've given it a credit card. Not a budget for the task. The card, with every dollar behind it, for as long as the credential lives.

Fine for one agent. It falls apart the moment agents delegate: a planner spawns a shopper, which spawns three price-checkers, each able to call a tool that spends. Now an unbounded number of processes hold the same unbounded authority.

## The rule

> [!info] Every sub-agent inherits a strictly tighter spend cap than its parent.
> Authority only narrows as it fans out. No path through the tree widens it.

- **The root cap is the true ceiling.** However deep the tree goes, exposure is bounded by what you authorized at the top.
- **Compromise is contained by depth.** An agent five levels down holds a fraction of a fraction.
- **Unused budget rebalances.** Completing under budget returns the remainder to the pool, so attenuation doesn't strand capital in finished branches.
- **Every spend carries its delegation chain**, so a failure gives you the path, not just the leaf.

Capability-based security applied to money: authority as an attenuable token rather than an ambient credential.

We shipped a backend enforcing the logic and a dashboard showing a budget fan out across an agent tree live. The dashboard is what made it land. Attenuating delegation is abstract in a sentence and obvious in a picture.

## Why the UK first

Strong Customer Authentication is the wall every agentic payment hits, because an agent can't prove a human is present. But B2B agent purchases are exempt, which is an existing lane where these payments actually clear. Add mature open banking and an English-first market and it's the one place the product can legally work today.

Choosing a beachhead on regulatory grounds rather than market size is the part I'd defend hardest. Addressable market is worthless if the payment can't complete.

Back to [[Projects]] · [[Visa]] · [[LLM Red Teaming]]
