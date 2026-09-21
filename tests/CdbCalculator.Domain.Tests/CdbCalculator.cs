using CdbCalculator.Domain.Entities;
using CdbCalculator.Domain.Policies;
using CdbCalculator.Domain.Services;
using CdbCalculator.Domain.ValueObjects;
using Xunit;
using DomainCdbCalculator = CdbCalculator.Domain.Services.CdbCalculator;

namespace CdbCalculator.Domain.Tests;

public sealed class CdbCalculatorTests
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
    public void CalculateWithLongerTermUsesCorrectTaxRate()
    {
        var investment = new CdbInvestment(1000m, 13);
        var calculator = CreateCalculator();

        var result = calculator.Calculate(investment);

        Assert.Equal(0.175m, result.IncomeTaxRate);
        Assert.True(result.GrossAmount > investment.InitialAmount);
        Assert.True(result.NetAmount < result.GrossAmount);
    }

    [Fact]
    public void CalculateDoesNotApplyIncomeTaxToInitialAmount()
    {
        var investment = new CdbInvestment(1000m, 2);
        var calculator = CreateCalculator();

        var result = calculator.Calculate(investment);

        Assert.Equal(result.GrossAmount - investment.InitialAmount, result.Earnings);
        Assert.Equal(result.Earnings * result.IncomeTaxRate, result.IncomeTax);
    }

    [Fact]
    public void CalculateNetAmountEqualsGrossAmountMinusIncomeTax()
    {
        var investment = new CdbInvestment(1000m, 2);
        var calculator = CreateCalculator();

        var result = calculator.Calculate(investment);

        Assert.Equal(
            result.GrossAmount - result.IncomeTax,
            result.NetAmount);
    }

    [Fact]
    public void CalculateWithMinimumValidTermUsesHighestTaxRate()
    {
        var investment = new CdbInvestment(1000m, 2);
        var calculator = CreateCalculator();

        var result = calculator.Calculate(investment);

        Assert.Equal(0.225m, result.IncomeTaxRate);
    }

    [Fact]
    public void CalculateWithMaximumValidTermUsesLowestTaxRate()
    {
        var investment = new CdbInvestment(100_000_000m, CdbInvestment.MaximumTermInMonths);
        var calculator = CreateCalculator();

        var result = calculator.Calculate(investment);

        Assert.Equal(0.15m, result.IncomeTaxRate);
        Assert.True(result.GrossAmount > investment.InitialAmount);
        Assert.True(result.NetAmount > 0);
    }

    [Fact]
    public void CalculateRejectsNullInvestment()
    {
        var calculator = CreateCalculator();

        Assert.Throws<ArgumentNullException>(
            () => calculator.Calculate(null!));
    }

    [Fact]
    public void CalculateUsesConfiguredCdiAndBankPercentage()
    {
        var investment = new CdbInvestment(1000m, 2);
        var calculator = new DomainCdbCalculator(
            cdiRate: 0.01m,
            bankCdiPercentage: 1.10m,
            incomeTaxRatePolicy: CreateTaxRatePolicy());

        var result = calculator.Calculate(investment);

        var monthlyRate = 0.01m * 1.10m;
        var expectedGrossAmount =
            1000m * (1 + monthlyRate) * (1 + monthlyRate);

        Assert.Equal(expectedGrossAmount, result.GrossAmount);
    }

    private static DomainCdbCalculator CreateCalculator() =>
        new(
            0.009m,
            1.08m,
            CreateTaxRatePolicy());

    private static IncomeTaxRatePolicy CreateTaxRatePolicy() =>
        new(
        [
            new IncomeTaxRateBracket(6, 0.225m),
            new IncomeTaxRateBracket(12, 0.20m),
            new IncomeTaxRateBracket(24, 0.175m),
            new IncomeTaxRateBracket(null, 0.15m)
        ]);
}
