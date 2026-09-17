import Reveal from "./Reveal";

export default function SectionHeader({
  eyebrow,
  title,
  sub,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  className?: string;
}) {
  return (
    <Reveal stagger className={`max-w-2xl ${className}`}>
      {eyebrow && (
        <Reveal.Item>
          <p className="eyebrow eyebrow-line mb-5">{eyebrow}</p>
        </Reveal.Item>
      )}
      <Reveal.Item>
        <h2 className="text-3xl font-medium leading-[1.1] tracking-tight text-mist-100 md:text-[2.75rem]">
          {title}
        </h2>
      </Reveal.Item>
      {sub && (
        <Reveal.Item>
          <p className="mt-5 text-lg leading-relaxed font-light text-mist-300">
            {sub}
          </p>
        </Reveal.Item>
      )}
    </Reveal>
  );
}
