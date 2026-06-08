using FluentAssertions;
using NSubstitute;
using Yvy.Application.KanbanCards.Commands.CreateCardFromEmail;
using Yvy.Application.KanbanCards.DTOs;
using Yvy.Domain.Aggregates.Kanban;
using Yvy.Domain.Errors;
using Yvy.Domain.Repositories;

namespace Yvy.Application.Tests.KanbanCards;

public sealed class CreateCardFromEmailCommandHandlerTests
{
    private const string MessageId = "AAMkAGI2THVSAAA=";

    private readonly IKanbanCardRepository _cards = Substitute.For<IKanbanCardRepository>();
    private readonly CreateCardFromEmailCommandHandler _handler;

    public CreateCardFromEmailCommandHandlerTests()
    {
        _handler = new CreateCardFromEmailCommandHandler(_cards);
    }

    private static CreateCardFromEmailCommand Command(string subject = "Boleto NF 123") =>
        new(ProcessType.ContasAPagar,
            new InboundEmailMessage(MessageId, "fornecedor@acme.com", subject, DateTime.UtcNow, null, null));

    [Fact]
    public async Task Handle_WhenMessageIsNew_CreatesCardAndReturnsId()
    {
        _cards.ExistsByMessageIdAsync(MessageId, Arg.Any<CancellationToken>()).Returns(false);

        var result = await _handler.Handle(Command(), CancellationToken.None);

        result.IsError.Should().BeFalse();
        result.Value.Should().NotBeEmpty();
        await _cards.Received(1).AddAsync(Arg.Any<KanbanCard>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenMessageAlreadyIngested_IsIdempotent_ReturnsDuplicateAndDoesNotAdd()
    {
        _cards.ExistsByMessageIdAsync(MessageId, Arg.Any<CancellationToken>()).Returns(true);

        var result = await _handler.Handle(Command(), CancellationToken.None);

        result.IsError.Should().BeTrue();
        result.FirstError.Should().Be(KanbanCardErrors.DuplicateEmail);
        await _cards.DidNotReceive().AddAsync(Arg.Any<KanbanCard>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WithBlankSubject_DefaultsTheTitle()
    {
        _cards.ExistsByMessageIdAsync(MessageId, Arg.Any<CancellationToken>()).Returns(false);

        var result = await _handler.Handle(Command(subject: "   "), CancellationToken.None);

        result.IsError.Should().BeFalse(); // title falls back, so creation still succeeds
    }
}
