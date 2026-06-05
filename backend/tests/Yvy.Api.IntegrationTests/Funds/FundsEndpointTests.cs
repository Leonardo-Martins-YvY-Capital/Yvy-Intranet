using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Yvy.Api.IntegrationTests.Infrastructure;
using Yvy.Domain.Aggregates.Users;
using Yvy.Infrastructure.Persistence;

namespace Yvy.Api.IntegrationTests.Funds;

public sealed class FundsEndpointTests : IClassFixture<YvyApiFactory>, IAsyncLifetime
{
    private readonly YvyApiFactory _factory;
    private readonly HttpClient _reader; // Viewer — may read
    private readonly HttpClient _writer; // Operator — may create

    public FundsEndpointTests(YvyApiFactory factory)
    {
        _factory = factory;
        _reader = factory.CreateClientAs([Role.Viewer]);
        _writer = factory.CreateClientAs([Role.Operator]);
    }

    public Task InitializeAsync() => _factory.ResetDatabaseAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GET_funds_ReturnsEmptyList_WhenNoFundsExist()
    {
        var response = await _reader.GetAsync("/api/v1/funds");

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

        var response = await _writer.PostAsJsonAsync("/api/v1/funds", request);

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

        await _writer.PostAsJsonAsync("/api/v1/funds", request);
        var response = await _writer.PostAsJsonAsync("/api/v1/funds", request);

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

        var response = await _writer.PostAsJsonAsync("/api/v1/funds", request);

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

        var createResponse = await _writer.PostAsJsonAsync("/api/v1/funds", createRequest);
        var id = await createResponse.Content.ReadFromJsonAsync<Guid>();

        var getResponse = await _reader.GetAsync($"/api/v1/funds/{id}");

        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var fund = await getResponse.Content.ReadFromJsonAsync<JsonElement>();
        fund.GetProperty("code").GetString().Should().Be("MXRF11");
    }

    [Fact]
    public async Task GET_funds_id_Returns404_WhenFundNotFound()
    {
        var response = await _reader.GetAsync($"/api/v1/funds/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ── Auth (Phase 6) ──────────────────────────────────────────────────────────

    [Fact]
    public async Task GET_funds_WithoutAuth_Returns401()
    {
        var anonymous = _factory.CreateClient();

        var response = await anonymous.GetAsync("/api/v1/funds");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task POST_funds_AsViewer_Returns403()
    {
        var request = new
        {
            code = "YVYQ11",
            name = "Some Fund",
            fundType = "FII",
            minimumInvestmentAmount = 1000m
        };

        var response = await _reader.PostAsJsonAsync("/api/v1/funds", request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task AuthenticatedRequest_ProvisionsApplicationUser_Once()
    {
        const string oid = "22222222-2222-2222-2222-222222222222";
        var client = _factory.CreateClientAs([Role.Viewer], oid: oid, email: "provision.test@yvy.capital");

        // Two authenticated calls — JIT provisioning must be idempotent.
        await client.GetAsync("/api/v1/funds");
        await client.GetAsync("/api/v1/funds");

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<YvyDbContext>();
        var count = await db.ApplicationUsers.CountAsync(u => u.EntraObjectId.Value == oid);

        count.Should().Be(1);
    }
}
