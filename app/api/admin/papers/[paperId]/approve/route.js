import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/connectDB";
import Paper from "@/app/models/paper";

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

  paper.status = "approved";
  await paper.save();

  return NextResponse.json({
    ok: true,
    paper: {
      id: paper._id.toString(),
      subject: paper.subject,
      program: paper.program,
      status: paper.status,
    },
  });
}
