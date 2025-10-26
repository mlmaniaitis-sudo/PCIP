import { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { machines } from '@/data/mockData';
import MachineMarkers from '@/components/MachineMarkers';
import { Activity, MapPin, Tractor, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function LiveMap() {
  const centerPosition: [number, number] = [30.73, 76.77];
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [liveUpdate, setLiveUpdate] = useState<string>('');

  // Simulate real-time position updates
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const runningMachines = machines.filter(m => m.status === 'running');
      if (runningMachines.length > 0) {
        const randomMachine = runningMachines[Math.floor(Math.random() * runningMachines.length)];
        setLiveUpdate(`${randomMachine.name} moved to new location`);
        setTimeout(() => setLiveUpdate(''), 3000);
      }
    }, 8000); // Update every 8 seconds

    return () => clearInterval(updateInterval);
  }, []);

  const statusCounts = {
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
          <h1 className="text-3xl font-bold text-foreground">Live Machine Tracking</h1>
          <p className="text-muted-foreground mt-1">Real-time GPS location of all machines • Color-coded by status</p>
        </div>
        
        {/* Live Indicator */}
        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <span className="text-sm font-semibold text-green-700">Live Tracking</span>
        </div>
      </div>

      {/* Live Update Banner */}
      {liveUpdate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3 animate-pulse">
          <MapPin className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">📍 {liveUpdate}</span>
        </div>
      )}

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Running</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.running}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Idle</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.idle}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold text-orange-600">{statusCounts.maintenance}</p>
              </div>
              <Tractor className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-gray-600">{statusCounts.offline}</p>
              </div>
              <MapPin className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Map and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden shadow-lg">
            <div style={{ height: '650px', position: 'relative' }}>
              <MapContainer
                center={centerPosition}
                zoom={11}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MachineMarkers machines={machines} onMarkerClick={setSelectedMachine} />
              </MapContainer>

              {/* Map Overlay Legend */}
              <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Status Legend</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
                    <span className="text-xs text-gray-700">Running</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                    <span className="text-xs text-gray-700">Idle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow"></div>
                    <span className="text-xs text-gray-700">Maintenance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow"></div>
                    <span className="text-xs text-gray-700">Offline</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Selected Machine Details */}
          {selectedMachine && (
            <Card className="border-2 border-blue-500 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Selected Machine
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Machine Name</p>
                    <p className="font-semibold">{selectedMachine.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-semibold">{selectedMachine.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${
                      selectedMachine.status === 'running' ? 'bg-green-100 text-green-700' :
                      selectedMachine.status === 'idle' ? 'bg-blue-100 text-blue-700' :
                      selectedMachine.status === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedMachine.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GPS Location</p>
                    <p className="font-mono text-xs">{selectedMachine.location.lat.toFixed(4)}, {selectedMachine.location.lng.toFixed(4)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Machines List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Machines ({machines.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {machines.map((machine) => (
                  <div 
                    key={machine.id} 
                    onClick={() => setSelectedMachine(machine)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMachine?.id === machine.id ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        machine.status === 'running' ? 'bg-green-500 animate-pulse' :
                        machine.status === 'idle' ? 'bg-blue-500' :
                        machine.status === 'maintenance' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{machine.name}</p>
                        <p className="text-xs text-muted-foreground">{machine.type}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
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
    </div>
  );
}
