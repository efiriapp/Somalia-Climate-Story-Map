type Props = {
  label: string;
  image?: string;
  onClick: () => void;
};

export function RelatedClimateLink({ label, image, onClick }: Props) {
  return (
    <button type="button" className="related-link-card" onClick={onClick}>
      {image ? <img src={image} alt="" /> : <span className="related-link-card-fallback" aria-hidden="true" />}
      <span className="related-link-card-label">{label}</span>
    </button>
  );
}
