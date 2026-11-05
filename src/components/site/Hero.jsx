import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { images } from "@/data/site";
import "@/components/site/hero.css";

const HEADLINE = "L’EXPERTISE TECHNIQUE AU SERVICE DE VOS PROJETS.";

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

export default function Hero() {
  return (
    <section className="gh-section" aria-label="GAFOTEC — Expertise technique">
      <div className="gh-media" aria-hidden="true">
        <Image src={images.hero} alt="" loading="eager" className="h-full w-full" />
      </div>

      <div className="gh-content">
        <p className="gh-eyebrow gh-rise gh-d1">Gafotec · Corps d’État Techniques · Fès</p>

        <h1 className="gh-title gh-rise gh-d2">
          <Letters text={HEADLINE} />
        </h1>

        <p className="gh-body gh-rise gh-d3">
          Des solutions techniques performantes et durables dans les domaines du CVC, de la
          plomberie, de la protection incendie et des énergies renouvelables.
        </p>

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