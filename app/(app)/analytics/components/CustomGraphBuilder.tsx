interface Props {
  onRun: () => void;
}

export default function CustomGraphBuilder({ onRun }: Props) {
  return (
    <div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onRun} data-testid="custom-builder-run">
        Run Custom Graph
      </button>
    </div>
  );
}
