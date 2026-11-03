---
id: about-this-site
title: About This Site
folder: Home
order: 2
tags: [meta, obsidian]
summary: This site is an Obsidian vault because I ran a real one. 264 notes, 2,568 links, eleven coworkers who copied the setup.
---

A portfolio dressed as [Obsidian](https://obsidian.md). Not a theme choice. It's the most direct proof I have of something I actually did.

Through my last internship I kept my whole working memory in one vault: **264 notes, 2,568 links.** Meeting notes, architecture decisions, tool quirks, dead ends. I wrote tooling on top of it: templating, daily rollups, and a link-hygiene pass that flagged orphan notes and dangling references.

![Graph view from the vault I ran at work. File tree cropped, the folder names are internal.](/img/second-brain.webp)

Then I ran a lunch-and-learn and **eleven coworkers set up the same system.** That's the part I'm proud of. The tooling was easy; getting engineers to change how they take notes is a different problem.

> [!info] A term earns its own note only when two or more things reference it.
> Otherwise it stays a sentence inside the note that mentions it. One-reference notes are how a graph turns into gray mush. I held that rule here too.

Everything with the Obsidian name on it is computed, not faked. Backlinks come from the actual link graph. Graph view is a live `d3-force` simulation. The outline is parsed from markdown headings. The quick switcher fuzzy-matches every note and tag.

Notes are plain markdown files with YAML frontmatter, exactly like a vault. React, TypeScript, Vite, canvas-rendered graphs. Static bundle, no server. The only server-side thing here is a visit counter, and [[Visitor]] explains why I built it the boring way.

Back to [[Shawn Casey]]
