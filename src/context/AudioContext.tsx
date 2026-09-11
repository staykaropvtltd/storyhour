"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
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
  isMiniPlayerVisible: boolean;
  setIsMiniPlayerVisible: (visible: boolean) => void;
  isVideoModalOpen: boolean;
  setIsVideoModalOpen: (open: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  // Default to the featured English Ramayana story
  const [currentStory, setCurrentStory] = useState<Story>(STORIES[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(180); // Sample 3 minute preview
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeLanguage, setActiveLanguage] = useState<string>("English");
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated continuous playback timer for preview mode
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration]);

  const playStory = (story: Story) => {
    setCurrentStory(story);
    setActiveLanguage(story.language);
    setCurrentTime(0);
    setDuration(story.durationMinutes * 60 || 180);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const seekTo = (time: number) => {
    setCurrentTime(time);
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (vol === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

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
        isMiniPlayerVisible,
        setIsMiniPlayerVisible,
        isVideoModalOpen,
        setIsVideoModalOpen,
      }}
    >
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
