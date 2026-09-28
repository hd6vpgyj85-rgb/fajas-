import "./CategoryPhotoBanner.css";

interface CategoryPhotoBannerProps {
  name: string;
  tagline: string;
  image: string;
}

export default function CategoryPhotoBanner({ name, tagline, image }: CategoryPhotoBannerProps) {
  return (
    <div className="category-photo-banner">
      <div className="category-photo-banner-bg" style={{ backgroundImage: `url(${image})` }} aria-hidden="true" />
      <div className="category-photo-banner-overlay">
        <h1>{name}</h1>
        <p>{tagline}</p>
      </div>
    </div>
  );
}
