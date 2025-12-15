import { GoogleGenAI } from "@google/genai";
import { TripItinerary, TripPreferences, Destination } from "../types";

// Initialize API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTripPlan = async (
  destinations: Destination[],
  preferences: TripPreferences
): Promise<TripItinerary> => {
  
  if (destinations.length === 0) {
    throw new Error("No destinations provided");
  }

  // Using gemini-2.5-flash for the googleMaps tool support
  const model = "gemini-2.5-flash";

  const destinationList = destinations.map(d => `${d.name} (${d.durationDays} days stay)`).join(", ");

  const systemInstruction = `
    You are an expert travel logistics algorithm. Your goal is to plan the perfect road trip using real-world map data.
    
    Inputs provided:
    1. A starting city.
    2. A list of target destinations to visit.
    3. Constraints: Maximum driving hours per day.
    4. Preferences: Round Trip (Yes/No), Return Style (Loop vs Same Route).

    Your Tasks:
    1. Use Google Maps data to verify locations and distances.
    2. Reorder destinations to minimize driving time (Traveling Salesman Problem) unless a specific order makes more sense geographically.
    3. Plan the route day-by-day.
       - Respect "Stay Duration". If a user stays 2 days, those days should have minimal driving.
       - Keep daily driving under the max limit.
    4. ROUND TRIP LOGIC (CRITICAL):
       - If "Round Trip" is TRUE, the itinerary MUST end back at the "Starting City".
       - You MUST generate the return journey days. Do not just stop at the last destination.
       - **Loop (Spoon) Style**: You MUST plan the return journey via a DIFFERENT major route/highway than the outbound journey if possible. Explore new areas on the way back.
       - **Same Route Style**: Return via the fastest path (usually retracing steps).
    5. Insert Breaks and Overnights clearly.
    6. Provide ACCURATE GPS coordinates (latitude, longitude) for every location using the googleMaps tool.
    
    IMPORTANT: You must output PURE VALID JSON. Do not include markdown formatting (like \`\`\`json).
  `;

  // We explicitly define the structure we want in the prompt since we cannot use responseSchema with tools
  const jsonStructure = `
  {
    "tripName": "string",
    "startLocation": { "name": "string", "coordinates": { "latitude": number, "longitude": number } },
    "totalDays": number,
    "totalDistanceEstimateKm": number,
    "days": [
      {
        "dayNumber": number,
        "title": "string",
        "totalDriveHours": number,
        "segments": [
          {
            "type": "DRIVE" | "VISIT" | "OVERNIGHT" | "BREAK",
            "description": "string",
            "durationHours": number,
            "locationName": "string",
            "coordinates": { "latitude": number, "longitude": number },
            "notes": "string"
          }
        ]
      }
    ]
  }
  `;

  const userPrompt = `
    Plan a road trip starting from: ${preferences.startCity}.
    Destinations: ${destinationList}.
    Max driving hours/day: ${preferences.maxDriveHoursPerDay}.
    Round trip: ${preferences.roundTrip ? "Yes" : "No"}.
    ${preferences.roundTrip ? `Return Style: ${preferences.returnRouteStyle === 'loop' ? "LOOP (Spoon) - Return via a DIFFERENT scenic route/highway to create a loop shape on the map." : "SAME ROUTE - Retrace steps via fastest way."}` : ""}
    Start Date: ${preferences.startDate}.
    Stop Frequency: ${preferences.stopsFrequency}.
    Preferred Stop Type: ${preferences.amenityType}.

    Use the googleMaps tool to find accurate coordinates and distances.
    Ensure the final day ends at ${preferences.startCity} if Round Trip is Yes.
    
    OUTPUT JSON ONLY matching this structure:
    ${jsonStructure}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        // responseSchema and responseMimeType are NOT allowed when using tools like googleMaps
        tools: [{ googleMaps: {} }],
        temperature: 0.2, 
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    // Grounding metadata contains sources (Maps URIs)
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      console.log("Maps Grounding Data:", groundingMetadata.groundingChunks);
      // In a real app, we might display these sources to the user
    }

    // Clean up potential markdown formatting from the response
    let cleanJson = response.text.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '');
    }

    const data = JSON.parse(cleanJson) as TripItinerary;
    return data;

  } catch (error) {
    console.error("Error generating trip:", error);
    throw error;
  }
};