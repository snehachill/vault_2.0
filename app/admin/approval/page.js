import { getApprovalQueue } from "@/app/actions/adminDashboardActions";
import AdminApprovalClient from "./AdminApprovalClient";

export const dynamic = "force-dynamic";

export default async function AdminApprovalPage({ searchParams }) {
  const status = searchParams?.status || "pending";
  const queue = await getApprovalQueue(status);

  if (!queue?.ok) {
    return (
      <div className="max-w-3xl mx-auto rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        <p className="font-semibold">Unable to load approvals</p>
        <p className="text-sm opacity-80">{queue?.error || "Unexpected error."}</p>
      </div>
    );
  }

  return <AdminApprovalClient initialQueue={queue} />;
}
