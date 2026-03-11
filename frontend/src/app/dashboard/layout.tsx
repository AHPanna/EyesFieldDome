"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) router.push("/login");
    }, [user, router]);

    if (!user) return null;

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
