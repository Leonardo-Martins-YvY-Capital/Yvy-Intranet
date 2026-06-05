using FluentAssertions;
using Yvy.Domain.Aggregates.Kanban;
using Yvy.Domain.Aggregates.Kanban.Events;
using Yvy.Domain.Errors;

namespace Yvy.Domain.Tests.Aggregates;

public sealed class KanbanCardTests
{
    private const string MessageId = "AAMkAGI2THVSAAA=";

    private static InboundEmailRef Email() =>
        InboundEmailRef.Create(MessageId, "fornecedor@acme.com", "Boleto NF 123", DateTime.UtcNow).Value;

    [Fact]
    public void CreateFromEmail_WithValidData_StartsInRecebido()
    {
        var result = KanbanCard.CreateFromEmail(ProcessType.ContasAPagar, Email(), "Boleto NF 123");

        result.IsError.Should().BeFalse();
        result.Value.Phase.Should().Be(CardPhase.Recebido);
        result.Value.ProcessType.Should().Be(ProcessType.ContasAPagar);
        result.Value.CreatedAt.Should().NotBe(default);
        result.Value.UpdatedAt.Should().BeNull();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void CreateFromEmail_WithEmptyTitle_ReturnsError(string title)
    {
        var result = KanbanCard.CreateFromEmail(ProcessType.ContasAPagar, Email(), title);

        result.IsError.Should().BeTrue();
        result.FirstError.Should().Be(KanbanCardErrors.InvalidTitle);
    }

    [Fact]
    public void CreateFromEmail_RaisesExactlyOneCreatedEvent_CarryingTheMessageId()
    {
        var card = KanbanCard
            .CreateFromEmail(ProcessType.ReembolsosInternos, Email(), "Reembolso viagem").Value;

        card.DomainEvents.Should().ContainSingle()
            .Which.Should().BeOfType<CardCreatedFromEmailDomainEvent>()
            .Which.MessageId.Should().Be(MessageId);
    }
}
