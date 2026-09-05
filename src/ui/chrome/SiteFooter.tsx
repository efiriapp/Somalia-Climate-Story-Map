import { siteFooter } from '../../content/site-footer';
import { useLocale } from './LocaleContext';

export function SiteFooter() {
  const { copy } = useLocale();
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-brand">
        <img src="/logos/ice-mark.png" alt="" />
        <img src="/logos/simad.webp" alt="" />
        <div>
          <strong>{siteFooter.institute}</strong>
          <p>{siteFooter.university}</p>
          <p>{copy.platform}</p>
        </div>
      </div>
      <p className="site-footer-comment">{siteFooter.comment}</p>
      <p className="site-footer-copy">{siteFooter.copyright}</p>
      <p>
        <a href={siteFooter.website} target="_blank" rel="noreferrer">
          {siteFooter.website}
        </a>
      </p>
    </footer>
  );
}
