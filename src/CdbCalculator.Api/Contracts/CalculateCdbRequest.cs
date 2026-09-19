using System.ComponentModel.DataAnnotations;
using CdbCalculator.Domain.Entities;

namespace CdbCalculator.Api.Contracts;

public sealed class CalculateCdbRequest : IValidatableObject
{
    public decimal InitialAmount { get; init; }

    public int TermInMonths { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (InitialAmount <= 0)
        {
            yield return new ValidationResult(
                "Initial amount must be greater than zero.",
                [nameof(InitialAmount)]);
        }
        else if (InitialAmount > CdbInvestment.MaximumInitialAmount)
        {
            yield return new ValidationResult(
                $"Initial amount cannot exceed {CdbInvestment.MaximumInitialAmount:N2}.",
                [nameof(InitialAmount)]);
        }
        else if (decimal.Round(InitialAmount, 2) != InitialAmount)
        {
            yield return new ValidationResult(
                "Initial amount cannot have more than 2 decimal places.",
                [nameof(InitialAmount)]);
        }

        if (TermInMonths <= 1)
        {
            yield return new ValidationResult(
                "Term must be greater than one month.",
                [nameof(TermInMonths)]);
        }
        else if (TermInMonths > CdbInvestment.MaximumTermInMonths)
        {
            yield return new ValidationResult(
                $"Term cannot exceed {CdbInvestment.MaximumTermInMonths} months.",
                [nameof(TermInMonths)]);
        }
    }
}
