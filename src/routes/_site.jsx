import { createFileRoute } from "@tanstack/react-router";
import SiteLayout from "@/components/site/SiteLayout";
import { ContentProvider } from "@/components/content/ContentProvider";
import { getSiteContent } from "@/lib/content-fns";

export const Route = createFileRoute("/_site")({
  loader: () => getSiteContent(),
  component: SiteRoute,
});

function SiteRoute() {
  const content = Route.useLoaderData();
  return (
    <ContentProvider values={content}>
      <SiteLayout />
    </ContentProvider>
  );
}