using CdbCalculator.Api.Contracts;
using Microsoft.AspNetCore.Mvc;
using ApplicationRequest = CdbCalculator.Application.CalculateCdb.CalculateCdbRequest;
using ApplicationUseCase = CdbCalculator.Application.CalculateCdb.ICalculateCdbUseCase;

namespace CdbCalculator.Api.Controllers;

[ApiController]
[Route("api/cdb")]
public sealed class CdbController(ApplicationUseCase calculateCdbUseCase) : ControllerBase
{
    [HttpPost("calculate")]
    [ProducesResponseType(typeof(CalculateCdbResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public ActionResult<CalculateCdbResponse> Calculate(CalculateCdbRequest request)
    {
        var result = calculateCdbUseCase.Execute(new ApplicationRequest(request.InitialAmount, request.TermInMonths));

        return Ok(new CalculateCdbResponse(result.GrossAmount, result.IncomeTax, result.NetAmount));
    }
}
