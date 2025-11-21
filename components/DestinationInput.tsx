import React, { useState } from 'react';
import { Plus, X, MapPin, Calendar, Clock, RotateCw, ArrowRight, Settings2, Utensils, Coffee } from 'lucide-react';
import { TripPreferences } from '../types';

interface DestinationInputProps {
  destinations: string[];
  setDestinations: React.Dispatch<React.SetStateAction<string[]>>;
  preferences: TripPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<TripPreferences>>;
  onGenerate: () => void;
  isLoading: boolean;
}

export const DestinationInput: React.FC<DestinationInputProps> = ({
  destinations,
  setDestinations,
  preferences,
  setPreferences,
  onGenerate,
  isLoading,
}) => {
  const [newDest, setNewDest] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addDestination = () => {
    if (newDest.trim()) {
      setDestinations([...destinations, newDest.trim()]);
      setNewDest('');
    }
  };

  const removeDestination = (index: number) => {
    setDestinations(destinations.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addDestination();
    }
  };

  return (
    <div className="glass-card rounded-2xl shadow-2xl shadow-black/5 p-6 h-fit lg:sticky lg:top-24">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-sm">
             <Settings2 className="w-5 h-5 text-indigo-600" />
          </div>
          Trip Details
        </h2>
        <p className="text-sm text-slate-500 mt-1 ml-11">Define your perfect journey</p>
      </div>

      {/* Start Location */}
      <div className="mb-6">
        <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide">Starting Point</label>
        <div className="relative group">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
            placeholder="Where are you starting?"
            value={preferences.startCity}
            onChange={(e) => setPreferences({ ...preferences, startCity: e.target.value })}
          />
        </div>
      </div>

      {/* Destinations List */}
      <div className="mb-8">
        <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide">Stops to Visit</label>
        <div className="space-y-3">
          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
              placeholder="Add a destination..."
              value={newDest}
              onChange={(e) => setNewDest(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={addDestination}
              disabled={!newDest.trim()}
              className="bg-slate-800 hover:bg-indigo-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-lg shadow-slate-400/50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {destinations.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No stops added yet.
              </div>
            )}
            {destinations.map((dest, idx) => (
              <div key={idx} className="group flex justify-between items-center bg-white/80 backdrop-blur px-4 py-3 rounded-xl border border-white shadow-sm hover:border-indigo-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-slate-700 font-medium truncate text-sm">{dest}</span>
                </div>
                <button
                  onClick={() => removeDestination(idx)}
                  className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="space-y-6 border-t border-slate-200/50 pt-6">
        
        {/* Date & Round Trip */}
        <div className="grid grid-cols-1 gap-4">
          <div>
             <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide flex items-center gap-2">
               <Calendar className="w-3 h-3" /> Start Date
             </label>
             <input 
                type="date" 
                value={preferences.startDate}
                onChange={(e) => setPreferences({...preferences, startDate: e.target.value})}
                className="w-full px-4 py-2.5 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
             />
          </div>
          
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white/30 hover:bg-white/60 cursor-pointer transition-all">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <RotateCw className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-700">Round Trip</span>
            </div>
            <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${preferences.roundTrip ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${preferences.roundTrip ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
            <input
              type="checkbox"
              checked={preferences.roundTrip}
              onChange={(e) => setPreferences({ ...preferences, roundTrip: e.target.checked })}
              className="hidden"
            />
          </label>
        </div>

        {/* Advanced Toggle */}
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {showAdvanced ? 'Hide preferences' : 'Show preferences (Driving, Stops, Amenities)'}
        </button>

        {/* Expandable Settings */}
        {showAdvanced && (
          <div className="space-y-5 pt-2 animate-fade-in">
            {/* Driving Time Slider */}
            <div>
              <div className="flex justify-between text-sm mb-3">
                <label className="font-medium text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Max Drive / Day
                </label>
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-bold">
                  {preferences.maxDriveHoursPerDay}h
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                step="1"
                value={preferences.maxDriveHoursPerDay}
                onChange={(e) => setPreferences({ ...preferences, maxDriveHoursPerDay: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium uppercase">
                <span>Relaxed</span>
                <span>Intense</span>
              </div>
            </div>

            {/* Stops Frequency */}
            <div>
               <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide flex items-center gap-2">
                  <Coffee className="w-3 h-3" /> Break Frequency
               </label>
               <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setPreferences({...preferences, stopsFrequency: freq})}
                      className={`py-2 px-2 rounded-lg text-xs font-medium capitalize transition-all border ${
                        preferences.stopsFrequency === freq
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                        : 'bg-white/50 text-slate-600 border-slate-200 hover:bg-white'
                      }`}
                    >
                      {freq === 'low' ? 'Minimal' : freq}
                    </button>
                  ))}
               </div>
            </div>

             {/* Amenities */}
             <div>
               <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide flex items-center gap-2">
                  <Utensils className="w-3 h-3" /> Stop Preference
               </label>
               <select
                  value={preferences.amenityType}
                  onChange={(e) => setPreferences({...preferences, amenityType: e.target.value})}
                  className="w-full px-4 py-2.5 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none"
               >
                  <option value="Scenic & Local Gems">Scenic & Local Gems</option>
                  <option value="Fast Food & Chains">Fast Food Chains (McDonald's, etc)</option>
                  <option value="Gas Stations & Rest Stops">Gas Stations & Efficient Rest Stops</option>
                  <option value="Family Friendly">Family Friendly (Parks, Playgrounds)</option>
               </select>
             </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="mt-8">
        <button
          onClick={onGenerate}
          disabled={isLoading || !preferences.startCity || destinations.length === 0}
          className={`w-full flex justify-center items-center gap-2 py-4 px-6 rounded-xl text-white font-bold tracking-wide transition-all shadow-lg
            ${isLoading || !preferences.startCity || destinations.length === 0
              ? 'bg-slate-400/70 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 hover:from-orange-600 hover:via-pink-600 hover:to-rose-600 hover:-translate-y-0.5 active:translate-y-0 shadow-orange-500/30'}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Planning Trip...
            </>
          ) : (
            <>
              Create Itinerary <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};