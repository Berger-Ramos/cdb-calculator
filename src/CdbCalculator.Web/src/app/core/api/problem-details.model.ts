/**
 * Modelo para respostas de erro RFC 7807 (Problem Details) retornadas pela API.
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}
