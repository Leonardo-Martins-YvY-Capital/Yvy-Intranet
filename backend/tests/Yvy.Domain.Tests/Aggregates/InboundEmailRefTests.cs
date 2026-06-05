using FluentAssertions;
using Yvy.Domain.Aggregates.Kanban;

namespace Yvy.Domain.Tests.Aggregates;

public sealed class InboundEmailRefTests
{
    [Fact]
    public void Create_WithValidMessageId_Succeeds()
    {
        var result = InboundEmailRef.Create("msg-1", "a@b.com", "Subject", DateTime.UtcNow);

        result.IsError.Should().BeFalse();
        result.Value.MessageId.Should().Be("msg-1");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyMessageId_ReturnsError(string id)
    {
        InboundEmailRef.Create(id, "a@b.com", "Subject", DateTime.UtcNow).IsError.Should().BeTrue();
    }

    [Fact]
    public void TwoRefsWithSameMessageId_AreEqual()
    {
        var a = InboundEmailRef.Create("same-id", "a@b.com", "S1", DateTime.UtcNow).Value;
        var b = InboundEmailRef.Create("same-id", "c@d.com", "S2", DateTime.UtcNow).Value;

        a.Should().Be(b);
    }
}
