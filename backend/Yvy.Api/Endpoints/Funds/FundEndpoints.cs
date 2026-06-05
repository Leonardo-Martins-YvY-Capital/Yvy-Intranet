using Asp.Versioning;
using MediatR;
using Yvy.Api.Authentication;
using Yvy.Api.Extensions;
using Yvy.Application.Funds.Commands.CreateFund;
using Yvy.Application.Funds.Queries.GetFundById;
using Yvy.Application.Funds.Queries.ListFunds;

namespace Yvy.Api.Endpoints.Funds;

public sealed class FundEndpoints : IEndpoint
{
    public void MapEndpoints(IEndpointRouteBuilder app)
    {
        var group = app.NewVersionedApi()
            .MapGroup("/api/v{version:apiVersion}/funds")
            .HasApiVersion(new ApiVersion(1, 0))
            .RequireRateLimiting("api")
            .RequireAuthorization() // any authenticated staff member (reads)
            .WithTags("Funds");

        group.MapGet("/", ListFunds)
            .WithName("ListFunds")
            .WithSummary("List all funds")
            .Produces<IReadOnlyList<object>>(200)
            .Produces(401)
            .Produces(500);

        group.MapGet("/{id:guid}", GetFundById)
            .WithName("GetFundById")
            .WithSummary("Get fund by ID")
            .Produces<object>(200)
            .Produces(401)
            .Produces(404)
            .Produces(500);

        group.MapPost("/", CreateFund)
            .RequireAuthorization(AuthorizationPolicies.FundWrite) // Operator or Admin
            .WithName("CreateFund")
            .WithSummary("Create a new fund")
            .Produces<Guid>(201)
            .Produces(401)
            .Produces(403)
            .Produces(400)
            .Produces(409)
            .Produces(422)
            .Produces(500);
    }

    private static async Task<IResult> ListFunds(ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new ListFundsQuery(), ct);
        return result.Match(Results.Ok, errors => errors.ToProblemResult());
    }

    private static async Task<IResult> GetFundById(Guid id, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetFundByIdQuery(id), ct);
        return result.Match(Results.Ok, errors => errors.ToProblemResult());
    }

    private static async Task<IResult> CreateFund(
        CreateFundRequest request,
        ISender sender,
        CancellationToken ct)
    {
        var command = new CreateFundCommand(
            request.Code,
            request.Name,
            request.FundType,
            request.MinimumInvestmentAmount,
            request.MinimumInvestmentCurrency);

        var result = await sender.Send(command, ct);
        return result.Match(
            id => Results.CreatedAtRoute("GetFundById", new { id }, id),
            errors => errors.ToProblemResult());
    }
}
