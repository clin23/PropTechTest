import InspectionRoomList from '../../../components/InspectionRoomList';
import InspectionItemCard from '../../../components/InspectionItemCard';

export default function InspectionDetail({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Inspection {params.id}</h1>
      <div className="grid grid-cols-2 gap-4">
        <InspectionRoomList />
        <InspectionItemCard />
      </div>
    </div>
  );
}
