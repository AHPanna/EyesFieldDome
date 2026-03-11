"use client";

import { useState, useEffect } from "react";
import { Coins, Check, CreditCard, Loader2, Sparkles, History, Ticket } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreditPack {
    id: string;
    name: string;
    credits: number;
    price_cents: number;
}

export default function CreditsPage() {
    const { user, setAuth, token } = useAuthStore();
    const [packs, setPacks] = useState<CreditPack[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [couponCode, setCouponCode] = useState("");
    const [redeeming, setRedeeming] = useState(false);

    const fetchHistory = async () => {
        try {
            const res = await api.get("/credits/history");
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    useEffect(() => {
        const fetchPacks = async () => {
            try {
                const res = await api.get("/credits/packs");
                setPacks(res.data);
                await fetchHistory();
            } catch (err) {
                console.error("Failed to fetch packs", err);
                toast.error("Impossible de charger les packs de crédits");
            } finally {
                setLoading(false);
            }
        };
        fetchPacks();
    }, []);

    const handlePurchase = async (packId: string) => {
        setPurchasing(packId);
        try {
            await api.post(`/credits/purchase/${packId}`);
            toast.success("Achat réussi ! Vos crédits ont été ajoutés.");

            if (user && token) {
                const userRes = await api.get("/users/me");
                setAuth(userRes.data, token);
            }
            await fetchHistory();
        } catch (err) {
            console.error("Purchase failed", err);
            toast.error("L'achat a échoué. Veuillez réessayer.");
        } finally {
            setPurchasing(null);
        }
    };

    const handleRedeem = async () => {
        if (!couponCode) return;
        setRedeeming(true);
        try {
            await api.post("/credits/redeem", { code: couponCode });
            toast.success("Coupon activé ! Vos crédits ont été ajoutés.");
            setCouponCode("");
            await fetchHistory();
            if (user && token) {
                const userRes = await api.get("/users/me");
                setAuth(userRes.data, token);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Erreur d'activation");
        } finally {
            setRedeeming(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Crédits</h1>
                <p className="text-muted-foreground mt-2">
                    Achetez des crédits pour activer de nouvelles alertes et surveiller les préfectures.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packs.map((pack) => (
                    <Card key={pack.id} className={cn(
                        "relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 border-border/50",
                        pack.credits === 25 && "border-primary/50 bg-primary/5 scale-105 z-10 shadow-xl shadow-primary/5"
                    )}>
                        {pack.credits === 25 && (
                            <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-[10px] font-bold text-primary-foreground rounded-bl-lg uppercase tracking-wider">
                                Populaire
                            </div>
                        )}
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Coins className="w-5 h-5 text-primary" />
                                {pack.name}
                            </CardTitle>
                            <CardDescription>Pack de démarrage idéal</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">{(pack.price_cents / 100).toFixed(2)}€</span>
                                <span className="text-muted-foreground text-sm">TTC</span>
                            </div>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="w-4 h-4 text-green-500" />
                                    {pack.credits} alertes activables
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="w-4 h-4 text-green-500" />
                                    Support prioritaire
                                </li>
                                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Check className="w-4 h-4 text-green-500" />
                                    Sans abonnement
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full h-11 rounded-xl"
                                variant={pack.id.includes("25") ? "default" : "outline"}
                                disabled={purchasing !== null}
                                onClick={() => handlePurchase(pack.id)}
                            >
                                {purchasing === pack.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {purchasing === pack.id ? "Paiement..." : "Acheter maintenant"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coupon Code */}
                <Card className="lg:col-span-1 shadow-sm border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Ticket className="w-5 h-5 text-primary" />
                            Activer un coupon
                        </CardTitle>
                        <CardDescription>
                            Saisissez votre code pour ajouter des crédits gratuitement.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Ex: PROMO-2024"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                className="uppercase font-mono"
                            />
                            <Button
                                onClick={handleRedeem}
                                disabled={redeeming || !couponCode}
                                variant="secondary"
                            >
                                {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activer"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* History */}
                <Card className="lg:col-span-2 shadow-sm border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <History className="w-5 h-5 text-primary" />
                                Historique des opérations
                            </CardTitle>
                            <CardDescription>
                                Suivi de vos recharges et consommations.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="font-mono">
                            {user?.credits || 0} crédits restants
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        {history.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                                <p className="text-sm">Aucune opération enregistrée pour le moment.</p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="w-[180px]">Date</TableHead>
                                            <TableHead>Opération</TableHead>
                                            <TableHead className="text-right">Montant</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {history.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-xs text-muted-foreground font-medium">
                                                    {format(new Date(log.created_at), "PPp", { locale: fr })}
                                                </TableCell>
                                                <TableCell className="text-sm">{log.operation}</TableCell>
                                                <TableCell className={cn(
                                                    "text-right font-bold",
                                                    log.amount > 0 ? "text-green-600" : "text-red-500"
                                                )}>
                                                    {log.amount > 0 ? "+" : ""}{log.amount}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col md:flex-row items-center gap-6 p-8">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary text-white shadow-lg">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg font-bold">Besoin de plus de 100 crédits ?</h3>
                        <p className="text-sm text-muted-foreground">
                            Contactez-nous pour des solutions sur mesure ou des forfaits pour professionnels.
                        </p>
                    </div>
                    <Button variant="outline" className="rounded-xl">Contacter le support</Button>
                </CardContent>
            </Card>
        </div>
    );
}
