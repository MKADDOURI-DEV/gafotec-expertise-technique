import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/AuthContext";
import { images } from "@/data/site";
import appCss from "@/index.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GAFOTEC — Corps d’État Techniques | CVC, Plomberie, Incendie & Photovoltaïque" },
      {
        name: "description",
        content:
          "GAFOTEC, entreprise marocaine de corps d’état techniques à Fès : climatisation et ventilation CVC, plomberie, chauffage central, protection incendie, désenfumage, piscines et énergie solaire photovoltaïque.",
      },
      { name: "theme-color", content: "#0646A5" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "GAFOTEC" },
      { property: "og:locale", content: "fr_MA" },
      {
        property: "og:title",
        content: "GAFOTEC — L’expertise technique au service de vos projets",
      },
      {
        property: "og:description",
        content:
          "Des solutions techniques performantes et durables : CVC, plomberie sanitaire, chauffage central, protection incendie, désenfumage, piscines et énergie solaire photovoltaïque.",
      },
      { property: "og:image", content: images.hero },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GAFOTEC — Corps d’État Techniques" },
      {
        name: "twitter:description",
        content:
          "Études, conception, exécution et maintenance des installations techniques du bâtiment au Maroc.",
      },
      { name: "twitter:image", content: images.hero },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}

// The document. There is no index.html: the server renders <html> from here.
function RootDocument({ children }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}