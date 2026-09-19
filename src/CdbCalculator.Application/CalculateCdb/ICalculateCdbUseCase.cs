namespace CdbCalculator.Application.CalculateCdb;

public interface ICalculateCdbUseCase
{
    CalculateCdbResponse Execute(CalculateCdbRequest request);
}
