import TasksArchive from "../../../../components/tasks/TasksArchive";

export default function TasksArchivePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Tasks Archive</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Review archived tasks and recover items when needed.
        </p>
      </div>
      <TasksArchive />
    </div>
  );
}
