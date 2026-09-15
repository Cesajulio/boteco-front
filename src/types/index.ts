export interface Bar {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  averageBeerPrice: number;
  averageDrinkPrice: number;
  averageWaterPrice: number;
}

export interface PriceReportInput {
  productId: string;
  price: number;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  correlationId?: string;
}

export interface CityLocation {
  name: string;
  latitude: number;
  longitude: number;
}