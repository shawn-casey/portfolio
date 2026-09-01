---
id: llm-red-teaming
title: LLM Red Teaming
folder: Experience
order: 4
tags: [llm-security, prompt-injection, ai-security, red-team]
summary: Indirect prompt injection against an internal document-upload assistant. It held, and flagged a formula-injection row I hadn't planted.
---

A side thread during my [[Visa]] internship, described functionally: an internal LLM document-upload assistant. Hand it a file, it reads it and answers questions about it.

The moment a model reads a user-uploaded document, that document is part of the prompt. Anything written in it arrives in the same channel as the operator's instructions, and the model has no reliable way to tell them apart.

I planted two payloads in spreadsheet cells: a system-override string shaped like a higher-priority instruction, and a hook telling the assistant to report the file clean regardless of what it found.

**Both failed.** It treated the cells as data to report on rather than instructions to follow. It also caught something I hadn't planted: a formula-injection row, a cell starting with `=` that would execute on open in a spreadsheet client, reported unprompted as its own finding.

## Why indirect injection is the worse problem

Direct injection is a user typing something adversarial into their own session. Blast radius: their session.

> [!warning] Indirect injection: the victim is not the attacker.
> The payload is planted by one person, in content a *different* person's session ingests. The victim only uploaded a file, or opened a page, or read an email. They can't inspect it; it's in row 4,182, or white text on white, or a PDF comment.

And the model acts with the victim's authority. Every document it can read and every tool it can call is now potentially attacker-directed. As assistants get tool access that goes from "returns a wrong answer" to "took an action."

## What held

Structural channel separation, so document content arrives in a delimited role rather than concatenated into the instruction stream. Instruction provenance, treating instructions found in retrieved content as something to report rather than obey. Deterministic sanitization independent of the model, which is what the formula-injection catch suggests. And no privileged action available: it answered questions, it didn't send mail or hit internal APIs.

That last one is the real lesson. Capability is the blast radius, and the cheapest mitigation is not granting it. Two payloads that didn't work is evidence, not proof.

Related: [[Adaptive Bypass Loop]] · [[Trust Layer for Agentic Payments]] · back to [[Visa]]
