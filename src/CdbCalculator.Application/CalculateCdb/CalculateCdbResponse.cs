namespace CdbCalculator.Application.CalculateCdb;

public sealed record CalculateCdbResponse(decimal GrossAmount, decimal IncomeTax, decimal NetAmount);
