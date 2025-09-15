import { formatMoney, formatDate, statusToBadgeColor } from '../../lib/format';
import type { PropertyCardData } from '../../types/dashboard';

interface Props {
  data: PropertyCardData;
}

export default function PropertyCard({ data }: Props) {
  return (
    <div className="p-4 rounded-2xl card space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{data.name}</h3>
      </div>
      <div className="p-3 rounded-lg bg-bg-elevated">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-text-secondary">Next Rent Due</div>
            <div className="text-lg font-bold text-text-primary">{formatMoney(data.rentDue.amountCents)}</div>
            <div className="text-xs text-text-muted">{formatDate(data.rentDue.nextDueDate)}</div>
          </div>
          <span className={`px-2 py-1 text-xs rounded ${statusToBadgeColor(data.rentDue.status)}`}>
            {data.rentDue.status}
          </span>
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold mb-1">Key Dates/Alerts</div>
        <ul className="space-y-1">
          {data.alerts.slice(0, 3).map((a) => (
            <li key={a.id} className="text-sm">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${statusToBadgeColor(a.severity)}`}></span>
              {a.label}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="text-sm font-semibold mb-1">Current Tasks</div>
        <ul className="space-y-1">
          {data.tasks.slice(0, 3).map((t) => (
            <li key={t.id} className="text-sm">
              {t.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
