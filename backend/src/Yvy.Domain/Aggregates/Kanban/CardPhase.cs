namespace Yvy.Domain.Aggregates.Kanban;

/// <summary>Union of phases across both processes (see kanban-card-spec §4).</summary>
public enum CardPhase
{
    Recebido,
    Triagem,
    EmAnalise,
    AguardandoAprovacao,
    Aprovado,
    Pago,
    Reembolsado,
    Recusado,
    Cancelado
}
