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
import { Plus, Edit, Trash2, Heart, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { apiFetch } from '../utils/apiHelper';
import { toast } from 'sonner@2.0.3';

interface EvangelismRecord {
  id: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  dateContacted: string;
  cellGroupName: string;
  method: string;
  followUpStatus: string;
  nextFollowUp: string;
  conversionDate: string;
  discipleshipStage: string;
  notes: string;
}

export function EvangelismModule() {
  const [records, setRecords] = useState<EvangelismRecord[]>([]);
  const [cellGroups, setCellGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EvangelismRecord | null>(null);
  const [formData, setFormData] = useState<Partial<EvangelismRecord>>({
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    dateContacted: new Date().toISOString().split('T')[0],
    cellGroupName: '',
    method: 'Personal Evangelism',
    followUpStatus: 'First Contact',
    nextFollowUp: '',
    conversionDate: '',
    discipleshipStage: 'Prospect',
    notes: '',
  });

  useEffect(() => {
    fetchRecords();
    fetchCellGroups();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/evangelism`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setRecords(result.data.sort((a: EvangelismRecord, b: EvangelismRecord) => 
          new Date(b.dateContacted).getTime() - new Date(a.dateContacted).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching evangelism records:', error);
      toast.error('Failed to load evangelism records');
    } finally {
      setLoading(false);
    }
  };

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
      }
    } catch (error) {
      console.error('Error fetching cell groups:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingRecord
        ? `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/evangelism/${editingRecord.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/evangelism`;
      
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
        toast.success(editingRecord ? 'Record updated!' : 'Contact added!');
        setDialogOpen(false);
        resetForm();
        fetchRecords();
      }
    } catch (error) {
      console.error('Error saving evangelism record:', error);
      toast.error('Failed to save record');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/evangelism/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Record deleted');
        fetchRecords();
      }
    } catch (error) {
      console.error('Error deleting evangelism record:', error);
      toast.error('Failed to delete record');
    }
  };

  const handleEdit = (record: EvangelismRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingRecord(null);
    setFormData({
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      dateContacted: new Date().toISOString().split('T')[0],
      cellGroupName: '',
      method: 'Personal Evangelism',
      followUpStatus: 'First Contact',
      nextFollowUp: '',
      conversionDate: '',
      discipleshipStage: 'Prospect',
      notes: '',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'First Contact': 'bg-blue-100 text-blue-800',
      'Follow-up Scheduled': 'bg-yellow-100 text-yellow-800',
      'Needs Follow-up': 'bg-orange-100 text-orange-800',
      'Converted': 'bg-green-100 text-green-800',
      'Not Interested': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDiscipleshipColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Prospect': 'bg-gray-200 text-gray-700',
      'New Believer': 'bg-blue-500 text-white',
      'Growing': 'bg-green-500 text-white',
      'Multiplying': 'bg-purple-500 text-white',
    };
    return colors[stage] || 'bg-gray-200 text-gray-700';
  };

  const convertedCount = records.filter(r => r.conversionDate).length;
  const pendingFollowUp = records.filter(r => 
    r.followUpStatus === 'Needs Follow-up' || r.followUpStatus === 'Follow-up Scheduled'
  ).length;

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
          <h2 className="text-gray-900">Evangelism & Soul Winning</h2>
          <p className="text-gray-600 text-sm mt-1">Track outreach efforts and discipleship progress</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Full name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="09XX XXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateContacted">Date Contacted *</Label>
                  <Input
                    id="dateContacted"
                    type="date"
                    value={formData.dateContacted}
                    onChange={(e) => setFormData({ ...formData, dateContacted: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cellGroupName">Cell Group</Label>
                  <Select
                    value={formData.cellGroupName}
                    onValueChange={(value) => setFormData({ ...formData, cellGroupName: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cell group" />
                    </SelectTrigger>
                    <SelectContent>
                      {cellGroups.map((group) => (
                        <SelectItem key={group.id} value={group.name}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="method">Evangelism Method</Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value) => setFormData({ ...formData, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal Evangelism">Personal Evangelism</SelectItem>
                      <SelectItem value="Campus Outreach">Campus Outreach</SelectItem>
                      <SelectItem value="Event Invitation">Event Invitation</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Friend Referral">Friend Referral</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="followUpStatus">Follow-up Status</Label>
                  <Select
                    value={formData.followUpStatus}
                    onValueChange={(value) => setFormData({ ...formData, followUpStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Contact">First Contact</SelectItem>
                      <SelectItem value="Follow-up Scheduled">Follow-up Scheduled</SelectItem>
                      <SelectItem value="Needs Follow-up">Needs Follow-up</SelectItem>
                      <SelectItem value="Converted">Converted</SelectItem>
                      <SelectItem value="Not Interested">Not Interested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nextFollowUp">Next Follow-up Date</Label>
                  <Input
                    id="nextFollowUp"
                    type="date"
                    value={formData.nextFollowUp}
                    onChange={(e) => setFormData({ ...formData, nextFollowUp: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conversionDate">Conversion Date</Label>
                  <Input
                    id="conversionDate"
                    type="date"
                    value={formData.conversionDate}
                    onChange={(e) => setFormData({ ...formData, conversionDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discipleshipStage">Discipleship Stage</Label>
                <Select
                  value={formData.discipleshipStage}
                  onValueChange={(value) => setFormData({ ...formData, discipleshipStage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="New Believer">New Believer</SelectItem>
                    <SelectItem value="Growing">Growing</SelectItem>
                    <SelectItem value="Multiplying">Multiplying</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Prayer requests, conversation highlights, etc."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  {editingRecord ? 'Update' : 'Add Contact'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{records.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Converted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{convertedCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Pending Follow-up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{pendingFollowUp}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evangelism Records ({records.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No contacts yet. Start reaching out!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Cell Group</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Discipleship</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div>{record.contactName}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                            {record.contactPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {record.contactPhone}
                              </span>
                            )}
                            {record.contactEmail && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {record.contactEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{record.cellGroupName || '-'}</TableCell>
                      <TableCell>{record.method}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.followUpStatus)}>
                          {record.followUpStatus}
                        </Badge>
                        {record.conversionDate && (
                          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {new Date(record.conversionDate).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getDiscipleshipColor(record.discipleshipStage)}>
                          {record.discipleshipStage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.nextFollowUp ? (
                          <div className="text-sm">
                            {new Date(record.nextFollowUp).toLocaleDateString()}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
