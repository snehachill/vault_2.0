

import { redirect } from "next/navigation";
import { getDashboardSnapshot } from "@/app/actions/dashboardActions";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();

  if (!snapshot?.ok && snapshot?.error === "UNAUTHORIZED") {
    redirect("/auth/login");
  }

  return <DashboardClient initialData={snapshot} />;
}

