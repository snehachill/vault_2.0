import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/connectDB";
import { createServerClient } from "@/lib/supabase";
import Paper from "@/app/models/paper";
import Unlock from "@/app/models/unlock";
import mongoose from "mongoose";

/**
 * GET /api/papers/[paperId]/content
 * 
 * Streams PDF bytes for an unlocked paper.
 * Enforces:
 * 1. User must be authenticated
 * 2. Paper must exist and be approved
 * 3. User must have unlocked the paper
 * 
 * Returns PDF as application/pdf stream
 */
export async function GET(request, { params }) {
  try {
    const { paperId } = await params;

    // 1. Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;

    // 2. Connect to database
    await connectDB();

    // 3. Validate paperId is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(paperId)) {
      return new Response(JSON.stringify({ error: "Invalid paper ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Fetch paper and verify it exists and is approved
    const paper = await Paper.findById(paperId).lean();
    if (!paper) {
      return new Response(JSON.stringify({ error: "Paper not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (paper.status !== "approved") {
      return new Response(
        JSON.stringify({ error: "This paper is not available for viewing" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 5. Verify user has unlocked this paper
    const unlock = await Unlock.findOne({
      userID: new mongoose.Types.ObjectId(userId),
      paperID: new mongoose.Types.ObjectId(paperId),
    }).lean();

    if (!unlock) {
      return new Response(
        JSON.stringify({ error: "This paper has not been unlocked" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 6. Fetch PDF from Supabase storage
    const supabase = createServerClient();
    const filePath = `uploads/${paper.storageFileName}`;

    const { data, error } = await supabase.storage
      .from("Vault-2.0")
      .download(filePath);

    if (error || !data) {
      console.error("Supabase download error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve PDF file" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 7. Stream PDF response
    const buffer = await data.arrayBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": buffer.byteLength,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        // Prevent direct download/viewing in browser context
        "Content-Disposition": "inline; filename=paper.pdf",
      },
    });
  } catch (error) {
    console.error("PDF content endpoint error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
