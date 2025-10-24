import { Marker, Popup } from 'react-leaflet';
import type { Machine } from '@/data/mockData';

interface MachineMarkersProps {
  machines: Machine[];
}

function MachineMarkers({ machines }: MachineMarkersProps) {
  return (
    <>
      {machines.map((machine) => (
        <Marker
          key={machine.id}
          position={[machine.location.lat, machine.location.lon]}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">{machine.name}</h3>
              <p className="text-sm text-gray-600">{machine.type}</p>
              <p className="text-sm">
                Status: <span className={`font-medium ${
                  machine.status === 'running' ? 'text-green-600' :
                  machine.status === 'idle' ? 'text-blue-600' :
                  machine.status === 'maintenance' ? 'text-orange-600' :
                  'text-gray-600'
                }`}>{machine.status}</span>
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default MachineMarkers;
