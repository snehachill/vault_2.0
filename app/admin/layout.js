import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Navbar from "@/component/Navbar";
import { authOptions } from "@/lib/auth";

export const metadata = {
  title: "Vault Admin",
  description: "Admin console for Vault",
};

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/admin/dashboard");
  }

  if (session.user.role !== "admin") {
    redirect("/user/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <div className="pt-[100px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {children}
      </div>
    </div>
  );
}
