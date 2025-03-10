import { useAuth } from "@clerk/clerk-expo";
import { useCallback } from "react";

export interface Mockup {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export function useMockups() {
  const { getToken } = useAuth();

  const fetchUserMockups = useCallback(async (): Promise<Mockup[]> => {
    try {
      // Get the session token
      const token = await getToken();

      if (!token) {
        throw new Error("Not authenticated");
      }

      // Make the authenticated request
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
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching mockups:", error);
      throw error;
    }
  }, [getToken]);

  return { fetchUserMockups };
}

export interface GenerateMockupResponse {
  html: string;
  screenId: string;
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
          throw new Error(`API request failed with status ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error generating mockup:", error);
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
          throw new Error(`API request failed with status ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error editing mockup:", error);
        throw error;
      }
    },
    [getToken]
  );

  return { editMockup };
}
