import { Image } from "@/components/ui/image";

export default function PageHero({ eyebrow, title, description, image, children }) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-deep">
      <div className="absolute inset-0" aria-hidden="true">
        <Image src={image} alt="" className="h-full w-full" />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(4,20,44,0.95)_0%,rgba(6,40,90,0.84)_48%,rgba(6,40,90,0.42)_100%)]" />
      </div>
      <div className="container-page relative flex min-h-[clamp(320px,44vh,440px)] flex-col justify-end pb-12 pt-28 lg:pb-16 lg:pt-32">
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/60">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-heading text-[clamp(1.9rem,4.4vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-[14.5px] leading-relaxed text-white/75">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
}