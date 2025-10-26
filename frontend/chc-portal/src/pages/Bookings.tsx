import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Bell, User, Calendar, MapPin, Tractor, AlertCircle } from 'lucide-react';
import { bookings as initialBookings } from '@/data/mockData';
import type { Booking } from '@/data/mockData';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filter, setFilter] = useState<string>('All');
  const [simulationDone, setSimulationDone] = useState(false);
  const [newBookingAlert, setNewBookingAlert] = useState(false);
  const [processingBooking, setProcessingBooking] = useState<string | null>(null);

  // Simulate new booking arrival
  useEffect(() => {
    if (!simulationDone) {
      const timer = setTimeout(() => {
        const farmerNames = ['Rajesh Kumar', 'Amit Singh', 'Pradeep Sharma', 'Vijay Patel'];
        const machineTypes = ['Harvester', 'Baler', 'Rotavator', 'Tractor'];
        
        const newBooking: Booking = {
          id: `B${String(bookings.length + 1).padStart(3, '0')}`,
          farmerName: farmerNames[Math.floor(Math.random() * farmerNames.length)],
          parcelId: `P${133 + bookings.length}`,
          parcelArea: Math.floor(Math.random() * 10) + 3,
          machineType: machineTypes[Math.floor(Math.random() * machineTypes.length)],
          status: 'pending',
          requestedTime: new Date().toISOString()
        };
        
        setBookings(prev => [newBooking, ...prev]);
        setNewBookingAlert(true);
        
        toast.success('🔔 New Booking Request!', {
          description: `${newBooking.farmerName} requested ${newBooking.machineType}`,
          duration: 5000,
        });
        
        setTimeout(() => setNewBookingAlert(false), 5000);
        setSimulationDone(true);
      }, 12000); // 12 seconds after page load

      return () => clearTimeout(timer);
    }
  }, [simulationDone, bookings.length]);

  const filteredBookings = filter === 'All' 
    ? bookings 
    : bookings.filter(b => b.status === filter.toLowerCase().replace(' ', '_'));

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string, icon: string }> = {
      pending: { className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border border-yellow-300", icon: "⏳" },
      accepted: { className: "bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-300", icon: "✅" },
      in_progress: { className: "bg-orange-100 text-orange-700 hover:bg-orange-100 border border-orange-300", icon: "🚜" },
      completed: { className: "bg-green-100 text-green-700 hover:bg-green-100 border border-green-300", icon: "✓" },
      cancelled: { className: "bg-red-100 text-red-700 hover:bg-red-100 border border-red-300", icon: "✗" }
    };
    
    return (
      <Badge variant="default" className={variants[status].className}>
        <span className="mr-1">{variants[status].icon}</span>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const handleAccept = async (bookingId: string, farmerName: string, machineType: string) => {
    setProcessingBooking(bookingId);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setBookings(prev => prev.map(b => 
      b.id === bookingId 
        ? { ...b, status: 'accepted' as const, scheduledTime: new Date().toISOString() }
        : b
    ));
    
    toast.success('Booking Accepted!', {
      description: `${farmerName}'s request for ${machineType} has been approved`,
      duration: 3000,
    });
    
    setProcessingBooking(null);
  };

  const handleReject = async (bookingId: string, farmerName: string) => {
    setProcessingBooking(bookingId);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    ));
    
    toast.error('Booking Rejected', {
      description: `${farmerName}'s request has been declined`,
      duration: 3000,
    });
    
    setProcessingBooking(null);
  };

  const handleComplete = async (bookingId: string, farmerName: string) => {
    setProcessingBooking(bookingId);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'completed' as const } : b
    ));
    
    toast.success('Booking Completed!', {
      description: `${farmerName}'s service has been marked complete`,
      duration: 3000,
    });
    
    setProcessingBooking(null);
  };

  // Calculate stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    inProgress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Booking Management</h1>
          <p className="text-muted-foreground mt-1">Review and manage farmer booking requests</p>
        </div>
        
        {/* Live Notification Bell */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-700" />
            {stats.pending > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                {stats.pending}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* New Booking Alert */}
      {newBookingAlert && (
        <Alert className="border-yellow-300 bg-yellow-50 animate-pulse">
          <Bell className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-yellow-900 font-semibold">
            🔔 New booking request just arrived! Please review and take action.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              {stats.pending > 0 && (
                <AlertCircle className="h-8 w-8 text-yellow-500 animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Accepted</p>
              <p className="text-2xl font-bold text-blue-600">{stats.accepted}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Bookings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">All Booking Requests</CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Bookings</SelectItem>
                  <SelectItem value="Pending">⏳ Pending</SelectItem>
                  <SelectItem value="Accepted">✅ Accepted</SelectItem>
                  <SelectItem value="In Progress">🚜 In Progress</SelectItem>
                  <SelectItem value="Completed">✓ Completed</SelectItem>
                  <SelectItem value="Cancelled">✗ Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Parcel Info</TableHead>
                <TableHead>Machine</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Request Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow 
                  key={booking.id} 
                  className={`hover:bg-gray-50 ${booking.status === 'pending' ? 'bg-yellow-50' : ''}`}
                >
                  <TableCell className="font-mono font-semibold">
                    #{booking.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{booking.farmerName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{booking.parcelId} • {booking.parcelArea} ha</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tractor className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{booking.machineType}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(booking.requestedTime), 'MMM dd, HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleAccept(booking.id, booking.farmerName, booking.machineType)}
                            disabled={processingBooking === booking.id}
                          >
                            <CheckCircle className="w-3 h-3" />
                            {processingBooking === booking.id ? 'Processing...' : 'Accept'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            onClick={() => handleReject(booking.id, booking.farmerName)}
                            disabled={processingBooking === booking.id}
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </Button>
                        </>
                      )}
                      {(booking.status === 'accepted' || booking.status === 'in_progress') && (
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleComplete(booking.id, booking.farmerName)}
                          disabled={processingBooking === booking.id}
                        >
                          <Clock className="w-3 h-3" />
                          {processingBooking === booking.id ? 'Processing...' : 'Mark Complete'}
                        </Button>
                      )}
                      {(booking.status === 'completed' || booking.status === 'cancelled') && (
                        <span className="text-sm text-muted-foreground italic">No actions</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
