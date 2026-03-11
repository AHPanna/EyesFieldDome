"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import api from "@/lib/api";
import {
    Camera, User,
    ShieldCheck,
    AlertCircle,
    AlertTriangle,
    Trash2,
    Save,
    Lock
} from "lucide-react";

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: user?.full_name || "",
        email: user?.email || "",
        current_password: "",
        new_password: "",
        confirm_password: "",
    });

    const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.patch("/users/me", {
                full_name: formData.full_name,
                email: formData.email,
            });
            setUser(response.data);
            toast.success("Profil mis à jour avec succès");
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.new_password !== formData.confirm_password) {
            return toast.error("Les nouveaux mots de passe ne correspondent pas");
        }
        setLoading(true);
        try {
            await api.patch("/users/me", {
                password: formData.new_password,
            });
            setFormData({ ...formData, current_password: "", new_password: "", confirm_password: "" });
            toast.success("Mot de passe mis à jour");
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et vos crédits restants ne seront pas remboursés.")) {
            return;
        }

        setLoading(true);
        try {
            await api.delete("/users/me");
            toast.success("Compte supprimé avec succès");
            localStorage.removeItem("token");
            window.location.href = "/login";
        } catch (error) {
            toast.error("Erreur lors de la suppression du compte");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Mon Profil</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Informations personnelles</CardTitle>
                        <CardDescription>Mettez à jour vos informations publiques.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="flex flex-col items-center space-y-4 mb-6">
                                <div className="relative group">
                                    <Avatar className="w-24 h-24 border-2 border-primary/20">
                                        <AvatarImage src={user?.profile_image || undefined} />
                                        <AvatarFallback className="text-2xl font-bold gradient-primary text-white">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1.5 bg-background border rounded-full cursor-pointer hover:bg-muted transition-colors shadow-sm">
                                        <Camera className="w-4 h-4 text-muted-foreground" />
                                        <input id="avatar-upload" type="file" className="hidden" accept="image/*" />
                                    </label>
                                </div>
                                <p className="text-xs text-muted-foreground italic">Cliquez sur l'icône pour charger une image.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="full_name">Nom complet</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                <Save className="w-4 h-4 mr-2" />
                                Enregistrer les modifications
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Sécurité & Mot de passe</CardTitle>
                        <CardDescription>Sécurisez votre compte avec un mot de passe fort.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Mot de passe actuel</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={formData.current_password}
                                    onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new_password">Nouveau mot de passe</Label>
                                <Input
                                    id="new_password"
                                    type="password"
                                    value={formData.new_password}
                                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm_password">Confirmer le nouveau mot de passe</Label>
                                <Input
                                    id="confirm_password"
                                    type="password"
                                    value={formData.confirm_password}
                                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                />
                            </div>

                            <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
                                <Lock className="w-4 h-4 mr-2" />
                                Mettre à jour le mot de passe
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t">
                            <div className="flex items-start space-x-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
                                <ShieldCheck className="w-5 h-5 text-orange-500 mt-1" />
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-400">Authentification à deux facteurs (2FA)</p>
                                    <p className="text-xs text-orange-800 dark:text-orange-500/80">
                                        Ajoutez une couche de sécurité supplémentaire à votre compte.
                                        <span className="font-bold ml-1 italic">(À venir)</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200 bg-red-50/30 dark:bg-red-950/10 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center text-lg">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Zone de danger
                        </CardTitle>
                        <CardDescription>
                            Actions irréversibles sur votre compte. Soyez vigilant.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row items-center justify-between p-4 border border-red-100 dark:border-red-900/40 rounded-lg bg-white dark:bg-slate-900 space-y-4 md:space-y-0">
                            <div className="space-y-1">
                                <p className="font-bold text-red-600">Supprimer mon compte</p>
                                <p className="text-xs text-muted-foreground max-w-xl">
                                    La suppression de votre compte est définitive. Toutes vos alertes configurées,
                                    votre historique de navigation et vos crédits restants seront supprimés instantanément.
                                    Conformément à nos CGU, les crédits ne sont pas remboursables.
                                </p>
                            </div>
                            <Button variant="destructive" size="default" onClick={handleDeleteAccount} disabled={loading}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer définitivement
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
