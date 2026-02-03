import { Home, PenLine, Compass, Sun, Bookmark } from "lucide-react";
import { useTranslation } from "react-i18next";

const navItems = [
  { id: "home", icon: Home, label: "sidebar.nav.home" },
  { id: "writing", icon: PenLine, label: "sidebar.nav.writing" },
  { id: "journey", icon: Compass, label: "sidebar.nav.journey" },
  { id: "projects", icon: Sun, label: "sidebar.nav.projects" },
  { id: "bookmarks", icon: Bookmark, label: "sidebar.nav.bookmarks" },
];

interface MobileNavProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

import { ThemeToggle } from "./ThemeToggle";

// ... existing code ...

import { useProfile } from "@/hooks/use-db-data";

const MobileNav = ({ activeSection, onNavigate }: MobileNavProps) => {
  const { data: profile } = useProfile();
  const { t } = useTranslation();
  return (
    <>
      {/* Floating Theme Toggle for Mobile */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <ThemeToggle />
      </div>

      {/* Floating Profile for Mobile */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border shadow-sm">
          {profile?.image ? (
            <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center text-[10px] text-muted-foreground">{t("common.img")}</div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-50 md:hidden">
        <div className="grid grid-cols-5 w-full py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Icon size={20} />
                <span className="text-xs hidden min-[400px]:block truncate w-full px-1 text-center">{t(item.label as any)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
