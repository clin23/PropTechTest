export default function EmptyState({ message = "No records found." }: { message?: string }) {
  return (
    <div className="p-4 text-center text-gray-500">{message}</div>
  );
}
