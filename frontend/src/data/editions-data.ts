export interface Edition {
  id: string;
  year: string;
  season: string;
  codeName: string;
  title: string;
  nativeTitle?: string;
  subtitle: string;
  language: "English" | "Hindi" | "Telugu" | "Multilingual";
  bookFormat: string;
  category: string;
  pagesCount: number;
  chaptersCount: number;
  duration: string;
  coverImage: string;
  badge?: string;
  isFeatured?: boolean;
  isNowPlaying?: boolean;
  description: string;
  audioPreviewUrl: string;
  storyteller: string;
  price: number;
  productId?: string;
  culturalNote?: string;
  accentColor: string;
}

export interface AudiobookTrack {
  id: number;
  title: string;
  duration: string;
}

export interface Audiobook {
  id: string;
  title: string;
  nativeTitle?: string;
  subtitle: string;
  narrator: string;
  storyteller: string;
  language: "English" | "Hindi" | "Telugu" | "Multilingual";
  duration: string;
  chaptersCount: number;
  price: number;
  cdArtwork: string;
  category: string;
  year: string;
  season: string;
  badge?: string;
  description: string;
  culturalNote?: string;
  audioPreviewUrl?: string;
  accentColor?: string;
  tracks: AudiobookTrack[];
}

export const EDITIONS: Edition[] = [
  // ── Top Shelf (4 Masterpieces) ──
  {
    id: "ed-spring-2026",
    year: "2026",
    season: "Spring",
    codeName: "Everywhere",
    title: "Ramayana — Valmiki's Epic",
    subtitle: "Complete Signature Narration in English",
    language: "English",
    bookFormat: "Hardcover Edition",
    category: "Ancient Epic",
    pagesCount: 384,
    chaptersCount: 40,
    duration: "14h 20m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
    badge: "SPECIAL EDITION",
    isFeatured: true,
    description: "Experience the timeless epic of Rama, Sita, and Lakshmana through expressive performance-driven narration, authentic classical poetry, and evocative Indian acoustic instruments.",
    audioPreviewUrl: "https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1",
    storyteller: "StoryHour Lead Performer & Ensemble",
    price: 84.99,
    productId: "prod-english-ramayana",
    culturalNote: "Based on the classical Adikavya of Sage Valmiki, adapted for clear intergenerational listening.",
    accentColor: "#C9281D",
  },
  {
    id: "ed-winter-2026",
    year: "2026",
    season: "Winter",
    codeName: "Renaissance",
    title: "सम्पूर्ण रामायण",
    nativeTitle: "प्राचीन भारतीय महाकाव्य",
    subtitle: "सम्पूर्ण स्वरबद्ध कथावाचन — शास्त्रीय हिन्दी",
    language: "Hindi",
    bookFormat: "Hardcover Volume",
    category: "Classical Epic",
    pagesCount: 416,
    chaptersCount: 42,
    duration: "15h 10m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.30.26.jpeg",
    badge: "BESTSELLER",
    description: "मर्यादा पुरुषोत्तम भगवान श्री राम का अमर चरित्र, त्याग, धर्म और मानवीय मूल्यों की पावन गाथा — भावपूर्ण स्वर और पारंपरिक भारतीय संगीत के संगम के साथ।",
    audioPreviewUrl: "https://www.youtube.com/embed/arzOYkbxwX8?autoplay=1",
    storyteller: "StoryHour मुख्य कथावाचक",
    price: 74.99,
    productId: "prod-hindi-ramayan",
    culturalNote: "हृदयस्पर्शी संवाद और प्रामाणिक सांस्कृतिक संदर्भों के साथ सम्पूर्ण परिवार के लिए।",
    accentColor: "#C9281D",
  },
  {
    id: "ed-summer-2025",
    year: "2025",
    season: "Summer",
    codeName: "Horizons",
    title: "శ్రీరామాయణం ప్రాచీన కావ్యం",
    nativeTitle: "దివ్య కావ్యం — శ్రవ్య రూపకం",
    subtitle: "Classical Telugu Oral Tradition & Melody",
    language: "Telugu",
    bookFormat: "Heritage Folio",
    category: "Sacred Lore",
    pagesCount: 360,
    chaptersCount: 38,
    duration: "13h 45m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.56.jpeg",
    badge: "HERITAGE",
    description: "శ్రీరాముని ధర్మమార్గం, సత్యపాలన మరియు సీతారాముల పవిత్ర బంధం — తేటతెలుగు పలుకులలో, హృదయాన్ని హత్తుకునే సంగీత నేపథ్యంతో.",
    audioPreviewUrl: "https://www.youtube.com/embed/gR3TuESZXos?autoplay=1",
    storyteller: "StoryHour Telugu Ensemble",
    price: 64.99,
    productId: "prod-telugu-ramayanam",
    culturalNote: "సాంప్రదాయ విలువలను భావి తరాలకు అందించే విశిష్ట ఆడియో ప్రయాణం.",
    accentColor: "#064C37",
  },
  {
    id: "ed-winter-2025",
    year: "2025",
    season: "Winter",
    codeName: "Devotion",
    title: "Hanuman’s Mighty Leap",
    subtitle: "Sundarakanda & Pure Devotion Across The Ocean",
    language: "English",
    bookFormat: "Illustrated Folio",
    category: "Sundarakanda",
    pagesCount: 144,
    chaptersCount: 12,
    duration: "1h 45m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/Hanuman-2-1024x683.jpg",
    badge: "PERFORMANCE",
    description: "Discover how Hanuman conquered doubt and giant sea demons to reach Lanka, teaching children that quiet devotion and purpose can cross any ocean.",
    audioPreviewUrl: "https://www.youtube.com/embed/vcZeX0jPYg4?autoplay=1",
    storyteller: "StoryHour Puppet Troupe & Lead Performer",
    price: 34.99,
    culturalNote: "Accompanied by traditional live puppet gestures and percussive rhythm.",
    accentColor: "#8F1712",
  },

  // ── Bottom Shelf (5 Cultural & Oral Lore Editions) ──
  {
    id: "ed-summer-2024",
    year: "2024",
    season: "Summer",
    codeName: "Unified",
    title: "The Clever Hare & The Lion",
    subtitle: "Panchatantra: Wisdom Over Force",
    language: "English",
    bookFormat: "Illustrated Fables",
    category: "Panchatantra",
    pagesCount: 96,
    chaptersCount: 6,
    duration: "48m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/Grand-Finale-5-scaled.jpg",
    badge: "FOLK TALE",
    description: "When the proud king of the jungle demands daily sacrifice, a tiny rabbit uses intellect and the illusion of a well to save every forest creature.",
    audioPreviewUrl: "https://www.youtube.com/embed/1otr4iUMGbU?autoplay=1",
    storyteller: "StoryHour Folk Narrator",
    price: 24.99,
    culturalNote: "From ancient India's premier compendium of moral and political fables.",
    accentColor: "#F6C445",
  },
  {
    id: "ed-winter-2024",
    year: "2024",
    season: "Winter",
    codeName: "Foundations",
    title: "Stories of Truth: Mohandas",
    subtitle: "Lessons in Conscience & Heritage",
    language: "Multilingual",
    bookFormat: "Archival Folio",
    category: "Moral History",
    pagesCount: 128,
    chaptersCount: 8,
    duration: "1h 15m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/Gandhi-Prayers-STudents-1024x683.jpg",
    badge: "HISTORY",
    description: "How a young student grappled with truth, confession, and moral courage before leading a nation through the power of peaceful conviction.",
    audioPreviewUrl: "https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1",
    storyteller: "StoryHour History Ensemble",
    price: 29.99,
    culturalNote: "Performed with youth drama students across Kendriya Vidyalaya and UK schools.",
    accentColor: "#3F383D",
  },
  {
    id: "ed-summer-2023",
    year: "2023",
    season: "Summer",
    codeName: "Imagine",
    title: "Lighting the Sacred Lamp",
    subtitle: "Fireside Tales & Bedtime Lore",
    language: "English",
    bookFormat: "Bedtime Volume",
    category: "Fireside Lore",
    pagesCount: 112,
    chaptersCount: 10,
    duration: "1h 30m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/Lighting-The-Lamp-3-1024x683.jpg",
    badge: "BEDTIME",
    description: "Gentle cultural myths and moral stories told around evening lamps, connecting children to quiet reflection and timeless virtues.",
    audioPreviewUrl: "https://www.youtube.com/embed/arzOYkbxwX8?autoplay=1",
    storyteller: "StoryHour Cultural Troupe",
    price: 29.99,
    culturalNote: "Created specifically for calming screen-free bedtime listening.",
    accentColor: "#C9281D",
  },
  {
    id: "ed-winter-2023",
    year: "2023",
    season: "Winter",
    codeName: "Built to Last",
    title: "Classroom Residencies UK",
    subtitle: "Spanish School London Performance Archive",
    language: "Multilingual",
    bookFormat: "Residency Archive",
    category: "London Outreach",
    pagesCount: 160,
    chaptersCount: 12,
    duration: "2h 10m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/SpanishSchool-London-1-1024x1024.jpeg",
    badge: "RESIDENCY",
    description: "Immersive school workshops bridging multilingual oral storytelling and cross-cultural heritage across classrooms in London.",
    audioPreviewUrl: "https://www.youtube.com/embed/gR3TuESZXos?autoplay=1",
    storyteller: "StoryHour Education Faculty",
    price: 39.99,
    culturalNote: "Recorded live during StoryHour London school outreach.",
    accentColor: "#0E1638",
  },
  {
    id: "ed-summer-2022",
    year: "2022",
    season: "Summer",
    codeName: "Connect",
    title: "KV Youth Ensemble Festival",
    subtitle: "Live Puppetry & Skits from Uppal",
    language: "Hindi",
    bookFormat: "Festival Edition",
    category: "Puppet & Theatre",
    pagesCount: 120,
    chaptersCount: 10,
    duration: "1h 50m",
    coverImage: "https://storyhour.co.uk/wp-content/uploads/2026/01/KV-Uppal-1024x768.jpeg",
    badge: "ARCHIVE",
    description: "Energetic student performances, puppet theatre, and mythological skits celebrating ancient values with modern youthful enthusiasm.",
    audioPreviewUrl: "https://www.youtube.com/embed/1otr4iUMGbU?autoplay=1",
    storyteller: "Kendriya Vidyalaya & StoryHour Ensemble",
    price: 29.99,
    culturalNote: "Annual youth storytelling showcase.",
    accentColor: "#064C37",
  },
];

export const AUDIOBOOKS: Audiobook[] = [
  {
    id: "ab-ramayana-english",
    title: "Ramayana: The Epic Narration",
    subtitle: "Complete Signature Performance with Sitar & Bansuri",
    narrator: "StoryHour Lead Performer & Ensemble",
    storyteller: "StoryHour Ensemble",
    language: "English",
    duration: "14h 20m",
    chaptersCount: 40,
    price: 39.99,
    cdArtwork: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.53.jpeg",
    category: "Ancient Epic",
    year: "2026",
    season: "Spring",
    badge: "SIGNATURE",
    description: "Immerse yourself in the timeless journey of Rama, Sita, and Lakshmana. Richly scored with acoustic Indian instruments, classical poetry, and captivating studio narration.",
    culturalNote: "Based on Valmiki's classical Adikavya, adapted for family and intergenerational listening.",
    audioPreviewUrl: "https://www.youtube.com/embed/4up2VdHiO5I?autoplay=1",
    accentColor: "#C9281D",
    tracks: [
      { id: 1, title: "Prologue: The Sacred Sarayu & Golden Ayodhya", duration: "12:40" },
      { id: 2, title: "The Celestial Payasam & Birth of the Princes", duration: "18:25" },
      { id: 3, title: "Sage Vishwamitra & The Forest Passage", duration: "15:10" },
      { id: 4, title: "The Bending of Shiva's Bow & Sita's Garland", duration: "20:45" },
      { id: 5, title: "The Exile & The Quiet Hermitage in Panchavati", duration: "24:18" },
    ],
  },
  {
    id: "ab-ramayan-hindi",
    title: "सम्पूर्ण रामायण (स्वरबद्ध कथा)",
    nativeTitle: "शास्त्रीय हिन्दी ऑडियो नाट्य",
    subtitle: "भावपूर्ण स्वर, दोहे व पारंपरिक संगीत",
    narrator: "StoryHour मुख्य कथावाचक व वाद्यवृन्द",
    storyteller: "StoryHour हिन्दी वाचक",
    language: "Hindi",
    duration: "15h 10m",
    chaptersCount: 42,
    price: 34.99,
    cdArtwork: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.30.26.jpeg",
    category: "Classical Drama",
    year: "2026",
    season: "Winter",
    badge: "BESTSELLER",
    description: "मर्यादा पुरुषोत्तम भगवान श्री राम का अमर चरित्र, त्याग और मानवीय मूल्यों की पावन गाथा — भावपूर्ण स्वर और पारंपरिक भारतीय संगीत के संगम के साथ।",
    culturalNote: "हृदयस्पर्शी संवाद और प्रामाणिक सांस्कृतिक संदर्भों के साथ सम्पूर्ण परिवार के लिए।",
    audioPreviewUrl: "https://www.youtube.com/embed/arzOYkbxwX8?autoplay=1",
    accentColor: "#C9281D",
    tracks: [
      { id: 1, title: "मंगलाचरण एवं अयोध्या का पावन वैभव", duration: "14:15" },
      { id: 2, title: "यज्ञ रक्षा और ताड़का वध", duration: "19:30" },
      { id: 3, title: "जनकपुर यात्रा व शिव धनुष भंग", duration: "22:50" },
      { id: 4, title: "सीता-राम का शुभ विवाह उत्सव", duration: "16:40" },
    ],
  },
  {
    id: "ab-ramayanam-telugu",
    title: "శ్రీరామాయణం గానరూపకం",
    nativeTitle: "దివ్య కావ్యం — సంగీత నాటకం",
    subtitle: "Classical Telugu Oral Tradition & Melodies",
    narrator: "StoryHour Telugu Ensemble",
    storyteller: "StoryHour Troupe",
    language: "Telugu",
    duration: "13h 45m",
    chaptersCount: 38,
    price: 34.99,
    cdArtwork: "https://storyhour.co.uk/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-19-at-17.28.56.jpeg",
    category: "Sacred Lore",
    year: "2025",
    season: "Summer",
    badge: "HERITAGE",
    description: "శ్రీరాముని ధర్మమార్గం, సత్యపాలన మరియు సీతారాముల పవిత్ర బంధం — తేటతెలుగు పలుకులలో, హృదయాన్ని హత్తుకునే సంగీత నేపథ్యంతో.",
    culturalNote: "సాంప్రదాయ విలువలను భావి తరాలకు అందించే విశిష్ట ఆడియో ప్రయాణం.",
    audioPreviewUrl: "https://www.youtube.com/embed/gR3TuESZXos?autoplay=1",
    accentColor: "#064C37",
    tracks: [
      { id: 1, title: "ప్రారంభ ప్రార్థన & అయోధ్య వర్ణన", duration: "11:20" },
      { id: 2, title: "విశ్వామిత్రుల ఆగమనం & తాటక సంహారం", duration: "17:45" },
      { id: 3, title: "శివధనుర్భంగం & సీతా కళ్యాణం", duration: "21:15" },
    ],
  },
  {
    id: "ab-hanuman-leap",
    title: "Hanuman’s Mighty Leap",
    subtitle: "Sundarakanda Acoustic Drama & Chants",
    narrator: "StoryHour Puppet Troupe & Ensemble",
    storyteller: "StoryHour Performer",
    language: "English",
    duration: "1h 45m",
    chaptersCount: 12,
    price: 19.99,
    cdArtwork: "https://storyhour.co.uk/wp-content/uploads/2026/01/Hanuman-2-1024x683.jpg",
    category: "Sundarakanda Drama",
    year: "2025",
    season: "Winter",
    badge: "PERFORMANCE",
    description: "Discover how Hanuman conquered doubt and giant sea demons to reach Lanka, teaching children that quiet devotion and purpose can cross any ocean.",
    culturalNote: "Accompanied by traditional live puppet gestures and percussive rhythm.",
    audioPreviewUrl: "https://www.youtube.com/embed/vcZeX0jPYg4?autoplay=1",
    accentColor: "#8F1712",
    tracks: [
      { id: 1, title: "The Gathering on Mount Mahendra", duration: "08:15" },
      { id: 2, title: "The Great Leap Across the Roaring Ocean", duration: "14:30" },
      { id: 3, title: "Encounter with Surasa and Simhika", duration: "12:50" },
      { id: 4, title: "Landing in the Golden Grove of Lanka", duration: "15:20" },
    ],
  },
  {
    id: "ab-panchatantra",
    title: "The Clever Hare & Jungle Lore",
    subtitle: "Panchatantra: Wisdom Over Force",
    narrator: "StoryHour Children's Faculty",
    storyteller: "StoryHour Folk Narrator",
    language: "English",
    duration: "48m",
    chaptersCount: 6,
    price: 14.99,
    cdArtwork: "https://storyhour.co.uk/wp-content/uploads/2026/01/Grand-Finale-5-scaled.jpg",
    category: "Panchatantra Tales",
    year: "2024",
    season: "Summer",
    badge: "FOLK TALES",
    description: "When the proud king of the jungle demands daily sacrifice, a tiny rabbit uses intellect and the illusion of a well to save every forest creature.",
    culturalNote: "From ancient India's premier compendium of moral and political fables.",
    audioPreviewUrl: "https://www.youtube.com/embed/1otr4iUMGbU?autoplay=1",
    accentColor: "#F6C445",
    tracks: [
      { id: 1, title: "The Lion and the Clever Little Hare", duration: "09:40" },
      { id: 2, title: "The Four Inseparable Forest Friends", duration: "11:15" },
      { id: 3, title: "The Monkey and the Cunning Crocodile", duration: "10:30" },
      { id: 4, title: "The Blue Jackal in the Moonlight", duration: "08:25" },
    ],
  },
  {
    id: "ab-lighting-lamp",
    title: "Lighting the Sacred Lamp",
    subtitle: "Fireside Tales & Bedtime Lore",
    narrator: "StoryHour Cultural Faculty",
    storyteller: "StoryHour Cultural Troupe",
    language: "English",
    duration: "1h 30m",
    chaptersCount: 10,
    price: 19.99,
    cdArtwork: "https://storyhour.co.uk/wp-content/uploads/2026/01/Lighting-The-Lamp-3-1024x683.jpg",
    category: "Bedtime Audio",
    year: "2023",
    season: "Summer",
    badge: "BEDTIME",
    description: "Gentle cultural myths and moral stories told around evening lamps, connecting children to quiet reflection and timeless virtues.",
    culturalNote: "Created specifically for calming screen-free bedtime listening.",
    audioPreviewUrl: "https://www.youtube.com/embed/arzOYkbxwX8?autoplay=1",
    accentColor: "#C9281D",
    tracks: [
      { id: 1, title: "The Little Diya in the Courtyard", duration: "12:10" },
      { id: 2, title: "The Quiet Stars of Ayodhya", duration: "14:45" },
      { id: 3, title: "Whispers of the Sacred Peepal Tree", duration: "16:20" },
      { id: 4, title: "Night Music of the Forest Hermitage", duration: "13:30" },
    ],
  },
];

export function getEditionById(id: string): Edition | undefined {
  return EDITIONS.find((ed) => ed.id === id);
}

export function getAudiobookById(id: string): Audiobook | undefined {
  return AUDIOBOOKS.find((ab) => ab.id === id);
}
