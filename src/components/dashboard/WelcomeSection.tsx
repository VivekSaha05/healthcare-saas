import { getServerUser } from "@/lib/get-server-user";
import Link from "next/link";

export default async function WelcomeSection() {
  const user = await getServerUser();

  const firstName = user?.firstName ?? "there";
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=004A61&color=fff&size=128&bold=true&rounded=true`;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return (
    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-primary/20 mb-8 sm:mb-10 md:mb-12 overflow-hidden gap-4 sm:gap-6">
      <div className="space-y-3 sm:space-y-4 flex-1 min-w-0">
        <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
          <div className="size-2 bg-primary rounded-full animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-primary">Online & Ready</span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
            Good {greeting}, {firstName}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Your personal AI assistant is ready to help you maintain perfect health.
          </p>
        </div>
      </div>

      <div className="flex lg:flex-col items-center gap-3 sm:gap-4 self-center lg:self-auto">
        <div className="flex items-center justify-center size-20 sm:size-24 md:size-28 lg:size-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full overflow-hidden shrink-0">
          <img
            src={avatarUrl}
            alt={displayName}
            width={128}
            height={128}
            className="w-full h-full object-cover"
          />
        </div>

        <Link
          href="/profile"
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary text-white text-xs sm:text-sm font-medium hover:opacity-90 transition whitespace-nowrap"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
