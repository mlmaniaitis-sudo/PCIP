import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { bookings as initialBookings } from '@/data/mockData';
import type { Booking } from '@/data/mockData';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filter, setFilter] = useState<string>('All');
  const [simulationDone, setSimulationDone] = useState(false);

  useEffect(() => {
    if (!simulationDone) {
      const timer = setTimeout(() => {
        const newBooking: Booking = {
          id: `B0${bookings.length + 1}`,
          farmerName: 'Simulated Farmer',
          parcelId: `P${133 + bookings.length}`,
          parcelArea: 6.5,
          machineType: 'Harvester',
          status: 'pending',
          requestedTime: new Date().toISOString()
        };
        
        setBookings(prev => [newBooking, ...prev]);
        toast.success('New booking request received!');
        setSimulationDone(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [simulationDone, bookings.length]);

  const filteredBookings = filter === 'All' 
    ? bookings 
    : bookings.filter(b => b.status === filter.toLowerCase().replace(' ', '_'));

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string }> = {
      pending: { className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
      accepted: { className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
      in_progress: { className: "bg-orange-100 text-orange-700 hover:bg-orange-100" },
      completed: { className: "bg-green-100 text-green-700 hover:bg-green-100" },
      cancelled: { className: "bg-red-100 text-red-700 hover:bg-red-100" }
    };
    
    return (
      <Badge variant="default" className={variants[status].className}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleAccept = (bookingId: string) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId 
        ? { ...b, status: 'accepted' as const, scheduledTime: new Date().toISOString() }
        : b
    ));
    toast.success(`Booking ${bookingId} accepted (Mock)`);
  };

  const handleReject = (bookingId: string) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
    ));
    toast.error(`Booking ${bookingId} rejected (Mock)`);
  };

  const handleComplete = (bookingId: string) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'completed' as const } : b
    ));
    toast.success(`Booking ${bookingId} marked as complete (Mock)`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings Management</h1>
          <p className="text-muted-foreground mt-1">Manage farmer booking requests</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium">Filter by Status:</label>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-sm text-muted-foreground">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Farmer Name</TableHead>
              <TableHead>Parcel Area</TableHead>
              <TableHead>Machine Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>{booking.farmerName}</TableCell>
                <TableCell>{booking.parcelArea} ha</TableCell>
                <TableCell>{booking.machineType}</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell>{format(new Date(booking.requestedTime), 'MMM dd, yyyy HH:mm')}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1"
                          onClick={() => handleAccept(booking.id)}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => handleReject(booking.id)}
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
                        className="gap-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleComplete(booking.id)}
                      >
                        <Clock className="w-3 h-3" />
                        Complete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
