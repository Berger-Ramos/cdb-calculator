import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  Input,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appBrlCurrency]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BrlCurrencyDirective),
      multi: true
    }
  ]
})
export class BrlCurrencyDirective implements ControlValueAccessor {
  private readonly elementRef: ElementRef<HTMLInputElement> = inject(ElementRef);

  @Input() public maxAmount: number = 100_000_000.00;

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private isDisabled = false;

  public writeValue(value: number | null): void {
    const inputElement = this.elementRef.nativeElement;
    if (value === null || value === undefined || isNaN(value)) {
      inputElement.value = '';
      return;
    }

    inputElement.value = this.formatCurrency(value);
  }

  public registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.elementRef.nativeElement.disabled = isDisabled;
  }

  @HostListener('input', ['$event'])
  public onInput(event: Event): void {
    const inputElement = this.elementRef.nativeElement;
    const rawDigits = inputElement.value.replace(/\D/g, '');

    if (!rawDigits) {
      inputElement.value = '';
      this.onChange(null);
      return;
    }

    const numericValue = parseInt(rawDigits, 10) / 100;

    if (numericValue > this.maxAmount) {
      // Revert to max or previous valid string
      inputElement.value = this.formatCurrency(this.maxAmount);
      this.onChange(this.maxAmount);
      return;
    }

    inputElement.value = this.formatCurrency(numericValue);
    this.onChange(numericValue);
  }

  @HostListener('keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ];

    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    // Allow only numeric digits 0-9
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    // Check if adding next digit would exceed maxAmount length
    const inputElement = this.elementRef.nativeElement;
    const currentDigits = inputElement.value.replace(/\D/g, '');
    const nextDigits = currentDigits + event.key;
    const nextValue = parseInt(nextDigits, 10) / 100;

    if (nextValue > this.maxAmount) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  public onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') || '';
    const cleanDigits = clipboardData.replace(/\D/g, '');

    if (!cleanDigits) return;

    let numericValue = parseInt(cleanDigits, 10) / 100;
    if (numericValue > this.maxAmount) {
      numericValue = this.maxAmount;
    }

    this.elementRef.nativeElement.value = this.formatCurrency(numericValue);
    this.onChange(numericValue);
  }

  @HostListener('blur')
  public onBlur(): void {
    this.onTouched();
  }

  public formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}
