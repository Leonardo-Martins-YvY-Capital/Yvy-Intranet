namespace Yvy.Api.Endpoints.Webhooks;

/// <summary>
/// Microsoft Graph change-notification payload (lean / id-only — email-ingestion-spec §3b). Bound from
/// the request body with the app's default (camelCase, case-insensitive) JSON options. All fields are
/// treated as untrusted input; <c>clientState</c> is validated before anything is persisted.
/// </summary>
public sealed record GraphNotificationBatch(IReadOnlyList<GraphNotificationItem>? Value);

public sealed record GraphNotificationItem(
    string? SubscriptionId,
    string? ClientState,
    string? ChangeType,
    string? Resource,
    GraphResourceData? ResourceData);

public sealed record GraphResourceData(string? Id);
