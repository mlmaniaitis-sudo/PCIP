import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MapPin } from "lucide-react";

const riskMapData = [
  { name: "Ludhiana", lat: 30.9010, lon: 75.8573, riskLevel: 1 },
  { name: "Patiala", lat: 30.3398, lon: 76.3869, riskLevel: 2 },
  { name: "Amritsar", lat: 31.6340, lon: 74.8723, riskLevel: 3 },
  { name: "Bathinda", lat: 30.2110, lon: 74.9455, riskLevel: 2 },
  { name: "Jalandhar", lat: 31.3260, lon: 75.5762, riskLevel: 1 },
  { name: "Kapurthala", lat: 30.9322, lon: 75.3897, riskLevel: 2 },
  { name: "Shimla", lat: 31.1048, lon: 77.1734, riskLevel: 3 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794, riskLevel: 1 },
  { name: "Mohali", lat: 30.6942, lon: 76.8606, riskLevel: 2 },
  { name: "Phagwara", lat: 31.1471, lon: 75.3412, riskLevel: 1 },
  { name: "Nawanshahr", lat: 30.9625, lon: 75.5431, riskLevel: 3 },
  { name: "Ferozepur", lat: 31.0800, lon: 74.5229, riskLevel: 2 },
  { name: "Hoshiarpur", lat: 30.7850, lon: 75.6853, riskLevel: 1 },
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

export default function RiskMapView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Risk Assessment Map</h2>
        <p className="text-muted-foreground mt-1">
          Geographic distribution of compliance risk levels across regions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Regional Risk Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Map Placeholder with Static Image */}
          <div className="relative rounded-lg overflow-hidden mb-6 bg-muted/30 border">
            <div className="aspect-video w-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 flex items-center justify-center">
              <div className="text-center space-y-3 p-8">
                <MapPin className="w-12 h-12 mx-auto text-primary" />
                <p className="text-lg font-semibold">Interactive Map View</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Interactive Leaflet map showing risk distribution across Punjab and surrounding regions
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg">
              <div className="text-sm font-semibold mb-2">Risk Levels</div>
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

          {/* Location List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Location Details</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {riskMapData.map((location) => (
                <div
                  key={location.name}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{location.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
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
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
