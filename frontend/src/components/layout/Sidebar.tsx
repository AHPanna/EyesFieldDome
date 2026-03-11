"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Bell,
    PlusCircle,
    Users,
    BarChart3,
    LogOut,
    Shield,
    MapPin,
    ChevronRight,
    Coins,
    Settings,
    LifeBuoy,
    Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User as UserIcon } from "lucide-react";

const userNav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/alerts", label: "Mes alertes", icon: Bell },
    { href: "/dashboard/alerts/new", label: "Nouvelle alerte", icon: PlusCircle },
    { href: "/dashboard/profile", label: "Mon profil", icon: UserIcon },
    { href: "/dashboard/support", label: "Assistance", icon: LifeBuoy },
];

const adminNav = [
    { href: "/admin", label: "Statistiques", icon: BarChart3 },
    { href: "/admin/users", label: "Utilisateurs", icon: Users },
    { href: "/admin/alerts", label: "Toutes les alertes", icon: Bell },
    { href: "/admin/prefectures", label: "Préfectures", icon: MapPin },
    { href: "/admin/settings", label: "Configuration", icon: Settings },
    { href: "/admin/coupons", label: "Coupons", icon: Ticket },
    { href: "/admin/support", label: "Support Client", icon: LifeBuoy },
];

export function Sidebar({ isMobile }: { isMobile?: boolean }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAdmin } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const initials = user?.full_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "?";

    return (
        <aside className={cn(
            "flex-col w-64 min-h-screen bg-[var(--sidebar)] border-r border-border",
            isMobile ? "flex" : "hidden lg:flex"
        )}>
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-primary glow-sm">
                    <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="font-bold text-sm text-foreground">RDV Préfecture</p>
                    <p className="text-[10px] text-muted-foreground">Alertes automatiques</p>
                </div>
                <div className="ml-auto">
                    <ThemeToggle />
                </div>
            </div>

            <Separator className="mb-2" />

            {/* User nav */}
            <nav className="flex-1 px-3 py-2 space-y-1">
                <p className="px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Mon espace
                </p>
                {userNav.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                active
                                    ? "bg-accent text-accent-foreground glow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <Icon className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "")} />
                            <span className="flex-1">{label}</span>
                            {active && <ChevronRight className="w-3 h-3 text-primary" />}
                        </Link>
                    );
                })}

                {/* Admin nav */}
                {isAdmin() && (
                    <>
                        <div className="pt-4">
                            <p className="px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Administration
                            </p>
                        </div>
                        {adminNav.map(({ href, label, icon: Icon }) => {
                            const active = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                        active
                                            ? "bg-accent text-accent-foreground glow-sm"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "")} />
                                    <span className="flex-1">{label}</span>
                                    {active && <ChevronRight className="w-3 h-3 text-primary" />}
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* Credits Display */}
            <div className="px-3 mb-2">
                <Link
                    href="/dashboard/credits"
                    className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group"
                >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary">
                        <Coins className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Mes crédits</p>
                        <p className="text-sm font-bold text-foreground">{user?.credits ?? 0} <span className="text-xs font-normal opacity-70">crédits</span></p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            </div>

            {/* User profile */}
            <div className="p-3 border-t border-border">
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-muted">
                    <Avatar className="w-8 h-8">
                        <AvatarFallback className="gradient-primary text-white text-xs font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{user?.full_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
                        title="Déconnexion"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </aside>
    );
}
