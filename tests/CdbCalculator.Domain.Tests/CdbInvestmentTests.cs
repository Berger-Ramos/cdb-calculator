using CdbCalculator.Domain.Entities;
using CdbCalculator.Domain.Policies;
using CdbCalculator.Domain.Services;
using CdbCalculator.Domain.ValueObjects;
using Xunit;
using DomainCdbCalculator = CdbCalculator.Domain.Services.CdbCalculator;

namespace CdbCalculator.Domain.Tests;

public sealed class CdbInvestmentTests
{
    [Fact]
    public void CalculateCompoundsMonthlyInterestAndAppliesTaxToEarnings()
    {
        var investment = new CdbInvestment(1000m, 2);
        var calculator = CreateCalculator();

        var result = calculator.Calculate(investment);

        Assert.Equal(1019.5344784m, result.GrossAmount);
        Assert.Equal(19.5344784m, result.Earnings);
        Assert.Equal(4.39525764m, result.IncomeTax);
        Assert.Equal(1015.13922076m, result.NetAmount);
        Assert.Equal(0.225m, result.IncomeTaxRate);
    }

    [Fact]
    public void CalculateRejectsNullInvestment()
    {
        var calculator = CreateCalculator();

        Assert.Throws<ArgumentNullException>(() => calculator.Calculate(null!));
    }

    [Theory]
    [InlineData(2, 0.225)]
    [InlineData(6, 0.225)]
    [InlineData(7, 0.20)]
    [InlineData(12, 0.20)]
    [InlineData(13, 0.175)]
    [InlineData(24, 0.175)]
    [InlineData(25, 0.15)]
    [InlineData(1200, 0.15)]
    public void GetForSelectsTheCorrectTaxRate(int termInMonths, decimal expectedRate)
    {
        var rate = CreateTaxRatePolicy().GetFor(termInMonths);

        Assert.Equal(expectedRate, rate);
    }

    [Fact]
    public void GetForThrowsWhenNoConfiguredTaxBracketApplies()
    {
        var policy = new IncomeTaxRatePolicy(
        [
            new IncomeTaxRateBracket(6, 0.225m)
        ]);

        Assert.Throws<InvalidOperationException>(() => policy.GetFor(7));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void ConstructorRejectsNonPositiveInitialAmount(decimal invalidAmount)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new CdbInvestment(invalidAmount, 2));
    }

    [Fact]
    public void ConstructorRejectsAmountExceedingMaximumLimit()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new CdbInvestment(100_000_000.01m, 12));
    }

    [Fact]
    public void ConstructorRejectsAmountWithMoreThanTwoDecimalPlaces()
    {
        Assert.Throws<ArgumentException>(() => new CdbInvestment(1000.123m, 12));
    }

    [Theory]
    [InlineData(1)]
    [InlineData(0)]
    [InlineData(-1)]
    public void ConstructorRejectsTermsOfOneMonthOrLess(int invalidTerm)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new CdbInvestment(100m, invalidTerm));
    }

    [Fact]
    public void ConstructorRejectsTermExceedingMaximumLimit()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new CdbInvestment(100m, 361));
    }

    [Fact]
    public void ConstructorAcceptsValidMaximumBoundaries()
    {
        var investment = new CdbInvestment(100_000_000.00m, 360);

        Assert.Equal(100_000_000.00m, investment.InitialAmount);
        Assert.Equal(360, investment.TermInMonths);
    }

    private static DomainCdbCalculator CreateCalculator() => new(0.009m, 1.08m, CreateTaxRatePolicy());

    private static IncomeTaxRatePolicy CreateTaxRatePolicy() => new(
    [
        new IncomeTaxRateBracket(6, 0.225m),
        new IncomeTaxRateBracket(12, 0.20m),
        new IncomeTaxRateBracket(24, 0.175m),
        new IncomeTaxRateBracket(null, 0.15m)
    ]);
}
