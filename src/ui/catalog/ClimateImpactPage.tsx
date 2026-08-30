import { useLayoutEffect } from 'react';
import type { ClimateHazardId } from '../../content/climate-impact';
import { climateImpactHub, climateImpactPages } from '../../content/climate-impact';
import { scrollPageToTop } from '../../application/scroll-page-top';

type Props = {
  selectedId: ClimateHazardId | null;
  onSelect: (id: ClimateHazardId) => void;
  onBack: () => void;
};

export function ClimateImpactPage({ selectedId, onSelect, onBack }: Props) {
  const page = climateImpactPages.find((item) => item.id === selectedId);

  useLayoutEffect(() => {
    scrollPageToTop();
  }, [selectedId]);

  if (page) {
    return (
      <article className="detail climate-impact" aria-label={page.title}>
        <button className="back" type="button" onClick={onBack}>
          ← Back to Climate Impact
        </button>
        <p className="story-type">{page.kicker}</p>
        <h1>{page.title}</h1>
        <p className="story-lede">{page.lede}</p>
        {page.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
        <p>
          <strong>More information:</strong>{' '}
          <a href={page.sourceUrl} target="_blank" rel="noreferrer">
            {page.sourceLabel}
          </a>
        </p>
      </article>
    );
  }

  return (
    <article className="detail climate-impact" aria-label="Climate Impact">
      <p className="story-type">Climate Impact</p>
      <h1>{climateImpactHub.title}</h1>
      <p className="story-lede">{climateImpactHub.lede}</p>
      <div className="climate-impact-grid">
        {climateImpactPages.map((item) => (
          <button
            key={item.id}
            type="button"
            className="climate-impact-card"
            onClick={() => onSelect(item.id)}
          >
            <p className="story-type">{item.kicker}</p>
            <h2>{item.title}</h2>
            <p>{item.lede}</p>
          </button>
        ))}
      </div>
    </article>
  );
}
