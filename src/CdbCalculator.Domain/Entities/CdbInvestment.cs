namespace CdbCalculator.Domain.Entities;

public sealed class CdbInvestment
{
    public CdbInvestment(decimal initialAmount, int termInMonths)
    {
        if (initialAmount <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(initialAmount), "Initial amount must be greater than zero.");
        }

        if (termInMonths <= 1)
        {
            throw new ArgumentOutOfRangeException(nameof(termInMonths), "Term must be greater than one month.");
        }

        InitialAmount = initialAmount;
        TermInMonths = termInMonths;
    }

    public decimal InitialAmount { get; }

    public int TermInMonths { get; }
}
