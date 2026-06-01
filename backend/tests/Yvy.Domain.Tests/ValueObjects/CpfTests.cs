using FluentAssertions;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Tests.ValueObjects;

public sealed class CpfTests
{
    [Theory]
    [InlineData("529.982.247-25")]
    [InlineData("52998224725")]
    public void Create_WithValidCpf_ReturnsSuccess(string input)
    {
        var result = Cpf.Create(input);

        result.IsError.Should().BeFalse();
        result.Value.Value.Should().Be("52998224725");
    }

    [Theory]
    [InlineData("000.000.000-00")]
    [InlineData("111.111.111-11")]
    [InlineData("123.456.789-00")]
    [InlineData("")]
    [InlineData("abc")]
    [InlineData("1234567890")]
    public void Create_WithInvalidCpf_ReturnsError(string input)
    {
        var result = Cpf.Create(input);

        result.IsError.Should().BeTrue();
    }

    [Fact]
    public void Formatted_ReturnsFormattedString()
    {
        var cpf = Cpf.Create("52998224725").Value;

        cpf.Formatted.Should().Be("529.982.247-25");
    }

    [Fact]
    public void TwoCpfsWithSameDigits_AreEqual()
    {
        var cpf1 = Cpf.Create("52998224725").Value;
        var cpf2 = Cpf.Create("529.982.247-25").Value;

        cpf1.Should().Be(cpf2);
    }
}
