using ErrorOr;

namespace Yvy.Domain.Errors;

public static class KanbanCardErrors
{
    public static readonly Error InvalidTitle =
        Error.Validation("KanbanCard.InvalidTitle", "Card title cannot be empty.");

    public static readonly Error DuplicateEmail =
        Error.Conflict("KanbanCard.DuplicateEmail", "A card already exists for this email message.");

    public static readonly Error NotFound =
        Error.NotFound("KanbanCard.NotFound", "Card was not found.");

    // Used by the approval/transition slice (kanban-card-spec §5/§8):
    public static readonly Error InvalidTransition =
        Error.Conflict("KanbanCard.InvalidTransition", "That phase transition is not allowed.");

    public static readonly Error NoteRequired =
        Error.Validation("KanbanCard.NoteRequired", "A note is required for this action.");
}
