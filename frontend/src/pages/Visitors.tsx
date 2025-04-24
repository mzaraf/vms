import React, { useState, useEffect } from 'react';
import { useVisitors } from '../context/VisitorContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import api from '../services/api';
import { CheckCircleIcon, FilterIcon, SearchIcon, CheckIcon, LogOutIcon } from 'lucide-react';

const Visitors: React.FC = () => {
  const { user } = useAuth();
  const { visitors, refreshVisitors } = useVisitors();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [successAction, setSuccessAction] = useState<{
    type: string;
    name: string;
  }>({
    type: '',
    name: ''
  });
 
  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) || visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) || visitor.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || visitor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  useEffect(() => {
    refreshVisitors();
  }, []);
  const handleCheckIn = async (id: string, name: string) => {
    try {
      await api.post(`/visitors/${id}/check_in/`);
      await refreshVisitors();
      setSuccessAction({ type: 'check-in', name });
      setShowSuccessCard(true);
      toast.success(`${name} has been checked in`);
    } catch (error) {
      toast.error('Check-in failed');
    }
  };

  const handleCheckOut = async (id: string, name: string) => {
    try {
      await api.post(`/visitors/${id}/check_out/`);
      await refreshVisitors();
      setSuccessAction({ type: 'check-out', name });
      setShowSuccessCard(true);
      toast.success(`${name} has been checked out`);
    } catch (error) {
      toast.error('Check-out failed');
    }
  };

  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Visitors</h1>
        <p className="text-gray-600">
          View and manage all visitors in the system.
        </p>
      </div>
      {showSuccessCard && <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500 mb-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
            <div>
              <p className="font-medium text-gray-800">
                {successAction.type === 'check-in' ? `${successAction.name} has been successfully checked in.` : `${successAction.name} has been successfully checked out.`}
              </p>
            </div>
          </div>
        </div>}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" placeholder="Search visitors..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center">
              <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2">
                <option value="all">All Status</option>
                <option value="pre-registered">Pre-Registered</option>
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visitor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Host
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visit Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In/Out Time
                </th>
                {user?.role !== 'director' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVisitors.length > 0 ? filteredVisitors.map(visitor => <tr key={visitor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={visitor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(visitor.name)}&background=random`} alt={visitor.name} className="h-10 w-10 rounded-full mr-3" />
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.organization || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.host}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${visitor.status === 'checked-in' ? 'bg-green-100 text-green-800' : visitor.status === 'pre-registered' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {visitor.status === 'checked-in' ? 'Checked In' : visitor.status === 'pre-registered' ? 'Pre-Registered' : 'Checked Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.visit_date ? new Date(visitor.visit_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {visitor.check_in_time && <div>
                          In:{' '}
                          {new Date(visitor.check_in_time).toLocaleTimeString()}
                        </div>}
                      {visitor.check_out_time && <div>
                          Out:{' '}
                          {new Date(visitor.check_out_time).toLocaleTimeString()}
                        </div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {visitor.status === 'pre-registered' && <button onClick={() => handleCheckIn(visitor.id, visitor.name)} className="text-green-600 hover:text-green-900 mr-3" disabled={user?.role === 'director'} title={user?.role === 'director' ? 'Directors cannot check in visitors' : 'Check in visitor'}>
                          <CheckIcon className="h-5 w-5" />
                        </button>}
                      {visitor.status === 'checked-in' && <button onClick={() => handleCheckOut(visitor.id, visitor.name)} className="text-red-600 hover:text-red-900" disabled={user?.role === 'director'} title={user?.role === 'director' ? 'Directors cannot check out visitors' : 'Check out visitor'}>
                          <LogOutIcon className="h-5 w-5" />
                        </button>}
                      {user?.role === 'director' && (visitor.status === 'pre-registered' || visitor.status === 'checked-in') && <span className="text-sm text-gray-400">
                            Action not available
                          </span>}
                    </td>
                  </tr>) : <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No visitors found matching your search criteria
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
        {filteredVisitors.length > 0 && <div className="px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {filteredVisitors.length} of {visitors.length} visitors
            </p>
          </div>}
      </div>
    </div>;
};
export default Visitors;