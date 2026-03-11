"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Mail, Lock, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { Token } from "@/lib/types";

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post<Token>("/auth/login", form);
            setAuth(data.user, data.access_token);
            toast.success(`Bienvenue, ${data.user.full_name} !`);
            router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Erreur de connexion";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md animate-fade-in-up">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary glow mb-4">
                        <MapPin className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">RDV Préfecture</h1>
                    <p className="text-muted-foreground text-sm mt-1">Alertes de disponibilité automatiques</p>
                </div>

                <Card className="border-border bg-card">
                    <CardHeader>
                        <CardTitle className="text-xl">Connexion</CardTitle>
                        <CardDescription>Accédez à votre espace de surveillance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="vous@exemple.fr"
                                        className="pl-9"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-9"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full gradient-primary glow-sm" disabled={loading}>
                                {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                                Se connecter
                            </Button>
                        </form>
                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Pas encore de compte ?{" "}
                            <Link href="/register" className="text-primary hover:underline font-medium">
                                S&apos;inscrire
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
