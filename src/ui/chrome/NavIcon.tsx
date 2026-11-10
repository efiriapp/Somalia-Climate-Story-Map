import type { Screen } from '../../application/route';
import about from '../../assets/nav-icons/about.svg';
import climateImpact from '../../assets/nav-icons/climate-impact.svg';
import droughtWatch from '../../assets/nav-icons/drought-watch.svg';
import floodWatch from '../../assets/nav-icons/flood-watch.svg';
import globalStage from '../../assets/nav-icons/global-stage.svg';
import research from '../../assets/nav-icons/research.svg';
import stories from '../../assets/nav-icons/stories.svg';

/**
 * Menu icons from Microsoft's Fluent Emoji (flat), MIT licence, bundled so they
 * look the same on every device. See scripts/extract-nav-icons.mjs.
 */
export const NAV_ICON_SRC: Record<Screen, string> = {
  about,
  research,
  stories,
  'climate-impact': climateImpact,
  'flood-watch': floodWatch,
  'drought-watch': droughtWatch,
  'global-stage': globalStage,
};

export function NavIcon({ screen }: { screen: Screen }) {
  return <img className="nav-icon" src={NAV_ICON_SRC[screen]} alt="" width={22} height={22} aria-hidden="true" />;
}
