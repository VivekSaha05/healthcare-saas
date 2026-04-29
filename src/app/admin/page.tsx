export const dynamic = "force-dynamic";

import { getServerUser } from "@/lib/get-server-user";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

async function AdminPage() {
  const user = await getServerUser();

  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen bg-background">
      <AdminDashboardClient />
    </div>
  );
}

export default AdminPage;
