namespace CdbCalculator.Domain.ValueObjects;

public sealed record CdbCalculation(
    decimal GrossAmount,
    decimal Earnings,
    decimal IncomeTax,
    decimal NetAmount,
    decimal IncomeTaxRate);
