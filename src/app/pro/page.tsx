import Navbar from "@/components/Navbar";
import { getServerUser } from "@/lib/get-server-user";
import { CrownIcon, CheckCircle } from "lucide-react";
import { redirect } from "next/navigation";

async function ProPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <div className="mb-12 overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-br from-primary/10 to-background rounded-3xl p-8 border border-primary/20">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  {user.plan === "PRO" ? "You are on PRO" : "Upgrade to Pro"}
                </span>
              </div>

              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {user.plan === "PRO"
                    ? "You have Premium Access"
                    : "Unlock Premium AI Health Care"}
                </h1>
                <p className="text-muted-foreground">
                  {user.plan === "PRO"
                    ? "Enjoy unlimited AI consultations, advanced features, and priority support."
                    : "Get unlimited AI consultations, advanced features, and priority support to take your health to the next level."}
                </p>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                <CrownIcon className="w-16 h-16 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {user.plan === "PRO" ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">You&apos;re on PRO!</h2>
            <p className="text-muted-foreground">
              You have full access to all premium features including the AI Voice Assistant.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Choose Your Plan</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Select the perfect plan for your health care needs. All plans include secure access
                and bank-level encryption.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Free Plan */}
              <div className="bg-card border border-border rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <p className="text-3xl font-bold mb-4">
                  $0<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="space-y-3 mb-8 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    Book up to 3 appointments/month
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    View doctor profiles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    Email confirmations
                  </li>
                </ul>
                <div className="w-full text-center px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground">
                  Current Plan
                </div>
              </div>

              {/* Pro Plan */}
              <div className="bg-card border-2 border-primary rounded-2xl p-8 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  POPULAR
                </div>
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <p className="text-3xl font-bold mb-4">
                  $9.99<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>
                <ul className="space-y-3 mb-8 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    Unlimited appointments
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    AI Voice Assistant access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    All Free plan features
                  </li>
                </ul>
                <a
                  href="mailto:viveksahapop@gmail.com?subject=Pro%20Plan%20Upgrade%20Request"
                  className="block w-full text-center px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                >
                  Contact to Upgrade
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ProPage;
