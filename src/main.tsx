import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/App';
// Self-hosted fonts (OFL): Inter for Latin text, Noto Sans Arabic for Arabic.
// Only the weights the theme uses; the browser downloads Arabic glyphs only when needed.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/latin-800.css';
import '@fontsource/inter/latin-900.css';
import '@fontsource/noto-sans-arabic/arabic-400.css';
import '@fontsource/noto-sans-arabic/arabic-700.css';
import './ui/theme.css';


const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element missing');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
