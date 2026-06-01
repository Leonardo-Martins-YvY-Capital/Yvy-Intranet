using FluentAssertions;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Tests.ValueObjects;

public sealed class EmailTests
{
    [Theory]
    [InlineData("leonardo@yvy.capital")]
    [InlineData("ir@yvy.capital.com.br")]
    [InlineData("test+tag@example.com")]
    public void Create_WithValidEmail_ReturnsSuccess(string input)
    {
        var result = Email.Create(input);

        result.IsError.Should().BeFalse();
        result.Value.Value.Should().Be(input.ToLowerInvariant());
    }

    [Theory]
    [InlineData("")]
    [InlineData("notanemail")]
    [InlineData("@nodomain")]
    [InlineData("no@")]
    public void Create_WithInvalidEmail_ReturnsError(string input)
    {
        var result = Email.Create(input);

        result.IsError.Should().BeTrue();
    }

    [Fact]
    public void TwoEmailsWithSameValue_AreEqual()
    {
        var a = Email.Create("test@yvy.capital").Value;
        var b = Email.Create("TEST@YVY.CAPITAL").Value;

        a.Should().Be(b);
    }
}
