"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock, ArrowLeft, Building2, BookOpenText, GraduationCap, Calendar } from "lucide-react";
import { checkUnlockedPapers } from "@/app/actions/paperActions";
import CanvasPdfRenderer from "@/components/CanvasPdfRenderer";

export default function ReadPaperPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const paperId = params.paperId;

  // State management
  const [paper, setPaper] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollTopRef = useRef(0);

  const handleReaderScroll = (scrollTop) => {
    const thresholdTop = 64;

    // Header should only reappear when user is near the top.
    if (scrollTop <= thresholdTop) {
      setShowHeader(true);
      lastScrollTopRef.current = scrollTop;
      return;
    }

    if (scrollTop > lastScrollTopRef.current + 10) {
      setShowHeader(false);
    }

    lastScrollTopRef.current = scrollTop;
  };

  useEffect(() => {
    const verifyAccessAndLoadPaper = async () => {
      try {
        if (!session?.user?.id) {
          return; // Layout will handle redirect to login
        }

        setLoading(true);
        setError(null);

        // 1. Verify paper exists and is approved
        const paperResponse = await fetch(`/api/papers/${paperId}`);

        if (!paperResponse.ok) {
          if (paperResponse.status === 404) {
            setError("Paper not found.");
          } else {
            setError("Failed to load paper details.");
          }
          setLoading(false);
          return;
        }

        const paperData = await paperResponse.json();
        if (!paperData.success) {
          setError(paperData.error || "Failed to load paper.");
          setLoading(false);
          return;
        }

        setPaper(paperData.paper);

        // 2. Check if paper is unlocked by current user
        const unlockResponse = await checkUnlockedPapers([paperId]);
        if (unlockResponse.success) {
          const isCurrentUnlocked = unlockResponse.unlockedPaperIds.includes(paperId);
          setIsUnlocked(isCurrentUnlocked);

          if (!isCurrentUnlocked) {
            setError("This paper has not been unlocked. Please unlock it from the browse page first.");
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading paper:", err);
        setError("An unexpected error occurred while loading the paper.");
        setLoading(false);
      }
    };

    verifyAccessAndLoadPaper();
  }, [session?.user?.id, paperId]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(160deg, #F7F0F0 0%, #eef5ec 60%, #F7F0F0 100%)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={42} className="animate-spin" style={{ color: "#25671E" }} />
          <p className="font-medium" style={{ color: "#25671E", opacity: 0.75 }}>Loading paper...</p>
        </div>
      </div>
    );
  }

  if (error || !isUnlocked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "linear-gradient(160deg, #F7F0F0 0%, #eef5ec 60%, #F7F0F0 100%)" }}
      >
        <div className="max-w-md w-full">
          <div
            className="bg-white rounded-xl shadow-md p-8"
            style={{ border: "1px solid rgba(37, 103, 30, 0.15)", boxShadow: "0 10px 30px rgba(37, 103, 30, 0.12)" }}
          >
            <div className="flex gap-4 mb-4">
              <Lock size={32} className="flex-shrink-0 mt-0.5" style={{ color: "#25671E" }} />
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "#25671E" }}>
                  {isUnlocked ? "Access Denied" : "Paper Locked"}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "#25671E", opacity: 0.75 }}>
                  {error || "You don't have permission to access this paper."}
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/user/browse")}
              className="mt-6 w-full px-4 py-3 rounded-lg text-white font-medium transition flex items-center justify-center gap-2"
              style={{ background: "#25671E" }}
            >
              <ArrowLeft size={16} />
              Back to Browse
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-screen overflow-hidden"
      style={{ background: "linear-gradient(160deg, #F7F0F0 0%, #eef5ec 60%, #F7F0F0 100%)" }}
    >
      <motion.header
        initial={false}
        animate={{
          y: showHeader ? 0 : -110,
          opacity: showHeader ? 1 : 0,
          pointerEvents: showHeader ? "auto" : "none",
        }}
        transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
        className="absolute inset-x-0 top-0 z-30 px-4 pt-3 sm:px-6 lg:px-8"
      >
        <div
          className="mx-auto max-w-7xl rounded-2xl px-4 py-3 sm:px-6"
          style={{
            background: "rgba(247, 240, 240, 0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(37, 103, 30, 0.14)",
            boxShadow: "0 8px 24px rgba(37, 103, 30, 0.12)",
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => router.push("/user/browse")}
                className="p-2 rounded-lg transition"
                style={{ background: "rgba(37, 103, 30, 0.08)", color: "#25671E" }}
                title="Back to Browse"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-lg sm:text-xl font-semibold line-clamp-1" style={{ color: "#25671E" }}>
                {paper?.subject || "Paper"}
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-4 text-xs sm:text-sm" style={{ color: "#25671E", opacity: 0.82 }}>
              <div className="flex items-center gap-1.5">
                <Building2 size={14} />
                <span className="max-w-28 truncate">{paper?.institute || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpenText size={14} />
                <span className="max-w-24 truncate">{paper?.program || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GraduationCap size={14} />
                <span>Sem {paper?.semester || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>{paper?.year || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="h-full pt-[84px] pb-3 px-2 sm:px-3">
        <CanvasPdfRenderer paperId={paperId} onContainerScroll={handleReaderScroll} />
      </main>
    </div>
  );
}
