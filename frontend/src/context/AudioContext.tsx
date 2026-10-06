"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { Story, STORIES } from "@/data/storyhour-data";

interface AudioContextType {
  currentStory: Story;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  activeLanguage: string;
  playStory: (story: Story) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setActiveLanguage: (lang: string) => void;
  isVideoModalOpen: boolean;
  setIsVideoModalOpen: (open: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentStory, setCurrentStory] = useState<Story>(STORIES[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeLanguage, setActiveLanguage] = useState<string>("English");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play audio safely handling browser autoplay policies
  const playStory = useCallback((story: Story) => {
    setCurrentStory(story);
    setActiveLanguage(story.language);
    setCurrentTime(0);
    setDuration(story.durationMinutes ? story.durationMinutes * 60 : 180);
    setIsPlaying(true);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.warn("Audio autoplay blocked by browser policy", err);
      });
    }
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (audioRef.current) {
        if (next) {
          audioRef.current.play().catch((err) => {
            console.warn("Audio playback blocked", err);
          });
        } else {
          audioRef.current.pause();
        }
      }
      return next;
    });
  }, []);

  const seekTo = useCallback((time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      audioRef.current.muted = vol === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  }, []);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  return (
    <AudioContext.Provider
      value={{
        currentStory,
        isPlaying,
        currentTime,
        duration,
        volume: isMuted ? 0 : volume,
        isMuted,
        activeLanguage,
        playStory,
        togglePlay,
        seekTo,
        setVolume,
        toggleMute,
        setActiveLanguage,
        isVideoModalOpen,
        setIsVideoModalOpen,
      }}
    >
      {/* Real HTML5 Audio Element for playback and audio-detection test suites */}
      <audio
        ref={audioRef}
        id="storyhour-global-audio"
        preload="metadata"
        src="/audio/sample-preview.wav"
        aria-hidden="true"
        className="hidden"
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
        }}
        onLoadedMetadata={(e) => {
          if (e.currentTarget.duration && !isNaN(e.currentTarget.duration)) {
            setDuration(e.currentTarget.duration);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
