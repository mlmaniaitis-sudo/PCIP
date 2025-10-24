import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { machines } from '@/data/mockData';
import MachineMarkers from '@/components/MachineMarkers';
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Live Machine Map</h1>
        <p className="text-muted-foreground mt-1">Real-time location tracking of all machines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div style={{ height: '600px' }}>
              <MapContainer
                center={centerPosition}
                zoom={11}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MachineMarkers machines={machines} />
              </MapContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow"></div>
                <span className="text-sm">Running</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                <span className="text-sm">Idle</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-500 border-2 border-white shadow"></div>
                <span className="text-sm">Offline</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white shadow"></div>
                <span className="text-sm">Maintenance</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Machines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {machines.map((machine) => (
                  <div key={machine.id} className="flex items-center justify-between text-sm pb-2 border-b last:border-0">
                    <span className="font-medium">{machine.name}</span>
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
