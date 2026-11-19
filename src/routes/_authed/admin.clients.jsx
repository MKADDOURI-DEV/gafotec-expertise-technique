import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ArrowUpRight, Building2, Eye, EyeOff, ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ClientEditor from "@/components/admin/ClientEditor";
import ManagedFileCard from "@/components/admin/ManagedFileCard";
import { contentDefaults } from "@/content/registry";
import { initialsOf } from "@/lib/clients";
import { deleteClient, getSiteContent, listClients, saveClient, saveSiteContent } from "@/lib/content-fns";
import { removeStoredFile } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/clients")({
  loader: async () => {
    const [clients, content] = await Promise.all([listClients(), getSiteContent()]);
    return { clients, content };
  },
  component: ClientsAdmin,
});

const TEXT_KEYS = ["values.title", "values.intro", "values.button_label"];

function ClientsAdmin() {
  const { clients, content } = Route.useLoaderData();
  const router = useRouter();
  const refresh = () => router.invalidate();

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Page « Nos clients »</p>
          <h1 className="mt-4 font-heading text-[clamp(1.5rem,2.8vw,2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
            Gestion des clients
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            Ajoutez les entreprises et établissements avec lesquels GAFOTEC a travaillé, puis gérez la vidéo et le PDF de présentation affichés sur la même page.
          </p>
        </div>
        <Link
          to="/nos-clients"
          className="inline-flex min-h-11 items-center gap-1.5 self-start font-mono text-[10px] uppercase tracking-[0.16em] text-primary hover:text-brand-deep sm:min-h-0"
        >
          Voir la page publique
          <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
        </Link>
      </div>

      <ClientList clients={clients} onChanged={refresh} />
      <PresentationSection content={content} onChanged={refresh} />
    </div>
  );
}

function ClientList({ clients, onChanged }) {
  const items = clients.items;
  const save = useServerFn(saveClient);
  const remove = useServerFn(deleteClient);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (client) => {
    setEditing(client);
    setEditorOpen(true);
  };

  const togglePublished = async (client) => {
    setBusyId(client.id);
    try {
      await save({ data: { ...client, published: !client.published } });
      await onChanged();
      toast.success(client.published ? "Client masqué" : "Client publié");
    } catch (error) {
      toast.error(error?.message ?? "Modification impossible");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    const client = toDelete;
    if (!client) return;
    setBusyId(client.id);
    try {
      await remove({ data: { id: client.id } });
      if (client.logo_path) await removeStoredFile(client.logo_path).catch(() => toast.message("Le fichier du logo n’a pas pu être supprimé du stockage."));
      await onChanged();
      setToDelete(null);
      toast.success("Client supprimé");
    } catch (error) {
      toast.error(error?.message ?? "Suppression impossible");
    } finally {
      setBusyId(null);
    }
  };

  const published = items.filter((client) => client.published).length;

  return (
    <section className="mt-8" aria-labelledby="clients-list-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="clients-list-title" className="font-heading text-[15px] font-semibold text-foreground">
          Clients <span className="font-normal text-muted-foreground">· {items.length} au total, {published} publié{published > 1 ? "s" : ""}</span>
        </h2>
        <Button type="button" onClick={openNew} disabled={!clients.available} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
          Ajouter un client
        </Button>
      </div>

      {!clients.available ? (
        <div role="status" className="mt-4 flex gap-3 border border-amber-500/40 bg-amber-500/10 p-4 text-[12.5px] leading-relaxed text-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" strokeWidth={1.75} />
          <p>
            La table des clients n’existe pas encore dans Supabase : le fichier <code className="break-all">supabase/pending/20261117_site_clients.sql</code> doit
            d’abord être relu puis appliqué par vos soins. Jusque-là, la page publique affiche son état vide et l’ajout est désactivé.
          </p>
        </div>
      ) : null}

      {clients.available && items.length === 0 ? (
        <div className="mt-4 border border-dashed border-border bg-background p-8 text-center">
          <Building2 className="mx-auto h-5 w-5 text-primary" strokeWidth={1.6} />
          <p className="mt-3 text-[13.5px] text-muted-foreground">Aucun client pour le moment. Ajoutez le premier : la page publique affiche un message d’attente tant qu’aucun client n’est publié.</p>
        </div>
      ) : null}

      {items.length > 0 ? (
        <ul className="mt-4 divide-y divide-border border border-border bg-background">
          {items.map((client) => {
            const busy = busyId === client.id;
            return (
              <li key={client.id} className="grid min-w-0 gap-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                <div className="flex items-center gap-3 sm:contents">
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center border border-border bg-white p-2">
                    {client.logo_url ? (
                      <img src={client.logo_url} alt={`Logo ${client.name}`} loading="lazy" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="font-heading text-lg font-bold text-muted-foreground/50">{initialsOf(client.name)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-heading text-[14px] font-semibold text-foreground">{client.name}</p>
                    <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
                      {client.sector || "Secteur non renseigné"} · ordre {client.display_order}
                    </p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.14em]",
                          client.published ? "text-emerald-700" : "text-muted-foreground",
                        )}
                      >
                        {client.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {client.published ? "Publié" : "Masqué"}
                      </span>
                      {client.website ? (
                        <a href={client.website} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-1 text-[11.5px] text-primary hover:underline">
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{client.website.replace(/^https?:\/\//, "")}</span>
                        </a>
                      ) : null}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
                  <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => openEdit(client)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                    Modifier
                  </Button>
                  <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => togglePublished(client)}>
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : client.published ? <><EyeOff className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />Masquer</> : <><Eye className="mr-1.5 h-3.5 w-3.5" strokeWidth={1.75} />Publier</>}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => setToDelete(client)} aria-label={`Supprimer ${client.name}`}>
                    <Trash2 className="h-3.5 w-3.5 sm:mr-0" strokeWidth={1.75} />
                    <span className="ml-1.5 sm:sr-only">Supprimer</span>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <ClientEditor client={editing} open={editorOpen} onOpenChange={setEditorOpen} onSaved={onChanged} />

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(open) => (!open && busyId === null ? setToDelete(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {toDelete?.name} » sera retiré définitivement de la liste, ainsi que son logo. Pour le retirer du site sans le perdre, utilisez plutôt « Masquer ».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId !== null}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={busyId !== null}
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busyId !== null ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function PresentationSection({ content, onChanged }) {
  const save = useServerFn(saveSiteContent);
  const initial = () => Object.fromEntries(TEXT_KEYS.map((key) => [key, content[key] ?? contentDefaults[key]]));
  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = TEXT_KEYS.some((key) => draft[key] !== (content[key] ?? contentDefaults[key]));
  const update = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({ data: { updates: TEXT_KEYS.map((key) => ({ key, value: draft[key] ?? "" })) } });
      await onChanged();
      toast.success("Textes enregistrés");
    } catch (error) {
      toast.error(error?.message ?? "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-12" aria-labelledby="presentation-title">
      <h2 id="presentation-title" className="font-heading text-[15px] font-semibold text-foreground">Présentation de GAFOTEC : vidéo et PDF</h2>
      <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
        Cette section se trouvait sur la page « Notre équipe » : elle s’affiche maintenant sur la page « Nos clients ». Le lecteur vidéo et le bouton PDF n’apparaissent que si un fichier est importé.
      </p>

      <div className="mt-5 space-y-6">
        <div className="min-w-0 border border-border bg-background p-4 sm:p-5">
          <h3 className="font-heading text-[14px] font-semibold text-foreground">Textes</h3>
          <div className="mt-4 grid gap-4">
            <div>
              <Label htmlFor="values-title">Titre de la section</Label>
              <Input id="values-title" value={draft["values.title"]} onChange={update("values.title")} />
            </div>
            <div>
              <Label htmlFor="values-intro">Texte de présentation</Label>
              <Textarea id="values-intro" rows={3} value={draft["values.intro"]} onChange={update("values.intro")} />
            </div>
            <div>
              <Label htmlFor="values-button">Texte du bouton de téléchargement</Label>
              <Input id="values-button" value={draft["values.button_label"]} onChange={update("values.button_label")} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:flex">
            <Button type="button" disabled={!dirty || saving} onClick={handleSave}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Button>
            <Button type="button" variant="outline" disabled={!dirty || saving} onClick={() => setDraft(initial())}>
              Annuler
            </Button>
          </div>
        </div>

        <ManagedFileCard kind="video" content={content} onChanged={onChanged} />
        <ManagedFileCard kind="pdf" content={content} onChanged={onChanged} />
      </div>
    </section>
  );
}
