import React, { useState, useEffect } from 'react';
import { Department, useVisitors } from '../context/VisitorContext';
import { toast } from 'sonner';
import { BuildingIcon, PlusIcon, CheckCircleIcon, EditIcon, TrashIcon } from 'lucide-react';
import api from '../services/api';
import ErrorBoundary from '../components/ErrorBoundary';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';


const Departments: React.FC = () => {
  const { departments, refreshDepartments } = useVisitors();
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialFormState = {
    name: '',
    description: ''
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshDepartments?.();
        setError(null);
      } catch (err) {
        setError('Failed to load departments');
        toast.error('Failed to load departments');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshDepartments]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}/`, formData);
        toast.success('Department updated successfully');
      } else {
        await api.post('/departments/', formData);
        toast.success('Department added successfully');
      }
      
      await refreshDepartments?.();
      setShowSuccess(true);
      setShowForm(false);
      setFormData(initialFormState);
      setEditingId(null);
    } catch (error) {
      console.error('Operation failed:', error);
      toast.error(`Failed to ${editingId ? 'update' : 'create'} department`);
    }
  };

  const handleDelete = async (id: string) => {
    setDepartmentToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    
    try {
      await api.delete(`/departments/${departmentToDelete}/`);
      await refreshDepartments?.();
      toast.success('Department deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete department');
    } finally {
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Loading departments...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <ErrorBoundary>
      <div className="p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Department Management
          </h1>
          <p className="text-gray-600">
            Manage departments and their information.
          </p>
        </div>

        {showSuccess && (
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500 mb-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <p className="font-medium text-gray-800">
                  {editingId ? 'Department has been successfully updated.' : 'Department has been successfully updated.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex justify-end">
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData(initialFormState);
            }} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {showForm ? 'Cancel' : 'Add Department'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Department' : 'Add New Department'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name
                  </label>
                  <input 
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
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows={3} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {editingId ? 'Update Department' : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Departments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Visitors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(departments) && departments.map(department => (
                  <tr key={department.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <BuildingIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {department.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {department.description || 'No description available'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* Update this with actual visitor count */}
                      {department.visitor_count || 0} visitors
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => {
                          setFormData({
                            name: department.name,
                            description: department.description || ''
                          });
                          setEditingId(department.id);
                          setShowForm(true);
                        }} 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <EditIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(department.id)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the department and all associated data.
            </AlertDialogDescription>
            </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
                >
                  Delete Department
                </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </ErrorBoundary>
  );
};

export default Departments;