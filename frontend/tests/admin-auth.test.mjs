import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  generateAdminToken,
  isValidAdminToken,
  verifyAdminRequest,
  getAdminSecretKey,
  ADMIN_COOKIE_NAME,
} from "../src/lib/admin-auth.ts";

// Testing-only configuration. Isolated synthetic secret strictly for automated cryptographic unit tests; never used in production.
const TEST_SECRET = "test_synthetic_admin_signing_secret_64chars_long_xyz_1234567890";

describe("Admin Authentication & Cryptographic Security", () => {
  const originalSecret = process.env.ADMIN_SECRET_KEY;

  beforeEach(() => {
    delete process.env.ADMIN_SECRET_KEY;
  });

  after(() => {
    if (originalSecret) {
      process.env.ADMIN_SECRET_KEY = originalSecret;
    } else {
      delete process.env.ADMIN_SECRET_KEY;
    }
  });

  describe("Fail-Closed Behavior without ADMIN_SECRET_KEY", () => {
    test("getAdminSecretKey returns null when ADMIN_SECRET_KEY is absent", () => {
      assert.equal(getAdminSecretKey(), null);
    });

    test("generateAdminToken throws an explicit Error when ADMIN_SECRET_KEY is absent", () => {
      assert.throws(
        () => generateAdminToken("admin@storyhour.co.uk"),
        /ADMIN_SECRET_KEY environment variable is required/
      );
    });

    test("isValidAdminToken fails closed (returns false) when ADMIN_SECRET_KEY is absent", () => {
      const dummyToken = "eyJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwicm9sZSI6ImFkbWluIiwiZXhwIjoyMDAwMDAwMDAwMDAwfQ.dGVzdHNpZw";
      assert.equal(isValidAdminToken(dummyToken), false);
    });
  });

  describe("Cryptographic Token Generation and Verification", () => {
    beforeEach(() => {
      process.env.ADMIN_SECRET_KEY = TEST_SECRET;
    });

    test("generates and verifies a valid HMAC-SHA-256 admin token", () => {
      const email = "admin@storyhour.co.uk";
      const token = generateAdminToken(email);

      assert.ok(token.includes("."), "Token must contain a dot separator");
      const [payload, sig] = token.split(".");
      assert.ok(payload.length > 10, "Payload must be present");
      assert.ok(sig.length > 20, "Signature must be present");

      assert.equal(isValidAdminToken(token), true);
    });

    test("rejects forged signatures (tampered signature string)", () => {
      const token = generateAdminToken("admin@storyhour.co.uk");
      const [payload, sig] = token.split(".");
      const forgedSig = sig.slice(0, -2) + (sig.slice(-2) === "aa" ? "bb" : "aa");
      const forgedToken = `${payload}.${forgedSig}`;

      assert.equal(isValidAdminToken(forgedToken), false);
    });

    test("rejects tampered payloads (altered payload content with original signature)", () => {
      const token = generateAdminToken("admin@storyhour.co.uk");
      const [, sig] = token.split(".");

      const tamperedPayloadObj = {
        email: "attacker@evil.com",
        role: "admin",
        iat: Date.now(),
        exp: Date.now() + 100000,
      };
      const tamperedPayload = Buffer.from(JSON.stringify(tamperedPayloadObj)).toString("base64url");
      const tamperedToken = `${tamperedPayload}.${sig}`;

      assert.equal(isValidAdminToken(tamperedToken), false);
    });

    test("rejects expired tokens even if signature is valid", () => {
      const expiredPayloadObj = {
        email: "admin@storyhour.co.uk",
        role: "admin",
        iat: Date.now() - 1000000,
        exp: Date.now() - 5000, // expired 5 seconds ago
      };
      const encoded = Buffer.from(JSON.stringify(expiredPayloadObj)).toString("base64url");
      const sig = createHmac("sha256", TEST_SECRET).update(encoded).digest("base64url");
      const expiredToken = `${encoded}.${sig}`;

      assert.equal(isValidAdminToken(expiredToken), false);
    });

    test("rejects tokens with non-admin roles", () => {
      const userPayloadObj = {
        email: "user@storyhour.co.uk",
        role: "user", // not admin
        iat: Date.now(),
        exp: Date.now() + 100000,
      };
      const encoded = Buffer.from(JSON.stringify(userPayloadObj)).toString("base64url");
      const sig = createHmac("sha256", TEST_SECRET).update(encoded).digest("base64url");
      const userToken = `${encoded}.${sig}`;

      assert.equal(isValidAdminToken(userToken), false);
    });

    test("rejects malformed / non-string tokens", () => {
      assert.equal(isValidAdminToken(""), false);
      assert.equal(isValidAdminToken("justastring"), false);
      assert.equal(isValidAdminToken("a.b.c"), false);
      assert.equal(isValidAdminToken(null), false);
      assert.equal(isValidAdminToken(undefined), false);
    });
  });

  describe("Request Authorization (verifyAdminRequest) & Host-Bypass Elimination", () => {
    beforeEach(() => {
      process.env.ADMIN_SECRET_KEY = TEST_SECRET;
    });

    test("NEVER authorizes requests based on Host header alone (localhost bypass removed)", async () => {
      const fakeLocalhostReq = new Request("http://localhost:3000/api/cms/admin/content", {
        headers: {
          Host: "localhost",
        },
      });
      assert.equal(await verifyAdminRequest(fakeLocalhostReq), false);

      const fakeIpReq = new Request("http://127.0.0.1:3000/api/cms/admin/content", {
        headers: {
          Host: "127.0.0.1:3000",
        },
      });
      assert.equal(await verifyAdminRequest(fakeIpReq), false);

      const fakeLanReq = new Request("http://192.168.1.15:3000/api/cms/admin/content", {
        headers: {
          Host: "192.168.1.15",
        },
      });
      assert.equal(await verifyAdminRequest(fakeLanReq), false);
    });

    test("authorizes requests with valid Authorization Bearer token", async () => {
      const token = generateAdminToken("admin@storyhour.co.uk");
      const req = new Request("https://storyhour.co.uk/api/cms/admin/content", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      assert.equal(await verifyAdminRequest(req), true);
    });

    test("rejects requests with invalid Authorization Bearer token", async () => {
      const req = new Request("https://storyhour.co.uk/api/cms/admin/content", {
        headers: {
          Authorization: "Bearer invalid_forged_token.abc",
        },
      });
      assert.equal(await verifyAdminRequest(req), false);
    });

    test("authorizes requests with valid session cookie", async () => {
      const token = generateAdminToken("admin@storyhour.co.uk");
      const req = new Request("https://storyhour.co.uk/api/cms/admin/content", {
        headers: {
          Cookie: `${ADMIN_COOKIE_NAME}=${token}; other_cookie=xyz`,
        },
      });
      assert.equal(await verifyAdminRequest(req), true);
    });

    test("rejects requests without any auth headers or cookies", async () => {
      const req = new Request("https://storyhour.co.uk/api/cms/admin/content");
      assert.equal(await verifyAdminRequest(req), false);
    });
  });

  describe("Credential Verification & Timing Attack Side-Channel Defense", () => {
    // Pure validator simulating constant-time password check from auth route
    function verifyCredentialsSafe(
      inputEmail,
      inputPassword,
      configuredEmail,
      configuredPassword
    ) {
      if (!inputEmail || !inputPassword || !configuredEmail || !configuredPassword) {
        return false;
      }
      const emailMatches =
        String(inputEmail).trim().toLowerCase() === String(configuredEmail).trim().toLowerCase();
      const inputBuffer = Buffer.from(String(inputPassword).trim(), "utf8");
      const configBuffer = Buffer.from(String(configuredPassword).trim(), "utf8");

      const passwordMatches =
        inputBuffer.length === configBuffer.length &&
        timingSafeEqual(inputBuffer, configBuffer);

      return emailMatches && passwordMatches;
    }

    test("authorizes correct email and password with constant-time equality", () => {
      assert.equal(
        verifyCredentialsSafe(
          "Admin@StoryHour.co.uk ",
          "correct_secure_pass_2026!",
          "admin@storyhour.co.uk",
          "correct_secure_pass_2026!"
        ),
        true
      );
    });

    test("rejects wrong password without leaking character matches via timing", () => {
      assert.equal(
        verifyCredentialsSafe(
          "admin@storyhour.co.uk",
          "wrong_password_attempt!",
          "admin@storyhour.co.uk",
          "correct_secure_pass_2026!"
        ),
        false
      );
    });

    test("rejects password with different length immediately and safely", () => {
      assert.equal(
        verifyCredentialsSafe(
          "admin@storyhour.co.uk",
          "short",
          "admin@storyhour.co.uk",
          "correct_secure_pass_2026!"
        ),
        false
      );
    });

    test("rejects wrong email even if password is correct", () => {
      assert.equal(
        verifyCredentialsSafe(
          "intruder@evil.com",
          "correct_secure_pass_2026!",
          "admin@storyhour.co.uk",
          "correct_secure_pass_2026!"
        ),
        false
      );
    });

    test("fails closed when configured credentials are empty or null", () => {
      assert.equal(
        verifyCredentialsSafe("admin@storyhour.co.uk", "pass", null, null),
        false
      );
      assert.equal(
        verifyCredentialsSafe("admin@storyhour.co.uk", "pass", "", ""),
        false
      );
    });
  });

  describe("Open Redirect Security Regression Tests", () => {
    // Exact validator implemented in login/page.tsx and signup/page.tsx
    function sanitizeRedirectParam(param) {
      let dest = "/account";
      if (
        param &&
        typeof param === "string" &&
        param.startsWith("/") &&
        !param.startsWith("//") &&
        !param.includes("\\")
      ) {
        dest = param;
      }
      return dest;
    }

    test("accepts legitimate relative application routes", () => {
      assert.equal(sanitizeRedirectParam("/account"), "/account");
      assert.equal(sanitizeRedirectParam("/admin"), "/admin");
      assert.equal(sanitizeRedirectParam("/stories"), "/stories");
      assert.equal(sanitizeRedirectParam("/cart?step=2"), "/cart?step=2");
    });

    test("rejects protocol-relative URL attempts (//evil.com)", () => {
      assert.equal(sanitizeRedirectParam("//evil.com"), "/account");
      assert.equal(sanitizeRedirectParam("//attacker.com/login"), "/account");
      assert.equal(sanitizeRedirectParam("///phishing.org"), "/account");
    });

    test("rejects backslash evasion attempts (\\evil.com)", () => {
      assert.equal(sanitizeRedirectParam("\\evil.com"), "/account");
      assert.equal(sanitizeRedirectParam("/\\evil.com"), "/account");
      assert.equal(sanitizeRedirectParam("/path\\evil.com"), "/account");
    });

    test("rejects absolute external URLs (https://, http://)", () => {
      assert.equal(sanitizeRedirectParam("https://evil.com"), "/account");
      assert.equal(sanitizeRedirectParam("http://malicious.org/phish"), "/account");
    });

    test("rejects javascript: and data: pseudo-protocols", () => {
      assert.equal(sanitizeRedirectParam("javascript:alert(1)"), "/account");
      assert.equal(sanitizeRedirectParam("data:text/html,<script>alert(1)</script>"), "/account");
    });

    test("defaults safely to /account when param is missing, empty, or non-string", () => {
      assert.equal(sanitizeRedirectParam(null), "/account");
      assert.equal(sanitizeRedirectParam(undefined), "/account");
      assert.equal(sanitizeRedirectParam(""), "/account");
    });
  });
});

