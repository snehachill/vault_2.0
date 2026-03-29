"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/connectDB";
import User from "@/app/models/user";
import Paper from "@/app/models/paper";
import Unlock from "@/app/models/unlock";
import SavedPaper from "@/app/models/savedPaper";

const RANGE_MAP = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  all: null,
};

function normalizeRange(rangeKey = "30d") {
  const key = typeof rangeKey === "string" ? rangeKey.toLowerCase() : "30d";
  return RANGE_MAP[key] !== undefined ? key : "30d";
}

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "UNAUTHORIZED" };
  }
  if (session.user.role !== "admin") {
    return { ok: false, error: "FORBIDDEN" };
  }
  return { ok: true, session };
}

export async function getAdminDashboardSnapshot(rangeKey = "30d") {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard;
  const { session } = guard;

  await connectDB();

  const normalizedKey = normalizeRange(rangeKey);
  const days = RANGE_MAP[normalizedKey];
  const startDate = days ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;
  const uploadMatch = startDate ? { uploadedAt: { $gte: startDate } } : {};
  const unlockMatch = startDate ? { unlockedAt: { $gte: startDate } } : {};
  const savedMatch = startDate ? { savedAt: { $gte: startDate } } : {};

  const [totalUsers, totalPapers, pendingCount, approvedCount, rejectedCount, totalUnlocks, totalSaved] =
    await Promise.all([
      User.countDocuments(),
      Paper.countDocuments(),
      Paper.countDocuments({ status: "pending" }),
      Paper.countDocuments({ status: "approved" }),
      Paper.countDocuments({ status: "rejected" }),
      Unlock.countDocuments(unlockMatch),
      SavedPaper.countDocuments(savedMatch),
    ]);

  const uploadsByDay = await Paper.aggregate([
    ...(startDate ? [{ $match: uploadMatch }] : []),
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$uploadedAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]).then((rows) => rows.map((row) => ({ date: row._id, count: row.count })));

  const topUploaders = await Paper.aggregate([
    ...(startDate ? [{ $match: uploadMatch }] : []),
    { $group: { _id: "$uploaderID", uploads: { $sum: 1 } } },
    { $sort: { uploads: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        name: { $ifNull: ["$user.name", "Unknown user"] },
        uploads: 1,
      },
    },
  ]);

  const topPapers = await Paper.find()
    .sort({ unlockCounts: -1, saveCounts: -1 })
    .limit(5)
    .select("subject program unlockCounts saveCounts status")
    .lean();

  const pendingPreview = await Paper.find({ status: "pending" })
    .sort({ uploadedAt: -1 })
    .limit(5)
    .select("subject program uploaderID uploadedAt status")
    .populate({ path: "uploaderID", select: "name" })
    .lean();

  return {
    ok: true,
    adminName: session.user.name || "Admin",
    range: normalizedKey,
    stats: {
      users: totalUsers,
      papers: totalPapers,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      unlocks: totalUnlocks,
      saves: totalSaved,
    },
    charts: {
      uploadsByDay,
      topUploaders,
      topPapers: topPapers.map((p) => ({
        id: p._id.toString(),
        title: p.subject,
        program: p.program,
        unlocks: p.unlockCounts || 0,
        saves: p.saveCounts || 0,
        status: p.status,
      })),
      statusMix: [
        { label: "Approved", value: approvedCount, color: "#10b981" },
        { label: "Pending", value: pendingCount, color: "#f59e0b" },
        { label: "Rejected", value: rejectedCount, color: "#ef4444" },
      ],
    },
    pendingPreview: pendingPreview.map((item) => ({
      id: item._id.toString(),
      subject: item.subject,
      program: item.program,
      uploadedAt: item.uploadedAt,
      uploader: item.uploaderID?.name || "Unknown",
      status: item.status,
    })),
  };
}

export async function getApprovalQueue(status = "pending", limit = 50) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard;

  await connectDB();

  const normalizedStatus = ["pending", "approved", "rejected"].includes(status)
    ? status
    : "pending";

  const items = await Paper.find({ status: normalizedStatus })
    .sort({ uploadedAt: -1 })
    .limit(limit)
    .select("subject program specialization semester year uploadedAt status uploaderID unlockCounts saveCounts storageFileName")
    .populate({ path: "uploaderID", select: "name email" })
    .lean();

  return {
    ok: true,
    status: normalizedStatus,
    items: items.map((item) => ({
      id: item._id.toString(),
      subject: item.subject,
      program: item.program,
      specialization: item.specialization,
      semester: item.semester,
      year: item.year,
      uploadedAt: item.uploadedAt,
      status: item.status,
      unlocks: item.unlockCounts || 0,
      saves: item.saveCounts || 0,
      uploader: {
        name: item.uploaderID?.name || "Unknown",
        email: item.uploaderID?.email || "",
      },
      storageFileName: item.storageFileName,
    })),
  };
}
