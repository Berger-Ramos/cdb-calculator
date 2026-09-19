using CdbCalculator.Application.CalculateCdb;
using CdbCalculator.Domain.Entities;
using CdbCalculator.Domain.Services;
using CdbCalculator.Domain.ValueObjects;
using Xunit;

namespace CdbCalculator.Application.Tests;

public sealed class CalculateCdbUseCaseTests
{
    [Fact]
    public void ExecuteRoundsOnlyTheResponseValues()
    {
        var calculator = new CapturingCalculator(new CdbCalculation(1019.5344784m, 19.5344784m, 4.39525764m, 1015.13922076m, 0.225m));
        var useCase = new CalculateCdbUseCase(calculator);
        var request = new CalculateCdbRequest(1000m, 2);

        var result = useCase.Execute(request);

        Assert.Equal(1019.53m, result.GrossAmount);
        Assert.Equal(4.40m, result.IncomeTax);
        Assert.Equal(1015.14m, result.NetAmount);
        Assert.NotNull(calculator.ReceivedInvestment);
        Assert.Equal(1000m, calculator.ReceivedInvestment.InitialAmount);
        Assert.Equal(2, calculator.ReceivedInvestment.TermInMonths);
    }

    [Fact]
    public void ExecuteRejectsAnInvalidRequest()
    {
        var request = new CalculateCdbRequest(0m, 2);

        var useCase = new CalculateCdbUseCase(new CapturingCalculator(CreateCalculation()));

        Assert.Throws<ArgumentOutOfRangeException>(() => useCase.Execute(request));
    }

    [Fact]
    public void ExecuteRejectsNullRequest()
    {
        var useCase = new CalculateCdbUseCase(new CapturingCalculator(CreateCalculation()));

        Assert.Throws<ArgumentNullException>(() => useCase.Execute(null!));
    }

    private static CdbCalculation CreateCalculation() => new(1m, 1m, 1m, 1m, 0.15m);

    private sealed class CapturingCalculator(CdbCalculation calculation) : ICdbCalculator
    {
        public CdbInvestment? ReceivedInvestment { get; private set; }

        public CdbCalculation Calculate(CdbInvestment investment)
        {
            ReceivedInvestment = investment;
            return calculation;
        }
    }
}
