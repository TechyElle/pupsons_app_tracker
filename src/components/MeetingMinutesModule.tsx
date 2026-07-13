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
import { Plus, Edit, FileText, Calendar as CalendarIcon, Users, ClipboardList, Eye } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { apiFetch } from '../utils/apiHelper';
import { toast } from 'sonner@2.0.3';

interface MeetingMinute {
  id: string;
  meetingTitle: string;
  meetingType: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  facilitator: string;
  attendees: string;
  agenda: string;
  discussionNotes: string;
  actionItems: string;
  decisions: string;
  nextMeetingDate: string;
  status: string;
}

export function MeetingMinutesModule() {
  const [minutes, setMinutes] = useState<MeetingMinute[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingMinute, setEditingMinute] = useState<MeetingMinute | null>(null);
  const [viewingMinute, setViewingMinute] = useState<MeetingMinute | null>(null);
  const [formData, setFormData] = useState<Partial<MeetingMinute>>({
    meetingTitle: '',
    meetingType: 'Leaders Meeting',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    location: '',
    facilitator: '',
    attendees: '',
    agenda: '',
    discussionNotes: '',
    actionItems: '',
    decisions: '',
    nextMeetingDate: '',
    status: 'Draft',
  });

  useEffect(() => {
    fetchMinutes();
  }, []);

  const fetchMinutes = async () => {
    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/meeting-minutes`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setMinutes(result.data.sort((a: MeetingMinute, b: MeetingMinute) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching meeting minutes:', error);
      toast.error('Failed to load meeting minutes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingMinute
        ? `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/meeting-minutes/${editingMinute.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/meeting-minutes`;
      
      const response = await apiFetch(url, {
        method: editingMinute ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(editingMinute ? 'Minutes updated!' : 'Minutes recorded!');
        setDialogOpen(false);
        resetForm();
        fetchMinutes();
      }
    } catch (error) {
      console.error('Error saving meeting minutes:', error);
      toast.error('Failed to save meeting minutes');
    }
  };

  const handleEdit = (minute: MeetingMinute) => {
    setEditingMinute(minute);
    setFormData(minute);
    setDialogOpen(true);
  };

  const handleView = (minute: MeetingMinute) => {
    setViewingMinute(minute);
    setViewDialogOpen(true);
  };

  const resetForm = () => {
    setEditingMinute(null);
    setFormData({
      meetingTitle: '',
      meetingType: 'Leaders Meeting',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      location: '',
      facilitator: '',
      attendees: '',
      agenda: '',
      discussionNotes: '',
      actionItems: '',
      decisions: '',
      nextMeetingDate: '',
      status: 'Draft',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Finalized': 'bg-green-100 text-green-800',
      'In Review': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getMeetingTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Leaders Meeting': 'bg-blue-100 text-blue-800',
      'Cell Group Meeting': 'bg-purple-100 text-purple-800',
      'Planning Meeting': 'bg-orange-100 text-orange-800',
      'Training Session': 'bg-green-100 text-green-800',
      'General Assembly': 'bg-red-100 text-red-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const totalMeetings = minutes.length;
  const finalizedCount = minutes.filter(m => m.status === 'Finalized').length;
  const draftCount = minutes.filter(m => m.status === 'Draft').length;

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
          <h2 className="text-gray-900">Meeting Minutes</h2>
          <p className="text-gray-600 text-sm mt-1">Record and track meeting minutes and decisions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Minutes
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMinute ? 'Edit Meeting Minutes' : 'Record Meeting Minutes'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="meetingTitle">Meeting Title *</Label>
                  <Input
                    id="meetingTitle"
                    value={formData.meetingTitle}
                    onChange={(e) => setFormData({ ...formData, meetingTitle: e.target.value })}
                    placeholder="e.g., Monthly Leaders Meeting - January 2026"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetingType">Meeting Type</Label>
                  <Select
                    value={formData.meetingType}
                    onValueChange={(value) => setFormData({ ...formData, meetingType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Leaders Meeting">Leaders Meeting</SelectItem>
                      <SelectItem value="Cell Group Meeting">Cell Group Meeting</SelectItem>
                      <SelectItem value="Planning Meeting">Planning Meeting</SelectItem>
                      <SelectItem value="Training Session">Training Session</SelectItem>
                      <SelectItem value="General Assembly">General Assembly</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Venue or platform"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facilitator">Facilitator</Label>
                  <Input
                    id="facilitator"
                    value={formData.facilitator}
                    onChange={(e) => setFormData({ ...formData, facilitator: e.target.value })}
                    placeholder="Meeting facilitator/chairperson"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="attendees">Attendees</Label>
                  <Textarea
                    id="attendees"
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                    placeholder="List of attendees (comma-separated or one per line)"
                    rows={2}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="agenda">Agenda</Label>
                  <Textarea
                    id="agenda"
                    value={formData.agenda}
                    onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                    placeholder="Meeting agenda items"
                    rows={3}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="discussionNotes">Discussion Notes *</Label>
                  <Textarea
                    id="discussionNotes"
                    value={formData.discussionNotes}
                    onChange={(e) => setFormData({ ...formData, discussionNotes: e.target.value })}
                    placeholder="Key discussion points and notes from the meeting"
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="actionItems">Action Items</Label>
                  <Textarea
                    id="actionItems"
                    value={formData.actionItems}
                    onChange={(e) => setFormData({ ...formData, actionItems: e.target.value })}
                    placeholder="Action items with responsible persons and deadlines"
                    rows={4}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="decisions">Decisions Made</Label>
                  <Textarea
                    id="decisions"
                    value={formData.decisions}
                    onChange={(e) => setFormData({ ...formData, decisions: e.target.value })}
                    placeholder="Key decisions and resolutions made during the meeting"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextMeetingDate">Next Meeting Date</Label>
                  <Input
                    id="nextMeetingDate"
                    type="date"
                    value={formData.nextMeetingDate}
                    onChange={(e) => setFormData({ ...formData, nextMeetingDate: e.target.value })}
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
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Finalized">Finalized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingMinute ? 'Update' : 'Save Minutes'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Total Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{totalMeetings}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Finalized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{finalizedCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{draftCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meeting Records ({minutes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {minutes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">No meeting minutes recorded yet. Start documenting your meetings!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Meeting Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Facilitator</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {minutes.map((minute) => (
                    <TableRow key={minute.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <CalendarIcon className="w-3 h-3 text-gray-400" />
                          {new Date(minute.date).toLocaleDateString()}
                        </div>
                        {minute.startTime && (
                          <div className="text-xs text-gray-500">
                            {minute.startTime} {minute.endTime && `- ${minute.endTime}`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{minute.meetingTitle}</div>
                          {minute.location && (
                            <div className="text-xs text-gray-500 mt-1">
                              📍 {minute.location}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getMeetingTypeColor(minute.meetingType)}>
                          {minute.meetingType}
                        </Badge>
                      </TableCell>
                      <TableCell>{minute.facilitator || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(minute.status)}>
                          {minute.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleView(minute)}
                            title="View Minutes"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(minute)}
                          >
                            <Edit className="w-4 h-4" />
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

      {/* View Meeting Minutes Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meeting Minutes</DialogTitle>
          </DialogHeader>
          {viewingMinute && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-xl mb-2">{viewingMinute.meetingTitle}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Type:</span>{' '}
                    <Badge className={getMeetingTypeColor(viewingMinute.meetingType)}>
                      {viewingMinute.meetingType}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>{' '}
                    <Badge className={getStatusColor(viewingMinute.status)}>
                      {viewingMinute.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span> {new Date(viewingMinute.date).toLocaleDateString()}
                  </div>
                  {viewingMinute.startTime && (
                    <div>
                      <span className="text-gray-600">Time:</span> {viewingMinute.startTime}
                      {viewingMinute.endTime && ` - ${viewingMinute.endTime}`}
                    </div>
                  )}
                  {viewingMinute.location && (
                    <div>
                      <span className="text-gray-600">Location:</span> {viewingMinute.location}
                    </div>
                  )}
                  {viewingMinute.facilitator && (
                    <div>
                      <span className="text-gray-600">Facilitator:</span> {viewingMinute.facilitator}
                    </div>
                  )}
                </div>
              </div>

              {viewingMinute.attendees && (
                <div>
                  <h4 className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    Attendees
                  </h4>
                  <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">
                    {viewingMinute.attendees}
                  </div>
                </div>
              )}

              {viewingMinute.agenda && (
                <div>
                  <h4 className="flex items-center gap-2 mb-2">
                    <ClipboardList className="w-4 h-4" />
                    Agenda
                  </h4>
                  <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">
                    {viewingMinute.agenda}
                  </div>
                </div>
              )}

              <div>
                <h4 className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  Discussion Notes
                </h4>
                <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">
                  {viewingMinute.discussionNotes}
                </div>
              </div>

              {viewingMinute.decisions && (
                <div>
                  <h4 className="mb-2">Decisions Made</h4>
                  <div className="bg-blue-50 p-3 rounded whitespace-pre-wrap text-sm">
                    {viewingMinute.decisions}
                  </div>
                </div>
              )}

              {viewingMinute.actionItems && (
                <div>
                  <h4 className="mb-2">Action Items</h4>
                  <div className="bg-yellow-50 p-3 rounded whitespace-pre-wrap text-sm">
                    {viewingMinute.actionItems}
                  </div>
                </div>
              )}

              {viewingMinute.nextMeetingDate && (
                <div className="border-t pt-4">
                  <span className="text-gray-600">Next Meeting:</span>{' '}
                  {new Date(viewingMinute.nextMeetingDate).toLocaleDateString()}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEdit(viewingMinute);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
