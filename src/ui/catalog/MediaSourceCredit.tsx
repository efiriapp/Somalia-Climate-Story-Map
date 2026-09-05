import type { MediaCredit } from '../../application/media-source-credit';

type Props = {
  credit: MediaCredit | null;
};

export function MediaSourceCredit({ credit }: Props) {
  if (!credit) {
    return null;
  }
  return (
    <p className="media-source">
      {credit.url ? (
        <a href={credit.url} target="_blank" rel="noreferrer">
          {credit.text}
        </a>
      ) : (
        credit.text
      )}
    </p>
  );
}
