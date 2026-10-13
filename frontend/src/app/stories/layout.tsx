import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop StoryHour Editions & Spoken Audiobooks | StoryHour",
  description:
    "Explore our collector's hardcover editions and studio-quality audiobooks of Valmiki's Ramayana, Panchatantra fables, and inspiring Indian epics in English, Hindi, and Telugu.",
  alternates: {
    canonical: "/stories",
  },
  openGraph: {
    title: "Shop StoryHour Editions & Spoken Audiobooks",
    description:
      "Explore our collector's hardcover editions and studio-quality audiobooks of Valmiki's Ramayana, Panchatantra fables, and inspiring Indian epics.",
    url: "https://storyhour.co.uk/stories",
  },
};

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "StoryHour Editions & Audiobooks",
    "description": "Collection of classical Indian children's epics and audiobooks",
    "numberOfItems": 4,
    "itemListElement": [
      {
        "@type": "Book",
        "position": 1,
        "name": "Ramayana — Valmiki's Epic (English)",
        "inLanguage": "en",
        "bookFormat": "https://schema.org/Hardcover",
        "offers": {
          "@type": "Offer",
          "price": "84.99",
          "priceCurrency": "GBP",
          "availability": "https://schema.org/InStock",
        },
      },
      {
        "@type": "Book",
        "position": 2,
        "name": "सम्पूर्ण रामायण (Hindi)",
        "inLanguage": "hi",
        "bookFormat": "https://schema.org/Hardcover",
        "offers": {
          "@type": "Offer",
          "price": "74.99",
          "priceCurrency": "GBP",
          "availability": "https://schema.org/InStock",
        },
      },
      {
        "@type": "Book",
        "position": 3,
        "name": "శ్రీరామాయణం (Telugu)",
        "inLanguage": "te",
        "bookFormat": "https://schema.org/Hardcover",
        "offers": {
          "@type": "Offer",
          "price": "64.99",
          "priceCurrency": "GBP",
          "availability": "https://schema.org/InStock",
        },
      },
      {
        "@type": "Audiobook",
        "position": 4,
        "name": "Hanuman’s Mighty Leap (English)",
        "inLanguage": "en",
        "offers": {
          "@type": "Offer",
          "price": "19.99",
          "priceCurrency": "GBP",
          "availability": "https://schema.org/InStock",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {children}
    </>
  );
}
