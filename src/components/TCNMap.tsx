"use client"
import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import 'ol/ol.css';
import { Label } from '../components/ui/label';

const Fixed_Zoom = 12;

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const [currentLayer, setCurrentLayer] = useState<'osm' | 'satellite'>('osm');

  useEffect(() => {
    if (!mapRef.current) return;

    // Convert coordinates to Web Mercator projection
    const centerCoordinates = fromLonLat([-96.091838, 56.244399]);

    const satelliteLayer = new TileLayer({
        source: new XYZ({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 16,
        }),
        visible: currentLayer === 'satellite',
      });

    // Create layers
    const osmLayer = new TileLayer({
      source: new OSM(),
      visible: currentLayer === 'osm',
    });

    // Create the map instance
    const map = new Map({
      target: mapRef.current,
      layers: [satelliteLayer, osmLayer],
      view: new View({
        center: centerCoordinates,
        zoom: Fixed_Zoom,
      }),
    });

    mapInstanceRef.current = map;

    // Update layer visibility when currentLayer changes
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
        mapInstanceRef.current = null;
      }
    };
  }, [currentLayer]);

  // Handle layer change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const layers = mapInstanceRef.current.getLayers().getArray();
    const [satelliteLayer, osmLayer] = layers;

    osmLayer.setVisible(currentLayer === 'osm');
    satelliteLayer.setVisible(currentLayer === 'satellite');
  }, [currentLayer]);

  return (
    <div className="w-9/10 lg:w-1/2">
      <div className="flex items-center">
        <Label className="text-sm font-medium">Map Type:</Label>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentLayer('osm')}
            className={`px-3 py-1 rounded ${
              currentLayer === 'osm' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => setCurrentLayer('satellite')}
            className={`px-3 py-1 rounded ${
              currentLayer === 'satellite' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-[30vh] lg:h-[60vh] border border-gray-300 rounded-lg"
        data-testid="map-container"
      />
    </div>
  );
};

export default MapComponent;