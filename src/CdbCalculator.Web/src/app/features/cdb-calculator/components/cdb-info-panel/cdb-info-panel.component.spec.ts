import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CdbInfoPanelComponent } from './cdb-info-panel.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('CdbInfoPanelComponent', () => {
  let component: CdbInfoPanelComponent;
  let fixture: ComponentFixture<CdbInfoPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdbInfoPanelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CdbInfoPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize fixed constants with bank rate 108% and CDI 0.90%', () => {
    expect(component.constants.formattedBankRateTb).toBe('108%');
    expect(component.constants.formattedMonthlyCdi).toBe('0,90%');
    expect(component.constants.formattedEffectiveMonthlyRate).toBe('0,972%');
  });

  it('should define all 4 regressive tax brackets', () => {
    expect(component.taxBrackets).toHaveLength(4);
    expect(component.taxBrackets[0].formattedRate).toBe('22,5%');
    expect(component.taxBrackets[1].formattedRate).toBe('20,0%');
    expect(component.taxBrackets[2].formattedRate).toBe('17,5%');
    expect(component.taxBrackets[3].formattedRate).toBe('15,0%');
  });

  it('should render table rows and constants in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tableRows = compiled.querySelectorAll('.b-table tbody tr');
    expect(tableRows).toHaveLength(4);
    expect(compiled.textContent).toContain('108%');
    expect(compiled.textContent).toContain('0,90%');
  });
});
