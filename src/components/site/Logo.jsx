import { Link } from "@tanstack/react-router";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

const LOGO_URL =
  "https://base44.app/api/apps/6aec634f0232d4cd71a02dc5/files/mp/public/6aec634f0232d4cd71a02dc5/d5f1a25a3_gafotec-logo.jpeg";

/** Official GAFOTEC logo. On dark backgrounds it sits on a white plate (the file has a white background). */
export default function Logo({ inverted = false, className = "" }) {
  return (
    <Link
      to="/"
      aria-label="GAFOTEC — retour à l’accueil"
      className={cn(
        "inline-flex items-center",
        inverted && "rounded-[3px] bg-white px-2 py-1",
        className,
      )}
    >
      <Image
        src={LOGO_URL}
        alt="GAFOTEC — Corps d’État Techniques"
        fittingType="fit"
        className="h-11 w-auto sm:h-12"
      />
    </Link>
  );
}