import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { apiFetch } from '../utils/apiHelper';
import { FileSpreadsheet, Download, RefreshCw, Layers, Users, CalendarDays } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Member {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  cellGroupId: string;
  cellGroupName: string;
  leadershipStatus: string;
  lcsolLevel: string;
  birthday: string;
  studentStatus: string;
  position: string;
  trainingLevel: string;
  cellLeader?: string;
  primaryLeader?: string;
  volunteerTeams?: string;
}

interface CellGroup {
  id: string;
  name: string;
  leader: string;
  primaryLeader: string;
  status: string;
  memberCount: number;
  schedule: string;
  time: string;
  venue: string;
  location: string;
  groupType?: 'STUDENT' | 'ALUMNI';
  formationDate: string;
}

const PRIMARY_LEADERS_MEN = [
  "Abogado, Virgilio",
  "Ballano, Daniel Oriel",
  "Castro, Albert",
  "Dumael, Darwin",
  "Felicelda, Herald",
  "Figueroa, Jeffrey",
  "Lausin, Isaac",
  "Lisondra, Karl",
  "Malificar, Romeo Jr",
  "Roque, Michael",
  "Samson, John Benz",
  "Sedilla, Raymond"
];

const PRIMARY_LEADERS_WOMEN = [
  "Abogaodo, Eden",
  "Calilong, Mary Grace",
  "Dalina, Emelda",
  "Delen, Joy",
  "Dorado, Lilibeth",
  "Felicelda, Dineriel Grace",
  "Malificar, Diane Grace",
  "Manalo, Sierra",
  "Polandaya, Ana Camille",
  "Ps. Ballano, Geraldine",
  "Ranay, Divine",
  "Rivamonte, Florie Ann",
  "Roque, Victoria"
];

export function SpreadsheetReportsModule() {
  const [members, setMembers] = useState<Member[]>([]);
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersRes, cellGroupsRes] = await Promise.all([
        apiFetch(`https://${projectId}.supabase.co/functions/v1/make-server-37669f54/members`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        apiFetch(`https://${projectId}.supabase.co/functions/v1/make-server-37669f54/cell-groups`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        })
      ]);

      const membersData = await membersRes.json();
      const cellGroupsData = await cellGroupsRes.json();

      if (membersData.success && cellGroupsData.success) {
        setMembers(membersData.data);
        setCellGroups(cellGroupsData.data);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to sync reports database.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success("Database reports sync complete!");
  };

  // Parsing Birthdays into Month and Day, Year
  const getBirthdayMonth = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString('en-US', { month: 'long' });
    } catch {
      return "";
    }
  };

  const getBirthdayDayYear = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}, ${year}`;
    } catch {
      return "";
    }
  };

  // Helper matching names for Primary Leader grouping
  const isLeaderMatch = (memberLeader: string | undefined, targetLeader: string) => {
    if (!memberLeader || !targetLeader) return false;
    
    // Normalize names (lowercase, remove punctuation, split to words)
    const mWords = memberLeader.toLowerCase().replace(/[,.]/g, '').split(/\s+/).filter(Boolean);
    const tWords = targetLeader.toLowerCase().replace(/[,.]/g, '').split(/\s+/).filter(Boolean);
    
    // Check overlap of words (e.g. "lausin" overlaps in "isaac lausin" and "lausin, isaac")
    return mWords.some(w => tWords.includes(w)) || tWords.some(w => mWords.includes(w));
  };

  // Helper to resolve status mappings
  const normalizeStatus = (status: string | undefined) => {
    if (!status) return "";
    const s = status.toLowerCase();
    if (s.includes('attender')) return 'ATT';
    if (s.includes('cell member') || s === 'member' || s === 'cm') return 'CM';
    if (s.includes('trainee') || s.includes('potential') || s === 'pl') return 'PL';
    if (s.includes('cell leader') || s === 'cl') return 'CL';
    if (s.includes('primary leader') || s.includes('leader of leaders') || s.includes('coordinator') || s === 'll') return 'LL';
    return "";
  };

  // Helper to resolve LCSOL level mappings
  const normalizeLcsol = (level: string | undefined) => {
    if (!level) return "";
    const l = level.toUpperCase();
    if (l.includes('L1-4') || l.includes('LIFECLASS L1-4')) return 'LC L1-4';
    if (l.includes('ENCOUNTER') || l.includes('ENC')) return 'ENC';
    if (l.includes('L6-9') || l.includes('LIFECLASS L6-9')) return 'LC L6-9';
    if (l.includes('SOL 1') || l.includes('SOL1')) return 'SOL 1';
    if (l.includes('SOL 2') || l.includes('SOL2')) return 'SOL 2';
    if (l.includes('SOL 3') || l.includes('SOL3')) return 'SOL 3';
    if (l.includes('GRAD') || l.includes('GRADUATE')) return 'GRAD';
    return "";
  };

  // Compute stats for a specific primary leader
  const computeLeaderStats = (leaderName: string) => {
    const leaderMembers = members.filter(m => isLeaderMatch(m.primaryLeader, leaderName));
    const totalStudents = leaderMembers.length;

    // Status counts
    const statusCounts = { ATT: 0, CM: 0, PL: 0, CL: 0, LL: 0 };
    // LCSOL counts
    const lcsolCounts = { 'LC L1-4': 0, 'ENC': 0, 'LC L6-9': 0, 'SOL 1': 0, 'SOL 2': 0, 'SOL 3': 0, 'GRAD': 0 };
    // Group counts
    const groupCounts = { STUDENT: 0, ALUMNI: 0 };

    leaderMembers.forEach(m => {
      const statusKey = normalizeStatus(m.leadershipStatus) as keyof typeof statusCounts;
      if (statusKey in statusCounts) {
        statusCounts[statusKey]++;
      }

      const lcsolKey = normalizeLcsol(m.lcsolLevel) as keyof typeof lcsolCounts;
      if (lcsolKey in lcsolCounts) {
        lcsolCounts[lcsolKey]++;
      }

      if (m.studentStatus?.toUpperCase() === 'ALUMNI') {
        groupCounts.ALUMNI++;
      } else {
        groupCounts.STUDENT++;
      }
    });

    return {
      leaderName,
      totalStudents,
      statusCounts,
      lcsolCounts,
      groupCounts
    };
  };

  // Generate matrix summaries
  const menStats = PRIMARY_LEADERS_MEN.map(computeLeaderStats);
  const womenStats = PRIMARY_LEADERS_WOMEN.map(computeLeaderStats);

  // Compute Subtotals
  const computeSubtotals = (statsList: typeof menStats) => {
    const totals = {
      students: 0,
      status: { ATT: 0, CM: 0, PL: 0, CL: 0, LL: 0 },
      lcsol: { 'LC L1-4': 0, 'ENC': 0, 'LC L6-9': 0, 'SOL 1': 0, 'SOL 2': 0, 'SOL 3': 0, 'GRAD': 0 },
      group: { STUDENT: 0, ALUMNI: 0 }
    };

    statsList.forEach(s => {
      totals.students += s.totalStudents;
      Object.keys(s.statusCounts).forEach(k => {
        totals.status[k as keyof typeof totals.status] += s.statusCounts[k as keyof typeof s.statusCounts];
      });
      Object.keys(s.lcsolCounts).forEach(k => {
        totals.lcsol[k as keyof typeof totals.lcsol] += s.lcsolCounts[k as keyof typeof s.lcsolCounts];
      });
      Object.keys(s.groupCounts).forEach(k => {
        totals.group[k as keyof typeof totals.group] += s.groupCounts[k as keyof typeof s.groupCounts];
      });
    });

    return totals;
  };

  const menSubtotals = computeSubtotals(menStats);
  const womenSubtotals = computeSubtotals(womenStats);

  const grandTotals = {
    students: menSubtotals.students + womenSubtotals.students,
    status: {
      ATT: menSubtotals.status.ATT + womenSubtotals.status.ATT,
      CM: menSubtotals.status.CM + womenSubtotals.status.CM,
      PL: menSubtotals.status.PL + womenSubtotals.status.PL,
      CL: menSubtotals.status.CL + womenSubtotals.status.CL,
      LL: menSubtotals.status.LL + womenSubtotals.status.LL,
    },
    lcsol: {
      'LC L1-4': menSubtotals.lcsol['LC L1-4'] + womenSubtotals.lcsol['LC L1-4'],
      'ENC': menSubtotals.lcsol['ENC'] + womenSubtotals.lcsol['ENC'],
      'LC L6-9': menSubtotals.lcsol['LC L6-9'] + womenSubtotals.lcsol['LC L6-9'],
      'SOL 1': menSubtotals.lcsol['SOL 1'] + womenSubtotals.lcsol['SOL 1'],
      'SOL 2': menSubtotals.lcsol['SOL 2'] + womenSubtotals.lcsol['SOL 2'],
      'SOL 3': menSubtotals.lcsol['SOL 3'] + womenSubtotals.lcsol['SOL 3'],
      'GRAD': menSubtotals.lcsol['GRAD'] + womenSubtotals.lcsol['GRAD'],
    },
    group: {
      STUDENT: menSubtotals.group.STUDENT + womenSubtotals.group.STUDENT,
      ALUMNI: menSubtotals.group.ALUMNI + womenSubtotals.group.ALUMNI,
    }
  };

  // CSV Exporter for Sheets
  const exportToCSV = (sheetType: string) => {
    let csvContent = "";
    let fileName = "";

    if (sheetType === 'members') {
      fileName = "PUP_SONS_Members_Master_Sheet.csv";
      const headers = ["#", "Cell/Potential Leader", "CELL LEADER", "Primary Leader", "STATUS (CM;PL;CM)", "LCSOL LEVEL", "Birthday Month", "Birthday Day, Year"];
      const rows = members.map((m, i) => [
        i + 1,
        m.name,
        m.cellLeader || "None",
        m.primaryLeader || "None",
        m.leadershipStatus,
        m.lcsolLevel || "None",
        getBirthdayMonth(m.birthday),
        getBirthdayDayYear(m.birthday)
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
    } 
    else if (sheetType === 'summary') {
      fileName = "PUP_SONS_Coordinators_Summary_Matrix.csv";
      const headers = ["Primary Coordinator", "# OF STUDENTS", "ATT", "CM", "PL", "CL", "LL", "LC L1-4", "ENC", "LC L6-9", "SOL 1", "SOL 2", "SOL 3", "GRAD", "STUDENT GROUP", "ALUMNI GROUP"];
      const rows: any[] = [];

      // Add Men
      menStats.forEach(s => {
        rows.push([s.leaderName, s.totalStudents, s.statusCounts.ATT, s.statusCounts.CM, s.statusCounts.PL, s.statusCounts.CL, s.statusCounts.LL, s.lcsolCounts['LC L1-4'], s.lcsolCounts['ENC'], s.lcsolCounts['LC L6-9'], s.lcsolCounts['SOL 1'], s.lcsolCounts['SOL 2'], s.lcsolCounts['SOL 3'], s.lcsolCounts['GRAD'], s.groupCounts.STUDENT, s.groupCounts.ALUMNI]);
      });
      rows.push(["MEN SUBTOTAL", menSubtotals.students, menSubtotals.status.ATT, menSubtotals.status.CM, menSubtotals.status.PL, menSubtotals.status.CL, menSubtotals.status.LL, menSubtotals.lcsol['LC L1-4'], menSubtotals.lcsol['ENC'], menSubtotals.lcsol['LC L6-9'], menSubtotals.lcsol['SOL 1'], menSubtotals.lcsol['SOL 2'], menSubtotals.lcsol['SOL 3'], menSubtotals.lcsol['GRAD'], menSubtotals.group.STUDENT, menSubtotals.group.ALUMNI]);

      // Add Women
      womenStats.forEach(s => {
        rows.push([s.leaderName, s.totalStudents, s.statusCounts.ATT, s.statusCounts.CM, s.statusCounts.PL, s.statusCounts.CL, s.statusCounts.LL, s.lcsolCounts['LC L1-4'], s.lcsolCounts['ENC'], s.lcsolCounts['LC L6-9'], s.lcsolCounts['SOL 1'], s.lcsolCounts['SOL 2'], s.lcsolCounts['SOL 3'], s.lcsolCounts['GRAD'], s.groupCounts.STUDENT, s.groupCounts.ALUMNI]);
      });
      rows.push(["WOMEN SUBTOTAL", womenSubtotals.students, womenSubtotals.status.ATT, womenSubtotals.status.CM, womenSubtotals.status.PL, womenSubtotals.status.CL, womenSubtotals.status.LL, womenSubtotals.lcsol['LC L1-4'], womenSubtotals.lcsol['ENC'], womenSubtotals.lcsol['LC L6-9'], womenSubtotals.lcsol['SOL 1'], womenSubtotals.lcsol['SOL 2'], womenSubtotals.lcsol['SOL 3'], womenSubtotals.lcsol['GRAD'], womenSubtotals.group.STUDENT, womenSubtotals.group.ALUMNI]);

      // Grand Total
      rows.push(["GRAND TOTAL", grandTotals.students, grandTotals.status.ATT, grandTotals.status.CM, grandTotals.status.PL, grandTotals.status.CL, grandTotals.status.LL, grandTotals.lcsol['LC L1-4'], grandTotals.lcsol['ENC'], grandTotals.lcsol['LC L6-9'], grandTotals.lcsol['SOL 1'], grandTotals.lcsol['SOL 2'], grandTotals.lcsol['SOL 3'], grandTotals.lcsol['GRAD'], grandTotals.group.STUDENT, grandTotals.group.ALUMNI]);

      csvContent = [headers.join(','), ...rows.map(r => r.map((val: any) => typeof val === 'string' ? `"${val}"` : val).join(','))].join('\n');
    }
    else if (sheetType === 'schedules') {
      fileName = "PUP_SONS_Cell_Groups_Schedules_Sheet.csv";
      const headers = ["CELL LEADER", "PRIMARY LEADER", "Student / Alumni", "# OF PEOPLE", "Schedule Day", "Time", "Venue"];
      const rows = cellGroups.map(cg => [
        cg.leader,
        cg.primaryLeader || "None",
        cg.groupType || "STUDENT",
        cg.memberCount || 0,
        cg.schedule || "Every Monday",
        cg.time || "TBD",
        cg.venue || "TBD"
      ]);
      csvContent = [headers.join(','), ...rows.map(r => r.map(val => typeof val === 'string' ? `"${val}"` : val).join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${fileName} downloaded successfully!`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="text-slate-600 font-bold text-sm">Rendering database spreadsheets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-gray-900 font-extrabold text-xl flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            PUP SONS Database Sheets
          </h2>
          <p className="text-gray-600 text-sm">Interactive Excel-like spreadsheets mapped dynamically from the cell group tracker database</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-slate-200 hover:bg-slate-50 font-bold text-xs"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Active DB
          </Button>
        </div>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <div className="bg-white border shadow-sm p-2.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <TabsList className="bg-slate-100/80 p-1 rounded-xl w-full md:w-auto flex justify-start">
            <TabsTrigger value="members" className="rounded-lg text-xs font-bold px-4 py-2 flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
              <Users className="w-3.5 h-3.5" />
              Members Directory Sheet
            </TabsTrigger>
            <TabsTrigger value="summary" className="rounded-lg text-xs font-bold px-4 py-2 flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
              <Layers className="w-3.5 h-3.5" />
              Primary Leaders Summary
            </TabsTrigger>
            <TabsTrigger value="schedules" className="rounded-lg text-xs font-bold px-4 py-2 flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
              <CalendarDays className="w-3.5 h-3.5" />
              Cell Groups Schedules
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <TabsContent value="members" className="mt-0">
              <Button onClick={() => exportToCSV('members')} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                <Download className="w-4 h-4 mr-1.5" /> Export Sheet
              </Button>
            </TabsContent>
            <TabsContent value="summary" className="mt-0">
              <Button onClick={() => exportToCSV('summary')} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                <Download className="w-4 h-4 mr-1.5" /> Export Sheet
              </Button>
            </TabsContent>
            <TabsContent value="schedules" className="mt-0">
              <Button onClick={() => exportToCSV('schedules')} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                <Download className="w-4 h-4 mr-1.5" /> Export Sheet
              </Button>
            </TabsContent>
          </div>
        </div>

        {/* TAB 1: MEMBERS MASTER DIRECTORY SHEET */}
        <TabsContent value="members" className="pt-4 focus-visible:outline-none">
          <Card className="border shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 py-4 px-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">PUP SONS STUDENTS DATABASE - MEMBERS LISTING</CardTitle>
                  <CardDescription className="text-xs">Individual cell group member attributes directory</CardDescription>
                </div>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 font-extrabold text-[10px]">
                  {members.length} Rows Logged
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="max-h-[60vh] overflow-y-auto">
                <Table className="border-collapse border-slate-200">
                  <TableHeader className="bg-slate-100/50 sticky top-0 z-10 border-b">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-extrabold text-slate-800 border text-center bg-slate-150 w-12">#</TableHead>
                      <TableHead className="font-extrabold text-slate-800 border min-w-[200px] bg-slate-150">Cell/Potential leader</TableHead>
                      <TableHead className="font-extrabold text-slate-800 border min-w-[180px] bg-slate-150">CELL LEADER</TableHead>
                      <TableHead className="font-extrabold text-slate-800 border min-w-[180px] bg-slate-150">Primary Leader</TableHead>
                      <TableHead className="font-extrabold text-slate-800 border min-w-[140px] text-center bg-slate-150">STATUS (CM;PL;CM)</TableHead>
                      <TableHead className="font-extrabold text-slate-800 border min-w-[140px] text-center bg-slate-150">LCSOL LEVEL</TableHead>
                      <TableHead className="font-extrabold text-slate-800 border min-w-[120px] text-center bg-slate-150">Birthday Month</TableHead>
                      <TableHead className="font-extrabold text-slate-800 border min-w-[120px] text-center bg-slate-150">Birthday Day, Year</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m, index) => (
                      <TableRow key={m.id} className="hover:bg-slate-50/50 border-b transition-colors text-xs font-semibold text-slate-700">
                        <TableCell className="border text-center text-slate-400 font-bold bg-slate-50/30">{index + 1}</TableCell>
                        <TableCell className="border font-bold text-slate-900 px-4 py-3">{m.name}</TableCell>
                        <TableCell className="border px-4 py-3 text-slate-800">{m.cellLeader || "-"}</TableCell>
                        <TableCell className="border px-4 py-3 text-slate-800">{m.primaryLeader || "-"}</TableCell>
                        <TableCell className="border text-center px-2 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border
                            ${m.leadershipStatus === 'Cell Leader' ? 'bg-purple-50 text-purple-700 border-purple-100' : ''}
                            ${m.leadershipStatus === 'Primary Leader' ? 'bg-blue-50 text-blue-700 border-blue-100' : ''}
                            ${m.leadershipStatus === 'Trainee' ? 'bg-orange-50 text-orange-700 border-orange-100' : ''}
                            ${m.leadershipStatus === 'Member' || m.leadershipStatus === 'Cell Member' ? 'bg-slate-50 text-slate-700 border-slate-200' : ''}
                            ${m.leadershipStatus === 'Attender' ? 'bg-amber-50 text-amber-700 border-amber-100' : ''}
                          `}>
                            {m.leadershipStatus}
                          </span>
                        </TableCell>
                        <TableCell className="border text-center px-2 py-3">
                          {m.lcsolLevel !== 'None' && m.lcsolLevel ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold">
                              {m.lcsolLevel}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-normal">-</span>
                          )}
                        </TableCell>
                        <TableCell className="border text-center px-4 py-3 text-slate-600">{getBirthdayMonth(m.birthday) || <span className="text-slate-300 font-normal">-</span>}</TableCell>
                        <TableCell className="border text-center px-4 py-3 text-slate-600">{getBirthdayDayYear(m.birthday) || <span className="text-slate-300 font-normal">-</span>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: PRIMARY LEADERS SUMMARY SHEET */}
        <TabsContent value="summary" className="pt-4 focus-visible:outline-none">
          <Card className="border shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 py-4 px-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">COORDINATORS LEADERSHIP PIPELINE & STATUS SUMMARY MATRIX</CardTitle>
                  <CardDescription className="text-xs">PUP STA MESA - PUP SONS STUDENTS DATABASE METRICS</CardDescription>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border">
                    Grouped by Overseer / Leader of Leaders
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="border-collapse border-slate-200 text-xs">
                <TableHeader className="bg-slate-50">
                  {/* Top Level Headers */}
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-extrabold border text-slate-800 bg-slate-100 min-w-[200px]" rowSpan={2}>Primary Leader</TableHead>
                    <TableHead className="font-extrabold border text-center text-slate-800 bg-slate-100 w-24" rowSpan={2}># OF PUP STUDENTS</TableHead>
                    <TableHead className="font-extrabold border text-center text-slate-800 bg-amber-50" colSpan={5}>LEADERSHIP STATUS</TableHead>
                    <TableHead className="font-extrabold border text-center text-slate-800 bg-emerald-50" colSpan={7}>LCSOL LEVEL</TableHead>
                    <TableHead className="font-extrabold border text-center text-slate-800 bg-blue-50" colSpan={2}>CELL GROUP</TableHead>
                  </TableRow>
                  {/* Subheaders */}
                  <TableRow className="hover:bg-transparent text-[10px]">
                    <TableHead className="font-extrabold border text-center bg-amber-50/20 text-slate-700">ATT</TableHead>
                    <TableHead className="font-extrabold border text-center bg-amber-50/20 text-slate-700">CM</TableHead>
                    <TableHead className="font-extrabold border text-center bg-amber-50/20 text-slate-700">PL</TableHead>
                    <TableHead className="font-extrabold border text-center bg-amber-50/20 text-slate-700">CL</TableHead>
                    <TableHead className="font-extrabold border text-center bg-amber-50/20 text-slate-700">LL</TableHead>
                    
                    <TableHead className="font-extrabold border text-center bg-emerald-50/20 text-slate-700">LC L1-4</TableHead>
                    <TableHead className="font-extrabold border text-center bg-emerald-50/20 text-slate-700">ENC</TableHead>
                    <TableHead className="font-extrabold border text-center bg-emerald-50/20 text-slate-700">LC L6-9</TableHead>
                    <TableHead className="font-extrabold border text-center bg-emerald-50/20 text-slate-700">SOL 1</TableHead>
                    <TableHead className="font-extrabold border text-center bg-emerald-50/20 text-slate-700">SOL 2</TableHead>
                    <TableHead className="font-extrabold border text-center bg-emerald-50/20 text-slate-700">SOL 3</TableHead>
                    <TableHead className="font-extrabold border text-center bg-emerald-50/20 text-slate-700">GRAD</TableHead>
                    
                    <TableHead className="font-extrabold border text-center bg-blue-50/20 text-slate-700">STUDENT</TableHead>
                    <TableHead className="font-extrabold border text-center bg-blue-50/20 text-slate-700">ALUMNI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="font-bold text-slate-700">
                  {/* MEN SECTION */}
                  <TableRow className="bg-slate-100/30 hover:bg-slate-100/30"><TableCell colSpan={16} className="font-black text-slate-800 tracking-wide border px-4 py-2">MEN / COORDINATORS</TableCell></TableRow>
                  {menStats.map(s => (
                    <TableRow key={s.leaderName} className="hover:bg-slate-50/50 border-b">
                      <TableCell className="border font-extrabold text-slate-900 px-4 py-2">{s.leaderName}</TableCell>
                      <TableCell className="border text-center bg-slate-50 text-slate-950 font-black text-sm">{s.totalStudents}</TableCell>
                      
                      <TableCell className={`border text-center ${s.statusCounts.ATT > 0 ? 'text-amber-700 bg-amber-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.statusCounts.ATT}</TableCell>
                      <TableCell className={`border text-center ${s.statusCounts.CM > 0 ? 'text-blue-700 bg-blue-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.statusCounts.CM}</TableCell>
                      <TableCell className={`border text-center ${s.statusCounts.PL > 0 ? 'text-orange-700 bg-orange-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.statusCounts.PL}</TableCell>
                      <TableCell className={`border text-center ${s.statusCounts.CL > 0 ? 'text-purple-700 bg-purple-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.statusCounts.CL}</TableCell>
                      <TableCell className={`border text-center ${s.statusCounts.LL > 0 ? 'text-red-700 bg-red-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.statusCounts.LL}</TableCell>
                      
                      <TableCell className={`border text-center ${s.lcsolCounts['LC L1-4'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['LC L1-4']}</TableCell>
                      <TableCell className={`border text-center ${s.lcsolCounts['ENC'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['ENC']}</TableCell>
                      <TableCell className={`border text-center ${s.lcsolCounts['LC L6-9'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['LC L6-9']}</TableCell>
                      <TableCell className={`border text-center ${s.lcsolCounts['SOL 1'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['SOL 1']}</TableCell>
                      <TableCell className={`border text-center ${s.lcsolCounts['SOL 2'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['SOL 2']}</TableCell>
                      <TableCell className={`border text-center ${s.lcsolCounts['SOL 3'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['SOL 3']}</TableCell>
                      <TableCell className={`border text-center ${s.lcsolCounts['GRAD'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['GRAD']}</TableCell>
                      
                      <TableCell className={`border text-center ${s.groupCounts.STUDENT > 0 ? 'text-blue-700 bg-blue-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.groupCounts.STUDENT}</TableCell>
                      <TableCell className={`border text-center ${s.groupCounts.ALUMNI > 0 ? 'text-purple-700 bg-purple-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.groupCounts.ALUMNI}</TableCell>
                    </TableRow>
                  ))}
                  
                  {/* MEN SUBTOTAL ROW */}
                  <TableRow className="bg-slate-100 text-slate-900 border-y-2 border-slate-300 hover:bg-slate-100">
                    <TableCell className="border px-4 py-2 font-black">SUBTOTAL MEN</TableCell>
                    <TableCell className="border text-center bg-slate-200 font-black text-sm">{menSubtotals.students}</TableCell>
                    
                    <TableCell className="border text-center font-black">{menSubtotals.status.ATT}</TableCell>
                    <TableCell className="border text-center font-black">{menSubtotals.status.CM}</TableCell>
                    <TableCell className="border text-center font-black">{menSubtotals.status.PL}</TableCell>
                    <TableCell className="border text-center font-black">{menSubtotals.status.CL}</TableCell>
                    <TableCell className="border text-center font-black">{menSubtotals.status.LL}</TableCell>
                    
                    <TableCell className="border text-center font-black">{menSubtotals.lcsol['LC L1-4']}</TableCell>
                    <TableCell className="border text-center font-black">{menSubtotals.lcsol['ENC']}</TableCell>
                    <TableCell className="border text-center font-black">{menSubtotals.lcsol['LC L6-9']}</TableCell>
                    <TableCell className="border text-center font-black">{menSubtotals.lcsol['SOL 1']}</TableCell>
                    <TableCell className="border text-center font-black">{menSubtotals.lcsol['SOL 2']}</TableCell>
                    <TableCell className="border text-center font-black">{menSubtotals.lcsol['SOL 3']}</TableCell>
                    <TableCell className="border text-center font-black">{menSubtotals.lcsol['GRAD']}</TableCell>
                    
                    <TableCell className="border text-center font-black">{menSubtotals.group.STUDENT}</TableCell>
                    <TableCell className="border text-center font-black">{menSubtotals.group.ALUMNI}</TableCell>
                  </TableRow>

                  {/* WOMEN SECTION */}
                  <TableRow className="bg-slate-100/30 hover:bg-slate-100/30"><TableCell colSpan={16} className="font-black text-slate-800 tracking-wide border px-4 py-2 mt-4">WOMEN / COORDINATORS</TableCell></TableRow>
                  {womenStats.map(s => (
                    <TableRow key={s.leaderName} className="hover:bg-slate-50/50 border-b">
                      <TableCell className="border font-extrabold text-slate-900 px-4 py-2">{s.leaderName}</TableCell>
                      <TableCell className="border text-center bg-slate-50 text-slate-950 font-black text-sm">{s.totalStudents}</TableCell>
                      
                      <TableCell className={`border text-center ${s.statusCounts.ATT > 0 ? 'text-amber-700 bg-amber-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.statusCounts.ATT}</TableCell>
                      <TableCell className={`border text-center ${s.statusCounts.CM > 0 ? 'text-blue-700 bg-blue-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.statusCounts.CM}</TableCell>
                      <TableCell className={`border text-center ${s.statusCounts.PL > 0 ? 'text-orange-700 bg-orange-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.statusCounts.PL}</TableCell>
                      <TableCell className={`border text-center ${s.statusCounts.CL > 0 ? 'text-purple-700 bg-purple-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.statusCounts.CL}</TableCell>
                      <TableCell className={`border text-center ${s.statusCounts.LL > 0 ? 'text-red-700 bg-red-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.statusCounts.LL}</TableCell>
                      
                      <TableCell className={`border text-center ${s.lcsolCounts['LC L1-4'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['LC L1-4']}</TableCell>
                      <TableCell className={`border text-center ${s.lcsolCounts['ENC'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['ENC']}</TableCell>
                      <TableCell className={`border text-center ${s.lcsolCounts['LC L6-9'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['LC L6-9']}</TableCell>
                      <TableCell className={`border text-center ${s.lcsolCounts['SOL 1'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['SOL 1']}</TableCell>
                      <TableCell className={`border text-center ${s.lcsolCounts['SOL 2'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['SOL 2']}</TableCell>
                      <TableCell className={`border text-center ${s.lcsolCounts['SOL 3'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['SOL 3']}</TableCell>
                      <TableCell className={`border text-center ${s.lcsolCounts['GRAD'] > 0 ? 'text-emerald-700 bg-emerald-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.lcsolCounts['GRAD']}</TableCell>
                      
                      <TableCell className={`border text-center ${s.groupCounts.STUDENT > 0 ? 'text-blue-700 bg-blue-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.groupCounts.STUDENT}</TableCell>
                      <TableCell className={`border text-center ${s.groupCounts.ALUMNI > 0 ? 'text-purple-700 bg-purple-50/20 font-black' : 'text-slate-300 font-normal'}`}>{s.groupCounts.ALUMNI}</TableCell>
                    </TableRow>
                  ))}
                  
                  {/* WOMEN SUBTOTAL ROW */}
                  <TableRow className="bg-slate-100 text-slate-900 border-y-2 border-slate-300 hover:bg-slate-100">
                    <TableCell className="border px-4 py-2 font-black">SUBTOTAL WOMEN</TableCell>
                    <TableCell className="border text-center bg-slate-200 font-black text-sm">{womenSubtotals.students}</TableCell>
                    
                    <TableCell className="border text-center font-black">{womenSubtotals.status.ATT}</TableCell>
                    <TableCell className="border text-center font-black">{womenSubtotals.status.CM}</TableCell>
                    <TableCell className="border text-center font-black">{womenSubtotals.status.PL}</TableCell>
                    <TableCell className="border text-center font-black">{womenSubtotals.status.CL}</TableCell>
                    <TableCell className="border text-center font-black">{womenSubtotals.status.LL}</TableCell>
                    
                    <TableCell className="border text-center font-black">{womenSubtotals.lcsol['LC L1-4']}</TableCell>
                    <TableCell className="border text-center font-black">{womenSubtotals.lcsol['ENC']}</TableCell>
                    <TableCell className="border text-center font-black">{womenSubtotals.lcsol['LC L6-9']}</TableCell>
                    <TableCell className="border text-center font-black">{womenSubtotals.lcsol['SOL 1']}</TableCell>
                    <TableCell className="border text-center font-black">{womenSubtotals.lcsol['SOL 2']}</TableCell>
                    <TableCell className="border text-center font-black">{womenSubtotals.lcsol['SOL 3']}</TableCell>
                    <TableCell className="border text-center font-black">{womenSubtotals.lcsol['GRAD']}</TableCell>
                    
                    <TableCell className="border text-center font-black">{womenSubtotals.group.STUDENT}</TableCell>
                    <TableCell className="border text-center font-black">{womenSubtotals.group.ALUMNI}</TableCell>
                  </TableRow>

                  {/* GRAND TOTAL ROW */}
                  <TableRow className="bg-emerald-800 text-white border-t-4 border-emerald-900 hover:bg-emerald-800/90 text-sm">
                    <TableCell className="border px-4 py-3 font-black tracking-wide">GRAND TOTAL</TableCell>
                    <TableCell className="border text-center bg-emerald-950/80 font-black text-base">{grandTotals.students}</TableCell>
                    
                    <TableCell className="border text-center font-black bg-emerald-900/20">{grandTotals.status.ATT}</TableCell>
                    <TableCell className="border text-center font-black bg-emerald-900/20">{grandTotals.status.CM}</TableCell>
                    <TableCell className="border text-center font-black bg-emerald-900/20">{grandTotals.status.PL}</TableCell>
                    <TableCell className="border text-center font-black bg-emerald-900/20">{grandTotals.status.CL}</TableCell>
                    <TableCell className="border text-center font-black bg-emerald-900/20">{grandTotals.status.LL}</TableCell>
                    
                    <TableCell className="border text-center font-black bg-emerald-900/10">{grandTotals.lcsol['LC L1-4']}</TableCell>
                    <TableCell className="border text-center font-black bg-emerald-900/10">{grandTotals.lcsol['ENC']}</TableCell>
                    <TableCell className="border text-center font-black bg-emerald-900/10">{grandTotals.lcsol['LC L6-9']}</TableCell>
                    <TableCell className="border text-center font-black bg-emerald-900/10">{grandTotals.lcsol['SOL 1']}</TableCell>
                    <TableCell className="border text-center font-black bg-emerald-900/10">{grandTotals.lcsol['SOL 2']}</TableCell>
                    <TableCell className="border text-center font-black bg-emerald-900/10">{grandTotals.lcsol['SOL 3']}</TableCell>
                    <TableCell className="border text-center font-black bg-emerald-900/10">{grandTotals.lcsol['GRAD']}</TableCell>
                    
                    <TableCell className="border text-center font-black bg-emerald-900/25">{grandTotals.group.STUDENT}</TableCell>
                    <TableCell className="border text-center font-black bg-emerald-900/25">{grandTotals.group.ALUMNI}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: CELL GROUPS SCHEDULE SHEET */}
        <TabsContent value="schedules" className="pt-4 focus-visible:outline-none">
          <Card className="border shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 py-4 px-6 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">PUP SONS - CELL GROUP WEEKLY SCHEDULES DIRECTORY</CardTitle>
                  <CardDescription className="text-xs">Venues, times, and coordinator tracking logs</CardDescription>
                </div>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 font-extrabold text-[10px]">
                  {cellGroups.length} Active Groups
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table className="border-collapse border-slate-200">
                <TableHeader className="bg-slate-100/50 border-b">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-extrabold text-slate-800 border text-center w-12 bg-slate-150">#</TableHead>
                    <TableHead className="font-extrabold text-slate-800 border bg-slate-150 min-w-[150px]">Cell Group</TableHead>
                    <TableHead className="font-extrabold text-slate-800 border bg-slate-150 min-w-[180px]">CELL LEADER</TableHead>
                    <TableHead className="font-extrabold text-slate-800 border bg-slate-150 min-w-[180px]">PRIMARY LEADER</TableHead>
                    <TableHead className="font-extrabold text-slate-800 border text-center bg-slate-150 w-36">Student / Alumni</TableHead>
                    <TableHead className="font-extrabold text-slate-800 border text-center bg-slate-150 w-28"># of people</TableHead>
                    <TableHead className="font-extrabold text-slate-800 border bg-slate-150 min-w-[140px]">Schedule Day</TableHead>
                    <TableHead className="font-extrabold text-slate-800 border bg-slate-150 w-32">Time</TableHead>
                    <TableHead className="font-extrabold text-slate-800 border bg-slate-150 min-w-[180px]">Venue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs font-semibold text-slate-700">
                  {cellGroups.map((cg, i) => (
                    <TableRow key={cg.id} className="hover:bg-slate-50/50 border-b transition-colors">
                      <TableCell className="border text-center text-slate-400 font-bold bg-slate-50/30">{i + 1}</TableCell>
                      <TableCell className="border font-bold text-slate-900 px-4 py-3">{cg.name}</TableCell>
                      <TableCell className="border px-4 py-3 text-slate-800 font-bold">{cg.leader}</TableCell>
                      <TableCell className="border px-4 py-3 text-slate-800">{cg.primaryLeader || "None"}</TableCell>
                      <TableCell className="border text-center px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border
                          ${(cg.groupType || 'STUDENT') === 'STUDENT' 
                            ? 'bg-blue-50 text-blue-700 border-blue-100' 
                            : 'bg-purple-50 text-purple-700 border-purple-100'
                          }
                        `}>
                          {cg.groupType || 'STUDENT'}
                        </span>
                      </TableCell>
                      <TableCell className="border text-center px-4 py-3 font-extrabold text-sm text-slate-900 bg-slate-50/20">{cg.memberCount || 0}</TableCell>
                      <TableCell className="border px-4 py-3">{cg.schedule || "TBD"}</TableCell>
                      <TableCell className="border px-4 py-3">{cg.time || "TBD"}</TableCell>
                      <TableCell className="border px-4 py-3 text-slate-600">{cg.venue || "TBD"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
