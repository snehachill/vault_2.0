import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/connectDB";
import Paper from "@/app/models/paper";
import { createServerClient } from "@/lib/supabase";

const BUCKET_NAME = "Vault-2.0";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, status: 401, message: "UNAUTHORIZED" };
  }
  if (session.user.role !== "admin") {
    return { ok: false, status: 403, message: "FORBIDDEN" };
  }
  return { ok: true, session };
}

export async function POST(_req, { params }) {
  const guard = await requireAdmin();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.message }, { status: guard.status });
  }

  await connectDB();

  const paper = await Paper.findById(params.paperId);
  if (!paper) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  let fileRemoved = false;
  const filePath = paper.storageFileName
    ? paper.storageFileName.startsWith("uploads/")
      ? paper.storageFileName
      : `uploads/${paper.storageFileName}`
    : null;

  try {
    if (filePath) {
      const supabase = createServerClient();
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      if (!error) fileRemoved = true;
    }
  } catch (err) {
    console.error("Supabase delete error", err);
  }

  paper.status = "rejected";
  await paper.save();

  return NextResponse.json({
    ok: true,
    fileRemoved,
    paper: {
      id: paper._id.toString(),
      subject: paper.subject,
      program: paper.program,
      status: paper.status,
    },
  });
}
