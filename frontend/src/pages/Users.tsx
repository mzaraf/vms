import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { UserPlusIcon, CheckCircleIcon, UserIcon, EditIcon, TrashIcon } from 'lucide-react';
import api from '../services/api';
import { Department } from '../context/VisitorContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department_id?: string | null;
  department_name?: string;
}



const Users: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newUserFullName, setNewUserFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);

  const initialFormState = {
    first_name: '',
    last_name: '',
    email: '',
    role: 'staff' as const,
    department_id: '',
    password: '',
    password_confirmation: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, deptRes] = await Promise.all([
          api.get('/users/'),
          api.get('/departments/')
        ]);

        const departmentsData = Array.isArray(deptRes?.data) ? deptRes.data : [];
        const usersData = Array.isArray(usersRes?.data) ? usersRes.data : [];

        setUsers(usersData);
        setDepartments(departmentsData);
        setError(null);
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Failed to load data. Please try again later.');
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  useEffect(() => {
    const fetchDepartments = async () => {
      setDepartmentsLoading(true);
      try {
        const response = await api.get('/departments/');
        setDepartments(response.data);
      } catch (error) {
        console.error('Failed to load departments', error);
        toast.error('Failed to load departments');
      } finally {
        setDepartmentsLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role as any,
      department_id: user.department_id || '',
      password: '',
      password_confirmation: ''
    });
    setPasswordChangeMode(false);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await api.delete(`/users/${userToDelete}/`);
      setUsers(prev => prev.filter(user => user.id !== userToDelete));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete user');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate director department
      if (formData.role === 'director' && !formData.department_id) {
        throw new Error('Department is required for Director role');
      }

      // Create payload
      const payload: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role: formData.role,
        department_id: formData.department_id || null,
        username: `${formData.first_name.trim()}.${formData.last_name.trim()}`.toLowerCase()
      };

      // Only include password fields if creating new user or explicitly changing password
      if (!editingId || passwordChangeMode) {
        if (!formData.password) {
          throw new Error('Password is required');
        }
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }

      let response;
      if (editingId) {
        response = await api.put(`/users/${editingId}/`, payload);
      } else {
        response = await api.post('/users/', payload);
      }

      if (!response.data?.id) {
        throw new Error('User operation failed');
      }

      // Update state
      if (editingId) {
        setUsers(prev => prev.map(u => u.id === editingId ? response.data : u));
        toast.success('User updated successfully');
      } else {
        setUsers(prev => [...prev, response.data]);
        setNewUserFullName(`${formData.first_name} ${formData.last_name}`);
        setShowSuccess(true);
        toast.success('User added successfully');
      }

      setShowForm(false);
      setFormData(initialFormState);
      setEditingId(null);
      setPasswordChangeMode(false);
    } catch (error: any) {
      console.error('Submission error:', error);
      let errorMessage = 'Failed to process user';
      
      if (error.response?.data) {
        errorMessage = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Loading user data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <ErrorBoundary>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600">
            Manage users and their access roles in the system.
          </p>
        </div>

        {showSuccess && (
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500 mb-6">
            <div className="flex items-center">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <p className="font-medium text-gray-800">
                  {newUserFullName} has been successfully added as a user.
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
              setPasswordChangeMode(false);
            }} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            {showForm ? 'Cancel' : 'Add New User'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input 
                    type="text" 
                    id="first_name" 
                    name="first_name" 
                    value={formData.first_name} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input 
                    type="text" 
                    id="last_name" 
                    name="last_name" 
                    value={formData.last_name} 
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
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select 
                    id="role" 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="director">Director</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                    {formData.role !== 'director' && (
                      <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                    )}
                  </label>
                  {!departmentsLoading ? (
                    <select
                    id="department_id"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required={formData.role === 'director'}
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                          </option>
                        ))}
                        </select>
                        ) : (
                        <div className="animate-pulse py-2 bg-gray-200 rounded"></div>
                        )}
                  {formData.role === 'director' && !formData.department_id && (
                    <p className="mt-1 text-sm text-red-600">
                      Department is required for Director role
                    </p>
                  )}
                </div>
              </div>

              {editingId && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setPasswordChangeMode(!passwordChangeMode)}
                    className="text-sm text-blue-600 hover:text-blue-800 mb-3"
                  >
                    {passwordChangeMode ? 'Cancel Password Change' : 'Change Password'}
                  </button>
                  {passwordChangeMode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input 
                          type="password" 
                          id="password" 
                          name="password" 
                          value={formData.password} 
                          onChange={handleChange} 
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password
                        </label>
                        <input 
                          type="password" 
                          id="password_confirmation" 
                          name="password_confirmation" 
                          value={formData.password_confirmation} 
                          onChange={handleChange} 
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!editingId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input 
                      type="password" 
                      id="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input 
                      type="password" 
                      id="password_confirmation" 
                      name="password_confirmation" 
                      value={formData.password_confirmation} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
                  disabled={formData.role === 'director' && !formData.department_id}
                >
                  {editingId ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">System Users</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'director' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.department_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleEdit(user)} 
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <EditIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)} 
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
            This action cannot be undone. This will permanently delete the user account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </ErrorBoundary>
  );
};

export default Users;