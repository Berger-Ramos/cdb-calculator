import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaxBracket, CdbCalculationConstants } from '../../cdb.models';

@Component({
  selector: 'app-cdb-info-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cdb-info-panel.component.html',
  styleUrl: './cdb-info-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CdbInfoPanelComponent {
  public readonly constants: CdbCalculationConstants = {
    monthlyCdi: 0.009,
    formattedMonthlyCdi: '0,90%',
    bankRateTb: 1.08,
    formattedBankRateTb: '108%',
    effectiveMonthlyRate: 0.00972,
    formattedEffectiveMonthlyRate: '0,972%'
  };

  public readonly taxBrackets: TaxBracket[] = [
    { bracketId: '1', termDescription: 'Até 6 meses', rate: 0.225, formattedRate: '22,5%' },
    { bracketId: '2', termDescription: 'De 7 a 12 meses', rate: 0.20, formattedRate: '20,0%' },
    { bracketId: '3', termDescription: 'De 13 a 24 meses', rate: 0.175, formattedRate: '17,5%' },
    { bracketId: '4', termDescription: 'Acima de 24 meses', rate: 0.15, formattedRate: '15,0%' }
  ];
}
