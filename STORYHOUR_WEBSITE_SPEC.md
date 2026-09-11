# STORYHOUR WEBSITE SPECIFICATION

## Product, Website Purpose, Pages, Content & Functionality

> This document defines **what the StoryHour website is**, what it
> should contain, how users should move through it, and what each part
> of the platform is supposed to do.
>
> It is **not a visual design system**. Do not use this document to
> invent fonts, colors, gradients, spacing systems, or arbitrary visual
> styles.

------------------------------------------------------------------------

# 1. WHAT IS STORYHOUR?

StoryHour is a digital platform centered around **stories and
storytelling**.

The website should bring together the different parts of a storytelling
ecosystem in one place:

-   Discovering stories
-   Reading stories
-   Listening to stories
-   Discovering storytellers
-   Exploring cultural experiences
-   Finding storytelling events
-   Reading editorial/journal content
-   Purchasing story-related products
-   Saving and continuing stories
-   Building a personal library

The website should feel like a **destination for stories**, rather than
a website that simply lists content.

The core idea is:

> **Stories are the product, the experience, and the reason people
> return.**

Everything on the website should support discovery, engagement,
listening, reading, participation, or deeper exploration.

------------------------------------------------------------------------

# 2. WHAT THE WEBSITE IS NOT

Do not treat StoryHour as:

-   A generic SaaS website
-   An AI product landing page
-   A simple blog
-   A news website
-   A basic ecommerce store
-   A social-media clone
-   A generic content-management website
-   A collection of unrelated pages

The different sections must feel like parts of **one storytelling
platform**.

------------------------------------------------------------------------

# 3. PRIMARY WEBSITE GOALS

The website should help visitors:

1.  Discover a story quickly.
2.  Understand what StoryHour offers.
3.  Start listening or reading.
4.  Discover the person behind a story.
5.  Explore stories by topic, place, language, or type.
6.  Discover real-world storytelling experiences.
7.  Find upcoming storytelling events.
8.  Explore editorial content.
9.  Purchase relevant products.
10. Save stories and return later.
11. Build a long-term relationship with StoryHour.

------------------------------------------------------------------------

# 4. PRIMARY USER TYPES

## 4.1 Story Explorer

A visitor who simply wants to discover something interesting.

They should be able to:

-   Browse featured stories
-   Search
-   Filter
-   Read
-   Listen
-   Discover related stories

------------------------------------------------------------------------

## 4.2 Listener

A user primarily interested in audio.

They should be able to:

-   Play stories
-   Pause/resume
-   Continue listening
-   See duration/progress
-   Save stories
-   Discover more stories
-   Access listening history

------------------------------------------------------------------------

## 4.3 Reader

A user interested in written stories and editorial content.

They should be able to:

-   Read stories
-   Browse categories
-   Save stories/articles
-   Discover related content
-   Continue reading later

------------------------------------------------------------------------

## 4.4 Experience Seeker

A user interested in participating in storytelling beyond the screen.

They should be able to:

-   Discover experiences
-   View details
-   Understand location/date/duration
-   Learn about hosts/storytellers
-   Book or register where applicable

------------------------------------------------------------------------

## 4.5 Event Visitor

A user looking for storytelling events.

They should be able to:

-   Browse upcoming events
-   Filter events
-   View event details
-   Understand date/time/location
-   Register or purchase tickets where applicable

------------------------------------------------------------------------

## 4.6 Shopper

A visitor interested in products connected to StoryHour.

They should be able to:

-   Browse products
-   View product details
-   Add products to cart
-   Checkout
-   View orders

------------------------------------------------------------------------

# 5. CORE WEBSITE STRUCTURE

The main website should contain these areas:

``` text
HOME
│
├── STORIES
│   └── STORY DETAIL
│
├── STORYTELLERS
│   └── STORYTELLER PROFILE
│
├── EXPERIENCES
│   └── EXPERIENCE DETAIL
│
├── EVENTS
│   └── EVENT DETAIL
│
├── JOURNAL
│   └── ARTICLE DETAIL
│
├── SHOP
│   └── PRODUCT DETAIL
│
├── CART
│
├── CHECKOUT
│
├── LIBRARY
│
├── ACCOUNT
│
├── ABOUT
│
└── CONTACT
```

Supporting/legal pages:

``` text
PRIVACY POLICY
TERMS OF SERVICE
COOKIE POLICY
COOKIE PREFERENCES
REFUND POLICY
CANCELLATION POLICY
```

------------------------------------------------------------------------

# 6. HOME PAGE

The homepage is the main entry point.

Its job is **not** to explain every feature immediately.

Its job is to make someone understand:

> What is StoryHour?
>
> Why should I care?
>
> What story can I experience right now?

## Homepage content flow

### Section 1 --- Introduction

Immediately communicate the StoryHour proposition.

The visitor should understand that this is a storytelling platform.

Primary actions can lead to:

-   Explore Stories
-   Start Listening
-   Explore Experiences

------------------------------------------------------------------------

### Section 2 --- Featured Stories

Show selected stories.

Each item may contain:

-   Story title
-   Image
-   Short description
-   Story type/category
-   Storyteller
-   Language
-   Region
-   Duration
-   Listen/read action

The purpose is to create immediate discovery.

------------------------------------------------------------------------

### Section 3 --- Story Discovery

Help visitors explore the larger collection.

Possible discovery dimensions:

-   Region
-   Language
-   Genre
-   Theme
-   Era
-   Storyteller
-   Duration

The actual available categories should come from real StoryHour content.

Do not invent categories just to fill space.

------------------------------------------------------------------------

### Section 4 --- Listening

Show that stories can be experienced through audio.

Possible information:

-   Story artwork
-   Story title
-   Storyteller
-   Duration
-   Play button
-   Progress
-   Continue listening

A persistent/minimized player can be used after a user starts listening.

------------------------------------------------------------------------

### Section 5 --- Storytellers

Introduce the humans behind the stories.

Show selected storytellers with:

-   Portrait
-   Name
-   Region
-   Language
-   Short introduction
-   Featured story

Link to their full profile.

------------------------------------------------------------------------

### Section 6 --- Experiences

Introduce real-world or interactive storytelling experiences.

Show:

-   Experience
-   Location
-   Short description
-   Host/storyteller
-   Duration
-   Date/availability where relevant

CTA:

**Explore Experiences**

------------------------------------------------------------------------

### Section 7 --- Events

Show upcoming storytelling events.

Include:

-   Event
-   Date
-   Location
-   Short description
-   Registration/ticket CTA

------------------------------------------------------------------------

### Section 8 --- Journal

Show editorial content.

Examples:

-   Interviews
-   Essays
-   Story background
-   Cultural articles
-   Storyteller conversations
-   Behind-the-story pieces

------------------------------------------------------------------------

### Section 9 --- Shop

Introduce StoryHour's shop without making the entire website feel like
an ecommerce marketplace.

Show selected products and provide a route to the full shop.

------------------------------------------------------------------------

### Section 10 --- About / Mission

Explain why StoryHour exists.

Focus on:

-   Stories
-   Storytelling
-   People
-   Culture
-   Preservation
-   Discovery
-   Community

Use verified information only.

------------------------------------------------------------------------

### Section 11 --- Final Invitation

Give visitors a clear next step.

Possible actions:

-   Explore Stories
-   Start Listening
-   Meet Storytellers
-   Explore Experiences

The final section should feel like an invitation into the StoryHour
world.

------------------------------------------------------------------------

# 7. STORIES

The Stories section is the main content library.

## Purpose

Allow users to discover the full collection.

## Required functionality

-   Search
-   Categories
-   Filters
-   Story cards/list
-   Featured stories
-   Pagination or appropriate loading
-   Audio indicators
-   Saved/bookmarked state where accounts exist

## Story metadata

Where available:

-   Title
-   Description
-   Storyteller
-   Language
-   Region
-   Category
-   Duration
-   Publication date
-   Audio availability

------------------------------------------------------------------------

# 8. STORY DETAIL

This is the actual story consumption page.

## Required content

-   Story title
-   Hero/cover media
-   Storyteller
-   Region
-   Language
-   Category
-   Duration
-   Audio player when available
-   Story description
-   Full story/content
-   Related stories
-   Storyteller information
-   Save/share actions

## User experience

A visitor should be able to:

1.  Understand what the story is.
2.  Identify who tells it.
3.  Start listening or reading.
4.  Continue consuming the story without distraction.
5.  Discover what to experience next.

Related content should be genuinely relevant.

------------------------------------------------------------------------

# 9. AUDIO / LISTENING SYSTEM

Audio is a major part of the StoryHour experience.

## Player should support

-   Play
-   Pause
-   Seek
-   Progress
-   Duration
-   Volume
-   Playback state
-   Resume playback where possible

## Persistent player

Once a user begins listening, the player can remain accessible while
navigating.

It should allow the user to:

-   Continue playback
-   Pause
-   Return to the story
-   See what is currently playing

## Library integration

For logged-in users:

-   Recently played
-   Continue listening
-   Saved stories

Never pretend audio exists when a story has no audio.

------------------------------------------------------------------------

# 10. STORYTELLERS

This section represents the people who tell or contribute stories.

## Directory

Allow users to browse storytellers.

Information can include:

-   Name
-   Portrait
-   Region
-   Language
-   Biography
-   Story count
-   Featured story

## Storyteller profile

Include:

-   Large profile introduction
-   Biography
-   Storytelling background
-   Region
-   Languages
-   Stories
-   Audio
-   Related experiences
-   Related events

The profile should connect the storyteller to their actual work on
StoryHour.

------------------------------------------------------------------------

# 11. EXPERIENCES

Experiences represent storytelling beyond simply reading/listening
online.

Examples may include:

-   Live storytelling
-   Workshops
-   Cultural experiences
-   Story walks
-   Hosted sessions
-   Community experiences

Only include experiences that actually exist.

## Experience listing

Show:

-   Name
-   Image
-   Location
-   Duration
-   Type
-   Short description
-   Price when applicable
-   Availability
-   CTA

## Experience detail

Include:

-   Overview
-   Gallery
-   Story/context
-   Host/storyteller
-   Location
-   Schedule
-   Duration
-   What's included
-   Requirements when relevant
-   Price
-   Booking/registration action

------------------------------------------------------------------------

# 12. EVENTS

Events are time-based storytelling activities.

## Events listing

Include:

-   Upcoming events
-   Past events
-   Date
-   Location
-   Event type
-   Search/filter where useful

## Event detail

Include:

-   Event title
-   Hero media
-   Date
-   Time
-   Location
-   Description
-   Storytellers/speakers
-   Schedule
-   Ticket/registration information
-   CTA
-   Related events

------------------------------------------------------------------------

# 13. JOURNAL

The Journal is StoryHour's editorial publication area.

It can contain:

-   Articles
-   Interviews
-   Essays
-   Cultural stories
-   Storyteller conversations
-   Behind-the-scenes content
-   Recommendations
-   Announcements

## Article listing

Show:

-   Featured article
-   Latest articles
-   Categories
-   Author
-   Date
-   Reading time

## Article detail

Include:

-   Title
-   Author
-   Date
-   Reading time
-   Hero image
-   Article content
-   Images where relevant
-   Pull quotes where appropriate
-   Related stories
-   Related articles
-   Author information

------------------------------------------------------------------------

# 14. SHOP

The Shop is a commerce section connected to StoryHour.

It should support products that genuinely fit the StoryHour ecosystem.

Possible categories may include:

-   Books
-   Story collections
-   Prints
-   Merchandise
-   Cultural/story-related objects

Do not invent products.

## Product listing

Show:

-   Product image
-   Name
-   Price
-   Availability
-   Short description
-   Category

## Product detail

Include:

-   Gallery
-   Product name
-   Price
-   Description
-   Product details
-   Availability
-   Quantity
-   Add to cart
-   Related products

------------------------------------------------------------------------

# 15. CART

The cart should allow users to review purchases.

Include:

-   Product
-   Quantity
-   Price
-   Remove
-   Subtotal
-   Shipping information where applicable
-   Checkout CTA

Cart state should persist appropriately.

------------------------------------------------------------------------

# 16. CHECKOUT

Checkout should be simple and trustworthy.

Include:

-   Contact information
-   Delivery information
-   Payment
-   Order summary
-   Total
-   Confirmation

Do not add unnecessary content during checkout.

------------------------------------------------------------------------

# 17. LIBRARY

The Library is the user's personal StoryHour space.

Possible sections:

### Continue Listening

Stories the user has started but not finished.

### Recently Played

Recently consumed audio.

### Saved Stories

Stories bookmarked by the user.

### Saved Articles

Saved Journal content.

### Purchases

Purchased digital/physical content where applicable.

### Bookings

Experiences/events booked by the user.

The Library should answer:

> "What was I doing on StoryHour, and where can I continue?"

------------------------------------------------------------------------

# 18. ACCOUNT

Account functionality can include:

-   Profile
-   Email
-   Password/security
-   Preferences
-   Saved content
-   Listening history
-   Orders
-   Bookings
-   Logout

Keep account functionality separate from content discovery.

------------------------------------------------------------------------

# 19. SEARCH

Search should work across the StoryHour ecosystem.

Search targets:

-   Stories
-   Storytellers
-   Journal
-   Experiences
-   Events
-   Products

Search results should clearly identify what type of content was found.

Example:

``` text
Stories
Storytellers
Journal
Experiences
Events
Shop
```

## No-result behavior

Never leave users with a blank page.

Explain that nothing matched and provide useful alternatives such as
categories or featured content.

------------------------------------------------------------------------

# 20. DISCOVERY & RELATED CONTENT

StoryHour should encourage users to move naturally from one piece of
content to another.

Examples:

``` text
Story
 ↓
Storyteller
 ↓
Other stories by storyteller
 ↓
Related story
 ↓
Experience
 ↓
Event
```

Another path:

``` text
Journal article
 ↓
Referenced story
 ↓
Storyteller
 ↓
Related stories
```

Related content must be based on meaningful relationships, not random
recommendations.

------------------------------------------------------------------------

# 21. USER JOURNEYS

## Journey A --- First-time visitor

``` text
Home
 ↓
Featured Story
 ↓
Story Detail
 ↓
Listen
 ↓
Related Story
 ↓
Create Account / Save
```

------------------------------------------------------------------------

## Journey B --- Story discovery

``` text
Stories
 ↓
Search / Filter
 ↓
Story
 ↓
Listen / Read
 ↓
Storyteller
```

------------------------------------------------------------------------

## Journey C --- Experience

``` text
Home
 ↓
Experiences
 ↓
Experience Detail
 ↓
Host / Storyteller
 ↓
Booking
```

------------------------------------------------------------------------

## Journey D --- Event

``` text
Home
 ↓
Events
 ↓
Event Detail
 ↓
Registration / Ticket
```

------------------------------------------------------------------------

## Journey E --- Returning listener

``` text
Login
 ↓
Library
 ↓
Continue Listening
 ↓
Story
```

------------------------------------------------------------------------

## Journey F --- Shopper

``` text
Shop
 ↓
Product
 ↓
Cart
 ↓
Checkout
 ↓
Order Confirmation
```

------------------------------------------------------------------------

# 22. ABOUT

The About page should explain StoryHour as an organization/platform.

Possible sections:

-   What StoryHour is
-   Mission
-   Why storytelling matters
-   What StoryHour is building
-   People/community
-   Storytelling philosophy
-   Contact/next step

Only use verified information.

Do not manufacture history, achievements, partnerships, statistics, or
cultural claims.

------------------------------------------------------------------------

# 23. CONTACT

The Contact page should make communication easy.

Possible categories:

-   General enquiries
-   Partnerships
-   Storytellers
-   Experiences
-   Events
-   Press
-   Support

Include a functional contact form if the backend supports it.

------------------------------------------------------------------------

# 24. LEGAL PAGES

The website should provide:

-   Privacy Policy
-   Terms of Service
-   Cookie Policy
-   Cookie Preferences
-   Refund Policy
-   Cancellation Policy

These pages should contain actual applicable legal content.

Do not use fake legal language merely to make the page look complete.

------------------------------------------------------------------------

# 25. CONTENT MANAGEMENT

The system should conceptually support content entities such as:

``` text
Story
Storyteller
Experience
Event
Journal Article
Product
Category
Region
Language
User
Order
Booking
Saved Item
Listening Progress
```

Relationships should be possible.

Example:

``` text
Story
 ├── Storyteller
 ├── Category
 ├── Region
 ├── Language
 ├── Audio
 └── Related Stories
```

------------------------------------------------------------------------

# 26. CONTENT AUTHENTICITY

This is critical.

Never invent:

-   Storytellers
-   Stories
-   Cultural facts
-   Locations
-   Event dates
-   Prices
-   Testimonials
-   Partnerships
-   Awards
-   Statistics
-   Reviews
-   Product information

If real information is unavailable, use a clearly identifiable
placeholder during development.

Production content must come from verified StoryHour sources.

------------------------------------------------------------------------

# 27. FUNCTIONALITY PRINCIPLE

Every visible interactive element must have a real purpose.

If something looks clickable, it should behave like it is clickable.

Examples:

-   Search must search.
-   Play must play.
-   Save must save.
-   Cart must update.
-   Checkout must work.
-   Filters must filter.
-   Events must display accurate information.
-   Bookings must actually connect to the booking process.
-   Forms must validate.
-   Navigation must work.

Do not build fake interactions just to make a prototype appear finished.

------------------------------------------------------------------------

# 28. RESPONSIVE WEBSITE BEHAVIOR

The website must work across:

-   Desktop
-   Laptop
-   Tablet
-   Mobile

The content hierarchy must remain understandable at every size.

Mobile is not simply a compressed desktop version.

Important mobile considerations:

-   Navigation
-   Story reading
-   Audio playback
-   Search
-   Filters
-   Cards
-   Event information
-   Booking
-   Checkout
-   Touch interactions

------------------------------------------------------------------------

# 29. ACCESSIBILITY

The website should support:

-   Keyboard navigation
-   Screen readers
-   Semantic HTML
-   Accessible forms
-   Accessible audio controls
-   Clear focus states
-   Alt text
-   Proper heading hierarchy
-   Sufficient contrast
-   Reduced motion preferences

Accessibility should be part of implementation, not a final patch.

------------------------------------------------------------------------

# 30. SEO / DISCOVERABILITY

Important content should be discoverable through search engines.

Each public content page should have appropriate:

-   Page title
-   Description
-   URL
-   Heading structure
-   Image metadata
-   Social sharing metadata
-   Structured data where appropriate

Stories, storytellers, journal articles, experiences, and events should
have meaningful individual URLs.

------------------------------------------------------------------------

# 31. URL STRUCTURE

Recommended structure:

``` text
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

------------------------------------------------------------------------

# 32. WEBSITE HIERARCHY

The most important hierarchy is:

``` text
STORY
  ↓
STORYTELLER
  ↓
STORY COLLECTION
  ↓
EXPERIENCE / EVENT
  ↓
JOURNAL / DEEPER CONTEXT
  ↓
SHOP / EXTENDED ECOSYSTEM
```

The story should remain the center of the ecosystem.

------------------------------------------------------------------------

# 33. WHAT THE WEBSITE SHOULD MAKE PEOPLE DO

The website should naturally encourage visitors to:

**Discover → Listen/Read → Explore → Connect → Return**

Not:

**Land → Read marketing copy → Leave**

The platform should create repeat discovery.

------------------------------------------------------------------------

# 34. FINAL PRODUCT DEFINITION

StoryHour is best understood as:

> **A digital storytelling ecosystem where people can discover, listen
> to, read, explore, and experience stories, while discovering the
> storytellers, culture, events, experiences, editorial content, and
> products connected to those stories.**

The website should therefore be built as a **content-rich storytelling
platform**, not merely a marketing homepage.

Every feature and page should reinforce the same central idea:

> **Put stories and the people who tell them at the center.**

------------------------------------------------------------------------

# 35. INSTRUCTION TO AI DEVELOPMENT AGENTS

When working on StoryHour:

1.  Read this document before making structural decisions.
2.  Understand the purpose of the page before designing it.
3.  Preserve the relationship between stories, storytellers,
    experiences, events, and journal content.
4.  Do not invent real-world content.
5.  Do not add features merely because they are common on other
    websites.
6.  Do not remove important functionality without a reason.
7.  Reuse real content and existing project data where available.
8.  Keep every page connected to the wider StoryHour ecosystem.
9.  Make all interactive functionality real.
10. Treat stories as the central product.
11. Keep the website easy to explore.
12. Ensure users always have a meaningful next step.
13. Verify content before presenting it as fact.
14. Do not turn StoryHour into a generic SaaS or ecommerce template.
15. When requirements are unclear, inspect existing StoryHour
    content/project files before inventing an answer.

## Core rule

**Do not design a website around what looks impressive. Design StoryHour
around what a person needs to discover and experience stories.**
