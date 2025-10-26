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
import { Plus, Eye, MapPin, Activity, Clock, RefreshCw, Search } from 'lucide-react';
import { machines } from '@/data/mockData';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export default function Machines() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setLastUpdated(new Date());
      toast.success('Machine data refreshed', {
        duration: 2000,
        description: 'All machine statuses are up-to-date'
      });
    }, 20000); // Update every 20 seconds

    return () => clearInterval(updateInterval);
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string, icon: string }> = {
      running: { variant: "default", className: "bg-green-100 text-green-700 hover:bg-green-100 border border-green-300", icon: "🟢" },
      idle: { variant: "default", className: "bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-300", icon: "🔵" },
      offline: { variant: "default", className: "bg-gray-100 text-gray-700 hover:bg-gray-100 border border-gray-300", icon: "⚪" },
      maintenance: { variant: "default", className: "bg-orange-100 text-orange-700 hover:bg-orange-100 border border-orange-300", icon: "🟠" }
    };
    
    return (
      <Badge variant={variants[status].variant} className={variants[status].className}>
        <span className="mr-1">{variants[status].icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleAddMachine = () => {
    toast.info('Add Machine', {
      description: 'New machine registration form would appear here'
    });
  };

  const handleViewDetails = (machineId: string, machineName: string) => {
    toast.success('Machine Details', {
      description: `Viewing details for ${machineName}`
    });
  };

  // Filter machines
  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         machine.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || machine.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: machines.length,
    running: machines.filter(m => m.status === 'running').length,
    idle: machines.filter(m => m.status === 'idle').length,
    maintenance: machines.filter(m => m.status === 'maintenance').length,
    offline: machines.filter(m => m.status === 'offline').length,
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Machine Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage all CHC machines • Always up-to-date</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Last Updated Indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 px-3 py-2 rounded-lg">
            <RefreshCw className="h-4 w-4" />
            <span>Updated: {format(lastUpdated, 'HH:mm:ss')}</span>
          </div>
          <Button onClick={handleAddMachine} className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Machine
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Machines</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Activity className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-2xl font-bold text-green-600">{stats.running}</p>
              </div>
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Idle</p>
              <p className="text-2xl font-bold text-blue-600">{stats.idle}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Maintenance</p>
              <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Offline</p>
              <p className="text-2xl font-bold text-gray-600">{stats.offline}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Machines ({filteredMachines.length})</CardTitle>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search machines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                {['all', 'running', 'idle', 'maintenance', 'offline'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>GPS Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMachines.map((machine) => (
                <TableRow key={machine.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm font-medium">
                    #{machine.id}
                  </TableCell>
                  <TableCell className="font-semibold">{machine.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm">
                      🚜 {machine.type}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(machine.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(machine.lastSeen), 'MMM dd, HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
                      <MapPin className="h-4 w-4" />
                      {machine.location.lat.toFixed(4)}, {machine.location.lng.toFixed(4)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(machine.id, machine.name)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
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
