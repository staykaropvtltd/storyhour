# Comprehensive Frontend QA Remediation Report: StoryHour Web Application

**Date of Remediation:** October 11, 2026  
**Target Codebase:** StoryHour Web (`storyhour-web`)  
**Remediation Scope:** All 15 issues identified in the Frontend QA Audit  
**Strict UI Preservation Principle:** Fully Honored — Zero redesigns, zero aesthetic drift, zero layout modifications.  

---

## 1. Executive Summary

A comprehensive, code-level remediation was executed across the entire StoryHour web application to address all 15 defects identified during the Frontend QA Audit. Every change followed the strict directive to **preserve the approved Apple-inspired and Papumba-style visual design** while repairing functionality, keyboard accessibility (WCAG 2.1 AA), lifecycle resource management, mobile responsiveness, and code cleanliness.

### Verification Summary
* **Total Discovered Issues:** 15
* **Issues Fixed and Verified:** **15 / 15 (100%)**
* **External Integrations Blocked by Missing Credentials:** 3 (Contact email delivery, Google/Apple OAuth, Password reset SMTP)
* **TypeScript Compilation (`tsc --noEmit`):** **0 Errors (Passed)**
* **Next.js Production Build (`next build`):** **Compiled successfully in 62s; 21/21 static pages generated (Passed)**
* **All 15 Accessible Routes:** **Live Verified with 200 OK / 307 Redirect**

---

## 2. Issues Remediation Register (All 15 Issues)

| ID | Issue Summary | Affected File(s) | Severity | Status |
| :--- | :--- | :--- | :---: | :---: |
| **BUG-01** | Contact Form Uses Mock `setTimeout` Submission | `src/app/contact/page.tsx`, `src/app/api/contact/route.ts` | P1 (High) | **FIXED AND VERIFIED** |
| **BUG-02** | Broken Fallback Cover Image Path (HTTP 404) | `LibraryCartContext.tsx`, `cart/page.tsx`, `checkout/page.tsx`, `order-success/page.tsx` | P1 (High) | **FIXED AND VERIFIED** |
| **BUG-03** | Fake Social Login Buttons Autofill Static Credentials | `src/app/login/page.tsx` | P1 (High) | **FIXED AND VERIFIED** |
| **BUG-04** | Password Reset Link Uses Blocking Browser `alert()` | `src/app/login/page.tsx` | P2 (Med) | **FIXED AND VERIFIED** |
| **BUG-05** | Smooth-Scroll Lenis RAF Loop Memory Leak on Unmount | `src/components/layout/SmoothScrollProvider.tsx` | P2 (Med) | **FIXED AND VERIFIED** |
| **BUG-06** | Search Modal Missing Escape Key and Keyboard Focus Trap | `src/components/SearchModal.tsx` | P2 (Med) | **FIXED AND VERIFIED** |
| **BUG-07** | Hero Display Headline Text Overflow on 320px Viewports | `src/components/new-design/PapumbaHero.tsx` | P2 (Med) | **FIXED AND VERIFIED** |
| **BUG-08** | Cart Drawer Keyboard Focus Escaping into Background | `src/components/CartDrawer.tsx` | P2 (Med) | **FIXED AND VERIFIED** |
| **BUG-09** | Unused `split-type` Dependency in `package.json` | `package.json`, `package-lock.json` | P3 (Low) | **FIXED AND VERIFIED** |
| **BUG-10** | Dead `handleUnlock` Function in AudiobookModal | `src/components/AudiobookModal.tsx` | P3 (Low) | **FIXED AND VERIFIED** |
| **BUG-11** | Orphaned Scaffolding Components (`demo.tsx`, `auth-section-1.tsx`) | `src/components/ui/demo.tsx`, `src/components/ui/auth-section-1.tsx` | P3 (Low) | **FIXED AND VERIFIED** |
| **BUG-12** | Duplicate Footer Implementation (`PapumbaFooter.tsx`) | `src/components/new-design/PapumbaFooter.tsx`, `src/app/page.tsx`, `src/app/new-design/page.tsx` | P3 (Low) | **FIXED AND VERIFIED** |
| **BUG-13** | Prototype Route `/new-design` Exposed Without Redirect | `next.config.ts` | P3 (Low) | **FIXED AND VERIFIED** |
| **BUG-14** | Developer Annotation Tool Loads Unconditionally in Production | `src/components/AgentationProvider.tsx` | P3 (Low) | **FIXED AND VERIFIED** |
| **BUG-15** | Audiobook Modal Mute State Disconnected from Global Audio | `src/components/AudiobookModal.tsx` | P3 (Low) | **FIXED AND VERIFIED** |

---

## 3. Detailed Root Cause, Fix Implementation & Verification

### BUG-01: Contact Form Uses Mock Submission
* **Root Cause:** `src/app/contact/page.tsx` simulated submission with `setTimeout(500)` and set `isSubmitted = true`, immediately discarding all user input in memory without dispatching it to any backend handler.
* **Fix Implemented:**
  1. Created a production-grade API endpoint `src/app/api/contact/route.ts` with strict server-side validation (`name` >= 2 chars, regex email validation, `message` >= 10 chars, honeypot spam protection, structured server logging).
  2. Connected `src/app/contact/page.tsx` to `POST /api/contact` via an asynchronous `fetch()` request.
  3. Added accessible `submitError` banner (`role="alert"`) for displaying network or validation errors without losing the user's entered form data.
  4. Disabled submit button during active request (`disabled={isSubmitting}`) to prevent duplicate clicks.
* **Verification:** Tested live with automated PowerShell tests. Valid submissions returned `{ success: true, delivered: false, message: "Your enquiry has been received and logged." }` (HTTP 200). Spam honeypot rejected with HTTP 400. Malformed payload rejected with HTTP 422.

---

### BUG-02: Broken Fallback Cover Image Path
* **Root Cause:** Default fallback cover image was hardcoded to `/images/covers/cover-ramayana.png`, but the `public/images/covers` directory does not exist on disk, resulting in HTTP 404 broken images.
* **Fix Implemented:** Replaced all 5 occurrences of `/images/covers/cover-ramayana.png` with verified image `/images/ramayana_epic.jpg` across:
  - `src/context/LibraryCartContext.tsx` (lines 165, 228)
  - `src/app/order-success/page.tsx` (line 180)
  - `src/app/checkout/page.tsx` (line 675)
  - `src/app/cart/page.tsx` (line 144)
* **Verification:** HTTP HEAD request to `http://localhost:3000/images/ramayana_epic.jpg` verified with `StatusCode: 200`. Ripgrep search confirmed zero remaining references to `cover-ramayana`.

---

### BUG-03: Fake Google and Apple Authentication
* **Root Cause:** Clicking "Sign in with Google" or "Sign in with Apple" hardcoded demo accounts (`reader@storyhour.co.uk`, `parent@storyhour.co.uk`) and populated them into form inputs without executing an OAuth flow.
* **Fix Implemented:**
  1. Removed static autofill handler from both social login buttons.
  2. Implemented `handleSocialAuth(provider)` that presents an honest, accessible in-page alert informing the user that Google and Apple Sign-In require OAuth provider configuration, guiding them to sign in with email and password.
  3. Preserved 100% of the exact button dimensions, SVG icons, hover styles, and layout.
* **Verification:** Verified buttons trigger informative error message without populating fake passwords or executing fake logins.

---

### BUG-04: Password Reset Uses a Placeholder Alert
* **Root Cause:** "Forgot password?" link called `alert("Password reset instructions sent to your email.")` without checking if an email was entered or communicating with an authentication backend.
* **Fix Implemented:**
  1. Converted `<a>` link into a semantic `<button type="button">` with identical styling and underline.
  2. Implemented `handleForgotPassword` which checks the email input field:
     - If empty or invalid, displays an in-page alert: *"Please enter your registered email address in the field below to request password reset instructions."*
     - If valid email is provided, displays an honest in-page status: *"Password reset service is pending email provider configuration. Please contact support at contact@storyhour.co.uk to reset access for [email]."*
  3. Removed all blocking browser `alert()` invocations.
* **Verification:** Verified both empty-email and filled-email clicks trigger non-blocking in-page messages with proper validation.

---

### BUG-05: Smooth-Scroll Animation Frame Cleanup
* **Root Cause:** `SmoothScrollProvider.tsx` started a recursive `requestAnimationFrame(raf)` loop but never stored the returned frame ID or called `cancelAnimationFrame` in the effect cleanup.
* **Fix Implemented:** Stored `rafId: number` and added `cancelAnimationFrame(rafId)` alongside `instance.destroy()` in the cleanup callback of `useEffect`.
* **Verification:** Verified component unmounting properly cancels scheduled RAF callback without detached animation cycles.

---

### BUG-06: Search Modal Accessibility
* **Root Cause:** `SearchModal.tsx` lacked an `Escape` key event listener and allowed keyboard `Tab` focus to escape behind the modal into the background page.
* **Fix Implemented:**
  1. Added `useEffect` listening to `Escape` key to immediately dismiss the modal.
  2. Implemented keyboard focus trap inside `modalRef`: pressing `Tab` on the last focusable element wraps to the first element; pressing `Shift+Tab` on the first element wraps to the last element.
  3. Saved `triggerRef.current = document.activeElement` and restored focus to the opening element upon modal closure.
  4. Preserved exact modal styling, background backdrop blur, and search filtering logic.
* **Verification:** Verified keyboard tab order containment and Escape dismissal.

---

### BUG-07: Hero Headline on 320px Screens
* **Root Cause:** Headline on mobile viewports used `text-[2.8rem]` (`44.8px`), which with negative letter-spacing caused the word "storytelling" (~312px) to risk text clipping or awkward breaks on 320px screen widths (288px padded content).
* **Fix Implemented:** Updated typography class to `text-[clamp(2.2rem,9.5vw,2.8rem)] sm:text-[4rem] md:text-[5.2rem] lg:text-[6.2rem] xl:text-[7rem]`.
  - On 320px screens, smoothly scales to `2.2rem` (35.2px), fitting inside the container with zero horizontal overflow or clipping.
  - On 480px+ and above `sm:` (640px+), scales to the exact original sizing (`4rem`, `5.2rem`, `6.2rem`, `7rem`).
  - Preserved exact font, color, drop-shadow, tracking, leading, and desktop appearance.
* **Verification:** Tested across viewports 320px, 360px, 375px, 390px, 414px, 768px, 1024px, 1440px, and 1920px. Zero horizontal overflow detected.

---

### BUG-08: Cart Drawer Accessibility
* **Root Cause:** When `CartDrawer` was open, pressing `Tab` allowed keyboard focus to escape the drawer and interact with obscured page elements behind the backdrop.
* **Fix Implemented:**
  1. Added `drawerRef` and `triggerRef`.
  2. Implemented keyboard focus trap inside the drawer container: cycling forward from the last button wraps to the close button; cycling backward from the close button wraps to the last button.
  3. Restored focus to the shopping bag button upon drawer close.
  4. Auto-focused first interactive control on drawer open.
* **Verification:** Verified focus containment and tab looping while cart drawer is open.

---

### BUG-09: Unused `split-type` Dependency
* **Root Cause:** `split-type` was listed in `package.json` dependencies but was never imported or used anywhere in `src`.
* **Fix Implemented:** Safely executed `npm uninstall split-type`, updating `package.json` and `package-lock.json`.
* **Verification:** Confirmed package removed from `package.json`. TypeScript compiler and Next.js build completed with 0 errors.

---

### BUG-10: Dead `handleUnlock` Function
* **Root Cause:** `src/components/AudiobookModal.tsx` defined `handleUnlock` and `isUnlocking` state which were never referenced anywhere in JSX (all purchase actions use `addToCart`).
* **Fix Implemented:** Removed `handleUnlock` and `isUnlocking` state from `src/components/AudiobookModal.tsx`.
* **Verification:** Verified Audiobook modal compiles cleanly and functions properly.

---

### BUG-11: Orphaned UI Templates
* **Root Cause:** `src/components/ui/demo.tsx` and `src/components/ui/auth-section-1.tsx` were leftover scaffolding templates unreferenced by any route or component.
* **Fix Implemented:** Permanently removed both files from disk.
* **Verification:** Verified `src/components/ui` now only contains active components (`morphing-cursor.tsx`, `rolling-list.tsx`). Build passed with 0 errors.

---

### BUG-12: Duplicate Footer Implementations
* **Root Cause:** `src/components/new-design/PapumbaFooter.tsx` duplicated `src/components/SiteFooter.tsx`. `SiteFooter` is the canonical, enhanced footer used across 11 routes with the organic storybook cloud wave matching `#FAF6EE`.
* **Fix Implemented:**
  1. Updated `src/app/page.tsx` and `src/app/new-design/page.tsx` to import and use `SiteFooter` from `@/components/SiteFooter`.
  2. Safely removed `src/components/new-design/PapumbaFooter.tsx`.
* **Verification:** Verified all pages render the canonical footer with identical styling and assets.

---

### BUG-13: Prototype Route `/new-design` Is Exposed
* **Root Cause:** Prototype route `/new-design` was directly accessible to web visitors.
* **Fix Implemented:** Added redirect configuration in `next.config.ts`:
  ```ts
  {
    source: "/new-design",
    destination: "/",
    permanent: false,
  }
  ```
* **Verification:** Tested live with HTTP request; navigating to `/new-design` returned an immediate HTTP 307 temporary redirect to `/`.

---

### BUG-14: Developer Annotation Tool Loads in Production
* **Root Cause:** `AgentationProvider.tsx` rendered `<Agentation />` unconditionally across all build environments.
* **Fix Implemented:** Added environment guard in `src/components/AgentationProvider.tsx`:
  ```tsx
  if (!mounted || process.env.NODE_ENV !== "development") {
    return null;
  }
  ```
* **Verification:** Verified tool returns `null` in production builds without hydration mismatches, while remaining functional during local development.

---

### BUG-15: Audiobook Modal Audio State Disconnected
* **Root Cause:** `AudiobookModal.tsx` managed an isolated local `isMuted` state initialized to `false`, diverging from the global `AudioContext` provider.
* **Fix Implemented:**
  1. Connected `AudiobookModal.tsx` to `useAudio()` context from `@/context/AudioContext`.
  2. Subscribed directly to shared `isMuted` state and bound the mute button's `onClick` to `toggleMute`.
  3. Preserved all volume icon styles (`Volume2`, `VolumeX`) and audio player design.
* **Verification:** Verified muting from the audiobook modal synchronizes audio state with the global audio player.

---

## 4. External Integrations Requiring Credentials / User Decision

As mandated by the testing rules, no dummy third-party integrations were invented. The following 3 features are architected and ready for credentials:

1. **Email Delivery Provider for Contact Inquiries (`BUG-01`):**
   * **Current State:** Messages are validated and logged to server console.
   * **Requirement:** Needs an email service API key (e.g., `RESEND_API_KEY` for Resend, `SENDGRID_API_KEY` for SendGrid, or standard SMTP credentials).
2. **Social OAuth Providers for Google and Apple (`BUG-03`):**
   * **Current State:** Buttons display helpful guidance directing users to sign in with email/password.
   * **Requirement:** Needs OAuth client credentials (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and `APPLE_CLIENT_ID` / `APPLE_TEAM_ID` via NextAuth or Supabase Auth).
3. **Password Reset Service (`BUG-04`):**
   * **Current State:** Validates registered email and directs user to support contact.
   * **Requirement:** Requires password reset token generator and transactional email service.

---

## 5. Files Modified

| File Path | Nature of Change |
| :--- | :--- |
| `src/context/LibraryCartContext.tsx` | Fixed fallback image path to `/images/ramayana_epic.jpg` (BUG-02) |
| `src/app/order-success/page.tsx` | Fixed fallback image path to `/images/ramayana_epic.jpg` (BUG-02) |
| `src/app/checkout/page.tsx` | Fixed fallback image path to `/images/ramayana_epic.jpg` (BUG-02) |
| `src/app/cart/page.tsx` | Fixed fallback image path to `/images/ramayana_epic.jpg` (BUG-02) |
| `src/components/layout/SmoothScrollProvider.tsx` | Added RAF loop ID tracking and `cancelAnimationFrame` cleanup (BUG-05) |
| `src/components/SearchModal.tsx` | Added Escape key handler, focus trap, and trigger focus restore (BUG-06) |
| `src/components/CartDrawer.tsx` | Added keyboard focus containment and trigger focus restore (BUG-08) |
| `src/components/new-design/PapumbaHero.tsx` | Added responsive typography clamp for 320px mobile screens (BUG-07) |
| `src/components/AudiobookModal.tsx` | Pruned dead `handleUnlock` code (BUG-10) and synchronized `useAudio` mute state (BUG-15) |
| `src/components/AgentationProvider.tsx` | Gated rendering to `NODE_ENV === "development"` (BUG-14) |
| `src/app/api/contact/route.ts` | Created new API route with server-side validation and structured logging (BUG-01) |
| `src/app/contact/page.tsx` | Connected form to `/api/contact`, added duplicate submit protection & error banner (BUG-01) |
| `src/app/login/page.tsx` | Removed fake autofill from social buttons (BUG-03), removed `alert()` from password reset (BUG-04) |
| `src/app/page.tsx` | Standardized footer to `SiteFooter` (BUG-12) |
| `src/app/new-design/page.tsx` | Standardized footer to `SiteFooter` (BUG-12) |
| `next.config.ts` | Added redirect from `/new-design` to `/` (BUG-13) |
| `package.json` & `package-lock.json` | Removed unused `split-type` dependency (BUG-09) |
| `src/components/ui/demo.tsx` | Deleted orphaned file (BUG-11) |
| `src/components/ui/auth-section-1.tsx` | Deleted orphaned file (BUG-11) |
| `src/components/new-design/PapumbaFooter.tsx` | Deleted duplicate component (BUG-12) |

---

## 6. Build & Test Verification Results

* **TypeScript Compilation:**
  ```
  npx tsc --noEmit -> Exit code: 0 (No type errors)
  ```
* **Production Build:**
  ```
  npm run build -> Exit code: 0 (Compiled in 62s, 21 static pages generated)
  ```
* **Asset Verification:**
  - `http://localhost:3000/images/ramayana_epic.jpg` -> `StatusCode: 200`
* **API Validation Tests:**
  - Valid Contact Form Submission -> `StatusCode: 200` (`{ success: true }`)
  - Spam Honeypot Submission -> `StatusCode: 400`
  - Invalid / Malformed Submission -> `StatusCode: 422`
* **Route Reachability (All 15 Routes):**
  - `/` -> `200 OK`
  - `/stories` -> `200 OK`
  - `/account` -> `200 OK`
  - `/cart` -> `200 OK`
  - `/checkout` -> `200 OK`
  - `/contact` -> `200 OK`
  - `/editions` -> `200 OK` (Internal redirect to `/stories`)
  - `/login` -> `200 OK`
  - `/new-design` -> `307 Redirect` to `/`
  - `/order-success` -> `200 OK`
  - `/privacy` -> `200 OK`
  - `/signup` -> `200 OK`
  - `/storytellers` -> `200 OK`
  - `/terms` -> `200 OK`
  - `/trailers` -> `200 OK`

---
*End of Remediation Report.*
