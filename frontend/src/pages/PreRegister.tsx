import React, { useState, useEffect, useRef } from 'react';
import { useVisitors } from '../context/VisitorContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { CheckCircleIcon } from 'lucide-react';
import api from '../services/api';
import ErrorBoundary from '../components/ErrorBoundary';

const PreRegister: React.FC = () => {
  const { departments, loading: visitorsLoading, refreshVisitors }: any = useVisitors();
  const { user, loading: authLoading }: any = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (authLoading || visitorsLoading) return;
    if (!user || !departments) return;

    const initialState = {
      name: '',
      email: '',
      phone: '',
      purpose: '',
      department_id: user.role === 'director' ? String(user.department_id || '') : '',
      host: '',
      organization: '',
      address: '',
      visit_date: today
    };

    setFormData(initialState);
    setLoading(false);
  }, [user, departments, authLoading, visitorsLoading]);

  useEffect(() => {
    if (!loading && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(formData.visit_date) < new Date(today)) {
      toast.error('Visit date cannot be in the past.');
      return;
    }

    try {
      setSubmitting(true);
      if (!formData.department_id || !formData.host) {
        throw new Error('Department and Host are required fields');
      }

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
        status: 'pre-registered',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}`
      };

      const response = await api.post('/visitors/', payload);

      if (!response.data?.id) {
        throw new Error('Failed to create pre-registration');
      }

      await refreshVisitors?.();
      setVisitorName(formData.name);
      setShowSuccess(true);

      setFormData({
        name: '',
        email: '',
        phone: '',
        purpose: '',
        department_id: user.role === 'director' ? user.department_id || '' : '',
        host: '',
        organization: '',
        address: '',
        visit_date: today
      });

      toast.success('Visitor pre-registered successfully');
    } catch (error: any) {
      console.error('Pre-registration error:', error);
      let errorMessage = 'Failed to pre-register visitor';

      if (error.response?.data) {
        errorMessage = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !formData || (user?.role === 'director' && !departments)) {
    return <div className="p-4 text-gray-600">Loading pre-registration form...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <ErrorBoundary>
      <div className="p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Pre-Register a Visitor</h1>
          <p className="text-gray-600">
            Fill out the form below to pre-register a visitor to your organization.
          </p>
        </div>

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
                      disabled={user?.role === 'director'}
                    >
                      <option value="">Select Department</option>
                      {Array.isArray(departments) &&
                        departments.map(dept => (
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
                    min={today}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Pre-Register Visitor'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div>
            {showSuccess && (
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 mb-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-500 mr-4" />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      Pre-Registration Successful
                    </h3>
                    <p className="text-gray-600">
                      {visitorName} has been successfully pre-registered.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">
                Pre-Registration Instructions
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mr-3">1</span>
                  <span>Fill in all required visitor information</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mr-3">2</span>
                  <span>Select the department they will be visiting</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mr-3">3</span>
                  <span>Enter the host who will be receiving the visitor</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mr-3">4</span>
                  <span>Specify the purpose of the visit</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mr-3">5</span>
                  <span>Submit the form to complete pre-registration</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Pre-registered visitors will still need to check in at the front desk upon arrival.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PreRegister;