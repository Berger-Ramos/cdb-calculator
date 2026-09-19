using CdbCalculator.Domain.Entities;
using CdbCalculator.Domain.Policies;
using CdbCalculator.Domain.ValueObjects;

namespace CdbCalculator.Domain.Services;

public sealed class CdbCalculator(
    decimal cdiRate,
    decimal bankCdiPercentage,
    IIncomeTaxRatePolicy incomeTaxRatePolicy) : ICdbCalculator
{
    public CdbCalculation Calculate(CdbInvestment investment)
    {
        ArgumentNullException.ThrowIfNull(investment);

        var monthlyRate = cdiRate * bankCdiPercentage;
        var grossAmount = investment.InitialAmount;

        for (var month = 0; month < investment.TermInMonths; month++)
        {
            grossAmount = grossAmount * (1 + monthlyRate);
        }

        var earnings = grossAmount - investment.InitialAmount;
        var taxRate = incomeTaxRatePolicy.GetFor(investment.TermInMonths);
        var incomeTax = earnings * taxRate;

        return new CdbCalculation(
            grossAmount,
            earnings,
            incomeTax,
            grossAmount - incomeTax,
            taxRate);
    }
}
