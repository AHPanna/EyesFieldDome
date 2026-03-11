"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import api from "@/lib/api";
import type { User } from "@/lib/types";

// Type alias for the register response
type RegisterResponse = User;

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "", full_name: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error("Mot de passe trop court (minimum 6 caractères)"); return; }
        setLoading(true);
        try {
            await api.post<RegisterResponse>("/auth/register", form);
            toast.success("Compte créé ! Vous pouvez maintenant vous connecter.");
            router.push("/login");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Erreur lors de l'inscription";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md animate-fade-in-up">
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary glow mb-4">
                        <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">RDV Préfecture</h1>
                    <p className="text-muted-foreground text-sm mt-1">Créez votre compte gratuit</p>
                </div>

                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-xl">Inscription</CardTitle>
                        <CardDescription>Commencez à surveiller les disponibilités</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Nom complet</Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                    <Input id="full_name" placeholder="Jean Dupont" className="pl-9"
                                        value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                    <Input id="email" type="email" placeholder="vous@exemple.fr" className="pl-9"
                                        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                    <Input id="password" type="password" placeholder="Min. 6 caractères" className="pl-9"
                                        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full gradient-primary glow-sm" disabled={loading}>
                                {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                Créer mon compte
                            </Button>
                        </form>
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Déjà un compte ?{" "}
                            <Link href="/login" className="text-primary hover:underline font-medium">Se connecter</Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
