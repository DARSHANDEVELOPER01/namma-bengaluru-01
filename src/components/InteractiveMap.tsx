import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint } from '../types';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface InteractiveMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  draggableMarker?: boolean;
  selectedLat?: number;
  selectedLng?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  complaints?: Complaint[];
  onSelectComplaint?: (complaint: Complaint) => void;
  height?: string;
  showGoogleMapsButton?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  centerLat = 12.9716, // Bengaluru Vidhana Soudha coordinates
  centerLng = 77.5946,
  zoom = 13,
  draggableMarker = false,
  selectedLat,
  selectedLng,
  onLocationSelect,
  complaints = [],
  onSelectComplaint,
  height = '360px',
  showGoogleMapsButton = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const complaintLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: zoom,
      scrollWheelZoom: true,
    });

    // Dark high-contrast OpenStreetMap carto tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    complaintLayerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Click on map to select location if enabled
    if (onLocationSelect) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update selected point marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedLat && selectedLng) {
      const pos: L.LatLngTuple = [selectedLat, selectedLng];

      const pinIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #EF4444, #B91C1C);
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(239, 68, 68, 0.6);
            border: 2px solid #FFFFFF;
          ">
            <div style="
              width: 12px;
              height: 12px;
              background-color: #FCD116;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      if (!markerRef.current) {
        const marker = L.marker(pos, {
          draggable: draggableMarker,
          icon: pinIcon,
        }).addTo(map);

        if (draggableMarker && onLocationSelect) {
          marker.on('dragend', () => {
            const latlng = marker.getLatLng();
            onLocationSelect(latlng.lat, latlng.lng);
          });
        }

        markerRef.current = marker;
      } else {
        markerRef.current.setLatLng(pos);
        if (draggableMarker) markerRef.current.dragging?.enable();
      }

      map.panTo(pos);
    }
  }, [selectedLat, selectedLng, draggableMarker, onLocationSelect]);

  // Render Complaints Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = complaintLayerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    complaints.forEach((comp) => {
      if (!comp.latitude || !comp.longitude) return;

      const isCompleted = comp.status === 'Completed' || comp.status === 'Reward Paid';
      const isInProgress = comp.status === 'Cleaning in Progress';
      const isApproved = comp.status === 'Approved' || comp.status === 'Assigned to Field Staff';

      const color = isCompleted ? '#10B981' : isInProgress ? '#3B82F6' : isApproved ? '#F59E0B' : '#EF4444';

      const markerIcon = L.divIcon({
        className: 'complaint-pin-marker',
        html: `
          <div style="
            background: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px ${color}80;
            border: 2px solid #FFFFFF;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            <span style="font-size: 11px; font-weight: 800; color: #FFFFFF;">
              ${comp.severity === 'Critical' ? '!' : '●'}
            </span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([comp.latitude, comp.longitude], { icon: markerIcon });

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 180px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #0F172A; font-size: 12px;">${comp.id}</strong>
            <span style="background: ${color}20; color: ${color}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
              ${comp.status}
            </span>
          </div>
          <p style="margin: 0 0 6px; font-size: 11px; color: #475569;">${comp.address}</p>
          <div style="font-size: 11px; font-weight: 600; color: #059669;">Reward: ₹${comp.rewardAmount || 150}</div>
        </div>
      `);

      if (onSelectComplaint) {
        marker.on('click', () => {
          onSelectComplaint(comp);
        });
      }

      layerGroup.addLayer(marker);
    });
  }, [complaints, onSelectComplaint]);

  // Locate User Browser Button
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
        }
        if (onLocationSelect) {
          onLocationSelect(latitude, longitude);
        }
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const targetLat = selectedLat || centerLat;
  const targetLng = selectedLng || centerLng;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-900">
      <div ref={mapContainerRef} style={{ height }} className="w-full z-10" />

      {/* Floating Control Toolbar */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleLocateMe}
          title="Center on My GPS Location"
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 hover:bg-amber-600 text-white rounded-lg shadow-lg backdrop-blur-md border border-slate-700 text-xs font-semibold transition"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-400" />
          <span>My GPS</span>
        </button>

        {showGoogleMapsButton && (
          <a
            href={`https://www.google.com/maps?q=${targetLat},${targetLng}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/90 hover:bg-blue-500 text-white rounded-lg shadow-lg backdrop-blur-md text-xs font-semibold transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Google Maps</span>
          </a>
        )}
      </div>

      {/* Coordinate Pill in corner */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-md border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-amber-400" />
        <span>
          {targetLat.toFixed(4)}, {targetLng.toFixed(4)}
        </span>
      </div>
    </div>
  );
};
