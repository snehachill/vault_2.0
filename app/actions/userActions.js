"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/connectDB";
import User from "@/app/models/user";
import bcrypt from "bcryptjs";

// ─── SHARED HELPER ────────────────────────────────────────────────────────────
async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) throw new Error("User not found");
  return user;
}

// ─── GET PROFILE ─────────────────────────────────────────────────────────────
// Returns every field the UI needs — nothing extra, nothing internal
export async function getUserProfile() {
  try {
    const u = await getCurrentUser();
    return {
      success: true,
      data: {
        _id:            u._id.toString(),
        name:           u.name           ?? "",
        email:          u.email          ?? "",
        pfp_url:        u.pfp_url        ?? "",
        coinBalance:    u.coinBalance    ?? 0,
        isPremium:      u.isPremium      ?? false,
        premiumExpiry:  u.premiumExpiry  ?? null,
        referralCode:   u.referralCode   ?? "",
        referredBy:     u.referredBy     ? u.referredBy.toString() : null,
        role:           u.role           ?? "user",
        isOnboarded:    u.isOnboarded    ?? false,
        university:     u.university     ?? "",
        program:        u.program        ?? "",
        specialization: u.specialization ?? "",
        semester:       u.semester       ?? 1,
        createdAt:      u.createdAt      ?? null,
        // UI needs to know whether to show "Change Password" button
        hashedPassword: !!u.hashedPassword,
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── SAVE ALL CHANGES ────────────────────────────────────────────────────────
// Called by the "Save Changes" / "Save Profile" button — updates all editable fields at once
export async function saveAllChanges({
  name,
  pfp_url,
  university,
  program,
  specialization,
  semester,
}) {
  try {
    if (!name?.trim())       return { success: false, error: "Name cannot be empty" };
    if (!university?.trim()) return { success: false, error: "University is required" };

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    await connectDB();

    const updated = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          name:           name.trim(),
          pfp_url:        pfp_url        ?? "",
          university:     university.trim(),
          program:        program        ?? "",
          specialization: specialization ?? "",
          semester:       Number(semester) || 1,
        },
      },
      { new: true }
    ).lean();

    if (!updated) return { success: false, error: "User not found" };

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── CHANGE PASSWORD ─────────────────────────────────────────────────────────
export async function changePassword({ currentPassword, newPassword }) {
  try {
    if (!currentPassword || !newPassword)
      return { success: false, error: "All fields are required" };

    if (newPassword.length < 8)
      return { success: false, error: "Password must be at least 8 characters" };

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, error: "Unauthorized" };

    await connectDB();

    // Need the raw document (not .lean()) so we can call .save()
    const user = await User.findOne({ email: session.user.email });
    if (!user) return { success: false, error: "User not found" };

    if (!user.hashedPassword)
      return { success: false, error: "Password login is not available for OAuth accounts" };

    const isMatch = await bcrypt.compare(currentPassword, user.hashedPassword);
    if (!isMatch) return { success: false, error: "Current password is incorrect" };

    user.hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.save();

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}