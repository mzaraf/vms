import React, { useState, useEffect, useRef } from 'react';
import { useVisitors } from '../context/VisitorContext';
import { toast } from 'sonner';
import { CheckCircleIcon } from 'lucide-react';
import api from '../services/api';
import ErrorBoundary from '../components/ErrorBoundary';

const CheckIn: React.FC = () => {
  const { departments, refreshVisitors } = useVisitors();
  const [showSuccess, setShowSuccess] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const initialState = {
    name: '',
    email: '',
    phone: '',
    purpose: '',
    department_id: '',
    host: '',
    organization: '',
    address: '',
    visit_date: new Date().toISOString().split('T')[0]
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    const verifyDepartments = () => {
      try {
        if (!Array.isArray(departments)) {
          throw new Error('Departments data is not available');
        }
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load department data');
        setLoading(false);
      }
    };

    verifyDepartments();
  }, [departments]);

  useEffect(() => {
      if (!loading && nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, [loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'name') {
      setAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(value)}&background=random`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const today = new Date().toISOString().split('T')[0];
    if (new Date(formData.visit_date) < new Date(today)) {
      toast.error('Visit date cannot be in the past. Please choose today or a future date.');
      return;
    }
  
    try {
      // Validate required fields
      if (!formData.department_id || !formData.host) {
        throw new Error('Department and Host are required fields');
      }
  
      // Prepare payload according to backend serializer
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        purpose: formData.purpose,
        department_id: formData.department_id,
        host: formData.host,
        organization: formData.organization,
        address: formData.address,
        visit_date: formData.visit_date,
        status: 'checked-in',
        check_in_time: new Date().toISOString(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}`
      };
  
      const response = await api.post('/visitors/', payload);
  
      if (!response.data?.id) {
        throw new Error('Failed to create visitor record');
      }
  
      await refreshVisitors?.();
      setVisitorName(formData.name);
      setShowSuccess(true);
      setFormData(initialState);
      setAvatar('');
      toast.success('Visitor checked in successfully');
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to check in visitor');
    }
  };  

  if (loading) {
    return <div className="p-4 text-gray-600">Loading check-in form...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <ErrorBoundary>
      <div className="p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Check In Visitor</h1>
          <p className="text-gray-600">
            Register and check in a new visitor directly.
          </p>
        </div>

        {showSuccess && (
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500 mb-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <p className="font-medium text-gray-800">
                  {visitorName} has been successfully checked in.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      ref={nameInputRef}
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select 
                      id="department_id" 
                      name="department_id" 
                      value={formData.department_id} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                      required
                    >
                      <option value="">Select Department</option>
                      {Array.isArray(departments) && departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                        Organization
                      </label>
                      <input 
                        type="text" 
                        id="organization" 
                        name="organization" 
                        value={formData.organization} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input 
                        type="text" 
                        id="address" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="host" className="block text-sm font-medium text-gray-700 mb-1">
                      Host Name
                    </label>
                    <input 
                      type="text" 
                      id="host" 
                      name="host" 
                      value={formData.host} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                      required 
                    />
                  </div>

                <div className="mb-6">
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose of Visit
                  </label>
                  <textarea 
                    id="purpose" 
                    name="purpose" 
                    value={formData.purpose} 
                    onChange={handleChange} 
                    rows={3} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    required 
                  />
                </div>

                <div className="mb-6">
                    <label htmlFor="visit_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Visit Date
                    </label>
                    <input 
                      type="date" 
                      id="visit_date" 
                      name="visit_date" 
                      value={formData.visit_date} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                      required 
                    />
                  </div>

                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Check In Visitor
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div>
            {avatar && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">
                  Visitor Preview
                </h3>
                <div className="flex items-center">
                  <img 
                    src={avatar} 
                    alt="Visitor avatar" 
                    className="h-16 w-16 rounded-full object-cover" 
                  />
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">{formData.name}</p>
                    <p className="text-sm text-gray-500">{formData.email}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">
                Check-in Instructions
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mr-3">
                    1
                  </span>
                  <span>Fill in visitor's personal information</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mr-3">
                    2
                  </span>
                  <span>Select today's date for immediate check-in</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mr-3">
                    3
                  </span>
                  <span>Assign the appropriate department and host</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mr-3">
                    4
                  </span>
                  <span>Specify the purpose of the visit</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CheckIn;