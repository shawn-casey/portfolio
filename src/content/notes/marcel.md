---
id: marcel
title: Marcel
folder: Projects
order: 1
tags: [agents, cyber-physical-systems, manufacturing, startups, cnc]
summary: Air-gapped AI operator for CNC machines. Reads the control screen, diagnoses alarms from the machine's own manuals with page citations, and texts a technician. Read-only on a real machine so far. Actions run in simulation.
website: marcelcnc.com
---

[marcelcnc.com](https://marcelcnc.com) · August 2025 to present

> [!warning] Status
> Working on a real machine by phone, read-only. Actions work in simulation only. It is not installed on a real CNC control yet, and there is no pilot shop yet.

**Air-gapped AI operator for CNC machines.**

A small KVM-style capture-and-keyboard device on the control's screen and USB keyboard port lets Marcel read the screen, diagnose alarms from the machine's own manuals with page citations, take actions from a short reviewed list and verify them on screen, and text a technician the rest. The machine never goes on a network.

## Why

When a machine isn't cutting, it isn't making money. When it stops, it waits on the one person who knows how to fix it. Those people are retiring faster than new ones come in.

## What's real

**Working on a real machine, by phone.** On November 2, 2026, Marcel identified a ProtoTRAK RMX mill at a university machine shop from two technician photos sent over Telegram, read its fault, and replied with fix steps from the maker's manual with page citations. Read-only.

**Working in simulation.** On an offline industrial PC running a simulated FANUC-style control, Marcel holds the feed before a spindle overload, checks alarm history and tool life, texts the technician, and resets the tool-life counter after the technician replies. Simulated control, real hardware.

**Next.** A read-only install on a real CNC control. Then a pilot shop.

## Offline

The machine itself stays air-gapped: it never connects to a network. Marcel's agent runs on a separate computer and uses cloud AI today. Diagnosis already runs on a local model, and moving the whole agent offline is next.

## The trust ladder

Real machines start read-only. Then technician-approved actions from a reviewed list. It never jogs axes, edits programs, or changes offsets or parameters. That list is short: things like holding the feed, opening pages, or resetting a tool-life counter after a technician confirms a tool change.

Protective actions like holding the feed happen immediately, because stopping is the safe direction. Anything that restarts or changes the machine waits for the technician. In the simulation, the feed hold comes first, and the reset and restart come after the technician replies.

Same instinct as [[Trust Layer for Agentic Payments]]: bound what the software *may* do structurally, so nobody has to trust that it behaves.

## Where it came from

The summer before college I was the person standing in a machine shop's disorganized storage room, and I ended up writing software to fix the problem I was physically inside: [[Custom Machine Inc.]]. Four years later, same instinct, pointed at the control screen.

At IMTS in September 2026 I went to find out whether reading the screen works on current machines. On the handful I got to look at, it does, for a reason I hadn't expected: [[The Screen Is the Common Interface]].

Background, separate from Marcel: I'm an incoming intern at [[Nakamura-Tome]], working on machine tool software.

Back to [[Projects]] · [[Entrepreneurship]]
