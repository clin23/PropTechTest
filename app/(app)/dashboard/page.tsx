import DashboardPage from '../../../components/dashboard/DashboardPage';
import PageTransition from '../../../components/PageTransition';

export default function Page() {
  return (
    <PageTransition routeKey="/dashboard">
      <DashboardPage />
    </PageTransition>
  );
}
