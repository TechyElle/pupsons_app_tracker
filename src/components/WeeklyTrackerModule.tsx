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
import { Plus, Edit, Trash2, Calendar, MapPin, Users, Check, Circle, CheckSquare, Square, UserPlus, Info, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { apiFetch } from '../utils/apiHelper';
import { toast } from 'sonner@2.0.3';

interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  venue: string;
  cellGroupName: string;
  attendance: number;
  notes: string;
  outcomes: string;
  // Enhanced Fields
  presentMembers?: string; // Comma separated list of member IDs present
  visitorsList?: string; // Comma separated list of visitor names
}

interface Member {
  id: string;
  name: string;
  cellGroupName: string;
}

export function WeeklyTrackerModule() {
  const [events, setEvents] = useState<Event[]>([]);
  const [cellGroups, setCellGroups] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Kiosk Mode States
  const [kioskOpen, setKioskOpen] = useState(false);
  const [kioskEventId, setKioskEventId] = useState<string>('');
  const [kioskSearch, setKioskSearch] = useState<string>('');

  useEffect(() => {
    if (events.length > 0 && !kioskEventId) {
      setKioskEventId(events[0].id);
    }
  }, [events, kioskEventId]);
  
  // Quick Entry Attendance States
  const [cellGroupMembers, setCellGroupMembers] = useState<Member[]>([]);
  const [checkedMembers, setCheckedMembers] = useState<Record<string, boolean>>({});
  const [visitorName, setVisitorName] = useState('');
  const [visitors, setVisitors] = useState<string[]>([]);

  const [formData, setFormData] = useState<Partial<Event>>({
    name: '',
    type: 'Cell Meeting',
    date: new Date().toISOString().split('T')[0],
    time: '',
    duration: '',
    venue: '',
    cellGroupName: '',
    attendance: 0,
    notes: '',
    outcomes: '',
    presentMembers: '',
    visitorsList: ''
  });

  useEffect(() => {
    fetchEvents();
    fetchCellGroups();
    fetchMembers();
  }, []);

  // Filter members of selected cell group when group changes
  useEffect(() => {
    if (formData.cellGroupName) {
      const filtered = allMembers.filter(m => m.cellGroupName === formData.cellGroupName);
      setCellGroupMembers(filtered);

      // If editing and loading it for the first time, load existing present members
      if (editingEvent && editingEvent.cellGroupName === formData.cellGroupName) {
        const initialChecked: Record<string, boolean> = {};
        const presentIds = editingEvent.presentMembers ? editingEvent.presentMembers.split(',') : [];
        filtered.forEach(m => {
          initialChecked[m.id] = presentIds.includes(m.id);
        });
        setCheckedMembers(initialChecked);
      } else {
        // Default to all checked for new events
        const initialChecked: Record<string, boolean> = {};
        filtered.forEach(m => {
          initialChecked[m.id] = true;
        });
        setCheckedMembers(initialChecked);
      }
    } else {
      setCellGroupMembers([]);
      setCheckedMembers({});
    }
  }, [formData.cellGroupName, allMembers, editingEvent]);

  // Recalculate attendance count when checklist changes
  useEffect(() => {
    const presentCount = Object.values(checkedMembers).filter(Boolean).length;
    const totalCount = presentCount + visitors.length;
    setFormData(prev => ({ 
      ...prev, 
      attendance: totalCount,
      presentMembers: Object.keys(checkedMembers).filter(id => checkedMembers[id]).join(','),
      visitorsList: visitors.join(',')
    }));
  }, [checkedMembers, visitors]);

  const fetchEvents = async () => {
    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/events`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setEvents(result.data.sort((a: Event, b: Event) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
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
        setAllMembers(result.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEvent
        ? `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/events/${editingEvent.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/events`;
      
      const response = await apiFetch(url, {
        method: editingEvent ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(editingEvent ? 'Event updated!' : 'Event logged!');
        setDialogOpen(false);
        resetForm();
        fetchEvents();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/events/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Event deleted');
        fetchEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData(event);
    setVisitors(event.visitorsList ? event.visitorsList.split(',').filter(Boolean) : []);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      name: '',
      type: 'Cell Meeting',
      date: new Date().toISOString().split('T')[0],
      time: '',
      duration: '',
      venue: '',
      cellGroupName: '',
      attendance: 0,
      notes: '',
      outcomes: '',
      presentMembers: '',
      visitorsList: ''
    });
    setVisitors([]);
    setVisitorName('');
  };

  const toggleMemberCheckbox = (id: string) => {
    setCheckedMembers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectAllMembers = (val: boolean) => {
    const next: Record<string, boolean> = {};
    cellGroupMembers.forEach(m => {
      next[m.id] = val;
    });
    setCheckedMembers(next);
  };

  const handleAddVisitor = () => {
    if (!visitorName.trim()) return;
    setVisitors(prev => [...prev, visitorName.trim()]);
    setVisitorName('');
  };

  const handleRemoveVisitor = (index: number) => {
    setVisitors(prev => prev.filter((_, i) => i !== index));
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Cell Meeting': 'bg-blue-100 text-blue-800 border-blue-200',
      'Outreach': 'bg-green-100 text-green-800 border-green-200',
      'Training': 'bg-purple-100 text-purple-800 border-purple-200',
      'Fellowship': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Prayer Meeting': 'bg-pink-100 text-pink-800 border-pink-200',
      'Evangelism': 'bg-orange-100 text-orange-800 border-orange-200',
      'Other': 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return colors[type] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const handleCreateQuickKioskEvent = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const quickEvent = {
        name: `Kiosk Check-in (${todayStr})`,
        type: 'Cell Meeting',
        date: todayStr,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        duration: '1.5 hours',
        venue: 'PUP Campus',
        cellGroupName: cellGroups[0]?.name || 'Lausin Group (Online)',
        attendance: 0,
        notes: 'Created via Self-Service Check-in Kiosk.',
        outcomes: 'Cell meeting check-in.',
        presentMembers: '',
        visitorsList: ''
      };
      
      const response = await apiFetch(`https://${projectId}.supabase.co/functions/v1/make-server-37669f54/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(quickEvent),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Created quick kiosk check-in event!");
        await fetchEvents();
        setKioskEventId(result.id);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to create quick event.");
    }
  };

  const handleKioskToggleCheckIn = async (memberId: string, memberName: string) => {
    if (!kioskEventId) {
      toast.error("Please select an active event first.");
      return;
    }
    
    const activeEvent = events.find(e => e.id === kioskEventId);
    if (!activeEvent) return;

    let presentList = activeEvent.presentMembers ? activeEvent.presentMembers.split(',').filter(Boolean) : [];
    const isPresent = presentList.includes(memberId);
    
    if (isPresent) {
      presentList = presentList.filter(id => id !== memberId);
    } else {
      presentList.push(memberId);
    }

    const updatedPresentStr = presentList.join(',');
    const updatedAttendance = presentList.length + (activeEvent.visitorsList ? activeEvent.visitorsList.split(',').filter(Boolean).length : 0);

    setEvents(prev => prev.map(e => e.id === kioskEventId ? { ...e, presentMembers: updatedPresentStr, attendance: updatedAttendance } : e));

    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/events/${kioskEventId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            presentMembers: updatedPresentStr,
            attendance: updatedAttendance
          }),
        }
      );
      
      const result = await response.json();
      if (result.success) {
        if (isPresent) {
          toast.info(`${memberName} removed from check-in.`);
        } else {
          toast.success(`${memberName} checked in successfully! 🎉`);
        }
        fetchEvents();
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error during check-in.");
      fetchEvents();
    }
  };

  const kioskFilteredMembers = allMembers.filter(m => 
    m.name.toLowerCase().includes(kioskSearch.toLowerCase()) ||
    (m.cellGroupName && m.cellGroupName.toLowerCase().includes(kioskSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-gray-900 font-extrabold text-2xl tracking-tight">Weekly Tracker</h2>
        <p className="text-gray-600 text-sm font-medium mt-0.5">Schedule events, track cell group attendance, and document outreach reports</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button 
          onClick={() => {
            setKioskOpen(true);
            if (events.length > 0) setKioskEventId(events[0].id);
          }} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold text-xs"
        >
          📱 Launch Self-Checkin Kiosk
        </Button>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold text-xs">
              <Plus className="w-4 h-4 mr-1.5" />
              Take Attendance / Log Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? '📝 Edit Event / Attendance Details' : '👥 Kiosk Mode - Take Attendance & Log Event'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Title *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Weekly Cell Fellowship"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="type">Event Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cell Meeting">Cell Meeting</SelectItem>
                        <SelectItem value="Outreach">Outreach</SelectItem>
                        <SelectItem value="Training">Training</SelectItem>
                        <SelectItem value="Fellowship">Fellowship</SelectItem>
                        <SelectItem value="Prayer Meeting">Prayer Meeting</SelectItem>
                        <SelectItem value="Evangelism">Evangelism</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cellGroupName">Cell Group *</Label>
                    <Select
                      value={formData.cellGroupName}
                      onValueChange={(value) => setFormData({ ...formData, cellGroupName: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select group" />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2 hours"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue / Location</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Meeting venue name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Calculated Attendance Total</Label>
                  <div className="flex items-center gap-2 h-10 px-3 border bg-slate-50 font-black rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>{formData.attendance} attendees</span>
                  </div>
                </div>
              </div>

              {/* Attendance Kiosk Section */}
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-3.5 border-b flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    📋 Member Checklist
                  </h4>
                  {cellGroupMembers.length > 0 && (
                    <div className="flex gap-2">
                      <Button type="button" size="xs" variant="outline" onClick={() => selectAllMembers(true)} className="text-[10px] h-7">
                        All Present
                      </Button>
                      <Button type="button" size="xs" variant="outline" onClick={() => selectAllMembers(false)} className="text-[10px] h-7">
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white space-y-4">
                  {cellGroupMembers.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs italic flex items-center justify-center gap-1">
                      <Info className="w-4 h-4 text-slate-400" />
                      Select a Cell Group above to load members checklist.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                      {cellGroupMembers.map((member) => {
                        const isChecked = !!checkedMembers[member.id];
                        return (
                          <div 
                            key={member.id}
                            onClick={() => toggleMemberCheckbox(member.id)}
                            className={`
                              p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-colors
                              ${isChecked 
                                ? 'bg-green-50 border-green-200 text-green-900' 
                                : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }
                            `}
                          >
                            <div className="shrink-0">
                              {isChecked 
                                ? <CheckSquare className="w-4 h-4 text-green-600" /> 
                                : <Square className="w-4 h-4 text-slate-400" />
                              }
                            </div>
                            <span className="text-xs font-bold truncate">{member.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Visitors Subsection */}
                  <div className="pt-2 border-t space-y-3">
                    <Label className="text-xs font-extrabold text-slate-600">New Visitors / Guests</Label>
                    <div className="flex gap-2">
                      <Input
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder="Visitor's full name"
                        className="text-xs flex-1 h-9"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddVisitor}
                        className="bg-slate-800 hover:bg-slate-900 text-white h-9 px-3 text-xs font-bold"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Add Visitor
                      </Button>
                    </div>

                    {visitors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {visitors.map((visitor, idx) => (
                          <Badge 
                            key={idx} 
                            onClick={() => handleRemoveVisitor(idx)}
                            className="bg-slate-100 hover:bg-red-50 text-slate-800 hover:text-red-700 hover:border-red-200 border cursor-pointer font-semibold py-1 pr-1"
                          >
                            {visitor}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcomes">Highlights & Outcomes</Label>
                <Textarea
                  id="outcomes"
                  value={formData.outcomes}
                  onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
                  placeholder="Summarize sharing topic, decisions made, or testimonies"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Meeting Notes & Reminders</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Record prayer requests, follow-ups needed, or general updates"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold">
                  {editingEvent ? 'Save Event Log' : 'Submit & Save Event'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events Table display */}
      <Card className="bg-white border shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="py-4 border-b">
          <CardTitle className="text-lg font-bold text-slate-800">Weekly Events History ({events.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No events logged yet. Tap "Log Event" to check in.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-slate-700">Event</TableHead>
                    <TableHead className="font-bold text-slate-700">Type</TableHead>
                    <TableHead className="font-bold text-slate-700">Cell Group</TableHead>
                    <TableHead className="font-bold text-slate-700">Date & Time</TableHead>
                    <TableHead className="font-bold text-slate-700">Venue</TableHead>
                    <TableHead className="font-bold text-slate-700">Total Attendance</TableHead>
                    <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-900">
                        <div>
                          <div>{event.name}</div>
                          {event.outcomes && (
                            <div className="text-xs text-slate-500 mt-1 line-clamp-1 font-normal max-w-[280px]">
                              💡 {event.outcomes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getEventTypeColor(event.type)} font-bold border`}>
                          {event.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">{event.cellGroupName || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-semibold">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div className="text-gray-500 text-xs">{event.time || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {event.venue || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
                          <Users className="w-4 h-4 text-slate-400" />
                          {event.attendance}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100" onClick={() => handleEdit(event)}>
                            <Edit className="w-4 h-4 text-slate-600" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(event.id)}>
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

    {/* Kiosk Mode Full-Screen Overlay */}
    {kioskOpen && (
      <div className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col p-6 sm:p-10 md:p-12 overflow-y-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-lg animate-pulse">
              👋
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">PUP SONS Self-Checkin Kiosk</h1>
              <p className="text-slate-400 text-xs font-semibold">Search your name and tap to check yourself in!</p>
            </div>
          </div>
          <Button 
            onClick={() => setKioskOpen(false)}
            className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold"
          >
            Exit Kiosk Mode
          </Button>
        </div>

        {/* Active Event Selection */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex-1 space-y-1">
            <label className="text-slate-400 text-xs font-black uppercase tracking-wide">Target Check-In Event</label>
            {events.length === 0 ? (
              <div className="text-slate-300 text-sm font-bold">No active events found. Create one to begin.</div>
            ) : (
              <Select value={kioskEventId} onValueChange={setKioskEventId}>
                <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-white font-bold h-11">
                  <SelectValue placeholder="Select active check-in event..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border-slate-800">
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id} className="hover:bg-slate-800 text-white">
                      {event.name} ({new Date(event.date).toLocaleDateString()} - {event.cellGroupName || 'General'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="shrink-0 flex items-end">
            <Button
              onClick={handleCreateQuickKioskEvent}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-5 rounded-xl border-0"
            >
              + Quick Event for Today
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="🔍 Start typing your name to find yourself..."
            value={kioskSearch}
            onChange={(e) => setKioskSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-lg text-white placeholder-slate-500 font-semibold focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
          />
        </div>

        {/* Members Touch-Friendly Roster */}
        <div className="flex-1">
          {kioskEventId ? (
            <div>
              {kioskFilteredMembers.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-sm">
                  No members match your search criteria.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {kioskFilteredMembers.map(m => {
                    const activeEvent = events.find(e => e.id === kioskEventId);
                    const isPresent = activeEvent?.presentMembers?.split(',').filter(Boolean).includes(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleKioskToggleCheckIn(m.id, m.name)}
                        className={`
                          p-5 rounded-2xl border-2 flex flex-col items-center text-center justify-center cursor-pointer transition-all duration-200 aspect-video select-none active:scale-95
                          ${isPresent 
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/5' 
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                          }
                        `}
                      >
                        <div className="text-2xl mb-2">{isPresent ? '✅' : '👤'}</div>
                        <div className="font-extrabold text-sm tracking-tight leading-tight line-clamp-2">{m.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{m.cellGroupName || 'Unassigned'}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-500 font-semibold">
              Please select or create an event above to view the check-in roster.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
}
