export const OPERATOR_MODEL = "nvidia/nemotron-3-super-120b-a12b";

export function buildTelemetrySnapshot({ sensors, result, controller, alarms, scenario }) {
  return {
    capturedAt: new Date(sensors.timestamp).toISOString(),
    scenario,
    operatingMode: result.mode,
    deterministicDecision: controller.lastDecision,
    energy: {
      renewableKw: result.power.renewableKw,
      pvKw: result.power.pvKw,
      windKw: result.power.windKw,
      demandKw: result.power.demandKw,
      servedLoadKw: result.power.servedLoadKw,
      gridImportKw: result.power.gridImportKw,
      curtailedKw: result.power.curtailedKw,
      loadShedKw: result.power.loadShedKw,
    },
    storage: {
      batterySocPct: sensors.batterySoc,
      batteryVoltageV: sensors.batteryVoltageV,
      batteryTemperatureC: sensors.batteryTempC,
      protectedReservePct: result.power.reserveSoc,
    },
    water: {
      tankLevelPct: sensors.tankLevelPct,
      rainfallMmHr: sensors.rainfallMmHr,
      captureRateLpm: result.water.captureRateLpm,
      turbidityNtu: sensors.waterTurbidityNtu,
      firstFlushActive: result.water.firstFlushActive,
      storageActive: result.water.storageActive,
    },
    conditions: {
      irradianceWm2: sensors.solarIrradianceWm2,
      windSpeedMs: sensors.windSpeedMs,
      ambientTemperatureC: sensors.ambientTempC,
      panelTemperatureC: sensors.panelTempC,
      humidityPct: sensors.humidityPct,
      soilingPct: Number((sensors.soilingIndex * 100).toFixed(1)),
      gridAvailable: sensors.gridAvailable,
    },
    cleaning: {
      eligible: result.cleaning.eligible,
      blockers: result.cleaning.blockers,
      completedCycles: controller.cleaningCycles,
    },
    alarms: alarms.map(({ id, severity, title, detail }) => ({ id, severity, title, detail })),
    actuators: result.outputs,
  };
}

export function normalizeOperatorAnalysis(value) {
  const source = value && typeof value === "object" ? value : {};
  const text = (item, fallback) => typeof item === "string" && item.trim() ? item.trim() : fallback;
  const list = (items, limit) => Array.isArray(items) ? items.slice(0, limit) : [];
  return {
    headline: text(source.headline, "System assessment ready"),
    assessment: text(source.assessment, "Review deterministic controller status and active alarms."),
    priorities: list(source.priorities, 3).map((item, index) => ({
      severity: ["critical", "warning", "watch"].includes(item?.severity) ? item.severity : "watch",
      title: text(item?.title, "Priority " + (index + 1)),
      reason: text(item?.reason, "Inspect current telemetry before changing operating state."),
    })),
    actions: list(source.actions, 4).map((item) => text(item, "")).filter(Boolean),
    constraints: list(source.constraints, 4).map((item) => text(item, "")).filter(Boolean),
  };
}

export function demoOperatorAnalysis(snapshot) {
  const reserveGap = snapshot.storage.batterySocPct - snapshot.storage.protectedReservePct;
  const priorities = [];
  if (!snapshot.conditions.gridAvailable) priorities.push({ severity: "warning", title: "Preserve island reserve", reason: "Grid is offline with " + snapshot.storage.batterySocPct.toFixed(1) + "% battery state of charge." });
  if (snapshot.alarms.length) priorities.push({ severity: "critical", title: snapshot.alarms[0].title, reason: snapshot.alarms[0].detail || "An active controller alarm requires review." });
  if (snapshot.conditions.soilingPct >= 15) priorities.push({ severity: "watch", title: "Plan a panel-cleaning window", reason: "Soiling is " + snapshot.conditions.soilingPct.toFixed(1) + "%; cleaning eligibility is " + (snapshot.cleaning.eligible ? "open" : "blocked") + "." });
  if (!priorities.length) priorities.push({ severity: "watch", title: "Maintain automatic operation", reason: "No active alarm or immediate reserve threat is visible in the current snapshot." });
  return normalizeOperatorAnalysis({
    headline: snapshot.alarms.length ? "Operator attention is required" : "Resources are inside the supervised envelope",
    assessment: snapshot.operatingMode + " mode is serving " + snapshot.energy.servedLoadKw.toFixed(2) + " kW against " + snapshot.energy.demandKw.toFixed(2) + " kW demand. Battery margin above protected reserve is " + reserveGap.toFixed(1) + " percentage points.",
    priorities,
    actions: ["Keep the deterministic controller in authority.", "Review any active alarm before enabling manual supervision.", "Re-run the assessment after changing the simulation scenario."],
    constraints: ["Advisory output only—no actuator command was issued.", "Field operation requires calibrated hardware and licensed engineering review."],
  });
}

