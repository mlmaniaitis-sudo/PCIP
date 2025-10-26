import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Machine } from '@/data/mockData';

interface MachineMarkersProps {
  machines: Machine[];
  onMarkerClick?: (machine: Machine) => void; // ✅ Added this prop
}

const getMarkerColor = (status: string) => {
  switch (status) {
    case 'running':
      return '#22c55e'; // green-500
    case 'idle':
      return '#3b82f6'; // blue-500
    case 'maintenance':
      return '#f97316'; // orange-500
    case 'offline':
      return '#6b7280'; // gray-500
    default:
      return '#6b7280';
  }
};

const createCustomIcon = (status: string) => {
  const color = getMarkerColor(status);
  const isPulsing = status === 'running';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        ${isPulsing ? 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;' : ''}
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 19h16v2H4v-2zm15-8h-2V8h-2V6h3v5zm-4 0h-2V6h2v5zm-4 0H9V4h2v7zM6 11H4V9h2v2z"/>
        </svg>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.9;
          }
        }
      </style>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

function MachineMarkers({ machines, onMarkerClick }: MachineMarkersProps) {
  return (
    <>
      {machines.map((machine) => (
        <Marker
          key={machine.id}
          position={[machine.location.lat, machine.location.lng]}
          icon={createCustomIcon(machine.status)}
          eventHandlers={{
            click: () => {
              if (onMarkerClick) {
                onMarkerClick(machine);
              }
            },
          }}
        >
          <Popup>
            <div className="p-2 min-w-[180px]">
              <h3 className="font-bold text-base mb-1">{machine.name}</h3>
              <p className="text-sm text-gray-600 mb-2">🚜 {machine.type}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Status:</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  machine.status === 'running' ? 'bg-green-100 text-green-700' :
                  machine.status === 'idle' ? 'bg-blue-100 text-blue-700' :
                  machine.status === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {machine.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-mono">
                📍 {machine.location.lat.toFixed(4)}, {machine.location.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default MachineMarkers;
