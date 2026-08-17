import { describe, expect, it } from 'vitest';
import {
  getTourSoundVolume,
  isTourSoundMuted,
  playCalendarTick,
  playLandingSound,
  playTakeoffSound,
  setTourSoundMuted,
  setTourSoundVolume,
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

  it('adjusts volume down to mute and restores the last level', () => {
    setTourSoundVolume(1);
    expect(getTourSoundVolume()).toBe(1);
    expect(isTourSoundMuted()).toBe(false);
    setTourSoundVolume(0.4);
    expect(getTourSoundVolume()).toBe(0.4);
    setTourSoundVolume(0);
    expect(getTourSoundVolume()).toBe(0);
    expect(isTourSoundMuted()).toBe(true);
    setTourSoundMuted(false);
    expect(getTourSoundVolume()).toBe(0.4);
    expect(isTourSoundMuted()).toBe(false);
    setTourSoundVolume(2);
    expect(getTourSoundVolume()).toBe(1);
    setTourSoundVolume(-0.2);
    expect(getTourSoundVolume()).toBe(0);
    expect(isTourSoundMuted()).toBe(true);
    setTourSoundVolume(1);
  });
});
