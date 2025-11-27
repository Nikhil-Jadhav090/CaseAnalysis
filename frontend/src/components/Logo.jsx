import React from 'react';

const Logo = ({ size = 'default', className = '' }) => {
  const sizes = {
    small: { width: 32, height: 32, fontSize: 'text-sm' },
    default: { width: 40, height: 40, fontSize: 'text-base' },
    large: { width: 56, height: 56, fontSize: 'text-xl' }
  };

  const { width, height, fontSize } = sizes[size] || sizes.default;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* Shield Base - Represents Security & Justice */}
        <path
          d="M100 20 L40 50 L40 100 Q40 150 100 180 Q160 150 160 100 L160 50 Z"
          fill="url(#logoGradient)"
          opacity="0.9"
        />

        {/* Inner Shield Border */}
        <path
          d="M100 35 L55 58 L55 100 Q55 138 100 162 Q145 138 145 100 L145 58 Z"
          fill="white"
          opacity="0.15"
        />

        {/* Scale of Justice - Left Side */}
        <circle cx="70" cy="95" r="12" fill="white" opacity="0.9" />
        <rect x="68" y="107" width="4" height="25" fill="white" opacity="0.9" />

        {/* Scale of Justice - Right Side */}
        <circle cx="130" cy="95" r="12" fill="white" opacity="0.9" />
        <rect x="128" y="107" width="4" height="25" fill="white" opacity="0.9" />

        {/* Balance Beam */}
        <rect x="65" y="93" width="70" height="4" fill="white" opacity="0.9" />

        {/* Center Pillar */}
        <rect x="98" y="70" width="4" height="62" fill="white" opacity="0.9" />

        {/* AI Circuit Pattern - Top */}
        <circle cx="100" cy="55" r="6" fill="url(#accentGradient)" />
        <circle cx="85" cy="65" r="3" fill="white" opacity="0.7" />
        <circle cx="115" cy="65" r="3" fill="white" opacity="0.7" />
        <line x1="100" y1="61" x2="85" y2="65" stroke="white" strokeWidth="1.5" opacity="0.7" />
        <line x1="100" y1="61" x2="115" y2="65" stroke="white" strokeWidth="1.5" opacity="0.7" />

        {/* Document/Analysis Lines - Bottom */}
        <rect x="75" y="140" width="50" height="3" rx="1.5" fill="white" opacity="0.8" />
        <rect x="75" y="150" width="40" height="3" rx="1.5" fill="white" opacity="0.6" />
        <rect x="75" y="160" width="45" height="3" rx="1.5" fill="white" opacity="0.4" />
      </svg>

      {/* Logo Text */}
      <div className="flex flex-col leading-tight">
        <span className={`font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent ${fontSize}`}>
          Case Analysis
        </span>
        <span className="text-[10px] text-gray-400 tracking-wider uppercase">AI Powered</span>
      </div>
    </div>
  );
};

export default Logo;
