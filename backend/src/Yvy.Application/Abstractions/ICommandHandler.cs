using ErrorOr;
using MediatR;

namespace Yvy.Application.Abstractions;

public interface ICommandHandler<TCommand>
    : IRequestHandler<TCommand, ErrorOr<Unit>>
    where TCommand : ICommand
{ }

public interface ICommandHandler<TCommand, TResponse>
    : IRequestHandler<TCommand, ErrorOr<TResponse>>
    where TCommand : ICommand<TResponse>
{ }
