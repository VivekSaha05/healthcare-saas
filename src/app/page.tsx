import About from "@/components/landing/About";
import ContactUs from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingSection from "@/components/landing/PricingSection";
import WhatToAsk from "@/components/landing/WhatToAsk";
import { getServerUser } from "@/lib/get-server-user";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getServerUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full">
        <Hero />
        <About />
        <HowItWorks />
        <WhatToAsk />
        <PricingSection />
        <ContactUs />
      </main>
      <Footer />
    </div>
  );
}
