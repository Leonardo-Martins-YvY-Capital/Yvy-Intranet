namespace Yvy.Application.KanbanCards.DTOs;

/// <summary>
/// A fetched inbound email, as the gateway exposes it to the application — a plain DTO, deliberately
/// decoupled from any Microsoft Graph SDK type. (Attachments are added with the storage decision.)
/// </summary>
public sealed record InboundEmailMessage(
    string MessageId,
    string From,
    string Subject,
    DateTime ReceivedAt,
    string? BodyPreview,
    string? RawBodyRef);
