import { useState, useEffect } from "react";

const LOCAL_STORAGE_KEY = "settings.musicMuted";
export const MUSIC_MUTED_EVENT = "musicMutedChanged";

export function cacheMusicMutedSetting(value: boolean) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(MUSIC_MUTED_EVENT, { detail: value }));
}

export function getMusicMutedSetting(): boolean {
  const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
  return cached ? JSON.parse(cached) : false;
}

export const useIsMusicMuted = () => {
  const [isMusicMuted, setIsMusicMuted] = useState(getMusicMutedSetting());

  const toggleMusicMuted = () => {
    const newValue = !isMusicMuted;
    setIsMusicMuted(newValue);
    cacheMusicMutedSetting(newValue);
  };

  useEffect(() => {
    const handleMusicMutedChange = (event: CustomEvent) => {
      setIsMusicMuted(event.detail);
    };

    window.addEventListener(MUSIC_MUTED_EVENT as any, handleMusicMutedChange);

    return () => {
      window.removeEventListener(
        MUSIC_MUTED_EVENT as any,
        handleMusicMutedChange,
      );
    };
  }, []);

  return { isMusicMuted, toggleMusicMuted };
};
