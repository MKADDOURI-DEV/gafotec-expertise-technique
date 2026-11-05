import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { submitQuoteRequest } from "@/lib/server-fns";
import { company, serviceOptions, whatsappLink } from "@/data/site";
import { cn } from "@/lib/utils";

const EMPTY = { full_name: "", company: "", email: "", phone: "", service: "", message: "" };

function validate(values) {
  const errors = {};
  if (values.full_name.trim().length < 2) errors.full_name = "Merci d’indiquer votre nom complet.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = "Adresse e-mail invalide.";
  if (values.phone.trim().length < 6) errors.phone = "Numéro de téléphone invalide.";
  if (!values.service) errors.service = "Sélectionnez le métier concerné.";
  if (values.message.trim().length < 15)
    errors.message = "Décrivez votre projet en quelques mots (15 caractères minimum).";
  return errors;
}

const fieldClass =
  "w-full border border-input bg-background px-3.5 py-3 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary";

export default function QuoteForm({ defaultService = "" }) {
  const [values, setValues] = useState({ ...EMPTY, service: defaultService });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  const update = (key) => (event) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("loading");
    setServerError("");
    try {
      await submitQuoteRequest({
        data: {
          full_name: values.full_name.trim(),
          company: values.company.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          service: values.service,
          message: values.message.trim(),
        },
      });
      setStatus("success");
      setValues({ ...EMPTY });
    } catch (error) {
      setStatus("error");
      setServerError(
        "Votre demande n’a pas pu être envoyée. Merci de réessayer ou de nous appeler directement.",
      );
    }
  };

  if (status === "success") {
    return (
      <div className="border border-primary/20 bg-accent/60 p-8 lg:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Demande reçue</p>
        <h3 className="mt-4 font-heading text-2xl font-bold tracking-tight text-foreground">
          Merci, votre demande a bien été enregistrée.
        </h3>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
          Nos équipes reviennent vers vous avec une réponse technique et un chiffrage. Pour une
          urgence, vous pouvez nous joindre directement au {company.phones[0]}.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="border border-border bg-background px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Envoyer une autre demande
          </button>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-brand-corporate"
          >
            Continuer sur WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom complet" required error={errors.full_name}>
          <input
            className={fieldClass}
            value={values.full_name}
            onChange={update("full_name")}
            placeholder="Votre nom et prénom"
            autoComplete="name"
          />
        </Field>
        <Field label="Société" error={errors.company}>
          <input
            className={fieldClass}
            value={values.company}
            onChange={update("company")}
            placeholder="Nom de votre société"
            autoComplete="organization"
          />
        </Field>
        <Field label="E-mail" required error={errors.email}>
          <input
            type="email"
            className={fieldClass}
            value={values.email}
            onChange={update("email")}
            placeholder="vous@entreprise.ma"
            autoComplete="email"
          />
        </Field>
        <Field label="Téléphone" required error={errors.phone}>
          <input
            type="tel"
            className={fieldClass}
            value={values.phone}
            onChange={update("phone")}
            placeholder="+212 6 00 00 00 00"
            autoComplete="tel"
          />
        </Field>
      </div>

      <Field label="Service concerné" required error={errors.service}>
        <select className={cn(fieldClass, "appearance-none")} value={values.service} onChange={update("service")}>
          <option value="">Sélectionnez un métier</option>
          {serviceOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Description du projet" required error={errors.message}>
        <textarea
          rows={5}
          className={cn(fieldClass, "resize-y")}
          value={values.message}
          onChange={update("message")}
          placeholder="Type de bâtiment, surface, nature des installations, localisation, échéance…"
        />
      </Field>

      {status === "error" && (
        <p className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          {serverError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 bg-primary px-7 py-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-brand-corporate disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
              Envoi en cours
            </>
          ) : (
            <>
              Envoyer la demande
              <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
            </>
          )}
        </button>
        <p className="text-[11.5px] text-muted-foreground">
          Vos informations servent uniquement à répondre à votre demande.
        </p>
      </div>
    </form>
  );
}

function Field({ label, required, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline gap-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
        {required && <span className="text-primary">*</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-[11.5px] text-destructive">{error}</span>}
    </label>
  );
}