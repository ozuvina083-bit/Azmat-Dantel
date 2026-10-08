import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { LangProvider } from "@/i18n";
import { CursorGlow, ScrollProgress } from "@/components/ui";
import { FloatingActions, Footer, MobileActionBar, Nav, Preloader } from "@/components/Layout";
import { DemoBar } from "@/components/DemoBar";
import { Hero } from "@/components/Hero";
import { Services, Tech, Why } from "@/components/Services";
import { Doctors, Results, Testimonials } from "@/components/Doctors";
import { Pricing, Contact } from "@/components/Pricing";
import { Booking } from "@/components/Booking";
import { Admin } from "@/components/Admin";
import { HomeContentProvider } from "@/lib/home-content";

function Shell() {
  const [loading, setLoading] = useState(() => {
    try {
      if (sessionStorage.getItem("ewd-loaded")) return false;
      // Never block returning visitors, data-saver users, slow networks or reduced-motion users.
      const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
      if (conn?.saveData) return false;
      if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return false;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    } catch {
      /* ignore */
    }
    return true;
  });

  useEffect(() => {
    if (!loading) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
  }, [loading]);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem("ewd-loaded", "1");
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const scrollToBook = useCallback(() => {
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="relative min-h-screen bg-ink">
      <AnimatePresence>{loading && <Preloader onDone={finish} />}</AnimatePresence>
      <ScrollProgress />
      <CursorGlow />

      <Nav onBook={scrollToBook} />
      <main>
        <Hero onBook={scrollToBook} />
        <Services onBook={scrollToBook} />
        <Why />
        <Tech />
        <Doctors onBook={scrollToBook} />
        <Results />
        <Testimonials />
        <Pricing onBook={scrollToBook} />
        <Booking />
        <Contact onBook={scrollToBook} />
      </main>
      <Footer onBook={scrollToBook} />
      {/* clearance for the fixed mobile action bar (placed after the footer, not inside main) */}
      <div aria-hidden className="h-[76px] md:hidden" />
      <FloatingActions />
      <MobileActionBar onBook={scrollToBook} />
      <DemoBar />
    </div>
  );
}

export default function App() {
  if (window.location.pathname.startsWith("/admin")) return <Admin />;
  return (
    <LangProvider>
      <HomeContentProvider>
        <Shell />
      </HomeContentProvider>
    </LangProvider>
  );
}
