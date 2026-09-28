import Reveal from "./Reveal";
import "./CategoryHero.css";

export default function CategoryHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Reveal className="category-hero container">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </Reveal>
  );
}
