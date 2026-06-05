namespace Yvy.Application.KanbanCards.DTOs;

/// <summary>An active Microsoft Graph change-notification subscription (plain application DTO).</summary>
public sealed record GraphSubscription(string SubscriptionId, DateTime ExpiresAt);
