---
id: belcan
title: Belcan
folder: Experience
order: 6
tags: [data-engineering, databricks, aerospace, cyber-physical-systems, internship]
summary: Part-time data analytics on the Pratt & Whitney F135 program during my last semester. Databricks and Plotly pipelines over fighter-engine telemetry.
---

![|logo](/img/belcan.webp)

**Data Analytics Intern**, part-time alongside my last semester at [[University of Connecticut]]
Windsor, CT · March to May 2026

Analytics pipelines for the **Pratt & Whitney F135**, the propulsion system for the F-35.

![|wide](/img/f135.webp)

Databricks and Plotly over high-volume engine telemetry: cumulative engine-on-time per unit, anomaly detection surfacing engines that drifted out of their own historical envelope rather than a fleet-wide threshold, foreign object damage rates sliced by base and operating condition, and algorithmic detection of early maintenance signals ahead of a scheduled inspection.

## Why this is the cyber-physical part

Same subject as my [[Georgia Institute of Technology]] specialization, from the data side instead of the security side. A jet engine is sensors, controllers, actuators, and a network wrapped around something that will kill you if the physics go wrong.

Working the telemetry taught me what makes CPS security different: **the ground truth is physical.** A temperature sensor doesn't have an opinion. If a reading is impossible given the last ten seconds, something is wrong, and it's the engine, the sensor, or the path between. You can't spoof your way out of thermodynamics.

The other lesson: the hard part is never the model, it's the denominator. Getting engine-on-time right is what makes every rate downstream mean anything.

Back to [[Experience]] · related [[Tie Rod Force Anomaly Detection]]
