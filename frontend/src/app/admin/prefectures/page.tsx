"use client";

import { useEffect, useState } from "react";
import { MapPin, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";

interface PrefectureAdmin {
    id: number;
    name: string;
    department: string;
    city: string;
    url: string;
    scraper_type: string;
    is_active: boolean;
}

export default function AdminPrefecturesPage() {
    const [prefectures, setPrefectures] = useState<PrefectureAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newPref, setNewPref] = useState({ name: "", department: "", city: "", url: "", scraper_type: "rdv_nationale" });

    const fetchPrefectures = () => {
        setLoading(true);
        api.get<PrefectureAdmin[]>("/admin/prefectures").then((r) => { setPrefectures(r.data); setLoading(false); });
    };

    useEffect(() => {
        fetchPrefectures();
    }, []);

    const handleAddPrefecture = async () => {
        if (!newPref.name || !newPref.department || !newPref.city || !newPref.url) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }
        try {
            await api.post("/admin/prefectures", newPref);
            toast.success("Préfecture ajoutée");
            setIsAddOpen(false);
            setNewPref({ name: "", department: "", city: "", url: "", scraper_type: "rdv_nationale" });
            fetchPrefectures();
        } catch (err) {
            toast.error("Erreur lors de l'ajout");
        }
    };

    const handleDeletePrefecture = async (id: number) => {
        if (!confirm("Voulez-vous vraiment supprimer cette préfecture ?")) return;
        try {
            await api.delete(`/admin/prefectures/${id}`);
            toast.success("Préfecture supprimée");
            fetchPrefectures();
        } catch (err) {
            toast.error("Erreur, impossible de supprimer");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Préfectures</h1>
                    <p className="text-muted-foreground mt-1">{prefectures.length} préfecture(s) configurée(s)</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                </Button>
            </div>

            <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <CardTitle>Liste des préfectures</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-muted-foreground text-sm">Chargement…</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border">
                                    <TableHead>Dept.</TableHead>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Ville</TableHead>
                                    <TableHead>Type scraper</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>URL</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prefectures.map((p) => (
                                    <TableRow key={p.id} className="border-border hover:bg-muted/20">
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono">{p.department}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{p.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{p.city}</TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-muted px-2 py-0.5 rounded">{p.scraper_type}</code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={p.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-muted"}>
                                                {p.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <a href={p.url} target="_blank" rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center gap-1 text-xs">
                                                <ExternalLink className="w-3 h-3" />Voir le site
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeletePrefecture(p.id)} title="Supprimer">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter une préfecture</DialogTitle>
                        <DialogDescription>
                            Configurez une nouvelle URL de préfecture à surveiller.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nom</Label>
                                <Input placeholder="ex: Préfecture de Police" value={newPref.name} onChange={(e) => setNewPref({ ...newPref, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Département</Label>
                                <Input placeholder="ex: 75" value={newPref.department} onChange={(e) => setNewPref({ ...newPref, department: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ville</Label>
                                <Input placeholder="ex: Paris" value={newPref.city} onChange={(e) => setNewPref({ ...newPref, city: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Type Scraper</Label>
                                <Input placeholder="rdv_nationale" value={newPref.scraper_type} onChange={(e) => setNewPref({ ...newPref, scraper_type: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>URL de prise de rendez-vous</Label>
                            <Input placeholder="https://..." value={newPref.url} onChange={(e) => setNewPref({ ...newPref, url: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
                        <Button onClick={handleAddPrefecture}>Ajouter</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

    );
}
