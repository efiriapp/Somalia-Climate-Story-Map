import { describe, expect, it } from 'vitest';
import {
  isTourSoundMuted,
  playCalendarTick,
  playLandingSound,
  playTakeoffSound,
  setTourSoundMuted,
  startFlightSound,
  stopFlightSound,
} from './tour-sound';

describe('tour sound', () => {
  it('mutes flight and calendar sounds together', () => {
    setTourSoundMuted(false);
    expect(isTourSoundMuted()).toBe(false);
    setTourSoundMuted(true);
    expect(isTourSoundMuted()).toBe(true);
    expect(() => {
      playTakeoffSound();
      startFlightSound();
      playLandingSound();
      playCalendarTick();
      stopFlightSound();
    }).not.toThrow();
    setTourSoundMuted(false);
    expect(isTourSoundMuted()).toBe(false);
  });
});
