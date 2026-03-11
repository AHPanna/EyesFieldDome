import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Bell, Shield, Zap, Clock, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-primary glow-sm">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-foreground">RDV Préfecture</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost">Connexion</Button></Link>
            <Link href="/register"><Button className="gradient-primary glow-sm">Créer un compte</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8 border border-primary/20">
          <Zap className="w-4 h-4 text-primary" />
          Alertes en temps réel • Anti-ban automatique
        </div>
        <h1 className="text-5xl font-extrabold text-foreground leading-tight mb-6 max-w-3xl">
          Obtenez votre RDV en<br />
          <span className="text-transparent bg-clip-text gradient-primary">préfecture</span> sans stress
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mb-10">
          Notre plateforme surveille automatiquement les disponibilités et vous alerte dès qu&apos;un créneau se libère. Plus besoin de rafraîchir la page.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/register">
            <Button size="lg" className="gradient-primary glow animate-pulse-glow">
              Commencer gratuitement <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login"><Button size="lg" variant="outline">Se connecter</Button></Link>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-3 gap-8 mt-20 w-full max-w-2xl">
          {[
            { value: "< 5 min", label: "Délai de détection" },
            { value: "100%", label: "Automatique" },
            { value: "Anti-ban", label: "Rotation de proxies" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-primary">{value}</span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card/30 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça fonctionne</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Bell,
                title: "Configurez votre alerte",
                desc: "Choisissez votre préfecture, la démarche (titre de séjour, passeport…) et vos dates préférées.",
              },
              {
                icon: Clock,
                title: "On surveille pour vous",
                desc: "Notre système vérifie automatiquement les disponibilités toutes les 5 minutes, 24h/24.",
              },
              {
                icon: Zap,
                title: "Soyez alerté immédiatement",
                desc: "Dès qu'un créneau se libère, vous recevez une notification par email ou SMS pour le réserver.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="gradient-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all duration-300 hover:glow-sm">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Données sécurisées • Usage personnel uniquement
        </div>
        <p className="mt-2">© 2026 RDV Préfecture. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
