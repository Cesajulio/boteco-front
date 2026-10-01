import React, { useState, useEffect, useRef } from 'react';
import { searchBars } from '../api/bars';
import type { Bar } from '../types';

interface BarSearchProps {
  onSelectBar: (bar: Bar) => void;
}

export const BarSearch: React.FC<BarSearchProps> = ({ onSelectBar }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Click outside to close dropdown
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const bars = await searchBars(query);
        setResults(bars);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (bar: Bar) => {
    setQuery('');
    setShowDropdown(false);
    onSelectBar(bar);
  };

  return (
    <div ref={wrapperRef} className="relative w-72">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar bar pelo nome..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          className="w-full px-3 py-1.5 rounded-lg text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-3 w-3 border-2 border-amber-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((bar) => (
            <li
              key={bar.id}
              onClick={() => handleSelect(bar)}
              className="px-3 py-2 cursor-pointer hover:bg-amber-50 border-b border-gray-100 last:border-0"
            >
              <div className="text-sm font-bold text-gray-800">{bar.name}</div>
              <div className="text-[10px] text-gray-500 line-clamp-1">{bar.address}</div>
            </li>
          ))}
        </ul>
      )}

      {showDropdown && query.trim() && !loading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500 text-center">
          Nenhum bar encontrado.
        </div>
      )}
    </div>
  );
};
