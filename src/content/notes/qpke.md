---
id: qpke
title: Quantum Public Key Encryption for NISQ Devices
folder: Projects
order: 2
aliases: [QPKE]
tags: [quantum, cryptography, qiskit, research]
summary: A tunable quantum encryption compiler. Round-Robin QKD optimized for noisy intermediate-scale hardware.
repo: https://github.com/shawn-casey/qpke-circuit-compiler
---

Independent study in Qiskit and Python.
[github.com/shawn-casey/qpke-circuit-compiler](https://github.com/shawn-casey/qpke-circuit-compiler)

![|inset](/img/qpke.webp)

Give it your hardware's characteristics and your security target, and it emits a circuit tuned for that machine instead of an idealized one. It implements **Round-Robin QKD**, whose appeal is that its security bound doesn't require estimating the channel error rate, which is exactly the estimate you can't trust on noisy hardware. Around it sit pseudorandom functions and privacy amplification.

## The NISQ constraint

Tens to hundreds of qubits, no error correction, and a coherence time that is a hard wall. That makes it an optimization problem with a nasty shape:

| Push on | You pay in |
|---|---|
| **Circuit depth** | Decoherence: the circuit finishes after the qubits stopped being qubits |
| **Throughput** | Fewer rounds of privacy amplification, so a weaker bound |
| **Privacy amplification** | Key length: you compress away most of what you generated |

**Qubit allocation** is where the compiler earns its name. On real hardware qubits aren't interchangeable, and a circuit assuming a uniform lattice compiles into a swap-gate disaster on a device whose topology doesn't match. The compiler places it against the device's actual coupling map and error profile, so the qubits doing security-critical work are the good ones.

Quantum cryptography gets discussed as a far-future thing, but this part is the same problem as any applied cryptography: the math is sound and the implementation is where it goes wrong. A protocol with a beautiful proof, compiled onto a bad coupling map, has its security set by the hardware.

I was TA'ing quantum computing at [[University of Connecticut]] while writing it, which is the fastest way to find out which parts you don't understand.

Back to [[Projects]] · [[Education]]
