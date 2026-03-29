"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// ── SVG Icons ───────────────────────────────────────────────────────────────
const GoldCrownSVG = () => (
  <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
    <path d="M1 16L4 6L8.5 11L11 3L13.5 11L18 6L21 16H1Z" fill="#D4AF37" stroke="#B8960C" strokeWidth="1.2" strokeLinejoin="round"/>
    <rect x="1" y="15" width="20" height="2.5" rx="1.25" fill="#B8960C"/>
  </svg>
);

const SilverMedalSVG = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" fill="#C0C0C0" stroke="#A8A8A8" strokeWidth="1.2"/>
    <circle cx="10" cy="10" r="6" fill="#D8D8D8"/>
    <path d="M10 5L11.5 8.5H15L12.2 10.8L13.3 14.5L10 12.5L6.7 14.5L7.8 10.8L5 8.5H8.5L10 5Z" fill="#A0A0A0"/>
  </svg>
);

const BronzeMedalSVG = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="9" fill="#CD7F32" stroke="#A0622A" strokeWidth="1.2"/>
    <circle cx="10" cy="10" r="6" fill="#D4924A"/>
    <path d="M10 5L11.5 8.5H15L12.2 10.8L13.3 14.5L10 12.5L6.7 14.5L7.8 10.8L5 8.5H8.5L10 5Z" fill="#8B5E20"/>
  </svg>
);

const UploadSVG = ({ stroke = "#2D6A2D" }) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M8 1L8 11M8 1L5 4M8 1L11 4" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12V13.5C2 14.3 2.7 15 3.5 15H12.5C13.3 15 14 14.3 14 13.5V12" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const SaveSVG = ({ stroke = "#2D6A2D" }) => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M3 2H10.5L14 5.5V14C14 14.6 13.6 15 13 15H3C2.4 15 2 14.6 2 14V3C2 2.4 2.4 2 3 2Z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round"/>
    <rect x="5" y="2" width="6" height="4" rx="0.5" stroke={stroke} strokeWidth="1.4"/>
    <rect x="4" y="9" width="8" height="5" rx="1" stroke={stroke} strokeWidth="1.4"/>
  </svg>
);

const CoinSVG = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6.2" fill="#F5C842" stroke="#D4A017" strokeWidth="1.1"/>
    <circle cx="7" cy="7" r="4" fill="#F9D85E"/>
    <text x="7" y="10.5" textAnchor="middle" fontSize="5.5" fill="#B8860B" fontWeight="bold">₹</text>
  </svg>
);

const TrendUpSVG = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M1 10L5 6L8 9L13 3" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.5 3H13V6.5" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrendDownSVG = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M1 4L5 8L8 5L13 11" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.5 11H13V7.5" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FireSVG = () => (
  <svg width="13" height="15" viewBox="0 0 14 16" fill="none">
    <path d="M7 1C7 1 10 4 10 7C10 7 11 5.5 11 4C13 6 13 9 11 11.5C11 11.5 11 13 9.5 14C9.5 14 10 12 8.5 11C8.5 11 9 13 7 14C5 13 5.5 11 5.5 11C4 12 4.5 14 4.5 14C3 13 3 11.5 3 11.5C1 9 1 6 3 4C3 5.5 4 7 4 7C4 4 7 1 7 1Z" fill="#F97316" stroke="#EA580C" strokeWidth="0.5"/>
    <path d="M7 8C7 8 8.5 9.5 8 11C7.5 12 6.5 12 6 11C5.5 10 6 8.5 7 8Z" fill="#FED7AA"/>
  </svg>
);

const ShieldSVG = () => (
  <svg width="13" height="14" viewBox="0 0 14 15" fill="none">
    <path d="M7 1L13 3.5V8C13 11 10.5 13.5 7 14.5C3.5 13.5 1 11 1 8V3.5L7 1Z" fill="#166534" stroke="#14532D" strokeWidth="0.8"/>
    <path d="M4.5 7.5L6.5 9.5L9.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StarSVG = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1L8 5H12.5L9 7.5L10.5 12L6.5 9.5L2.5 12L4 7.5L0.5 5H5L6.5 1Z" fill="#F5C842" stroke="#D4A017" strokeWidth="0.6"/>
  </svg>
);

const VaultLockSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" fill="white" opacity="0.9"/>
    <path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
    <circle cx="12" cy="16.5" r="1.5" fill="#1a3d1f"/>
  </svg>
);

// ── Data ─────────────────────────────────────────────────────────────────────
const uploadLeaderboard = [
  { rank: 1, name: "Arjun Sharma",     college: "VIT Vellore",           uploads: 142, saves: 890,  coins: 2840, streak: 21, trend: "up",   delta: 3, joined: "Aug 2024", verified: true  },
  { rank: 2, name: "Priya Nair",       college: "BITS Pilani",           uploads: 128, saves: 760,  coins: 2560, streak: 14, trend: "up",   delta: 1, joined: "Sep 2024", verified: true  },
  { rank: 3, name: "Rohan Mehta",      college: "NIT Trichy",            uploads: 119, saves: 690,  coins: 2380, streak: 9,  trend: "same", delta: 0, joined: "Jul 2024", verified: false },
  { rank: 4, name: "Sneha Rao",        college: "SRM Chennai",           uploads: 97,  saves: 540,  coins: 1940, streak: 7,  trend: "up",   delta: 2, joined: "Oct 2024", verified: true  },
  { rank: 5, name: "Kiran Patel",      college: "DAIICT Gandhinagar",    uploads: 84,  saves: 430,  coins: 1680, streak: 5,  trend: "down", delta: 1, joined: "Nov 2024", verified: false },
  { rank: 6, name: "Deepika Menon",    college: "Amrita Coimbatore",     uploads: 76,  saves: 380,  coins: 1520, streak: 3,  trend: "up",   delta: 4, joined: "Dec 2024", verified: true  },
  { rank: 7, name: "Vikram Singh",     college: "DTU Delhi",             uploads: 68,  saves: 310,  coins: 1360, streak: 2,  trend: "down", delta: 2, joined: "Jan 2025", verified: false },
  { rank: 8, name: "Ananya Bose",      college: "Jadavpur University",   uploads: 59,  saves: 270,  coins: 1180, streak: 6,  trend: "up",   delta: 1, joined: "Feb 2025", verified: true  },
  { rank: 9, name: "Rahul Gupta",      college: "IIT Bombay",            uploads: 52,  saves: 220,  coins: 1040, streak: 4,  trend: "same", delta: 0, joined: "Mar 2025", verified: true  },
  { rank: 10, name: "Meera Krishnan", college: "PSG Tech Coimbatore",   uploads: 47,  saves: 190,  coins: 940,  streak: 1,  trend: "down", delta: 3, joined: "Apr 2025", verified: false },
];

const saveLeaderboard = [
  { rank: 1, name: "Tanvi Joshi",       college: "Savitribai Phule Pune",  uploads: 12, saves: 1240, coins: 920,  streak: 30, trend: "up",   delta: 5, joined: "Jul 2024", verified: true  },
  { rank: 2, name: "Aditya Kumar",      college: "Anna University",        uploads: 8,  saves: 1180, coins: 840,  streak: 22, trend: "up",   delta: 2, joined: "Aug 2024", verified: true  },
  { rank: 3, name: "Shreya Ghosh",      college: "Calcutta University",    uploads: 15, saves: 1050, coins: 760,  streak: 18, trend: "down", delta: 1, joined: "Sep 2024", verified: false },
  { rank: 4, name: "Nikhil Verma",      college: "GGSIPU Delhi",           uploads: 5,  saves: 980,  coins: 680,  streak: 12, trend: "up",   delta: 3, joined: "Oct 2024", verified: true  },
  { rank: 5, name: "Pooja Reddy",       college: "Osmania University",     uploads: 22, saves: 890,  coins: 620,  streak: 9,  trend: "same", delta: 0, joined: "Nov 2024", verified: false },
  { rank: 6, name: "Siddharth Nambiar", college: "Manipal University",     uploads: 7,  saves: 810,  coins: 560,  streak: 7,  trend: "up",   delta: 1, joined: "Dec 2024", verified: true  },
  { rank: 7, name: "Kavya Pillai",      college: "Kerala University",      uploads: 3,  saves: 730,  coins: 500,  streak: 5,  trend: "down", delta: 4, joined: "Jan 2025", verified: false },
  { rank: 8, name: "Harsh Tiwari",      college: "BHU Varanasi",           uploads: 19, saves: 650,  coins: 440,  streak: 3,  trend: "up",   delta: 2, joined: "Feb 2025", verified: true  },
  { rank: 9, name: "Divya Iyer",        college: "VIT Vellore",            uploads: 11, saves: 580,  coins: 380,  streak: 2,  trend: "same", delta: 0, joined: "Mar 2025", verified: false },
  { rank: 10, name: "Akash Shah",       college: "Gujarat University",     uploads: 4,  saves: 510,  coins: 320,  streak: 1,  trend: "down", delta: 2, joined: "Apr 2025", verified: true  },
];

const globalStats = [
  { label: "Contributors",   value: "12,480", sub: "active this month",      icon: "👥" },
  { label: "Papers Uploaded",value: "10,200+",sub: "across 200+ colleges",   icon: "📄" },
  { label: "Community Saves",value: "3,80,000",sub: "total saves all-time",  icon: "📥" },
  { label: "Coins Earned",   value: "4,20,000",sub: "distributed to students",icon: "🪙" },
];

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ target }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (!inView) return;
    const raw = target.replace(/[^0-9]/g, "");
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    const prefix = target.match(/^[₹]/) ? "₹" : "";
    const suffix = target.includes("+") ? "+" : "";
    let count = 0;
    const total = 60;
    const timer = setInterval(() => {
      count++;
      const current = Math.round((count / total) * num);
      setDisplay(`${prefix}${current.toLocaleString("en-IN")}${suffix}`);
      if (count >= total) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{display}</span>;
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ pct, delay = 0, gold = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="w-full h-[5px] rounded-full overflow-hidden" style={{ backgroundColor: "#e4ede0" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={inView ? { width: `${pct}%` } : { width: 0 }}
        transition={{ duration: 1, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="h-full rounded-full"
        style={{
          background: gold
            ? "linear-gradient(90deg, #D4AF37, #F5C842)"
            : "linear-gradient(90deg, #1a3d1f, #4ade80)"
        }}
      />
    </div>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────────────
const avatarPalette = [
  { bg: "#dff0d8", color: "#1a3d1f" },
  { bg: "#d4e8d0", color: "#145214" },
  { bg: "#e8f5e0", color: "#2D6A2D" },
  { bg: "#c8dfc0", color: "#0f3010" },
  { bg: "#f0f9f0", color: "#166534" },
];

function Avatar({ name, rank }) {
  const p = avatarPalette[rank % avatarPalette.length];
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] flex-shrink-0 select-none"
      style={{ backgroundColor: p.bg, color: p.color, border: `2px solid ${p.color}22` }}
    >
      {initials}
    </div>
  );
}

// ── Rank Badge ────────────────────────────────────────────────────────────────
function RankBadge({ rank }) {
  if (rank === 1) return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#fffbea", border: "2px solid #D4AF37" }}>
      <GoldCrownSVG />
    </div>
  );
  if (rank === 2) return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#f9f9f9", border: "2px solid #C0C0C0" }}>
      <SilverMedalSVG />
    </div>
  );
  if (rank === 3) return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#fff6f0", border: "2px solid #CD7F32" }}>
      <BronzeMedalSVG />
    </div>
  );
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#eef5ea", border: "1.5px solid #c8dfc0" }}>
      <span className="text-[13px] font-bold" style={{ color: "#2D6A2D" }}>#{rank}</span>
    </div>
  );
}

// ── Trend Badge ───────────────────────────────────────────────────────────────
function TrendBadge({ trend, delta }) {
  if (trend === "same") return <span className="text-[11px] font-semibold" style={{ color: "#b0c8a8" }}>—</span>;
  return (
    <div className={`flex items-center gap-0.5 ${trend === "up" ? "text-green-600" : "text-red-500"}`}>
      {trend === "up" ? <TrendUpSVG /> : <TrendDownSVG />}
      <span className="text-[11px] font-bold">{delta}</span>
    </div>
  );
}

// ── Top 3 Contributors Card (flat, like the screenshot) ──────────────────────
function Top3Card({ data, mode }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const top3 = data.slice(0, 3);
  // display order: 2nd, 1st, 3rd
  const displayOrder = [top3[1], top3[0], top3[2]];
  const displayRanks = [2, 1, 3];

  const primaryVal = (u) => mode === "uploads" ? u.uploads : u.saves;
  const metricLabel = mode === "uploads" ? "papers" : "saves";

  // Avatar colors matching the screenshot: #1 gold ring, #2 dark green, #3 navy
  const avatarStyle = {
    1: { bg: "#1a3d1f", color: "white",   ring: "#D4AF37", ringW: 3 },
    2: { bg: "#2d5a3d", color: "white",   ring: "#C0C0C0", ringW: 2 },
    3: { bg: "#1e3a5f", color: "white",   ring: "#CD7F32", ringW: 2 },
  };

  // Medal badge above avatar
  const medalEmoji = { 1: "🥇", 2: "🥈", 3: "🥉" };

  // Value color: gold for #1, normal for others
  const valColor = { 1: "#D4A017", 2: "#2D6A2D", 3: "#2D6A2D" };

  // Size: #1 slightly bigger
  const avatarSize = { 1: 72, 2: 60, 3: 60 };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="mb-6 rounded-2xl overflow-hidden"
      style={{ background: "white", border: "1.5px solid #e4ede0" }}
    >
      {/* Header row */}
      <div className="px-6 pt-5 pb-3 flex items-center gap-2">
        <span className="text-[10.5px] font-black uppercase tracking-[0.14em]" style={{ color: "#8aaa8a" }}>
          Top 3 Contributors
        </span>
      </div>

      {/* Three avatars */}
      <div className="flex items-end justify-center gap-10 px-8 pb-7 pt-2">
        {displayOrder.map((user, i) => {
          const rank = displayRanks[i];
          const av = avatarStyle[rank];
          const size = avatarSize[rank];
          const val = primaryVal(user);
          const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
          // short college name (first word)
          const shortCollege = user.college.split(" ")[0];
          const delay = rank === 1 ? 0.05 : rank === 2 ? 0.18 : 0.28;

          return (
            <motion.div
              key={rank}
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20, scale: 0.88 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.45, delay, type: "spring", stiffness: 180, damping: 18 }}
            >
              {/* Medal emoji above */}
              <motion.div
                className="text-[22px] leading-none"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: delay * 2 }}
              >
                {medalEmoji[rank]}
              </motion.div>

              {/* Avatar circle */}
              <div
                className="rounded-full flex items-center justify-center font-black select-none"
                style={{
                  width: size,
                  height: size,
                  background: av.bg,
                  color: av.color,
                  fontSize: size * 0.28,
                  border: `${av.ringW}px solid ${av.ring}`,
                  boxShadow: rank === 1
                    ? `0 0 0 4px #fffbea, 0 6px 24px ${av.ring}55`
                    : `0 0 0 3px #f2f5ee, 0 4px 12px rgba(0,0,0,0.10)`,
                }}
              >
                {initials}
              </div>

              {/* Name */}
              <div className="text-center mt-0.5">
                <div className="text-[13px] font-bold leading-tight" style={{ color: "#1a2e1a" }}>
                  {user.name.split(" ")[0]}{" "}
                  <span style={{ color: "#4a6a4a" }}>{user.name.split(" ")[1]?.charAt(0)}.</span>
                </div>
                {/* College short */}
                <div className="text-[10.5px] mt-0.5" style={{ color: "#9ab89a" }}>{shortCollege}</div>
                {/* Value */}
                <motion.div
                  className="text-[13px] font-black mt-1"
                  style={{ color: valColor[rank] }}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: delay + 0.35 }}
                >
                  {val.toLocaleString("en-IN")} {metricLabel}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Leaderboard Row ───────────────────────────────────────────────────────────
function LeaderboardRow({ user, index, mode, maxVal }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const isTop3 = user.rank <= 3;
  const primaryVal = mode === "uploads" ? user.uploads : user.saves;
  const pct = Math.round((primaryVal / maxVal) * 100);

  const rowBg = isTop3
    ? user.rank === 1
      ? { background: "linear-gradient(100deg, #fffbea 0%, #f5f9ee 100%)", borderColor: "#dfc87a" }
      : user.rank === 2
      ? { background: "linear-gradient(100deg, #f8f8f8 0%, #f2f5ee 100%)", borderColor: "#c0c0c0" }
      : { background: "linear-gradient(100deg, #fff8f2 0%, #f4f9f0 100%)", borderColor: "#cd9a72" }
    : { background: "#ffffff", borderColor: "#e4ede0" };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(26,61,31,0.08)" }}
      className="grid items-center gap-x-4 px-5 py-[14px] rounded-2xl border transition-all duration-200 cursor-default"
      style={{
        gridTemplateColumns: "44px 36px 1fr 90px 84px 76px 64px 46px",
        ...rowBg,
      }}
    >
      {/* Rank */}
      <RankBadge rank={user.rank} />

      {/* Avatar */}
      <Avatar name={user.name} rank={user.rank} />

      {/* Name + college + bar */}
      <div className="min-w-0 pr-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[13.5px] font-semibold leading-tight truncate" style={{ color: "#1a2e1a" }}>{user.name}</span>
          {user.verified && <ShieldSVG />}
          {user.streak >= 14 && <FireSVG />}
        </div>
        <div className="text-[11px] mt-0.5 truncate" style={{ color: "#7a9a7a" }}>{user.college}</div>
        <div className="mt-2 max-w-[220px]">
          <ProgressBar pct={pct} delay={index * 0.05 + 0.25} gold={user.rank === 1} />
        </div>
      </div>

      {/* Primary metric */}
      <div className="text-center">
        <div className="text-[17px] font-black" style={{ color: "#1a3d1f" }}>
          {primaryVal.toLocaleString("en-IN")}
        </div>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          {mode === "uploads" ? <UploadSVG /> : <SaveSVG />}
          <span className="text-[10px]" style={{ color: "#7a9a7a" }}>{mode === "uploads" ? "papers" : "saves"}</span>
        </div>
      </div>

      {/* Coins */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <CoinSVG size={13} />
          <span className="text-[14px] font-bold" style={{ color: "#7a5c00" }}>{user.coins.toLocaleString("en-IN")}</span>
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: "#b09040" }}>coins</div>
      </div>

      {/* Streak */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <FireSVG />
          <span className="text-[14px] font-bold" style={{ color: "#c05c00" }}>{user.streak}d</span>
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: "#9a7a5a" }}>streak</div>
      </div>

      {/* Joined */}
      <div className="text-center">
        <div className="text-[11.5px] font-medium" style={{ color: "#5a7a5a" }}>{user.joined}</div>
        <div className="text-[10px] mt-0.5" style={{ color: "#a0b8a0" }}>joined</div>
      </div>

      {/* Trend */}
      <div className="flex justify-center">
        <TrendBadge trend={user.trend} delta={user.delta} />
      </div>
    </motion.div>
  );
}

// ── Toaster ───────────────────────────────────────────────────────────────────
function Toaster({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.92 }}
            transition={{ duration: 0.28 }}
            className="flex items-center gap-3 text-white px-5 py-3 rounded-2xl shadow-2xl text-[13px] font-semibold"
            style={{ background: "#1a3d1f", minWidth: 240 }}
          >
            <span>{t.icon}</span>
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [tab, setTab] = useState("uploads");
  const [period, setPeriod] = useState("all");
  const [toasts, setToasts] = useState([]);

  const addToast = (msg, icon = "✅") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: msg, icon }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  useEffect(() => {
    const t = setTimeout(() => addToast("Leaderboard is live & updating!", "📊"), 1500);
    return () => clearTimeout(t);
  }, []);

  const data = tab === "uploads" ? uploadLeaderboard : saveLeaderboard;
  const maxVal = tab === "uploads"
    ? Math.max(...uploadLeaderboard.map(u => u.uploads))
    : Math.max(...saveLeaderboard.map(u => u.saves));

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="min-h-screen" style={{ background: "#f2f5ee", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Hero Header ── */}
      <header className="mx-auto px-10 pt-12 pb-8" style={{ maxWidth: 1440 }}>
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 text-white text-[11.5px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5"
            style={{ background: "#1a3d1f" }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#4ade80" }} />
            Live Rankings · Refreshed Every Hour
          </motion.div>

          <h1 className="text-[52px] font-black leading-[1.0] tracking-tight mb-3" style={{ color: "#1a3d1f" }}>
            Community<br />
            <span style={{ color: "#2D6A2D" }}>Leaderboard</span>
          </h1>
          <p className="text-[15px] max-w-[440px] mx-auto leading-relaxed" style={{ color: "#5a7a5a" }}>
            The students who power Vault — ranked by their contributions to India's largest student exam paper library.
          </p>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-4 gap-4"
        >
          {globalStats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="text-center rounded-2xl px-5 py-5"
              style={{ background: "white", border: "1.5px solid #dce8d4" }}
            >
              <div className="text-[28px] font-black" style={{ color: "#1a3d1f" }}>
                <AnimatedNumber target={s.value} />
              </div>
              <div className="text-[12px] font-semibold mt-1" style={{ color: "#2D6A2D" }}>{s.label}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "#8aaa8a" }}>{s.sub}</div>
            </motion.div>
          ))}
        </motion.div>
      </header>

      {/* ── Leaderboard Body ── */}
      <main className="mx-auto px-10 pb-20" style={{ maxWidth: 1440 }}>

        {/* ── Your Position Card (top, above controls) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 rounded-2xl px-6 py-4 flex items-center justify-between gap-4"
          style={{ background: "linear-gradient(110deg, #1a3d1f 0%, #2D6A2D 100%)" }}
        >
          {/* Left: avatar + rank + name + college */}
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-black text-[15px] flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.18)", color: "white", border: "2px solid rgba(255,255,255,0.25)" }}
            >
              AX
            </div>
            <div>
              <div className="text-[10.5px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "#86efac" }}>
                Your Position
              </div>
              <div className="text-[15px] font-black text-white leading-tight">
                Rank #23 — Alex
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "#86efac" }}>COEP Pune</div>
            </div>
          </div>

          {/* Right: stats + CTA */}
          <div className="flex items-center gap-7">
            {/* Papers */}
            <div className="text-center">
              <div className="text-[11px] font-semibold mb-1" style={{ color: "#86efac" }}>Papers</div>
              <div className="text-[18px] font-black text-white">18</div>
            </div>
            {/* Coins */}
            <div className="text-center">
              <div className="text-[11px] font-semibold mb-1" style={{ color: "#86efac" }}>Coins</div>
              <div className="flex items-center justify-center gap-1">
                <CoinSVG size={15} />
                <span className="text-[18px] font-black text-white">91</span>
              </div>
            </div>
            {/* Streak */}
            <div className="text-center">
              <div className="text-[11px] font-semibold mb-1" style={{ color: "#86efac" }}>Streak</div>
              <div className="flex items-center justify-center gap-1">
                <FireSVG />
                <span className="text-[18px] font-black text-white">3d</span>
              </div>
            </div>
            {/* CTA button */}
            <motion.button
              onClick={() => addToast("Upload a paper to climb the ranks!", "🚀")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="font-black text-[13px] px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors duration-200"
              style={{ background: "#F5C842", color: "#1a3d1f" }}
            >
              Upload &amp; Rise ↑
            </motion.button>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">

          {/* Tab */}
          <div
            className="flex items-center gap-1 p-1 rounded-2xl"
            style={{ background: "white", border: "1.5px solid #dce8d4" }}
          >
            {[
              { id: "uploads", label: "Upload Board", Icon: UploadSVG },
              { id: "saves",   label: "Save Board",   Icon: SaveSVG   },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  addToast(`Switched to ${label}`, id === "uploads" ? "📤" : "📥");
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200"
                style={
                  tab === id
                    ? { background: "#1a3d1f", color: "white" }
                    : { color: "#4a6a4a" }
                }
              >
                <Icon stroke={tab === id ? "white" : "#2D6A2D"} />
                {label}
              </button>
            ))}
          </div>

          {/* Period */}
          <div
            className="flex items-center gap-1 p-1 rounded-2xl"
            style={{ background: "white", border: "1.5px solid #dce8d4" }}
          >
            {[
              { id: "all",   label: "All Time"   },
              { id: "month", label: "This Month" },
              { id: "week",  label: "This Week"  },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setPeriod(id); addToast(`Showing ${label}`, "📅"); }}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200"
                style={
                  period === id
                    ? { background: "#e8f5e0", color: "#1a3d1f", border: "1.5px solid #b8d8a8" }
                    : { color: "#6b8f6b" }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── PODIUM TOP 3 ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
          >
            <Top3Card data={data} mode={tab} />
          </motion.div>
        </AnimatePresence>

        {/* Column Headers */}
        <div
          className="grid items-center gap-x-4 px-5 py-2 mb-2"
          style={{ gridTemplateColumns: "44px 36px 1fr 90px 84px 76px 64px 46px" }}
        >
          {["Rank", "", "Student", tab === "uploads" ? "Uploads" : "Saves", "Coins", "Streak", "Joined", "Δ"].map((h, i) => (
            <div key={i} className={`text-[10.5px] font-bold uppercase tracking-wider ${i > 2 ? "text-center" : ""}`} style={{ color: "#8aaa8a" }}>
              {h}
            </div>
          ))}
        </div>

        {/* Top 3 rows */}
        <div className="space-y-2 mb-3">
          {top3.map((user, i) => (
            <LeaderboardRow key={user.rank} user={user} index={i} mode={tab} maxVal={maxVal} />
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background: "#dce8d4" }} />
          <span className="text-[10.5px] font-bold uppercase tracking-widest px-2" style={{ color: "#a0b8a0" }}>Ranks 4 – 10</span>
          <div className="flex-1 h-px" style={{ background: "#dce8d4" }} />
        </div>

        {/* Ranks 4–10 */}
        <div className="space-y-2">
          {rest.map((user, i) => (
            <LeaderboardRow key={user.rank} user={user} index={i + 3} mode={tab} maxVal={maxVal} />
          ))}
        </div>

        {/* ── Your Position Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 rounded-2xl px-7 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(110deg, #1a3d1f 0%, #2D6A2D 100%)" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-[16px]"
              style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
              S
            </div>
            <div>
              <div className="text-[14px] font-bold text-white">You · Student</div>
              <div className="text-[11px] mt-0.5" style={{ color: "#86efac" }}>Savitribai Phule Pune University</div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {[
              { label: "your rank",  value: "#42"  },
              { label: tab === "uploads" ? "uploads" : "saves", value: tab === "uploads" ? "8" : "24" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-[20px] font-black text-white">{value}</div>
                <div className="text-[10px] mt-0.5" style={{ color: "#86efac" }}>{label}</div>
              </div>
            ))}
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <CoinSVG size={15} />
                <span className="text-[20px] font-black text-white">100</span>
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: "#86efac" }}>coins</div>
            </div>
            <button
              onClick={() => addToast("Upload a paper to climb the ranks!", "🚀")}
              className="font-bold text-[12.5px] px-5 py-2.5 rounded-xl transition-colors duration-200 hover:bg-green-50"
              style={{ background: "white", color: "#1a3d1f" }}
            >
              Upload & Rise ↑
            </button>
          </div>
        </motion.div>
      </main>


      <Toaster toasts={toasts} />
      
    </div>
  );
}