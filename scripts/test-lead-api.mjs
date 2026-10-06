import assert from "node:assert/strict";
import handler from "../api/lead.js";

const SERVICE_KEY = "service-role-secret-value";
const realFetch = globalThis.fetch;
const realError = console.error;
let calls = [];
let supabaseStatus = 201;
let resendStatus = 200;
let turnstileSuccess = true;
let ipCounter = 0;

globalThis.fetch = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  const reply = (status, body = {}) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
  if (String(url).includes("/rest/v1/leads")) return reply(supabaseStatus);
  if (String(url).includes("api.resend.com")) {
    if (resendStatus === 0) throw new Error("network down");
    return reply(resendStatus);
  }
  if (String(url).includes("siteverify")) return reply(200, { success: turnstileSuccess });
  throw new Error(`unexpected fetch ${url}`);
};

function resetEnv() {
  calls = [];
  supabaseStatus = 201;
  resendStatus = 200;
  turnstileSuccess = true;
  process.env.SUPABASE_URL = "https://fixture.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = SERVICE_KEY;
  process.env.SITE_URL = "https://example.test";
  delete process.env.TURNSTILE_SECRET_KEY;
  delete process.env.VERCEL_ENV;
  process.env.RESEND_API_KEY = "re_test";
  process.env.LEAD_NOTIFY_TO = "team@example.test";
  delete process.env.LEAD_NOTIFY_FROM;
}

const validBody = () => ({
  name: "Maria <b>Silva</b>",
  phone: "(21) 99999-9999",
  email: "maria@example.test",
  interest: "Visita presencial",
  message: "<script>alert(1)</script>",
  kind: "visit",
  property_code: "AP0001-NHB",
  source_path: "/imovel",
  consent: true,
  consent_version: "2026-09",
});

async function call({ method = "POST", body = validBody(), headers = {}, ip } = {}) {
  const request = {
    method,
    body,
    headers: { "x-forwarded-for": ip || `10.0.0.${++ipCounter}`, ...headers },
  };
  const out = { headers: {} };
  const response = {
    setHeader(name, value) { out.headers[name] = value; },
    status(code) { out.status = code; return response; },
    json(payload) { out.body = payload; return response; },
  };
  await handler(request, response);
  return out;
}

const insertCall = () => calls.find((item) => item.url.includes("/rest/v1/leads"));
const emailCall = () => calls.find((item) => item.url.includes("api.resend.com"));

const cases = {
  async "valid lead saved and email sent"() {
    const res = await call();
    assert.equal(res.status, 201);
    assert.deepEqual(res.body, { saved: true });
    const sent = JSON.parse(insertCall().options.body);
    assert.equal(sent.phone, "+5521999999999");
    assert.equal(sent.kind, "visit");
    assert.ok(sent.consent_at);
    assert.equal(insertCall().options.headers.Prefer, "return=minimal");
    assert.equal(insertCall().options.headers.Authorization, `Bearer ${SERVICE_KEY}`);
    const mail = JSON.parse(emailCall().options.body);
    assert.equal(mail.subject, "Novo contato: Visita · AP0001-NHB · Maria");
    assert.deepEqual(mail.to, ["team@example.test"]);
    assert.equal(mail.from, "New Home <onboarding@resend.dev>");
    assert.ok(mail.html.includes("https://wa.me/5521999999999"));
    assert.ok(mail.html.includes("https://example.test/imovel?code=AP0001-NHB"));
    assert.ok(!mail.html.includes("<script>") && !mail.html.includes("<b>Silva"));
    assert.ok(mail.html.includes("&lt;script&gt;"));
    assert.ok(!JSON.stringify(res).includes(SERVICE_KEY));
  },
  async "unknown fields are not forwarded"() {
    await call({ body: { ...validBody(), id: "x", status: "won", created_at: "2000-01-01" } });
    const sent = JSON.parse(insertCall().options.body);
    assert.ok(!("id" in sent) && !("status" in sent) && !("created_at" in sent));
  },
  async "invalid phone returns 400"() {
    const res = await call({ body: { ...validBody(), phone: "123" } });
    assert.equal(res.status, 400);
    assert.equal(insertCall(), undefined);
  },
  async "missing consent returns 400"() {
    const body = validBody();
    delete body.consent;
    const res = await call({ body });
    assert.equal(res.status, 400);
    assert.equal(insertCall(), undefined);
  },
  async "honeypot returns 200 without saving"() {
    const res = await call({ body: { ...validBody(), website: "http://spam.test" } });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { saved: true });
    assert.equal(calls.length, 0);
  },
  async "turnstile required and token missing returns 403"() {
    process.env.TURNSTILE_SECRET_KEY = "ts-secret";
    const res = await call();
    assert.equal(res.status, 403);
    assert.equal(insertCall(), undefined);
  },
  async "turnstile verification failing returns 403"() {
    process.env.TURNSTILE_SECRET_KEY = "ts-secret";
    turnstileSuccess = false;
    const res = await call({ body: { ...validBody(), turnstileToken: "bad" } });
    assert.equal(res.status, 403);
    assert.equal(insertCall(), undefined);
  },
  async "turnstile success saves and sends client ip"() {
    process.env.TURNSTILE_SECRET_KEY = "ts-secret";
    const res = await call({ body: { ...validBody(), turnstileToken: "good" }, ip: "203.0.113.9, 10.1.1.1" });
    assert.equal(res.status, 201);
    const verify = calls.find((item) => item.url.includes("siteverify"));
    assert.equal(verify.options.body.get("remoteip"), "203.0.113.9");
    assert.equal(verify.options.body.get("response"), "good");
  },
  async "production without turnstile secret returns 503"() {
    process.env.VERCEL_ENV = "production";
    const res = await call();
    assert.equal(res.status, 503);
    assert.equal(insertCall(), undefined);
  },
  async "sixth request from one ip returns 429"() {
    const ip = "198.51.100.7";
    for (let index = 0; index < 5; index += 1) assert.equal((await call({ ip })).status, 201);
    const res = await call({ ip });
    assert.equal(res.status, 429);
    assert.ok(Number(res.headers["Retry-After"]) > 0);
  },
  async "supabase 500 returns 502 saved false"() {
    supabaseStatus = 500;
    const res = await call();
    assert.equal(res.status, 502);
    assert.deepEqual(res.body, { saved: false });
    assert.equal(emailCall(), undefined);
  },
  async "email api failing still returns 201"() {
    resendStatus = 500;
    assert.equal((await call()).status, 201);
    resendStatus = 0;
    assert.equal((await call()).status, 201);
  },
  async "non-POST returns 405"() {
    const res = await call({ method: "GET" });
    assert.equal(res.status, 405);
    assert.equal(res.headers.Allow, "POST");
  },
  async "oversized body returns 413"() {
    const res = await call({ body: { ...validBody(), message: "x".repeat(11 * 1024) } });
    assert.equal(res.status, 413);
    const declared = await call({ headers: { "content-length": "20000" } });
    assert.equal(declared.status, 413);
    assert.equal(insertCall(), undefined);
  },
};

console.error = () => {};
let failed = 0;
for (const [name, run] of Object.entries(cases)) {
  resetEnv();
  try {
    await run();
    console.log(`ok   ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${name}\n     ${error.message}`);
  }
}
console.error = realError;
globalThis.fetch = realFetch;
if (failed) {
  console.error(`${failed} test(s) failed`);
  process.exit(1);
}
console.log(`${Object.keys(cases).length} tests passed`);
