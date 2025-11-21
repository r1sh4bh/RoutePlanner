import React, { useEffect, useRef } from 'react';
import { TripItinerary, SegmentType } from '../types';

declare global {
  interface Window {
    L: any;
  }
}

interface MapViewProps {
  itinerary: TripItinerary;
}

export const MapView: React.FC<MapViewProps> = ({ itinerary }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false // We will add it in a specific position if needed, or default is top-left
      }).setView([0, 0], 2);
      
      window.L.control.zoom({ position: 'topleft' }).addTo(map);

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Optional cleanup if needed
    };
  }, []);

  // 2. Handle Resize to fix "grey map" issues
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // This is critical: Leaflet needs to know when its container changes size
      // to calculate tiles and centers correctly.
      mapInstanceRef.current.invalidateSize();
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 3. Update Markers and Path
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing layers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
    }

    // Collect points
    const points: any[] = [];
    const bounds = window.L.latLngBounds([]);

    // Start Location
    if (itinerary.startLocation && itinerary.startLocation.coordinates) {
      const { latitude, longitude } = itinerary.startLocation.coordinates;
      const latLng = [latitude, longitude];
      points.push(latLng);
      bounds.extend(latLng);

      const startIcon = window.L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = window.L.marker(latLng, { icon: startIcon })
        .bindPopup(`<div class="font-sans font-bold p-2 text-sm text-slate-800">${itinerary.startLocation.name} <span class="text-emerald-600 font-normal">(Start)</span></div>`)
        .addTo(map);
      markersRef.current.push(marker);
    }

    // Segments
    itinerary.days.forEach((day) => {
      day.segments.forEach((segment) => {
        if (segment.coordinates && (segment.type !== SegmentType.DRIVE || segment.locationName)) {
           const { latitude, longitude } = segment.coordinates;
           const latLng = [latitude, longitude];
           
           // Don't add duplicates to line if they are too close (optional optimization, skip for now)
           points.push(latLng);
           bounds.extend(latLng);

           let color = '#64748b';
           let size = 12;
           let zIndex = 0;

           switch (segment.type) {
             case SegmentType.VISIT:
               color = '#ef4444';
               size = 16;
               zIndex = 100;
               break;
             case SegmentType.OVERNIGHT:
               color = '#6366f1';
               size = 16;
               zIndex = 90;
               break;
             case SegmentType.BREAK:
               color = '#f59e0b';
               size = 12;
               break;
             default:
               color = '#94a3b8';
           }

           const markerHtml = `
             <div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
           `;

           const icon = window.L.divIcon({
             className: 'custom-div-icon',
             html: markerHtml,
             iconSize: [size, size],
             iconAnchor: [size/2, size/2]
           });

           // Enhance Popup Content
           const durationText = segment.durationHours > 0 
             ? (segment.durationHours < 1 
                ? `${Math.round(segment.durationHours * 60)} min` 
                : `${segment.durationHours} hr`)
             : '';

           const notesBlock = segment.notes 
             ? `<div class="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500 italic">
                  <span class="font-semibold text-indigo-500 not-italic mr-1">Note:</span> ${segment.notes}
                </div>`
             : '';

           const descriptionBlock = (segment.description && segment.description !== segment.locationName)
             ? `<div class="text-xs text-slate-600 mb-2 leading-relaxed">${segment.description}</div>`
             : '';

           // Type badge styling
           let typeStyles = 'text-slate-600 bg-slate-50 border-slate-200';
           if (segment.type === SegmentType.VISIT) typeStyles = 'text-emerald-700 bg-emerald-50 border-emerald-100';
           if (segment.type === SegmentType.OVERNIGHT) typeStyles = 'text-indigo-700 bg-indigo-50 border-indigo-100';
           if (segment.type === SegmentType.BREAK) typeStyles = 'text-amber-700 bg-amber-50 border-amber-100';

           const popupHtml = `
             <div class="font-sans p-1 min-w-[240px]">
               <div class="flex justify-between items-start gap-3 mb-2">
                 <h3 class="font-bold text-slate-800 text-sm leading-snug">${segment.locationName}</h3>
                 <span class="flex-shrink-0 inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${typeStyles}">
                   ${segment.type}
                 </span>
               </div>
               ${descriptionBlock}
               ${durationText ? `
               <div class="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.7"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                 ${durationText} duration
               </div>` : ''}
               ${notesBlock}
             </div>
           `;

           const marker = window.L.marker(latLng, { icon, zIndexOffset: zIndex })
             .bindPopup(popupHtml)
             .addTo(map);
           
           markersRef.current.push(marker);
        }
      });
    });

    // Polyline
    if (points.length > 1) {
      polylineRef.current = window.L.polyline(points, { 
        color: '#6366f1', 
        weight: 4, 
        opacity: 0.8, 
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '1, 6', // optional dashed line style for a road trip feel? maybe solid is better for route. keeping solid but maybe smoother.
        dashOffset: '0'
      }).addTo(map);
      // Reset dashed array to solid for clarity, line styling above was just a thought.
      polylineRef.current.setStyle({ dashArray: null });
    }

    // Fit Bounds with delay to ensure container is ready
    if (points.length > 0) {
       // Small timeout to allow CSS transitions on the container (e.g. split view) to finish slightly
       setTimeout(() => {
          map.invalidateSize(); 
          map.fitBounds(bounds, { padding: [50, 50] });
       }, 100);
    }

  }, [itinerary]);

  return (
    <div className="h-[500px] xl:h-full w-full bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-inner relative z-0 isolate">
       <div ref={mapContainerRef} className="w-full h-full outline-none" />
    </div>
  );
};
