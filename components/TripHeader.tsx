import React from 'react';
import { TripItinerary } from '../types';
import { Flag, Car, Calendar, Share2, MapPin } from 'lucide-react';

interface TripHeaderProps {
  itinerary: TripItinerary;
}

export const TripHeader: React.FC<TripHeaderProps> = ({ itinerary }) => {
  // Generate a search term for the image based on the trip destination or name
  const imageSearchTerm = itinerary.startLocation?.name 
    ? `${itinerary.startLocation.name} landscape road` 
    : 'road trip landscape';
  
  // Using a vibrant, high-quality travel image
  const imageUrl = `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2021&q=80`;

  return (
    <div className="group relative glass-card rounded-3xl shadow-2xl shadow-slate-900/5 mb-8 overflow-hidden">
      {/* Banner Image */}
      <div className="h-48 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10"></div>
        <img 
          src={imageUrl} 
          alt="Trip Theme" 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        <div className="absolute bottom-0 left-0 w-full p-6 z-20">
           <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                Road Trip Plan
              </span>
           </div>
           <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg">
              {itinerary.tripName}
           </h2>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-6 bg-white/40 backdrop-blur-sm">
        <div className="flex flex-wrap gap-6">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100/80 rounded-lg text-indigo-600">
                 <Flag className="w-5 h-5" />
              </div>
              <div>
                 <div className="text-xs text-slate-500 font-bold uppercase">Duration</div>
                 <div className="font-bold text-slate-900">{itinerary.totalDays} Days</div>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100/80 rounded-lg text-blue-600">
                 <Car className="w-5 h-5" />
              </div>
              <div>
                 <div className="text-xs text-slate-500 font-bold uppercase">Distance</div>
                 <div className="font-bold text-slate-900">~{itinerary.totalDistanceEstimateKm.toLocaleString()} km</div>
              </div>
           </div>

           {itinerary.startLocation && (
             <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100/80 rounded-lg text-emerald-600">
                   <MapPin className="w-5 h-5" />
                </div>
                <div>
                   <div className="text-xs text-slate-500 font-bold uppercase">Start</div>
                   <div className="font-bold text-slate-900">{itinerary.startLocation.name}</div>
                </div>
             </div>
           )}
        </div>

        <div className="flex gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-200/50">
           <button className="flex-1 md:flex-none text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-white/50 border border-slate-300/50 px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
             <Share2 className="w-4 h-4" />
             Share
           </button>
           <button className="flex-1 md:flex-none text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:translate-y-0">
             <Calendar className="w-4 h-4" />
             Save to Calendar
           </button>
        </div>
      </div>
    </div>
  );
};