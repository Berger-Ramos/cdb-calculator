import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CdbCalculatorService, ApiErrorResult } from './cdb-calculator.service';
import { ApiCdbResponse, CalculateCdbInput, CalculateCdbResponse } from './cdb.models';
import { API_CONFIG, DEFAULT_API_CONFIG } from '../../core/api/api-config';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('CdbCalculatorService', () => {
  let service: CdbCalculatorService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CdbCalculatorService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: { ...DEFAULT_API_CONFIG, baseUrl: 'http://localhost:58678' } }
      ]
    });

    service = TestBed.inject(CdbCalculatorService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be instantiated properly', () => {
    expect(service).toBeTruthy();
  });

  it('should send POST request and map response correctly on success', () => {
    const input: CalculateCdbInput = { initialAmount: 1000, termInMonths: 12 };
    const mockApiResponse: ApiCdbResponse = {
      grossAmount: 1123.18,
      incomeTax: 24.64,
      netAmount: 1098.54
    };

    let actualResponse: CalculateCdbResponse | undefined;

    service.calculate(input).subscribe(response => {
      actualResponse = response;
    });

    const req = httpTestingController.expectOne('http://localhost:58678/api/cdb/calculate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.initialAmount).toBe(1000);
    expect(req.request.body.termInMonths).toBe(12);

    req.flush(mockApiResponse);

    expect(actualResponse).toEqual({
      grossAmount: 1123.18,
      incomeTax: 24.64,
      netAmount: 1098.54
    });
  });

  it('should catch and normalize HTTP 400 ProblemDetails errors', () => {
    const input: CalculateCdbInput = { initialAmount: 0, termInMonths: 1 };
    const mockProblemDetails = {
      type: 'https://tools.ietf.org/html/rfc7807',
      title: 'One or more validation errors occurred.',
      status: 400,
      errors: {
        InitialAmount: ['Initial amount must be greater than zero.'],
        TermInMonths: ['Term must be greater than one month.']
      }
    };

    let actualError: ApiErrorResult | undefined;

    service.calculate(input).subscribe({
      next: () => {
        expect.fail('Should have failed with error');
      },
      error: (err: ApiErrorResult) => {
        actualError = err;
      }
    });

    const req = httpTestingController.expectOne('http://localhost:58678/api/cdb/calculate');
    req.flush(mockProblemDetails, { status: 400, statusText: 'Bad Request' });

    expect(actualError).toBeDefined();
    expect(actualError?.isProblemDetails).toBe(true);
    expect(actualError?.status).toBe(400);
    expect(actualError?.problemDetails?.errors?.['InitialAmount']).toContain('Initial amount must be greater than zero.');
  });

  it('should catch and normalize generic HTTP 500 server errors', () => {
    const input: CalculateCdbInput = { initialAmount: 1000, termInMonths: 12 };

    let actualError: ApiErrorResult | undefined;

    service.calculate(input).subscribe({
      next: () => {
        expect.fail('Should have failed with error');
      },
      error: (err: ApiErrorResult) => {
        actualError = err;
      }
    });

    const req = httpTestingController.expectOne('http://localhost:58678/api/cdb/calculate');
    req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(actualError).toBeDefined();
    expect(actualError?.isProblemDetails).toBe(false);
    expect(actualError?.status).toBe(500);
    expect(actualError?.message).toContain('erro interno no servidor');
  });

  it('should catch and normalize communication or offline errors', () => {
    const input: CalculateCdbInput = { initialAmount: 1000, termInMonths: 12 };

    let actualError: ApiErrorResult | undefined;

    service.calculate(input).subscribe({
      next: () => {
        expect.fail('Should have failed with error');
      },
      error: (err: ApiErrorResult) => {
        actualError = err;
      }
    });

    const req = httpTestingController.expectOne('http://localhost:58678/api/cdb/calculate');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect(actualError).toBeDefined();
    expect(actualError?.isProblemDetails).toBe(false);
    expect(actualError?.status).toBe(0);
    expect(actualError?.message).toContain('Não foi possível se comunicar');
  });
});
