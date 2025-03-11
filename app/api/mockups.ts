import { useAuth } from "@clerk/clerk-expo";
import { useCallback } from "react";

export interface MockupDeviceInfo {
  platform: string;
  model: string;
  dimensions: {
    width: number;
    height: number;
    pixelRatio: number;
    fontScale: number;
  };
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  isNotchDevice: boolean;
  osVersion: string;
}

export interface Mockup {
  id: string;
  screenTitle: string;
  userId: string;
  deviceInfo: MockupDeviceInfo;
  renderingHints: string[];
}

export const useMockups = () => {
  const { getToken } = useAuth();

  const fetchUserMockups = async (): Promise<Mockup[]> => {
    try {
      const token = await getToken();
      const response = await fetch(
        "https://s4ofd6.buildship.run/sm-user-mockups",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch mockups");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching mockups:", error);
      throw error;
    }
  };

  return { fetchUserMockups };
};

export interface GenerateMockupResponse {
  html: string;
  screenId: string;
  remainingScreenCredits: number;
  remainingRevisionCredits: number;
}

export function useGenerateMockup() {
  const { getToken } = useAuth();

  const generateMockup = useCallback(
    async (enhancedPrompt: any): Promise<GenerateMockupResponse> => {
      try {
        // Get the session token
        const token = await getToken();

        if (!token) {
          throw new Error("Not authenticated");
        }

        // Make the authenticated request
        const response = await fetch(
          "https://s4ofd6.buildship.run/generate-mockup-html",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(enhancedPrompt),
          }
        );

        if (!response.ok) {
          // Get the error message from the response if possible
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Request failed with status ${response.status}`
          );
        }

        return await response.json();
      } catch (error) {
        // Rethrow the error without logging
        throw error;
      }
    },
    [getToken]
  );

  return { generateMockup };
}

export interface EditMockupRequest {
  screenId: string;
  userPrompt: string;
}

export function useEditMockup() {
  const { getToken } = useAuth();

  const editMockup = useCallback(
    async (request: EditMockupRequest): Promise<GenerateMockupResponse> => {
      try {
        // Get the session token
        const token = await getToken();

        if (!token) {
          throw new Error("Not authenticated");
        }

        // Make the authenticated request
        const response = await fetch(
          "https://s4ofd6.buildship.run/edit-mockup-html",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
          }
        );

        if (!response.ok) {
          // Get the error message from the response if possible
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Request failed with status ${response.status}`
          );
        }

        return await response.json();
      } catch (error) {
        // Rethrow the error without logging
        throw error;
      }
    },
    [getToken]
  );

  return { editMockup };
}

export function useGetMockup() {
  const { getToken } = useAuth();

  const getMockup = useCallback(
    async (screenId: string): Promise<GenerateMockupResponse> => {
      try {
        const token = await getToken();

        if (!token) {
          throw new Error("Not authenticated");
        }

        const response = await fetch(
          `https://s4ofd6.buildship.run/get-mockup?screenId=${screenId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error fetching mockup:", error);
        throw error;
      }
    },
    [getToken]
  );

  return { getMockup };
}
