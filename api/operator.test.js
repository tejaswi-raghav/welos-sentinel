import assert from "node:assert/strict";
import test from "node:test";
import handler from "./operator.js";

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("returns a bounded demo assessment when the Nebius key is absent", async () => {
  const previousKey = process.env.NEBIUS_API_KEY;
  delete process.env.NEBIUS_API_KEY;
  const response = createResponse();

  try {
    await handler({
      method: "POST",
      body: {
        telemetry: {
          operatingMode: "NORMAL",
          energy: { renewableKw: 5.2, demandKw: 3.8, servedLoadKw: 3.8 },
          storage: { batterySocPct: 74, protectedReservePct: 25 },
          water: { tankLevelPct: 62 },
          conditions: { gridAvailable: true, soilingPct: 4 },
          cleaning: { eligible: false },
          alarms: [],
        },
      },
    }, response);
  } finally {
    if (previousKey === undefined) delete process.env.NEBIUS_API_KEY;
    else process.env.NEBIUS_API_KEY = previousKey;
  }

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.live, false);
  assert.equal(response.body.model, "nvidia/nemotron-3-super-120b-a12b");
  assert.ok(response.body.analysis.actions.length > 0);
  assert.ok(response.body.analysis.constraints.some((item) => /actuat/i.test(item)));
});

test("rejects malformed telemetry", async () => {
  const response = createResponse();
  await handler({ method: "POST", body: {} }, response);
  assert.equal(response.statusCode, 400);
  assert.equal(response.body.error, "telemetry is required");
});
