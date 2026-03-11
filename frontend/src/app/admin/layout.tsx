"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, isAdmin } = useAuthStore();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !user) { router.push("/login"); return; }
        if (mounted && user && !isAdmin()) router.push("/dashboard");
    }, [user, isAdmin, router, mounted]);

    if (!mounted || !user || !isAdmin()) return null;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-background">
            <MobileNav />
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <div className="max-w-6xl mx-auto p-8">{children}</div>
            </main>
        </div>
    );
}
