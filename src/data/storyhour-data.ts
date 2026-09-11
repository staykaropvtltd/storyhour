export interface Story {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  storyteller: string;
  language: "English" | "Hindi" | "Telugu" | "Multilingual";
  audience: "Children (5-8)" | "Young Listeners (9-12)" | "Families & All Ages";
  category: "Mythology & Epics" | "Folk Tales" | "Wisdom & Bravery" | "History & Culture";
  format: "Audiobook" | "Puppet Stories & Skits" | "Performance Skit";
  duration: string;
  durationMinutes: number;
  coverImage: string;
  audioPreviewUrl: string; // YouTube embed or audio stream
  sampleAudioAudioSrc?: string; // Direct audio fallback
  chaptersCount: number;
  description: string;
  featured?: boolean;
  culturalNote?: string;
}

export interface Storyteller {
  id: string;
  name: string;
  role: string;
  region: string;
  languages: string[];
  bio: string;
  portraitImage: string;
  performanceImage?: string;
  connectedStoryTitle: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  nativeTitle?: string;
  language: string;
  price: number;
  currency: string;
  coverImage: string;
  format: string;
  badge?: string;
  description: string;
  chaptersCount: number;
}

export interface Experience {
  id: string;
  title: string;
  type: string;
  location: string;
  host: string;
  image: string;
  description: string;
  badge: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  host: string;
  image: string;
  status: "Open for RSVP" | "Limited Seats" | "Registration Open";
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

export const STORIES: Story[] = [
  {
    id: "story-1",
    slug: "ramayana-english",
    title: "Ramayana — An Ancient Indian Epic",
    subtitle: "Complete Signature Narration",
    storyteller: "StoryHour Lead Performer & Ensemble",
    language: "English",
    audience: "Families & All Ages",
    category: "Mythology & Epics",
    format: "Audiobook",
    duration: "14h 20m",
    durationMinutes: 860,
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
    audioPreviewUrl: "https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1",
    chaptersCount: 40,
    description: "Experience the timeless epic of Rama, Sita, and Lakshmana through expressive performance-driven narration, authentic classical poetry, and evocative Indian acoustic instruments.",
    featured: true,
    culturalNote: "Based on the classical Adikavya of Sage Valmiki, adapted for clear intergenerational listening."
  },
  {
    id: "story-2",
    slug: "ramayan-hindi",
    title: "Ramayan — प्राचीन भारतीय महाकाव्य",
    subtitle: "सम्पूर्ण स्वरबद्ध कथावाचन",
    storyteller: "StoryHour मुख्य कथावाचक",
    language: "Hindi",
    audience: "Families & All Ages",
    category: "Mythology & Epics",
    format: "Audiobook",
    duration: "15h 10m",
    durationMinutes: 910,
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.30.26.jpeg",
    audioPreviewUrl: "https://www.youtube.com/embed/arzOYkbxwX8?autoplay=1",
    chaptersCount: 42,
    description: "मर्यादा पुरुषोत्तम भगवान श्री राम का अमर चरित्र, त्याग, धर्म और मानवीय मूल्यों की पावन गाथा — भावपूर्ण स्वर और पारंपरिक भारतीय संगीत के संगम के साथ।",
    featured: true,
    culturalNote: "हृदयस्पर्शी संवाद और प्रामाणिक सांस्कृतिक संदर्भों के साथ सम्पूर्ण परिवार के लिए।"
  },
  {
    id: "story-3",
    slug: "ramayanam-telugu",
    title: "Ramayanam — రామాయణం ప్రాచీన కావ్యం",
    subtitle: "పూర్తి శ్రవ్య రూపకం",
    storyteller: "StoryHour Telugu Ensemble",
    language: "Telugu",
    audience: "Families & All Ages",
    category: "Mythology & Epics",
    format: "Audiobook",
    duration: "13h 45m",
    durationMinutes: 825,
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.56.jpeg",
    audioPreviewUrl: "https://www.youtube.com/embed/gR3TuESZXos?autoplay=1",
    chaptersCount: 38,
    description: "శ్రీరాముని ధర్మమార్గం, సత్యపాలన మరియు సీతారాముల పవిత్ర బంధం — తేటతెలుగు పలుకులలో, హృదయాన్ని హత్తుకునే సంగీత నేపథ్యంతో.",
    featured: true,
    culturalNote: "సాంప్రదాయ విలువలను భావి తరాలకు అందించే విశిష్ట ఆడియో ప్రయాణం."
  },
  {
    id: "story-4",
    slug: "hanuman-leap",
    title: "Hanuman’s Mighty Leap Across the Ocean",
    subtitle: "The Power of Pure Devotion",
    storyteller: "StoryHour Puppet Troupe",
    language: "English",
    audience: "Children (5-8)",
    category: "Wisdom & Bravery",
    format: "Puppet Stories & Skits",
    duration: "24m",
    durationMinutes: 24,
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/Hanuman-2-1024x683.jpg",
    audioPreviewUrl: "https://www.youtube.com/embed/vcZeX0jPYg4?autoplay=1",
    chaptersCount: 3,
    description: "Discover how Hanuman conquered doubt and giant sea demons to reach Lanka, teaching children that quiet devotion and purpose can cross any ocean.",
    featured: false,
    culturalNote: "Accompanied by traditional live puppet gestures and percussive rhythm."
  },
  {
    id: "story-5",
    slug: "panchatantra-tales",
    title: "The Clever Hare & The Lion: Panchatantra",
    subtitle: "Wisdom Over Force",
    storyteller: "StoryHour Folk Narrator",
    language: "English",
    audience: "Children (5-8)",
    category: "Folk Tales",
    format: "Audiobook",
    duration: "16m",
    durationMinutes: 16,
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/Grand-Finale-5-scaled.jpg",
    audioPreviewUrl: "https://www.youtube.com/embed/1otr4iUMGbU?autoplay=1",
    chaptersCount: 2,
    description: "When the proud king of the jungle demands daily sacrifice, a tiny rabbit uses intellect and the illusion of a well to save every forest creature.",
    featured: false,
    culturalNote: "From ancient India's premier compendium of moral and political fables."
  },
  {
    id: "story-6",
    slug: "stories-of-freedom-gandhi",
    title: "Stories of Truth: Young Mohandas",
    subtitle: "Lessons in Conscience & Heritage",
    storyteller: "StoryHour History Ensemble",
    language: "Multilingual",
    audience: "Young Listeners (9-12)",
    category: "History & Culture",
    format: "Performance Skit",
    duration: "28m",
    durationMinutes: 28,
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/Gandhi-Prayers-STudents-1024x683.jpg",
    audioPreviewUrl: "https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1",
    chaptersCount: 4,
    description: "How a young student grappled with truth, confession, and moral courage before leading a nation through the power of peaceful conviction.",
    featured: false,
    culturalNote: "Performed with youth drama students across Kendriya Vidyalaya and UK schools."
  }
];

export const PRODUCTS: Product[] = [
  {
    id: "prod-hindi-ramayan",
    slug: "ramayan-hindi-audiobook",
    title: "Ramayan (Hindi Audiobook)",
    nativeTitle: "प्राचीन भारतीय महाकाव्य",
    language: "Hindi",
    price: 74.99,
    currency: "$",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.30.26.jpeg",
    format: "Complete 42-Chapter Digital Audiobook",
    badge: "Bestseller",
    description: "Complete studio recording in expressive Hindi narration with ambient Indian instruments. Lifetime personal library access and offline listening.",
    chaptersCount: 42
  },
  {
    id: "prod-english-ramayana",
    slug: "ramayana-english-audiobook",
    title: "Ramayana (English Audiobook)",
    nativeTitle: "An Ancient Indian Epic",
    language: "English",
    price: 84.99,
    currency: "$",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
    format: "Complete 40-Chapter Digital Audiobook",
    badge: "Signature Release",
    description: "The definitive English oral epic rendition. Soulful voice modulation, historical context, and atmospheric sound design for global families.",
    chaptersCount: 40
  },
  {
    id: "prod-telugu-ramayanam",
    slug: "ramayanam-telugu-audiobook",
    title: "Ramayanam (Telugu Audiobook)",
    nativeTitle: "శ్రీరామాయణం ప్రాచీన కావ్యం",
    language: "Telugu",
    price: 64.99,
    currency: "$",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.56.jpeg",
    format: "Complete 38-Chapter Digital Audiobook",
    badge: "Popular in Telugu Diaspora",
    description: "Masterful classical Telugu narration preserving the cadence, emotional depth, and devotion of the legendary Valmiki and Ranganatha Ramayana.",
    chaptersCount: 38
  }
];

export const STORYTELLERS: Storyteller[] = [
  {
    id: "storyteller-1",
    name: "Lead Storyteller & Artistic Director",
    role: "Founder, Performer & Narrator",
    region: "London, UK & Hyderabad, India",
    languages: ["Hindi", "English", "Telugu"],
    bio: "With decades of theatrical performance, puppet storytelling, and cultural education across India and the United Kingdom, bringing epic mythology and oral heritage to young minds through authentic voice modulation and physical theatre.",
    portraitImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.23.29-1.jpeg",
    performanceImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.23.21.jpeg",
    connectedStoryTitle: "Ramayana Epic Triology"
  },
  {
    id: "storyteller-2",
    name: "Writers & Sanskrit Researchers",
    role: "Textual Authenticity & Cultural Adaptation",
    region: "Varanasi & Bengaluru, India",
    languages: ["Sanskrit", "Hindi", "English"],
    bio: "Scholars ensuring that character motivations, philosophical nuances, and poetic meters from Valmiki and Tulsidas are faithfully respected while remaining engaging for contemporary children.",
    portraitImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.23.27-1.jpeg",
    connectedStoryTitle: "Panchatantra & Epic Legends"
  },
  {
    id: "storyteller-3",
    name: "Music & Acoustic Sound Ensemble",
    role: "Original Traditional Instrumentation",
    region: "London & Chennai",
    languages: ["Acoustic Soundscapes"],
    bio: "Master instrumentalists playing acoustic sarod, flute, veena, and pakhavaj. Every scene is scored organically to evoke the warmth of an ancient evening storytelling circle around an oil lamp.",
    portraitImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.23.24-1-1.jpeg",
    connectedStoryTitle: "Atmospheric Soundscapes"
  }
];

export const EXPERIENCES: Experience[] = [
  {
    id: "exp-1",
    title: "School Puppet & Skit Residencies",
    type: "Live Performance & Workshop",
    location: "Spanish School London & UK Primary Schools",
    host: "StoryHour Performer Troupe",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/SpanishSchool-London-1-1024x1024.jpeg",
    description: "Interactive theatre bringing mythological epics and folk fables directly to children through handcrafted marionettes, live voice narration, and active student participation.",
    badge: "Schools & Community"
  },
  {
    id: "exp-2",
    title: "Traditional Puppet Drama Masterclasses",
    type: "Hands-on Cultural Workshop",
    location: "Kendriya Vidyalaya Uppal & Heritage Spaces",
    host: "Master Indian Puppeteers",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/KV-Uppal-1024x768.jpeg",
    description: "Children learn the ancient craft of string manipulation, voice projection, and shadow play while discovering the rich folklore behind every carved wooden figurine.",
    badge: "Hands-On Workshop"
  }
];

export const UPCOMING_EVENTS: EventItem[] = [
  {
    id: "event-1",
    title: "Autumn Ramayana Listening Circle & Puppet Showcase",
    date: "Saturday, 24 October 2026",
    time: "4:30 PM BST (UK) / 9:00 PM IST (India)",
    location: "St. John's Cultural Hall, London + Global Stream",
    host: "StoryHour Lead Performer",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/Grand-Finale-5-scaled.jpg",
    status: "Open for RSVP"
  },
  {
    id: "event-2",
    title: "Diwali Special: Hanuman’s Voyage & Family Story Hour",
    date: "Sunday, 08 November 2026",
    time: "3:00 PM BST / 8:30 PM IST",
    location: "Community Heritage Centre, London",
    host: "StoryHour Ensemble",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/Hanuman-2-1024x683.jpg",
    status: "Limited Seats"
  }
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: "art-1",
    slug: "ramayana-modern-children",
    title: "Why the Ramayana Still Speaks to Modern Children: Timeless Values in a Digital World",
    excerpt: "Ancient epics are not distant myths; they are mirrors of brotherhood, justice, empathy, and resilience. How oral storytelling transforms classical stories into lifelong moral compasses.",
    category: "Cultural Parenting",
    author: "StoryHour Editorial Team",
    date: "28 August 2026",
    readTime: "6 min read",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/Lighting-The-Lamp-3-1024x683.jpg",
    featured: true
  },
  {
    id: "art-2",
    slug: "art-of-indian-puppetry",
    title: "The Vanishing Art of Kathputli: Preserving Tactile Magic for the Screen-Free Generation",
    excerpt: "Before digital screens, painted wooden figures on string held village squares spellbound. Why reviving tactile puppet performance sparks children's imagination like nothing else.",
    category: "Heritage Arts",
    author: "Folk Arts Archive",
    date: "14 August 2026",
    readTime: "4 min read",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/Grand-Finale-5-scaled.jpg",
    featured: false
  },
  {
    id: "art-3",
    slug: "multilingual-storytelling-benefits",
    title: "The Multilingual Ear: How Hearing Stories in Mother Tongues Strengthens Identity",
    excerpt: "Listening to Hindi, Telugu, and English stories side-by-side nurtures cognitive agility, familial bonds, and authentic pride in Indian heritage for children growing up abroad.",
    category: "Language & Identity",
    author: "Linguistic Heritage Research",
    date: "02 August 2026",
    readTime: "5 min read",
    image: "https://storyhour.co.uk/wp-content/uploads/2026/01/Gandhi-Prayers-STudents-1024x683.jpg",
    featured: false
  }
];

export const TESTIMONIAL = {
  quote: "The research is commendable, and the ability to present a long and complex story in simple language is truly engaging. These stories make history and mythology accessible, meaningful, and memorable for listeners of all ages.",
  author: "Dr. Shashi Tharoor",
  credentials: "Author · Historian · Parliamentarian",
  image: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.30.26-1-1.jpeg"
};

export const TRUST_METRICS = [
  { label: "Cultural Heritage", value: "Indian Epics & Lore", description: "Faithfully researched narratives" },
  { label: "Triple Language", value: "Hindi · English · Telugu", description: "Mother tongue immersion" },
  { label: "Live Impact", value: "India & UK Stage", description: "Schools, theatres & cultural halls" },
  { label: "Screen-Free", value: "Audio-First Ecosystem", description: "Calm, focused bedtime listening" }
];
