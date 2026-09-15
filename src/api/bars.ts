import { api } from './client';
import type { Bar, PriceReportInput } from '../types';

// Banco de dados simulado em memória local
let IN_MEMORY_BARS: Bar[] = [
  {
    id: 'bar-cacoal-01',
    name: 'Boteco do Chopp Cacoal',
    address: 'Av. Porto Velho, 1200 - Centro, Cacoal - RO',
    latitude: -11.4386,
    longitude: -61.4472,
    averageBeerPrice: 12.0,
    averageDrinkPrice: 20.0,
    averageWaterPrice: 4.5,
  },
  {
    id: 'bar-cacoal-02',
    name: 'Espetinho Universitário',
    address: 'R. Antônio Deodato Durce, 850 - Teixeirão, Cacoal - RO',
    latitude: -11.4325,
    longitude: -61.4398,
    averageBeerPrice: 10.5,
    averageDrinkPrice: 18.0,
    averageWaterPrice: 4.0,
  },
  {
    id: 'bar-cacoal-03',
    name: 'Ponto do Guaraná & Petiscos',
    address: 'Av. Dois de Junho, 2100 - Centro, Cacoal - RO',
    latitude: -11.4421,
    longitude: -61.4515,
    averageBeerPrice: 13.0,
    averageDrinkPrice: 22.0,
    averageWaterPrice: 5.0,
  },
];

// Contador de reportes para cálculo de média ponderada simulada
const reportCounters: Record<string, Record<string, number>> = {};

export const getNearbyBars = async (lat: number, lng: number, radiusKm: number = 5): Promise<Bar[]> => {
  try {
    const response = await api.get<Bar[]>('/bars', {
      params: { lat, lng, radius: radiusKm },
    });
    return response.data;
  } catch {
    // Se mudou para uma cidade diferente de Cacoal, gera pontos dinâmicos no local
    const isCloseToCacoal = Math.abs(lat - (-11.4386)) < 0.1 && Math.abs(lng - (-61.4472)) < 0.1;

    if (!isCloseToCacoal && !IN_MEMORY_BARS.some(b => Math.abs(b.latitude - lat) < 0.05)) {
      IN_MEMORY_BARS = [
        {
          id: `bar-local-01`,
          name: 'Bar & Choperia da Orla / Centro',
          address: 'Avenida Principal - Ponto Turístico',
          latitude: lat + 0.002,
          longitude: lng + 0.002,
          averageBeerPrice: 14.0,
          averageDrinkPrice: 25.0,
          averageWaterPrice: 6.0,
        },
        {
          id: `bar-local-02`,
          name: 'Boteco Tradicional da Esquina',
          address: 'Rua Comercial, 450',
          latitude: lat - 0.003,
          longitude: lng - 0.003,
          averageBeerPrice: 11.5,
          averageDrinkPrice: 19.0,
          averageWaterPrice: 4.5,
        },
      ];
    }

    return [...IN_MEMORY_BARS];
  }
};

export const submitPriceReport = async (barId: string, data: PriceReportInput): Promise<void> => {
  try {
    await api.post(`/bars/${barId}/prices`, data);
  } catch {
    // Recalcula a média matemática simulada na memória
    const bar = IN_MEMORY_BARS.find(b => b.id === barId);
    if (!bar) return;

    if (!reportCounters[barId]) {
      reportCounters[barId] = { 'cerveja-600': 1, 'caipirinha': 1, 'agua-500': 1, 'long-neck': 1 };
    }

    const currentCount = reportCounters[barId][data.productId] || 1;
    reportCounters[barId][data.productId] = currentCount + 1;

    if (data.productId === 'cerveja-600' || data.productId === 'long-neck') {
      bar.averageBeerPrice = Number(((bar.averageBeerPrice * currentCount + data.price) / (currentCount + 1)).toFixed(2));
    } else if (data.productId === 'caipirinha') {
      bar.averageDrinkPrice = Number(((bar.averageDrinkPrice * currentCount + data.price) / (currentCount + 1)).toFixed(2));
    } else if (data.productId === 'agua-500') {
      bar.averageWaterPrice = Number(((bar.averageWaterPrice * currentCount + data.price) / (currentCount + 1)).toFixed(2));
    }
  }
};