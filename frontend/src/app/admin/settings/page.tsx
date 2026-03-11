"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";
import { toast } from "sonner";
import { Settings, Shield, Activity, List, Trash2, Play, Square, RefreshCcw } from "lucide-react";

interface SystemSettings {
    scraper_enabled: boolean;
    scraping_interval_minutes: number;
    proxy_list: string[];
    updated_at: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [newProxy, setNewProxy] = useState("");
    const [logs, setLogs] = useState("");
    const [activeLogService, setActiveLogService] = useState("scraper");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get("/admin/settings");
            setSettings(response.data);
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (updates: Partial<SystemSettings>) => {
        try {
            const response = await api.patch("/admin/settings", updates);
            setSettings(response.data);
            toast.success("Paramètres mis à jour");
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const fetchLogs = async (service: string) => {
        try {
            const response = await api.get(`/admin/settings/logs/${service}`);
            setLogs(response.data.logs);
        } catch (error) {
            setLogs("Impossible de charger les logs.");
        }
    };

    const addProxy = () => {
        if (!newProxy) return;
        const newList = [...(settings?.proxy_list || []), newProxy];
        updateSettings({ proxy_list: newList });
        setNewProxy("");
    };

    const removeProxy = (index: number) => {
        const newList = settings?.proxy_list.filter((_, i) => i !== index);
        updateSettings({ proxy_list: newList });
    };

    if (!settings) return <div className="p-8">Chargement...</div>;

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Paramètres Système</h2>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">Général & Scraper</TabsTrigger>
                    <TabsTrigger value="proxies">Proxies & Stealth</TabsTrigger>
                    <TabsTrigger value="logs">Logs & Debug</TabsTrigger>
                    <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contrôle du Scraper</CardTitle>
                            <CardDescription>Activer ou désactiver le moteur de recherche globalement.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex flex-col space-y-1">
                                    <Label htmlFor="scraper-toggle">État du Scraper</Label>
                                    <span className="text-sm text-muted-foreground">
                                        {settings.scraper_enabled ? "Le service tourne en arrière-plan." : "Le service est actuellement arrêté."}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="scraper-toggle"
                                        checked={settings.scraper_enabled}
                                        onCheckedChange={(val: boolean) => updateSettings({ scraper_enabled: val })}
                                    />
                                    {settings.scraper_enabled ? (
                                        <Badge variant="default" className="bg-green-500"><Play className="w-3 h-3 mr-1" /> Actif</Badge>
                                    ) : (
                                        <Badge variant="destructive"><Square className="w-3 h-3 mr-1" /> Arrêté</Badge>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="interval">Intervalle de Scraping (minutes)</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="interval"
                                        type="number"
                                        value={settings.scraping_interval_minutes}
                                        onChange={(e) => setSettings({ ...settings, scraping_interval_minutes: parseInt(e.target.value) })}
                                        className="max-w-[100px]"
                                    />
                                    <Button onClick={() => updateSettings({ scraping_interval_minutes: settings.scraping_interval_minutes })}>
                                        Enregistrer
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground italic">Recommandé : 10 à 15 minutes pour éviter d'être banni.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="proxies" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Liste des Proxies</CardTitle>
                            <CardDescription>Configurez vos proxies résidentiels pour contourner les blocages.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="http://user:pass@host:port"
                                    value={newProxy}
                                    onChange={(e) => setNewProxy(e.target.value)}
                                />
                                <Button onClick={addProxy}>Ajouter</Button>
                            </div>

                            <div className="border rounded-md overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Proxy URL</th>
                                            <th className="px-4 py-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {settings.proxy_list.length === 0 ? (
                                            <tr>
                                                <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                                                    Aucun proxy configuré. Le scraper utilisera l'IP directe (Risqué).
                                                </td>
                                            </tr>
                                        ) : (
                                            settings.proxy_list.map((proxy, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="px-4 py-2 font-mono text-xs">{proxy}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => removeProxy(index)}>
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logs" className="space-y-4">
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle>Console de Logs</CardTitle>
                                <CardDescription>Visualisez les sorties en temps réel des services.</CardDescription>
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant={activeLogService === "scraper" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => { setActiveLogService("scraper"); fetchLogs("scraper"); }}
                                >
                                    Scraper
                                </Button>
                                <Button
                                    variant={activeLogService === "backend" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => { setActiveLogService("backend"); fetchLogs("backend"); }}
                                >
                                    Backend
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => fetchLogs(activeLogService)}>
                                    <RefreshCcw className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-0 m-4 border rounded-lg bg-black text-green-400 font-mono text-xs">
                            <ScrollArea className="h-full w-full p-4">
                                <pre className="whitespace-pre-wrap">{logs || "Cliquez sur Rafraîchir pour charger les logs..."}</pre>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="monitoring" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Accès Prometheus</CardTitle>
                            <CardDescription>Outils d'observation avancés.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg flex items-start space-x-4">
                                <Activity className="w-6 h-6 text-blue-500 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-blue-900">Prometheus Dashboard</h4>
                                    <p className="text-sm text-blue-700 mb-4">
                                        Visualisez les métriques de performance, les taux d'erreur et la consommation de ressources.
                                    </p>
                                    <Button variant="default">
                                        <a href="http://localhost:9090" target="_blank" rel="noreferrer">
                                            Ouvrir Prometheus
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
