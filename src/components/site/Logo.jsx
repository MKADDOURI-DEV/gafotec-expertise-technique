import { Link } from "@tanstack/react-router";
import { useContent } from "@/components/content/ContentProvider";
import { logoStyle } from "@/lib/logo-utils";
import { cn } from "@/lib/utils";

// Logo shipped with the site, used until a logo is saved in the admin (« Gestion du logo »).
export const DEFAULT_LOGO_URL =
  "https://gblmsjddkfgetdyhheao.supabase.co/storage/v1/object/public/media/legacy/7e4e1c28f918-d5f1a25a3_gafotec-logo.jpeg";

/**
 * Official GAFOTEC logo, managed centrally (`logo.url`, `logo.width`, `logo.height` in the site content):
 * every page that renders <Logo /> follows the admin settings. The size only changes the display, never the file.
 * On dark backgrounds (`inverted`) the logo keeps its white plate so the blue lettering stays readable.
 */
export default function Logo({ inverted = false, className = "" }) {
  const { t } = useContent();
  const src = t("logo.url") || DEFAULT_LOGO_URL;
  const style = logoStyle({ width: t("logo.width"), height: t("logo.height") });

  return (
    <Link
      to="/"
      aria-label="GAFOTEC — retour à l’accueil"
      className={cn("inline-flex items-center", inverted && "rounded-[3px] bg-white px-2 py-1", className)}
    >
      <img
        src={src}
        alt="GAFOTEC — Corps d’État Techniques"
        decoding="async"
        className={cn("block", !style && "h-11 w-auto sm:h-12")}
        style={style ?? undefined}
      />
    </Link>
  );
}
