using FluentAssertions;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Tests.ValueObjects;

public sealed class MoneyTests
{
    [Theory]
    [InlineData(0)]
    [InlineData(1000.50)]
    [InlineData(9999999.99)]
    public void Create_WithValidAmount_ReturnsSuccess(decimal amount)
    {
        var result = Money.Create(amount);

        result.IsError.Should().BeFalse();
        result.Value.Amount.Should().Be(amount);
        result.Value.Currency.Should().Be("BRL");
    }

    [Fact]
    public void Create_WithNegativeAmount_ReturnsError()
    {
        var result = Money.Create(-0.01m);

        result.IsError.Should().BeTrue();
    }

    [Fact]
    public void Add_TwoMoneyWithSameCurrency_ReturnsSum()
    {
        var a = Money.Create(100m).Value;
        var b = Money.Create(250.50m).Value;

        var result = a + b;

        result.Amount.Should().Be(350.50m);
        result.Currency.Should().Be("BRL");
    }

    [Fact]
    public void TwoMoneyWithSameValues_AreEqual()
    {
        var a = Money.Create(100m).Value;
        var b = Money.Create(100m).Value;

        a.Should().Be(b);
        (a == b).Should().BeTrue();
    }

    [Fact]
    public void TwoMoneyWithDifferentAmounts_AreNotEqual()
    {
        var a = Money.Create(100m).Value;
        var b = Money.Create(200m).Value;

        a.Should().NotBe(b);
    }

    [Fact]
    public void Zero_HasZeroAmountAndBRL()
    {
        Money.Zero.Amount.Should().Be(0);
        Money.Zero.Currency.Should().Be("BRL");
    }
}
