
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DestinationInput } from './components/DestinationInput';
import { TripTimeline } from './components/TripTimeline';
import { TripHeader } from './components/TripHeader';
import { MapView } from './components/MapView';
import { TripItinerary, TripPreferences, DEFAULT_PREFERENCES, Destination } from './types';
import { generateTripPlan } from './services/geminiService';
import { Compass, AlertCircle, List, Map as MapIcon } from 'lucide-react';

export default function App() {
  // Load state from localStorage with lazy initialization
  const [destinations, setDestinations] = useState<Destination[]>(() => {
    try {
      const saved = localStorage.getItem('roadtrip_destinations');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migration: Check if it's the old string[] format and convert to Destination[]
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
          return parsed.map((d: string) => ({ name: d, durationDays: 1 }));
        }
        return parsed;
      }
      return [];
    } catch (e) {
      console.error("Failed to load destinations from storage", e);
      return [];
    }
  });

  const [preferences, setPreferences] = useState<TripPreferences>(() => {
    try {
      const saved = localStorage.getItem('roadtrip_preferences');
      return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
    } catch (e) {
      console.error("Failed to load preferences from storage", e);
      return DEFAULT_PREFERENCES;
    }
  });

  const [tripPlan, setTripPlan] = useState<TripItinerary | null>(() => {
    try {
      const saved = localStorage.getItem('roadtrip_plan');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to load trip plan from storage", e);
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'map'>('timeline');

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('roadtrip_destinations', JSON.stringify(destinations));
  }, [destinations]);

  useEffect(() => {
    localStorage.setItem('roadtrip_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (tripPlan) {
      localStorage.setItem('roadtrip_plan', JSON.stringify(tripPlan));
    } else {
      localStorage.removeItem('roadtrip_plan');
    }
  }, [tripPlan]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setTripPlan(null); 
    
    try {
      const plan = await generateTripPlan(destinations, preferences);
      setTripPlan(plan);
      setViewMode('timeline');
    } catch (err) {
      setError("Failed to generate trip plan. Please check your internet connection or try fewer destinations.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearTrip = () => {
    if (window.confirm("Start a new trip? This will clear your current itinerary and settings.")) {
      setDestinations([]);
      setPreferences(DEFAULT_PREFERENCES);
      setTripPlan(null);
      setError(null);
      // LocalStorage updates are handled by the useEffects reacting to state changes
    }
  };

  return (
    <div className="min-h-screen pb-12 font-sans text-slate-800">
      <Header />
      
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 xl:col-span-3">
            <DestinationInput
              destinations={destinations}
              setDestinations={setDestinations}
              preferences={preferences}
              setPreferences={setPreferences}
              onGenerate={handleGenerate}
              onClear={handleClearTrip}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 xl:col-span-9">
            {error && (
              <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl p-4 flex gap-3 text-red-800 mb-6 animate-fade-in shadow-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {tripPlan ? (
              <div className="animate-fade-in">
                <TripHeader itinerary={tripPlan} />
                
                {/* Mobile/Tablet View Toggles (Hidden on XL screens) */}
                <div className="flex xl:hidden bg-white/90 backdrop-blur-sm p-1 rounded-xl border border-white/50 w-fit mb-6 shadow-sm">
                   <button 
                      onClick={() => setViewMode('timeline')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'timeline' 
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-700'
                      }`}
                   >
                      <List className="w-4 h-4" /> Timeline
                   </button>
                   <button 
                      onClick={() => setViewMode('map')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        viewMode === 'map' 
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-700'
                      }`}
                   >
                      <MapIcon className="w-4 h-4" /> Map View
                   </button>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 relative">
                   {/* Timeline: Visible if mode is timeline OR on XL screens (always visible in split view) */}
                   <div className={`flex-1 transition-opacity duration-300 ${viewMode === 'timeline' ? 'block opacity-100' : 'hidden xl:block xl:opacity-100 opacity-0'}`}>
                      <TripTimeline itinerary={tripPlan} />
                   </div>

                   {/* Map: Visible if mode is map OR on XL screens (always visible in split view) */}
                   <div className={`flex-1 transition-opacity duration-300 ${viewMode === 'map' ? 'block opacity-100' : 'hidden xl:block xl:opacity-100 opacity-0'}`}>
                      <div className="xl:sticky xl:top-24 xl:h-[calc(100vh-8rem)]">
                        <MapView itinerary={tripPlan} />
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              !isLoading && (
                <div className="glass-card flex flex-col items-center justify-center h-[50vh] text-center p-8 rounded-3xl shadow-xl">
                  <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-full mb-6 shadow-inner">
                    <Compass className="w-16 h-16 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">Where is your next adventure?</h3>
                  <p className="text-slate-600 max-w-md text-lg leading-relaxed">
                    Enter your starting point and your dream destinations. We'll craft the perfect route, so you can focus on the playlist.
                  </p>
                </div>
              )
            )}
            
            {isLoading && !tripPlan && (
               <div className="space-y-6 animate-pulse">
                  <div className="h-32 bg-white/40 backdrop-blur rounded-2xl w-full"></div>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                       <div className="h-16 w-16 rounded-2xl bg-white/40 backdrop-blur"></div>
                       <div className="h-64 bg-white/40 backdrop-blur rounded-xl w-full"></div>
                    </div>
                    <div className="flex-1 space-y-4 hidden md:block">
                       <div className="h-full bg-white/40 backdrop-blur rounded-xl w-full"></div>
                    </div>
                  </div>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
