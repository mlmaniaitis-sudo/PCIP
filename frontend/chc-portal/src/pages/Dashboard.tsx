// Dashboard.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tractor, Activity, Clock, CheckCircle, Bell, TrendingUp, AlertCircle } from 'lucide-react';
import { machines, bookings } from '@/data/mockData';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Dashboard() {
  const [notifications, setNotifications] = useState<Array<{id: number, message: string, time: string, type: string}>>([]);
  const [isNewNotification, setIsNewNotification] = useState(false);

  // Calculate stats
  const machinesOnline = machines.filter(m => m.status === 'running' || m.status === 'idle').length;
  const machinesIdle = machines.filter(m => m.status === 'idle').length;
  const machinesRunning = machines.filter(m => m.status === 'running').length;
  const machinesMaintenance = machines.filter(m => m.status === 'maintenance').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedToday = bookings.filter(b => {
    const today = new Date().toDateString();
    return b.status === 'completed' && new Date(b.requestedTime).toDateString() === today;
  }).length;
  const activeBookings = bookings.filter(b => b.status === 'in_progress').length;
  const totalRevenue = bookings.filter(b => b.status === 'completed').length * 1500; // Simulated revenue

  // Simulate real-time notifications
  useEffect(() => {
    const notificationInterval = setInterval(() => {
      const newNotif = {
        id: Date.now(),
        message: `New booking request from Farmer #${Math.floor(Math.random() * 100)}`,
        time: new Date().toLocaleTimeString(),
        type: 'booking'
      };
      
      setNotifications(prev => [newNotif, ...prev.slice(0, 4)]);
      setIsNewNotification(true);
      
      // Auto-hide notification indicator after 3 seconds
      setTimeout(() => setIsNewNotification(false), 3000);
    }, 15000); // New notification every 15 seconds

    return () => clearInterval(notificationInterval);
  }, []);

  const stats = [
    {
      title: 'Total Machines',
      value: machines.length,
      icon: Tractor,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      subtitle: `${machinesOnline} online`
    },
    {
      title: 'Machines Running',
      value: machinesRunning,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      subtitle: 'Currently active'
    },
    {
      title: 'Machines Idle',
      value: machinesIdle,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      subtitle: 'Available for booking'
    },
    {
      title: 'Maintenance',
      value: machinesMaintenance,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      subtitle: 'Under repair'
    },
    {
      title: 'Pending Requests',
      value: pendingBookings,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      subtitle: 'Awaiting approval'
    },
    {
      title: 'Active Bookings',
      value: activeBookings,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      subtitle: 'In progress'
    },
    {
      title: 'Completed Today',
      value: completedToday,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      subtitle: `${completedToday} bookings`
    },
    {
      title: "Today's Revenue",
      value: `₹${(completedToday * 1500).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      subtitle: 'Estimated earnings'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome, Priya! Here's your CHC hub overview.</p>
        </div>
        
        {/* Live Notification Bell */}
        <div className="relative">
          <div className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer relative">
            <Bell className="h-6 w-6 text-gray-700" />
            {isNewNotification && (
              <>
                <span className="absolute top-2 right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </>
            )}
          </div>
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {notifications.length}
            </span>
          )}
        </div>
      </div>

      {/* Live Notifications */}
      {notifications.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Bell className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-blue-900">📢 Live Updates</p>
              {notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="flex items-center justify-between text-sm border-b border-blue-100 pb-2 last:border-0">
                  <span className="text-blue-800">{notif.message}</span>
                  <span className="text-blue-600 text-xs">{notif.time}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Stats Grid - Real-time Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Booking Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Booking Activity
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-normal">
                Live Updates
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.slice(0, 6).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between pb-3 border-b last:border-0 hover:bg-gray-50 p-2 rounded transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{booking.farmerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.machineType} • {booking.parcelArea} ha • {new Date(booking.requestedTime).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ml-2 ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Machine Status Overview - Always Up-to-date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Machine Fleet Status
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-normal">
                {machinesOnline}/{machines.length} Online
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {machines.map((machine) => (
                <div key={machine.id} className="flex items-center justify-between pb-3 border-b last:border-0 hover:bg-gray-50 p-2 rounded transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{machine.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {machine.type} • Location: {machine.location.lat.toFixed(3)}, {machine.location.lng.toFixed(3)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      machine.status === 'running' ? 'bg-green-500 animate-pulse' :
                      machine.status === 'idle' ? 'bg-blue-500' :
                      machine.status === 'maintenance' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`} />
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                      machine.status === 'running' ? 'bg-green-100 text-green-700' :
                      machine.status === 'idle' ? 'bg-blue-100 text-blue-700' :
                      machine.status === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {machine.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
