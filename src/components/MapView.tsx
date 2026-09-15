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