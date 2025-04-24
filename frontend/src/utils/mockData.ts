import { User } from '../context/AuthContext';
import { Visitor, Department } from '../context/VisitorContext';
export const mockUsers: User[] = [{
  id: 'user-1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
}, {
  id: 'user-2',
  name: 'Staff User',
  email: 'staff@example.com',
  role: 'staff'
}, {
  id: 'user-3',
  name: 'IT Director',
  email: 'director-it@example.com',
  role: 'director',
  department: 'IT'
}, {
  id: 'user-4',
  name: 'HR Director',
  email: 'director-hr@example.com',
  role: 'director',
  department: 'HR'
}];
export const mockDepartments: Department[] = [{
  id: 'dept-1',
  name: 'IT'
}, {
  id: 'dept-2',
  name: 'HR'
}, {
  id: 'dept-3',
  name: 'Finance'
}, {
  id: 'dept-4',
  name: 'Marketing'
}, {
  id: 'dept-5',
  name: 'Enterprise'
}];
// Generate dates within the last month
const getRandomDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  return date;
};
export const mockVisitors: Visitor[] = [{
  id: 'visitor-1',
  name: 'Araf Muhammed',
  email: 'am@example.com',
  phone: '123-456-7890',
  purpose: 'Job Interview',
  department: 'HR',
  host: 'Joseph Bala',
  status: 'checked-out',
  checkInTime: getRandomDate(2),
  checkOutTime: getRandomDate(1),
  createdAt: getRandomDate(5)
}, {
  id: 'visitor-2',
  name: 'Yahya Musa',
  email: 'alice@example.com',
  phone: '234-567-8901',
  purpose: 'Musa Abbas',
  department: 'Marketing',
  host: 'Bob Brown',
  status: 'checked-in',
  checkInTime: new Date(),
  createdAt: getRandomDate(3)
}, {
  id: 'visitor-3',
  name: 'Ismail Mahmud',
  email: 'im@example.com',
  phone: '345-678-9012',
  purpose: 'Vendor Meeting',
  department: 'IT',
  host: 'Ahmed Kabir',
  status: 'pre-registered',
  createdAt: getRandomDate(1)
}, {
  id: 'visitor-4',
  name: 'Ahmed Kabir',
  email: 'ak@example.com',
  phone: '456-789-0123',
  purpose: 'Project Discussion',
  department: 'IT',
  host: 'Jude Ade',
  status: 'checked-out',
  checkInTime: getRandomDate(10),
  checkOutTime: getRandomDate(9),
  createdAt: getRandomDate(12)
}, {
  id: 'visitor-5',
  name: 'Joseph Bala',
  email: 'jb@example.com',
  phone: '567-890-1234',
  purpose: 'Training',
  department: 'HR',
  host: 'Jennifer Sambo',
  status: 'checked-in',
  checkInTime: getRandomDate(1),
  createdAt: getRandomDate(2)
}, {
  id: 'visitor-6',
  name: 'Raphael Agaba',
  email: 'ra@example.com',
  phone: '678-901-2345',
  purpose: 'Interview',
  department: 'Finance',
  host: 'Musa Garba',
  status: 'pre-registered',
  createdAt: getRandomDate(1)
}, {
  id: 'visitor-7',
  name: 'Maryam Shehu',
  email: 'ms@example.com',
  phone: '789-012-3456',
  purpose: 'Consultation',
  department: 'Enterprise',
  host: 'Dr Jega',
  status: 'checked-out',
  checkInTime: getRandomDate(20),
  checkOutTime: getRandomDate(19),
  createdAt: getRandomDate(25)
}, {
  id: 'visitor-8',
  name: 'Godspower M',
  email: 'gm@example.com',
  phone: '890-123-4567',
  purpose: 'Site Tour',
  department: 'Marketing',
  host: 'Daniel Odu-Thomas',
  status: 'checked-in',
  checkInTime: getRandomDate(3),
  createdAt: getRandomDate(4)
}];