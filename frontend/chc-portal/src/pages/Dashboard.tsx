import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tractor, Activity, Clock, CheckCircle } from 'lucide-react';
import { machines, bookings } from '@/data/mockData';

export default function Dashboard() {
  const machinesOnline = machines.filter(m => m.status === 'running').length;
  const machinesIdle = machines.filter(m => m.status === 'idle').length;
  const machinesRunning = machines.filter(m => m.status === 'running').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedToday = bookings.filter(b => {
    const today = new Date().toDateString();
    return b.status === 'completed' && new Date(b.requestedTime).toDateString() === today;
  }).length;

  const stats = [
    {
      title: 'Machines Online',
      value: machinesOnline,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Machines Idle',
      value: machinesIdle,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Machines Running',
      value: machinesRunning,
      icon: Tractor,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Pending Bookings',
      value: pendingBookings,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Completed Today',
      value: completedToday,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome, CHC Manager!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{booking.farmerName}</p>
                    <p className="text-sm text-muted-foreground">{booking.machineType} - {booking.parcelArea} ha</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Machine Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {machines.map((machine) => (
                <div key={machine.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{machine.name}</p>
                    <p className="text-sm text-muted-foreground">{machine.type}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    machine.status === 'running' ? 'bg-green-100 text-green-700' :
                    machine.status === 'idle' ? 'bg-blue-100 text-blue-700' :
                    machine.status === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {machine.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
