import React, { useState } from 'react';
import axios from 'axios';
import type { CityLocation } from '../types';

interface NavbarProps {
  currentCity: string;
  onCityChange: (location: CityLocation) => void;
}

interface NominatimPlace {
  display_name: string;
  lat: string;
  lon: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentCity, onCityChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearching(true);
    try {
      const response = await axios.get<NominatimPlace[]>(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: `${searchTerm}, Brasil`,
            format: 'json',
            limit: 1,
          },
        }
      );

      if (response.data && response.data.length > 0) {
        const place = response.data[0];
        onCityChange({
          name: place.display_name.split(',')[0],
          latitude: parseFloat(place.lat),
          longitude: parseFloat(place.lon),
        });
        setSearchTerm('');
      } else {
        alert('Cidade não encontrada. Tente informar o estado (Ex: Ji-Paraná, RO).');
      }
    } catch (err: unknown) {
      console.error('Erro ao buscar localidade:', err);
      alert('Falha ao conectar com o serviço de busca de mapas.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <header className="bg-amber-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🍺</span>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none">BotecoIndex</h1>
            <p className="text-[11px] text-amber-100 font-medium">
              Local: <span className="font-bold underline">{currentCity}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Mudar cidade (ex: Cacoal, Vilhena, Curitiba)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 w-72"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition"
          >
            {searching ? 'Buscando...' : 'Ir'}
          </button>
        </form>
      </div>
    </header>
  );
};