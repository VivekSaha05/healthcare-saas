import { getServerUser } from "@/lib/get-server-user";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import MainActions from "@/components/dashboard/MainActions";
import ActivityOverview from "@/components/dashboard/ActivityOverview";

export default async function DashboardPage() {
  const user = await getServerUser();

  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-20 sm:pt-24">
        <WelcomeSection />
        <MainActions />
        <ActivityOverview />
      </div>
    </>
  );
}
