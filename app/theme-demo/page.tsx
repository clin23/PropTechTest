import { Button } from "../../components/ui/button";

export default function ThemeDemo() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div data-theme="light" className="space-y-4 p-4 rounded card">
        <h2 className="font-semibold">Light Theme</h2>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
      <div data-theme="dark" className="space-y-4 p-4 rounded card">
        <h2 className="font-semibold">Dark Theme</h2>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
    </div>
  );
}

