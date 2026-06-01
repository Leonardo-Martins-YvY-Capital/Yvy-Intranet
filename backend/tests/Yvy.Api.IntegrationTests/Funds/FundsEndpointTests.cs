using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Yvy.Api.IntegrationTests.Infrastructure;

namespace Yvy.Api.IntegrationTests.Funds;

public sealed class FundsEndpointTests : IClassFixture<YvyApiFactory>, IAsyncLifetime
{
    private readonly YvyApiFactory _factory;
    private readonly HttpClient _client;

    public FundsEndpointTests(YvyApiFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public Task InitializeAsync() => _factory.ResetDatabaseAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GET_funds_ReturnsEmptyList_WhenNoFundsExist()
    {
        var response = await _client.GetAsync("/api/v1/funds");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var funds = await response.Content.ReadFromJsonAsync<List<object>>();
        funds.Should().BeEmpty();
    }

    [Fact]
    public async Task POST_funds_CreatesFund_AndReturnsCreatedId()
    {
        var request = new
        {
            code = "YVYQ11",
            name = "Yvy Fundo de Infraestrutura",
            fundType = "FII",
            minimumInvestmentAmount = 5000.00m,
            minimumInvestmentCurrency = "BRL"
        };

        var response = await _client.PostAsJsonAsync("/api/v1/funds", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var id = await response.Content.ReadFromJsonAsync<Guid>();
        id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task POST_funds_Returns409_WhenCodeAlreadyExists()
    {
        var request = new
        {
            code = "KNRI11",
            name = "Some Fund",
            fundType = "FII",
            minimumInvestmentAmount = 1000m
        };

        await _client.PostAsJsonAsync("/api/v1/funds", request);
        var response = await _client.PostAsJsonAsync("/api/v1/funds", request);

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task POST_funds_Returns422_WhenCodeIsInvalid()
    {
        var request = new
        {
            code = "INVALID",
            name = "Some Fund",
            fundType = "FII",
            minimumInvestmentAmount = 1000m
        };

        var response = await _client.PostAsJsonAsync("/api/v1/funds", request);

        response.StatusCode.Should().Be(HttpStatusCode.UnprocessableEntity);
    }

    [Fact]
    public async Task GET_funds_id_ReturnsFund_AfterCreation()
    {
        var createRequest = new
        {
            code = "MXRF11",
            name = "Test Fund",
            fundType = "FII",
            minimumInvestmentAmount = 1000m,
            minimumInvestmentCurrency = "BRL"
        };

        var createResponse = await _client.PostAsJsonAsync("/api/v1/funds", createRequest);
        var id = await createResponse.Content.ReadFromJsonAsync<Guid>();

        var getResponse = await _client.GetAsync($"/api/v1/funds/{id}");

        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var fund = await getResponse.Content.ReadFromJsonAsync<dynamic>();
        fund.Should().NotBeNull();
    }

    [Fact]
    public async Task GET_funds_id_Returns404_WhenFundNotFound()
    {
        var response = await _client.GetAsync($"/api/v1/funds/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
