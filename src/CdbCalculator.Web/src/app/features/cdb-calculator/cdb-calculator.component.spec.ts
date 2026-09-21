import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdbCalculatorComponent } from './cdb-calculator.component';
import { CdbCalculatorService, ApiErrorResult } from './cdb-calculator.service';
import { CalculateCdbResponse } from './cdb.models';
import { of, throwError } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

registerLocaleData(localePt);

describe('CdbCalculatorComponent', () => {
  let component: CdbCalculatorComponent;
  let fixture: ComponentFixture<CdbCalculatorComponent>;
  let mockCdbService: { calculate: ReturnType<typeof vi.fn> };

  const successResponse: CalculateCdbResponse = {
    grossAmount: 1123.08,
    incomeTax: 24.62,
    netAmount: 1098.47
  };

  beforeEach(async () => {
    mockCdbService = {
      calculate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CdbCalculatorComponent],
      providers: [
        { provide: CdbCalculatorService, useValue: mockCdbService },
        { provide: LOCALE_ID, useValue: 'pt-BR' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CdbCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with an invalid and empty form', () => {
    expect(component).toBeTruthy();
    expect(component.form.valid).toBe(false);
    expect(component.form.get('initialAmount')?.value).toBeNull();
    expect(component.form.get('termInMonths')?.value).toBeNull();
  });

  it('should invalidate initialAmount <= 0', () => {
    const amountControl = component.form.get('initialAmount');

    amountControl?.setValue(0);
    expect(amountControl?.valid).toBe(false);
    expect(amountControl?.hasError('min')).toBe(true);

    amountControl?.setValue(-50);
    expect(amountControl?.valid).toBe(false);
    expect(amountControl?.hasError('min')).toBe(true);

    amountControl?.setValue(100);
    expect(amountControl?.valid).toBe(true);
  });

  it('should invalidate initialAmount exceeding maximum limit', () => {
    const amountControl = component.form.get('initialAmount');

    amountControl?.setValue(100_000_000.01);
    expect(amountControl?.valid).toBe(false);
    expect(amountControl?.hasError('max')).toBe(true);
    amountControl?.markAsTouched();

    expect(component.getFieldError('initialAmount')).toContain('100.000.000,00');
  });

  it('should invalidate termInMonths <= 1', () => {
    const termControl = component.form.get('termInMonths');

    termControl?.setValue(1);
    expect(termControl?.valid).toBe(false);
    expect(termControl?.hasError('min')).toBe(true);

    termControl?.setValue(0);
    expect(termControl?.valid).toBe(false);

    termControl?.setValue(2);
    expect(termControl?.valid).toBe(true);
  });

  it('should invalidate termInMonths exceeding the 360-month business limit', () => {
    const termControl = component.form.get('termInMonths');

    termControl?.setValue(361);
    expect(termControl?.valid).toBe(false);
    expect(termControl?.hasError('max')).toBe(true);
    termControl?.markAsTouched();

    expect(component.getFieldError('termInMonths')).toContain('360 meses');
  });

  it('should invalidate non-integer patterns for termInMonths', () => {
    const termControl = component.form.get('termInMonths');

    termControl?.setValue('12.5');
    termControl?.markAsDirty();
    termControl?.markAsTouched();

    expect(termControl?.hasError('pattern')).toBe(true);
    expect(component.getFieldError('termInMonths')).toContain('sem decimais');
  });

  it('should validate form when valid boundaries are supplied', () => {
    component.form.setValue({
      initialAmount: 1000,
      termInMonths: 12
    });

    expect(component.form.valid).toBe(true);
  });

  it('should submit calculation and update reactive signals on API success', () => {
    mockCdbService.calculate.mockReturnValue(of(successResponse));

    component.form.setValue({
      initialAmount: 1000,
      termInMonths: 12
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(mockCdbService.calculate).toHaveBeenCalledWith({ initialAmount: 1000, termInMonths: 12 });
    expect(component.calculationResult()).toEqual(successResponse);
    expect(component.grossYield()).toBeCloseTo(123.08, 2);
    expect(component.netYield()).toBeCloseTo(98.47, 2);
    expect(component.effectiveTaxRate()).toBeCloseTo(20.0, 1);
    expect(component.isLoading()).toBe(false);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#resultado-liquido-valor')?.textContent).toContain('1.098,47');
    expect(compiled.querySelector('#resultado-bruto-valor')?.textContent).toContain('1.123,08');
  });

  it('should map ProblemDetails 400 validation errors to form controls', () => {
    const problemError: ApiErrorResult = {
      isProblemDetails: true,
      status: 400,
      message: 'Uma ou mais validações falharam.',
      problemDetails: {
        title: 'Uma ou mais validações falharam.',
        status: 400,
        errors: {
          InitialAmount: ['O valor inicial deve ser maior que zero.'],
          TermInMonths: ['O prazo deve ser maior que um mês.']
        }
      }
    };

    mockCdbService.calculate.mockReturnValue(throwError(() => problemError));

    component.form.setValue({
      initialAmount: 500,
      termInMonths: 6
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.form.get('initialAmount')?.hasError('serverError')).toBe(true);
    expect(component.getFieldError('initialAmount')).toBe('O valor inicial deve ser maior que zero.');
    expect(component.form.get('termInMonths')?.hasError('serverError')).toBe(true);
    expect(component.getFieldError('termInMonths')).toBe('O prazo deve ser maior que um mês.');
  });

  it('should display general error banner on generic server 500 failure', () => {
    const genericError: ApiErrorResult = {
      isProblemDetails: false,
      status: 500,
      message: 'Ocorreu um erro interno no servidor ao processar o cálculo.'
    };

    mockCdbService.calculate.mockReturnValue(throwError(() => genericError));

    component.form.setValue({
      initialAmount: 1000,
      termInMonths: 12
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.generalError()).toBe('Ocorreu um erro interno no servidor ao processar o cálculo.');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.general-error-banner')?.textContent).toContain('erro interno no servidor');
  });

  it('should display general error when ProblemDetails has no field-specific errors', () => {
    const problemError: ApiErrorResult = {
      isProblemDetails: true,
      status: 400,
      message: 'Regra de negócio violada.',
      problemDetails: {
        title: 'Regra de negócio violada.',
        status: 400,
        errors: {}
      }
    };

    mockCdbService.calculate.mockReturnValue(throwError(() => problemError));

    component.form.setValue({
      initialAmount: 1000,
      termInMonths: 12
    });

    component.onSubmit();
    fixture.detectChanges();

    expect(component.generalError()).toBe('Regra de negócio violada.');
  });

  it('should reset form and results on onReset', () => {
    component.calculationResult.set(successResponse);
    component.form.setValue({ initialAmount: 1000, termInMonths: 12 });

    component.onReset();
    fixture.detectChanges();

    expect(component.form.get('initialAmount')?.value).toBeNull();
    expect(component.calculationResult()).toBeNull();
    expect(component.generalError()).toBeNull();
  });

  it('should reset calculationResult when form inputs are modified', () => {
    component.calculationResult.set(successResponse);
    expect(component.calculationResult()).not.toBeNull();

    component.form.get('initialAmount')?.setValue(2000);
    fixture.detectChanges();

    expect(component.calculationResult()).toBeNull();
  });

  it('should handle onTermKeyDown blocking non-digit characters and limiting length to 3', () => {
    const letterEvent = new KeyboardEvent('keydown', { key: 'e', cancelable: true });
    component.onTermKeyDown(letterEvent);
    expect(letterEvent.defaultPrevented).toBe(true);

    const minusEvent = new KeyboardEvent('keydown', { key: '-', cancelable: true });
    component.onTermKeyDown(minusEvent);
    expect(minusEvent.defaultPrevented).toBe(true);

    const digitEvent = new KeyboardEvent('keydown', { key: '5', cancelable: true });
    component.onTermKeyDown(digitEvent);
    expect(digitEvent.defaultPrevented).toBe(false);

    component.form.get('termInMonths')?.setValue('360');
    const fourthDigitEvent = new KeyboardEvent('keydown', { key: '0', cancelable: true });
    component.onTermKeyDown(fourthDigitEvent);
    expect(fourthDigitEvent.defaultPrevented).toBe(true);
  });
});
