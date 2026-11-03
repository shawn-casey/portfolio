---
id: visitor
title: Visitor
folder: Home
order: 3
tags: [privacy, opsec, demo]
component: visitor
summary: Everything this page learned about you before you read a word. Computed in your browser, stored nowhere.
---

You didn't click anything or fill anything out. Here's what your browser handed over anyway, the second the page loaded:

{{fingerprint}}

Every site you open gets all of that. There's no permission prompt for `screen.width`, and none for your IP either, because that's how the packets find their way back to you.

> [!info] None of it left your machine.
> Read from `navigator`, `screen`, `document.referrer`, and `Intl`. Nothing logged, nothing stored, nothing sent. Reload and it's recomputed. View source if you'd like to check.

## Everyone who's been here

{{visits}}

A city and a number. That's the whole database. No IPs, no timestamps, no sessions, no cookies.

The live-feed version, *someone from Foster City just opened this page, 11:42am*, would be more fun for about four seconds. Most of you are opening this from an employer's network, and publishing that isn't my call to make.

Back to [[Shawn Casey]] · [[About This Site]]
