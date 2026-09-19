namespace CdbCalculator.Domain.Policies;

public interface IIncomeTaxRatePolicy
{
    decimal GetFor(int termInMonths);
}
