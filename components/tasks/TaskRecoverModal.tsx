"use client";
import type { TaskDto } from "../../types/tasks";

export default function TaskRecoverModal({
  task,
  onClose,
  onRecover,
}: {
  task: TaskDto;
  onClose: () => void;
  onRecover: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative w-[32rem] rounded-xl bg-white p-6 shadow space-y-4 dark:bg-gray-800 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-2 top-2 text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-lg font-semibold">Task Details</h2>
        <div className="space-y-2 text-sm">
          <div>
            <div className="font-medium">Title</div>
            <div>{task.title}</div>
          </div>
          {task.description && (
            <div>
              <div className="font-medium">Notes</div>
              <div>{task.description}</div>
            </div>
          )}
          {task.dueDate && (
            <div>
              <div className="font-medium">Due</div>
              <div>
                {task.dueDate}
                {task.dueTime ? ` ${task.dueTime}` : ""}
              </div>
            </div>
          )}
          {task.properties.length > 0 && (
            <div>
              <div className="font-medium">Property</div>
              <ul className="list-inside list-disc">
                {task.properties.map((p) => (
                  <li key={p.id}>{p.address}</li>
                ))}
              </ul>
            </div>
          )}
          {task.vendor && (
            <div>
              <div className="font-medium">Vendor</div>
              <div>{task.vendor.name}</div>
            </div>
          )}
          {task.attachments?.length ? (
            <div>
              <div className="font-medium">Attachments</div>
              <ul className="list-inside list-disc">
                {task.attachments.map((a) => (
                  <li key={a.url}>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:no-underline"
                    >
                      {a.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <button
          className="mt-4 w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
          onClick={onRecover}
        >
          Recover Task
        </button>
      </div>
    </div>
  );
}
