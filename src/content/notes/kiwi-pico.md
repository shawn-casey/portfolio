---
id: kiwi-pico
title: Kiwi-Pico Firmware
folder: Projects
order: 6
tags: [embedded, firmware, rp2040, open-source]
summary: Open-source RP2040 demo firmware for a laptop-as-monitor device. Dual-core rendering pipeline, DVI output, USB HID input.
repo: https://github.com/cytrence/kiwi-pico
---

Open source, MIT licensed, from my time at [[Cytrence Technologies]].
[github.com/cytrence/kiwi-pico](https://github.com/cytrence/kiwi-pico)

An RP2040 firmware framework demonstrating a hardware device that lets a laptop stand in for an external monitor and keyboard. The demo applications run on a Raspberry Pi Pico and drive the whole loop: **DVI output** for video, **TinyUSB** and **USB HID** for keyboard input, and a **dual-core Cortex-M0+ rendering pipeline** that keeps one core on video output and the other on framebuffer updates. Cross-platform CMake builds on top of the Pico SDK.

## Why the second core is the whole trick

Bit-banged DVI on an RP2040 has no slack. The output core is busy shifting pixels on a hard schedule, and any work you add to it shows up as a torn or dropped frame. Putting the framebuffer updates on the other core is what makes a steady 60 Hz possible at 320x240 while the application logic still gets to run.

That is the same shape as [[RV32I Processor]] and [[Marcel]]: a timing budget set by hardware, and software arranged around it rather than fighting it.

Back to [[Projects]] · [[Cytrence Technologies]] · [[Toolbox]]
