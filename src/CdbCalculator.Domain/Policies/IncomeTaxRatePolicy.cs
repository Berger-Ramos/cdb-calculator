using CdbCalculator.Domain.ValueObjects;

namespace CdbCalculator.Domain.Policies;

public sealed class IncomeTaxRatePolicy(IReadOnlyList<IncomeTaxRateBracket> brackets) : IIncomeTaxRatePolicy
{
    public decimal GetFor(int termInMonths)
    {
        foreach (var bracket in brackets)
        {
            if (bracket.MaximumTermInMonths is null || termInMonths <= bracket.MaximumTermInMonths)
            {
                return bracket.Rate;
            }
        }

        throw new InvalidOperationException("No income tax rate was configured for the investment term.");
    }
}
