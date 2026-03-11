"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shield, ShieldOff, UserCheck, UserX, Coins, Ticket, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import api from "@/lib/api";
import { User } from "@/lib/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUsagesOpen, setIsUsagesOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userUsages, setUserUsages] = useState<any[]>([]);
    const [usagesLoading, setUsagesLoading] = useState(false);


    const fetchUsers = () => api.get<User[]>("/admin/users").then((r) => { setUsers(r.data); setLoading(false); });
    useEffect(() => { fetchUsers(); }, []);

    const updateUser = async (id: number, payload: Partial<User>) => {
        try {
            await api.patch(`/admin/users/${id}`, payload);
            toast.success("Utilisateur mis à jour");
            fetchUsers();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Erreur";
            toast.error(msg);
        }
    };

    const handleViewUserCoupons = async (user: User) => {
        setSelectedUser(user);
        setIsUsagesOpen(true);
        setUsagesLoading(true);
        try {
            const res = await api.get(`/credits/admin/users/${user.id}/coupons`);
            setUserUsages(res.data);
        } catch (err) {
            toast.error("Erreur lors du chargement des coupons");
        } finally {
            setUsagesLoading(false);
        }
    };

    const handleDeleteUsage = async (usageId: number) => {
        if (!confirm("Annuler l'utilisation et retirer les crédits à l'utilisateur ?")) return;
        try {
            await api.delete(`/credits/admin/usages/${usageId}`);
            toast.success("Utilisation annulée");
            if (selectedUser) {
                const res = await api.get(`/credits/admin/users/${selectedUser.id}/coupons`);
                setUserUsages(res.data);
                fetchUsers(); // Refresh to update user's credits
            }
        } catch (err) {
            toast.error("Erreur lors de l'annulation");
        }
    };


    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
                <p className="text-muted-foreground mt-1">{users.length} utilisateur(s) inscrit(s)</p>
            </div>

            <Card className="border-border bg-card">
                <CardHeader><CardTitle>Tous les utilisateurs</CardTitle></CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-muted-foreground text-sm">Chargement…</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border">
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Crédits</TableHead>
                                    <TableHead>Inscrit le</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id} className="border-border hover:bg-muted/20">
                                        <TableCell className="font-medium">{user.full_name}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge className={user.role === "admin" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-muted"}>
                                                {user.role === "admin" ? "Admin" : "Utilisateur"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={user.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                                                {user.is_active ? "Actif" : "Désactivé"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                                                {user.credits}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(user.created_at), "dd MMM yyyy", { locale: fr })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 justify-end">
                                                <Button variant="ghost" size="sm" title="Voir les coupons" onClick={() => handleViewUserCoupons(user)}>
                                                    <Ticket className="w-4 h-4 text-blue-400" />
                                                </Button>
                                                <Button variant="ghost" size="sm" title="Modifier les crédits"
                                                    onClick={() => {
                                                        const newVal = prompt("Nouveau solde de crédits :", String(user.credits));
                                                        if (newVal !== null) updateUser(user.id, { credits: parseInt(newVal) });
                                                    }}>
                                                    <Coins className="w-4 h-4 text-primary" />
                                                </Button>
                                                <Button variant="ghost" size="sm" title={user.role === "admin" ? "Rétrograder" : "Promouvoir admin"}
                                                    onClick={() => updateUser(user.id, { role: user.role === "admin" ? "user" : "admin" })}>
                                                    {user.role === "admin" ? <ShieldOff className="w-4 h-4 text-yellow-400" /> : <Shield className="w-4 h-4 text-purple-400" />}
                                                </Button>
                                                <Button variant="ghost" size="sm" title={user.is_active ? "Désactiver" : "Activer"}
                                                    onClick={() => updateUser(user.id, { is_active: !user.is_active })}>
                                                    {user.is_active ? <UserX className="w-4 h-4 text-red-400" /> : <UserCheck className="w-4 h-4 text-green-400" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* View User Coupons Dialog */}
            <Dialog open={isUsagesOpen} onOpenChange={setIsUsagesOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Coupons de {selectedUser?.full_name}</DialogTitle>
                        <DialogDescription>
                            Liste des coupons activés par cet utilisateur.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 max-h-[400px] overflow-y-auto">
                        {usagesLoading ? (
                            <div className="flex justify-center py-10">
                                <span className="text-muted-foreground">Chargement...</span>
                            </div>
                        ) : userUsages.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                                <p>Aucun coupon utilisé.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code Coupon</TableHead>
                                        <TableHead className="text-right">Date d'utilisation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userUsages.map((usage) => (
                                        <TableRow key={usage.id}>
                                            <TableCell className="font-medium font-mono uppercase">{usage.coupon_code}</TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">
                                                <div className="flex items-center justify-end gap-4">
                                                    <span>{format(new Date(usage.used_at), "PPp", { locale: fr })}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteUsage(usage.id)} title="Annuler et retirer les crédits">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUsagesOpen(false)}>Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

    );
}
