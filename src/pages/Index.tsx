import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import HeroSection from "@/components/HeroSection";
import WritingSection from "@/components/WritingSection";
import JourneySection from "@/components/JourneySection";
import ProjectsSection from "@/components/ProjectsSection";
import BookmarksSection from "@/components/BookmarksSection";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "writing", "journey", "projects", "bookmarks"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Joel Barrientos | Full Stack Developer"
        description="Portfolio of Joel Barrientos, a Full Stack Developer specializing in React, Node.js, and modern web technologies. View my projects and journey."
        url="https://joedev.vercel.app/"
      />
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
      </div>

      {/* Mobile Navigation */}
      <MobileNav activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="md:ml-64 pb-24 md:pb-0">
        <div>
          <HeroSection />
          <WritingSection />
          <JourneySection />
          <ProjectsSection />
          <BookmarksSection />
        </div>
      </main>
    </div>
  );
};

export default Index;
