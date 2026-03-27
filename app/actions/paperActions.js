"use server";

import mongoose from "mongoose";
import { connectDB } from "@/lib/connectDB";
import Paper from "@/app/models/paper";
import User from "@/app/models/user";
import Unlock from "@/app/models/unlock";
import CoinTransaction from "@/app/models/coinTransactions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const UNLOCK_COST = 8;

/**
 * Fetches approved papers with optional filters
 * @param {Object} filters - Filter options (institute, subject, program, semester, year, search)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of papers per page
 */
export async function getPapers(filters = {}, page = 1, limit = 12) {
  try {
    await connectDB();

    const {
      institute,
      subject,
      program,
      specialization,
      semester,
      year,
      search,
    } = filters;

    // Build query for approved papers only
    const query = { status: "approved" };

    // Add filters if provided
    if (institute) query.institute = new RegExp(institute, "i");
    if (subject) query.subject = new RegExp(subject, "i");
    if (program) query.program = new RegExp(program, "i");
    if (specialization) query.specialization = new RegExp(specialization, "i");
    if (semester) query.semester = parseInt(semester);
    if (year) query.year = parseInt(year);

    // Add search across multiple fields
    if (search) {
      query.$or = [
        { institute: new RegExp(search, "i") },
        { subject: new RegExp(search, "i") },
        { program: new RegExp(search, "i") },
        { specialization: new RegExp(search, "i") },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch papers with pagination
    const [papers, totalCount] = await Promise.all([
      Paper.find(query)
        .select(
          "institute subject program specialization semester year storageURL uploadedAt unlockCounts saveCounts"
        )
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Paper.countDocuments(query),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      papers: JSON.parse(JSON.stringify(papers)),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasMore: page < totalPages,
      },
    };
  } catch (error) {
    console.error("Get papers error:", error);
    return {
      success: false,
      error: "Failed to fetch papers",
      papers: [],
      pagination: { currentPage: 1, totalPages: 0, totalCount: 0, hasMore: false },
    };
  }
}

/**
 * Gets unique filter options from approved papers
 */
export async function getFilterOptions() {
  try {
    await connectDB();

    const [institutes, subjects, programs, specializations] = await Promise.all([
      Paper.distinct("institute", { status: "approved" }),
      Paper.distinct("subject", { status: "approved" }),
      Paper.distinct("program", { status: "approved" }),
      Paper.distinct("specialization", { status: "approved" }),
    ]);

    return {
      success: true,
      options: {
        institutes: institutes.sort(),
        subjects: subjects.sort(),
        programs: programs.sort(),
        specializations: specializations.sort(),
      },
    };
  } catch (error) {
    console.error("Get filter options error:", error);
    return {
      success: false,
      options: {
        institutes: [],
        subjects: [],
        programs: [],
        specializations: [],
      },
    };
  }
}

/**
 * Saves a paper to user's saved list
 */
export async function savePaper(paperId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    await connectDB();

    const SavedPaper = (await import("@/app/models/savedPaper")).default;

    // Check if already saved
    const existing = await SavedPaper.findOne({
      userID: session.user.id,
      paperID: paperId,
    });

    if (existing) {
      return { success: false, error: "Paper already saved" };
    }

    // Save paper
    await SavedPaper.create({
      userID: session.user.id,
      paperID: paperId,
      savedAt: new Date(),
    });

    // Increment save count
    await Paper.findByIdAndUpdate(paperId, { $inc: { saveCounts: 1 } });

    return { success: true, message: "Paper saved successfully" };
  } catch (error) {
    console.error("Save paper error:", error);
    return { success: false, error: "Failed to save paper" };
  }
}

/**
 * Checks if user has saved specific papers
 */
export async function checkSavedPapers(paperIds) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: true, savedPaperIds: [] };
    }

    await connectDB();

    const SavedPaper = (await import("@/app/models/savedPaper")).default;

    const savedPapers = await SavedPaper.find({
      userID: session.user.id,
      paperID: { $in: paperIds },
    }).select("paperID");

    const savedPaperIds = savedPapers.map((sp) => sp.paperID.toString());

    return { success: true, savedPaperIds };
  } catch (error) {
    console.error("Check saved papers error:", error);
    return { success: true, savedPaperIds: [] };
  }
}

/**
 * Checks if user has unlocked specific papers
 */
export async function checkUnlockedPapers(paperIds) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: true, unlockedPaperIds: [] };
    }

    if (!Array.isArray(paperIds) || paperIds.length === 0) {
      return { success: true, unlockedPaperIds: [] };
    }

    await connectDB();

    const unlockedPapers = await Unlock.find({
      userID: session.user.id,
      paperID: { $in: paperIds },
    }).select("paperID");

    const unlockedPaperIds = unlockedPapers.map((item) => item.paperID.toString());

    return { success: true, unlockedPaperIds };
  } catch (error) {
    console.error("Check unlocked papers error:", error);
    return { success: true, unlockedPaperIds: [] };
  }
}

/**
 * Unlocks a paper by deducting coins and creating transaction records atomically
 */
export async function unlockPaper(paperId) {
  const dbSession = await mongoose.startSession();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Please sign in to unlock papers" };
    }

    if (!paperId) {
      return { success: false, error: "Invalid paper selected" };
    }

    await connectDB();

    let response = null;

    await dbSession.withTransaction(async () => {
      const [user, paper] = await Promise.all([
        User.findById(session.user.id).session(dbSession),
        Paper.findOne({ _id: paperId, status: "approved" }).session(dbSession),
      ]);

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      if (!paper) {
        throw new Error("PAPER_NOT_FOUND");
      }

      const existingUnlock = await Unlock.findOne({
        userID: user._id,
        paperID: paper._id,
      }).session(dbSession);

      if (existingUnlock) {
        response = {
          success: true,
          alreadyUnlocked: true,
          coinBalance: user.coinBalance,
          unlockCost: UNLOCK_COST,
          message: "Paper already unlocked",
        };
        return;
      }

      if (user.coinBalance < UNLOCK_COST) {
        throw new Error("INSUFFICIENT_COINS");
      }

      user.coinBalance -= UNLOCK_COST;
      await user.save({ session: dbSession });

      await Unlock.create(
        [
          {
            userID: user._id,
            paperID: paper._id,
            coinSpent: UNLOCK_COST,
            unlockedAt: new Date(),
          },
        ],
        { session: dbSession }
      );

      await CoinTransaction.create(
        [
          {
            userID: user._id,
            amount: UNLOCK_COST,
            transactionType: "unlock",
            balanceAfter: user.coinBalance,
            createdAt: new Date(),
          },
        ],
        { session: dbSession }
      );

      await Paper.updateOne(
        { _id: paper._id },
        { $inc: { unlockCounts: 1 } },
        { session: dbSession }
      );

      response = {
        success: true,
        alreadyUnlocked: false,
        coinBalance: user.coinBalance,
        unlockCost: UNLOCK_COST,
        message: "Paper unlocked successfully",
      };
    });

    return response || { success: false, error: "Unable to unlock paper" };
  } catch (error) {
    if (error?.code === 11000) {
      const session = await getServerSession(authOptions);
      let latestBalance = null;
      if (session?.user?.id) {
        const latestUser = await User.findById(session.user.id).lean();
        latestBalance = latestUser?.coinBalance ?? null;
      }

      return {
        success: true,
        alreadyUnlocked: true,
        coinBalance: latestBalance,
        unlockCost: UNLOCK_COST,
        message: "Paper already unlocked",
      };
    }

    if (error?.message === "USER_NOT_FOUND") {
      return { success: false, error: "User not found" };
    }

    if (error?.message === "PAPER_NOT_FOUND") {
      return { success: false, error: "Paper not found or not available" };
    }

    if (error?.message === "INSUFFICIENT_COINS") {
      return { success: false, error: "Insufficient coins to unlock this paper" };
    }

    console.error("Unlock paper error:", error);
    return { success: false, error: "Failed to unlock paper. Please try again." };
  } finally {
    await dbSession.endSession();
  }
}
