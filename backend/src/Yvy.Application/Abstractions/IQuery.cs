using ErrorOr;
using MediatR;

namespace Yvy.Application.Abstractions;

public interface IQuery<TResponse> : IRequest<ErrorOr<TResponse>> { }
