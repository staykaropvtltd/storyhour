import React from "react";

export default function StoryHourVectorBg() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none">
      <svg
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full block"
      >
        <defs>
          {/* Sky Gradient (Exact Papumba Azure Sky) */}
          <linearGradient id="skyGrad" x1="960" y1="0" x2="960" y2="700" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1C8EF7" />
            <stop offset="50%" stopColor="#3C9FFE" />
            <stop offset="100%" stopColor="#63B7FD" />
          </linearGradient>

          {/* Rainbow Gradient */}
          <linearGradient id="rainbowGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF4B4B" />
            <stop offset="20%" stopColor="#DE3124" />
            <stop offset="40%" stopColor="#FFDE38" />
            <stop offset="60%" stopColor="#44C844" />
            <stop offset="80%" stopColor="#25A9E0" />
            <stop offset="100%" stopColor="#9B4CE6" />
          </linearGradient>

          {/* Cloud Gradients */}
          <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#E2F2FF" stopOpacity="0.85" />
          </linearGradient>

          {/* Golden Ayodhya Temple Spires Gradient */}
          <linearGradient id="templeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD363" />
            <stop offset="50%" stopColor="#EAA72E" />
            <stop offset="100%" stopColor="#C47E18" />
          </linearGradient>

          {/* Hill Gradients */}
          <linearGradient id="midHillGrad" x1="0" y1="500" x2="0" y2="1080" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4AA832" />
            <stop offset="100%" stopColor="#358822" />
          </linearGradient>

          <linearGradient id="foreHillGrad" x1="0" y1="650" x2="0" y2="1080" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94D73B" />
            <stop offset="60%" stopColor="#87CF31" />
            <stop offset="100%" stopColor="#76BC26" />
          </linearGradient>
        </defs>

        {/* 1. Sky Background */}
        <rect width="1920" height="1080" fill="url(#skyGrad)" />

        {/* 2. Stylized Puffy Clouds in Corners */}
        {/* Top-Left Clouds */}
        <g opacity="0.88">
          <path
            d="M120 180 C120 150 145 125 175 125 C185 125 195 128 203 133 C214 110 238 95 265 95 C302 95 332 120 338 155 C345 152 352 150 360 150 C382 150 400 168 400 190 C400 212 382 230 360 230 L160 230 C138 230 120 208 120 180 Z"
            fill="url(#cloudGrad)"
          />
        </g>

        {/* Top-Right Clouds */}
        <g opacity="0.85">
          <path
            d="M1650 220 C1650 195 1670 175 1695 175 C1703 175 1711 177 1718 181 C1727 162 1747 150 1770 150 C1801 150 1826 171 1831 200 C1837 197 1843 195 1850 195 C1868 195 1883 210 1883 228 C1883 246 1868 261 1850 261 L1680 261 C1663 261 1650 243 1650 220 Z"
            fill="url(#cloudGrad)"
          />
        </g>

        {/* Mid-Sky Soft Floating Cloud */}
        <g opacity="0.6">
          <path
            d="M70 320 C70 300 86 284 106 284 C112 284 118 286 123 289 C130 274 146 264 164 264 C188 264 208 280 212 303 C217 301 222 300 227 300 C241 300 253 312 253 326 C253 340 241 352 227 352 L90 352 C79 352 70 338 70 320 Z"
            fill="url(#cloudGrad)"
          />
        </g>

        {/* 3. Rainbow on the Left Hill */}
        <g transform="translate(320, 520)">
          {/* Curved rainbow band */}
          <path
            d="M 0 160 A 160 160 0 0 1 160 0 L 160 30 A 130 130 0 0 0 30 160 Z"
            fill="#FF4B4B"
          />
          <path
            d="M 30 160 A 130 130 0 0 1 160 30 L 160 55 A 105 105 0 0 0 55 160 Z"
            fill="#C9281D"
          />
          <path
            d="M 55 160 A 105 105 0 0 1 160 55 L 160 80 A 80 80 0 0 0 80 160 Z"
            fill="#FFE033"
          />
          <path
            d="M 80 160 A 80 80 0 0 1 160 80 L 160 105 A 55 55 0 0 0 105 160 Z"
            fill="#45CD45"
          />
          <path
            d="M 105 160 A 55 55 0 0 1 160 105 L 160 130 A 30 30 0 0 0 130 160 Z"
            fill="#27B4F3"
          />
          <path
            d="M 130 160 A 30 30 0 0 1 160 130 L 160 148 A 12 12 0 0 0 148 160 Z"
            fill="#A04CEB"
          />
        </g>

        {/* 4. Distant Indian Ayodhya Golden Temple Spires & Palace Domes (Ramayana Heritage) */}
        <g id="distantTemples">
          {/* Spire 1 (Left Pavilion) */}
          <path d="M 680 730 L 700 640 Q 710 630 715 610 Q 720 630 730 640 L 750 730 Z" fill="url(#templeGrad)" opacity="0.9" />
          <circle cx="715" cy="605" r="5" fill="#FFE58F" />
          <line x1="715" y1="600" x2="715" y2="592" stroke="#FFE58F" strokeWidth="2" />

          {/* Spire 2 (Grand Shikhara Tower) */}
          <path d="M 735 730 L 755 610 Q 770 590 775 560 Q 780 590 795 610 L 815 730 Z" fill="url(#templeGrad)" />
          <circle cx="775" cy="555" r="7" fill="#FFF0A6" />
          <line x1="775" y1="548" x2="775" y2="538" stroke="#FFF0A6" strokeWidth="2.5" />
          {/* Shikhara ornamental grooves */}
          <ellipse cx="775" cy="630" rx="22" ry="6" fill="#C88219" opacity="0.4" />
          <ellipse cx="775" cy="665" rx="28" ry="7" fill="#C88219" opacity="0.4" />

          {/* Central Ayodhya Royal Dome */}
          <path d="M 790 730 L 800 650 Q 825 615 850 615 Q 875 615 900 650 L 910 730 Z" fill="url(#templeGrad)" />
          <circle cx="850" cy="610" r="6" fill="#FFE58F" />
          <line x1="850" y1="604" x2="850" y2="596" stroke="#FFE58F" strokeWidth="2" />

          {/* Spire 3 (Right Shikhara) */}
          <path d="M 885 730 L 905 635 Q 920 620 925 595 Q 930 620 945 635 L 965 730 Z" fill="url(#templeGrad)" opacity="0.95" />
          <circle cx="925" cy="590" r="5" fill="#FFE58F" />
          <line x1="925" y1="585" x2="925" y2="577" stroke="#FFE58F" strokeWidth="2" />
        </g>

        {/* 5. Midground Rolling Hills & Rounded Green Forest Bushes */}
        <g id="midgroundHills">
          {/* Distant Rolling Ridge */}
          <path
            d="M -50 780 Q 200 680 480 730 Q 750 780 1050 710 Q 1350 640 1650 690 Q 1820 720 1970 700 L 1970 1080 L -50 1080 Z"
            fill="url(#midHillGrad)"
          />

          {/* Clustered Bush Canopy in Midground (Papumba Clump Style) */}
          <ellipse cx="280" cy="740" rx="60" ry="40" fill="#3D932B" />
          <ellipse cx="340" cy="735" rx="75" ry="50" fill="#4AA832" />
          <ellipse cx="410" cy="745" rx="65" ry="45" fill="#368822" />

          <ellipse cx="980" cy="710" rx="70" ry="45" fill="#3D932B" />
          <ellipse cx="1040" cy="700" rx="85" ry="55" fill="#4AA832" />
          <ellipse cx="1110" cy="715" rx="75" ry="50" fill="#368822" />

          <ellipse cx="1450" cy="685" rx="70" ry="45" fill="#3D932B" />
          <ellipse cx="1510" cy="675" rx="80" ry="50" fill="#4AA832" />
          <ellipse cx="1580" cy="690" rx="75" ry="48" fill="#368822" />
        </g>

        {/* 6. Foreground Lush Green Rolling Hills (Exact Papumba Contour & Valley Dip) */}
        <g id="foregroundHills">
          {/* Main Foreground Hill Shape: Left hill curves down, valley dips at center, right hill rises high */}
          <path
            d="M -60 760 C 150 760 300 860 520 900 C 720 940 860 925 960 920 C 1100 915 1300 870 1520 800 C 1700 745 1850 720 1980 710 L 1980 1100 L -60 1100 Z"
            fill="url(#foreHillGrad)"
          />

          {/* Shaded Bush Layer on Left Foreground */}
          <ellipse cx="130" cy="780" rx="85" ry="60" fill="#368C24" />
          <ellipse cx="190" cy="810" rx="70" ry="50" fill="#43A02C" />

          {/* Shaded Bush Clump on Right Foreground Hill (Behind Mascot) */}
          <ellipse cx="1360" cy="880" rx="90" ry="65" fill="#2E7E1D" />
          <ellipse cx="1420" cy="900" rx="75" ry="55" fill="#3D9828" />
        </g>

        {/* 7. Indian Mango Tree on the Left Hill (Storybook Style with Golden Mangoes) */}
        <g id="indianMangoTree" transform="translate(40, 560)">
          {/* Trunk */}
          <path
            d="M 120 400 C 115 320 100 240 85 180 C 105 180 135 220 145 280 C 160 250 180 200 170 160 C 190 190 190 230 180 280 C 190 320 185 360 180 400 Z"
            fill="#7C4B37"
          />
          {/* Bark shadow accent */}
          <path
            d="M 120 400 C 115 330 105 260 90 200 C 95 200 105 240 115 300 C 120 340 120 370 120 400 Z"
            fill="#643B2B"
          />

          {/* Mango Tree Foliage Canopy (Layered Clouds of Green) */}
          <ellipse cx="80" cy="180" rx="75" ry="65" fill="#2E7E1D" />
          <ellipse cx="150" cy="130" rx="95" ry="80" fill="#399525" />
          <ellipse cx="220" cy="170" rx="80" ry="70" fill="#46A92E" />
          <ellipse cx="110" cy="220" rx="70" ry="55" fill="#399525" />
          <ellipse cx="180" cy="230" rx="75" ry="60" fill="#4CB533" />
          <ellipse cx="140" cy="170" rx="65" ry="55" fill="#58C43D" />

          {/* Ripe Golden Indian Mangoes Hanging from Leaves */}
          <g id="mangoes">
            {/* Mango 1 */}
            <path d="M 75 160 Q 65 185 80 195 Q 95 185 85 160 Z" fill="#FFAE00" />
            <circle cx="78" cy="170" r="3" fill="#FFD54F" />

            {/* Mango 2 */}
            <path d="M 130 120 Q 120 145 135 155 Q 150 145 140 120 Z" fill="#FFAE00" />
            <circle cx="133" cy="130" r="3" fill="#FFD54F" />

            {/* Mango 3 */}
            <path d="M 195 150 Q 185 175 200 185 Q 215 175 205 150 Z" fill="#FFAE00" />
            <circle cx="198" cy="160" r="3" fill="#FFD54F" />

            {/* Mango 4 */}
            <path d="M 110 200 Q 100 225 115 235 Q 130 225 120 200 Z" fill="#FFAE00" />
            <circle cx="113" cy="210" r="3" fill="#FFD54F" />

            {/* Mango 5 */}
            <path d="M 165 210 Q 155 235 170 245 Q 185 235 175 210 Z" fill="#FFAE00" />
            <circle cx="168" cy="220" r="3" fill="#FFD54F" />

            {/* Mango 6 */}
            <path d="M 235 190 Q 225 215 240 225 Q 255 215 245 190 Z" fill="#FFAE00" />
            <circle cx="238" cy="200" r="3" fill="#FFD54F" />
          </g>
        </g>

        {/* 8. Scattered Marigold Blossoms on the Rolling Green Hill */}
        <g id="marigolds">
          <circle cx="480" cy="910" r="7" fill="#C9281D" />
          <circle cx="480" cy="910" r="4" fill="#FFD54F" />

          <circle cx="620" cy="935" r="8" fill="#C9281D" />
          <circle cx="620" cy="935" r="4.5" fill="#FFD54F" />

          <circle cx="780" cy="940" r="7.5" fill="#C9281D" />
          <circle cx="780" cy="940" r="4" fill="#FFD54F" />

          <circle cx="1120" cy="935" r="8" fill="#C9281D" />
          <circle cx="1120" cy="935" r="4.5" fill="#FFD54F" />

          <circle cx="1260" cy="910" r="7" fill="#C9281D" />
          <circle cx="1260" cy="910" r="4" fill="#FFD54F" />

          <circle cx="1480" cy="850" r="8" fill="#C9281D" />
          <circle cx="1480" cy="850" r="4.5" fill="#FFD54F" />

          <circle cx="1650" cy="800" r="7.5" fill="#C9281D" />
          <circle cx="1650" cy="800" r="4" fill="#FFD54F" />

          <circle cx="1800" cy="760" r="8" fill="#C9281D" />
          <circle cx="1800" cy="760" r="4.5" fill="#FFD54F" />
        </g>
      </svg>
    </div>
  );
}
