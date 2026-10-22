import assert from "node:assert/strict";
import test from "node:test";
import { getLocalDate } from "./dates";

test("calcula el día actual en la zona horaria de Monterrey", () => {
  assert.equal(getLocalDate(new Date("2026-10-21T05:59:59.000Z")), "2026-10-20");
  assert.equal(getLocalDate(new Date("2026-10-21T06:00:00.000Z")), "2026-10-21");
});
