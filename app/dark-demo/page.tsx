import DarkModeToggle from "../../components/DarkModeToggle";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import ApplicationsTable from "../../components/ApplicationsTable";

export default function Page() {
  const rows = [
    { id: "1", applicant: "Jane Doe", property: "123 Main", status: "New" },
  ];
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-end">
        <DarkModeToggle />
      </div>
      <div className="p-4 bg-bg-surface border border-[var(--border)] rounded shadow-sm space-y-2">
        <h2 className="font-semibold">Buttons</h2>
        <div className="space-x-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>
      <div className="p-4 bg-bg-surface border border-[var(--border)] rounded shadow-sm space-y-2">
        <h2 className="font-semibold">Input</h2>
        <Input placeholder="Placeholder" />
      </div>
      <div className="p-4 bg-bg-surface border border-[var(--border)] rounded shadow-sm space-y-2">
        <h2 className="font-semibold">Table</h2>
        <ApplicationsTable rows={rows} />
      </div>
    </div>
  );
}
