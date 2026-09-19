namespace CdbCalculator.Api.Configuration;

public sealed class CdbCalculationOptions
{
    public const string SectionName = "CdbCalculation";

    public decimal CdiRate { get; init; }

    public decimal BankCdiPercentage { get; init; }

    public List<IncomeTaxRateBracketOptions> TaxBrackets { get; init; } = [];
}

public sealed class IncomeTaxRateBracketOptions
{
    public int? MaximumTermInMonths { get; init; }

    public decimal Rate { get; init; }
}
