import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeRedirectParam,
  sanitizeCsvCell,
  isSafeNavigationUrl,
} from "../src/lib/security.ts";

describe("Security Controls & Vulnerability Defenses", () => {
  describe("CSV Formula Injection Defense (CWE-1236)", () => {
    test("neutralizes formula execution triggers (=, +, -, @, \\t, \\r)", () => {
      assert.equal(sanitizeCsvCell("=CMD|' /C calc'!A0"), "\"'=CMD|' /C calc'!A0\"");
      assert.equal(sanitizeCsvCell("+1+1"), "\"'+1+1\"");
      assert.equal(sanitizeCsvCell("-5"), "\"'-5\"");
      assert.equal(sanitizeCsvCell("@SUM(1,2)"), "\"'@SUM(1,2)\"");
      assert.equal(sanitizeCsvCell("\tmalicious"), "\"'\tmalicious\"");
      assert.equal(sanitizeCsvCell("\rmalicious"), "\"'\rmalicious\"");
    });

    test("escapes embedded double quotes by doubling them", () => {
      assert.equal(sanitizeCsvCell('John "The Reader" Doe'), '"John ""The Reader"" Doe"');
      assert.equal(sanitizeCsvCell('Special "Value" With =Trigger'), '"Special ""Value"" With =Trigger"');
    });

    test("safely formats benign numbers, strings, and nullish inputs", () => {
      assert.equal(sanitizeCsvCell("Standard Customer"), '"Standard Customer"');
      assert.equal(sanitizeCsvCell(129.99), '"129.99"');
      assert.equal(sanitizeCsvCell(null), '""');
      assert.equal(sanitizeCsvCell(undefined), '""');
      assert.equal(sanitizeCsvCell(true), '"true"');
    });
  });

  describe("Dangerous URL Scheme & Protocol Defense (CWE-79)", () => {
    test("rejects javascript: pseudo-protocol", () => {
      assert.equal(isSafeNavigationUrl("javascript:alert(1)"), false);
      assert.equal(isSafeNavigationUrl("JAVASCRIPT:alert(document.cookie)"), false);
      assert.equal(isSafeNavigationUrl("  javascript:void(0)"), false);
    });

    test("rejects vbscript: and data: pseudo-protocols", () => {
      assert.equal(isSafeNavigationUrl("vbscript:msgbox(1)"), false);
      assert.equal(isSafeNavigationUrl("data:text/html,<script>alert(1)</script>"), false);
    });

    test("accepts legitimate relative paths and external HTTPS destinations", () => {
      assert.equal(isSafeNavigationUrl("/stories"), true);
      assert.equal(isSafeNavigationUrl("/admin/dashboard"), true);
      assert.equal(isSafeNavigationUrl("https://storyhour.co.uk"), true);
      assert.equal(isSafeNavigationUrl("https://images.unsplash.com/photo-123"), true);
    });

    test("rejects null, undefined, or empty values", () => {
      assert.equal(isSafeNavigationUrl(null), false);
      assert.equal(isSafeNavigationUrl(undefined), false);
      assert.equal(isSafeNavigationUrl(""), false);
    });
  });

  describe("Open Redirect Centralized Sanitizer (CWE-601)", () => {
    test("accepts valid application routes and search parameters", () => {
      assert.equal(sanitizeRedirectParam("/admin/stories"), "/admin/stories");
      assert.equal(sanitizeRedirectParam("/checkout?coupon=STORY20"), "/checkout?coupon=STORY20");
    });

    test("neutralizes protocol-relative SSRF / phishing vectors", () => {
      assert.equal(sanitizeRedirectParam("//attacker.com"), "/account");
      assert.equal(sanitizeRedirectParam("///phish.org/steal"), "/account");
    });

    test("neutralizes Windows backslash URL bypass vectors", () => {
      assert.equal(sanitizeRedirectParam("\\evil.com"), "/account");
      assert.equal(sanitizeRedirectParam("/\\evil.com"), "/account");
    });

    test("neutralizes absolute protocol attempts", () => {
      assert.equal(sanitizeRedirectParam("https://evil.com"), "/account");
      assert.equal(sanitizeRedirectParam("ftp://transfer.net"), "/account");
      assert.equal(sanitizeRedirectParam("javascript:evil()"), "/account");
    });

    test("neutralizes control character injection", () => {
      assert.equal(sanitizeRedirectParam("/admin\r\nSet-Cookie: evil=1"), "/account");
      assert.equal(sanitizeRedirectParam("/account\0malicious"), "/account");
    });
  });

  describe("Next.js Security Header Policy Validation", () => {
    test("verifies required security header specifications", async () => {
      // Import next.config.ts directly to assert dynamic header configuration
      const nextConfigModule = await import("../next.config.ts");
      const nextConfig = nextConfigModule.default;

      assert.equal(typeof nextConfig.headers, "function");

      const originalEnv = process.env.NODE_ENV;
      try {
        // Test production header rules
        process.env.NODE_ENV = "production";
        const prodHeadersResult = await nextConfig.headers();
        const rootRouteProd = prodHeadersResult.find((h) => h.source === "/(.*)");
        assert.ok(rootRouteProd, "Root route headers must be defined");

        const prodHeaderMap = new Map(
          rootRouteProd.headers.map((item) => [item.key, item.value])
        );

        // Clickjacking defense
        assert.equal(prodHeaderMap.get("X-Frame-Options"), "DENY");

        // MIME sniffing defense
        assert.equal(prodHeaderMap.get("X-Content-Type-Options"), "nosniff");

        // Referrer policy
        assert.equal(prodHeaderMap.get("Referrer-Policy"), "strict-origin-when-cross-origin");

        // Production HSTS with safe 1-year max-age without risky premature preload
        assert.equal(prodHeaderMap.get("Strict-Transport-Security"), "max-age=31536000");

        // CSP validation
        const csp = prodHeaderMap.get("Content-Security-Policy");
        assert.ok(csp, "CSP must be configured");
        assert.ok(csp.includes("frame-ancestors 'none'"), "CSP must restrict frame-ancestors to none");
        assert.ok(csp.includes("object-src 'none'"), "CSP must restrict object-src to none");
        assert.ok(csp.includes("base-uri 'self'"), "CSP must restrict base-uri to self");
        assert.ok(!csp.includes("'unsafe-eval'"), "Production CSP must not include unsafe-eval");

        // Test development header rules (HSTS omitted, unsafe-eval allowed for HMR)
        process.env.NODE_ENV = "development";
        const devHeadersResult = await nextConfig.headers();
        const rootRouteDev = devHeadersResult.find((h) => h.source === "/(.*)");
        const devHeaderMap = new Map(
          rootRouteDev.headers.map((item) => [item.key, item.value])
        );

        // Dev must NOT enforce HSTS over HTTP localhost
        assert.equal(devHeaderMap.has("Strict-Transport-Security"), false);

        // Dev CSP enables unsafe-eval for Fast Refresh
        const devCsp = devHeaderMap.get("Content-Security-Policy");
        assert.ok(devCsp.includes("'unsafe-eval'"), "Dev CSP must allow unsafe-eval for HMR");
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
});
