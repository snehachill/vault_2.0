import { getAdminDashboardSnapshot } from "@/app/actions/adminDashboardActions";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ searchParams }) {
  const range = searchParams?.range || "30d";
  const snapshot = await getAdminDashboardSnapshot(range);

  if (!snapshot?.ok) {
    return (
      <div className="max-w-3xl mx-auto rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        <p className="font-semibold">Unable to load admin dashboard</p>
        <p className="text-sm opacity-80">{snapshot?.error || "Unexpected error."}</p>
      </div>
    );
  }

  return <AdminDashboardClient initialData={snapshot} />;
}
