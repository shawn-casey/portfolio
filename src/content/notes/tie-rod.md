---
id: tie-rod
title: Tie Rod Force Anomaly Detection
folder: Projects
order: 4
aliases: [Tie Rod Analysis, FSAE]
tags: [data-analysis, python, plotly, anomaly-detection]
summary: Python and Plotly analysis of tie rod force telemetry from Formula SAE runs, flagging high load under low G.
repo: https://github.com/shawn-casey/tieRodAnalysisFSAE
---

Formula SAE telemetry at [[University of Connecticut]].
[github.com/shawn-casey/tieRodAnalysisFSAE](https://github.com/shawn-casey/tieRodAnalysisFSAE)

![G-forces on top, measured force against predicted below it, inferred vehicle state at the bottom. Red crosses are the anomalies.|wide](/img/tierod.webp)

A tie rod carries steering load, so how hard it works should track how hard the car is cornering. The interesting signal isn't peak force, it's **force that doesn't match the G-force that should be causing it**. High load while the car is barely turning means something is loading that rod that isn't the driver.

The pipeline smooths force and acceleration, finds the car's real zero during static periods, infers vehicle state from the accelerometer traces (static, coasting, accel, braking, turning), fits a regression predicting expected force from G, and flags outliers against that prediction by IQR. One interactive Plotly figure with three time-aligned panels, so a run gets scrubbed rather than read. The run above turned up **1,871 samples of high force under low G**.

Same instinct as [[Belcan]], two orders of magnitude smaller and with the whole dataset in my hands. Both are physical-system telemetry where the useful question isn't "what was the maximum" but "what was inconsistent with the physics at that instant." Getting the baseline and the state segmentation right was most of the work. The regression was twenty lines.

Back to [[Projects]] · [[University of Connecticut]]
