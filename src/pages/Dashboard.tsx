import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiLogOut, FiPlus, FiBell, FiRepeat } from 'react-icons/fi';
import UserCard from '../components/UserCard';
import { User } from '../types';
import { dataService } from '../services/DataServiceFactory';
import { helperService } from '../services/HelperService';

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    totalUsers: 0,
    totalInterest: 0,
    totalReceived: 0
  });
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        dataService.getUsers(),
        dataService.getStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayReminders = users.filter(u => u.enableReminder && new Date().getDate() === u.reminderDay).length;
  const currencySymbol = helperService.getCurrencySymbol();

  const statCards = [
    {
      key: 'totalBorrowed',
      label: 'Total Borrowed',
      value: stats.totalBorrowed,
      bg: 'bg-blue-100',
      color: 'text-blue-600',
      Icon: helperService.getStatIcon('totalBorrowed'),
      isCurrency: true,
    },
    {
      key: 'totalReceived',
      label: 'Total Received',
      value: stats.totalReceived,
      bg: 'bg-blue-100',
      color: 'text-blue-600',
      Icon: helperService.getStatIcon('totalReceived'),
      isCurrency: true,
    },
    {
      key: 'totalUsers',
      label: 'Total Users',
      value: stats.totalUsers,
      bg: 'bg-green-100',
      color: 'text-green-600',
      Icon: helperService.getStatIcon('totalUsers'),
      isCurrency: false,
    },
    {
      key: 'totalInterest',
      label: 'Total Interest',
      value: stats.totalInterest,
      bg: 'bg-purple-100',
      color: 'text-purple-600',
      Icon: helperService.getStatIcon('totalInterest'),
      isCurrency: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Money Lender Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link to="/reminders" className="text-gray-600 hover:text-gray-900 relative">
              <FiBell className="h-5 w-5" />
              {todayReminders > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {todayReminders}
                </span>
              )}
            </Link>
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button onClick={logout} className="flex items-center text-red-600 hover:text-red-700">
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((card) => {
            const StatIcon = card.Icon;
            return (
              <div key={card.key} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-3 ${card.bg} rounded-full`}>
                    <StatIcon className={`h-8 w-8 ${card.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {card.isCurrency ? `${currencySymbol}${card.value.toLocaleString()}` : card.value}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Borrowers List</h2>
            <div className="flex gap-2">
              <Link to="/add-user" className="btn-primary flex items-center">
                <FiPlus className="mr-2" />
                Add User
              </Link>
              <Link to="/interest-calculator" className="btn-secondary flex items-center border border-gray-300 hover:border-gray-400 px-3 py-2 rounded-md">
                <FiRepeat className="mr-2" />
                Interest Calculator
              </Link>
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No users found</p>
              <Link to="/add-user" className="btn-primary">Add Your First User</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <UserCard key={user._id || user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;