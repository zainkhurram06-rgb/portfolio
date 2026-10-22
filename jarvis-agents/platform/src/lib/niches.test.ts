import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanDetails, describeDetails, isHealth, NICHE_KEYS, NICHES } from "./niches";
import { englishFor, LABEL_KEYS } from "./labels";
import { templatesFor } from "@/templates";

test("car wash needs a vehicle size, from the list only", () => {
  assert.deepEqual(cleanDetails("carwash", { vehicle_size: "suv", vehicle: " Tesla Model Y " }),
    { ok: true, details: { vehicle_size: "suv", vehicle: "Tesla Model Y" } });
  assert.deepEqual(cleanDetails("carwash", { vehicle_size: "tank" }), { ok: false, field: "vehicle_size" });
  assert.deepEqual(cleanDetails("carwash", {}), { ok: false, field: "vehicle_size" });
});

test("unknown answers are dropped, so nothing extra is ever stored", () => {
  const r = cleanDetails("dental", { patient_type: "new", symptoms: "toothache", insurance: "Bupa" });
  assert.deepEqual(r, { ok: true, details: { patient_type: "new", insurance: "Bupa" } });
});

test("text answers are cut to their limit", () => {
  const r = cleanDetails("autorepair", { vehicle: "x".repeat(500), drop_off: "wait" });
  assert.ok(r.ok && r.details.vehicle.length === 80);
});

test("healthcare niches are flagged, others are not", () => {
  assert.deepEqual(NICHE_KEYS.filter(isHealth), ["dental", "medical", "dermatology"]);
});

test("every niche has a design, and every question has words", () => {
  for (const n of NICHE_KEYS) {
    assert.ok(templatesFor(n).length > 0, `no template for ${n}`);
    for (const f of NICHES[n].bookingFields) {
      assert.ok(LABEL_KEYS.includes(`bf_${f.key}` as never), `missing label bf_${f.key}`);
      if (f.kind === "select") for (const o of f.options) assert.ok(LABEL_KEYS.includes(`bfo_${o}` as never), `missing label bfo_${o}`);
    }
  }
});

test("dashboard summary reads naturally", () => {
  assert.equal(describeDetails("carwash", { vehicle_size: "suv", vehicle: "Tesla Model Y" }, englishFor("carwash")), "SUV / 4x4 · Tesla Model Y");
});
