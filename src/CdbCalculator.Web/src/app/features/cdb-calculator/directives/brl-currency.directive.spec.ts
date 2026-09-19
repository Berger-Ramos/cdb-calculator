import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrlCurrencyDirective } from './brl-currency.directive';
import { describe, it, expect, beforeEach } from 'vitest';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, BrlCurrencyDirective],
  template: `
    <input type="text" [formControl]="control" appBrlCurrency [maxAmount]="100000000" />
  `
})
class TestHostComponent {
  public control = new FormControl<number | null>(null);
}

describe('BrlCurrencyDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let inputDebugEl: DebugElement;
  let inputNativeEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    inputDebugEl = fixture.debugElement.query(By.directive(BrlCurrencyDirective));
    inputNativeEl = inputDebugEl.nativeElement;
    fixture.detectChanges();
  });

  it('should initialize with empty input when form control is null', () => {
    expect(inputNativeEl.value).toBe('');
  });

  it('should format initial numeric value to BRL currency string', () => {
    hostComponent.control.setValue(1000.5);
    fixture.detectChanges();

    expect(inputNativeEl.value).toContain('1.000,50');
  });

  it('should format input digits progressively in cents and update control value', () => {
    inputNativeEl.value = '100050';
    inputNativeEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(inputNativeEl.value).toContain('1.000,50');
    expect(hostComponent.control.value).toBe(1000.50);
  });

  it('should clear control value when input is emptied', () => {
    hostComponent.control.setValue(500);
    fixture.detectChanges();

    inputNativeEl.value = '';
    inputNativeEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(hostComponent.control.value).toBeNull();
    expect(inputNativeEl.value).toBe('');
  });

  it('should block non-numeric characters on keydown', () => {
    const letterEvent = new KeyboardEvent('keydown', { key: 'a', cancelable: true });
    inputNativeEl.dispatchEvent(letterEvent);
    expect(letterEvent.defaultPrevented).toBe(true);

    const minusEvent = new KeyboardEvent('keydown', { key: '-', cancelable: true });
    inputNativeEl.dispatchEvent(minusEvent);
    expect(minusEvent.defaultPrevented).toBe(true);

    const digitEvent = new KeyboardEvent('keydown', { key: '5', cancelable: true });
    inputNativeEl.dispatchEvent(digitEvent);
    expect(digitEvent.defaultPrevented).toBe(false);
  });

  it('should clamp value to maxAmount when typing exceeds limit', () => {
    inputNativeEl.value = '99999999999999';
    inputNativeEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(hostComponent.control.value).toBe(100000000);
    expect(inputNativeEl.value).toContain('100.000.000,00');
  });

  it('should handle paste events stripping non-digit characters', () => {
    const mockPasteEvent = {
      preventDefault: () => {},
      clipboardData: {
        getData: (type: string) => 'R$ 2.500,75'
      }
    } as unknown as ClipboardEvent;

    inputDebugEl.triggerEventHandler('paste', mockPasteEvent);
    fixture.detectChanges();

    expect(hostComponent.control.value).toBe(2500.75);
    expect(inputNativeEl.value).toContain('2.500,75');
  });

  it('should call onTouched on blur', () => {
    expect(hostComponent.control.touched).toBe(false);
    inputNativeEl.dispatchEvent(new Event('blur'));
    expect(hostComponent.control.touched).toBe(true);
  });

  it('should respect disabled state from FormControl', () => {
    hostComponent.control.disable();
    fixture.detectChanges();
    expect(inputNativeEl.disabled).toBe(true);

    hostComponent.control.enable();
    fixture.detectChanges();
    expect(inputNativeEl.disabled).toBe(false);
  });
});
