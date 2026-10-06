"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLibraryCart } from "@/context/LibraryCartContext";
import {
  X,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ShoppingBag,
  Check,
  Loader2,
  Globe,
  Headphones,
  User,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";

import type { Edition } from "@/data/editions-data";

/* ═══════════════════════════════════════════════════════════════════════════
   AUTHENTIC MULTI-LANGUAGE BOOK DATA (English, Hindi, Telugu)
   ═══════════════════════════════════════════════════════════════════════════ */
interface BookPage {
  pageNumber: number;
  chapterTitle?: string;
  content: string;
}

const DEMO_PAGES_EN: BookPage[] = [
  {
    pageNumber: 1,
    chapterTitle: "The Kingdom of Ayodhya",
    content:
      "In the ancient land of Bharat, nestled along the banks of the sacred river Sarayu, stood the magnificent city of Ayodhya — the unconquerable. Its walls gleamed like burnished gold under the morning sun, and its streets were lined with flowering trees whose petals drifted like blessings upon every passerby.\n\nKing Dasharatha ruled this glorious kingdom with wisdom and compassion. His fame had spread across all the realms, and even the devas in the heavens spoke of his righteousness.",
  },
  {
    pageNumber: 2,
    chapterTitle: "The Promise of Light",
    content:
      "Yet despite all his splendour, the king carried a quiet sorrow in his heart — he had no heir to continue his noble lineage. The palace halls, magnificent as they were, echoed with an emptiness that no treasure could fill.\n\nOn the counsel of the great sage Vasishtha, the king performed the sacred Putrakameshti Yajna — a fire ritual of immense power — invoking the blessings of the gods for the gift of children.",
  },
  {
    pageNumber: 3,
    chapterTitle: "Birth of the Princes",
    content:
      "From the sacred flames emerged a divine being bearing a golden vessel filled with celestial payasam. The heavens thundered with joy as the offering was received.\n\nIn time, four princes were born — Rama, the eldest, radiant as the full moon; Bharata, noble and devoted; and the twins Lakshmana and Shatrughna, inseparable in their bond. The city of Ayodhya erupted in celebration that lasted for days without end.",
  },
  {
    pageNumber: 4,
    chapterTitle: "The Young Prince",
    content:
      "Young Rama grew like a banyan tree — strong, sheltering, and deeply rooted in dharma. Under the tutelage of Guru Vasishtha, he mastered the Vedas, the art of warfare, and the sacred duty of a kshatriya.\n\nHis gentle demeanour won the hearts of all who met him. The birds seemed to sing sweeter when he walked through the palace gardens, and the very earth felt honoured by his footsteps.",
  },
  {
    pageNumber: 5,
    chapterTitle: "Sage Vishwamitra's Call",
    content:
      "One fateful day, the great sage Vishwamitra arrived at the court of Ayodhya. His presence commanded reverence, for he was among the most powerful rishis the world had ever known.\n\n'O King Dasharatha,' he spoke, his voice resonating like distant thunder, 'I require the aid of your eldest son, Prince Rama. Dark forces threaten my sacred rituals in the forest. Only he possesses the divine strength to protect the holy ground.'",
  },
  {
    pageNumber: 6,
    chapterTitle: "Into the Forest",
    content:
      "With his father's reluctant blessing and Lakshmana by his side, young Rama ventured into the dense forests beyond the city walls. The canopy overhead filtered the sunlight into emerald beams, and the air was thick with the fragrance of ancient trees.\n\nThus began the journey that would shape the destiny of all creation — a journey of duty, love, sacrifice, and the eternal triumph of light over darkness.",
  },
];

const DEMO_PAGES_HI: BookPage[] = [
  {
    pageNumber: 1,
    chapterTitle: "अयोध्या का पावन साम्राज्य",
    content:
      "प्राचीन भारतवर्ष की पुण्यभूमि पर, पावन सरयू नदी के सुरम्य तट पर बसी थी अयोध्या नगरी — जिसे कोई जीत न सके। प्रातःकाल की स्वर्ण किरणों में उसके प्राचीर स्वर्णवत आभा बिखेरते थे, और नगर की वीथियाँ प्रफुल्लित वृक्षों से आच्छादित थीं जिनके पुष्प राहगीरों पर आशीष स्वरूप बरसते थे।\n\nमहाराज दशरथ इस वैभवशाली साम्राज्य पर न्याय, धर्म और अपार वात्सल्य के साथ शासन करते थे। उनकी कीर्ति तीनों लोकों में व्याप्त थी और देवगण भी उनके धर्माचरण की सराहना करते थे।",
  },
  {
    pageNumber: 2,
    chapterTitle: "पुत्रकामेष्टि यज्ञ का संकल्प",
    content:
      "परन्तु इस अपार ऐश्वर्य और कीर्ति के उपरान्त भी महाराज के अंतर्मन में एक मौन व्यथा थी — रघुकुल की परंपरा को आगे बढ़ाने के लिए उनका कोई उत्तराधिकारी नहीं था। राजप्रासाद के भव्य कक्ष उस सूनेपन से गूंजते थे जिसे कोई सांसारिक संपदा नहीं भर सकती थी।\n\nकुलगुरु महर्षि वशिष्ठ के परामर्श पर, महाराज ने दिव्य पुत्रकामेष्टि महायज्ञ का अनुष्ठान करने का निश्चय किया, जिससे देवताओं की कृपा से यशस्वी संतानों की प्राप्ति हो सके।",
  },
  {
    pageNumber: 3,
    chapterTitle: "राजकुमारों का प्राकट्य",
    content:
      "पवित्र यज्ञवेदी की पावन ज्वालाओं के मध्य से एक दिव्य पुरुष स्वर्णपात्र में अमृतमय पायस लेकर प्रकट हुए। समस्त गगनमंडल हर्षध्वनि से गूंज उठा।\n\nयथासमय अयोध्या में चार तेजस्वी राजकुमारों का जन्म हुआ — ज्येष्ठ श्रीराम, जिनका मुखमंडल पूर्णिमा के चंद्र समान सौम्य था; धर्मनिष्ठ भरत; तथा परस्पर अविभाज्य लक्ष्मण और शत्रुघ्न। संपूर्ण अयोध्या में कई दिनों तक अनिर्वचनीय आनंदोत्सव मनाया गया।",
  },
  {
    pageNumber: 4,
    chapterTitle: "विद्याध्ययन और धर्म की दीक्षा",
    content:
      "बालक राम एक विशाल वटवृक्ष की भांति पल्लवित हुए — सुदृढ़, आश्रयदाता और धर्म की जड़ों में गहरे समाए हुए। गुरु वशिष्ठ के सानिध्य में उन्होंने वेद, उपनिषद, धनुर्विद्या और क्षत्रिय धर्म के गूढ़ रहस्यों में पारंगतता प्राप्त की।\n\nउनकी विनम्रता और करुणा ने प्रत्येक प्रजाजन का हृदय जीत लिया। जब वे उपवन में भ्रमण करते तो प्रकृति भी उनके चरणों का वंदन करती प्रतीत होती थी।",
  },
  {
    pageNumber: 5,
    chapterTitle: "महर्षि विश्वामित्र का आगमन",
    content:
      "एक शुभ दिन, महान तपस्वी महर्षि विश्वामित्र अयोध्या की राजसभा में पधारे। उनका तेज सूर्य के समान देदीप्यमान था और उनकी उपस्थिति मात्र से संपूर्ण सभा में श्रद्धा मिश्रित नीरवता छा गई।\n\n'हे राजन!' गंभीर मेघगर्जन समान स्वर में मुनि बोले, 'दंडकारण्य में दुष्ट निशाचर मेरे पवित्र अनुष्ठानों को दूषित कर रहे हैं। उस धर्मयज्ञ की रक्षा के लिए मुझे तुम्हारे ज्येष्ठ पुत्र श्रीराम की आवश्यकता है। केवल वही इस संकट का निवारण कर सकते हैं।'",
  },
  {
    pageNumber: 6,
    chapterTitle: "वनगमन और यात्रा का शुभारंभ",
    content:
      "पिता के स्नेहपूर्ण आशीष और अनुज लक्ष्मण के अटूट साथ के साथ, कुमार राम ने नगर की सीमाओं को पार कर सघन अरण्य की ओर प्रस्थान किया। वृक्षों की सघन छाया से छनकर आती किरणें मार्ग आलोकित कर रही थीं।\n\nयहाँ से उस युगांतरकारी यात्रा का आरंभ हुआ जिसने मानव इतिहास को दिशा दी — कर्तव्य, प्रेम, त्याग और असत्य पर सत्य की शाश्वत विजय की अमर गाथा।",
  },
];

const DEMO_PAGES_TE: BookPage[] = [
  {
    pageNumber: 1,
    chapterTitle: "అయోధ్య సామ్రాజ్యం",
    content:
      "ప్రాచీన భారత దేశపు పుణ్యభూమిపై, పవిత్ర సరయూ నదీ తీరంలో అజేయమైన అయోధ్యా నగరం విలసిల్లింది. ఉదయపు సూర్యకిరణాలలో నగర ప్రాకారాలు బంగారు కాంతులీనుతూ ఉండేవి. రాజమార్గాలన్నీ సువాసనలు వెదజల్లే పుష్పవృక్షాలతో వికసించి, బాటసారులపై దీవెనల వాన కురిపించేవి.\n\nదశరథ మహారాజు ధర్మనిష్ఠతో, ప్రజానురంజకంగా పాలించేవాడు. ఆయన కీర్తి ముల్లోకాలలో వ్యాపించింది. దేవతలు సైతం ఆయన సత్యసంధతను కొనియాడేవారు.",
  },
  {
    pageNumber: 2,
    chapterTitle: "పుత్రకామేష్టి యాగ సంకల్పం",
    content:
      "అంతటి భోగభాగ్యాలు ఉన్నప్పటికీ, రఘువంశాన్ని నిలబెట్టే పుత్రసంతానం లేకపోవడం దశరథుని హృదయంలో తీరని వేదనగా మిగిలిపోయింది. ఆ రాజమందిరాలు ఎన్ని సంపదలున్నా నిశ్శబ్ద శూన్యతతో ప్రతిధ్వనించేవి.\n\nకులగురువు వసిష్ఠ మహర్షి సలహా మేరకు, సంతాన ప్రాప్తికై మహారాజు శక్తివంతమైన పుత్రకామేష్టి యాగాన్ని సంకల్పించారు.",
  },
  {
    pageNumber: 3,
    chapterTitle: "రామ లక్ష్మణుల అవతరణ",
    content:
      "యాగకుండం నుండి దివ్యపురుషుడు బంగారు పాత్రలో దివ్య పాయసాన్ని తీసుకుని ఆవిర్భవించాడు. దివి నుండి దేవతలు పూలవాన కురిపించారు.\n\nకాలక్రమంలో నలుగురు దివ్య తేజస్సు గల రాజకుమారులు జన్మించారు — పున్నమి చంద్రుని వంటి శ్రీరాముడు, ధర్మమూర్తి భరతుడు, పరస్పర అనురాగంగల లక్ష్మణ శత్రుఘ్నులు. అయోధ్యా నగరమంతా ఎడతెగని ఆనందోత్సవాల్లో మునిగితేలింది.",
  },
  {
    pageNumber: 4,
    chapterTitle: "విద్యాభ్యాసము - గురుకుల ప్రవేశము",
    content:
      "బాలరాముడు మహావృక్షంలా ఎదుగుతూ, ధర్మ మార్గంలో ముందుకు సాగాడు. వసిష్ఠ మహర్షి ఆశ్రమంలో వేదాలు, శాస్త్రాలు, ధనుర్విద్యను అభ్యసించి సంపూర్ణ క్షత్రియ ధర్మాన్ని ఔపోసన పట్టాడు.\n\nఆయన శాంత స్వభావం, మధుర సంభాషణ సమస్త ప్రజల మనస్సులను ఆకట్టుకున్నాయి. ప్రకృతి సైతం రాముని పాదస్పర్శకు పులకించిపోయింది.",
  },
  {
    pageNumber: 5,
    chapterTitle: "విశ్వామిత్ర మహర్షి రాక",
    content:
      "ఒక శుభదినాన, తపోధనుడైన విశ్వామిత్ర మహర్షి అయోధ్యా సభకు విచ్చేశారు. ఆయన బ్రహ్మతేజస్సు చూసి సభలోని వారందరూ భక్తిప్రపత్తులతో లేచి నమస్కరించారు.\n\n'దశరథ రాజా! సిద్ధాశ్రమంలో నేను చేయు యజ్ఞాన్ని రాక్షసులు భంగం చేస్తున్నారు. ఆ యాగ సంరక్షణ కోసం నీ జ్యేష్ఠపుత్రుడైన శ్రీరాముని నా వెంట పంపు' అని కోరారు.",
  },
  {
    pageNumber: 6,
    chapterTitle: "అరణ్య ప్రవేశం",
    content:
      "తండ్రి ఆశీస్సులతో, తమ్ముడు లక్ష్మణునితో కలిసి శ్రీరాముడు విశ్వామిత్రుని వెంట అరణ్య మార్గంలో నడిచాడు. మహా వృక్షాల మధ్య నుండి సూర్యకిరణాలు దారి చూపుతుండగా సాగిన ఆ పయనం ధర్మ సంస్థాపనకు నాంది పలికింది.\n\nఅలా త్యాగం, ప్రేమ, కర్తవ్య నిష్ఠలతో కూడిన విశ్వవిఖ్యాత అమరగాథ ప్రారంభమైంది.",
  },
];

function getPagesForEdition(language: string): BookPage[] {
  if (language === "Hindi") return DEMO_PAGES_HI;
  if (language === "Telugu") return DEMO_PAGES_TE;
  return DEMO_PAGES_EN;
}

type ReaderState = "preview" | "unlocking" | "reading";

interface BookReaderProps {
  edition: Edition;
  onClose: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUBTLE SYNTHESIZED PAPER FLIP AUDIO (Web Audio API - Singleton)
   ═══════════════════════════════════════════════════════════════════════════ */
let sharedAudioCtx: AudioContext | null = null;

function playPaperFlipSound() {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    const ctx = sharedAudioCtx;
    const bufferSize = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 950;
    filter.Q.value = 1.4;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {
    // Audio context may be blocked by browser policy
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE PAGE FACE COMPONENT
   Renders an authentic antique cream book page with drop caps and paper texture
   ═══════════════════════════════════════════════════════════════════════════ */
function PageFace({
  page,
  isLeft,
  onClick,
  canTurn = false,
}: {
  page?: BookPage;
  isLeft: boolean;
  onClick?: () => void;
  canTurn?: boolean;
}) {
  if (!page) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center p-8 sm:p-12 select-none bg-[#FCFAF6] ${
          isLeft ? "border-r border-[#EFECE6]" : "border-l border-[#EFECE6]"
        }`}
      >
        <div className="text-center text-[#B5AFA6] font-serif italic text-sm">
          — End of Chapter Preview —
        </div>
      </div>
    );
  }

  // Format content to highlight drop-cap on first letter
  const firstLetter = page.content.charAt(0);
  const remainingContent = page.content.slice(1);

  return (
    <div
      onClick={onClick}
      className={`group relative w-full h-full p-7 sm:p-10 md:p-12 flex flex-col justify-between select-none bg-[#FCFAF6] transition-colors duration-200 overflow-hidden ${
        canTurn ? "cursor-pointer" : ""
      } ${
        isLeft
          ? "border-r border-[#E8E4DC] shadow-[inset_-12px_0_24px_rgba(0,0,0,0.025)]"
          : "border-l border-[#E8E4DC] shadow-[inset_12px_0_24px_rgba(0,0,0,0.025)]"
      }`}
    >
      {/* Paper Grain Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(240, 235, 224, 0.8) 0%, rgba(230, 222, 208, 0.4) 100%)",
        }}
      />

      {/* Crease shadow near spine */}
      <div
        className={`absolute top-0 bottom-0 pointer-events-none w-12 ${
          isLeft
            ? "right-0 bg-gradient-to-l from-black/[0.07] via-black/[0.02] to-transparent"
            : "left-0 bg-gradient-to-r from-black/[0.07] via-black/[0.02] to-transparent"
        }`}
      />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-[#E8E4DC]/60 pb-3 mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#9E9689] font-medium">
          {isLeft ? `StoryHour Anthology` : `Chapter ${Math.ceil(page.pageNumber / 2)}`}
        </span>
        <span className="font-serif text-[11px] text-[#9E9689] italic">
          — Page {page.pageNumber} —
        </span>
      </div>

      {/* Chapter Content Body */}
      <div className="relative z-10 flex-1">
        {page.chapterTitle && (
          <div className="mb-5 sm:mb-6">
            <h3 className="font-serif text-[20px] sm:text-[24px] md:text-[27px] font-bold text-[#1F1C18] leading-[1.15] tracking-[-0.02em]">
              {page.chapterTitle}
            </h3>
            <div className="mt-2 w-8 h-[2px] bg-[#C9281D]/70 rounded-full" />
          </div>
        )}

        <div className="font-serif text-[13.5px] sm:text-[14.5px] md:text-[15.5px] text-[#2C2824] leading-[1.8] tracking-[-0.005em] whitespace-pre-line text-justify">
          <span className="float-left text-4xl sm:text-5xl font-serif font-black text-[#C9281D] leading-none pr-3 pt-1 select-none">
            {firstLetter}
          </span>
          {remainingContent}
        </div>
      </div>

      {/* Bottom Footer & Page Curl Cue */}
      <div className="relative z-10 flex items-center justify-between pt-4 mt-6 border-t border-[#E8E4DC]/60 font-mono text-[10px] text-[#A69E90]">
        <span>{isLeft ? "◄ Click to turn back" : ""}</span>
        <span className="font-semibold tracking-widest">{page.pageNumber}</span>
        <span>{!isLeft ? "Click to turn next ►" : ""}</span>
      </div>

      {/* Interactive Page Curl Cue on Corner Hover */}
      {canTurn && (
        <div
          className={`absolute bottom-0 ${
            isLeft ? "left-0" : "right-0"
          } w-10 h-10 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        >
          <div
            className={`w-14 h-14 bg-gradient-to-tr from-[#E3DDD1] to-white shadow-md transform ${
              isLeft
                ? "-translate-x-7 translate-y-7 rotate-45"
                : "translate-x-7 translate-y-7 -rotate-45"
            } transition-transform duration-200 group-hover:scale-110`}
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN BOOK READER COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function BookReader({ edition, onClose }: BookReaderProps) {
  const { isBookUnlocked, addToCart, showToast } = useLibraryCart();
  const router = useRouter();
  const isUnlocked = isBookUnlocked(edition.id) || (edition.productId ? isBookUnlocked(edition.productId) : false);
  const [state, setState] = useState<ReaderState>(isUnlocked ? "reading" : "preview");
  const [currentSpread, setCurrentSpread] = useState(0); // Index into page pairs (0 = pages 1-2, 1 = pages 3-4, etc.)
  const [mobileSubPage, setMobileSubPage] = useState<0 | 1>(0);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const bookPages = getPagesForEdition(edition.language);
  const totalSpreads = Math.ceil(bookPages.length / 2);

  // Sync state if unlocked status changes
  useEffect(() => {
    if (isUnlocked) {
      setState("reading");
    }
  }, [isUnlocked]);

  // Trigger book-opening animation after mount in preview mode
  useEffect(() => {
    const timer = setTimeout(() => setIsBookOpen(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll while reader is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Page Turn Actions with 3D Rotation Animation
  const turnNext = useCallback(() => {
    if (isFlipping || currentSpread >= totalSpreads - 1) return;
    if (!isUnlocked && currentSpread >= 0) {
      showToast("Preview limit reached (Pages 1–2). Purchase the edition to unlock all chapters!");
      return;
    }
    if (soundEnabled) playPaperFlipSound();
    setFlipDirection("next");
    setIsFlipping(true);
    setMobileSubPage(0);
  }, [isFlipping, currentSpread, totalSpreads, soundEnabled, isUnlocked, showToast]);

  const turnPrev = useCallback(() => {
    if (isFlipping || currentSpread <= 0) return;
    if (soundEnabled) playPaperFlipSound();
    setFlipDirection("prev");
    setIsFlipping(true);
    setMobileSubPage(0);
  }, [isFlipping, currentSpread, soundEnabled]);

  // Handler when 3D page flip animation finishes
  const handleFlipComplete = () => {
    if (flipDirection === "next") {
      setCurrentSpread((s) => Math.min(s + 1, totalSpreads - 1));
    } else if (flipDirection === "prev") {
      setCurrentSpread((s) => Math.max(s - 1, 0));
    }
    setIsFlipping(false);
    setFlipDirection(null);
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (state === "reading") {
        if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
          e.preventDefault();
          turnNext();
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          turnPrev();
        }
      }
    },
    [state, turnNext, turnPrev, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Helper pages for current spread and incoming spread
  const currentLeftPage = bookPages[currentSpread * 2];
  const currentRightPage = bookPages[currentSpread * 2 + 1];

  const nextLeftPage = bookPages[(currentSpread + 1) * 2];
  const nextRightPage = bookPages[(currentSpread + 1) * 2 + 1];

  const prevLeftPage = bookPages[(currentSpread - 1) * 2];
  const prevRightPage = bookPages[(currentSpread - 1) * 2 + 1];

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reader-title"
        className="fixed inset-0 z-[200] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop with dark blur */}
        <motion.div
          className="absolute inset-0 bg-[#070605]/85 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-[215] w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer backdrop-blur-md shadow-lg"
          aria-label="Close book reader"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ════════════════════════════════════════════════════════════════
            PREVIEW STATE: 3D Book Cover + Info Panel
            ════════════════════════════════════════════════════════════════ */}
        {state === "preview" && (
          <motion.div
            className="relative z-[205] w-full max-w-[960px] mx-4 sm:mx-6 flex flex-col lg:flex-row items-center lg:items-stretch gap-0 lg:gap-0 overflow-hidden rounded-2xl shadow-2xl border border-white/10"
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Left: Animated 3D Book Cover */}
            <div className="relative w-full lg:w-[420px] bg-gradient-to-br from-[#0F0E0C] via-[#1A1816] to-[#24211D] flex items-center justify-center p-8 sm:p-12 flex-shrink-0 overflow-hidden">
              {/* Warm Ambient glow */}
              <div className="absolute w-[320px] h-[320px] rounded-full bg-[#C9281D]/20 blur-[90px] pointer-events-none" />

              {/* 3D Book with opening animation */}
              <motion.div
                className="relative"
                style={{ perspective: 1200 }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: isBookOpen ? -24 : 0 }}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
              >
                <div
                  className="relative w-[220px] sm:w-[260px] aspect-[3/4] rounded-lg overflow-hidden"
                  style={{
                    transformStyle: "preserve-3d",
                    boxShadow: isBookOpen
                      ? "14px 14px 45px rgba(0,0,0,0.7), -4px 0 20px rgba(0,0,0,0.4)"
                      : "0 30px 70px -15px rgba(0,0,0,0.7), 0 10px 30px -10px rgba(0,0,0,0.5)",
                  }}
                >
                  <Image
                    src={edition.coverImage}
                    alt={edition.title}
                    fill
                    className="object-cover"
                    sizes="280px"
                    priority
                  />
                  {/* Spine gradient */}
                  <div className="absolute left-0 top-0 bottom-0 w-[10px] bg-gradient-to-r from-black/60 via-black/25 to-transparent z-10" />
                  {/* Gloss & specular highlight */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
                </div>

                {/* Simulated back page thickness visible when book tilts */}
                <motion.div
                  className="absolute top-[3px] -right-[7px] w-[220px] sm:w-[260px] rounded-r-md overflow-hidden"
                  style={{
                    height: "calc(100% - 6px)",
                    background: "linear-gradient(to right, #ded8cc, #f4f0e6, #ded8cc)",
                    transformOrigin: "left center",
                    transformStyle: "preserve-3d",
                    zIndex: -1,
                    boxShadow: "5px 3px 15px rgba(0,0,0,0.25)",
                  }}
                />
              </motion.div>

              {/* Edition badges */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center gap-2 z-10">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#DE3124] to-[#C9281D] text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_4px_12px_rgba(201,40,29,0.4)]">
                  {edition.bookFormat || "Collector's Edition"}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-mono">
                  {edition.language}
                </span>
              </div>
            </div>

            {/* Right: Book Information & Purchase */}
            <div className="w-full lg:flex-1 bg-[#FAF8F3] p-7 sm:p-9 flex flex-col justify-between overflow-y-auto max-h-[70vh] lg:max-h-none">
              <div className="space-y-5">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-[#C9281D] font-bold">
                    StoryHour Edition
                  </span>
                  <h2 id="reader-title" className="mt-1.5 font-serif text-[28px] sm:text-[34px] font-normal text-[#0F0F0F] leading-[1.05] tracking-[-0.025em]">
                    {edition.title}
                  </h2>
                  {edition.nativeTitle && (
                    <p className="mt-1 font-serif text-[18px] text-[#5A5A5A] italic">
                      {edition.nativeTitle}
                    </p>
                  )}
                  <p className="mt-2 font-sans text-[14px] text-[#5A5A5A] leading-[1.6]">
                    {edition.description}
                  </p>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 py-3 border-y border-[#E7E7E7] font-mono text-[11px] text-[#5A5A5A]">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C9281D]" />
                    {edition.storyteller}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#C9281D]" />
                    {edition.language}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#C9281D]" />
                    {edition.chaptersCount} Chapters · {edition.pagesCount} Pages
                  </span>
                  {edition.duration && (
                    <span className="flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-[#C9281D]" />
                      Audio ({edition.duration})
                    </span>
                  )}
                </div>

                {/* Locked or Unlocked pages indicator */}
                {isUnlocked ? (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-600">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="font-sans text-[13px] font-bold text-emerald-700">
                        Edition Purchased &amp; Unlocked
                      </p>
                      <p className="font-sans text-[11px] text-emerald-600">
                        You have full access to all {bookPages.length} pages with 3D turning animation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0F0F0F]/5 border border-[#E7E7E7]">
                    <div className="w-10 h-10 rounded-full bg-[#0F0F0F]/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4.5 h-4.5 text-[#5A5A5A]" />
                    </div>
                    <div>
                      <p className="font-sans text-[13px] font-semibold text-[#0F0F0F]">
                        Pages locked until purchase
                      </p>
                      <p className="font-sans text-[11px] text-[#5A5A5A]">
                        Read sample preview pages or unlock all {bookPages.length} pages with 3D turning animation
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Purchase row */}
              <div className="flex items-center justify-between pt-5 mt-5 border-t border-[#E7E7E7]">
                <div>
                  <span className="font-mono text-[11px] text-[#5A5A5A] block">
                    Digital Edition
                  </span>
                  <span className="font-serif text-[26px] font-bold text-[#0F0F0F]">
                    ${edition.price}
                  </span>
                </div>
                {isUnlocked ? (
                  <button
                    onClick={() => setState("reading")}
                    className="px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-[14px] font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    Read Book Now
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    <button
                      onClick={() => {
                        setState("reading");
                        setCurrentSpread(0);
                        setMobileSubPage(0);
                      }}
                      className="px-4 py-3 rounded-full bg-[#1F1C18] hover:bg-black text-white font-sans text-[13px] font-bold transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      Read Free Preview
                    </button>
                    <button
                      onClick={() => {
                        addToCart({
                          id: edition.id,
                          title: edition.title,
                          nativeTitle: edition.nativeTitle,
                          subtitle: edition.subtitle,
                          authorOrNarrator: edition.storyteller,
                          coverImage: edition.coverImage,
                          price: edition.price,
                          format: edition.bookFormat || "Digital Edition",
                          language: edition.language,
                          type: "book",
                        });
                      }}
                      className="px-3.5 sm:px-4 py-3 rounded-full bg-white hover:bg-gray-50 text-[#0F0F0F] font-sans text-[13px] font-bold border border-black/15 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#C9281D]" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        addToCart({
                          id: edition.id,
                          title: edition.title,
                          nativeTitle: edition.nativeTitle,
                          subtitle: edition.subtitle,
                          authorOrNarrator: edition.storyteller,
                          coverImage: edition.coverImage,
                          price: edition.price,
                          format: edition.bookFormat || "Digital Edition",
                          language: edition.language,
                          type: "book",
                        });
                        onClose();
                        router.push("/checkout");
                      }}
                      className="px-4 sm:px-5 py-3 rounded-full bg-gradient-to-r from-[#DE3124] via-[#C9281D] to-[#991B1B] hover:from-[#EA3A2D] hover:via-[#D12E23] hover:to-[#A81F19] text-white font-sans text-[13px] font-bold transition-all shadow-[0_4px_16px_rgba(201,40,29,0.35)] hover:shadow-[0_8px_24px_rgba(201,40,29,0.5)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            UNLOCKING STATE: Purchase Animation
            ════════════════════════════════════════════════════════════════ */}
        {state === "unlocking" && (
          <motion.div
            className="relative z-[205] flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#DE3124] to-[#C9281D] flex items-center justify-center shadow-[0_0_60px_rgba(201,40,29,0.4)]"
              animate={{
                scale: [1, 1.15, 1, 1.1, 1],
                boxShadow: [
                  "0 0 60px rgba(201,40,29,0.4)",
                  "0 0 100px rgba(201,40,29,0.6)",
                  "0 0 60px rgba(201,40,29,0.4)",
                  "0 0 80px rgba(201,40,29,0.5)",
                  "0 0 60px rgba(201,40,29,0.4)",
                ],
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 1.4, duration: 0.3 }}
              >
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </motion.div>
              <motion.div
                className="absolute"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.p
                className="font-sans text-lg font-bold text-white"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 1.4, duration: 0.2 }}
              >
                Processing purchase…
              </motion.p>
              <motion.p
                className="font-sans text-lg font-bold text-white drop-shadow-[0_2px_10px_rgba(201,40,29,0.8)] absolute left-1/2 -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.3 }}
              >
                ✓ Book Unlocked!
              </motion.p>
            </motion.div>

            {/* Decorative particles */}
            <div className="absolute pointer-events-none">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: i % 3 === 0 ? "#DE3124" : i % 3 === 1 ? "#C9281D" : "#FFFFFF",
                  }}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: Math.cos((i * Math.PI * 2) / 12) * (80 + Math.random() * 60),
                    y: Math.sin((i * Math.PI * 2) / 12) * (80 + Math.random() * 60),
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    delay: 1.6 + i * 0.04,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            READING STATE: Open 3D Book Spread with Realistic Page Rotating Animation
            ════════════════════════════════════════════════════════════════ */}
        {state === "reading" && (
          <motion.div
            className="relative z-[205] w-full max-w-[1020px] mx-4 sm:mx-6"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header bar above the book */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 px-2">
              <div className="flex items-center gap-2">
                {isUnlocked ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="font-mono text-[11px] uppercase tracking-widest text-white/80 font-semibold truncate max-w-[200px] sm:max-w-none">
                  {edition.title} {isUnlocked ? "— Reading Mode" : "— Free Preview (Pages 1–2)"}
                </span>
              </div>

              {/* Controls (Sound toggle + spread count) */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setSoundEnabled((s) => !s)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-[11px] font-mono transition-colors cursor-pointer"
                  title={soundEnabled ? "Mute page turn sound" : "Enable page turn sound"}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-[#C9281D]" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-white/40" />
                  )}
                  <span className="hidden sm:inline">Flip Sound</span>
                </button>
                <span className="font-mono text-[11px] text-white/50 whitespace-nowrap">
                  Spread {currentSpread + 1} of {totalSpreads}
                </span>
              </div>
            </div>

            {/* 3D BOOK STAGE WITH PERSPECTIVE */}
            <div
              className="relative select-none"
              style={{
                perspective: "2200px",
                perspectiveOrigin: "center center",
              }}
            >
              {/* Outer Hardcover Binding Rim & Multi-layer Paper Edge Shadows */}
              <div
                className="relative bg-[#1E1B18] p-2 sm:p-2.5 rounded-xl transition-shadow duration-300"
                style={{
                  boxShadow:
                    "0 35px 80px -15px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 4px rgba(255,255,255,0.15)",
                }}
              >
                {/* Decorative Bookmark Ribbon hanging from top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-40 w-4 h-9 bg-gradient-to-b from-[#C9281D] to-[#991B1B] rounded-b-sm shadow-md pointer-events-none flex items-end justify-center pb-1">
                  <div className="w-2 h-2 border-b-2 border-r-2 border-amber-300/60 rotate-45" />
                </div>

                {/* DESKTOP/TABLET 2-PAGE SPREAD BOOK CONTAINER (3D SCENE) */}
                <div
                  className="hidden sm:flex relative w-full rounded-lg overflow-hidden bg-[#EDE8DE] min-h-[460px] sm:min-h-[520px] md:min-h-[580px]"
                  style={{
                    transformStyle: "preserve-3d",
                    boxShadow:
                      "inset -3px 0 6px rgba(0,0,0,0.15), inset 3px 0 6px rgba(0,0,0,0.15)",
                  }}
                >
                  {/* ──────────────────────────────────────────────────────────
                      LEFT HALF: Underlying Left Page
                      ────────────────────────────────────────────────────────── */}
                  <div className="w-1/2 h-full flex flex-col relative z-10">
                    <PageFace
                      page={
                        isFlipping && flipDirection === "prev"
                          ? prevLeftPage
                          : currentLeftPage
                      }
                      isLeft={true}
                      onClick={turnPrev}
                      canTurn={currentSpread > 0 && !isFlipping}
                    />
                  </div>

                  {/* ──────────────────────────────────────────────────────────
                      CENTER SPINE GUTTER
                      Deep 3D ridge and shadow simulating sewn binding
                      ────────────────────────────────────────────────────────── */}
                  <div
                    className="w-[10px] sm:w-[14px] flex-shrink-0 relative z-30"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 25%, rgba(255,255,255,0.1) 50%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0.3) 100%)",
                      boxShadow: "0 0 10px rgba(0,0,0,0.4)",
                    }}
                  >
                    {/* Spine stitching texture dots */}
                    <div className="absolute inset-0 flex flex-col items-center justify-around py-4 opacity-40">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-black/50" />
                      ))}
                    </div>
                  </div>

                  {/* ──────────────────────────────────────────────────────────
                      RIGHT HALF: Underlying Right Page
                      ────────────────────────────────────────────────────────── */}
                  <div className="w-1/2 h-full flex flex-col relative z-10">
                    <PageFace
                      page={
                        isFlipping && flipDirection === "next"
                          ? nextRightPage
                          : currentRightPage
                      }
                      isLeft={false}
                      onClick={turnNext}
                      canTurn={currentSpread < totalSpreads - 1 && !isFlipping}
                    />
                  </div>

                  {/* ──────────────────────────────────────────────────────────
                      3D ROTATING PAGE LEAF (FORWARD TURN: Right -> Left)
                      Rotates from 0deg to -180deg around the spine (left origin)
                      ────────────────────────────────────────────────────────── */}
                  {isFlipping && flipDirection === "next" && (
                    <motion.div
                      className="absolute top-0 bottom-0 right-0 w-1/2 z-40"
                      style={{
                        transformOrigin: "left center",
                        transformStyle: "preserve-3d",
                      }}
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: -180 }}
                      transition={{
                        duration: 0.75,
                        ease: [0.22, 0.61, 0.36, 1],
                      }}
                      onAnimationComplete={handleFlipComplete}
                    >
                      {/* FRONT FACE (Current Right Page while rotating up) */}
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <PageFace page={currentRightPage} isLeft={false} />
                        {/* Dynamic shadow on front face as it tilts away from light */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none bg-black"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.35, 0.7] }}
                          transition={{ duration: 0.75, ease: "easeInOut" }}
                        />
                      </div>

                      {/* BACK FACE (Next Left Page when flipped over) */}
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          transform: "rotateY(180deg)",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <PageFace page={nextLeftPage} isLeft={true} />
                        {/* Dynamic shadow on back face lightening as it lands flat */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none bg-black"
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: [0.7, 0.35, 0] }}
                          transition={{ duration: 0.75, ease: "easeInOut" }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* ──────────────────────────────────────────────────────────
                      3D ROTATING PAGE LEAF (BACKWARD TURN: Left -> Right)
                      Rotates from 0deg to 180deg around the spine (right origin)
                      ────────────────────────────────────────────────────────── */}
                  {isFlipping && flipDirection === "prev" && (
                    <motion.div
                      className="absolute top-0 bottom-0 left-0 w-1/2 z-40"
                      style={{
                        transformOrigin: "right center",
                        transformStyle: "preserve-3d",
                      }}
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: 180 }}
                      transition={{
                        duration: 0.75,
                        ease: [0.22, 0.61, 0.36, 1],
                      }}
                      onAnimationComplete={handleFlipComplete}
                    >
                      {/* FRONT FACE (Current Left Page while rotating up) */}
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <PageFace page={currentLeftPage} isLeft={true} />
                        {/* Dynamic shadow on front face as it tilts away from light */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none bg-black"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.35, 0.7] }}
                          transition={{ duration: 0.75, ease: "easeInOut" }}
                        />
                      </div>

                      {/* BACK FACE (Previous Right Page when flipped over) */}
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          transform: "rotateY(180deg)",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <PageFace page={prevRightPage} isLeft={false} />
                        {/* Dynamic shadow on back face lightening as it lands flat */}
                        <motion.div
                          className="absolute inset-0 pointer-events-none bg-black"
                          initial={{ opacity: 0.7 }}
                          animate={{ opacity: [0.7, 0.35, 0] }}
                          transition={{ duration: 0.75, ease: "easeInOut" }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* MOBILE SINGLE-PAGE SPREAD (visible on screens < sm) */}
                <div
                  className="sm:hidden relative w-full rounded-lg overflow-hidden bg-[#EDE8DE] min-h-[440px] flex flex-col"
                  style={{
                    boxShadow:
                      "inset -3px 0 6px rgba(0,0,0,0.15), inset 3px 0 6px rgba(0,0,0,0.15)",
                  }}
                >
                  <PageFace
                    page={mobileSubPage === 0 ? currentLeftPage : currentRightPage}
                    isLeft={mobileSubPage === 0}
                    onClick={() => {
                      if (mobileSubPage === 0 && currentRightPage) {
                        setMobileSubPage(1);
                        if (soundEnabled) playPaperFlipSound();
                      } else {
                        turnNext();
                      }
                    }}
                    canTurn={isUnlocked || mobileSubPage === 0}
                  />
                  <div className="flex items-center justify-between px-3 py-2 bg-[#E3DDD1] border-t border-[#D5CDBD] text-[11px] font-mono text-[#6A6458]">
                    <span>Page {mobileSubPage === 0 ? currentSpread * 2 + 1 : currentSpread * 2 + 2} of {bookPages.length}</span>
                    {currentRightPage && (
                      <button
                        onClick={() => {
                          setMobileSubPage((s) => (s === 0 ? 1 : 0));
                          if (soundEnabled) playPaperFlipSound();
                        }}
                        className="text-[#C9281D] font-bold underline cursor-pointer"
                      >
                        {mobileSubPage === 0 ? "Facing page →" : "← Preceding page"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Free preview limit prompt banner */}
              {!isUnlocked && (
                <div className="mt-3 p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-amber-950/80 via-black/80 to-amber-950/80 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-center sm:text-left">
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Free sample preview (pages 1–2). Purchase full edition to read all {bookPages.length} pages.</span>
                  </div>
                  <button
                    onClick={() => {
                      addToCart({
                        id: edition.id,
                        title: edition.title,
                        nativeTitle: edition.nativeTitle,
                        subtitle: edition.subtitle,
                        authorOrNarrator: edition.storyteller,
                        coverImage: edition.coverImage,
                        price: edition.price,
                        format: edition.bookFormat || "Digital Edition",
                        language: edition.language,
                        type: "book",
                      });
                      onClose();
                      router.push("/checkout");
                    }}
                    className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-sans text-xs font-bold transition shadow whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95"
                  >
                    Unlock Full Edition · ${edition.price}
                  </button>
                </div>
              )}

              {/* Bottom Controls Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 mt-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    if (mobileSubPage === 1) {
                      setMobileSubPage(0);
                      if (soundEnabled) playPaperFlipSound();
                    } else {
                      turnPrev();
                    }
                  }}
                  disabled={currentSpread === 0 && mobileSubPage === 0 || isFlipping}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-sans font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-white hover:bg-white/15 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Page</span>
                </button>

                {/* Spread Indicator Dots */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalSpreads }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (isFlipping || i === currentSpread) return;
                        if (!isUnlocked && i > 0) {
                          showToast("Preview limit reached. Purchase full edition to read all chapters!");
                          return;
                        }
                        if (i > currentSpread) {
                          turnNext();
                        } else {
                          turnPrev();
                        }
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        i === currentSpread
                          ? "w-6 bg-gradient-to-r from-[#DE3124] to-[#C9281D] shadow-[0_0_10px_rgba(201,40,29,0.55)]"
                          : "w-2 bg-white/30 hover:bg-white/60"
                      }`}
                      aria-label={`Go to spread ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    if (mobileSubPage === 0 && currentRightPage) {
                      setMobileSubPage(1);
                      if (soundEnabled) playPaperFlipSound();
                    } else {
                      turnNext();
                    }
                  }}
                  disabled={
                    (!isUnlocked && currentSpread >= 0 && mobileSubPage === 1) ||
                    (isUnlocked && currentSpread === totalSpreads - 1 && mobileSubPage === 1) ||
                    isFlipping
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-sans font-semibold transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-white hover:bg-white/15 active:scale-95"
                >
                  <span>Next Page</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Back to Shop hint */}
            <p className="text-center mt-3 font-sans text-[12px] text-white/50 flex items-center justify-center gap-2">
              <span>Use <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[10px]">→</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[10px]">Space</kbd> to flip pages</span>
              <span>·</span>
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[10px]">Esc</kbd> to close</span>
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

