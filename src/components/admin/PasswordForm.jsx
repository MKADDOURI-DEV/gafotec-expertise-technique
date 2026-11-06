import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const empty = { currentPassword: "", newPassword: "", confirm: "" };

export default function PasswordForm({ userId }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (form.newPassword !== form.confirm) {
      setError("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }

    setSaving(true);
    try {
      await base44.auth.changePassword({
        userId,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(empty);
      toast.success("Mot de passe mis à jour");
    } catch {
      setError("Mot de passe actuel incorrect ou mise à jour impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-background p-5 lg:p-7">
      <h2 className="font-heading text-[15px] font-semibold tracking-tight text-foreground">
        Changer le mot de passe
      </h2>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
        Saisissez votre mot de passe actuel, puis le nouveau à deux reprises.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Mot de passe actuel
          </Label>
          <Input
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(event) => update("currentPassword", event.target.value)}
            required
            className="mt-2 text-[13.5px]"
          />
        </div>
        <div>
          <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Nouveau mot de passe
          </Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(event) => update("newPassword", event.target.value)}
            required
            className="mt-2 text-[13.5px]"
          />
        </div>
        <div>
          <Label className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Confirmation
          </Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(event) => update("confirm", event.target.value)}
            required
            className="mt-2 text-[13.5px]"
          />
        </div>
      </div>

      {error && <p className="mt-4 text-[12.5px] text-destructive">{error}</p>}

      <div className="mt-6">
        <Button type="submit" size="sm" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          Mettre à jour
        </Button>
      </div>
    </form>
  );
}