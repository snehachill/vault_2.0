"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy } from "lucide-react";

// Motion presets
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

// Count-up hook
function useCountUp(target = 0, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16 || 1);
    const t = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(t);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return count;
}

export default function DashboardClient({ initialData }) {
  const [copied, setCopied] = useState(false);

  const safeData = initialData?.ok ? initialData : null;
  const stats = safeData?.stats || {
    uploads: 0,
    saved: 0,
    unlocked: 0,
    coins: 0,
  };
  const referral = safeData?.referral || { code: "", hasRedeemed: false };
  const featuredPaper = safeData?.featuredPaper || null;
  const isPremium = Boolean(safeData?.isPremium);

  // Derive UI-friendly fields with safe fallbacks
  const greetingName = safeData?.greetingName || "there";
  const greeting = "Welcome back";
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const totalUploads = useCountUp(stats.uploads || 0);
  const saved = useCountUp(stats.saved || 0);
  const unlocked = useCountUp(stats.unlocked || 0);
  const coins = useCountUp(stats.coins || 0);

  const mockPaperTitle =
    featuredPaper?.title || "Your last unlocked paper will appear here";
  const mockPaperMeta = featuredPaper?.meta || featuredPaper?.year || null;
  const mockPaperLink = featuredPaper ? `/user/read/${featuredPaper.id}` : "";
  const premiumCtaHref =
    isPremium && featuredPaper
      ? mockPaperLink
      : "/user/dashboard?upgrade=premium";
  const mockCtaLabel = isPremium
    ? featuredPaper
      ? "Generate mock →"
      : "Pick a paper →"
    : "Get Premium";

  const statBlocks = [
    { label: "Uploads", value: totalUploads, tone: "text-gray-900" },
    { label: "Saved", value: saved, tone: "text-amber-600" },
    { label: "Unlocked", value: unlocked, tone: "text-green-600" },
    { label: "Coins", value: coins, tone: "text-blue-600" },
  ];

  const handleCopy = async () => {
    if (!referral.code) return;
    try {
      await navigator.clipboard.writeText(referral.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Clipboard error", err);
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Greeting */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <div>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 300,
              fontSize: 18,
              margin: 0,
              color: "#111827",
              letterSpacing: "-0.01em",
              padding: "0 4px",
            }}
          >
            {greeting},{" "}
            <span
              style={{
                fontStyle: "italic",
                fontWeight: 500,
                background: "linear-gradient(100deg, #16a34a 10%, #15803d 85%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {greetingName}
            </span>
          </h1>
          <p className="m-0 text-[10px] tracking-[0.08em] uppercase text-gray-400">
            {dateStr}
          </p>
        </div>
      </div>

      {/* Stat strip */}
      <div className="bg-white border-b border-gray-200 grid grid-cols-4 divide-x divide-gray-200 px-2">
        {statBlocks.map((stat, i) => (
          <motion.div key={stat.label} variants={fadeUp} className="p-5">
            <div className={`text-2xl font-bold ${stat.tone}`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Bento grid */}
      <div className="px-4 pt-4 grid grid-cols-12 gap-4">
        {/* Browse */}
        <Link href="/user/browse" className="col-span-12 md:col-span-6">
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(21,128,61,0.18)" }}
            className="relative overflow-hidden rounded-xl cursor-pointer"
            style={{
              background:
                "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)",
              minHeight: 150,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -28,
                right: -28,
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -20,
                right: 60,
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />

            <div className="relative p-5 flex items-center justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] tracking-[0.12em] uppercase text-emerald-200/80 font-semibold">
                    Explore
                  </span>
                  <span className="w-1 h-1 rounded-full bg-green-200" />
                </div>
                <h2
                  className="m-0 font-[500] text-[22px] text-white leading-tight"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Browse Papers
                </h2>
                <p className="mt-1 text-[12px] text-emerald-100/80 leading-relaxed">
                  1,200+ papers across 40 universities
                </p>
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block mt-3 bg-white text-emerald-900 text-[12px] font-bold px-4 py-1.5 rounded-lg"
                >
                  Browse Library →
                </motion.span>
              </div>

              <div
                style={{
                  position: "relative",
                  width: 90,
                  height: 100,
                  flexShrink: 0,
                }}
              >
                {[
                  {
                    rotate: "-8deg",
                    top: 14,
                    right: 0,
                    bg: "rgba(255,255,255,0.1)",
                  },
                  {
                    rotate: "-2deg",
                    top: 6,
                    right: 10,
                    bg: "rgba(255,255,255,0.15)",
                  },
                  {
                    rotate: "5deg",
                    top: -2,
                    right: 20,
                    bg: "rgba(255,255,255,0.2)",
                  },
                ].map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "absolute",
                      top: s.top,
                      right: s.right,
                      width: 60,
                      height: 80,
                      borderRadius: 8,
                      background: s.bg,
                      border: "1px solid rgba(255,255,255,0.15)",
                      transform: `rotate(${s.rotate})`,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <div
                      style={{
                        margin: "10px 8px 6px",
                        height: 5,
                        borderRadius: 2,
                        background: "rgba(255,255,255,0.3)",
                      }}
                    />
                    <div
                      style={{
                        margin: "0 8px",
                        height: 3,
                        borderRadius: 2,
                        background: "rgba(255,255,255,0.18)",
                      }}
                    />
                    <div
                      style={{
                        margin: "6px 8px 0",
                        height: 3,
                        borderRadius: 2,
                        background: "rgba(255,255,255,0.18)",
                      }}
                    />
                    <div
                      style={{
                        margin: "6px 8px 0",
                        width: "70%",
                        height: 3,
                        borderRadius: 2,
                        background: "rgba(255,255,255,0.18)",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Upload */}
        <Link href="/user/upload" className="col-span-12 md:col-span-6">
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(180,160,20,0.15)" }}
            className="relative overflow-hidden rounded-xl cursor-pointer"
            style={{
              background:
                "linear-gradient(135deg, #1c1917 0%, #292524 60%, #1c1917 100%)",
              minHeight: 150,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -30,
                left: -30,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(202,193,76,0.08)",
                filter: "blur(20px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -20,
                right: 40,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(202,193,76,0.05)",
                filter: "blur(16px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative p-5 flex items-center justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] tracking-[0.12em] uppercase text-amber-200/80 font-semibold">
                    Contribute
                  </span>
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                </div>
                <h2
                  className="m-0 font-[500] text-[22px] text-white leading-tight"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Upload a Paper
                </h2>
                <p className="mt-1 text-[12px] text-amber-100/70 leading-relaxed">
                  Earn <span className="text-amber-300 font-semibold">+25 coins</span> per approved upload
                </p>
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block mt-3 bg-amber-300 text-stone-900 text-[12px] font-bold px-4 py-1.5 rounded-lg"
                >
                  Upload Now →
                </motion.span>
              </div>

              <div className="relative w-[88px] h-[96px] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-amber-200/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-amber-200/20 flex items-center justify-center">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#eab308"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-2 right-0 bg-amber-200/20 border border-amber-200/40 rounded-full px-2 py-0.5 text-[10px] text-amber-200 font-semibold">
                  +25🪙
                </div>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Mock paper (larger, premium hint) */}
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, boxShadow: "0 16px 50px rgba(16,105,70,0.24)" }}
          className="relative overflow-hidden rounded-xl col-span-12 md:col-span-8"
          style={{
            background:
              "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)",
            minHeight: 190,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle at 18% 24%, rgba(34,197,94,0.12), transparent 32%), radial-gradient(circle at 82% 22%, rgba(34,197,94,0.12), transparent 36%)",
            }}
          />
          <div className="shine-strip" />
          <div className="relative p-6 flex flex-col gap-4 h-full">
            <div className="flex items-center gap-2">
              <span className="text-[11px] tracking-[0.12em] uppercase text-emerald-100/90 font-semibold">
                Mock paper lab
              </span>
              <span className="w-1 h-1 rounded-full bg-emerald-200" />
              <span className="text-[11px] text-amber-200/90 font-semibold px-2 py-0.5 rounded-full bg-amber-200/10 border border-amber-200/20">
                Premium
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2
                  className="m-0 text-white text-[22px] font-semibold"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Generate a mock for
                </h2>
                <p className="m-0 mt-1 text-lg text-emerald-100 font-semibold">
                  {mockPaperTitle}
                </p>
                {mockPaperMeta ? (
                  <p className="m-0 mt-1 text-[12px] text-emerald-50/80">
                    {mockPaperMeta}
                  </p>
                ) : null}
                <p className="m-0 mt-2 text-[11px] text-amber-100/80">
                  Premium feature • crisp mock tailored to your unlocked paper
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[12px]">
                  Last unlocked · {stats.unlocked || 0}
                </div>
                <Link
                  href={premiumCtaHref}
                  aria-disabled={!isPremium || !featuredPaper}
                  className={`px-4 py-2 rounded-lg text-[12px] font-semibold border transition-colors ${
                    isPremium && featuredPaper
                      ? "bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-400"
                      : "bg-amber-300 text-amber-900 border-amber-200 hover:bg-amber-200"
                  }`}
                >
                  {mockCtaLabel}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Referral */}
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -2, boxShadow: "0 12px 38px rgba(34,197,94,0.2)" }}
          className="relative overflow-hidden rounded-xl col-span-12 md:col-span-4"
          style={{
            background:
              "linear-gradient(135deg, #0f261a 0%, #0f3220 55%, #0b2619 100%)",
            minHeight: 180,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
              opacity: 0.6,
            }}
          />
          <div className="relative p-5 flex flex-col justify-between h-full text-white">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] tracking-[0.12em] uppercase text-emerald-100/90 font-semibold">
                  Refer & Earn
                </span>
                <span className="w-1 h-1 rounded-full bg-emerald-200" />
              </div>
              <h2
                className="mt-2 mb-1 text-xl font-semibold"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Invite a friend, earn 50 coins
              </h2>
              <p className="m-0 text-[12px] text-emerald-50/80">
                Both of you get rewarded on a successful referral.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm font-mono tracking-wide">
                {referral.code || "XXXX-XXXX"}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 bg-white text-emerald-900 text-[12px] font-semibold px-3 py-2 rounded-lg"
              >
                <Copy size={14} /> {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent uploads list */}
      <div className="p-4">
        <motion.div
          variants={fadeUp}
          className="bg-white text-black p-5 rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium">Recent Uploads</span>
            </div>
            <Link
              href="/user/upload"
              className="text-xs text-green-600 hover:text-green-500 transition-colors"
            >
              View all →
            </Link>
          </div>
          <ul className="space-y-2">
            {[
              {
                title: "Quantum Mechanics Final",
                subject: "Physics",
                date: "Mar 21",
                size: "2.4 MB",
                pages: 12,
                status: "graded",
              },
              {
                title: "Linear Algebra Midterm",
                subject: "Mathematics",
                date: "Mar 18",
                size: "1.1 MB",
                pages: 8,
                status: "pending",
              },
              {
                title: "Data Structures Quiz",
                subject: "CS",
                date: "Mar 15",
                size: "0.8 MB",
                pages: 4,
                status: "reviewed",
              },
            ].map((paper, i) => (
              <li
                key={i}
                className="group flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5 shrink-0 w-7 h-7 rounded-md bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-500 text-[10px] font-bold">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate leading-snug">
                      {paper.title}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {paper.subject} · {paper.pages}p · {paper.size}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="text-[10px] text-slate-500">
                    {paper.date}
                  </span>
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                      paper.status === "graded"
                        ? "bg-emerald-100 text-emerald-600"
                        : paper.status === "reviewed"
                          ? "bg-sky-100 text-sky-600"
                          : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {paper.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
      <style jsx global>{`
        @keyframes shineSweep {
          0% { transform: translateX(-130%); }
          100% { transform: translateX(130%); }
        }
        .shine-strip {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .shine-strip::before {
          content: "";
          position: absolute;
          top: 0;
          left: -70%;
          width: 45%;
          height: 100%;
          background: linear-gradient(125deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
          transform: skewX(-18deg);
          animation: shineSweep 4s linear infinite;
        }
      `}</style>
    </motion.div>
  );
}
