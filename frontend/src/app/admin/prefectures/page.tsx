"use client";

import { useEffect, useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    useEffect(() => {
        api.get<PrefectureAdmin[]>("/admin/prefectures").then((r) => { setPrefectures(r.data); setLoading(false); });
    }, []);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold">Préfectures</h1>
                <p className="text-muted-foreground mt-1">{prefectures.length} préfecture(s) configurée(s)</p>
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
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
