# StoryHour design and build direction

## Purpose

Build StoryHour as a modern digital storytelling ecosystem for children, families, and parents.

The website should help people:

- Discover stories.
- Listen to stories.
- Read stories.
- Meet storytellers.
- Explore culture and context.
- Find experiences and events.
- Buy connected products.
- Save stories and return to them.

Stories are the center of the product. Every other area should connect back to a story, a storyteller, or a meaningful storytelling experience.

## Source of truth

Use these sources in this order:

1. `STORYHOUR_WEBSITE_SPEC.md` for product requirements and page structure.
2. The approved StoryHour logo for brand color and logo usage.
3. `StoryHour.pdf` for project context and supplied visual material.
4. This document for the visual system and implementation direction.

The client notes and reference screenshots are design direction. They do not replace the verified content, functionality, accessibility, or authenticity rules in the main specification.

## Recommended technology

### Language

Use **TypeScript**.

TypeScript is the recommended language because StoryHour needs reliable relationships between stories, storytellers, languages, audio, events, products, saved items, orders, bookings, and listening progress. Typed data models will reduce errors as the platform grows.

### Frontend

Use:

- React for reusable interface components.
- Next.js App Router for routing, metadata, server rendering, and SEO.
- CSS variables for design tokens.
- Tailwind CSS utilities only when they use the shared token system.
- Native HTML audio controls enhanced with accessible custom controls.
- Phosphor, Solar, or Iconamoon icons. Do not use emoji as interface icons.

### Content architecture

Keep content separate from presentation. The first version may use typed local data, but structure it so it can later connect to a CMS or API.

Core entities:

```text
Story
Storyteller
Experience
Event
JournalArticle
Product
Category
Language
Region
User
SavedItem
ListeningProgress
Order
Booking
```

## Brand direction

### Design concept

Use a modern editorial commerce direction:

- Literary and visual like a premium storybook.
- Clear and trustworthy for parents.
- Playful enough for children.
- Structured enough for search, audio, library, and checkout.
- Premium enough for cultural content and products.

Reference the visual qualities of the supplied Fable, SuperMush, Rarible, Shopify Editions, and Klarna examples. Do not copy their layouts, brand names, or assets.

### Brand colors

These values are working tokens derived from the supplied logo. Confirm final production values from the original logo asset before launch.

#### Primitive tokens

```css
:root {
  --color-story-red: #c9281d;
  --color-hour-blue: #2410a4;
  --color-deep-red: #8f1712;
  --color-ink: #050505;
  --color-paper: #faf8f3;
  --color-lavender: #eef0ff;
  --color-white: #ffffff;
  --color-muted-ink: #696572;
  --color-soft-border: #e8e4dc;
}
```

#### Semantic tokens

```css
:root {
  --surface-page: var(--color-paper);
  --surface-card: var(--color-white);
  --surface-soft: var(--color-lavender);
  --surface-dark: var(--color-ink);
  --surface-brand: var(--color-hour-blue);
  --surface-story: var(--color-story-red);

  --text-primary: var(--color-ink);
  --text-secondary: var(--color-muted-ink);
  --text-on-dark: var(--color-white);
  --text-on-brand: var(--color-white);

  --action-primary: var(--color-hour-blue);
  --action-primary-hover: #1b0c80;
  --action-story: var(--color-story-red);
  --border-subtle: var(--color-soft-border);
}
```

### Color rules

- Use blue for primary actions, navigation states, audio controls, and library actions.
- Use red for story highlights, featured labels, cultural accents, and emotional moments.
- Use black for premium story sections, audio player surfaces, footer, and high contrast content.
- Use paper as the main reading and discovery background.
- Use lavender for family discovery, filters, empty states, and secondary panels.
- Do not use red and blue at equal visual strength in every section.
- Do not add purple gradients, neon backgrounds, or unrelated colors.
- Keep color flat and intentional. Use image treatments for atmosphere instead of decorative gradients.

## Typography

Use one primary typeface across the site:

```text
Primary: Manrope
Fallback: ui-sans-serif, system-ui, sans-serif
Optional functional metadata: Geist Mono
```

Manrope should be used for navigation, body text, headings, buttons, cards, and display copy. Geist Mono is allowed only for durations, dates, playback time, order numbers, or other functional metadata.

### Type scale

Use the following Tailwind aligned scale:

| Role | Size | Weight | Use |
|---|---:|---:|---|
| Display | `text-7xl` | 600 | Featured story hero and major brand moments |
| H1 | `text-5xl` | 600 | Page headings |
| H2 | `text-4xl` | 600 | Section headings |
| H3 | `text-2xl` | 600 | Card and content headings |
| Body large | `text-lg` | 400 | Hero supporting copy |
| Body | `text-base` | 400 | Reading and interface content |
| Meta | `text-sm` | 500 | Language, duration, date, region |
| Caption | `text-xs` | 500 | Small labels and helper text |

Use sentence case. Apply `text-wrap: balance` to headings and `text-wrap: pretty` to paragraphs. Do not use ultra bold weights or italic interface text.

## Layout language

### Homepage composition

Use a long form story layout because StoryHour must introduce a broad ecosystem while giving visitors an immediate story to experience.

Recommended sequence:

1. Header and small announcement area when needed.
2. Featured story hero with `Listen now` as the primary action.
3. Trust signal for parents and families.
4. Story discovery by language, age, theme, region, or duration.
5. Featured story shelf.
6. Listening section with player preview.
7. Storyteller introduction.
8. Experiences and events.
9. Journal and cultural context.
10. Shop preview connected to stories.
11. Parent focused value and purchase reassurance.
12. Final invitation to discover another story.
13. Dark StoryHour footer.

### Page rhythm

- Alternate quiet paper sections with red, blue, lavender, and dark ink sections.
- Use full width image moments for featured stories, performances, and experiences.
- Use story artwork as content, not decoration.
- Use horizontal story shelves where discovery benefits from browsing.
- Use clean grids for library, shop, journal, and search results.
- Keep content aligned to a shared maximum width of approximately 1200px.
- Mobile layouts must be intentionally reorganized, not simply scaled down.

## Navigation

Primary navigation:

```text
Stories
Storytellers
Experiences
Events
Journal
Shop
```

Utility actions:

```text
Search
Library
Account
Cart
```

On mobile, use a compact header with search and library access visible. Move the remaining destinations into a clear menu or bottom navigation pattern. Never hide the main listening path behind multiple layers.

## Core components

### Story card

Must support:

- Cover image.
- Story title.
- Storyteller.
- Language.
- Region or theme when available.
- Duration when audio exists.
- Read or listen action.
- Save action when accounts exist.

States:

- Default.
- Hover.
- Focus.
- Playing.
- Saved.
- Loading.
- Unavailable audio.

### Audio player

Must support:

- Play and pause.
- Seek.
- Progress.
- Duration.
- Volume.
- Current title.
- Storyteller.
- Return to story.
- Resume playback.

Use a compact persistent player after playback begins. The full player should appear on the story detail page. Never show a play control when audio is unavailable.

### Storyteller card

Show the real person behind the story:

- Portrait.
- Name.
- Region.
- Language.
- Short introduction.
- Connected story.

### Trust strip

Use a Klarna inspired trust row, but only with verified StoryHour information. Examples of approved content types include:

- Available languages.
- Audio and reading formats.
- Family friendly access.
- Shipping or returns when verified.
- Real event or performance information.

Never invent listener counts, awards, reviews, testimonials, or partner logos.

### Product card

Must show:

- Real product image.
- Product name.
- Verified price.
- Format or language.
- Availability.
- Add to cart action.

Use story context above or beside the purchase action so the product does not feel disconnected from the storytelling ecosystem.

## Motion

Motion should make discovery feel continuous and calm.

- Use fade and upward reveal for sections entering the viewport.
- Use subtle cover scaling on hover.
- Animate the audio progress state smoothly.
- Use horizontal shelf movement only when the content is genuinely browseable.
- Use a fluid mobile menu with a visible open and close state.
- Respect `prefers-reduced-motion`.
- Use `IntersectionObserver` for scroll reveals.
- Avoid unbounded scroll listeners and decorative animation that delays reading.

## Accessibility

Build accessibility into every component:

- Semantic HTML.
- Keyboard navigation.
- Visible focus states.
- Minimum 44px touch targets.
- Accessible audio controls.
- Alt text for meaningful images.
- Proper heading order.
- Strong color contrast.
- Labels for icon-only actions.
- Clear form errors.
- Reduced motion support.
- No information conveyed by color alone.

## Content rules

- Use verified StoryHour content only.
- Never invent storytellers, stories, event dates, prices, reviews, locations, partners, awards, or cultural claims.
- Use visible development placeholders when real content is unavailable.
- Do not use empty filler sections to make pages longer.
- Every section needs a clear reason to exist.
- Every clickable element must have a real destination or action.
- Use parent focused value language without making unsupported educational or developmental claims.

## SEO and routes

Use the following route structure:

```text
/
/stories
/stories/[story-slug]
/storytellers
/storytellers/[storyteller-slug]
/experiences
/experiences/[experience-slug]
/events
/events/[event-slug]
/journal
/journal/[article-slug]
/shop
/shop/[product-slug]
/cart
/checkout
/library
/account
/about
/contact
/privacy
/terms
/cookies
/refunds
/cancellation
```

Every public story, storyteller, journal article, experience, event, and product needs a meaningful title, description, heading structure, social image, and canonical URL.

## Build order

1. Define typed content models and verified sample content.
2. Create primitive, semantic, and component design tokens.
3. Build the shared header, footer, buttons, cards, and audio player.
4. Build the homepage hero and featured story experience.
5. Build the Stories listing and Story detail page.
6. Build the persistent player and Library states.
7. Build Storytellers, Experiences, Events, and Journal.
8. Build Shop, Cart, and Checkout.
9. Build Account, About, Contact, and legal pages.
10. Test responsive behavior, accessibility, empty states, errors, and real navigation.

## Definition of done

- StoryHour feels like a storytelling destination, not a generic ecommerce site.
- The logo colors are used consistently.
- Visitors can reach a real story within one or two actions.
- Audio playback works and does not pretend unsupported content exists.
- Parents understand what StoryHour offers and why a product is worth considering.
- Children and families can discover by language, theme, and format.
- Every major page connects to related stories or storytellers.
- Search, save, library, cart, and checkout states are real.
- The interface works on desktop, tablet, and mobile.
- No fabricated production content is presented as factual.
