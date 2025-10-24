import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Generate compliance data
const generateComplianceData = () => {
  const statuses = ["Verified No Burn", "Burn Detected", "Pending"];
  const districts = ["Ludhiana", "Patiala", "Amritsar", "Bathinda", "Jalandhar"];
  const machineTypes = ["Baler", "Mulcher", "Harvester", "Chopper"];
  const data = [];

  for (let i = 1; i <= 25; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    data.push({
      bookingId: `BK${String(i).padStart(5, "0")}`,
      farmerId: `FM${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
      parcelId: `PL${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`,
      district: districts[Math.floor(Math.random() * districts.length)],
      machineType: machineTypes[Math.floor(Math.random() * machineTypes.length)],
      completedDate: new Date(2024, 9, Math.floor(Math.random() * 30) + 1).toISOString(),
      verificationStatus: status,
      creditAwarded: status === "Verified No Burn",
    });
  }
  return data;
};

const complianceData = generateComplianceData();

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "Verified No Burn":
      return "default";
    case "Burn Detected":
      return "destructive";
    case "Pending":
      return "secondary";
    default:
      return "outline";
  }
};

export default function ComplianceReport() {
  const [filteredData, setFilteredData] = useState(complianceData);

  const handleExportCSV = () => {
    toast.info("Export CSV functionality not implemented");
  };

  const handleExportPDF = () => {
    toast.info("Export PDF functionality not implemented");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Compliance Report</h2>
        <p className="text-muted-foreground mt-1">
          Booking verification status and credit awards
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="filterDistrict">District</Label>
              <Select>
                <SelectTrigger id="filterDistrict">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  <SelectItem value="ludhiana">Ludhiana</SelectItem>
                  <SelectItem value="patiala">Patiala</SelectItem>
                  <SelectItem value="amritsar">Amritsar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterStatus">Status</Label>
              <Select>
                <SelectTrigger id="filterStatus">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="verified">Verified No Burn</SelectItem>
                  <SelectItem value="burn">Burn Detected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterStartDate">Start Date</Label>
              <Input id="filterStartDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterEndDate">End Date</Label>
              <Input id="filterEndDate" type="date" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleExportCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
        <Button onClick={handleExportPDF} variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Records ({filteredData.length} total)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Farmer ID</TableHead>
                  <TableHead>Parcel ID</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Machine Type</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.bookingId}>
                    <TableCell className="font-medium">{record.bookingId}</TableCell>
                    <TableCell>{record.farmerId}</TableCell>
                    <TableCell>{record.parcelId}</TableCell>
                    <TableCell>{record.district}</TableCell>
                    <TableCell>{record.machineType}</TableCell>
                    <TableCell>
                      {format(new Date(record.completedDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(record.verificationStatus)}>
                        {record.verificationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.creditAwarded ? (
                        <span className="text-success font-medium">Yes</span>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
