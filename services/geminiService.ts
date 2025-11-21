import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TripItinerary, TripPreferences } from "../types";

// Initialize API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTripPlan = async (
  destinations: string[],
  preferences: TripPreferences
): Promise<TripItinerary> => {
  
  if (destinations.length === 0) {
    throw new Error("No destinations provided");
  }

  const model = "gemini-2.5-flash";

  const systemInstruction = `
    You are an expert travel logistics algorithm. Your goal is to plan the perfect road trip.
    
    Inputs provided:
    1. A starting city.
    2. A list of target destinations to visit.
    3. Constraints: Maximum driving hours per day.
    4. Whether to return to the start (round trip).
    5. Preferences for stop frequency and amenity types (e.g., fast food chains vs scenic spots).

    Your Tasks:
    1. SOLVE THE TRAVELING SALESMAN PROBLEM: Reorder the destinations to minimize total driving time and eliminate backtracking.
    2. SCHEDULE: Break the trip into days. Ensure the total driving time per day does NOT exceed the user's limit.
    3. INSERT BREAKS: 
       - If preference is 'high' frequency, suggest breaks every 2 hours.
       - If 'medium', every 3 hours.
       - If 'low', maximize driving stints.
       - Tailor the *type* of break to the user's amenity preference (e.g., if "McDonalds", suggest chains; if "Scenic", suggest viewpoints).
    4. INSERT OVERNIGHTS: Explicitly state where the user should sleep at the end of each day.
    5. DAYLIGHT: Prioritize driving during daylight hours.
    6. GEOLOCATION: You MUST provide accurate latitude and longitude coordinates for the start location and every stop/location mentioned in the segments.
  `;

  const userPrompt = `
    Plan a road trip starting from: ${preferences.startCity}.
    Destinations to visit: ${destinations.join(", ")}.
    Max driving hours per day: ${preferences.maxDriveHoursPerDay}.
    Round trip: ${preferences.roundTrip ? "Yes" : "No, end at last destination"}.
    Start Date: ${preferences.startDate}.
    Stop Frequency: ${preferences.stopsFrequency} (low=fewer stops, high=more frequent breaks).
    Preferred Stop Type: ${preferences.amenityType}.

    Please provide a structured itinerary with GPS coordinates for mapping.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      tripName: { type: Type.STRING, description: "A catchy name for this road trip" },
      startLocation: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          coordinates: {
            type: Type.OBJECT,
            properties: {
              latitude: { type: Type.NUMBER },
              longitude: { type: Type.NUMBER }
            },
            required: ["latitude", "longitude"]
          }
        },
        required: ["name", "coordinates"]
      },
      totalDays: { type: Type.INTEGER },
      totalDistanceEstimateKm: { type: Type.NUMBER },
      days: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            dayNumber: { type: Type.INTEGER },
            title: { type: Type.STRING, description: "Summary title for the day" },
            totalDriveHours: { type: Type.NUMBER },
            segments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { 
                    type: Type.STRING, 
                    enum: ["DRIVE", "VISIT", "OVERNIGHT", "BREAK"],
                    description: "Type of activity"
                  },
                  description: { type: Type.STRING, description: "Short description of what is happening" },
                  durationHours: { type: Type.NUMBER, description: "Estimated duration in hours" },
                  locationName: { type: Type.STRING, description: "The city or place name relevant to this segment" },
                  coordinates: {
                    type: Type.OBJECT,
                    properties: {
                      latitude: { type: Type.NUMBER },
                      longitude: { type: Type.NUMBER }
                    },
                    required: ["latitude", "longitude"],
                    description: "GPS coordinates of the locationName"
                  },
                  notes: { type: Type.STRING, description: "Tips, warnings, or scenic route suggestions" }
                },
                required: ["type", "description", "durationHours", "locationName", "coordinates"]
              }
            }
          },
          required: ["dayNumber", "title", "totalDriveHours", "segments"]
        }
      }
    },
    required: ["tripName", "startLocation", "totalDays", "days", "totalDistanceEstimateKm"]
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2, 
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const data = JSON.parse(response.text) as TripItinerary;
    return data;

  } catch (error) {
    console.error("Error generating trip:", error);
    throw error;
  }
};