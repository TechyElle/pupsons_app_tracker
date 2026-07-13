import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Award, 
  Calendar, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  BookOpen,
  MessageSquare,
  Clock,
  ListFilter
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { apiFetch } from '../utils/apiHelper';
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
  // Enhanced Fields
  address?: string;
  messengerHandle?: string;
  courseSection?: string;
  trainingProgress?: string; // Comma-separated list of completed steps
  notesTimeline?: string; // JSON array of [{date: string, text: string}]
  cellLeader?: string;
  primaryLeader?: string;
  volunteerTeams?: string;
}

const TRAINING_STEPS = [
  { key: 'lc_l1_4', label: 'Lifeclass L1-4' },
  { key: 'encounter', label: 'Encounter Weekend' },
  { key: 'lc_l6_9', label: 'Lifeclass L6-9' },
  { key: 'sol_1', label: 'School of Leaders 1' },
  { key: 'sol_2', label: 'School of Leaders 2' },
  { key: 'sol_3', label: 'School of Leaders 3' },
  { key: 'graduate', label: 'Leadership Graduate' }
];

export const VOLUNTEER_TEAMS = [
  { key: 'worship', label: 'Worship Ministry' },
  { key: 'media', label: 'Media & Creatives' },
  { key: 'logistics', label: 'Logistics & Ushering' },
  { key: 'outreach', label: 'Evangelism & Outreach' },
  { key: 'intercession', label: 'Intercessory & Prayer' },
  { key: 'secretariat', label: 'Secretariat & Comms' }
];

interface MembersModuleProps {
  cart: string[];
  setCart: (ids: string[]) => void;
  themeMode?: 'classic' | 'forest';
}

export function MembersModule({ cart, setCart, themeMode = 'classic' }: MembersModuleProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [cellGroups, setCellGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Filter and view states
  const [filterLeadership, setFilterLeadership] = useState<string>('all');
  const [filterLCSol, setFilterLCSol] = useState<string>('all');
  const [filterVolunteerTeam, setFilterVolunteerTeam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'flat' | 'tree'>('flat');
  const [expandedLeaders, setExpandedLeaders] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Timeline note state
  const [newNote, setNewNote] = useState('');

  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    email: '',
    contactNumber: '',
    cellGroupId: '',
    cellGroupName: '',
    leadershipStatus: 'Member',
    lcsolLevel: 'None',
    birthday: '',
    studentStatus: 'Student',
    position: '',
    trainingLevel: 'None',
    address: 'Manila, Philippines',
    messengerHandle: '',
    courseSection: '',
    trainingProgress: '',
    notesTimeline: '[]',
    volunteerTeams: '',
    cellLeader: '',
    primaryLeader: ''
  });

  useEffect(() => {
    fetchMembers();
    fetchCellGroups();
  }, []);

  const isForest = themeMode === 'forest';

  // Gamification helpers
  const getGrowthStage = (member: Member) => {
    const completedSteps = member.trainingProgress ? member.trainingProgress.split(',').filter(Boolean) : [];
    const status = member.leadershipStatus || 'Member';
    
    if (['National Leader', 'District Leader', 'Zone Leader'].includes(status)) {
      return { stage: 'Forest', level: 4, icon: '🌲', label: 'Forest Multiplier', color: 'text-emerald-600' };
    }
    if (status === 'Cell Leader') {
      return { stage: 'Mature Tree', level: 3, icon: '🌳', label: 'Mature Tree (Leader)', color: 'text-green-600' };
    }
    if (completedSteps.includes('sol_1') || completedSteps.includes('sol_2') || completedSteps.includes('sol_3') || status === 'Primary Leader') {
      return { stage: 'Sapling', level: 2, icon: '🌿', label: 'Developing Sapling (Trainee)', color: 'text-lime-650' };
    }
    if (completedSteps.length > 0 || status === 'Member') {
      return { stage: 'Sprout', level: 1, icon: '🌱', label: 'Growing Sprout (Member)', color: 'text-green-500' };
    }
    return { stage: 'Seed', level: 0, icon: '🌰', label: 'Initial Seed (Contact)', color: 'text-amber-700' };
  };

  const getAchievements = (member: Member) => {
    const achievements = [];
    const completedSteps = member.trainingProgress ? member.trainingProgress.split(',').filter(Boolean) : [];
    
    // 1. Faithful Waterer: completed at least 2 training steps
    if (completedSteps.length >= 2) {
      achievements.push({
        key: 'waterer',
        title: 'Faithful Waterer',
        desc: 'Completed multiple foundational training modules.',
        icon: '🌊',
        color: 'bg-blue-50 text-blue-800 border-blue-200'
      });
    }

    // 2. Diligent Laborer: completed SOL 1
    if (completedSteps.includes('sol_1')) {
      achievements.push({
        key: 'laborer',
        title: 'Diligent Laborer',
        desc: 'Completed School of Leaders (SOL) 1 training.',
        icon: '⚒️',
        color: 'bg-orange-50 text-orange-850 border-orange-205'
      });
    }

    // 3. Soul Winner: status is Cell Leader or has invited contacts
    if (member.leadershipStatus === 'Cell Leader' || member.leadershipStatus === 'Primary Leader' || completedSteps.includes('graduate')) {
      achievements.push({
        key: 'winner',
        title: 'Soul Winner',
        desc: 'Active in personal evangelism and leading others.',
        icon: '🔥',
        color: 'bg-red-50 text-red-800 border-red-200'
      });
    }

    // 4. Multiplication Master: Cell Leader with large group or district leader
    if (['Cell Leader', 'Zone Leader', 'District Leader', 'National Leader'].includes(member.leadershipStatus || '')) {
      achievements.push({
        key: 'multiplier',
        title: 'Multiplication Master',
        desc: 'Successfully multiplied cell group structure.',
        icon: '👑',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-250'
      });
    }

    return achievements;
  };

  const renderGrowthTimeline = (member: Member) => {
    const current = getGrowthStage(member);
    const stages = [
      { name: 'Seed', icon: '🌰', lvl: 0 },
      { name: 'Sprout', icon: '🌱', lvl: 1 },
      { name: 'Sapling', icon: '🌿', lvl: 2 },
      { name: 'Tree', icon: '🌳', lvl: 3 },
      { name: 'Forest', icon: '🌲', lvl: 4 },
    ];

    return (
      <div className="p-4 bg-slate-50/50 border rounded-2xl space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider">Spiritual Growth Journey</span>
          <span className={`font-black flex items-center gap-1 ${current.color}`}>
            {current.icon} {current.label} (Level {current.level})
          </span>
        </div>
        
        {/* Horizontal Line and Nodes */}
        <div className="relative flex justify-between items-center py-2 px-1">
          <div className="absolute left-4 right-4 h-0.5 bg-slate-200 top-[22px] z-0" />
          <div 
            className="absolute left-4 h-0.5 bg-emerald-500 top-[22px] z-0 transition-all duration-300" 
            style={{ width: `${(current.level / 4) * 92}%` }}
          />
          
          {stages.map((stage) => {
            const isActive = stage.lvl <= current.level;
            const isCurrent = stage.lvl === current.level;
            return (
              <div key={stage.name} className="flex flex-col items-center z-10 relative">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300
                  ${isCurrent 
                    ? 'bg-emerald-600 text-white scale-110 ring-2 ring-emerald-300 ring-offset-1' 
                    : isActive 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-white text-slate-400 border border-slate-200'
                  }
                `}>
                  {stage.icon}
                </div>
                <span className={`text-[9px] font-bold mt-1 ${isCurrent ? 'text-emerald-700 font-extrabold' : 'text-slate-500'}`}>
                  {stage.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
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
      toast.error('Failed to load members');
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
      const url = editingMember
        ? `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/members/${editingMember.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/members`;
      
      const response = await apiFetch(url, {
        method: editingMember ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(editingMember ? 'Member updated!' : 'Member added!');
        setDialogOpen(false);
        resetForm();
        fetchMembers();
      }
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('Failed to save member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/members/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Member deleted');
        fetchMembers();
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData(member);
    setDialogOpen(true);
  };

  const handleOpenProfile = (member: Member) => {
    setSelectedMember(member);
    setNewNote('');
    setProfileOpen(true);
  };

  const handleToggleTrainingStep = async (stepKey: string) => {
    if (!selectedMember) return;

    let currentSteps = selectedMember.trainingProgress 
      ? selectedMember.trainingProgress.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    if (currentSteps.includes(stepKey)) {
      currentSteps = currentSteps.filter(s => s !== stepKey);
    } else {
      currentSteps.push(stepKey);
    }

    const updatedProgress = currentSteps.join(',');
    const updatedMember = { ...selectedMember, trainingProgress: updatedProgress };

    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/members/${selectedMember.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ trainingProgress: updatedProgress }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setSelectedMember(updatedMember);
        // Update local members list
        setMembers(prev => prev.map(m => m.id === selectedMember.id ? updatedMember : m));
        toast.success('Training progress updated');
      }
    } catch (error) {
      console.error('Error updating training status:', error);
      toast.error('Failed to update training status');
    }
  };

  const handleAddTimelineNote = async () => {
    if (!selectedMember || !newNote.trim()) return;

    const timeline = selectedMember.notesTimeline 
      ? JSON.parse(selectedMember.notesTimeline) 
      : [];

    const newNoteObj = {
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      text: newNote.trim()
    };

    const updatedTimeline = [newNoteObj, ...timeline];
    const updatedTimelineStr = JSON.stringify(updatedTimeline);
    const updatedMember = { ...selectedMember, notesTimeline: updatedTimelineStr };

    try {
      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/members/${selectedMember.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ notesTimeline: updatedTimelineStr }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setSelectedMember(updatedMember);
        setMembers(prev => prev.map(m => m.id === selectedMember.id ? updatedMember : m));
        setNewNote('');
        toast.success('Note added to timeline');
      }
    } catch (error) {
      console.error('Error saving timeline note:', error);
      toast.error('Failed to save note');
    }
  };

  const resetForm = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      contactNumber: '',
      cellGroupId: '',
      cellGroupName: '',
      leadershipStatus: 'Member',
      lcsolLevel: 'None',
      birthday: '',
      studentStatus: 'Student',
      position: '',
      trainingLevel: 'None',
      address: 'Manila, Philippines',
      messengerHandle: '',
      courseSection: '',
      trainingProgress: '',
      notesTimeline: '[]',
      volunteerTeams: '',
      cellLeader: '',
      primaryLeader: ''
    });
  };

  const filteredMembers = members.filter(member => {
    const matchesLeadership = filterLeadership === 'all' || member.leadershipStatus === filterLeadership;
    const matchesLCSol = filterLCSol === 'all' || member.lcsolLevel === filterLCSol;
    const matchesVolunteerTeam = filterVolunteerTeam === 'all' || 
      (member.volunteerTeams && member.volunteerTeams.split(',').filter(Boolean).includes(filterVolunteerTeam));
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.position && member.position.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.cellGroupName && member.cellGroupName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesLeadership && matchesLCSol && matchesVolunteerTeam && matchesSearch;
  });

  // Calculate training statistics
  const getTrainingPercentage = (member: Member) => {
    if (!member.trainingProgress) return 0;
    const completed = member.trainingProgress.split(',').filter(Boolean).length;
    return Math.round((completed / TRAINING_STEPS.length) * 100);
  };

  // Group directory by Primary Leaders for Tree View
  const getPrimaryLeadersGroup = () => {
    const leaders = members.filter(m => m.leadershipStatus === 'Primary Leader');
    const groupings: Record<string, { leader: Member | null; members: Member[] }> = {};
    
    // Initialize groupings
    leaders.forEach(l => {
      groupings[l.name] = { leader: l, members: [] };
    });
    groupings['Other / Unassigned'] = { leader: null, members: [] };

    members.forEach(m => {
      if (m.leadershipStatus === 'Primary Leader') return; // Skip primary leader itself in listing

      // Find if they are assigned to a cell group that reports to a primary leader,
      // or directly check if they have a coordinator.
      // In the seed members, cg1 reports to Isaac Lausin, cg2/cg3 report to Lilibeth Dorado.
      let primaryName = 'Other / Unassigned';
      if (m.cellGroupName) {
        const matchingGroup = cellGroups.find(cg => cg.name === m.cellGroupName);
        if (matchingGroup && matchingGroup.primaryLeader) {
          primaryName = matchingGroup.primaryLeader;
        }
      }

      if (groupings[primaryName]) {
        groupings[primaryName].members.push(m);
      } else {
        groupings['Other / Unassigned'].members.push(m);
      }
    });

    return groupings;
  };

  const getTreeIcon = (status: string, position: string) => {
    if (status === 'Cell Leader') {
      return { icon: '🌳', text: 'Mature Tree (CL)' };
    }
    if (position?.toLowerCase().includes('potential') || status === 'Primary Leader') {
      return { icon: '🌱', text: 'Sapling (PL)' };
    }
    return { icon: '🌰', text: 'Seed/Sprout (Member)' };
  };

  const getLeadershipColor = (status: string) => {
    const colors: Record<string, string> = {
      'National Leader': 'bg-purple-100 text-purple-800 border-purple-200',
      'District Leader': 'bg-blue-100 text-blue-800 border-blue-200',
      'Zone Leader': 'bg-green-100 text-green-800 border-green-200',
      'Cell Leader': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Primary Leader': 'bg-orange-100 text-orange-800 border-orange-200',
      'Member': 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getLCSolColor = (level: string) => {
    const colors: Record<string, string> = {
      'LCSOL 6': 'bg-purple-600 text-white',
      'LCSOL 5': 'bg-blue-600 text-white',
      'LCSOL 4': 'bg-emerald-600 text-white',
      'LCSOL 3': 'bg-yellow-600 text-slate-900',
      'LCSOL 2': 'bg-orange-600 text-white',
      'LCSOL 1': 'bg-red-600 text-white',
      'None': 'bg-slate-200 text-slate-600',
    };
    return colors[level] || 'bg-slate-200 text-slate-600';
  };

  const toggleLeaderNode = (leaderName: string) => {
    setExpandedLeaders(prev => ({
      ...prev,
      [leaderName]: !prev[leaderName]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const groupedTreeData = getPrimaryLeadersGroup();

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-gray-900 font-extrabold text-xl">Members & Leadership Directory</h2>
          <p className="text-gray-600 text-sm">Organize members, track training milestones, and nurture leadership progression</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant={viewMode === 'flat' ? 'default' : 'outline'}
            onClick={() => setViewMode('flat')}
            className="flex-1 sm:flex-initial"
          >
            List View
          </Button>
          <Button 
            variant={viewMode === 'tree' ? 'default' : 'outline'}
            onClick={() => setViewMode('tree')}
            className="flex-1 sm:flex-initial"
          >
            Leader Folders
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className={`${isForest ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-md`}>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingMember ? '📝 Edit Member Information' : '👤 Register New Member'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Jane Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane.doe@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      placeholder="09XX XXX XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="messengerHandle">Messenger Handle</Label>
                    <Input
                      id="messengerHandle"
                      value={formData.messengerHandle}
                      onChange={(e) => setFormData({ ...formData, messengerHandle: e.target.value })}
                      placeholder="e.g., @janedoe123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthday">Birthday</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="courseSection">Course & Section</Label>
                    <Input
                      id="courseSection"
                      value={formData.courseSection}
                      onChange={(e) => setFormData({ ...formData, courseSection: e.target.value })}
                      placeholder="e.g., BSCS 3-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cellGroupName">Cell Group</Label>
                    <Select
                      value={formData.cellGroupName}
                      onValueChange={(value) => {
                        const grp = cellGroups.find(c => c.name === value);
                        setFormData({ 
                          ...formData, 
                          cellGroupName: value,
                          cellGroupId: grp ? grp.id : '',
                          cellLeader: grp ? grp.leader : formData.cellLeader,
                          primaryLeader: grp ? grp.primaryLeader : formData.primaryLeader
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cell group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None / Unassigned</SelectItem>
                        {cellGroups.map((group) => (
                          <SelectItem key={group.id} value={group.name}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentStatus">Student Status</Label>
                    <Select
                      value={formData.studentStatus}
                      onValueChange={(value) => setFormData({ ...formData, studentStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Alumni">Alumni</SelectItem>
                        <SelectItem value="Pastor">Pastor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leadershipStatus">Leadership Level</Label>
                    <Select
                      value={formData.leadershipStatus}
                      onValueChange={(value) => setFormData({ ...formData, leadershipStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Member">Member</SelectItem>
                        <SelectItem value="Primary Leader">Primary Leader</SelectItem>
                        <SelectItem value="Cell Leader">Cell Leader</SelectItem>
                        <SelectItem value="Zone Leader">Zone Leader</SelectItem>
                        <SelectItem value="District Leader">District Leader</SelectItem>
                        <SelectItem value="National Leader">National Leader</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cellLeader">Immediate Cell Leader</Label>
                    <Input
                      id="cellLeader"
                      value={formData.cellLeader || ''}
                      onChange={(e) => setFormData({ ...formData, cellLeader: e.target.value })}
                      placeholder="e.g., Isaac Lausin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryLeader">Primary Coordinator / Overseer</Label>
                    <Input
                      id="primaryLeader"
                      value={formData.primaryLeader || ''}
                      onChange={(e) => setFormData({ ...formData, primaryLeader: e.target.value })}
                      placeholder="e.g., Lilibeth Dorado"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position/Role</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="e.g., Worship Lead, Usher"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lcsolLevel">LCSOL Level</Label>
                    <Select
                      value={formData.lcsolLevel}
                      onValueChange={(value) => setFormData({ ...formData, lcsolLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="LCSOL 1">LCSOL 1</SelectItem>
                        <SelectItem value="LCSOL 2">LCSOL 2</SelectItem>
                        <SelectItem value="LCSOL 3">LCSOL 3</SelectItem>
                        <SelectItem value="LCSOL 4">LCSOL 4</SelectItem>
                        <SelectItem value="LCSOL 5">LCSOL 5</SelectItem>
                        <SelectItem value="LCSOL 6">LCSOL 6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trainingLevel">Overall Tier</Label>
                    <Select
                      value={formData.trainingLevel}
                      onValueChange={(value) => setFormData({ ...formData, trainingLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Foundational">Foundational</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Leadership">Leadership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Volunteer Teams Selection */}
                <div className="space-y-2">
                  <Label className="text-slate-800 font-bold">Volunteer Teams / Ministries (ChurchCRM Properties)</Label>
                  <div className="grid grid-cols-2 gap-2.5 p-3 border rounded-xl bg-slate-50/50">
                    {VOLUNTEER_TEAMS.map((team) => {
                      const currentTeams = formData.volunteerTeams ? formData.volunteerTeams.split(',').filter(Boolean) : [];
                      const isChecked = currentTeams.includes(team.key);
                      return (
                        <label key={team.key} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none hover:bg-slate-100 p-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            onChange={(e) => {
                              let updated: string[];
                              if (e.target.checked) {
                                updated = [...currentTeams, team.key];
                              } else {
                                updated = currentTeams.filter(t => t !== team.key);
                              }
                              setFormData({ ...formData, volunteerTeams: updated.join(',') });
                            }}
                          />
                          {team.label}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Home Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className={`${isForest ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
                    {editingMember ? 'Save Changes' : 'Register Member'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtering Section */}
      <Card className="bg-white border shadow-sm rounded-2xl">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/3 relative">
            <Input
              type="text"
              placeholder="🔍 Search by name, cell group, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-8"
            />
          </div>
          <div className="flex flex-row gap-2 w-full md:w-auto justify-end">
            <Select value={filterLeadership} onValueChange={setFilterLeadership}>
              <SelectTrigger className="w-[160px] bg-slate-50 border">
                <ListFilter className="w-4 h-4 mr-1 text-slate-400" />
                <SelectValue placeholder="Leadership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="National Leader">National Leader</SelectItem>
                <SelectItem value="District Leader">District Leader</SelectItem>
                <SelectItem value="Zone Leader">Zone Leader</SelectItem>
                <SelectItem value="Cell Leader">Cell Leader</SelectItem>
                <SelectItem value="Primary Leader">Primary Leader</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterLCSol} onValueChange={setFilterLCSol}>
              <SelectTrigger className="w-[140px] bg-slate-50 border">
                <ListFilter className="w-4 h-4 mr-1 text-slate-400" />
                <SelectValue placeholder="LCSOL" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All LCSOL</SelectItem>
                <SelectItem value="LCSOL 6">LCSOL 6</SelectItem>
                <SelectItem value="LCSOL 5">LCSOL 5</SelectItem>
                <SelectItem value="LCSOL 4">LCSOL 4</SelectItem>
                <SelectItem value="LCSOL 3">LCSOL 3</SelectItem>
                <SelectItem value="LCSOL 2">LCSOL 2</SelectItem>
                <SelectItem value="LCSOL 1">LCSOL 1</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterVolunteerTeam} onValueChange={setFilterVolunteerTeam}>
              <SelectTrigger className="w-[170px] bg-slate-50 border">
                <ListFilter className="w-4 h-4 mr-1 text-slate-400" />
                <SelectValue placeholder="Volunteer Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {VOLUNTEER_TEAMS.map(team => (
                  <SelectItem key={team.key} value={team.key}>{team.label.replace(' Ministry', '')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Primary Display Mode */}
      {viewMode === 'flat' ? (
        <Card className="bg-white border shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="py-4 border-b">
            <CardTitle className="text-lg font-bold text-slate-800">Members List ({filteredMembers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No members found match your search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 cursor-pointer"
                          checked={filteredMembers.length > 0 && filteredMembers.every(m => selectedIds.includes(m.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(filteredMembers.map(m => m.id));
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="font-bold text-slate-700">Name</TableHead>
                      <TableHead className="font-bold text-slate-700">Cell Group</TableHead>
                      <TableHead className="font-bold text-slate-700">Cell Leader</TableHead>
                      <TableHead className="font-bold text-slate-700">Primary Coordinator</TableHead>
                      <TableHead className="font-bold text-slate-700">Leadership Status</TableHead>
                      <TableHead className="font-bold text-slate-700">LCSOL Level</TableHead>
                      <TableHead className="font-bold text-slate-700">Training Progress</TableHead>
                      <TableHead className="font-bold text-slate-700">Role</TableHead>
                      <TableHead className="font-bold text-slate-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="w-12">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4.5 h-4.5 cursor-pointer"
                            checked={selectedIds.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds([...selectedIds, member.id]);
                              } else {
                                setSelectedIds(selectedIds.filter(id => id !== member.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900 cursor-pointer hover:text-blue-600" onClick={() => handleOpenProfile(member)}>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold">
                              <span>{member.name}</span>
                              <span title={getGrowthStage(member).label} className="cursor-help text-sm">
                                {getGrowthStage(member).icon}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 font-normal">{member.email || 'No email registered'}</div>
                            {member.volunteerTeams && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {member.volunteerTeams.split(',').filter(Boolean).map((teamKey) => {
                                  const team = VOLUNTEER_TEAMS.find(t => t.key === teamKey);
                                  if (!team) return null;
                                  return (
                                    <span key={teamKey} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                                      {team.label.replace(' Ministry', '').replace(' & Creatives', '').replace(' & Ushering', '').replace(' & Prayer', '').replace(' & Comms', '')}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{member.cellGroupName || <span className="text-gray-400 italic">None</span>}</TableCell>
                        <TableCell className="font-semibold text-slate-700">{member.cellLeader || <span className="text-gray-400 italic">-</span>}</TableCell>
                        <TableCell className="font-semibold text-slate-700">{member.primaryLeader || <span className="text-gray-400 italic">-</span>}</TableCell>
                        <TableCell>
                          <Badge className={`${getLeadershipColor(member.leadershipStatus)} font-semibold border`}>
                            {member.leadershipStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getLCSolColor(member.lcsolLevel)} font-medium`}>
                            {member.lcsolLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={getTrainingPercentage(member)} className="h-2 w-16 bg-slate-100" />
                            <span className="text-xs text-slate-600 font-bold">{getTrainingPercentage(member)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{member.position || <span className="text-gray-400">-</span>}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="sm" variant="ghost" className="hover:bg-slate-100" onClick={() => handleOpenProfile(member)}>
                              View Card
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100" onClick={() => handleEdit(member)}>
                              <Edit className="w-4 h-4 text-slate-600" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(member.id)}>
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
      ) : (
        /* Folder Tree View grouped by Primary Leaders */
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-900 text-sm flex gap-3 items-center">
            <span className="text-2xl">💡</span>
            <p>
              This grouped folder view categorizes all cell group members by their assigned <strong>Primary Coordinator Leaders</strong>.
              Expand each folder to inspect individual profile details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(groupedTreeData).map(([leaderName, group]) => {
              const isExpanded = !!expandedLeaders[leaderName];
              return (
                <Card key={leaderName} className="bg-white border shadow-sm rounded-xl overflow-hidden h-fit">
                  <div 
                    onClick={() => toggleLeaderNode(leaderName)}
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between border-b transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Folder className="w-6 h-6 text-blue-600 fill-blue-50" />
                      <div>
                        <h4 className="font-bold text-slate-900">{leaderName}</h4>
                        <p className="text-xs text-slate-500 font-semibold">{group.members.length} members overseen</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 font-bold border-blue-200">
                        Coordinator
                      </Badge>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <CardContent className="p-0 border-t">
                      {group.members.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-sm">
                          No sub-members registered under this leader.
                        </div>
                      ) : (
                        <div className="divide-y">
                          {group.members.map((m) => {
                            const treeInfo = getTreeIcon(m.leadershipStatus, m.position);
                            return (
                              <div 
                                key={m.id} 
                                onClick={() => handleOpenProfile(m)}
                                className="p-3.5 hover:bg-slate-50/50 cursor-pointer flex items-center justify-between transition-colors group"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-xl" title={treeInfo.text}>{treeInfo.icon}</span>
                                  <div>
                                    <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                                      {m.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {m.cellGroupName || 'Unassigned'} • {m.position || m.leadershipStatus}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${getLCSolColor(m.lcsolLevel)} text-[10px] py-0 px-2`}>
                                    {m.lcsolLevel}
                                  </Badge>
                                  <span className="text-xs font-extrabold text-slate-500">
                                    {getTrainingPercentage(m)}% SOL
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Member Detailed Profile Card Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl overflow-hidden border">
          {selectedMember && (
            <div className="flex flex-col">
              {/* Profile Card Header */}
              <div className={`p-6 relative text-white ${isForest ? 'bg-gradient-to-r from-emerald-950 to-green-900 border-b border-emerald-800' : 'bg-gradient-to-r from-blue-900 to-indigo-900 border-b'}`}>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className={`w-20 h-20 bg-white rounded-full flex items-center justify-center font-black text-3xl shadow-lg border-2 ${isForest ? 'text-emerald-900 border-emerald-400' : 'text-blue-900 border-blue-400'}`}>
                    {selectedMember.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-black tracking-tight">{selectedMember.name}</h3>
                    <p className="text-emerald-250 text-sm font-semibold flex items-center justify-center sm:justify-start gap-1.5 mt-1 opacity-90">
                      <Shield className="w-4 h-4" />
                      {selectedMember.position || selectedMember.leadershipStatus}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Badge className="bg-green-500 text-white border-0 font-bold text-xs">
                        {getTreeIcon(selectedMember.leadershipStatus, selectedMember.position).icon} {selectedMember.leadershipStatus}
                      </Badge>
                      <Badge className={`${isForest ? 'bg-emerald-600' : 'bg-blue-500'} text-white border-0 font-bold text-xs`}>
                        {selectedMember.studentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Content Body */}
              <div className="p-6 space-y-6">
                {/* Spiritual Growth Journey Metaphor */}
                {renderGrowthTimeline(selectedMember)}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Details */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm border-b pb-1 flex items-center gap-1.5">
                        <User className={`w-4 h-4 ${isForest ? 'text-emerald-600' : 'text-blue-600'}`} />
                        Contact & Campus Information
                      </h4>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2.5">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{selectedMember.email || <span className="italic text-gray-400">No email</span>}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{selectedMember.contactNumber || <span className="italic text-gray-400">No number</span>}</span>
                        </div>
                        {selectedMember.messengerHandle && (
                          <div className="flex items-center gap-2.5">
                            <MessageSquare className="w-4 h-4 text-slate-400" />
                            <span>Facebook: <strong className="text-slate-800">{selectedMember.messengerHandle}</strong></span>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{selectedMember.address || 'Manila, Philippines'}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>Birthday: <strong>{(() => {
                            if (!selectedMember.birthday) return 'Not specified';
                            try {
                              const d = new Date(selectedMember.birthday);
                              if (isNaN(d.getTime())) return selectedMember.birthday;
                              return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                            } catch {
                              return selectedMember.birthday;
                            }
                          })()}</strong></span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>Cell Group: <strong>{selectedMember.cellGroupName || 'Unassigned'}</strong></span>
                        </div>
                        {selectedMember.volunteerTeams && (
                          <div className="flex items-start gap-2.5 pt-1">
                            <Shield className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                              {selectedMember.volunteerTeams.split(',').filter(Boolean).map((teamKey) => {
                                const team = VOLUNTEER_TEAMS.find(t => t.key === teamKey);
                                if (!team) return null;
                                return (
                                  <Badge key={teamKey} variant="outline" className="text-[10px] py-0 px-2 font-bold border-emerald-200 bg-emerald-50 text-emerald-800">
                                    {team.label}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Training Milestone checkboxes */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between border-b pb-1">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <BookOpen className={`w-4 h-4 ${isForest ? 'text-emerald-600' : 'text-blue-600'}`} />
                          Training Progress ({getTrainingPercentage(selectedMember)}%)
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5 bg-slate-50 p-4 rounded-xl border">
                        <Progress value={getTrainingPercentage(selectedMember)} className="h-2.5 w-full bg-slate-200" />
                        
                        <div className="space-y-1.5 pt-2">
                          {TRAINING_STEPS.map((step) => {
                            const isCompleted = selectedMember.trainingProgress?.split(',').map(s => s.trim()).includes(step.key);
                            return (
                              <label 
                                key={step.key} 
                                className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer hover:bg-slate-100 p-1.5 rounded transition-colors"
                              >
                                <input 
                                  type="checkbox" 
                                  checked={!!isCompleted} 
                                  onChange={() => handleToggleTrainingStep(step.key)}
                                  className={`w-4 h-4 border-slate-300 rounded ${isForest ? 'text-emerald-600 focus:ring-emerald-500' : 'text-blue-600 focus:ring-blue-500'}`}
                                />
                                <span className={isCompleted ? 'line-through text-slate-400 font-normal' : ''}>
                                  {step.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Achievements & Badges List */}
                    <div className="space-y-3 pt-2">
                      <h4 className="font-bold text-slate-800 text-sm border-b pb-1 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        Achievements & Badges
                      </h4>
                      {getAchievements(selectedMember).length === 0 ? (
                        <div className="text-xs text-slate-400 italic p-4 border rounded-xl bg-slate-50/50 text-center font-semibold">
                          No achievement badges unlocked yet. Keep growing!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {getAchievements(selectedMember).map((ach) => (
                            <div key={ach.key} className={`flex gap-3 items-start p-3 border rounded-xl transition-all shadow-xs ${ach.color}`}>
                              <span className="text-xl shrink-0">{ach.icon}</span>
                              <div>
                                <div className="font-extrabold text-xs">{ach.title}</div>
                                <div className="text-[10px] opacity-80 mt-0.5 leading-relaxed font-semibold">{ach.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                {/* Right Column: Timeline / Notes */}
                <div className="flex flex-col h-full space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm border-b pb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Care Timeline & Follow-up Notes
                  </h4>

                  {/* Add note input */}
                  <div className="space-y-2">
                    <Textarea 
                      placeholder="Type a follow-up log or prayer request..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="text-xs resize-none"
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleAddTimelineNote} className={`${isForest ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold text-xs py-1 h-8`}>
                        Add Timeline Entry
                      </Button>
                    </div>
                  </div>

                  {/* Timeline listing */}
                  <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 space-y-3">
                    {(() => {
                      const notes = selectedMember.notesTimeline 
                        ? JSON.parse(selectedMember.notesTimeline) 
                        : [];
                      
                      // Inject fallback initial note if timeline is empty
                      const allNotes = notes.length > 0 
                        ? notes 
                        : (selectedMember.notes ? [{ date: 'Initial Log', text: selectedMember.notes }] : []);

                      if (allNotes.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-400 text-xs italic">
                            No log events recorded in care timeline yet.
                          </div>
                        );
                      }

                      return (
                        <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-4">
                          {allNotes.map((note: any, idx: number) => (
                            <div key={idx} className="relative">
                              {/* Bullets */}
                              <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-blue-500 border border-white"></span>
                              <div className="text-[10px] font-extrabold text-slate-400">{note.date}</div>
                              <p className="text-xs text-slate-700 mt-0.5 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-lg border">
                                {note.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
              <div className="bg-slate-50 p-4 border-t flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setProfileOpen(false)}>
                  Close Card
                </Button>
                 <Button className={`${isForest ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-md text-xs font-bold`} onClick={() => {
                  setProfileOpen(false);
                  handleEdit(selectedMember);
                }}>
                  Edit Information
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Sticky Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur border border-slate-200 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-6 animate-in slide-in-from-bottom-10 duration-200">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${isForest ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
            <span className="text-sm font-extrabold text-slate-800">{selectedIds.length} members selected</span>
          </div>
          
          <div className="h-6 w-px bg-slate-200"></div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className={`${isForest ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold text-xs`}
              onClick={() => {
                const combined = Array.from(new Set([...cart, ...selectedIds]));
                setCart(combined);
                toast.success(`Added ${selectedIds.length} members to Cart!`);
                setSelectedIds([]);
              }}
            >
              Add Selected to Cart
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="font-bold text-xs hover:bg-slate-50 text-slate-700"
              onClick={() => {
                const updated = cart.filter(id => !selectedIds.includes(id));
                setCart(updated);
                toast.success(`Removed selected members from Cart!`);
                setSelectedIds([]);
              }}
            >
              Remove Selected from Cart
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs hover:bg-slate-100 text-slate-500"
              onClick={() => setSelectedIds([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
