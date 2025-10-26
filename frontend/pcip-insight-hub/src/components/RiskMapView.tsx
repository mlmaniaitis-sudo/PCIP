import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const riskMapData = [
  { name: "Ludhiana", lat: 30.9010, lng: 75.8573, riskLevel: 1 },
  { name: "Patiala", lat: 30.3398, lng: 76.3869, riskLevel: 2 },
  { name: "Amritsar", lat: 31.6340, lng: 74.8723, riskLevel: 3 },
  { name: "Bathinda", lat: 30.2110, lng: 74.9455, riskLevel: 2 },
  { name: "Jalandhar", lat: 31.3260, lng: 75.5762, riskLevel: 1 },
  { name: "Kapurthala", lat: 30.9322, lng: 75.3897, riskLevel: 2 },
  { name: "Shimla", lat: 31.1048, lng: 77.1734, riskLevel: 3 },
  { name: "Chandigarh", lat: 30.7333, lng: 76.7794, riskLevel: 1 },
  { name: "Mohali", lat: 30.6942, lng: 76.8606, riskLevel: 2 },
  { name: "Phagwara", lat: 31.1471, lng: 75.3412, riskLevel: 1 },
  { name: "Nawanshahr", lat: 30.9625, lng: 75.5431, riskLevel: 3 },
  { name: "Ferozepur", lat: 31.0800, lng: 74.5229, riskLevel: 2 },
  { name: "Hoshiarpur", lat: 30.7850, lng: 75.6853, riskLevel: 1 },
];

const getRiskBadgeVariant = (level: number): "default" | "secondary" | "destructive" => {
  switch (level) {
    case 1:
      return "default";
    case 2:
      return "secondary";
    case 3:
      return "destructive";
    default:
      return "secondary";
  }
};

const getRiskLabel = (level: number) => {
  switch (level) {
    case 1:
      return "Low";
    case 2:
      return "Medium";
    case 3:
      return "High";
    default:
      return "Unknown";
  }
};

const getRiskColor = (level: number) => {
  switch (level) {
    case 1:
      return "#22c55e"; // green
    case 2:
      return "#f59e0b"; // orange/yellow
    case 3:
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};

export default function RiskMapView() {
  const [selectedLocation, setSelectedLocation] = useState<typeof riskMapData[0] | null>(null);
  const centerPosition: LatLngExpression = [30.9, 75.85];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Risk Assessment Map</h2>
        <p className="text-muted-foreground mt-1">
          Real-time burning hotspot detection • Geographic distribution of compliance risk
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Regional Risk Distribution - Punjab & Surrounding Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Interactive Leaflet Map */}
          <div className="relative rounded-lg overflow-hidden mb-6 border">
            <div style={{ height: '500px', width: '100%' }}>
              <MapContainer
                center={centerPosition}
                zoom={8}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Risk Location Markers */}
                {riskMapData.map((location) => (
                  <CircleMarker
                    key={location.name}
                    center={[location.lat, location.lng] as LatLngExpression}
                    radius={15}
                    pathOptions={{
                      fillColor: getRiskColor(location.riskLevel),
                      fillOpacity: 0.7,
                      color: getRiskColor(location.riskLevel),
                      weight: 3,
                    }}
                    eventHandlers={{
                      click: () => setSelectedLocation(location),
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <p className="font-semibold text-base">{location.name}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">Risk Level:</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            location.riskLevel === 1 ? 'bg-green-100 text-green-700' :
                            location.riskLevel === 2 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {getRiskLabel(location.riskLevel)}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>

            {/* Legend Overlay */}
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg z-[1000]">
              <div className="text-sm font-semibold mb-2">🔥 Risk Levels</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#22c55e]" />
                  <span className="text-xs">Low Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#f59e0b]" />
                  <span className="text-xs">Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#ef4444]" />
                  <span className="text-xs">High Risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Location Details */}
          {selectedLocation && (
            <Card className="mb-6 border-2 border-primary">
              <CardHeader className="bg-blue-50 dark:bg-blue-950">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Selected Location: {selectedLocation.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Coordinates</p>
                    <p className="font-mono text-sm">{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <Badge variant={getRiskBadgeVariant(selectedLocation.riskLevel)} className="mt-1">
                      {getRiskLabel(selectedLocation.riskLevel)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">All Monitored Locations</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {riskMapData.map((location) => (
                <div
                  key={location.name}
                  onClick={() => setSelectedLocation(location)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                    selectedLocation?.name === location.name ? 'bg-blue-50 border-blue-300' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getRiskColor(location.riskLevel) }}
                    />
                    <div>
                      <div className="font-medium">{location.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getRiskBadgeVariant(location.riskLevel)}>
                    {getRiskLabel(location.riskLevel)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {riskMapData.filter((l) => l.riskLevel === 1).length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Low Risk Areas</div>
                  <div className="text-xs text-green-700 mt-2">✓ Safe for operations</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {riskMapData.filter((l) => l.riskLevel === 2).length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Medium Risk Areas</div>
                  <div className="text-xs text-yellow-700 mt-2">⚠ Monitor closely</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {riskMapData.filter((l) => l.riskLevel === 3).length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">High Risk Areas</div>
                  <div className="text-xs text-red-700 mt-2">🔥 Immediate attention required</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
