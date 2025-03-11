import { useCallback } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useCreditsStore } from "@/app/stores/credits";

interface UserCredits {
  screenCredits: number;
  revisionCredits: number;
  remainingScreenCredits: number;
  remainingRevisionCredits: number;
}

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export const useUserCredits = () => {
  const { getToken } = useAuth();
  const {
    credits,
    isLoading,
    error,
    lastUpdated,
    setCredits,
    setError,
    setLoading,
  } = useCreditsStore();

  const loadCredits = useCallback(
    async (force = false) => {
      // If we have cached data and it's not expired, return early unless force refresh is requested
      if (
        !force &&
        credits &&
        lastUpdated &&
        Date.now() - lastUpdated < CACHE_DURATION
      ) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) {
          throw new Error("No authentication token available");
        }

        const response = await fetch("https://s4ofd6.buildship.run/load-user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load credits");
        }
        const data = await response.json();
        setCredits(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [getToken, credits, lastUpdated, setCredits, setError, setLoading]
  );

  return {
    credits,
    isLoading,
    error,
    loadCredits,
  };
};
