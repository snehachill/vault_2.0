"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/connectDB";
import User from "@/app/models/user";
import Paper from "@/app/models/paper";
import SavedPaper from "@/app/models/savedPaper";
import Unlock from "@/app/models/unlock";
import { ensureUserReferralCode } from "@/lib/referral";

/**
 * Aggregates dashboard stats for the signed-in user.
 * Reuses existing models/APIs (no new public endpoints).
 */
export async function getDashboardSnapshot() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "UNAUTHORIZED" };
  }

  await connectDB();

  const user = await User.findById(session.user.id)
    .select("name coinBalance referralCode referredBy isPremium")
    .lean();

  if (!user) {
    return { ok: false, error: "USER_NOT_FOUND" };
  }

  // Ensure referral code exists (idempotent)
  if (!user.referralCode) {
    await ensureUserReferralCode(user._id);
    const refreshed = await User.findById(user._id)
      .select("referralCode")
      .lean();
    user.referralCode = refreshed?.referralCode || null;
  }

  const [uploadCount, savedCount, unlockedCount, latestUnlock] = await Promise.all([
    Paper.countDocuments({ uploaderID: user._id }),
    SavedPaper.countDocuments({ userID: user._id }),
    Unlock.countDocuments({ userID: user._id }),
    Unlock.findOne({ userID: user._id })
      .sort({ unlockedAt: -1 })
      .select("paperID unlockedAt")
      .lean(),
  ]);

  let featuredPaper = null;
  if (latestUnlock?.paperID) {
    const paper = await Paper.findById(latestUnlock.paperID)
      .select("subject program institute year")
      .lean();

    if (paper) {
      featuredPaper = {
        id: paper._id.toString(),
        title: paper.subject || "Unlocked paper",
        meta:
          paper.program || paper.institute
            ? [paper.program, paper.institute].filter(Boolean).join(" · ")
            : null,
        year: paper.year || null,
      };
    }
  }

  return {
    ok: true,
    greetingName: session.user.name || user.name || "there",
    isPremium: Boolean(user.isPremium),
    stats: {
      uploads: uploadCount,
      saved: savedCount,
      unlocked: unlockedCount,
      coins: user.coinBalance || 0,
    },
    referral: {
      code: user.referralCode || "",
      hasRedeemed: Boolean(user.referredBy),
    },
    featuredPaper,
  };
}
