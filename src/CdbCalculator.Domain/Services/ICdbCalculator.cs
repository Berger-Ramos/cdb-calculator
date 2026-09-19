using CdbCalculator.Domain.Entities;
using CdbCalculator.Domain.ValueObjects;

namespace CdbCalculator.Domain.Services;

public interface ICdbCalculator
{
    CdbCalculation Calculate(CdbInvestment investment);
}
