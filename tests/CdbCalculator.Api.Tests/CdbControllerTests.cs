using System.Text.Json;
using CdbCalculator.Api.Contracts;
using CdbCalculator.Api.Controllers;
using CdbCalculator.Application.CalculateCdb;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using ApiRequest = CdbCalculator.Api.Contracts.CalculateCdbRequest;
using ApiResponse = CdbCalculator.Api.Contracts.CalculateCdbResponse;
using ApplicationRequest = CdbCalculator.Application.CalculateCdb.CalculateCdbRequest;
using ApplicationResponse = CdbCalculator.Application.CalculateCdb.CalculateCdbResponse;

namespace CdbCalculator.Api.Tests;

public sealed class CdbControllerTests
{
    private static readonly JsonSerializerOptions WebJsonOptions = new(JsonSerializerDefaults.Web);

    [Fact]
    public void CalculateMapsApiRequestToUseCaseAndResponse()
    {
        var useCase = new StubCalculateCdbUseCase(new ApplicationResponse(1123.08m, 24.62m, 1098.47m));
        var controller = new CdbController(useCase);

        var action = controller.Calculate(new ApiRequest { InitialAmount = 1000m, TermInMonths = 12 });

        var okResult = Assert.IsType<OkObjectResult>(action.Result);
        var response = Assert.IsType<ApiResponse>(okResult.Value);
        Assert.Equal(1000m, useCase.ReceivedRequest?.InitialAmount);
        Assert.Equal(12, useCase.ReceivedRequest?.TermInMonths);
        Assert.Equal(1123.08m, response.GrossAmount);
        Assert.Equal(24.62m, response.IncomeTax);
        Assert.Equal(1098.47m, response.NetAmount);
    }

    [Fact]
    public void ResponseSerializesUsingEnglishCamelCaseProperties()
    {
        var response = new ApiResponse(1123.08m, 24.62m, 1098.47m);

        using var document = JsonDocument.Parse(JsonSerializer.Serialize(response, WebJsonOptions));

        Assert.True(document.RootElement.TryGetProperty("grossAmount", out _));
        Assert.True(document.RootElement.TryGetProperty("incomeTax", out _));
        Assert.True(document.RootElement.TryGetProperty("netAmount", out _));
    }

    private sealed class StubCalculateCdbUseCase(ApplicationResponse response) : ICalculateCdbUseCase
    {
        public ApplicationRequest? ReceivedRequest { get; private set; }

        public ApplicationResponse Execute(ApplicationRequest request)
        {
            ReceivedRequest = request;
            return response;
        }
    }
}
