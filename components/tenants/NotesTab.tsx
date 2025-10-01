'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  type Note,
  type NoteInput,
  useCreateNote,
  useDeleteNote,
  useNotes,
  useUpdateNote,
} from '../../lib/api/tenants';
import { useToast } from '../ui/use-toast';

const TAG_OPTIONS: Array<{ value: NoteInput['tags'][number]; label: string }> = [
  { value: 'general', label: 'General' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'arrears', label: 'Arrears' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'comms', label: 'Comms' },
];

interface NotesTabProps {
  tenantId: string;
  tenantName: string;
}

type NoteFilter = NoteInput['tags'][number] | 'all';

export function NotesTab({ tenantId, tenantName }: NotesTabProps) {
  const notesQuery = useNotes(tenantId);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const { toast } = useToast();

  const [body, setBody] = useState('');
  const [tags, setTags] = useState<NoteInput['tags']>(['general']);
  const [followUpAt, setFollowUpAt] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<NoteFilter>('all');
  const [filterText, setFilterText] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        if (editingNote) {
          handleUpdate(editingNote.id);
        } else {
          handleSubmit();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editingNote, body, tags, followUpAt]);

  const filteredNotes = useMemo(() => {
    const items = notesQuery.data ?? [];
    return items.filter((note) => {
      const matchesTag = filterTag === 'all' || note.tags.includes(filterTag);
      const matchesText = filterText
        ? note.body.toLowerCase().includes(filterText.toLowerCase())
        : true;
      return matchesTag && matchesText;
    });
  }, [filterTag, filterText, notesQuery.data]);

  function resetComposer() {
    setBody('');
    setTags(['general']);
    setFollowUpAt(null);
    setEditingNote(null);
  }

  function parseCommands(text: string, currentTags: NoteInput['tags'], currentFollowUp: string | null) {
    const tokens = text.split(/\s+/);
    const uniqueTags = new Set(currentTags);
    let reminder: string | null = currentFollowUp;
    for (const token of tokens) {
      switch (token.toLowerCase()) {
        case '/maint':
          uniqueTags.add('maintenance');
          break;
        case '/arrears':
          uniqueTags.add('arrears');
          break;
        case '/inspect':
          uniqueTags.add('inspection');
          break;
        default:
          if (token.startsWith('/followup')) {
            const [, arg] = token.split(':');
            const amount = Number(arg?.replace(/[^0-9]/g, ''));
            if (!Number.isNaN(amount)) {
              reminder = new Date(Date.now() + amount * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 16);
            }
          }
          break;
      }
    }
    const parsedTags = Array.from(uniqueTags);
    return { tags: parsedTags, followUp: reminder };
  }

  async function handleSubmit() {
    if (!body.trim()) {
      toast({ title: 'Add a note body before submitting', variant: 'destructive' });
      return;
    }
    const parsed = parseCommands(body, tags, followUpAt);
    setTags(parsed.tags);
    setFollowUpAt(parsed.followUp);

    const payload: NoteInput = {
      tenantId,
      body,
      tags: parsed.tags,
      followUpAt: parsed.followUp ? new Date(parsed.followUp).toISOString() : null,
    };
    await createNote.mutateAsync(payload, {
      onSuccess: () => {
        toast({ title: 'Note added', description: `Saved for ${tenantName}` });
        resetComposer();
      },
      onError: () => {
        toast({ title: 'Failed to add note', variant: 'destructive' });
      },
    });
  }

  async function handleUpdate(noteId: string) {
    if (!editingNote) return;
    const parsed = parseCommands(body, tags, followUpAt);
    setTags(parsed.tags);
    setFollowUpAt(parsed.followUp);
    const payload: Partial<NoteInput> = {
      tenantId,
      body,
      tags: parsed.tags,
      followUpAt: parsed.followUp ? new Date(parsed.followUp).toISOString() : undefined,
    };
    await updateNote.mutateAsync(
      { id: noteId, input: payload },
      {
        onSuccess: () => {
          toast({ title: 'Note updated' });
          resetComposer();
        },
        onError: () => toast({ title: 'Failed to update note', variant: 'destructive' }),
      }
    );
  }

  async function handleDelete(note: Note) {
    await deleteNote.mutateAsync(
      { id: note.id, tenantId },
      {
        onSuccess: () => toast({ title: 'Note deleted' }),
        onError: () => toast({ title: 'Failed to delete note', variant: 'destructive' }),
      }
    );
  }

  const composerLabel = editingNote ? 'Update note' : 'Add note';

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border/60 bg-background/40 px-6 py-4">
        <label className="block text-sm font-semibold text-foreground" htmlFor="note-body">
          Smart note
        </label>
        <textarea
          id="note-body"
          value={body}
          onChange={(event) => {
            const nextBody = event.target.value;
            setBody(nextBody);
            const parsed = parseCommands(nextBody, tags, followUpAt);
            setTags(parsed.tags);
            setFollowUpAt(parsed.followUp);
          }}
          placeholder="Capture call summaries, visit outcomes, or reminders… Try /arrears or !tomorrow 9am."
          className="mt-2 h-32 w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/60"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <TagSelector value={tags} onChange={setTags} />
          <div className="flex items-center gap-2">
            <label htmlFor="followUp" className="text-xs font-medium text-muted-foreground">
              Reminder
            </label>
            <input
              id="followUp"
              type="datetime-local"
              value={followUpAt ?? ''}
              onChange={(event) => setFollowUpAt(event.target.value || null)}
              className="rounded-md border border-border/60 bg-surface px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <span className="rounded bg-surface/80 px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              {timezone}
            </span>
          </div>
          <button
            type="button"
            onClick={editingNote ? () => handleUpdate(editingNote.id) : handleSubmit}
            className="ml-auto inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {composerLabel} (⌘⏎)
          </button>
          {editingNote ? (
            <button
              type="button"
              onClick={resetComposer}
              className="rounded-md border border-border/60 px-3 py-1 text-xs font-medium text-muted-foreground hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-3 border-b border-border/60 bg-surface/70 px-6 py-3 text-xs">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground">Tag</label>
          <select
            value={filterTag}
            onChange={(event) => setFilterTag(event.target.value as NoteFilter)}
            className="rounded-md border border-border/60 bg-surface px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="all">All</option>
            {TAG_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative flex-1">
          <input
            value={filterText}
            onChange={(event) => setFilterText(event.target.value)}
            placeholder="Filter notes"
            className="w-full rounded-md border border-border/60 bg-surface px-3 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {notesQuery.isLoading ? (
          <NoteSkeleton />
        ) : filteredNotes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">No notes yet.</p>
            <p>Add your first note and set a follow-up.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {filteredNotes.map((note) => (
              <li key={note.id} className="rounded-lg border border-border/60 bg-background/60 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{formatDateTime(note.createdAt)}</p>
                    <article
                      className="prose prose-sm mt-2 max-w-none text-foreground prose-p:mt-0 prose-p:mb-2 dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(note.body) }}
                    />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${tagClass(note.tags[0])}`}>
                      {note.tags[0] ?? 'general'}
                    </span>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setBody(note.body);
                          setTags(note.tags);
                          setFollowUpAt(note.followUpAt ?? null);
                          setEditingNote(note);
                        }}
                        className="rounded border border-border/60 px-2 py-1 text-xs text-muted-foreground hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(note)}
                        className="rounded border border-border/60 px-2 py-1 text-xs text-muted-foreground hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TagSelector({ value, onChange }: { value: NoteInput['tags']; onChange: (tags: NoteInput['tags']) => void }) {
  const [draft, setDraft] = useState('');
  function addTag(tag: NoteInput['tags'][number]) {
    if (!value.includes(tag)) {
      onChange([...value, tag]);
    }
    setDraft('');
  }
  return (
    <div className="flex items-center gap-2 rounded-md border border-border/60 bg-surface px-2 py-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tags</span>
      <div className="flex flex-wrap gap-1">
        {value.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(value.filter((item) => item !== tag))}
            className={`${tagClass(tag)} inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]`}
          >
            {tag}
            <span aria-hidden>×</span>
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          list="note-tags"
          placeholder="Add"
          className="w-20 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && draft) {
              event.preventDefault();
              addTag(draft as NoteInput['tags'][number]);
            }
          }}
        />
        <datalist id="note-tags">
          {TAG_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </datalist>
      </div>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function renderMarkdown(body: string) {
  const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let result = escapeHtml(body);
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/_(.*?)_/g, '<em>$1</em>');
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
  result = result.replace(/\n/g, '<br />');
  return result;
}

function tagClass(tag?: string) {
  switch (tag) {
    case 'maintenance':
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
    case 'arrears':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
    case 'inspection':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    case 'comms':
      return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
    case 'general':
    default:
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
  }
}

function NoteSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg border border-border/50 bg-muted/30 p-4">
          <div className="h-3 w-1/3 rounded bg-muted" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-full rounded bg-muted/80" />
            <div className="h-3 w-2/3 rounded bg-muted/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

