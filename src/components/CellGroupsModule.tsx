import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2, Users, MapPin, Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { apiFetch } from '../utils/apiHelper';
import { toast } from 'sonner@2.0.3';

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
  formationDate: string;
}

interface CellGroupsModuleProps {
  themeMode?: 'classic' | 'forest';
}

export function CellGroupsModule({ themeMode = 'classic' }: CellGroupsModuleProps) {
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CellGroup | null>(null);
  const [formData, setFormData] = useState<Partial<CellGroup>>({
    name: '',
    leader: '',
    primaryLeader: '',
    status: 'Active',
    memberCount: 0,
    schedule: '',
    time: '',
    venue: '',
    location: '',
    formationDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchCellGroups();
  }, []);

  const fetchCellGroups = async () => {
    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/cell-groups`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const result = await response.json();
      if (result.success) {
        setCellGroups(result.data);
      } else {
        console.error('API error:', result.error);
        toast.error(result.error || 'Failed to load cell groups');
      }
    } catch (error) {
      console.error('Error fetching cell groups:', error);
      if (cellGroups.length > 0) {
        toast.error('Failed to load cell groups');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingGroup
        ? `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/cell-groups/${editingGroup.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/cell-groups`;
      
      const response = await apiFetch(url, {
        method: editingGroup ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(editingGroup ? 'Cell group updated!' : 'Cell group created!');
        setDialogOpen(false);
        resetForm();
        fetchCellGroups();
      }
    } catch (error) {
      console.error('Error saving cell group:', error);
      toast.error('Failed to save cell group');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cell group?')) return;
    
    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/cell-groups/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Cell group deleted');
        fetchCellGroups();
      }
    } catch (error) {
      console.error('Error deleting cell group:', error);
      toast.error('Failed to delete cell group');
    }
  };

  const handleEdit = (group: CellGroup) => {
    setEditingGroup(group);
    setFormData(group);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      leader: '',
      primaryLeader: '',
      status: 'Active',
      memberCount: 0,
      schedule: '',
      time: '',
      venue: '',
      location: '',
      formationDate: new Date().toISOString().split('T')[0],
    });
  };

  const isForest = themeMode === 'forest';

  // Helper to determine mock tree health rating based on cell group metadata
  const getCellHealthTrees = (groupName: string) => {
    // Generate realistic dynamic metrics based on group names
    if (groupName.includes('Lausin')) {
      return { rating: 4.2, icons: '🌳🌳🌳🌳🌱', status: 'HEALTHY', water: 92, sunlight: 75, nutrients: 80 };
    }
    if (groupName.includes('Dorado')) {
      return { rating: 4.5, icons: '🌳🌳🌳🌳🌱', status: 'HEALTHY', water: 95, sunlight: 82, nutrients: 88 };
    }
    if (groupName.includes('Renacido')) {
      return { rating: 3.8, icons: '🌳🌳🌳🌱', status: 'STABLE', water: 82, sunlight: 70, nutrients: 65 };
    }
    
    // Fallback metrics
    const hash = groupName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const water = 70 + (hash % 26);
    const sunlight = 60 + (hash % 29);
    const nutrients = 50 + (hash % 41);
    const rating = Math.round(((water + sunlight + nutrients) / 300) * 5 * 10) / 10;
    const icons = '🌳'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '🌱' : '');
    const status = rating >= 3.8 ? 'HEALTHY' : 'STABLE';
    
    return { rating, icons, status, water, sunlight, nutrients };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isForest ? 'border-emerald-600' : 'border-blue-600'}`}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-extrabold text-xl">Cell Groups Registry</h2>
          <p className="text-gray-600 text-sm">Manage cell group assignments, schedules, venues, and monitor leadership pipelines</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className={`${isForest ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-md`}>
              <Plus className="w-4 h-4 mr-2" />
              Add Cell Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGroup ? '📝 Edit Cell Group Details' : '📁 Register New Cell Group'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Cell Group Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Elim Cell Group"
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
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leader">Leader Name *</Label>
                  <Input
                    id="leader"
                    value={formData.leader}
                    onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                    placeholder="Cell leader name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryLeader">Primary Overseer / Coordinator</Label>
                  <Input
                    id="primaryLeader"
                    value={formData.primaryLeader}
                    onChange={(e) => setFormData({ ...formData, primaryLeader: e.target.value })}
                    placeholder="Primary leader name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule Day</Label>
                  <Input
                    id="schedule"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    placeholder="e.g., Every Saturday"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g., 3:00 PM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue Type</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g., Zoom, Library Room 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Campus Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., PUP Main, PUP CEA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memberCount">Active Members Count</Label>
                  <Input
                    id="memberCount"
                    type="number"
                    value={formData.memberCount}
                    onChange={(e) => setFormData({ ...formData, memberCount: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formationDate">Formation Date</Label>
                  <Input
                    id="formationDate"
                    type="date"
                    value={formData.formationDate}
                    onChange={(e) => setFormData({ ...formData, formationDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className={`${isForest ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold`}>
                  {editingGroup ? 'Save Changes' : 'Create Group'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid listing */}
      <Card className="bg-white border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="py-4 border-b">
          <CardTitle className="text-lg font-bold text-slate-800">Cell Groups Directory ({cellGroups.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {cellGroups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No cell groups yet. Tap "Add Cell Group" to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Cell Group</TableHead>
                    <TableHead className="font-bold text-slate-700">Cell Leader</TableHead>
                    <TableHead className="font-bold text-slate-700">Primary Coordinator</TableHead>
                    <TableHead className="font-bold text-slate-700">Health Index</TableHead>
                    <TableHead className="font-bold text-slate-700">Members</TableHead>
                    <TableHead className="font-bold text-slate-700">Schedule</TableHead>
                    <TableHead className="font-bold text-slate-700">Venue</TableHead>
                    <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cellGroups.map((group) => {
                    const health = getCellHealthTrees(group.name);
                    return (
                      <TableRow key={group.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-semibold text-slate-900">{group.name}</TableCell>
                        <TableCell className="font-bold text-slate-800">{group.leader}</TableCell>
                        <TableCell>{group.primaryLeader || <span className="text-gray-400 italic">None</span>}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2 min-w-[155px] p-2 bg-slate-50/70 rounded-xl border border-slate-200/60 shadow-2xs">
                            {/* Overall Trees & Status */}
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-[10px] tracking-wider" title={`${health.rating}/5 Trees`}>{health.icons || '🌱'}</span>
                              <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border uppercase tracking-wider
                                ${health.status === 'HEALTHY' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                                }
                              `}>
                                {health.status}
                              </span>
                            </div>
                            
                            {/* Health meters */}
                            <div className="space-y-1.5 text-[9px] font-bold text-slate-500">
                              {/* Water meter */}
                              <div className="space-y-0.5">
                                <div className="flex justify-between font-black text-slate-600 text-[8px] uppercase">
                                  <span>Water (Attendance) 💧</span>
                                  <span className="text-blue-600">{health.water}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                  <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${health.water}%` }} />
                                </div>
                              </div>
                              {/* Sunlight meter */}
                              <div className="space-y-0.5">
                                <div className="flex justify-between font-black text-slate-600 text-[8px] uppercase">
                                  <span>Sunlight (Training) ☀️</span>
                                  <span className="text-amber-600">{health.sunlight}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                  <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${health.sunlight}%` }} />
                                </div>
                              </div>
                              {/* Nutrients meter */}
                              <div className="space-y-0.5">
                                <div className="flex justify-between font-black text-slate-600 text-[8px] uppercase">
                                  <span>Nutrients (Outreach) 🌿</span>
                                  <span className="text-emerald-600">{health.nutrients}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${health.nutrients}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-bold text-slate-700">
                            <Users className="w-4 h-4 text-slate-400" />
                            {group.memberCount}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1 font-semibold text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {group.schedule || '-'}
                            </div>
                            <div className="text-gray-500 text-xs">{group.time || '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-slate-600 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {group.venue || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100" onClick={() => handleEdit(group)}>
                              <Edit className="w-4 h-4 text-slate-600" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(group.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}