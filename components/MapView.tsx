import React, { useEffect, useRef } from 'react';
import { TripItinerary, SegmentType } from '../types';

// Declare Leaflet global type
declare global {
  const L: any;
}

interface MapViewProps {
  itinerary: TripItinerary;
}

export const MapView: React.FC<MapViewProps> = ({ itinerary }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
      console.error("Leaflet not loaded");
      return;
    }

    const map = L.map(mapContainerRef.current).setView([39.8283, -98.5795], 4);

    // Using CartoDB Voyager tiles for a clean, modern look that matches the app theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Polyline
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current || !itinerary) return;

    const map = mapInstanceRef.current;
    const layers = layerGroupRef.current;
    
    // Clear previous layers
    layers.clearLayers();

    const latLngs: [number, number][] = [];

    // Helper to add markers
    const addMarker = (lat: number, lng: number, title: string, type: string, description: string) => {
      let color = '#64748b'; // Slate default
      let radius = 6;
      let zIndexOffset = 0;

      switch (type) {
        case 'START':
           color = '#10b981'; // Emerald
           radius = 9;
           zIndexOffset = 1000;
           break;
        case SegmentType.VISIT:
           color = '#ef4444'; // Red
           radius = 8;
           zIndexOffset = 500;
           break;
        case SegmentType.OVERNIGHT:
           color = '#6366f1'; // Indigo
           radius = 8;
           zIndexOffset = 400;
           break;
        case SegmentType.BREAK:
           color = '#f59e0b'; // Amber
           radius = 5;
           break;
      }

      const marker = L.circleMarker([lat, lng], {
        radius: radius,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1,
        zIndexOffset: zIndexOffset
      }).addTo(layers);

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; min-width: 150px;">
          <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #1e293b;">${title}</h3>
          ${type !== 'START' ? `<div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${color}; margin-bottom: 4px;">${type}</div>` : ''}
          <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.4;">${description}</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      latLngs.push([lat, lng]);
    };

    // Add Start Location
    if (itinerary.startLocation?.coordinates) {
       const { latitude, longitude } = itinerary.startLocation.coordinates;
       addMarker(latitude, longitude, itinerary.startLocation.name, 'START', 'Starting Point');
    }

    // Add Itinerary Segments
    itinerary.days.forEach(day => {
      day.segments.forEach(segment => {
        if (segment.coordinates && (segment.type !== SegmentType.DRIVE || segment.locationName)) {
           const { latitude, longitude } = segment.coordinates;
           addMarker(latitude, longitude, segment.locationName || segment.description, segment.type, segment.description);
        }
      });
    });

    // Draw Route Polyline
    if (latLngs.length > 1) {
      // Create a polyline connecting the points
      const polyline = L.polyline(latLngs, { 
          color: '#6366f1', // Indigo
          weight: 5, 
          opacity: 0.9, 
          lineCap: 'round',
          lineJoin: 'round'
      }).addTo(layers);
      
      // Fit bounds with padding
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    } else if (latLngs.length === 1) {
       map.setView(latLngs[0], 11);
    }

  }, [itinerary]);

  return (
    <div className="h-[500px] xl:h-full w-full bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-inner relative z-0 isolate">
       <div ref={mapContainerRef} className="w-full h-full z-10 outline-none" style={{ background: '#f8fafc' }} />
    </div>
  );
};