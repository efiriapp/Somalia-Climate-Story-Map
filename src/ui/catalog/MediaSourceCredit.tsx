import { localizeCreditText } from '../../application/locale';
import type { MediaCredit } from '../../application/media-source-credit';
import { useLocale } from '../chrome/LocaleContext';

type Props = {
  credit: MediaCredit | null;
};

export function MediaSourceCredit({ credit }: Props) {
  const { locale } = useLocale();
  if (!credit) {
    return null;
  }
  const text = localizeCreditText(credit.text, locale);
  return (
    <p className="media-source">
      {credit.url ? (
        <a href={credit.url} target="_blank" rel="noreferrer">
          {text}
        </a>
      ) : (
        text
      )}
    </p>
  );
}
