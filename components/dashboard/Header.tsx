import { format } from 'date-fns';

interface Props {
  from: Date;
  to: Date;
}

export default function Header({ from, to }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="text-sm text-gray-500 mt-2 md:mt-0">
        {format(from, 'dd MMM yyyy')} – {format(to, 'dd MMM yyyy')}
      </div>
    </div>
  );
}
