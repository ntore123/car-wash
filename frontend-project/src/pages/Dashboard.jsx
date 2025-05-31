import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
// Icons removed as per user request

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getDashboardStats();

        // Ensure numeric values are properly converted
        const data = response.data.data;
        if (data) {
          // Convert totalRevenue to a number
          data.totalRevenue = data.totalRevenue ? parseFloat(data.totalRevenue) : 0;

          // Convert PackagePrice in recentServices to numbers
          if (data.recentServices) {
            data.recentServices = data.recentServices.map(service => ({
              ...service,
              PackagePrice: service.PackagePrice ? parseFloat(service.PackagePrice) : 0
            }));
          }

          // Convert AmountPaid in recentPayments to numbers
          if (data.recentPayments) {
            data.recentPayments = data.recentPayments.map(payment => ({
              ...payment,
              AmountPaid: payment.AmountPaid ? parseFloat(payment.AmountPaid) : 0
            }));
          }
        }

        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner-instagram h-12 w-12"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-instagram text-red-800 shadow-instagram-card">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Cars',
      value: stats?.totalCars || 0,
      label: 'CARS',
      gradient: 'from-primary-600 to-primary-800',
      link: '/cars',
    },
    {
      title: 'Total Services',
      value: stats?.totalServices || 0,
      label: 'SERV',
      gradient: 'from-accent-600 to-accent-800',
      link: '/services',
    },
    {
      title: 'Total Revenue',
      value: `${(stats?.totalRevenue || 0).toFixed(0)} RWF`,
      label: 'RWF',
      gradient: 'from-primary-700 to-primary-900',
      link: '/payments',
    },
    {
      title: 'Popular Packages',
      value: stats?.popularPackages?.length || 0,
      label: 'PKG',
      gradient: 'from-accent-500 to-accent-700',
      link: '/packages',
    },
  ];

  const recentServiceColumns = [
    { key: 'RecordNumber', header: 'Record ID', render: (row) => (
      <span className="text-xs font-mono text-gray-600" title={row.RecordNumber}>
        {row.RecordNumber.substring(0, 8)}...
      </span>
    )},
    { key: 'ServiceDate', header: 'Date', render: (row) => new Date(row.ServiceDate).toLocaleDateString() },
    { key: 'PlateNumber', header: 'Plate Number' },
    { key: 'DriverName', header: 'Driver' },
    { key: 'PackageName', header: 'Package' },
    { key: 'PackagePrice', header: 'Price', render: (row) => `${(row.PackagePrice || 0).toFixed(0)} RWF` },
  ];

  const recentPaymentColumns = [
    { key: 'PaymentNumber', header: 'Payment #' },
    { key: 'PaymentDate', header: 'Date', render: (row) => new Date(row.PaymentDate).toLocaleDateString() },
    { key: 'PlateNumber', header: 'Plate Number' },
    { key: 'DriverName', header: 'Driver' },
    { key: 'AmountPaid', header: 'Amount', render: (row) => `${(row.AmountPaid || 0).toFixed(0)} RWF` },
  ];

  const popularPackageColumns = [
    { key: 'PackageName', header: 'Package' },
    { key: 'serviceCount', header: 'Services Count' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Smart Pack - Rubavu | Car Services Management" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.link} className="group">
            <div className="stat-card h-full">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary-700 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-primary-900">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-instagram bg-gradient-to-br ${stat.gradient} text-white shadow-instagram group-hover:scale-105 transition-transform duration-200 text-xs font-bold`}>
                  {stat.label}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Services */}
      <Card title="Recent Services" variant="gradient">
        <Table
          columns={recentServiceColumns}
          data={stats?.recentServices || []}
          emptyMessage="No recent services"
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <Card title="Recent Payments" variant="gradient">
          <Table
            columns={recentPaymentColumns}
            data={stats?.recentPayments || []}
            emptyMessage="No recent payments"
          />
        </Card>

        {/* Popular Packages */}
        <Card title="Popular Packages" variant="gradient">
          <Table
            columns={popularPackageColumns}
            data={stats?.popularPackages || []}
            emptyMessage="No package data available"
          />
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
