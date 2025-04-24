import React, { useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVisitors, Visitor, VisitorStatus } from '../context/VisitorContext';
import { UserCheckIcon, Clock9Icon } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { ROUTES } from '../constants/routes';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { visitors, loading, error, getFilteredVisitors } = useVisitors();
  const navigate = useNavigate();

  // Redirect to login if no user
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, authLoading, navigate]);

  // Fetch visitors when user is available
  useEffect(() => {
    if (user) {
      getFilteredVisitors();
    }
  }, [user, getFilteredVisitors]);

  const [checkedIn, preRegistered, total] = useMemo(() => [
    visitors.filter(v => v.status === 'checked-in').length,
    visitors.filter(v => v.status === 'pre-registered').length,
    visitors.length
  ], [visitors]);

  if (authLoading || loading) {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Error loading visitors: {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, <span className="font-semibold">{user?.first_name} {user?.last_name || ''}</span>. 
          Here's your visitor management overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<UserCheckIcon className="h-6 w-6" />}
          title="Total Visitors"
          value={total}
          color="blue"
        />
        <StatCard
          icon={<UserCheckIcon className="h-6 w-6" />}
          title="Currently Checked In"
          value={checkedIn}
          color="green"
        />
        <StatCard
          icon={<Clock9Icon className="h-6 w-6" />}
          title="Pre-Registered"
          value={preRegistered}
          color="yellow"
        />
      </div>

      <RecentVisitorsTable visitors={visitors} />
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: number;
  color: 'blue' | 'green' | 'yellow';
}> = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <h2 className="text-sm font-medium text-gray-500">{title}</h2>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

const RecentVisitorsTable: React.FC<{ visitors: Visitor[] }> = ({ visitors }) => {
  if (visitors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No visitors found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Recent Visitors</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Visitor', 'Department', 'Host', 'Status'].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visitors.slice(0, 5).map((visitor) => (
              <tr key={visitor.id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={visitor.avatar || `https://ui-avatars.com/api/?name=${encodeURI(visitor.name)}&background=random`}
                      alt={visitor.name}
                      className="h-9 w-9 rounded-full mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {visitor.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {visitor.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {visitor.department || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {visitor.host || 'N/A'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={visitor.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: VisitorStatus }> = ({ status }) => {
  const statusConfig = {
    'checked-in': { color: 'green', label: 'Checked In' },
    'pre-registered': { color: 'yellow', label: 'Pre-Registered' },
    'checked-out': { color: 'gray', label: 'Checked Out' },
  };

  const { color, label } = statusConfig[status] || { color: 'gray', label: 'Unknown' };

  return (
    <span
      className={`px-2.5 py-1 inline-flex text-xs leading-4 font-medium rounded-full bg-${color}-100 text-${color}-800`}
    >
      {label}
    </span>
  );
};

export default Dashboard;