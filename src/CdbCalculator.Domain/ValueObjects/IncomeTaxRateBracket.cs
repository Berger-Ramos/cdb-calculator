namespace CdbCalculator.Domain.ValueObjects;

public sealed record IncomeTaxRateBracket(int? MaximumTermInMonths, decimal Rate);
