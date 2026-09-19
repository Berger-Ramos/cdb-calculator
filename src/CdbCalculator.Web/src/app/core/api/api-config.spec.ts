import { TestBed } from '@angular/core/testing';
import { API_CONFIG, DEFAULT_API_CONFIG } from './api-config';
import { describe, it, expect } from 'vitest';

describe('API_CONFIG', () => {
  it('deve fornecer a configuração padrão via token de injeção', () => {
    TestBed.configureTestingModule({});
    const config = TestBed.inject(API_CONFIG);

    expect(config).toBeDefined();
    expect(config.calculateCdbEndpoint).toBe('/api/cdb/calculate');
    expect(config.baseUrl).toBe(DEFAULT_API_CONFIG.baseUrl);
  });
});
