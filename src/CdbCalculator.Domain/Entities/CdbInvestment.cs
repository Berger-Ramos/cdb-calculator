namespace CdbCalculator.Domain.Entities;

public sealed class CdbInvestment
{
    public const decimal MaximumInitialAmount = 100_000_000.00m;

    public const int MaximumTermInMonths = 360;

    public CdbInvestment(decimal initialAmount, int termInMonths)
    {
        if (initialAmount <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(initialAmount), "Initial amount must be greater than zero.");
        }

        if (initialAmount > MaximumInitialAmount)
        {
            throw new ArgumentOutOfRangeException(nameof(initialAmount), $"Initial amount cannot exceed {MaximumInitialAmount:N2}.");
        }

        if (decimal.Round(initialAmount, 2) != initialAmount)
        {
            throw new ArgumentException("Initial amount cannot have more than 2 decimal places.", nameof(initialAmount));
        }

        if (termInMonths <= 1)
        {
            throw new ArgumentOutOfRangeException(nameof(termInMonths), "Term must be greater than one month.");
        }

        if (termInMonths > MaximumTermInMonths)
        {
            throw new ArgumentOutOfRangeException(nameof(termInMonths), $"Term cannot exceed {MaximumTermInMonths} months.");
        }

        InitialAmount = initialAmount;
        TermInMonths = termInMonths;
    }

    public decimal InitialAmount { get; }

    public int TermInMonths { get; }
}
