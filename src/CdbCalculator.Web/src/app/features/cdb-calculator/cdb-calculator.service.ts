import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiCdbResponse, CalculateCdbInput, CalculateCdbRequest, CalculateCdbResponse } from './cdb.models';
import { API_CONFIG } from '../../core/api/api-config';
import { ProblemDetails } from '../../core/api/problem-details.model';

export interface ApiErrorResult {
  isProblemDetails: boolean;
  problemDetails?: ProblemDetails;
  message: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class CdbCalculatorService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);

  public calculate(request: CalculateCdbInput): Observable<CalculateCdbResponse> {
    const url = `${this.apiConfig.baseUrl}${this.apiConfig.calculateCdbEndpoint}`;

    const payload: CalculateCdbRequest = {
      initialAmount: request.initialAmount,
      termInMonths: request.termInMonths
    };

    return this.http.post<ApiCdbResponse>(url, payload).pipe(
      map((response: ApiCdbResponse): CalculateCdbResponse => {
        return {
          grossAmount: response.grossAmount,
          incomeTax: response.incomeTax,
          netAmount: response.netAmount
        };
      }),
      catchError((error: HttpErrorResponse) => {
        const errorResult = this.normalizeError(error);
        return throwError(() => errorResult);
      })
    );
  }

  private normalizeError(error: HttpErrorResponse): ApiErrorResult {
    if (error.status === 400 && error.error && typeof error.error === 'object') {
      const problem = error.error as ProblemDetails;
      return {
        isProblemDetails: true,
        problemDetails: problem,
        message: problem.title || 'Uma ou mais validações falharam.',
        status: error.status
      };
    }

    let userMessage = 'Não foi possível se comunicar com o servidor de cálculo. Tente novamente mais tarde.';
    if (error.status >= 500) {
      userMessage = 'Ocorreu um erro interno no servidor ao processar o cálculo.';
    }

    return {
      isProblemDetails: false,
      message: userMessage,
      status: error.status
    };
  }
}
