import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CdbCalculatorService, ApiErrorResult } from './cdb-calculator.service';
import { CalculateCdbInput, CalculateCdbResponse } from './cdb.models';
import { CdbInfoPanelComponent } from './components/cdb-info-panel/cdb-info-panel.component';
import { BrlCurrencyDirective } from './directives/brl-currency.directive';

@Component({
  selector: 'app-cdb-calculator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CdbInfoPanelComponent, BrlCurrencyDirective],
  templateUrl: './cdb-calculator.component.html',
  styleUrl: './cdb-calculator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CdbCalculatorComponent {
  private readonly fb = inject(FormBuilder);
  private readonly cdbService = inject(CdbCalculatorService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly maxInitialAmount = 100_000_000.00;
  public readonly maxTermInMonths = 360;

  // Local reactive state managed with Angular Signals
  public readonly isLoading = signal<boolean>(false);
  public readonly calculationResult = signal<CalculateCdbResponse | null>(null);
  public readonly generalError = signal<string | null>(null);
  public readonly submittedInitialAmount = signal<number>(0);
  public readonly submittedTermInMonths = signal<number>(0);

  // Computed signals for derived financial metrics
  public readonly grossYield = computed(() => {
    const result = this.calculationResult();
    const initial = this.submittedInitialAmount();
    if (!result || initial <= 0) return 0;
    return Math.max(0, result.grossAmount - initial);
  });

  public readonly netYield = computed(() => {
    const result = this.calculationResult();
    const initial = this.submittedInitialAmount();
    if (!result || initial <= 0) return 0;
    return Math.max(0, result.netAmount - initial);
  });

  public readonly netReturnPercentage = computed(() => {
    const initial = this.submittedInitialAmount();
    const yieldAmount = this.netYield();
    if (initial <= 0) return 0;
    return (yieldAmount / initial) * 100;
  });

  public readonly effectiveTaxRate = computed(() => {
    const result = this.calculationResult();
    const yieldAmount = this.grossYield();
    if (!result || yieldAmount <= 0) return 0;
    return (result.incomeTax / yieldAmount) * 100;
  });

  // Reactive Form with strict validations
  public readonly form: FormGroup = this.fb.group({
    initialAmount: [
      null,
      [Validators.required, Validators.min(0.01), Validators.max(this.maxInitialAmount)]
    ],
    termInMonths: [
      null,
      [
        Validators.required,
        Validators.min(2),
        Validators.max(this.maxTermInMonths),
        Validators.pattern('^[1-9][0-9]*$')
      ]
    ]
  });

  constructor() {
    // Clear previous results/errors when user changes inputs
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.calculationResult() !== null) {
        this.calculationResult.set(null);
      }
      if (this.generalError() !== null) {
        this.generalError.set(null);
      }
    });
  }

  public isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  public getFieldError(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (!control?.errors || !(control.dirty || control.touched)) {
      return null;
    }

    if (control.hasError('serverError')) {
      return control.getError('serverError');
    }

    if (control.hasError('required')) {
      return fieldName === 'initialAmount'
        ? 'O valor monetário inicial é obrigatório.'
        : 'O prazo de resgate é obrigatório.';
    }

    if (control.hasError('min')) {
      return fieldName === 'initialAmount'
        ? 'O valor inicial deve ser maior que zero (positivo).'
        : 'O prazo em meses deve ser obrigatoriamente maior que 1 mês.';
    }

    if (control.hasError('max')) {
      return fieldName === 'initialAmount'
        ? `O valor inicial não pode ultrapassar ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(this.maxInitialAmount)}.`
        : `O prazo de resgate não pode ultrapassar ${this.maxTermInMonths.toLocaleString('pt-BR')} meses.`;
    }

    if (control.hasError('pattern')) {
      return 'O prazo deve ser um número inteiro positivo (sem decimais ou caracteres especiais).';
    }

    return 'Campo inválido.';
  }

  public onTermKeyDown(event: KeyboardEvent): void {
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

    // Allow only digits 0-9
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    const currentVal = String(this.form.get('termInMonths')?.value || '');
    if (currentVal.length >= 3 && !window.getSelection()?.toString()) {
      event.preventDefault();
    }
  }

  public onSubmit(): void {
    this.generalError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const initialAmount = Number(this.form.get('initialAmount')?.value);
    const termInMonths = Number(this.form.get('termInMonths')?.value);

    const input: CalculateCdbInput = {
      initialAmount,
      termInMonths
    };

    this.isLoading.set(true);

    this.cdbService.calculate(input).subscribe({
      next: (response) => {
        this.submittedInitialAmount.set(initialAmount);
        this.submittedTermInMonths.set(termInMonths);
        this.calculationResult.set(response);
        this.isLoading.set(false);
      },
      error: (error: ApiErrorResult) => {
        this.isLoading.set(false);
        this.handleApiError(error);
      }
    });
  }

  public onReset(): void {
    this.form.reset();
    this.calculationResult.set(null);
    this.generalError.set(null);
    this.submittedInitialAmount.set(0);
    this.submittedTermInMonths.set(0);
  }

  private handleApiError(error: ApiErrorResult): void {
    if (error.isProblemDetails && error.problemDetails?.errors) {
      const serverErrors = error.problemDetails.errors;
      let hasFieldErrors = false;

      const amountErrors =
        serverErrors['initialAmount'] ||
        serverErrors['InitialAmount'] ||
        serverErrors['valorInicial'];
      if (amountErrors && amountErrors.length > 0) {
        this.form.get('initialAmount')?.setErrors({ serverError: amountErrors[0] });
        this.form.get('initialAmount')?.markAsTouched();
        hasFieldErrors = true;
      }

      const termErrors =
        serverErrors['termInMonths'] ||
        serverErrors['TermInMonths'] ||
        serverErrors['prazoEmMeses'];
      if (termErrors && termErrors.length > 0) {
        this.form.get('termInMonths')?.setErrors({ serverError: termErrors[0] });
        this.form.get('termInMonths')?.markAsTouched();
        hasFieldErrors = true;
      }

      if (!hasFieldErrors) {
        this.generalError.set(error.message);
      }
    } else {
      this.generalError.set(error.message);
    }
  }
}
