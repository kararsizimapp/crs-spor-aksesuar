import React from 'react';

interface CrsSporLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'white'; // 'light' for white/light header, 'dark' for dark header, 'white' for pure white on dark
}

export const CrsSporLogo: React.FC<CrsSporLogoProps> = ({
  className = "h-11",
  variant = 'light',
}) => {
  const isDark = variant === 'dark' || variant === 'white';
  // Primary monogram/text color
  const primaryColor = isDark ? '#FFFFFF' : '#111827'; 
  // Red color for the stylized R
  const redColor = '#DC2626'; // Vivid Sport Red

  return (
    <div className={`inline-flex items-center gap-2 group ${className}`}>
      <svg
        viewBox="0 0 1080 620"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain filter drop-shadow-xs"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* === CRS MONOGRAM EMBLEM === */}
        <g>
          {/* C - Left Outer Black/White Arm */}
          <path
            d="M 380 0 C 150 0 0 90 0 220 C 0 350 150 440 380 440 L 530 440 L 450 330 L 380 330 C 230 330 130 280 130 220 C 130 160 230 110 380 110 L 490 110 L 560 0 Z"
            fill={primaryColor}
          />

          {/* R - Middle Stylized Red Monogram */}
          <path
            d="M 380 0 L 300 110 L 570 110 C 650 110 715 135 715 205 C 715 275 650 295 570 295 L 375 295 L 305 185 L 420 185 C 475 185 545 185 545 205 C 545 225 480 225 430 225 L 515 345 L 640 345 C 700 345 740 375 740 440 L 530 440 Z"
            fill={redColor}
          />

          {/* S - Right Outer Black/White Arm */}
          <path
            d="M 610 0 L 1080 0 L 1080 110 L 735 110 C 860 110 1080 155 1080 275 C 1080 380 880 440 650 440 L 550 440 L 620 330 L 660 330 C 810 330 880 290 880 235 C 880 195 810 185 735 185 L 650 185 L 580 80 Z"
            fill={primaryColor}
          />
        </g>

        {/* === SPOR TEXT BELOW === */}
        <g fill={primaryColor}>
          {/* S */}
          <path d="M 60 480 L 220 480 C 240 480 250 495 240 515 L 220 525 C 190 535 120 525 120 535 C 120 545 160 550 200 550 L 240 550 L 220 580 L 60 580 C 40 580 30 565 40 545 L 60 535 C 90 525 160 535 160 525 C 160 515 120 510 80 510 L 40 510 Z" />

          {/* P */}
          <path d="M 300 480 L 440 480 C 480 480 500 500 485 525 C 470 550 435 555 395 555 L 340 555 L 320 580 L 270 580 Z M 355 505 L 415 505 C 435 505 440 515 430 530 C 420 540 405 540 385 540 L 345 540 Z" />

          {/* O */}
          <path d="M 570 480 C 650 480 720 500 700 530 C 680 560 600 580 520 580 C 440 580 370 560 390 530 C 410 500 490 480 570 480 Z M 560 505 C 500 505 450 515 440 530 C 430 545 470 555 530 555 C 590 555 640 545 650 530 C 660 515 620 505 560 505 Z" />

          {/* R */}
          <path d="M 770 480 L 910 480 C 950 480 970 500 955 520 C 945 535 925 540 900 542 L 950 580 L 890 580 L 845 545 L 810 545 L 785 580 L 735 580 Z M 825 505 L 885 505 C 905 505 910 515 900 528 C 890 538 875 538 855 538 L 815 538 Z" />
        </g>
      </svg>
    </div>
  );
};
