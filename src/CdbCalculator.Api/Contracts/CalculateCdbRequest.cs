using System.ComponentModel.DataAnnotations;

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

        if (TermInMonths <= 1)
        {
            yield return new ValidationResult(
                "Term must be greater than one month.",
                [nameof(TermInMonths)]);
        }
    }
}
