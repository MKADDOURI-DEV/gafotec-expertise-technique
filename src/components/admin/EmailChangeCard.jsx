import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function EmailChangeCard({ currentEmail, role }) {
  const [newEmail, setNewEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const email = newEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setError("Adresse e-mail invalide.");
      return;
    }
    if (email === currentEmail?.toLowerCase()) {
      setError("C’est déjà l’adresse de ce compte.");
      return;
    }

    setSending(true);
    try {
      await base44.users.inviteUser(email, role === "admin" ? "admin" : "user");
      setSentTo(email);
      setNewEmail("");
      toast.success("Invitation envoyée");
    } catch {
      setError("Envoi impossible. Vérifiez l’adresse ou réessayez plus tard.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-background p-5 lg:p-7">
      <h2 className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
        Changer d’adresse e-mail
      </h2>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
        L’adresse de connexion ne peut pas être modifiée sur un compte existant. Saisissez la
        nouvelle adresse : une invitation lui sera envoyée avec les mêmes droits, puis vous vous
        connecterez avec elle.
      </p>

      <div className="mt-6">
        <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
          Nouvelle adresse e-mail
        </Label>
        <Input
          type="email"
          autoComplete="email"
          value={newEmail}
          onChange={(event) => setNewEmail(event.target.value)}
          placeholder="nouvelle.adresse@exemple.com"
          required
          className="mt-2 text-[13.5px]"
        />
      </div>

      {error && <p className="mt-4 text-[12.5px] text-destructive">{error}</p>}

      {sentTo && (
        <div className="mt-4 flex items-start gap-2 border-l-2 border-primary bg-surface p-3">
          <MailCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.75} />
          <p className="text-[12.5px] leading-relaxed text-foreground">
            Invitation envoyée à <strong className="font-semibold">{sentTo}</strong>. Connectez-vous
            avec cette adresse en suivant le lien reçu, puis retirez l’ancien compte depuis la page
            « App Users » de la plateforme.
          </p>
        </div>
      )}

      <div className="mt-6">
        <Button type="submit" size="sm" disabled={sending}>
          {sending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          Envoyer l’invitation
        </Button>
      </div>
    </form>
  );
}