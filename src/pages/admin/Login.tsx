
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Login = () => {
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple client-side check. 
        // In a real app, this should be an API call.
        // For this portfolio, we check against an env var or a hardcoded fallback
        const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

        if (password === adminPass) {
            localStorage.setItem("isAuthenticated", "true");
            toast.success("Welcome back!");
            navigate("/admin");
        } else {
            toast.error("Invalid password");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Enter your password to access the admin panel.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Sign in
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
