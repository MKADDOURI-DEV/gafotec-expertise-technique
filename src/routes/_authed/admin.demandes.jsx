import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Mail, Phone, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteContactRequest, listContactRequests, setContactRequestStatus } from "@/lib/content-fns";

export const Route = createFileRoute("/_authed/admin/demandes")({
  loader: () => listContactRequests(),
  component: RequestsAdmin,
});

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "";

function RequestsAdmin() {
  const items = Route.useLoaderData();
  const router = useRouter();
  const setStatus = useServerFn(setContactRequestStatus);
  const remove = useServerFn(deleteContactRequest);
  const [busyId, setBusyId] = useState(null);

  const run = async (item, task, success, failure) => {
    setBusyId(item.id);
    try {
      await task();
      await router.invalidate();
      toast.success(success);
    } catch (error) {
      toast.error(error?.message ?? failure);
    } finally {
      setBusyId(null);
    }
  };

  const open = items.filter((item) => item.status !== "traite").length;

  return (
    <div>
      <p className="eyebrow">Demandes de devis</p>
      <h1 className="mt-4 font-heading text-[clamp(1.5rem,2.8vw,2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
        Messages reçus par le formulaire de contact
      </h1>
      <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
        {items.length === 0
          ? "Aucune demande pour le moment."
          : `${items.length} demande${items.length > 1 ? "s" : ""}, dont ${open} en attente de traitement.`}
      </p>

      {items.length > 0 && (
        <ul className="mt-8 space-y-4">
          {items.map((item) => {
            const done = item.status === "traite";
            const busy = busyId === item.id;
            return (
              <li key={item.id} className="border border-border bg-background p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-[15px] font-semibold text-foreground">{item.full_name}</p>
                    <p className="mt-1 text-[12.5px] text-muted-foreground">
                      {[item.company, item.service].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] ${
                        done ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {done ? "Traitée" : "Nouvelle"}
                    </span>
                    <p className="mt-1 text-[11.5px] text-muted-foreground">{formatDate(item.created_date)}</p>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-line text-[13.5px] leading-relaxed text-foreground">{item.message}</p>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px]">
                  <a className="inline-flex items-center gap-1.5 text-primary hover:underline" href={`mailto:${item.email}`}>
                    <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {item.email}
                  </a>
                  <a className="inline-flex items-center gap-1.5 text-primary hover:underline" href={`tel:${item.phone}`}>
                    <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {item.phone}
                  </a>
                </div>

                <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      run(
                        item,
                        () => setStatus({ data: { id: item.id, status: done ? "nouveau" : "traite" } }),
                        done ? "Demande rouverte" : "Demande marquée comme traitée",
                        "Mise à jour impossible",
                      )
                    }
                  >
                    {busy ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : done ? (
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                    ) : (
                      <Check className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                    )}
                    {done ? "Rouvrir" : "Marquer comme traitée"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => run(item, () => remove({ data: { id: item.id } }), "Demande supprimée", "Suppression impossible")}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
