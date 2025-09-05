export default function ErrorState({ message = "An unexpected error occurred." }: { message?: string }) {
  return <div className="p-4 text-center text-red-600">{message}</div>;
}
