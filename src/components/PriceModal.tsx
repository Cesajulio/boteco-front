import React, { useState } from 'react';
import axios from 'axios';
import type { Bar, ProblemDetails } from '../types';
import { submitPriceReport } from '../api/bars';

interface PriceModalProps {
  bar: Bar;
  onClose: () => void;
  onSuccess: () => void;
}

export const PriceModal: React.FC<PriceModalProps> = ({ bar, onClose, onSuccess }) => {
  const [productId, setProductId] = useState('cerveja-600');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await submitPriceReport(bar.id, {
        productId,
        price: parseFloat(price),
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError<ProblemDetails>(err)) {
        const detail = err.response?.data?.detail || 'Erro ao enviar o valor. Tente novamente.';
        setErrorMessage(detail);
      } else {
        setErrorMessage('Erro inesperado ao processar a requisição.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Novo Preço</h2>
          <p className="text-xs text-gray-500">{bar.name}</p>
        </div>

        {errorMessage && (
          <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Item Consumido</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="cerveja-600">Cerveja 600ml</option>
              <option value="long-neck">Long Neck</option>
              <option value="caipirinha">Caipirinha / Drink</option>
              <option value="agua-500">Água Mineral 500ml</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Preço Pago (R$)</label>
            <input
              type="number"
              step="0.10"
              required
              min="0.50"
              max="500.00"
              placeholder="Ex: 14.50"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};