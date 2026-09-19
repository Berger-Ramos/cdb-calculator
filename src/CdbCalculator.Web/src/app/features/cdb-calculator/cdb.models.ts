/**
 * User input parameters provided by the calculation form.
 */
export interface CalculateCdbInput {
  initialAmount: number;
  termInMonths: number;
}

/**
 * Request payload sent to the Web API.
 */
export interface CalculateCdbRequest {
  initialAmount: number;
  termInMonths: number;
}

/**
 * Raw response model received from the .NET Web API.
 */
export interface ApiCdbResponse {
  grossAmount: number;
  incomeTax: number;
  netAmount: number;
}

/**
 * Unified calculation result model used by the presentation layer.
 */
export interface CalculateCdbResponse {
  grossAmount: number;
  incomeTax: number;
  netAmount: number;
}

/**
 * Regressive Income Tax bracket information.
 */
export interface TaxBracket {
  bracketId: string;
  termDescription: string;
  rate: number;
  formattedRate: string;
}

/**
 * Financial calculation constants and effective yields.
 */
export interface CdbCalculationConstants {
  monthlyCdi: number;
  formattedMonthlyCdi: string;
  bankRateTb: number;
  formattedBankRateTb: string;
  effectiveMonthlyRate: number;
  formattedEffectiveMonthlyRate: string;
}
