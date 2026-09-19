using CdbCalculator.Domain.Entities;
using CdbCalculator.Domain.Services;

namespace CdbCalculator.Application.CalculateCdb;

public sealed class CalculateCdbUseCase(ICdbCalculator cdbCalculator) : ICalculateCdbUseCase
{
    public CalculateCdbResponse Execute(CalculateCdbRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        var calculation = cdbCalculator.Calculate(new CdbInvestment(request.InitialAmount, request.TermInMonths));

        return new CalculateCdbResponse(
            decimal.Round(calculation.GrossAmount, 2, MidpointRounding.ToEven),
            decimal.Round(calculation.IncomeTax, 2, MidpointRounding.ToEven),
            decimal.Round(calculation.NetAmount, 2, MidpointRounding.ToEven));
    }
}
