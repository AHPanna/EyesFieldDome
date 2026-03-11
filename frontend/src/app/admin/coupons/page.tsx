"use client";

import { useState, useEffect } from "react";
import {
    Ticket,
    Plus,
    Search,
    RefreshCcw,
    Users,
    Calendar,
    XCircle,
    Loader2,
    ArrowLeft,
    Pencil,
    Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Coupon {
    id: number;
    code: string;
    credits: number;
    max_uses: number;
    current_uses: number;
    is_active: boolean;
    created_at: string;
}

interface CouponUsage {
    id: number;
    user_id: number;
    user_email: string;
    used_at: string;
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isUsageOpen, setIsUsageOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
    const [usages, setUsages] = useState<CouponUsage[]>([]);
    const [usagesLoading, setUsagesLoading] = useState(false);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null);
    const [editCouponData, setEditCouponData] = useState({
        credits: 10,
        max_uses: 1,
        is_active: true
    });

    const [newCoupon, setNewCoupon] = useState({
        code: "",
        credits: 10,
        max_uses: 1
    });

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await api.get("/credits/admin/coupons");
            setCoupons(res.data);
        } catch (err) {
            toast.error("Erreur lors du chargement des coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreateCoupon = async () => {
        if (!newCoupon.code) return toast.error("Le code est obligatoire");
        try {
            await api.post("/credits/admin/coupons", newCoupon);
            toast.success("Coupon créé avec succès");
            setIsCreateOpen(false);
            setNewCoupon({ code: "", credits: 10, max_uses: 1 });
            fetchCoupons();
        } catch (err) {
            toast.error("Erreur lors de la création du coupon");
        }
    };

    const handleEditCoupon = (coupon: Coupon) => {
        setCouponToEdit(coupon);
        setEditCouponData({
            credits: coupon.credits,
            max_uses: coupon.max_uses,
            is_active: coupon.is_active
        });
        setIsEditOpen(true);
    };

    const handleUpdateCoupon = async () => {
        if (!couponToEdit) return;
        try {
            await api.put(`/credits/admin/coupons/${couponToEdit.id}`, editCouponData);
            toast.success("Coupon mis à jour");
            setIsEditOpen(false);
            fetchCoupons();
        } catch (err) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const handleDeleteCoupon = async (couponId: number) => {
        if (!confirm("Voulez-vous vraiment supprimer ce coupon ?")) return;
        try {
            await api.delete(`/credits/admin/coupons/${couponId}`);
            toast.success("Coupon supprimé");
            fetchCoupons();
        } catch (err) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleDeleteUsage = async (usageId: number) => {
        if (!confirm("Annuler cette utilisation et retirer les crédits de l'utilisateur ?")) return;
        try {
            await api.delete(`/credits/admin/usages/${usageId}`);
            toast.success("Utilisation annulée");
            if (selectedCoupon) {
                const res = await api.get(`/credits/admin/coupons/${selectedCoupon.id}/usages`);
                setUsages(res.data);
                fetchCoupons();
            }
        } catch (err) {
            toast.error("Erreur lors de l'annulation");
        }
    };

    const handleViewUsages = async (coupon: Coupon) => {
        setSelectedCoupon(coupon);
        setIsUsageOpen(true);
        setUsagesLoading(true);
        try {
            const res = await api.get(`/credits/admin/coupons/${coupon.id}/usages`);
            setUsages(res.data);
        } catch (err) {
            toast.error("Erreur lors du chargement des utilisations");
        } finally {
            setUsagesLoading(false);
        }
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestion des Coupons</h2>
                    <p className="text-muted-foreground">Créez et suivez l'utilisation des codes promotionnels.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={fetchCoupons} disabled={loading}>
                        <RefreshCcw className={loading ? "animate-spin" : ""} />
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)} className="gradient-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouveau Coupon
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher un code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Crédits</TableHead>
                                <TableHead>Utilisations</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Créé le</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredCoupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        Aucun coupon trouvé.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCoupons.map((coupon) => (
                                    <TableRow key={coupon.id}>
                                        <TableCell className="font-mono font-bold uppercase">{coupon.code}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                                +{coupon.credits}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{coupon.current_uses} / {coupon.max_uses}</span>
                                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${Math.min(100, (coupon.current_uses / coupon.max_uses) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {coupon.current_uses >= coupon.max_uses ? (
                                                <Badge variant="outline" className="text-muted-foreground border-muted">Épuisé</Badge>
                                            ) : coupon.is_active ? (
                                                <Badge className="bg-green-500">Actif</Badge>
                                            ) : (
                                                <Badge variant="destructive">Inactif</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(new Date(coupon.created_at), "PP", { locale: fr })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleViewUsages(coupon)} title="Voir utilisations">
                                                    <Users className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleEditCoupon(coupon)} title="Modifier">
                                                    <Pencil className="w-4 h-4 text-blue-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCoupon(coupon.id)} title="Supprimer">
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Coupon Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Créer un nouveau coupon</DialogTitle>
                        <DialogDescription>
                            Générez un code que les utilisateurs pourront échanger contre des crédits.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Code Promotionnel</Label>
                            <Input
                                id="code"
                                placeholder="EX: HELLO2024"
                                value={newCoupon.code}
                                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                className="uppercase font-mono"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="credits">Valeur (Crédits)</Label>
                                <Input
                                    id="credits"
                                    type="number"
                                    value={newCoupon.credits}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, credits: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max_uses">Utilisations Max</Label>
                                <Input
                                    id="max_uses"
                                    type="number"
                                    value={newCoupon.max_uses}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                        <Button onClick={handleCreateCoupon}>Créer le coupon</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Coupon Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le coupon : {couponToEdit?.code}</DialogTitle>
                        <DialogDescription>
                            Ajustez les valeurs ou désactivez-le.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit_credits">Valeur (Crédits)</Label>
                                <Input
                                    id="edit_credits"
                                    type="number"
                                    value={editCouponData.credits}
                                    onChange={(e) => setEditCouponData({ ...editCouponData, credits: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit_max_uses">Utilisations Max</Label>
                                <Input
                                    id="edit_max_uses"
                                    type="number"
                                    value={editCouponData.max_uses}
                                    onChange={(e) => setEditCouponData({ ...editCouponData, max_uses: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={editCouponData.is_active}
                                onChange={(e) => setEditCouponData({ ...editCouponData, is_active: e.target.checked })}
                                className="w-4 h-4 text-primary rounded border-muted-foreground/30 accent-primary"
                            />
                            <Label htmlFor="is_active">Coupon actif</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
                        <Button onClick={handleUpdateCoupon}>Enregistrer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Usages Dialog */}
            <Dialog open={isUsageOpen} onOpenChange={setIsUsageOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Utilisations du coupon : {selectedCoupon?.code}</DialogTitle>
                        <DialogDescription>
                            Liste des utilisateurs ayant activé ce code.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 max-h-[400px] overflow-y-auto">
                        {usagesLoading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : usages.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                                <p>Aucune utilisation enregistrée pour ce coupon.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Utilisateur</TableHead>
                                        <TableHead className="text-right">Date d'utilisation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usages.map((usage) => (
                                        <TableRow key={usage.id}>
                                            <TableCell className="font-medium">{usage.user_email}</TableCell>
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
                        <Button variant="outline" onClick={() => setIsUsageOpen(false)}>Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
