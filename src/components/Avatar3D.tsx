import React from 'react';

interface Avatar3DProps {
  avatar: string; // '🐷', '🐽', '🐖', '🐍' or 'PIG' | 'SNAKE'
  size?: 'xs' | 'sm' | 'board' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function isSnakeAvatar(avatar: string): boolean {
  return avatar === '🐍' || avatar.toUpperCase().includes('SNAKE') || avatar.toUpperCase().includes('ULAR');
}

const SIZE_MAP: Record<NonNullable<Avatar3DProps['size']>, string> = {
  xs: 'w-6 h-6 sm:w-8 sm:h-8',
  sm: 'w-8 h-8 sm:w-10 sm:h-10',
  board: 'w-9 h-9 sm:w-12 sm:h-12',
  md: 'w-11 h-11 sm:w-12 sm:h-12',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

/**
 * Renders a glossy 3D-shaded toy figurine (Pig or Snake) with specular highlights,
 * subsurface gradients, and drop shadows.
 */
export const Avatar3D: React.FC<Avatar3DProps> = ({
  avatar,
  size = 'md',
  className = '',
}) => {
  const isSnake = isSnakeAvatar(avatar);
  const uid = React.useId().replace(/:/g, '');

  if (!isSnake) {
    // 3D Cute Glossy Chibi Pig Figurine
    return (
      <div
        className={`relative inline-flex items-center justify-center select-none shrink-0 ${SIZE_MAP[size]} ${className}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]"
        >
          <defs>
            {/* 3D Main Sphere Radial Gradient for Pig Head */}
            <radialGradient id={`pigBody-${uid}`} cx="35%" cy="28%" r="68%">
              <stop offset="0%" stopColor="#FFD1E3" />
              <stop offset="45%" stopColor="#FB7185" />
              <stop offset="82%" stopColor="#E11D48" />
              <stop offset="100%" stopColor="#9F1239" />
            </radialGradient>

            {/* 3D Ear Gradient */}
            <linearGradient id={`pigEar-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDA4AF" />
              <stop offset="100%" stopColor="#BE123C" />
            </linearGradient>

            {/* 3D Snout Gradient */}
            <radialGradient id={`pigSnout-${uid}`} cx="38%" cy="32%" r="65%">
              <stop offset="0%" stopColor="#FFE4E6" />
              <stop offset="55%" stopColor="#FDA4AF" />
              <stop offset="100%" stopColor="#E11D48" />
            </radialGradient>

            {/* Eye Gloss */}
            <radialGradient id={`eyeDark-${uid}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>

          {/* Pedestal Base Shadow */}
          <ellipse cx="50" cy="91" rx="34" ry="7" fill="rgba(0,0,0,0.35)" />

          {/* Left 3D Ear */}
          <path
            d="M 24 34 C 10 18, 12 8, 28 14 C 35 16, 38 24, 36 30 Z"
            fill={`url(#pigEar-${uid})`}
            stroke="#881337"
            strokeWidth="2"
          />
          <path
            d="M 24 29 C 16 19, 18 13, 27 17 Z"
            fill="#FECDD3"
            opacity="0.7"
          />

          {/* Right 3D Ear */}
          <path
            d="M 76 34 C 90 18, 88 8, 72 14 C 65 16, 62 24, 64 30 Z"
            fill={`url(#pigEar-${uid})`}
            stroke="#881337"
            strokeWidth="2"
          />
          <path
            d="M 76 29 C 84 19, 82 13, 73 17 Z"
            fill="#FECDD3"
            opacity="0.7"
          />

          {/* Main 3D Chubby Pig Head Sphere */}
          <circle
            cx="50"
            cy="52"
            r="38"
            fill={`url(#pigBody-${uid})`}
            stroke="#FFF1F2"
            strokeWidth="2"
          />

          {/* Top-Left Glossy 3D Specular Highlight */}
          <ellipse
            cx="35"
            cy="28"
            rx="14"
            ry="7"
            transform="rotate(-24 35 28)"
            fill="white"
            opacity="0.55"
          />
          <circle cx="24" cy="36" r="3" fill="white" opacity="0.45" />

          {/* Rosy 3D Cheeks */}
          <ellipse cx="23" cy="58" rx="6.5" ry="4.5" fill="#F43F5E" opacity="0.75" />
          <ellipse cx="77" cy="58" rx="6.5" ry="4.5" fill="#F43F5E" opacity="0.75" />

          {/* Left 3D Glossy Eye */}
          <circle cx="34" cy="46" r="6.5" fill={`url(#eyeDark-${uid})`} />
          <circle cx="32" cy="43.5" r="2.3" fill="white" />
          <circle cx="36" cy="48" r="1" fill="white" opacity="0.8" />

          {/* Right 3D Glossy Eye */}
          <circle cx="66" cy="46" r="6.5" fill={`url(#eyeDark-${uid})`} />
          <circle cx="64" cy="43.5" r="2.3" fill="white" />
          <circle cx="68" cy="48" r="1" fill="white" opacity="0.8" />

          {/* Snout Drop Shadow for 3D Extrusion */}
          <ellipse cx="50" cy="60" rx="16.5" ry="12" fill="#881337" opacity="0.45" />

          {/* 3D Protruding Pig Snout */}
          <ellipse
            cx="50"
            cy="57"
            rx="16"
            ry="11.5"
            fill={`url(#pigSnout-${uid})`}
            stroke="#FB7185"
            strokeWidth="1.5"
          />
          {/* Snout Top Highlight */}
          <ellipse cx="45" cy="51" rx="7" ry="2.8" fill="white" opacity="0.6" />

          {/* 3D Nostrils */}
          <ellipse cx="44" cy="57.5" rx="3.2" ry="4.5" fill="#881337" />
          <ellipse cx="56" cy="57.5" rx="3.2" ry="4.5" fill="#881337" />

          {/* Cute Happy 3D Smile */}
          <path
            d="M 43 72 Q 50 78 57 72"
            fill="none"
            stroke="#881337"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // 3D Cute Glossy Emerald Snake Figurine
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${SIZE_MAP[size]} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]"
      >
        <defs>
          {/* 3D Emerald Sphere Radial Gradient for Snake Head */}
          <radialGradient id={`snakeHead-${uid}`} cx="35%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="40%" stopColor="#34D399" />
            <stop offset="80%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064E3B" />
          </radialGradient>

          {/* 3D Lower Coil Gradient */}
          <linearGradient id={`snakeCoil-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          {/* Golden Yellow 3D Reptile Eye */}
          <radialGradient id={`snakeEye-${uid}`} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="70%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>
        </defs>

        {/* Pedestal Base Shadow */}
        <ellipse cx="50" cy="92" rx="35" ry="7" fill="rgba(0,0,0,0.38)" />

        {/* 3D Coiled Snake Body Base */}
        <ellipse
          cx="50"
          cy="76"
          rx="32"
          ry="13"
          fill={`url(#snakeCoil-${uid})`}
          stroke="#064E3B"
          strokeWidth="2"
        />
        {/* Coil Specular Shine */}
        <path
          d="M 26 74 Q 50 82 74 74"
          fill="none"
          stroke="#A7F3D0"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Cute Golden Crown / Crest on Top of 3D Snake */}
        <path
          d="M 38 19 L 43 9 L 50 15 L 57 9 L 62 19 Z"
          fill="#FBBF24"
          stroke="#FEF3C7"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Main 3D Snake Head Sphere */}
        <ellipse
          cx="50"
          cy="48"
          rx="35"
          ry="31"
          fill={`url(#snakeHead-${uid})`}
          stroke="#ECFDF5"
          strokeWidth="2"
        />

        {/* Top-Left 3D Glossy Specular Highlight */}
        <ellipse
          cx="35"
          cy="29"
          rx="13"
          ry="6.5"
          transform="rotate(-22 35 29)"
          fill="white"
          opacity="0.6"
        />
        <circle cx="24" cy="37" r="2.8" fill="white" opacity="0.45" />

        {/* Cute Scales Pattern on Forehead */}
        <circle cx="50" cy="27" r="3" fill="#A7F3D0" opacity="0.65" />
        <circle cx="43" cy="31" r="2.3" fill="#A7F3D0" opacity="0.5" />
        <circle cx="57" cy="31" r="2.3" fill="#A7F3D0" opacity="0.5" />

        {/* Left 3D Big Cute Golden Eye */}
        <circle
          cx="34"
          cy="46"
          r="8.5"
          fill={`url(#snakeEye-${uid})`}
          stroke="#064E3B"
          strokeWidth="1.5"
        />
        <ellipse cx="34" cy="46" rx="3" ry="6.2" fill="#020617" />
        <circle cx="31.5" cy="43" r="2.5" fill="white" />

        {/* Right 3D Big Cute Golden Eye */}
        <circle
          cx="66"
          cy="46"
          r="8.5"
          fill={`url(#snakeEye-${uid})`}
          stroke="#064E3B"
          strokeWidth="1.5"
        />
        <ellipse cx="66" cy="46" rx="3" ry="6.2" fill="#020617" />
        <circle cx="63.5" cy="43" r="2.5" fill="white" />

        {/* Cute Blush Cheeks */}
        <ellipse cx="22" cy="54" rx="5" ry="3.2" fill="#FB7185" opacity="0.65" />
        <ellipse cx="78" cy="54" rx="5" ry="3.2" fill="#FB7185" opacity="0.65" />

        {/* Cute Smile & Nostrils */}
        <circle cx="46" cy="54" r="1.6" fill="#064E3B" />
        <circle cx="54" cy="54" r="1.6" fill="#064E3B" />
        <path
          d="M 40 61 Q 50 67 60 61"
          fill="none"
          stroke="#064E3B"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Cute 3D Forked Pink Tongue */}
        <path
          d="M 48 64 L 48 76 L 44 82 M 48 76 L 52 82"
          fill="none"
          stroke="#F43F5E"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
