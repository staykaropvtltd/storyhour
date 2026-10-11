# StoryHour — The Magical Storytelling Platform for Kids & Families

An Apple-inspired, richly animated web platform bringing timeless Indian mythology, history, and folklore to life for children and families through soulful audiobooks, interactive 3D books, and puppet theatre.

---

## 🌟 Overview & Features

StoryHour is built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**. It combines modern web performance with rich, handcrafted cultural aesthetics.

- 📖 **Interactive 3D Book Reader**: Features dual-page spread on desktop, responsive single-page mode on mobile, free-preview mode (pages 1–2), and realistic page-turn sound effects powered by a resource-efficient singleton audio engine.
- 🎧 **Audiobook Engine**: Global HTML5 audio player supporting sample playback, seeking, volume controls, and chapter selection in Hindi, English, and Telugu.
- 🛍️ **Cart & Digital Checkout**: Unified product and edition catalog with consistent British Pound (£ / GBP) pricing, digital quantity limits (capped at 1 per edition), live cart drawer, and accessible checkout validation with statutory 14-day digital waiver and parental consent checkboxes.
- 🔍 **Accessible Navigation & Search**: Deep search entry point with keyboard shortcut (`Ctrl+K` / `Cmd+K`), live cart counter, and responsive mobile menu adhering to WCAG 2.1 AA accessibility standards.
- 🎭 **Curated Story Collection**: Authentic stories and epics including Valmiki's Ramayana (English, Hindi, Telugu editions), Hanuman's Mighty Leap, Panchatantra Fables, and Young Mohandas (Gandhi).
- 🛡️ **Security & SEO Ready**: Configured Content Security Policy (CSP), strict HTTP security headers, per-route Open Graph and JSON-LD schema metadata, dynamic `robots.txt`, and XML `sitemap`.

---

## 📋 Quality Audit & Verification Status

The codebase has undergone a complete quality audit and defect remediation based on the official StoryHour audit findings (**FT-01 through FT-31**).

| Audit Area | Total Checks | Result | Status |
| :--- | :---: | :---: | :---: |
| **Frontend Core Tests (FT-01 — FT-31)** | **31** | **31 / 31 PASS** | ✅ Verified |
| **Defect Findings (C-01 — C-08)** | **8** | **8 RESOLVED** | ✅ Verified |
| **Architecture & Security (E-01 — E-07)** | **7** | **7 RESOLVED** | ✅ Verified |
| **UI & Accessibility (F-01 — F-07)** | **7** | **7 RESOLVED** | ✅ Verified |
| **TypeScript Compilation (`tsc --noEmit`)** | — | **0 Errors** | ✅ Verified |
| **Production Linter (`npm run lint`)** | — | **0 Warnings / Errors** | ✅ Verified |
| **Production Build (`npm run build`)** | — | **21 Routes Compiled** | ✅ Verified |

For the complete defect-by-defect breakdown, review:
- 📄 **[StoryHour_Frontend_QA_Audit_Report.pdf](./StoryHour_Frontend_QA_Audit_Report.pdf)**
- 📝 **[frontend-qa-fix-report.md](./frontend-qa-fix-report.md)**

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17.0+ or v20.0.0+
- **npm**: v9.0.0+

### Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd storyhour-web
npm install
```

### Development Server
Run the local Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Verification Commands
Run the automated verification checks:
```bash
# Type check with TypeScript compiler
npx tsc --noEmit

# Run ESLint production checks
npm run lint

# Compile production build
npm run build

# Start production server
npm run start
```

---

## 📁 Project Structure

```text
├── docs/                             # Design and architecture specifications
├── public/                           # Optimized graphics, character art & sample audio
│   └── images/
│       └── characters/               # High-resolution handcrafted doll illustrations
├── src/
│   ├── app/                          # Next.js App Router pages & route metadata
│   │   ├── (auth)/                   # Authentication routes (/login, /signup)
│   │   ├── account/                  # Customer profile and digital library
│   │   ├── cart/                     # Shopping cart page
│   │   ├── checkout/                 # Accessible checkout with legal waivers
│   │   ├── contact/                  # Contact form with validation
│   │   ├── order-success/            # Order confirmation & access status
│   │   ├── privacy/                  # UK GDPR & ICO Children's Code privacy policy
│   │   ├── stories/                  # Interactive book catalogue & editions
│   │   ├── storytellers/             # Storyteller showcase & ensemble
│   │   ├── terms/                    # Commercial terms of use & digital cancellation
│   │   ├── trailers/                 # Video trailer showcase
│   │   ├── robots.ts                 # Dynamic robots.txt generator
│   │   └── sitemap.ts                # Dynamic XML sitemap generator
│   ├── components/                   # Core application components
│   │   ├── AudiobookModal.tsx        # Chapter selection & audio playback modal
│   │   ├── BookReader.tsx            # 3D interactive book reader with free preview
│   │   ├── CartDrawer.tsx            # Slide-out shopping cart drawer
│   │   ├── SearchModal.tsx           # Global search dialog (Ctrl+K / Cmd+K)
│   │   ├── SiteFooter.tsx            # Multi-column footer & character showcase
│   │   ├── SiteHeader.tsx            # Header navigation, live cart & search
│   │   └── new-design/               # Hero, storytelling scrolls & theater components
│   ├── context/                      # Global state providers
│   │   ├── AudioContext.tsx          # HTML5 audio playback and chapter state
│   │   └── LibraryCartContext.tsx    # Cart, orders & digital entitlement state
│   └── data/                         # Catalog datasets & multilingual edition text
├── .env.example                      # Environment variable template
├── .eslintrc.json                    # Production ESLint configuration
├── next.config.ts                    # Next.js configuration & CSP security headers
├── tailwind.config.ts                # Tailwind design system tokens
└── tsconfig.json                     # TypeScript configuration
```

---

## 🔒 Security & Privacy

- **Content Security Policy (CSP)**: Strictly scoped script, style, font, media, and connect directives.
- **Privacy Compliance**: Cookie consent management and privacy policies adhering to **UK GDPR** and the **ICO Age Appropriate Design Code (Children's Code)**.
- **Client Security**: No raw payment card information is retained; payment interfaces run in sandboxed test mode pending hosted Stripe/PayPal provider provisioning.

---

## 📄 License & Attribution

&copy; 2026 StoryHour Ltd. All rights reserved. Registered in England & Wales.
StoryHour illustrations and audio recordings are proprietary cultural works.
