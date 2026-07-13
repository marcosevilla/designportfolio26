import Image from "next/image";

interface CaseStudyHeroImageProps {
  src?: string;
  alt?: string;
  description?: string;
}

export default function CaseStudyHeroImage({ src, alt }: CaseStudyHeroImageProps) {
  // No src → render nothing. The old grey placeholder box was removed in
  // the 2026-07 cleanup; call sites keep their `description` prop so the
  // frame comes back automatically once a real asset lands.
  if (!src) return null;
  return (
    <div
      className="w-full mt-10 rounded-[10px] overflow-hidden bg-surface-raised border border-border"
      style={{ aspectRatio: "16 / 9" }}
    >
      <Image
        src={src}
        alt={alt || ""}
        width={1920}
        height={1080}
        className="w-full h-full object-cover"
        priority
      />
    </div>
  );
}
