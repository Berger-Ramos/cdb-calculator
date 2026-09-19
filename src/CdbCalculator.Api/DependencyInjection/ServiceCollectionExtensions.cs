using CdbCalculator.Api.Configuration;
using CdbCalculator.Application.CalculateCdb;
using CdbCalculator.Domain.Policies;
using CdbCalculator.Domain.Services;
using CdbCalculator.Domain.ValueObjects;
using Microsoft.Extensions.Options;
using DomainCdbCalculator = CdbCalculator.Domain.Services.CdbCalculator;

namespace CdbCalculator.Api.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCdbCalculationServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<CdbCalculationOptions>()
            .Bind(configuration.GetSection(CdbCalculationOptions.SectionName))
            .Validate(IsValid, "CdbCalculation configuration is invalid.")
            .ValidateOnStart();

        services.AddSingleton<IIncomeTaxRatePolicy>(serviceProvider =>
        {
            var options = serviceProvider.GetRequiredService<IOptions<CdbCalculationOptions>>().Value;
            var brackets = options.TaxBrackets
                .Select(bracket => new IncomeTaxRateBracket(bracket.MaximumTermInMonths, bracket.Rate))
                .ToArray();

            return new IncomeTaxRatePolicy(brackets);
        });
        services.AddSingleton<ICdbCalculator>(serviceProvider =>
        {
            var options = serviceProvider.GetRequiredService<IOptions<CdbCalculationOptions>>().Value;
            var incomeTaxRatePolicy = serviceProvider.GetRequiredService<IIncomeTaxRatePolicy>();

            return new DomainCdbCalculator(options.CdiRate, options.BankCdiPercentage, incomeTaxRatePolicy);
        });
        services.AddScoped<ICalculateCdbUseCase, CalculateCdbUseCase>();

        return services;
    }

    private static bool IsValid(CdbCalculationOptions options)
    {
        if (options.CdiRate <= 0 || options.BankCdiPercentage <= 0 || options.TaxBrackets.Count == 0)
        {
            return false;
        }

        var previousMaximumTerm = 1;

        for (var index = 0; index < options.TaxBrackets.Count; index++)
        {
            var bracket = options.TaxBrackets[index];

            if (bracket.Rate is < 0 or > 1)
            {
                return false;
            }

            if (bracket.MaximumTermInMonths is null)
            {
                return index == options.TaxBrackets.Count - 1;
            }

            if (bracket.MaximumTermInMonths <= previousMaximumTerm)
            {
                return false;
            }

            previousMaximumTerm = bracket.MaximumTermInMonths.Value;
        }

        return false;
    }
}
