import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Award, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock compliance data
const complianceData = [
  { id: 'P1001', farmer: 'Amit Singh', district: 'Ludhiana', area: 5.2, status: 'Verified', awarded: true, credits: 260, date: '2025-10-18', method: 'Satellite + IoT' },
  { id: 'P1002', farmer: 'Meena Devi', district: 'Patiala', area: 4.8, status: 'Pending', awarded: false, credits: 0, date: '2025-10-19', method: 'Satellite' },
  { id: 'P1003', farmer: 'Ramesh Kumar', district: 'Amritsar', area: 6.0, status: 'Flagged', awarded: false, credits: 0, date: '2025-10-18', method: 'Manual Review' },
  { id: 'P1004', farmer: 'Sumit Sharma', district: 'Bathinda', area: 3.6, status: 'Verified', awarded: true, credits: 180, date: '2025-10-15', method: 'Satellite + IoT' },
  { id: 'P1005', farmer: 'Priya Verma', district: 'Jalandhar', area: 7.2, status: 'Verified', awarded: true, credits: 360, date: '2025-10-17', method: 'Satellite + IoT' },
  { id: 'P1006', farmer: 'Vikram Yadav', district: 'Chandigarh', area: 2.9, status: 'Pending', awarded: false, credits: 0, date: '2025-10-20', method: 'Satellite' },
  { id: 'P1007', farmer: 'Sunita Reddy', district: 'Mohali', area: 5.5, status: 'Verified', awarded: true, credits: 275, date: '2025-10-16', method: 'Satellite + IoT' },
  { id: 'P1008', farmer: 'Arjun Gupta', district: 'Ludhiana', area: 8.1, status: 'Verified', awarded: true, credits: 405, date: '2025-10-14', method: 'Satellite + IoT' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Verified':
      return (
        <Badge variant="default" className="bg-green-100 text-green-700 border-green-300">
          <CheckCircle className="inline w-3 h-3 mr-1" />
          Verified ✓
        </Badge>
      );
    case 'Pending':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="inline w-3 h-3 mr-1" />
          Pending ⏳
        </Badge>
      );
    case 'Flagged':
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300">
          <AlertTriangle className="inline w-3 h-3 mr-1" />
          Flagged 🚩
        </Badge>
      );
    default:
      return <Badge>Unknown</Badge>;
  }
};

const handleExportCSV = () => {
  alert('CSV export feature would download compliance-report.csv');
};

const handleExportPDF = () => {
  alert('PDF export feature would generate compliance-report.pdf');
};

export default function ComplianceReport() {
  const totalVerified = complianceData.filter(d => d.status === 'Verified').length;
  const totalCredits = complianceData.reduce((sum, d) => sum + d.credits, 0);
  const totalArea = complianceData.reduce((sum, d) => sum + d.area, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compliance Verification Report</h2>
          <p className="text-muted-foreground mt-1">
            Satellite + IoT verified parcels • Automated credit awarding system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <FileText className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified Parcels</p>
                <p className="text-2xl font-bold text-green-600">{totalVerified}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Area</p>
                <p className="text-2xl font-bold text-blue-600">{totalArea.toFixed(1)} ha</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credits Awarded</p>
                <p className="text-2xl font-bold text-yellow-600">{totalCredits}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">₹{(totalCredits * 500).toLocaleString()}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Parcel Compliance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parcel ID</TableHead>
                <TableHead>Farmer Name</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Area (ha)</TableHead>
                <TableHead>Verification Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credits Awarded</TableHead>
                <TableHead>Date Verified</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceData.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono font-semibold">#{row.id}</TableCell>
                  <TableCell className="font-medium">{row.farmer}</TableCell>
                  <TableCell>{row.district}</TableCell>
                  <TableCell>{row.area} ha</TableCell>
                  <TableCell>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {row.method}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(row.status)}</TableCell>
                  <TableCell>
                    {row.awarded ? (
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        <Award className="inline w-3 h-3 mr-1" />
                        {row.credits} credits
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
