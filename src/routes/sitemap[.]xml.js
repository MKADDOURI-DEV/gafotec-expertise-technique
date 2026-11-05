import { createFileRoute } from "@tanstack/react-router";

const BASE = "https://www.gafotec.com";

const PAGES = [
  { path: "/", priority: "1.0", changefreq: "monthly" },
  { path: "/a-propos", priority: "0.8", changefreq: "yearly" },
  { path: "/nos-expertises", priority: "0.9", changefreq: "monthly" },
  { path: "/nos-realisations", priority: "0.9", changefreq: "monthly" },
  { path: "/energies-photovoltaiques", priority: "0.8", changefreq: "monthly" },
  { path: "/notre-equipe", priority: "0.6", changefreq: "yearly" },
  { path: "/contact", priority: "0.8", changefreq: "yearly" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ context }) => {
        const today = new Date().toISOString().slice(0, 10);
        const projects = await context.getBase44().asServiceRole.entities.SiteProject.filter({});
        const urls = [
          ...PAGES.map(
            (page) =>
              `  <url><loc>${BASE}${page.path}</loc><lastmod>${today}</lastmod><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`,
          ),
          ...projects
            .filter((project) => project.slug)
            .map(
              (project) =>
                `  <url><loc>${BASE}/nos-realisations/${project.slug}</loc><lastmod>${today}</lastmod><changefreq>yearly</changefreq><priority>0.6</priority></url>`,
            ),
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});