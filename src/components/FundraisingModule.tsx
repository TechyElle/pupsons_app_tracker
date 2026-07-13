import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  Edit, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Users, 
  Download, 
  Trash2, 
  BookOpen, 
  UserCheck, 
  Sparkles, 
  ShieldAlert, 
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { apiFetch } from '../utils/apiHelper';
import { toast } from 'sonner@2.0.3';

interface FundraisingCampaign {
  id: string;
  campaignName: string;
  goal: number;
  currentAmount: number;
  expenses: number;
  method: string;
  startDate: string;
  endDate: string;
  status: string;
  description: string;
}

const VOLUNTEER_TEAMS = [
  { key: 'worship', label: 'Worship Ministry' },
  { key: 'media', label: 'Media & Creatives' },
  { key: 'logistics', label: 'Logistics & Ushering' },
  { key: 'outreach', label: 'Evangelism & Outreach' },
  { key: 'intercession', label: 'Intercessory & Prayer' },
  { key: 'secretariat', label: 'Secretariat & Comms' }
];

interface FundraisingModuleProps {
  themeMode?: 'classic' | 'forest';
}

export function FundraisingModule({ themeMode = 'classic' }: FundraisingModuleProps) {
  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<FundraisingCampaign | null>(null);

  const [formData, setFormData] = useState<Partial<FundraisingCampaign>>({
    campaignName: '',
    goal: 0,
    currentAmount: 0,
    expenses: 0,
    method: 'Donations',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Active',
    description: '',
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/fundraising`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setCampaigns(result.data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCampaign
        ? `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/fundraising/${editingCampaign.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/fundraising`;
      
      const response = await apiFetch(url, {
        method: editingCampaign ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(editingCampaign ? 'Campaign updated!' : 'Campaign created!');
        setDialogOpen(false);
        resetForm();
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save campaign');
    }
  };

  const handleEdit = (campaign: FundraisingCampaign) => {
    setEditingCampaign(campaign);
    setFormData(campaign);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCampaign(null);
    setFormData({
      campaignName: '',
      goal: 0,
      currentAmount: 0,
      expenses: 0,
      method: 'Donations',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'Active',
      description: '',
    });
  };

  const calculateProgress = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const normalizedCampaigns = campaigns.map((c: any) => ({
    id: c.id,
    campaignName: c.campaignName || c.name || 'Unnamed Campaign',
    goal: Number(c.goal || c.goalAmount || 0),
    currentAmount: Number(c.currentAmount || 0),
    expenses: Number(c.expenses || 0),
    method: c.method || 'Donations',
    startDate: c.startDate || new Date().toISOString().split('T')[0],
    endDate: c.endDate || '',
    status: c.status || 'Active',
    description: c.description || c.purpose || '',
  }));

  const totalRaised = normalizedCampaigns.reduce((sum, c) => sum + c.currentAmount, 0);
  const totalGoal = normalizedCampaigns.reduce((sum, c) => sum + c.goal, 0);
  const totalExpenses = normalizedCampaigns.reduce((sum, c) => sum + c.expenses, 0);
  const netAmount = totalRaised - totalExpenses;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeMode === 'forest' ? 'border-emerald-600' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  const isForest = themeMode === 'forest';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4 flex-col sm:flex-row gap-4">
        <div>
          <h2 className="text-gray-900 font-extrabold text-2xl tracking-tight">Finances & Campaigns</h2>
          <p className="text-gray-500 text-xs font-semibold mt-0.5">Track financial progress and fundraising campaign performance</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-800 font-bold text-lg">Financial Performance Overview</h3>
            <p className="text-slate-500 text-xs">Overview of total contributions vs. expenditure goals</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className={`${isForest ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold text-xs shadow-md`}>
                <Plus className="w-4 h-4 mr-2" />
                Add Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCampaign ? '📝 Edit Campaign Details' : '💼 Create Fundraising Campaign'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaignName">Campaign Name *</Label>
                    <Input
                      id="campaignName"
                      value={formData.campaignName}
                      onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                      placeholder="e.g., Anniversary Offering"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal Amount (₱) *</Label>
                    <Input
                      id="goal"
                      type="number"
                      value={formData.goal || ''}
                      onChange={(e) => setFormData({ ...formData, goal: Number(e.target.value) || 0 })}
                      placeholder="0"
                      required
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentAmount">Current Raised (₱)</Label>
                    <Input
                      id="currentAmount"
                      type="number"
                      value={formData.currentAmount || ''}
                      onChange={(e) => setFormData({ ...formData, currentAmount: Number(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expenses">Expenses / Spend (₱)</Label>
                    <Input
                      id="expenses"
                      type="number"
                      value={formData.expenses || ''}
                      onChange={(e) => setFormData({ ...formData, expenses: Number(e.target.value) || 0 })}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="method">Campaign Method</Label>
                    <Select
                      value={formData.method}
                      onValueChange={(value) => setFormData({ ...formData, method: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Donations">Direct Donations</SelectItem>
                        <SelectItem value="Pledges">Faith Pledges</SelectItem>
                        <SelectItem value="Merchandise">Sales / Merch</SelectItem>
                        <SelectItem value="Ticketed Event">Ticketed Events</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Target End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Campaign Description & Purpose</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide context about allocation goals and coordinators..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className={`${isForest ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold`}>
                    {editingCampaign ? 'Save Changes' : 'Create Campaign'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border shadow-sm rounded-xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 ${isForest ? 'bg-emerald-50 text-emerald-650' : 'bg-blue-50 text-blue-650'} rounded-xl flex items-center justify-center shrink-0`}>
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Total Funding Goal</div>
              <div className="text-lg font-black text-slate-800">₱{totalGoal.toLocaleString('en-US')}</div>
            </div>
          </Card>
          
          <Card className="bg-white border shadow-sm rounded-xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 ${isForest ? 'bg-emerald-50 text-emerald-650' : 'bg-blue-50 text-blue-650'} rounded-xl flex items-center justify-center shrink-0`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Total Raised</div>
              <div className="text-lg font-black text-slate-800">₱{totalRaised.toLocaleString('en-US')}</div>
            </div>
          </Card>

          <Card className="bg-white border shadow-sm rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Total Expenses</div>
              <div className="text-lg font-black text-slate-800">₱{totalExpenses.toLocaleString('en-US')}</div>
            </div>
          </Card>

          <Card className="bg-white border shadow-sm rounded-xl p-4 flex items-center gap-4">
            <div className={`w-10 h-10 ${netAmount >= 0 ? (isForest ? 'bg-emerald-50 text-emerald-650' : 'bg-blue-50 text-blue-650') : 'bg-red-50 text-red-500'} rounded-xl flex items-center justify-center shrink-0`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Net Fund Remaining</div>
              <div className={`text-lg font-black ${netAmount >= 0 ? 'text-slate-800' : 'text-red-650'}`}>
                ₱{netAmount.toLocaleString('en-US')}
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-white border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="py-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-800">Campaigns Performance List</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {normalizedCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No active fundraising campaigns yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {normalizedCampaigns.map((c) => {
                  const percent = calculateProgress(c.currentAmount, c.goal);
                  return (
                    <Card key={c.id} className="border bg-slate-50/50 shadow-xs hover:shadow-sm hover:bg-slate-50 transition-all rounded-xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm">{c.campaignName}</h4>
                            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">{c.method}</span>
                          </div>
                          <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-wider ${
                            c.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : c.status === 'Completed' 
                                ? 'bg-slate-100 text-slate-700 border-slate-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {c.status}
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed font-semibold">
                          {c.description || <span className="italic text-slate-400 font-normal">No purpose description.</span>}
                        </p>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between items-end text-xs">
                          <span className="font-semibold text-slate-500 animate-pulse">Progress</span>
                          <span className={`font-black ${isForest ? 'text-emerald-700' : 'text-blue-700'}`}>{percent.toFixed(0)}%</span>
                        </div>
                        <Progress value={percent} className={`h-2 bg-slate-200 ${isForest ? 'text-emerald-600' : 'text-blue-600'}`} />
                        
                        <div className="flex justify-between items-center text-[10px] pt-1">
                          <div className="font-semibold text-slate-500">
                            Raised: <strong className="text-slate-800">₱{c.currentAmount.toLocaleString()}</strong>
                          </div>
                          <div className="font-semibold text-slate-500">
                            Goal: <strong className="text-slate-800">₱{c.goal.toLocaleString()}</strong>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-200/50">
                          <div className="font-semibold text-slate-400">
                            Expenses: <strong className="text-slate-500">₱{c.expenses.toLocaleString()}</strong>
                          </div>
                          <div className="flex gap-1.5 justify-end">
                            <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-slate-100" onClick={() => handleEdit(c)}>
                              <Edit className="w-3.5 h-3.5 text-slate-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}