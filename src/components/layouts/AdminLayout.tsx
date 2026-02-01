
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Compass, Folder, Book, Bookmark, LogOut, Quote } from "lucide-react";
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
    ];

    return (
        <div className="min-h-screen flex bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-muted/20 flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="font-bold text-lg">Admin Panel</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Theme</span>
                        <ThemeToggle />
                    </div>
                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                        <LogOut size={18} />
                        Logout
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
