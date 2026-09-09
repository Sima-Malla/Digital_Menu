"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const FAVORITES_STORAGE_KEY = "kitchens-favorites-v1";

type SavedContextType = {
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  savedCount: number;
};

const SavedContext = createContext<SavedContextType>({
  favoriteIds: [],
  toggleFavorite: () => {},
  isFavorite: () => false,
  savedCount: 0,
});

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFavoriteIds(parsed.filter((id) => typeof id === "string"));
        }
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      window.localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favoriteIds)
      );
    } catch {
      // Ignore localStorage write errors
    }
  }, [favoriteIds, isLoaded]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favoriteIds.includes(id);

  return (
    <SavedContext.Provider
      value={{
        favoriteIds,
        toggleFavorite,
        isFavorite,
        savedCount: favoriteIds.length,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}
