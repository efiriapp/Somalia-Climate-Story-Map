type Props = {
  label: string;
  onClick: () => void;
};

export function RelatedClimateLink({ label, onClick }: Props) {
  return (
    <p className="related-climate">
      <button type="button" className="related-climate-link" onClick={onClick}>
        {label}
      </button>
    </p>
  );
}
