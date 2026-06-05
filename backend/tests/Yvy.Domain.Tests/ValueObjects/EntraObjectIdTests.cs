using FluentAssertions;
using Yvy.Domain.ValueObjects;

namespace Yvy.Domain.Tests.ValueObjects;

public sealed class EntraObjectIdTests
{
    [Theory]
    [InlineData("3fa85f64-5717-4562-b3fc-2c963f66afa6")]
    [InlineData("00000000-0000-0000-0000-000000000001")]
    public void Create_WithValidGuid_ReturnsSuccess(string input)
    {
        var result = EntraObjectId.Create(input);

        result.IsError.Should().BeFalse();
        result.Value.Value.Should().Be(input.ToLowerInvariant());
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not-a-guid")]
    [InlineData("00000000-0000-0000-0000-000000000000")] // Guid.Empty is rejected
    public void Create_WithInvalidOrEmptyGuid_ReturnsError(string input)
    {
        var result = EntraObjectId.Create(input);

        result.IsError.Should().BeTrue();
    }

    [Fact]
    public void TwoIdsWithSameValueDifferentCase_AreEqual()
    {
        var a = EntraObjectId.Create("3FA85F64-5717-4562-B3FC-2C963F66AFA6").Value;
        var b = EntraObjectId.Create("3fa85f64-5717-4562-b3fc-2c963f66afa6").Value;

        a.Should().Be(b);
    }
}
