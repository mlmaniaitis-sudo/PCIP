import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Users, 
  Calendar, 
  Award, 
  TrendingUp, 
  CheckCircle,
  Tractor,
  FileCheck
} from "lucide-react";

const kpiData = {
  totalMachines: 1250,
  machinesOnline: 987,
  totalFarmers: 8450,
  totalBookings: 15680,
  activeBookings: 342,
  totalCreditsAwarded: 12340,
  avgUtilizationPercent: 78.9,
  verifiedCompliancePercent: 94.2,
  totalParcelsManaged: 6780,
  parcelsSavedFromBurning: 6380,
};

const kpis = [
  {
    title: "Total Machines",
    value: kpiData.totalMachines.toLocaleString(),
    subtitle: `${kpiData.machinesOnline} online`,
    icon: Tractor,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-l-blue-500",
  },
  {
    title: "Machines Online",
    value: kpiData.machinesOnline.toLocaleString(),
    subtitle: `${((kpiData.machinesOnline/kpiData.totalMachines)*100).toFixed(1)}% availability`,
    icon: Activity,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-l-green-500",
  },
  {
    title: "Registered Farmers",
    value: kpiData.totalFarmers.toLocaleString(),
    subtitle: "Active users",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-l-purple-500",
  },
  {
    title: "Total Bookings",
    value: kpiData.totalBookings.toLocaleString(),
    subtitle: `${kpiData.activeBookings} active now`,
    icon: Calendar,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-l-orange-500",
  },
  {
    title: "Credits Awarded",
    value: `₹${(kpiData.totalCreditsAwarded * 500).toLocaleString()}`,
    subtitle: `${kpiData.totalCreditsAwarded.toLocaleString()} credits`,
    icon: Award,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-l-yellow-500",
  },
  {
    title: "Avg Utilization",
    value: `${kpiData.avgUtilizationPercent}%`,
    subtitle: "Machine efficiency",
    icon: TrendingUp,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    borderColor: "border-l-teal-500",
  },
  {
    title: "Verified Compliance",
    value: `${kpiData.verifiedCompliancePercent}%`,
    subtitle: `${Math.floor(kpiData.totalParcelsManaged * kpiData.verifiedCompliancePercent/100)} verified`,
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    borderColor: "border-l-emerald-500",
  },
  {
    title: "Parcels Managed",
    value: kpiData.totalParcelsManaged.toLocaleString(),
    subtitle: `${kpiData.parcelsSavedFromBurning.toLocaleString()} saved from burning`,
    icon: FileCheck,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    borderColor: "border-l-indigo-500",
  },
];

export default function KPIDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground mt-1">
            Real-time insights into PCIP machine management and environmental impact
          </p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <span className="text-sm font-semibold text-green-700">Live Data</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={kpi.title} 
              className={`hover:shadow-lg transition-all border-l-4 ${kpi.borderColor}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {kpiData.parcelsSavedFromBurning.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Parcels Saved from Burning
              </div>
              <div className="text-xs text-green-700 mt-2 font-semibold">
                🌱 Environmental Impact: High
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {((kpiData.parcelsSavedFromBurning / kpiData.totalParcelsManaged) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Burn Prevention Success Rate
              </div>
              <div className="text-xs text-blue-700 mt-2 font-semibold">
                📊 Target: 95%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                ₹{((kpiData.totalCreditsAwarded * 500) / 10000000).toFixed(1)}Cr
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Total Financial Incentives
              </div>
              <div className="text-xs text-purple-700 mt-2 font-semibold">
                💰 Disbursed to {kpiData.totalFarmers.toLocaleString()} farmers
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
