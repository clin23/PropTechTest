import { TenantWorkspacePage } from '../../../components/tenants/TenantWorkspacePage';

export const metadata = {
  title: 'Tenant CRM',
};

export default function TenantDirectoryPage() {
  return <TenantWorkspacePage />;
}

function useSplitPane(initialPercentage: number) {
  const [leftWidth, setLeftWidth] = useState(initialPercentage);

  const onDragStart = useCallback((event?: MouseEvent, deltaFromKey?: number) => {
    if (typeof deltaFromKey === 'number') {
      setLeftWidth((prev) => clamp(prev + deltaFromKey, 18, 60));
      return;
    }
    if (!event) return;
    const startX = event.clientX;
    const handleMove = (move: MouseEvent) => {
      const delta = move.clientX - startX;
      const percentage = (delta / window.innerWidth) * 100;
      setLeftWidth((prev) => clamp(prev + percentage, 18, 60));
    };
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, []);

  return { leftWidth, onDragStart };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}
