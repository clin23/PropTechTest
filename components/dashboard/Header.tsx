import { formatDate } from '../../lib/format';

interface Props {
  date: Date;
}

export default function Header({ date }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="text-2xl font-bold mt-2 md:mt-0">
        {formatDate(date)}
      </div>
    </div>
  );
}
