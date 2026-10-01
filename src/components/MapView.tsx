import React, { useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Bar } from '../types';
import { getNearbyBars } from '../api/bars';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.Icon.Default as unknown as {
  prototype: { _getIconUrl?: () => string };
  mergeOptions: (options: Record<string, string>) => void;
};

delete DefaultIcon.prototype._getIconUrl;
DefaultIcon.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
};

export interface MapViewHandle {
  reloadBars: () => void;
}

interface MapViewProps {
  center: [number, number];
  onSelectBar: (bar: Bar) => void;
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(({ center, onSelectBar }, ref) => {
  const [bars, setBars] = useState<Bar[]>([]);

  const fetchBars = useCallback(() => {
    getNearbyBars(center[0], center[1])
      .then((data) => setBars([...data]))
      .catch((err: unknown) => console.error('Erro ao buscar bares:', err));
  }, [center]);

  useImperativeHandle(ref, () => ({
    reloadBars: () => {
      fetchBars();
    },
  }));

  useEffect(() => {
    fetchBars();
  }, [fetchBars]);

  return (
    <div className="w-full h-[620px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <MapContainer center={center} zoom={14} className="w-full h-full">
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bars.map((bar) => (
          <Marker
            key={`${bar.id}-${bar.averageBeerPrice}-${bar.averageDrinkPrice}-${bar.averageWaterPrice}`}
            position={[bar.latitude, bar.longitude]}
          >
            <Popup>
              <div className="p-1 min-w-[210px] space-y-2">
                <h3 className="font-bold text-base text-gray-800">{bar.name}</h3>
                <p className="text-xs text-gray-500 leading-tight">{bar.address}</p>
                <div className="border-t pt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">🍺 Cerveja:</span>
                    <strong className="text-amber-700">R$ {bar.averageBeerPrice.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">🍹 Drink:</span>
                    <strong className="text-purple-700">R$ {bar.averageDrinkPrice.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">💧 Água:</span>
                    <strong className="text-blue-700">R$ {bar.averageWaterPrice.toFixed(2)}</strong>
                  </div>
                </div>

                {(bar.attractions || bar.instagram) && (
                  <div className="border-t pt-2 space-y-2 mt-2">
                    {bar.attractions && bar.attractions.length > 0 && (
                      <div>
                        <span className="text-gray-600 text-[10px] font-semibold block mb-1 uppercase tracking-wider">🎉 Atrações:</span>
                        <div className="flex flex-wrap gap-1">
                          {bar.attractions.map(attr => (
                            <span key={attr} className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded-md font-bold border border-purple-200">
                              {attr}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {bar.instagram && (
                      <div>
                        <a 
                          href={`https://instagram.com/${bar.instagram.replace('@', '')}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700 text-[11px] font-bold flex items-center gap-1 w-max transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                          {bar.instagram}
                        </a>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => onSelectBar(bar)}
                  className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1.5 px-3 rounded text-xs transition"
                >
                  Reportar Preço Pago
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
});

MapView.displayName = 'MapView';