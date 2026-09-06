import type { RelatedTarget } from '../../application/related-links';
import { RelatedClimateLink } from './RelatedClimateLink';

type Props = {
  links: { label: string; target: RelatedTarget }[];
  onOpen: (target: RelatedTarget) => void;
};

export function RelatedLinks({ links, onOpen }: Props) {
  if (links.length === 0) return null;
  return (
    <div className="related-climate-list">
      {links.map((link) => (
        <RelatedClimateLink key={link.label} label={link.label} onClick={() => onOpen(link.target)} />
      ))}
    </div>
  );
}
