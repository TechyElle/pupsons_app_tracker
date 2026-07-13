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
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Share2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { apiFetch } from '../utils/apiHelper';
import { toast } from 'sonner@2.0.3';

interface ContentItem {
  id: string;
  week: number;
  contentTopic: string;
  format: string;
  platform: string;
  publicationDate: string;
  responsiblePerson: string;
  status: string;
  notes: string;
}

const INITIAL_2026_EVENTS = [
  // JANUARY 2026
  { date: '2026-01-04', topic: 'Mass Dedication', week: 1 },
  { date: '2026-01-06', topic: 'Phrisey Retreat', week: 2, endDate: '2026-01-09' },
  { date: '2026-01-15', topic: 'Leaders Night', week: 3 },
  { date: '2026-01-18', topic: 'First Fruit Festival', week: 3 },
  
  // FEBRUARY 2026
  { date: '2026-02-01', topic: 'Plan 40 Wave 1', week: 5, endDate: '2026-02-07' },
  { date: '2026-02-03', topic: 'Leaders Night', week: 5 },
  { date: '2026-02-13', topic: 'Couples Encounter', week: 7, endDate: '2026-02-14' },
  
  // MARCH 2026
  { date: '2026-03-03', topic: 'Leaders Night', week: 9 },
  { date: '2026-03-06', topic: 'Womens Conference', week: 10, endDate: '2026-03-07' },
  { date: '2026-03-14', topic: 'Mens Conference', week: 11 },
  { date: '2026-03-21', topic: 'Missions Training', week: 12 },
  { date: '2026-03-28', topic: 'Missions Training', week: 13 },
  
  // APRIL 2026
  { date: '2026-04-03', topic: 'Crossover Camp B1', week: 14, endDate: '2026-04-05' },
  { date: '2026-04-07', topic: 'Leaders Night', week: 15 },
  { date: '2026-04-17', topic: 'Mens Encounter', week: 16, endDate: '2026-04-19' },
  { date: '2026-04-24', topic: 'Womens Encounter', week: 17, endDate: '2026-04-26' },
  
  // MAY 2026
  { date: '2026-05-01', topic: 'Youth Camp B1', week: 18, endDate: '2026-05-03' },
  { date: '2026-05-05', topic: 'Leaders Night', week: 19 },
  { date: '2026-05-09', topic: 'Cell Leaders Summit', week: 19 },
  { date: '2026-05-18', topic: 'Summer Mission', week: 21, endDate: '2026-05-31' },
  
  // JUNE 2026
  { date: '2026-06-01', topic: 'Summer Mission (Continued)', week: 22 },
  { date: '2026-06-02', topic: 'Leaders Night', week: 23 },
  { date: '2026-06-12', topic: 'Crossover Camp B2', week: 24, endDate: '2026-06-14' },
  { date: '2026-06-20', topic: 'Mass Wedding', week: 25 },
  
  // JULY 2026
  { date: '2026-07-05', topic: 'Plan 40 Wave 2', week: 27, endDate: '2026-07-11' },
  { date: '2026-07-07', topic: 'Leaders Night', week: 28 },
  { date: '2026-07-24', topic: 'Camp Rev 26', week: 30, endDate: '2026-07-25' },
  
  // AUGUST 2026
  { date: '2026-08-04', topic: 'Leaders Night', week: 32 },
  { date: '2026-08-07', topic: 'Mens Encounter', week: 32, endDate: '2026-08-09' },
  { date: '2026-08-14', topic: 'Womens Encounter', week: 33, endDate: '2026-08-16' },
  { date: '2026-08-29', topic: 'Youth Camp B2', week: 35, endDate: '2026-08-31' },
  
  // SEPTEMBER 2026
  { date: '2026-09-01', topic: 'Leaders Night', week: 36 },
  { date: '2026-09-20', topic: 'Plan 40 Wave 3', week: 38, endDate: '2026-09-26' },
  
  // OCTOBER 2026
  { date: '2026-10-06', topic: 'Leaders Night', week: 41 },
  { date: '2026-10-26', topic: 'Luzon Regional Conf', week: 44 },
  
  // NOVEMBER 2026
  { date: '2026-11-03', topic: 'Leaders Night', week: 45 },
  { date: '2026-11-10', topic: 'Re-Encounter Nights', week: 46, endDate: '2026-11-12' },
  
  // DECEMBER 2026
  { date: '2026-12-01', topic: 'Leaders Night', week: 49 },
  { date: '2026-12-04', topic: 'Mens Encounter', week: 49, endDate: '2026-12-06' },
  { date: '2026-12-11', topic: 'Womens Encounter', week: 50, endDate: '2026-12-13' },
  { date: '2026-12-16', topic: 'DSG 26', week: 51, endDate: '2026-12-23' },
];

export function ContentCalendarModule() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Start at January 2026
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [formData, setFormData] = useState<Partial<ContentItem>>({
    week: 1,
    contentTopic: '',
    format: 'Ministry Event',
    platform: 'All Channels',
    publicationDate: new Date().toISOString().split('T')[0],
    responsiblePerson: '',
    status: 'Planned',
    notes: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/content-calendar`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        const existingItems = result.data;
        
        // Check if we need to initialize with 2026 events
        if (existingItems.length === 0) {
          await initializeWith2026Events();
        } else {
          setItems(existingItems.sort((a: ContentItem, b: ContentItem) => 
            new Date(a.publicationDate).getTime() - new Date(b.publicationDate).getTime()
          ));
        }
      }
    } catch (error) {
      console.error('Error fetching content calendar:', error);
      toast.error('Failed to load content calendar');
    } finally {
      setLoading(false);
    }
  };

  const initializeWith2026Events = async () => {
    try {
      for (const event of INITIAL_2026_EVENTS) {
        const eventData = {
          week: event.week,
          contentTopic: event.topic,
          format: 'Ministry Event',
          platform: 'All Channels',
          publicationDate: event.date,
          responsiblePerson: '',
          status: 'Planned',
          notes: event.endDate ? `Event runs from ${event.date} to ${event.endDate}` : '',
        };

        await apiFetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/content-calendar`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(eventData),
          }
        );
      }
      
      // Fetch the newly created items
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/content-calendar`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setItems(result.data.sort((a: ContentItem, b: ContentItem) => 
          new Date(a.publicationDate).getTime() - new Date(b.publicationDate).getTime()
        ));
      }
    } catch (error) {
      console.error('Error initializing 2026 events:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/content-calendar/${editingItem.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/content-calendar`;
      
      const response = await apiFetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(editingItem ? 'Content updated!' : 'Content added!');
        setDialogOpen(false);
        resetForm();
        fetchItems();
      }
    } catch (error) {
      console.error('Error saving content item:', error);
      toast.error('Failed to save content');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) return;
    
    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/content-calendar/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Content deleted');
        fetchItems();
      }
    } catch (error) {
      console.error('Error deleting content item:', error);
      toast.error('Failed to delete content');
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData(item);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      week: 1,
      contentTopic: '',
      format: 'Ministry Event',
      platform: 'All Channels',
      publicationDate: new Date().toISOString().split('T')[0],
      responsiblePerson: '',
      status: 'Planned',
      notes: '',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Planned': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Ready': 'bg-green-100 text-green-800',
      'Published': 'bg-purple-100 text-purple-800',
      'Cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getFormatColor = (format: string) => {
    const colors: Record<string, string> = {
      'Video': 'bg-red-100 text-red-800',
      'Blog Post': 'bg-blue-100 text-blue-800',
      'Social Media Post': 'bg-purple-100 text-purple-800',
      'Graphic': 'bg-green-100 text-green-800',
      'Story/Reel': 'bg-pink-100 text-pink-800',
      'Event Promo': 'bg-orange-100 text-orange-800',
      'Ministry Event': 'bg-indigo-100 text-indigo-800',
    };
    return colors[format] || 'bg-gray-100 text-gray-800';
  };

  const plannedCount = items.filter(i => i.status === 'Planned').length;
  const publishedCount = items.filter(i => i.status === 'Published').length;
  const inProgressCount = items.filter(i => i.status === 'In Progress').length;

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (dateString: string) => {
    return items.filter(item => item.publicationDate === dateString);
  };

  const formatDateString = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (dateString: string) => {
    setSelectedDate(dateString);
    setFormData({ ...formData, publicationDate: dateString });
    setDialogOpen(true);
  };

  const renderCalendarView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-gray-50 border border-gray-200"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDateString(year, month, day);
      const dayEvents = getEventsForDate(dateString);
      const isToday = dateString === new Date().toISOString().split('T')[0];

      days.push(
        <div
          key={day}
          className={`min-h-[120px] border border-gray-200 p-2 cursor-pointer hover:bg-blue-50 transition-colors ${
            isToday ? 'bg-blue-50' : 'bg-white'
          }`}
          onClick={() => handleDateClick(dateString)}
        >
          <div className={`text-sm mb-1 ${isToday ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded truncate cursor-pointer ${
                  event.format === 'Ministry Event' 
                    ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' 
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(event);
                }}
                title={event.contentTopic}
              >
                {event.contentTopic}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 pl-1">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    // Add empty cells to complete the grid
    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push(<div key={`empty-end-${i}`} className="min-h-[120px] bg-gray-50 border border-gray-200"></div>);
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{monthName}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="border border-gray-200 bg-gray-100 p-2 text-center text-sm">
                {day}
              </div>
            ))}
            {days}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderListView = () => {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Schedule ({items.length})</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Responsible</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">Week {item.week}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{item.contentTopic}</div>
                        {item.notes && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getFormatColor(item.format)}>
                        {item.format}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Share2 className="w-3 h-3 text-gray-400" />
                        {item.platform}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <CalendarIcon className="w-3 h-3 text-gray-400" />
                        {new Date(item.publicationDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{item.responsiblePerson || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
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
        </CardContent>
      </Card>
    );
  };

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
          <h2 className="text-gray-900">Content Calendar & Strategy</h2>
          <p className="text-gray-600 text-sm mt-1">Plan and schedule your communication content</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Content' : 'Add New Content'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="week">Week Number</Label>
                  <Input
                    id="week"
                    type="number"
                    value={formData.week}
                    onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publicationDate">Publication Date *</Label>
                  <Input
                    id="publicationDate"
                    type="date"
                    value={formData.publicationDate}
                    onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentTopic">Content Topic *</Label>
                <Input
                  id="contentTopic"
                  value={formData.contentTopic}
                  onChange={(e) => setFormData({ ...formData, contentTopic: e.target.value })}
                  placeholder="e.g., New Year Vision, Testimony Tuesday"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) => setFormData({ ...formData, format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Social Media Post">Social Media Post</SelectItem>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="Blog Post">Blog Post</SelectItem>
                      <SelectItem value="Graphic">Graphic</SelectItem>
                      <SelectItem value="Story/Reel">Story/Reel</SelectItem>
                      <SelectItem value="Event Promo">Event Promo</SelectItem>
                      <SelectItem value="Newsletter">Newsletter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Messenger/Viber">Messenger/Viber</SelectItem>
                      <SelectItem value="All Channels">All Channels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsiblePerson">Responsible Person</Label>
                  <Input
                    id="responsiblePerson"
                    value={formData.responsiblePerson}
                    onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                    placeholder="Assigned to"
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
                      <SelectItem value="Planned">Planned</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Ready">Ready</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional details, links, hashtags, etc."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  {editingItem ? 'Update' : 'Add Content'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{items.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Planned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{plannedCount}</div>
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

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm opacity-90">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{publishedCount}</div>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'calendar' ? renderCalendarView() : renderListView()}

      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle>Content Strategy Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Recommended Content Types:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Weekly devotionals & inspirational messages</li>
                <li>Event announcements & recaps</li>
                <li>Member testimonies & stories</li>
                <li>Training materials & resources</li>
                <li>Cell group highlights</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Best Practices:</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Plan content 2-4 weeks in advance</li>
                <li>Mix content formats for engagement</li>
                <li>Include clear calls-to-action</li>
                <li>Track engagement metrics</li>
                <li>Respond promptly to comments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}