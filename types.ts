export enum SegmentType {
  DRIVE = 'DRIVE',
  VISIT = 'VISIT',
  OVERNIGHT = 'OVERNIGHT',
  BREAK = 'BREAK'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RouteSegment {
  type: SegmentType;
  description: string; // e.g., "Drive from Seattle to Portland", "Visit Cannon Beach"
  durationHours: number;
  locationName?: string; // For map markers visual
  coordinates?: Coordinates;
  notes?: string;
}

export interface DayPlan {
  dayNumber: number;
  title: string; // e.g., "Day 1: The Coast Start"
  totalDriveHours: number;
  segments: RouteSegment[];
}

export interface TripItinerary {
  tripName: string;
  startLocation?: {
    name: string;
    coordinates: Coordinates;
  };
  totalDays: number;
  totalDistanceEstimateKm: number;
  days: DayPlan[];
}

export interface TripPreferences {
  maxDriveHoursPerDay: number;
  startCity: string;
  roundTrip: boolean;
  startDate: string;
  stopsFrequency: 'low' | 'medium' | 'high';
  amenityType: string;
}

export const DEFAULT_PREFERENCES: TripPreferences = {
  maxDriveHoursPerDay: 6,
  startCity: '',
  roundTrip: false,
  startDate: new Date().toISOString().split('T')[0],
  stopsFrequency: 'medium',
  amenityType: 'Scenic & Local Gems'
};