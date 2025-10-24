import { useState } from 'react';
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
import { Plus } from 'lucide-react';
import { machines } from '@/data/mockData';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Machines() {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
      running: { variant: "default", className: "bg-green-100 text-green-700 hover:bg-green-100" },
      idle: { variant: "default", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
      offline: { variant: "default", className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
      maintenance: { variant: "default", className: "bg-orange-100 text-orange-700 hover:bg-orange-100" }
    };
    
    return (
      <Badge variant={variants[status].variant} className={variants[status].className}>
        {status}
      </Badge>
    );
  };

  const handleAddMachine = () => {
    toast.info('Add Machine functionality not implemented');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Machine Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage all CHC machines</p>
        </div>
        <Button onClick={handleAddMachine} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Machine
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {machines.map((machine) => (
              <TableRow key={machine.id}>
                <TableCell className="font-medium">{machine.id}</TableCell>
                <TableCell>{machine.name}</TableCell>
                <TableCell>{machine.type}</TableCell>
                <TableCell>{getStatusBadge(machine.status)}</TableCell>
                <TableCell>{format(new Date(machine.lastSeen), 'MMM dd, yyyy HH:mm')}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {machine.location.lat.toFixed(4)}, {machine.location.lon.toFixed(4)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
