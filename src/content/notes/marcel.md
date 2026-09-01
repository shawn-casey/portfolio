---
id: marcel
title: Marcel
folder: Projects
order: 1
tags: [agents, cyber-physical-systems, manufacturing, startups]
summary: A CNC diagnostic agent. Sees the alarm, finds the documented fix, routes it to a human. Read-only on purpose.
website: marcelcnc.com
---

[marcelcnc.com](https://marcelcnc.com) · August 2025 to present

![|wide](/img/marcel-hero.webp)

## The expert who retired

Every shop has one. The person who sees alarm 431 and doesn't look it up, because they've seen it eleven times and know it's the coolant line, not the servo. Then that person retires.

What's left is a fifteen-hundred-page manual, a machine that's down, an operator who's been there eight months, and a lead who's on another job. The knowledge existed. It was even documented. It just wasn't reachable in the four minutes when it mattered.

## What it does

Watches for a machine alarm. Retrieves the documented fix, cited rather than guessed, from manuals, service bulletins, and this machine's own history. Dispatches it to a maintenance lead with the fault and the procedure.

Downtime collapses to the time it takes a human to walk over, because the diagnosis got there first.

## Read-only, on purpose

> [!warning] Marcel does not write to the machine. Ever.
> No parameter changes, no overrides, no resuming a program. It observes and diagnoses. A human executes.

Feed rates, spindle limits, and tool offsets are the only thing between "cutting metal" and "a tool at 12,000 RPM going somewhere it shouldn't," with an operator standing at the door. The question isn't whether an agent *could* write them. It's what confidence justifies letting it, and the honest answer is higher than any model currently earns where the failure mode is physical.

Read-only buys three things: a hallucination costs you a suggestion a human declines rather than a crashed machine, every action has an accountable operator, and it's the only version a shop owner will actually install.

Same instinct as [[Trust Layer for Agentic Payments]]. Bound what an agent *may* do structurally, so you don't have to trust that it behaves.

## Next

**IMTS**, the International Manufacturing Technology Show in Chicago. Every controller vendor, integrator, and shop owner in the country in one building for a week, which makes it the cheapest way to find out whether the people who'd actually run this agree with how I've framed the problem.

Back to [[Projects]] · [[Entrepreneurship]] · [[Cytrence Technologies]]
