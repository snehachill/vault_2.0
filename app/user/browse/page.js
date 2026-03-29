"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  Search, Filter, X, FileText, Heart,
  Building2, BookOpenText, GraduationCap, Sparkles,
  Calendar, ChevronLeft, ChevronRight, Loader2,
  TrendingUp, Eye
} from "lucide-react";
import { getPapers, getFilterOptions, savePaper, checkSavedPapers, checkUnlockedPapers, unlockPaper } from "@/app/actions/paperActions";
import { useSession } from "next-auth/react";

const UNLOCK_COST = 8;

const fadeInUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 0.61, 0.36, 1] },
  }),
};

export default function BrowsePapersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    institutes: [],
    subjects: [],
    programs: [],
    specializations: [],
  });

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    institute: "",
    subject: "",
    program: "",
    specialization: "",
    semester: "",
    year: "",
    search: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Saved papers
  const [savedPaperIds, setSavedPaperIds] = useState([]);
  const [savingPaperId, setSavingPaperId] = useState(null);

  // Unlocked papers
  const [unlockedPaperIds, setUnlockedPaperIds] = useState([]);
  const [unlockingPaperId, setUnlockingPaperId] = useState(null);

  // Unlock modal state
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [unlockError, setUnlockError] = useState("");
  const [coinBalance, setCoinBalance] = useState(0);

  const semesterOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    setCoinBalance(session?.user?.coinBalance || 0);
  }, [session?.user?.coinBalance]);

  // Fetch filter options on mount
  useEffect(() => {
    async function loadFilterOptions() {
      const result = await getFilterOptions();
      if (result.success) {
        setFilterOptions(result.options);
      }
    }
    loadFilterOptions();
  }, []);

  // Fetch papers when filters or page changes
  useEffect(() => {
    async function loadPapers() {
      setLoading(true);
      const result = await getPapers(filters, currentPage, 12);
      if (result.success) {
        setPapers(result.papers);
        setTotalPages(result.pagination.totalPages);
        setTotalCount(result.pagination.totalCount);

        // Check which papers are saved
        if (session?.user && result.papers.length > 0) {
          const paperIds = result.papers.map(p => p._id);
          const [savedResult, unlockedResult] = await Promise.all([
            checkSavedPapers(paperIds),
            checkUnlockedPapers(paperIds),
          ]);

          if (savedResult.success) {
            setSavedPaperIds(savedResult.savedPaperIds);
          }

          if (unlockedResult.success) {
            setUnlockedPaperIds(unlockedResult.unlockedPaperIds);
          }
        } else {
          setSavedPaperIds([]);
          setUnlockedPaperIds([]);
        }
      }
      setLoading(false);
    }
    loadPapers();
  }, [filters, currentPage, session?.user]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      institute: "",
      subject: "",
      program: "",
      specialization: "",
      semester: "",
      year: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const handleSavePaper = async (paperId) => {
    if (!session?.user) return;

    setSavingPaperId(paperId);
    const result = await savePaper(paperId);
    if (result.success) {
      setSavedPaperIds(prev => [...prev, paperId]);
    }
    setSavingPaperId(null);
  };

  const handleUnlockClick = (paper) => {
    if (!session?.user) {
      const callbackPath = encodeURIComponent(pathname || "/user/browse");
      router.push(`/auth/login?callbackUrl=${callbackPath}`);
      return;
    }

    if (unlockedPaperIds.includes(paper._id)) {
      // Paper is already unlocked, navigate to read page
      router.push(`/user/read/${paper._id}`);
      return;
    }

    setSelectedPaper(paper);
    setUnlockError("");
    setIsUnlockModalOpen(true);
  };

  const handleConfirmUnlock = async () => {
    if (!selectedPaper?._id || unlockingPaperId) {
      return;
    }

    setUnlockError("");
    setUnlockingPaperId(selectedPaper._id);

    const result = await unlockPaper(selectedPaper._id);

    if (result.success) {
      setUnlockedPaperIds((prev) => {
        if (prev.includes(selectedPaper._id)) return prev;
        return [...prev, selectedPaper._id];
      });

      if (typeof result.coinBalance === "number") {
        setCoinBalance(result.coinBalance);
      }

      if (!result.alreadyUnlocked) {
        setPapers((prev) =>
          prev.map((paper) =>
            paper._id === selectedPaper._id
              ? { ...paper, unlockCounts: (paper.unlockCounts || 0) + 1 }
              : paper
          )
        );
      }

      setIsUnlockModalOpen(false);
      setSelectedPaper(null);
      
      // Navigate to read page after successful unlock
      setTimeout(() => {
        router.push(`/user/read/${selectedPaper._id}`);
      }, 300);
    } else {
      setUnlockError(result.error || "Unable to unlock this paper right now.");
    }

    setUnlockingPaperId(null);
  };

  const closeUnlockModal = () => {
    if (unlockingPaperId) {
      return;
    }

    setIsUnlockModalOpen(false);
    setSelectedPaper(null);
    setUnlockError("");
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== "").length;

  return (
    <div
      className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-10"
      style={{ background: "linear-gradient(160deg, #F7F0F0 0%, #eef5ec 60%, #F7F0F0 100%)" }}
    >
      {/* Background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(#25671E 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-4"
            style={{
              background: "rgba(72, 161, 17, 0.12)",
              border: "1px solid rgba(72, 161, 17, 0.25)",
              color: "#25671E",
            }}
          >
            <FileText size={14} />
            {totalCount} Papers Available
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "#25671E" }}>
            Browse Question Papers
          </h1>
          <p className="mt-3 text-sm sm:text-base" style={{ color: "#25671E", opacity: 0.65 }}>
            Find and download question papers from universities across India
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#48A111" }}
              />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search by institute, subject, program..."
                className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm"
                style={{
                  border: "1px solid rgba(37, 103, 30, 0.15)",
                  color: "#25671E",
                  background: "white",
                }}
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all"
              style={{
                background: showFilters ? "#25671E" : "white",
                color: showFilters ? "white" : "#25671E",
                border: `1px solid ${showFilters ? "#25671E" : "rgba(37, 103, 30, 0.15)"}`,
              }}
            >
              <Filter size={18} />
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: showFilters ? "white" : "#48A111",
                    color: showFilters ? "#25671E" : "white",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all hover:bg-red-50"
                style={{
                  background: "white",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#DC2626",
                }}
              >
                <X size={18} />
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-xl border p-6 overflow-hidden"
              style={{
                background: "white",
                border: "1px solid rgba(37, 103, 30, 0.15)",
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FilterSelect
                  label="Institute"
                  icon={<Building2 size={16} />}
                  value={filters.institute}
                  onChange={(value) => handleFilterChange("institute", value)}
                  options={filterOptions.institutes}
                  placeholder="All Institutes"
                />

                <FilterSelect
                  label="Subject"
                  icon={<BookOpenText size={16} />}
                  value={filters.subject}
                  onChange={(value) => handleFilterChange("subject", value)}
                  options={filterOptions.subjects}
                  placeholder="All Subjects"
                />

                <FilterSelect
                  label="Program"
                  icon={<GraduationCap size={16} />}
                  value={filters.program}
                  onChange={(value) => handleFilterChange("program", value)}
                  options={filterOptions.programs}
                  placeholder="All Programs"
                />

                <FilterSelect
                  label="Specialization"
                  icon={<Sparkles size={16} />}
                  value={filters.specialization}
                  onChange={(value) => handleFilterChange("specialization", value)}
                  options={filterOptions.specializations}
                  placeholder="All Specializations"
                />

                <FilterSelect
                  label="Semester"
                  value={filters.semester}
                  onChange={(value) => handleFilterChange("semester", value)}
                  options={semesterOptions.map(s => `Semester ${s}`)}
                  placeholder="All Semesters"
                  useIndex
                />

                <FilterSelect
                  label="Year"
                  icon={<Calendar size={16} />}
                  value={filters.year}
                  onChange={(value) => handleFilterChange("year", value)}
                  options={yearOptions.map(String)}
                  placeholder="All Years"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Papers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin" style={{ color: "#48A111" }} />
              <p className="text-sm font-medium" style={{ color: "#25671E" }}>
                Loading papers...
              </p>
            </div>
          </div>
        ) : papers.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
            className="rounded-xl border p-12 text-center"
            style={{
              background: "white",
              border: "1px solid rgba(37, 103, 30, 0.15)",
            }}
          >
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(37, 103, 30, 0.1)" }}
            >
              <FileText size={28} style={{ color: "#25671E", opacity: 0.5 }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#25671E" }}>
              No Papers Found
            </h3>
            <p className="text-sm mb-4" style={{ color: "#25671E", opacity: 0.65 }}>
              Try adjusting your filters or search query
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="rounded-full px-6 py-2 text-sm font-semibold text-white"
                style={{ background: "#25671E" }}
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {papers.map((paper, index) => (
                <PaperCard
                  key={paper._id}
                  paper={paper}
                  index={index}
                  isSaved={savedPaperIds.includes(paper._id)}
                  isSaving={savingPaperId === paper._id}
                  isUnlocked={unlockedPaperIds.includes(paper._id)}
                  isUnlocking={unlockingPaperId === paper._id}
                  onSave={() => handleSavePaper(paper._id)}
                  onUnlock={() => handleUnlockClick(paper)}
                  session={session}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-center gap-2"
              >
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-40"
                  style={{
                    background: "white",
                    border: "1px solid rgba(37, 103, 30, 0.15)",
                    color: "#25671E",
                  }}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold transition-all"
                        style={{
                          background: currentPage === pageNum ? "#25671E" : "white",
                          color: currentPage === pageNum ? "white" : "#25671E",
                          border: `1px solid ${currentPage === pageNum ? "#25671E" : "rgba(37, 103, 30, 0.15)"}`,
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-40"
                  style={{
                    background: "white",
                    border: "1px solid rgba(37, 103, 30, 0.15)",
                    color: "#25671E",
                  }}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {isUnlockModalOpen && selectedPaper && (
          <UnlockConfirmModal
            paper={selectedPaper}
            coinBalance={coinBalance}
            unlockCost={UNLOCK_COST}
            isSubmitting={unlockingPaperId === selectedPaper._id}
            error={unlockError}
            onClose={closeUnlockModal}
            onConfirm={handleConfirmUnlock}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Paper Card Component
function PaperCard({ paper, index, isSaved, isSaving, isUnlocked, isUnlocking, onSave, onUnlock, session }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      custom={index * 0.05}
      className="group relative rounded-xl border p-6 transition-all hover:shadow-lg"
      style={{
        background: "white",
        border: "1px solid rgba(37, 103, 30, 0.15)",
        boxShadow: isHovered ? "0 8px 26px rgba(37, 103, 30, 0.15)" : "0 4px 12px rgba(37, 103, 30, 0.08)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Save Button - Top Right */}
      {session?.user && (
        <button
          onClick={onSave}
          disabled={isSaved || isSaving}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full transition-all hover:scale-110 disabled:opacity-60 z-10"
          style={{
            background: isSaved ? "rgba(72, 161, 17, 0.12)" : "rgba(37, 103, 30, 0.06)",
            border: `1px solid ${isSaved ? "rgba(72, 161, 17, 0.35)" : "rgba(37, 103, 30, 0.15)"}`,
          }}
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" style={{ color: "#48A111" }} />
          ) : (
            <Heart
              size={16}
              style={{ color: isSaved ? "#48A111" : "#25671E" }}
              fill={isSaved ? "#48A111" : "none"}
            />
          )}
        </button>
      )}

      {/* Large PDF Icon - Center */}
      <div className="flex flex-col items-center mb-5">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-2xl mb-3 transition-all"
          style={{
            background: isHovered ? "rgba(72, 161, 17, 0.15)" : "rgba(72, 161, 17, 0.12)",
            border: "1px solid rgba(72, 161, 17, 0.25)",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        >
          <FileText size={48} style={{ color: "#48A111" }} />
        </div>
      </div>

      {/* Subject */}
      <h3 className="text-lg font-bold mb-3 text-center line-clamp-2" style={{ color: "#25671E" }}>
        {paper.subject}
      </h3>

      {/* Metadata Grid */}
      <div className="space-y-2 mb-4">
        <MetadataRow icon={<Building2 size={14} />} label="Institute" value={paper.institute} />
        <MetadataRow icon={<GraduationCap size={14} />} label="Program" value={paper.program} />
        <MetadataRow icon={<Sparkles size={14} />} label="Specialization" value={paper.specialization} />
        <div className="flex items-center gap-4">
          <MetadataRow icon={<Calendar size={14} />} label="Sem" value={paper.semester} compact />
          <MetadataRow icon={<Calendar size={14} />} label="Year" value={paper.year} compact />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b" style={{ borderColor: "rgba(37, 103, 30, 0.1)" }}>
        <div className="flex items-center gap-1.5">
          <Eye size={14} style={{ color: "#25671E", opacity: 0.5 }} />
          <span className="text-xs font-medium" style={{ color: "#25671E", opacity: 0.7 }}>
            {paper.unlockCounts || 0}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Heart size={14} style={{ color: "#25671E", opacity: 0.5 }} />
          <span className="text-xs font-medium" style={{ color: "#25671E", opacity: 0.7 }}>
            {paper.saveCounts || 0}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={14} style={{ color: "#48A111" }} />
          <span className="text-xs font-medium" style={{ color: "#48A111" }}>
            Popular
          </span>
        </div>
      </div>

      {/* Unlock Button */}
      <button
        type="button"
        onClick={onUnlock}
        disabled={isUnlocking}
        className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-all hover:shadow-md"
        style={{
          background: isUnlocked
            ? "rgba(37, 103, 30, 0.88)"
            : isHovered
            ? "#48A111"
            : "#25671E",
          opacity: isUnlocking ? 0.85 : 1,
        }}
      >
        <div className="flex items-center gap-2">
          {!isUnlocked && (
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full text-xs"
              style={{
                background: "#F2B50B",
                boxShadow: "0 0 8px rgba(242,181,11,0.5)",
              }}
            >
              🪙
            </div>
          )}
          <span>
            {isUnlocked ? "Read Paper" : isUnlocking ? "Unlocking..." : "Unlock for 8 Coins"}
          </span>
        </div>
      </button>
    </motion.div>
  );
}

function UnlockConfirmModal({
  paper,
  coinBalance,
  unlockCost,
  isSubmitting,
  error,
  onClose,
  onConfirm,
}) {
  const insufficientCoins = coinBalance < unlockCost;
  const postUnlockBalance = Math.max(coinBalance - unlockCost, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-70 flex items-center justify-center p-4"
      style={{ background: "rgba(17, 24, 39, 0.38)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-2xl p-5 sm:p-6"
        style={{
          background: "rgba(247, 240, 240, 0.96)",
          backdropFilter: "blur(18px)",
          border: "1px solid rgba(37, 103, 30, 0.18)",
          boxShadow: "0 18px 44px rgba(37, 103, 30, 0.18)",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold" style={{ color: "#25671E" }}>
              Unlock Paper
            </h3>
            <p className="mt-1 text-sm" style={{ color: "#25671E", opacity: 0.68 }}>
              Confirm to unlock this paper for coins.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-1.5 transition-colors hover:bg-white/70"
            style={{ color: "#25671E" }}
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={16} />
          </button>
        </div>

        <div
          className="mb-4 rounded-xl p-4"
          style={{
            background: "white",
            border: "1px solid rgba(37, 103, 30, 0.12)",
          }}
        >
          <p className="text-sm font-semibold line-clamp-2" style={{ color: "#25671E" }}>
            {paper.subject}
          </p>
          <p className="mt-1 text-xs" style={{ color: "#25671E", opacity: 0.62 }}>
            {paper.institute}
          </p>
        </div>

        <div className="space-y-2 rounded-xl p-4" style={{ background: "rgba(37, 103, 30, 0.06)" }}>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "#25671E", opacity: 0.72 }}>Current Balance</span>
            <span className="font-semibold" style={{ color: "#25671E" }}>{coinBalance} coins</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "#25671E", opacity: 0.72 }}>Unlock Cost</span>
            <span className="font-semibold" style={{ color: "#B45309" }}>{unlockCost} coins</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "#25671E", opacity: 0.72 }}>After Unlock</span>
            <span className="font-semibold" style={{ color: insufficientCoins ? "#DC2626" : "#25671E" }}>
              {postUnlockBalance} coins
            </span>
          </div>
        </div>

        {insufficientCoins && (
          <p className="mt-3 text-sm font-semibold" style={{ color: "#DC2626" }}>
            You do not have enough coins to unlock this paper.
          </p>
        )}

        {error && (
          <p className="mt-3 text-sm font-semibold" style={{ color: "#DC2626" }}>
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full px-4 py-2 text-sm font-semibold transition-all hover:opacity-80"
            style={{
              border: "1px solid rgba(37, 103, 30, 0.2)",
              color: "#25671E",
              background: "rgba(255,255,255,0.9)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={insufficientCoins || isSubmitting}
            className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all disabled:opacity-55"
            style={{
              background: "#25671E",
              boxShadow: "0 6px 14px rgba(37, 103, 30, 0.32)",
            }}
          >
            {isSubmitting ? "Unlocking..." : `Yes, Unlock for ${unlockCost}`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Metadata Row Component
function MetadataRow({ icon, label, value, compact }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "" : ""}`}>
      <span style={{ color: "#48A111", opacity: 0.7 }}>{icon}</span>
      <span className="text-xs font-medium" style={{ color: "#25671E", opacity: 0.6 }}>
        {label}:
      </span>
      <span className="text-xs font-semibold truncate" style={{ color: "#25671E" }}>
        {value}
      </span>
    </div>
  );
}

// Filter Select Component
function FilterSelect({ label, icon, value, onChange, options, placeholder, useIndex }) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-2" style={{ color: "#25671E" }}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#48A111" }}>
            {icon}
          </span>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border py-2.5 pr-3 text-sm"
          style={{
            paddingLeft: icon ? "2.5rem" : "0.75rem",
            border: "1px solid rgba(37, 103, 30, 0.15)",
            color: "#25671E",
            background: "white",
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((opt, idx) => (
            <option key={idx} value={useIndex ? idx + 1 : opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
