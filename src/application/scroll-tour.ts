export const scrollTourIndex = (deltaY: number, index: number, length: number): number | null => {
  if (deltaY > 0 && index < length - 1) {
    return index + 1;
  }
  if (deltaY < 0 && index >= 0) {
    return index - 1;
  }
  return null;
};
