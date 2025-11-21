import React from 'react';
import { TripItinerary, SegmentType, RouteSegment } from '../types';
import { Car, Moon, MapPin, Coffee } from 'lucide-react';

interface TripTimelineProps {
  itinerary: TripItinerary;
}

export const TripTimeline: React.FC<TripTimelineProps> = ({ itinerary }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Days */}
      <div className="space-y-6">
        {itinerary.days.map((day) => (
          <div key={day.dayNumber} className="relative pl-8 md:pl-0">
            {/* Day Connector Line (Desktop) */}
            <div className="hidden md:block absolute left-8 top-16 bottom-0 w-0.5 bg-white/50 -z-10"></div>

            {/* Mobile Connector Line */}
            <div className="md:hidden absolute left-3 top-6 bottom-0 w-0.5 bg-white/50 -z-10"></div>

            <div className="md:flex gap-8">
              {/* Day Indicator */}
              <div className="flex-shrink-0 mb-4 md:mb-0">
                <div className="flex md:flex-col items-center gap-3 md:gap-1 sticky top-24">
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-2xl border-4 border-white/20 shadow-lg z-10">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Day</span>
                    <span className="text-2xl font-black text-indigo-600 leading-none">{day.dayNumber}</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
                    {day.totalDriveHours}h driving
                  </span>
                </div>
              </div>

              {/* Day Content */}
              <div className="flex-grow glass-card rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-white/60 px-6 py-3 border-b border-white/50">
                  <h3 className="font-bold text-slate-800">{day.title}</h3>
                </div>
                <div className="p-6 space-y-6">
                  {day.segments.map((segment, idx) => (
                    <SegmentItem key={idx} segment={segment} isLast={idx === day.segments.length - 1} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* End of Trip */}
      <div className="flex justify-center py-8">
         <div className="flex items-center gap-2 text-white/80 text-sm font-medium drop-shadow-md">
            <div className="h-px w-12 bg-white/50"></div>
            End of Itinerary
            <div className="h-px w-12 bg-white/50"></div>
         </div>
      </div>
    </div>
  );
};

const SegmentItem: React.FC<{ segment: RouteSegment; isLast: boolean }> = ({ segment, isLast }) => {
  const getIcon = () => {
    switch (segment.type) {
      case SegmentType.DRIVE: return <Car className="w-5 h-5 text-blue-500" />;
      case SegmentType.VISIT: return <MapPin className="w-5 h-5 text-emerald-500" />;
      case SegmentType.OVERNIGHT: return <Moon className="w-5 h-5 text-purple-500" />;
      case SegmentType.BREAK: return <Coffee className="w-5 h-5 text-orange-500" />;
      default: return <MapPin className="w-5 h-5 text-slate-500" />;
    }
  };

  const getBgColor = () => {
    switch (segment.type) {
      case SegmentType.DRIVE: return 'bg-blue-50';
      case SegmentType.VISIT: return 'bg-emerald-50';
      case SegmentType.OVERNIGHT: return 'bg-purple-50';
      case SegmentType.BREAK: return 'bg-orange-50';
      default: return 'bg-slate-50';
    }
  };

  return (
    <div className="relative flex gap-4 group">
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-[-24px] w-0.5 bg-slate-200/50 group-hover:bg-slate-300/50 transition-colors"></div>
      )}
      
      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getBgColor()} shadow-sm border border-white`}>
        {getIcon()}
      </div>

      <div className="flex-grow pb-2">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-slate-900 text-lg leading-tight">{segment.locationName || segment.description}</h4>
          <span className="text-xs font-bold text-slate-500 bg-white/50 px-2 py-1 rounded border border-white/50">
            {segment.durationHours < 1 
              ? `${Math.round(segment.durationHours * 60)} min` 
              : `${segment.durationHours} hr`}
          </span>
        </div>
        
        {segment.locationName && segment.description !== segment.locationName && (
             <p className="text-slate-600 mt-1 text-sm">{segment.description}</p>
        )}

        {segment.notes && (
          <div className="mt-2 text-sm text-slate-600 bg-yellow-50/50 p-3 rounded-lg border border-yellow-100/50 italic">
            "{segment.notes}"
          </div>
        )}
      </div>
    </div>
  );
};