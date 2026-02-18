import Image from "next/image";

interface CaseStudyHeroImageProps {
  src?: string;
  alt?: string;
  description?: string;
}

export default function CaseStudyHeroImage({ src, alt, description }: CaseStudyHeroImageProps) {
  return (
    <div
      className="w-full mt-10 rounded-[10px] overflow-hidden bg-[var(--color-surface-raised)] border border-[var(--color-border)]"
      style={{ aspectRatio: "16 / 9" }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || ""}
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          priority
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center px-6">
          <p className="text-[13px] text-[var(--color-fg-tertiary)] text-center leading-relaxed">
            {description || "Hero image"}
          </p>
        </div>
      )}
    </div>
  );
}
