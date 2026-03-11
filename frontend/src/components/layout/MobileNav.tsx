"use client";

import { Menu, MapPin } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";

export function MobileNav() {
    return (
        <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-border bg-[var(--sidebar)] sticky top-0 z-40">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary glow-sm">
                    <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm text-foreground">RDV Préfecture</span>
            </div>

            <Sheet>
                <SheetTrigger render={<Button variant="ghost" size="icon" className="w-9 h-9" />}>
                    <Menu className="w-5 h-5" />
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-[var(--sidebar)] border-r-border">
                    <Sidebar isMobile />
                </SheetContent>
            </Sheet>
        </header>
    );
}
