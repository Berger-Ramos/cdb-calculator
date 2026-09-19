namespace CdbCalculator.Api.Contracts;

public sealed record CalculateCdbResponse(decimal GrossAmount, decimal IncomeTax, decimal NetAmount);
