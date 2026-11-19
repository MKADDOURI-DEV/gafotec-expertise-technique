import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useContent } from "@/components/content/ContentProvider";
import "@/components/site/hero.css";

function Letters({ text }) {
  return (
    <span aria-label={text}>
      {text.split("").map((char, i) =>
        char === " " ? (
          <span key={i}> </span>
        ) : (
          <span key={i} className="gh-ltr" aria-hidden="true">
            {char}
          </span>
        ),
      )}
    </span>
  );
}

/**
 * Background video of the hero. It is only mounted in the browser, after hydration, and never when the visitor asked for
 * reduced motion / data saving or is on a very slow connection. The hero image stays underneath as poster and fallback:
 * the video fades in once it really plays, and is dropped for good if it fails to load. It pauses when scrolled out of view.
 */
function HeroVideo({ src, poster }) {
  const ref = useRef(null);
  const [allowed, setAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const connection = navigator.connection;
      const constrained = connection?.saveData === true || /(^|-)2g$/.test(connection?.effectiveType ?? "");
      setAllowed(!reduce.matches && !constrained);
    };
    update();
    reduce.addEventListener?.("change", update);
    return () => reduce.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || !allowed) return undefined;
    video.muted = true; // autoplay is only allowed for muted videos (React does not always write the attribute)
    const start = () => video.play().catch(() => setFailed(true));
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : video.pause()), { threshold: 0.1 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [allowed, src]);

  if (!src || !allowed || failed) return null;

  return (
    <video
      key={src}
      ref={ref}
      className={`gh-video${playing ? " gh-video--ready" : ""}`}
      src={src}
      poster={poster || undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      tabIndex={-1}
      aria-hidden="true"
      onPlaying={() => setPlaying(true)}
      onError={() => setFailed(true)}
    />
  );
}

export default function Hero() {
  const { t } = useContent();
  const videoUrl = t("home.hero.video_url");

  return (
    <section className="gh-section" aria-label="GAFOTEC — Expertise technique">
      <div className={`gh-media${videoUrl ? " gh-media--video" : ""}`} aria-hidden="true">
        <Image src={t("home.hero.image")} alt="" loading="eager" className="h-full w-full" />
        <HeroVideo src={videoUrl} poster={t("home.hero.image")} />
      </div>

      <div className="gh-content">
        <p className="gh-eyebrow gh-rise gh-d1">{t("home.hero.eyebrow")}</p>

        <h1 className="gh-title gh-rise gh-d2">
          <Letters text={t("home.hero.title")} />
        </h1>

        <p className="gh-body gh-rise gh-d3">{t("home.hero.subtitle")}</p>

        <div className="gh-actions gh-rise gh-d4">
          <Link to="/nos-expertises" className="gh-cta gh-cta--solid">
            Découvrir nos expertises
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
          <Link to="/contact" className="gh-cta gh-cta--ghost">
            Demander un devis
          </Link>
        </div>
      </div>
    </section>
  );
}