export const scrollPageToTop = (): void => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const root = document.getElementById('root');
  if (root) {
    root.scrollTop = 0;
  }
};
