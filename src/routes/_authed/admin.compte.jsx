import { createFileRoute } from "@tanstack/react-router";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import PasswordForm from "@/components/admin/PasswordForm";
import EmailChangeCard from "@/components/admin/EmailChangeCard";
import { useAuth } from "@/lib/AuthContext";

export const Route = createFileRoute("/_authed/admin/compte")({
  component: AccountAdmin,
});

function AccountAdmin() {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth || !user) {
    return <p className="text-[13px] text-muted-foreground">Chargement du compte…</p>;
  }

  const details = [
    { label: "Nom", value: user.full_name || "—", icon: ShieldCheck },
    { label: "Adresse e-mail", value: user.email, icon: Mail },
    { label: "Rôle", value: user.role === "admin" ? "Administrateur" : "Utilisateur", icon: ShieldCheck },
    {
      label: "Compte créé le",
      value: user.created_date
        ? new Date(user.created_date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })
        : "—",
      icon: ShieldCheck,
    },
  ];

  return (
    <div>
      <p className="eyebrow">Compte</p>
      <h1 className="mt-4 font-heading text-[clamp(1.5rem,2.8vw,2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
        Mon compte
      </h1>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        Informations de connexion du compte administrateur, mot de passe et adresse e-mail.
      </p>

      <dl className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2">
        {details.map((detail) => {
          const Icon = detail.icon;
          return (
            <div key={detail.label} className="bg-background p-5">
              <dt className="flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                {detail.label}
              </dt>
              <dd className="mt-3 break-words text-[14px] font-medium text-foreground">
                {detail.value}
              </dd>
            </div>
          );
        })}
      </dl>

      <p className="mt-4 flex items-start gap-2 border-l-2 border-border pl-3 text-[12px] leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        <span>
          Le mot de passe est chiffré par la plateforme : il ne peut être ni affiché ni consulté, y
          compris par l’administrateur. Il peut en revanche être remplacé à tout moment ci-dessous.
        </span>
      </p>

      <div className="mt-8 grid gap-5">
        <PasswordForm userId={user.id} />
        <EmailChangeCard currentEmail={user.email} role={user.role} />
      </div>
    </div>
  );
}