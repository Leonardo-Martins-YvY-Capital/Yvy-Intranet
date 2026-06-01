using ErrorOr;
using FluentAssertions;
using NSubstitute;
using Yvy.Application.Abstractions;
using Yvy.Application.Funds.Commands.CreateFund;
using Yvy.Domain.Aggregates.Funds;
using Yvy.Domain.Errors;
using Yvy.Domain.Repositories;
using Yvy.Domain.ValueObjects;

namespace Yvy.Application.Tests.Funds;

public sealed class CreateFundCommandHandlerTests
{
    private readonly IFundRepository _fundRepository = Substitute.For<IFundRepository>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();
    private readonly CreateFundCommandHandler _handler;

    public CreateFundCommandHandlerTests()
    {
        _handler = new CreateFundCommandHandler(_fundRepository, _unitOfWork);
    }

    [Fact]
    public async Task Handle_WithValidCommand_CreatesFundAndReturnsId()
    {
        _fundRepository
            .ExistsByCodeAsync(Arg.Any<FundCode>(), Arg.Any<CancellationToken>())
            .Returns(false);

        var command = new CreateFundCommand("YVYQ11", "Yvy Fundo de Infraestrutura", "FII", 5000m);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsError.Should().BeFalse();
        result.Value.Should().NotBeEmpty();
        await _fundRepository.Received(1).AddAsync(Arg.Any<Fund>(), Arg.Any<CancellationToken>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenCodeAlreadyExists_ReturnsConflictError()
    {
        _fundRepository
            .ExistsByCodeAsync(Arg.Any<FundCode>(), Arg.Any<CancellationToken>())
            .Returns(true);

        var command = new CreateFundCommand("YVYQ11", "Yvy FII", "FII", 1000m);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsError.Should().BeTrue();
        result.FirstError.Should().Be(FundErrors.CodeAlreadyExists);
        await _fundRepository.DidNotReceive().AddAsync(Arg.Any<Fund>(), Arg.Any<CancellationToken>());
    }

    [Theory]
    [InlineData("INVALID")]
    [InlineData("1234")]
    [InlineData("")]
    public async Task Handle_WithInvalidFundCode_ReturnsValidationError(string code)
    {
        var command = new CreateFundCommand(code, "Yvy FII", "FII", 1000m);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsError.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WithInvalidFundType_ReturnsError()
    {
        var command = new CreateFundCommand("YVYQ11", "Yvy FII", "INVALID_TYPE", 1000m);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsError.Should().BeTrue();
        result.FirstError.Should().Be(FundErrors.InvalidFundType);
    }

    [Fact]
    public async Task Handle_WithNegativeMinimumInvestment_ReturnsError()
    {
        var command = new CreateFundCommand("YVYQ11", "Yvy FII", "FII", -100m);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsError.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WithEmptyFundName_ReturnsError()
    {
        _fundRepository
            .ExistsByCodeAsync(Arg.Any<FundCode>(), Arg.Any<CancellationToken>())
            .Returns(false);

        var command = new CreateFundCommand("YVYQ11", "", "FII", 1000m);

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsError.Should().BeTrue();
        result.FirstError.Should().Be(FundErrors.InvalidName);
    }
}
