// ✅ Sparkle must be defined BEFORE GenerateButton

function Sparkle({ size, color, className }) {
  return (
    <span className={className}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={`M${size / 2} 0 L${size / 2 + size * 0.064} ${size * 0.4} L${size} ${size / 2} L${size / 2 + size * 0.064} ${size * 0.6} L${size / 2} ${size} L${size / 2 - size * 0.064} ${size * 0.6} L0 ${size / 2} L${size / 2 - size * 0.064} ${size * 0.4} Z`}
          fill={color}
        />
      </svg>
    </span>
  );
}

export default function GenerateButton() {
  return (
    <div className="flex items-center justify-center min-h-[100px] self-end  rounded-2xl">
      <button
        className="
          relative inline-flex items-center gap-3 px-6 py-3
          text-xs font-medium text-green-100 m-5
          bg-green-900 rounded-full border-none cursor-pointer
          transition-transform duration-200
          hover:bg-green-700 hover:scale-105
          animate-pulse-glow
        "
        style={{
          boxShadow:
            "0 0 20px 6px rgba(34,197,94,0.6), 0 0 50px 14px rgba(34,197,94,0.3), 0 0 90px 28px rgba(34,197,94,0.15)",
        }}
      >
        <Sparkle
          size={14}
          color="#bbffcc"
          className="absolute -top-3 left-4 animate-twinkle [animation-delay:0s]"
        />
        <Sparkle
          size={10}
          color="#d4ffe0"
          className="absolute -top-2 right-5 animate-twinkle [animation-delay:0.5s]"
        />
        <Sparkle
          size={12}
          color="#a0ffb8"
          className="absolute -bottom-2 left-10 animate-twinkle [animation-delay:0.9s]"
        />
        <Sparkle
          size={9}
          color="#c8ffd8"
          className="absolute -bottom-3 right-10 animate-twinkle [animation-delay:0.3s]"
        />
        <Sparkle
          size={11}
          color="#90ffb0"
          className="absolute top-1/2 -left-4 -translate-y-1/2 animate-twinkle [animation-delay:0.7s]"
        />
        <Sparkle
          size={10}
          color="#b0ffc8"
          className="absolute top-1/2 -right-4 -translate-y-1/2 animate-twinkle [animation-delay:1.1s]"
        />
        {/* Wand Icon */}
        <svg width="15" height="22" viewBox="0 0 22 22" fill="none">
          <line
            x1="3"
            y1="19"
            x2="14"
            y2="8"
            stroke="#d0ffe8"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path d="M14 8 L16 5 L19 3 L17 6 L14 8Z" fill="#d0ffe8" />
          <circle cx="19" cy="3" r="1.5" fill="#ffffff" />
          <path
            d="M6 6 L6.5 8 L8 8 L6.8 9 L7.3 11 L6 9.8 L4.7 11 L5.2 9 L4 8 L5.5 8 Z"
            fill="#c0ffdc"
            opacity="0.9"
          />
        </svg>
        Generate Paper 
      </button>
    </div>
  );
}
