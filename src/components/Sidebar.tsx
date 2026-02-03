import { Home, PenLine, Compass, Sun, Bookmark, Github, Linkedin, Mail, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";


interface NavItem {
  id: string;
  icon: LucideIcon;
  label: string;
}

const navItems: NavItem[] = [
  { id: "home", icon: Home, label: "sidebar.nav.home" },
  { id: "writing", icon: PenLine, label: "sidebar.nav.writing" },
  { id: "journey", icon: Compass, label: "sidebar.nav.journey" },
  { id: "projects", icon: Sun, label: "sidebar.nav.projects" },
  { id: "bookmarks", icon: Bookmark, label: "sidebar.nav.bookmarks" },
];

interface SocialLink {
  icon: LucideIcon | React.FC<{ className?: string }>;
  label: string;
  href: string;
}

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  </svg>
);



const GoodreadsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <text x="6" y="18" fontSize="16" fontWeight="bold" fontFamily="Georgia, serif">g</text>
  </svg>
);



const socialLinks: SocialLink[] = [
  { icon: Github, label: "Github", href: "https://github.com/barrientossjoel" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/barrientossjoel/" },
  // { icon: Twitter, label: "X (Twitter)", href: "#" },
  { icon: PinterestIcon, label: "Pinterest", href: "https://ar.pinterest.com/SrShowi/" },
  // { icon: TumblrIcon, label: "Tumblr", href: "#" }, // Keeping specific requested order/items
  { icon: GoodreadsIcon, label: "Goodreads", href: "https://www.goodreads.com/user/show/90977974-joel-barrientos" },
  { icon: Mail, label: "Gmail", href: "https://mail.google.com/mail/?view=cm&fs=1&to=barrientoss.joel@gmail.com" },
];

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

import { ThemeToggle } from "./ThemeToggle";

import { useProfile } from "@/hooks/use-db-data";

const Sidebar = ({ activeSection, onNavigate }: SidebarProps) => {
  const { data: profile } = useProfile();
  const { t } = useTranslation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col py-8 z-50 border-r border-sidebar-border">
      {/* Profile Section */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
          {profile?.image ? (
            <img
              src={profile.image}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">
              IMG
            </div>
          )}
        </div>
        <div>
          <h3 className="text-foreground font-medium text-sm">{profile?.name || t("sidebar.profile.loading")}</h3>
          <p className="text-muted-foreground text-xs">
            {profile ? (i18n.language === 'es' ? (profile.role_es || profile.role) : profile.role) : "..."}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 w-full text-sm ${isActive
                ? "text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Icon size={18} className="shrink-0" />
              <span>{t(item.label as any)}</span>
            </button>
          );
        })}

        {/* Media Section */}
        <div className="mt-6">
          <p className="px-4 text-xs text-muted-foreground mb-2">{t("sidebar.media")}</p>
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 w-full text-sm text-muted-foreground hover:text-foreground"
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span>{link.label}</span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="mt-auto px-4 pt-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs text-muted-foreground">{t("sidebar.theme.toggle")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </aside >
  );
};

export default Sidebar;
