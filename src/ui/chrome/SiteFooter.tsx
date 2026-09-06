import { localizeFooter } from '../../application/localize-content';
import { useLocale } from './LocaleContext';

export function SiteFooter() {
  const { copy, locale } = useLocale();
  const footer = localizeFooter(locale);
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-brand">
        <img src="/logos/ice-mark.png" alt="" />
        <img src="/logos/simad.webp" alt="" />
        <div>
          <strong>{footer.institute}</strong>
          <p>{footer.university}</p>
          <p>{copy.platform}</p>
        </div>
      </div>
      <p className="site-footer-comment">{footer.comment}</p>
      <p className="site-footer-copy">{footer.copyright}</p>
      <p>
        <a href={footer.website} target="_blank" rel="noreferrer">
          {footer.website}
        </a>
      </p>
    </footer>
  );
}
