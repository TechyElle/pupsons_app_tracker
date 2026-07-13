import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Edit, BookOpen, Award } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { apiFetch } from '../utils/apiHelper';
import { toast } from 'sonner@2.0.3';

interface TrainingRecord {
  id: string;
  memberName: string;
  trainingModule: string;
  trainingLevel: string;
  startDate: string;
  completionDate: string;
  certificationStatus: string;
  instructor: string;
  attendanceRate: number;
  assessmentScore: number;
}

export function TrainingModule() {
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TrainingRecord | null>(null);
  const [formData, setFormData] = useState<Partial<TrainingRecord>>({
    memberName: '',
    trainingModule: '',
    trainingLevel: 'Foundational',
    startDate: new Date().toISOString().split('T')[0],
    completionDate: '',
    certificationStatus: 'In Progress',
    instructor: '',
    attendanceRate: 100,
    assessmentScore: 0,
  });

  useEffect(() => {
    fetchRecords();
    fetchMembers();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/training`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setRecords(result.data);
      }
    } catch (error) {
      console.error('Error fetching training records:', error);
      toast.error('Failed to load training records');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/members`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRecord
        ? `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/training/${editingRecord.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/training`;
      
      const response = await apiFetch(url, {
        method: editingRecord ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(editingRecord ? 'Record updated!' : 'Training record added!');
        setDialogOpen(false);
        resetForm();
        fetchRecords();
      }
    } catch (error) {
      console.error('Error saving training record:', error);
      toast.error('Failed to save record');
    }
  };

  const handleEdit = (record: TrainingRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingRecord(null);
    setFormData({
      memberName: '',
      trainingModule: '',
      trainingLevel: 'Foundational',
      startDate: new Date().toISOString().split('T')[0],
      completionDate: '',
      certificationStatus: 'In Progress',
      instructor: '',
      attendanceRate: 100,
      assessmentScore: 0,
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Completed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Not Started': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const completedCount = records.filter(r => r.certificationStatus === 'Completed').length;
  const inProgressCount = records.filter(r => r.certificationStatus === 'In Progress').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Training & Development</h2>
          <p className="text-gray-600 text-sm mt-1">Track member training progression and certifications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Training Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit Training Record' : 'Add Training Record'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memberName">Member *</Label>
                  <Select
                    value={formData.memberName}
                    onValueChange={(value) => setFormData({ ...formData, memberName: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trainingLevel">Training Level</Label>
                  <Select
                    value={formData.trainingLevel}
                    onValueChange={(value) => setFormData({ ...formData, trainingLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Foundational">Foundational</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Leadership">Leadership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainingModule">Training Module/Course *</Label>
                <Input
                  id="trainingModule"
                  value={formData.trainingModule}
                  onChange={(e) => setFormData({ ...formData, trainingModule: e.target.value })}
                  placeholder="e.g., Discipleship 101, Leadership Basics"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="completionDate">Completion Date</Label>
                  <Input
                    id="completionDate"
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certificationStatus">Status</Label>
                  <Select
                    value={formData.certificationStatus}
                    onValueChange={(value) => setFormData({ ...formData, certificationStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="Instructor name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attendanceRate">Attendance Rate (%)</Label>
                  <Input
                    id="attendanceRate"
                    type="number"
                    value={formData.attendanceRate}
                    onChange={(e) => setFormData({ ...formData, attendanceRate: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assessmentScore">Assessment Score (%)</Label>
                  <Input
                    id="assessmentScore"
                    type="number"
                    value={formData.assessmentScore}
                    onChange={(e) => setFormData({ ...formData, assessmentScore: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  {editingRecord ? 'Update' : 'Add Record'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Total Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{records.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{completedCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{inProgressCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Training Records ({records.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No training records yet. Start tracking member development!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Module/Course</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.memberName}</TableCell>
                      <TableCell>
                        <div>
                          <div>{record.trainingModule}</div>
                          {record.completionDate && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Award className="w-3 h-3" />
                              Completed: {new Date(record.completionDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.trainingLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.certificationStatus)}>
                          {record.certificationStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.instructor || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">{record.attendanceRate}%</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{record.assessmentScore}%</div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(record)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
