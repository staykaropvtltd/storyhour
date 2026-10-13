import { test, describe } from "node:test";
import assert from "node:assert/strict";

/**
 * Pure validation engine matching the server-side business logic
 * implemented in src/app/api/contact/route.ts
 */
function validateContactEnquiry(payload) {
  const { name, email, phone, enquiryType, message, honeypot } = payload || {};

  // 1. Anti-spam honeypot detection
  if (honeypot) {
    return { valid: false, error: "Spam detected.", status: 400 };
  }

  // 2. Server-side string sanitization & trimming
  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
  const trimmedType = typeof enquiryType === "string" ? enquiryType.trim() : "General Enquiry";
  const trimmedMessage = typeof message === "string" ? message.trim() : "";

  if (!trimmedName || trimmedName.length < 2) {
    return { valid: false, error: "Please enter a valid name (at least 2 characters).", status: 422 };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return { valid: false, error: "Please enter a valid email address.", status: 422 };
  }

  if (!trimmedMessage || trimmedMessage.length < 10) {
    return { valid: false, error: "Please enter a message with at least 10 characters.", status: 422 };
  }

  return {
    valid: true,
    sanitized: {
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      enquiryType: trimmedType,
      message: trimmedMessage,
    },
  };
}

describe("Contact Form Validation & Spam Defense", () => {
  describe("Valid Enquiries", () => {
    test("accepts properly formatted contact enquiries", () => {
      const result = validateContactEnquiry({
        name: "Aarav Sharma",
        email: "aarav@example.com",
        phone: "+44 7911 123456",
        enquiryType: "Schools & Workshops",
        message: "We would like to book a Ramayana live storytelling session for our school.",
      });

      assert.equal(result.valid, true);
      assert.equal(result.sanitized.name, "Aarav Sharma");
      assert.equal(result.sanitized.email, "aarav@example.com");
      assert.equal(result.sanitized.enquiryType, "Schools & Workshops");
    });

    test("trims whitespace from inputs and defaults missing enquiry type", () => {
      const result = validateContactEnquiry({
        name: "  Priya Patel  ",
        email: "  priya@example.co.uk  ",
        message: "  Interested in the signed edition box sets.  ",
      });

      assert.equal(result.valid, true);
      assert.equal(result.sanitized.name, "Priya Patel");
      assert.equal(result.sanitized.email, "priya@example.co.uk");
      assert.equal(result.sanitized.enquiryType, "General Enquiry");
      assert.equal(result.sanitized.phone, "");
    });
  });

  describe("Spam & Bot Honeypot Protection", () => {
    test("rejects submissions containing honeypot content", () => {
      const result = validateContactEnquiry({
        name: "SpamBot",
        email: "bot@spammer.com",
        message: "Buy cheap products now online!",
        honeypot: "https://spam-link.ru",
      });

      assert.equal(result.valid, false);
      assert.equal(result.status, 400);
      assert.equal(result.error, "Spam detected.");
    });
  });

  describe("Validation Errors & Edge Cases", () => {
    test("rejects empty or whitespace-only name", () => {
      const r1 = validateContactEnquiry({ name: "", email: "user@test.com", message: "Hello StoryHour!" });
      assert.equal(r1.valid, false);
      assert.equal(r1.status, 422);

      const r2 = validateContactEnquiry({ name: "   ", email: "user@test.com", message: "Hello StoryHour!" });
      assert.equal(r2.valid, false);

      const r3 = validateContactEnquiry({ name: "A", email: "user@test.com", message: "Hello StoryHour!" });
      assert.equal(r3.valid, false);
    });

    test("rejects malformed email formats", () => {
      const invalidEmails = [
        "notanemail",
        "@missinguser.com",
        "user@",
        "user@nodomain",
        "spaces in@email.com",
        "user@.com",
      ];

      for (const email of invalidEmails) {
        const result = validateContactEnquiry({
          name: "Test User",
          email,
          message: "Valid message with at least 10 characters.",
        });
        assert.equal(result.valid, false, `Expected ${email} to be rejected`);
        assert.equal(result.status, 422);
      }
    });

    test("rejects message shorter than 10 characters", () => {
      const result = validateContactEnquiry({
        name: "Karan",
        email: "karan@storyhour.co.uk",
        message: "Too short",
      });
      assert.equal(result.valid, false);
      assert.equal(result.status, 422);
    });

    test("safely handles null, undefined, and non-object payloads without throwing", () => {
      assert.equal(validateContactEnquiry(null).valid, false);
      assert.equal(validateContactEnquiry(undefined).valid, false);
      assert.equal(validateContactEnquiry({}).valid, false);
      assert.equal(validateContactEnquiry("invalid string").valid, false);
    });
  });
});
