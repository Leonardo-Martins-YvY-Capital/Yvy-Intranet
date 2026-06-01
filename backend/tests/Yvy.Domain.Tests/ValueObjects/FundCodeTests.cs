using FluentAssertions;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Tests.ValueObjects;

public sealed class FundCodeTests
{
    [Theory]
    [InlineData("YVYQ11")]
    [InlineData("KNRI11")]
    [InlineData("MXRF11")]
    [InlineData("yvyq11")]
    public void Create_WithValidFundCode_ReturnsSuccess(string input)
    {
        var result = FundCode.Create(input);

        result.IsError.Should().BeFalse();
        result.Value.Value.Should().Be(input.ToUpperInvariant());
    }

    [Theory]
    [InlineData("")]
    [InlineData("YVY")]
    [InlineData("11")]
    [InlineData("YVYQ1")]
    [InlineData("YVYQABC")]
    [InlineData("12345678")]
    public void Create_WithInvalidFundCode_ReturnsError(string input)
    {
        var result = FundCode.Create(input);

        result.IsError.Should().BeTrue();
    }

    [Fact]
    public void TwoFundCodesWithSameValue_AreEqual()
    {
        var a = FundCode.Create("YVYQ11").Value;
        var b = FundCode.Create("yvyq11").Value;

        a.Should().Be(b);
    }
}
