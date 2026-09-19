import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ApiConfig {
  baseUrl: string;
  calculateCdbEndpoint: string;
}

export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: environment.apiUrl,
  calculateCdbEndpoint: '/api/cdb/calculate'
};

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_API_CONFIG
});
