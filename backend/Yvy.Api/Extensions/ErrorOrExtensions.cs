using ErrorOr;
using Microsoft.AspNetCore.Mvc;

namespace Yvy.Api.Extensions;

public static class ErrorOrExtensions
{
    public static IResult ToProblemResult(this IEnumerable<Error> errors)
    {
        var errorList = errors.ToList();
        var first = errorList[0];

        var statusCode = first.Type switch
        {
            ErrorType.NotFound     => StatusCodes.Status404NotFound,
            ErrorType.Conflict     => StatusCodes.Status409Conflict,
            ErrorType.Validation   => StatusCodes.Status422UnprocessableEntity,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden    => StatusCodes.Status403Forbidden,
            _                      => StatusCodes.Status500InternalServerError
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title  = first.Description,
            Type   = $"https://yvy.capital/errors/{first.Code.ToLowerInvariant().Replace('.', '-')}",
        };

        if (errorList.Count > 1)
        {
            problemDetails.Extensions["errors"] = errorList
                .Select(e => new { e.Code, e.Description })
                .ToArray();
        }

        return Results.Problem(problemDetails);
    }
}
