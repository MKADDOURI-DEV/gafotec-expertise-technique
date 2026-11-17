import { createContext, useContext, useMemo } from "react";
import { services } from "@/data/site";
import { normalizeExpertises } from "@/lib/expertises";

const staticItems = normalizeExpertises(services);
const ExpertisesContext = createContext(null);

export function ExpertisesProvider({ items, children }) {
  const value = useMemo(() => (Array.isArray(items) ? items : staticItems), [items]);
  return <ExpertisesContext.Provider value={value}>{children}</ExpertisesContext.Provider>;
}

/** The expertises as currently published (admin-managed list, or the built-in list until the table exists). */
export function useExpertises() {
  return useContext(ExpertisesContext) ?? staticItems;
}

/** Labels for the quote form's "Service concerné" select. */
export function useServiceOptions() {
  const items = useExpertises();
  return useMemo(() => items.map((item) => item.title).concat(["Autre / Plusieurs métiers"]), [items]);
}
