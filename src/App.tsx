import React, { useState, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import type { MapViewHandle } from './components/MapView';
import { PriceModal } from './components/PriceModal';
import type { Bar, CityLocation } from './types';

const DEFAULT_CACOAL: CityLocation = {
  name: 'Cacoal, RO',
  latitude: -11.4386,
  longitude: -61.4472,
};

export const App: React.FC = () => {
  const [currentCity, setCurrentCity] = useState<CityLocation>(DEFAULT_CACOAL);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const mapRef = useRef<MapViewHandle>(null);

  const handlePriceReportSuccess = () => {
    // Força o mapa a recarregar e atualizar as médias na hora
    mapRef.current?.reloadBars();
    setToastMessage('Preço enviado e média recalculada com sucesso!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        currentCity={currentCity.name}
        onCityChange={(newLoc) => setCurrentCity(newLoc)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 space-y-4">
        {toastMessage && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm font-medium rounded-lg shadow-sm">
            ✓ {toastMessage}
          </div>
        )}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              Bares e Preços em {currentCity.name}
            </h2>
            <p className="text-xs text-gray-500">
              Explore os bares locais, compare médias ou digite qualquer cidade do país na barra superior para navegar.
            </p>
          </div>

          <MapView
            ref={mapRef}
            center={[currentCity.latitude, currentCity.longitude]}
            onSelectBar={(bar) => setSelectedBar(bar)}
          />
        </div>
      </main>

      {selectedBar && (
        <PriceModal
          bar={selectedBar}
          onClose={() => setSelectedBar(null)}
          onSuccess={handlePriceReportSuccess}
        />
      )}
    </div>
  );
};

export default App;