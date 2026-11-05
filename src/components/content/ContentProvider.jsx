import { createContext, useContext, useMemo } from "react";
import { contentDefaults } from "@/content/registry";

const ContentContext = createContext(null);

export function ContentProvider({ values = {}, children }) {
  const merged = useMemo(() => ({ ...contentDefaults, ...values }), [values]);
  return <ContentContext.Provider value={merged}>{children}</ContentContext.Provider>;
}

/** `useContent().t(key)` → the value saved in the admin panel, or the shipped default. */
export function useContent() {
  const values = useContext(ContentContext) ?? contentDefaults;
  return {
    values,
    t: (key) => values[key] ?? contentDefaults[key] ?? "",
  };
}

/** The contact details as they are currently published. */
export function useCompany() {
  const { t } = useContent();
  const phones = [t("company.phone1"), t("company.phone2")].filter(Boolean);
  return {
    phones,
    phoneHrefs: phones.map((phone) => phone.replace(/[^\d+]/g, "")),
    email: t("company.email"),
    website: t("company.website"),
    address: t("company.address"),
    hours: t("company.hours"),
    hoursNote: t("company.hours_note"),
  };
}