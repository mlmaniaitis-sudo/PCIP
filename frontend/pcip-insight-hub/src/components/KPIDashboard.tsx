import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  Users, 
  Calendar, 
  Award, 
  TrendingUp, 
  CheckCircle 
} from "lucide-react";

const kpiData = {
  totalMachines: 1250,
  machinesOnline: 987,
  totalFarmers: 8450,
  totalBookings: 15680,
  totalCreditsAwarded: 12340,
  avgUtilizationPercent: 78.9,
  verifiedCompliancePercent: 94.2,
};

const kpis = [
  {
    title: "Total Machines",
    value: kpiData.totalMachines.toLocaleString(),
    icon: Activity,
    color: "text-chart-1",
  },
  {
    title: "Machines Online",
    value: kpiData.machinesOnline.toLocaleString(),
    icon: Activity,
    color: "text-chart-2",
  },
  {
    title: "Total Farmers",
    value: kpiData.totalFarmers.toLocaleString(),
    icon: Users,
    color: "text-chart-1",
  },
  {
    title: "Total Bookings",
    value: kpiData.totalBookings.toLocaleString(),
    icon: Calendar,
    color: "text-chart-3",
  },
  {
    title: "Credits Awarded",
    value: kpiData.totalCreditsAwarded.toLocaleString(),
    icon: Award,
    color: "text-chart-2",
  },
  {
    title: "Avg Utilization",
    value: `${kpiData.avgUtilizationPercent}%`,
    icon: TrendingUp,
    color: "text-chart-1",
  },
  {
    title: "Verified Compliance",
    value: `${kpiData.verifiedCompliancePercent}%`,
    icon: CheckCircle,
    color: "text-chart-2",
  },
];

export default function KPIDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-1">
          Key performance indicators for PCIP machine management
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
