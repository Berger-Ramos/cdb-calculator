import { Routes } from '@angular/router';
import { CdbCalculatorComponent } from './features/cdb-calculator/cdb-calculator.component';

export const routes: Routes = [
  {
    path: '',
    component: CdbCalculatorComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
