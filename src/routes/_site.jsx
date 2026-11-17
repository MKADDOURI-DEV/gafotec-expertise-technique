import { createFileRoute } from "@tanstack/react-router";
import SiteLayout from "@/components/site/SiteLayout";
import { ContentProvider } from "@/components/content/ContentProvider";
import { ExpertisesProvider } from "@/components/content/ExpertisesProvider";
import { getExpertises, getSiteContent } from "@/lib/content-fns";

export const Route = createFileRoute("/_site")({
  loader: async () => {
    const [content, expertises] = await Promise.all([getSiteContent(), getExpertises()]);
    return { content, expertises: expertises.items };
  },
  component: SiteRoute,
});

function SiteRoute() {
  const { content, expertises } = Route.useLoaderData();
  return (
    <ContentProvider values={content}>
      <ExpertisesProvider items={expertises}>
        <SiteLayout />
      </ExpertisesProvider>
    </ContentProvider>
  );
}