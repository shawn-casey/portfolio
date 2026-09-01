---
id: security-interest
title: Security & CTI Interest
folder: Hobbies
order: 5
tags: [security, learning, threat-intel]
summary: Following the security world closely and digging into things when the noise seems disproportionate. An interest, not a job.
---

> [!info] Framing this accurately
> This is an interest, filed under [[Hobbies]] on purpose. I have not held a CTI role. My professional security work is at [[Visa]].

DEFCON talks, mostly the hardware and mobile tracks, because people there present the failures: the six weeks of not working before the exploit landed. Advisory feeds and CISA KEV additions. Researchers on X, who post the interesting half of what they're working on months before anyone writes it up.

The part that separates it from doomscrolling is going and reading the thing itself.

## Example: the IPv6 kernel bug

The OpenAI leak was everywhere for about a week. Incidents like it aren't new, so I got curious about why this one was getting so much more coverage. I read back through past cases of the same shape to get a baseline, then worked forward to what was actually different, which is how I ended up on **CVE-2026-53362**: a heap overflow in the Linux kernel's `__ip6_append_data()`, CVSS 7.8, added to CISA's Known Exploited Vulnerabilities catalog in August 2026.

What made it different from most of what I'd just read:

- Most of those were credential or configuration stories. Someone's token leaked, a bucket was public. Bad, but the fix is procedural.
- This is a privilege boundary. Controlled kernel heap corruption is the classic route from unprivileged user to root, and the reachable path is the ordinary IPv6 send path, not an exotic option. There's no "we weren't running that feature" defense.
- KEV means observed exploitation, which is the line between an interesting bug and an operational one.

I read the advisory, the patch, and the write-ups. I didn't reproduce it. What I got was context, and one thing that stuck: `__ip6_append_data()` has been read by a lot of very good engineers for a long time and still had this in it. The miss isn't a bounds check, it's the invariant between length quantities computed in different places, each correct on its own.

Related: [[Hobbies]] · [[Projects]]
