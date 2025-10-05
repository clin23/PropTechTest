'use client';

interface GuidedAction {
  id: string;
  title: string;
  description: string;
  cta: string;
}

interface GuidedActionsProps {
  actions: GuidedAction[];
}

export function GuidedActions({ actions }: GuidedActionsProps) {
  if (actions.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-surface/60 p-4 text-sm text-muted-foreground">
        No guided actions right now. Everything looks good!
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {actions.map((action) => (
        <div key={action.id} className="rounded-2xl border border-border/60 bg-background/80 p-4">
          <h4 className="text-sm font-semibold text-foreground">{action.title}</h4>
          <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
          <button
            type="button"
            className="mt-3 rounded-lg border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-foreground"
            onClick={() => alert(action.cta)}
          >
            {action.cta}
          </button>
        </div>
      ))}
    </div>
  );
}
