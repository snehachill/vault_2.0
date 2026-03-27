import { connectDB } from "@/lib/connectDB";
import Paper from "@/app/models/paper";
import mongoose from "mongoose";

/**
 * GET /api/papers/[paperId]
 * 
 * Fetches paper metadata for public viewing
 * Only returns approved papers
 */
export async function GET(request, { params }) {
  try {
    const { paperId } = await params;

    // Validate paperId
    if (!mongoose.Types.ObjectId.isValid(paperId)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid paper ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to DB
    await connectDB();

    // Fetch paper (only approved ones are visible)
    const paper = await Paper.findOne({
      _id: paperId,
      status: "approved",
    }).lean();

    if (!paper) {
      return new Response(
        JSON.stringify({ success: false, error: "Paper not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return paper metadata (no storageURL/storageFileName to prevent URL leakage)
    return new Response(
      JSON.stringify({
        success: true,
        paper: {
          _id: paper._id.toString(),
          institute: paper.institute,
          subject: paper.subject,
          program: paper.program,
          specialization: paper.specialization,
          semester: paper.semester,
          year: paper.year,
          unlockCounts: paper.unlockCounts,
          saveCounts: paper.saveCounts,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Paper metadata endpoint error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
