
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Compass, Folder, Book, Bookmark, LogOut, Quote, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated");
        navigate("/admin/login");
    };

    const navItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/journey", icon: Compass, label: "Journey" },
        { href: "/admin/projects", icon: Folder, label: "Projects" },
        { href: "/admin/writings", icon: Book, label: "Writing" },
        { href: "/admin/bookmarks", icon: Bookmark, label: "Bookmarks" },
        { href: "/admin/quotes", icon: Quote, label: "Quotes" },
        { href: "/admin/profile", icon: LayoutDashboard, label: "Profile" },
        { href: "/admin/settings", icon: Settings, label: "Settings" },
    ];

    return (
        <div className="min-h-screen flex bg-background">
            {/* Sidebar */}
            <aside className="w-20 border-r border-sidebar-border bg-sidebar flex flex-col items-center py-8 z-50">
                <div className="mb-8 px-4 w-full flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0 border border-sidebar-border">
                        <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                            A
                        </div>
                    </div>
                </div>
                <nav className="flex-1 w-full px-2 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={`flex items-center justify-center w-full py-2.5 rounded-lg transition-all duration-300 ${isActive
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                                title={item.label}
                            >
                                <Icon size={18} />
                            </Link>
                        );
                    })}
                </nav>
                <div className="w-full mt-auto px-4 pt-4 flex flex-col items-center gap-4">
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="container mx-auto max-w-5xl py-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
