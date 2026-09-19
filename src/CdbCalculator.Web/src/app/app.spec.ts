import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { describe, it, expect, beforeEach } from 'vitest';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('deve criar a aplicação com sucesso', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('deve renderizar o cabeçalho institucional', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-title')?.textContent).toContain('CDB CALCULATOR');
    expect(compiled.querySelector('.app-header')).toBeTruthy();
    expect(compiled.querySelector('.app-footer')).toBeTruthy();
  });
});
