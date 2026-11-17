import { Download } from "lucide-react";
import Reveal from "@/components/site/Reveal";
import { useContent } from "@/components/content/ContentProvider";

/** Forces a download (instead of opening the PDF in the tab) through the storage `download` parameter. */
export const downloadHref = (url, name) => {
  if (!url) return "";
  const filename = (name || "presentation-gafotec.pdf").replace(/[^\w.\- ]+/g, "");
  return `${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(filename)}`;
};

/** « Our Values »: title + text always; the video player and the download button only exist once a file was imported. */
export default function OurValues() {
  const { t } = useContent();
  const videoUrl = t("values.video_url");
  const pdfUrl = t("values.pdf_url");
  const title = t("values.title");
  const intro = t("values.intro");

  return (
    <section className="section border-t border-border bg-surface" aria-labelledby="our-values-title">
      <div className="container-page">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">GAFOTEC</p>
          <h2
            id="our-values-title"
            className="mt-5 font-heading text-[clamp(1.8rem,3.4vw,2.8rem)] font-bold uppercase leading-[1.05] tracking-[-0.02em] text-foreground"
          >
            {title}
          </h2>
          {intro ? <p className="mt-5 text-[15px] leading-[1.8] text-muted-foreground">{intro}</p> : null}
        </Reveal>

        {videoUrl ? (
          <Reveal className="mx-auto mt-10 max-w-4xl">
            <div className="overflow-hidden border border-border bg-black shadow-[0_24px_60px_-30px_rgba(6,70,165,0.45)]">
              <video
                key={videoUrl}
                className="aspect-video h-auto w-full bg-black"
                controls
                playsInline
                preload="metadata"
                aria-label={`${title} — vidéo de présentation GAFOTEC`}
              >
                <source src={videoUrl} type="video/mp4" />
                Votre navigateur ne peut pas lire cette vidéo.
              </video>
            </div>
          </Reveal>
        ) : null}

        {pdfUrl ? (
          <Reveal className="mt-8 flex justify-center">
            <a
              href={downloadHref(pdfUrl, t("values.pdf_name"))}
              download={t("values.pdf_name") || "presentation-gafotec.pdf"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-primary px-6 py-3.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-brand-deep"
            >
              <Download className="h-4 w-4" strokeWidth={1.75} />
              {t("values.button_label")}
            </a>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
