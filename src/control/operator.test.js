import test from "node:test";
import assert from "node:assert/strict";
import { buildTelemetrySnapshot, demoOperatorAnalysis, normalizeOperatorAnalysis } from "./operator.js";

const input = {
  sensors: { timestamp: 0, batterySoc: 42, batteryVoltageV: 51, batteryTempC: 31, tankLevelPct: 58, rainfallMmHr: 0, waterTurbidityNtu: 1.2, solarIrradianceWm2: 700, windSpeedMs: 3, ambientTempC: 34, panelTempC: 41, humidityPct: 45, soilingIndex: .2, gridAvailable: false },
  result: { mode: "CONSERVE", power: { renewableKw: 2, pvKw: 1.8, windKw: .2, demandKw: 2.5, servedLoadKw: 2.2, gridImportKw: 0, curtailedKw: 0, loadShedKw: .3, reserveSoc: 35 }, water: { captureRateLpm: 0, firstFlushActive: false, storageActive: false }, cleaning: { eligible: false, blockers: ["High irradiance"] }, outputs: { windBrake: false } },
  controller: { lastDecision: "Protect reserve", cleaningCycles: 1 }, alarms: [], scenario: "OUTAGE",
};

test("buildTelemetrySnapshot keeps the operational facts needed by Nemotron", () => {
  const snapshot = buildTelemetrySnapshot(input);
  assert.equal(snapshot.operatingMode, "CONSERVE");
  assert.equal(snapshot.storage.protectedReservePct, 35);
  assert.equal(snapshot.conditions.soilingPct, 20);
  assert.equal(snapshot.energy.loadShedKw, .3);
});

test("demo analysis is explicit that it cannot actuate hardware", () => {
  const analysis = demoOperatorAnalysis(buildTelemetrySnapshot(input));
  assert.match(analysis.constraints.join(" "), /no actuator command/i);
  assert.equal(analysis.priorities[0].severity, "warning");
});

test("normalization caps untrusted model arrays", () => {
  const analysis = normalizeOperatorAnalysis({ priorities: Array(10).fill({ title: "x" }), actions: Array(10).fill("x"), constraints: [] });
  assert.equal(analysis.priorities.length, 3);
  assert.equal(analysis.actions.length, 4);
});

