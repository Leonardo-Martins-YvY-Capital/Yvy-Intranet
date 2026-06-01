using ErrorOr;
using MediatR;
using Yvy.Application.Behaviors;

namespace Yvy.Application.Abstractions;

public interface ICommand : IRequest<ErrorOr<Unit>>, IBaseCommand { }

public interface ICommand<TResponse> : IRequest<ErrorOr<TResponse>>, IBaseCommand { }
