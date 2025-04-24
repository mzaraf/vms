import React, { useState, useEffect } from 'react';
import { useVisitors } from '../context/VisitorContext';
import { useAuth } from '../context/AuthContext';
import { BarChart3Icon, PieChartIcon, CalendarIcon, CheckIcon, LogOutIcon } from 'lucide-react';
import ErrorBoundary from '../components/ErrorBoundary';

interface VisitorStat {
  date: string;
  count: number;
}

interface DepartmentStat {
  department: string;
  count: number;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const { getVisitorStats, getDepartmentStats } = useVisitors();
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('week');
  const [visitorStats, setVisitorStats] = useState<VisitorStat[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [visitorData, departmentData] = await Promise.all([
          getVisitorStats(timePeriod),
          getDepartmentStats()
        ]);

        // Ensure data is in correct format
        const processedVisitorStats = Array.isArray(visitorData) 
          ? visitorData.map(item => ({
              date: item.date || '',
              count: typeof item.count === 'number' ? item.count : 0
            }))
          : [];

        const processedDepartmentStats = Array.isArray(departmentData)
          ? departmentData.map(item => ({
              department: item.department || 'Unknown',
              count: typeof item.count === 'number' ? item.count : 0
            }))
          : [];

        setVisitorStats(processedVisitorStats);
        setDepartmentStats(processedDepartmentStats);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timePeriod, getVisitorStats, getDepartmentStats]);

  const maxVisitorCount = Math.max(...visitorStats.map(stat => stat.count), 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600">
            {user?.role === 'director' 
              ? `View visitor analytics for the ${user.department} department.` 
              : 'View comprehensive visitor analytics across all departments.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Visitor Trends</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setTimePeriod('week')} 
                  className={`px-3 py-1 text-sm rounded-md ${timePeriod === 'week' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Week
                </button>
                <button 
                  onClick={() => setTimePeriod('month')} 
                  className={`px-3 py-1 text-sm rounded-md ${timePeriod === 'month' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Month
                </button>
                <button 
                  onClick={() => setTimePeriod('year')} 
                  className={`px-3 py-1 text-sm rounded-md ${timePeriod === 'year' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Year
                </button>
              </div>
            </div>
            <div className="h-64 flex items-end space-x-2">
              {visitorStats.length > 0 ? (
                visitorStats.map((stat, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t-md transition-all duration-500" 
                      style={{
                        height: `${stat.count / maxVisitorCount * 100}%`,
                        minHeight: stat.count > 0 ? '20px' : '4px'
                      }}
                    >
                      <div className="h-full w-full hover:bg-blue-400 transition-colors cursor-pointer rounded-t-md flex items-center justify-center">
                        {stat.count > 0 && (
                          <span className="text-white font-bold text-xs">{stat.count}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 mt-2">{stat.date}</span>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-400">No visitor data available for the selected period</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5 text-blue-600" />
              Department Distribution
            </h2>
            {departmentStats.length > 0 ? (
              <div className="space-y-4">
                {departmentStats.map((stat, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {stat.department}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {stat.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{
                          width: `${stat.count / Math.max(...departmentStats.map(s => s.count), 1) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-400">No department data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">This Week</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {visitorStats.reduce((sum, stat) => sum + stat.count, 0)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Total visitors in the past 7 days</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">This Month</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {visitorStats.reduce((sum, stat) => sum + stat.count, 0)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Total visitors in the past 30 days</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">This Year</h3>
                <p className="text-3xl font-bold text-gray-900">
                  {visitorStats.reduce((sum, stat) => sum + stat.count, 0)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Total visitors in the past 365 days</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Analytics;