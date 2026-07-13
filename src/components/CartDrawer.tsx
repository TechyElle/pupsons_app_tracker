import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  X, 
  Trash2, 
  FileSpreadsheet, 
  Users, 
  BookOpen, 
  UserCheck, 
  Mail, 
  Calendar, 
  Sparkles, 
  XCircle,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { apiFetch } from '../utils/apiHelper';
import { toast } from 'sonner@2.0.3';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: string[];
  setCart: (ids: string[]) => void;
  themeMode: 'classic' | 'forest';
}

export function CartDrawer({ isOpen, onClose, cart, setCart, themeMode }: CartDrawerProps) {
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [cellGroups, setCellGroups] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Form states for batch actions
  const [batchGroup, setBatchGroup] = useState<string>('');
  const [batchLCSol, setBatchLCSol] = useState<string>('');
  const [batchTraining, setBatchTraining] = useState<string>('');
  const [batchVolunteer, setBatchVolunteer] = useState<string>('');
  const [volunteerAction, setVolunteerAction] = useState<'add' | 'remove'>('add');
  const [batchEvent, setBatchEvent] = useState<string>('');
  
  // Email states
  const [emailSubject, setEmailSubject] = useState<string>('PUP SONs Announcement');
  const [emailBody, setEmailBody] = useState<string>('Dear members,\n\n');

  const isForest = themeMode === 'forest';

  // Load database lists when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, cart]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Members
      const membersRes = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/members`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      const membersData = await membersRes.json();
      if (membersData.success) {
        setAllMembers(membersData.data);
      }

      // 2. Fetch Cell Groups
      const groupsRes = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/cell-groups`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      const groupsData = await groupsRes.json();
      if (groupsData.success) {
        setCellGroups(groupsData.data);
      }

      // 3. Fetch Events
      const eventsRes = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/events`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}` } }
      );
      const eventsData = await eventsRes.json();
      if (eventsData.success) {
        setEvents(eventsData.data);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load database files for cart actions.');
    } finally {
      setLoading(false);
    }
  };

  const cartMembers = allMembers.filter(m => cart.includes(m.id));

  // --- ACTIONS ---

  // Export to CSV
  const handleExportCSV = () => {
    if (cartMembers.length === 0) return;
    
    const headers = ["Name", "Email", "Phone", "Cell Group", "LCSOL Level", "Training Tier", "Volunteer Teams"];
    const rows = cartMembers.map(m => [
      m.name,
      m.email || '',
      m.contactNumber || '',
      m.cellGroupName || '',
      m.lcsolLevel || '',
      m.trainingLevel || '',
      m.volunteerTeams || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sons_database_cart_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  };

  // Bulk Assign Cell Group
  const handleBatchAssignGroup = async () => {
    if (!batchGroup) {
      toast.error("Please select a cell group to assign.");
      return;
    }
    const selectedGroup = cellGroups.find(cg => cg.id === batchGroup);
    if (!selectedGroup) return;

    setIsUpdating(true);
    let successCount = 0;

    try {
      for (const m of cartMembers) {
        const response = await apiFetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/members/${m.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              cellGroupId: selectedGroup.id,
              cellGroupName: selectedGroup.name
            })
          }
        );
        if (response.ok) successCount++;
      }
      toast.success(`Successfully reassigned ${successCount} members to ${selectedGroup.name}!`);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during batch group assignment.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Bulk Update Training Milestones
  const handleBatchUpdateTraining = async () => {
    if (!batchLCSol && !batchTraining) {
      toast.error("Please select at least one training metric to update.");
      return;
    }

    setIsUpdating(true);
    let successCount = 0;

    try {
      for (const m of cartMembers) {
        const updatePayload: any = {};
        if (batchLCSol) updatePayload.lcsolLevel = batchLCSol;
        if (batchTraining) updatePayload.trainingLevel = batchTraining;

        const response = await apiFetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/members/${m.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(updatePayload)
          }
        );
        if (response.ok) successCount++;
      }
      toast.success(`Successfully updated training status for ${successCount} members!`);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during batch training update.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Bulk Volunteer Ministries Properties
  const handleBatchUpdateVolunteers = async () => {
    if (!batchVolunteer) {
      toast.error("Please select a volunteer team to update.");
      return;
    }

    setIsUpdating(true);
    let successCount = 0;

    try {
      for (const m of cartMembers) {
        let currentTeams = m.volunteerTeams ? m.volunteerTeams.split(',').filter(Boolean) : [];
        if (volunteerAction === 'add') {
          if (!currentTeams.includes(batchVolunteer)) {
            currentTeams.push(batchVolunteer);
          }
        } else {
          currentTeams = currentTeams.filter((t: string) => t !== batchVolunteer);
        }
        
        const response = await apiFetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/members/${m.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ volunteerTeams: currentTeams.join(',') })
          }
        );
        if (response.ok) successCount++;
      }
      toast.success(`Successfully updated volunteer teams for ${successCount} members!`);
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during batch volunteer update.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Bulk Add to Event Check-in (CartToEvent)
  const handleBatchAddToEvent = async () => {
    if (!batchEvent) {
      toast.error("Please select an event to check into.");
      return;
    }

    const selectedEvent = events.find(e => e.id === batchEvent);
    if (!selectedEvent) return;

    setIsUpdating(true);
    let successCount = 0;

    try {
      // Get current present members for that event
      let currentPresent = selectedEvent.presentMembers 
        ? selectedEvent.presentMembers.split(',').map((id: string) => id.trim()).filter(Boolean)
        : [];

      // Add all cart members not already checked in
      const toAdd = cartMembers.filter(m => !currentPresent.includes(m.id));
      const updatedPresent = [...currentPresent, ...toAdd.map(m => m.id)];

      const response = await apiFetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/events/${selectedEvent.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            presentMembers: updatedPresent.join(','),
            attendance: updatedPresent.length
          })
        }
      );

      if (response.ok) {
        toast.success(`Successfully checked in ${toAdd.length} members to event: ${selectedEvent.name}!`);
      } else {
        toast.error("Failed to update event attendance.");
      }
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during batch check-in.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Send Bulk Email (BCC native mail client)
  const handleSendBulkEmail = () => {
    const emails = cartMembers.map(m => m.email).filter(Boolean);
    if (emails.length === 0) {
      toast.error("None of the members in the cart have email addresses registered.");
      return;
    }

    const bccString = emails.join(',');
    const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bccString)}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoUrl, '_blank');
    toast.success(`Opened mail client with ${emails.length} email addresses in BCC.`);
  };

  // Bulk Delete
  const handleBatchDelete = async () => {
    if (cartMembers.length === 0) return;
    
    if (!confirm(`Are you absolutely sure you want to delete all ${cartMembers.length} members in the Cart? This will permanently remove them from the database.`)) {
      return;
    }

    setIsUpdating(true);
    let successCount = 0;

    try {
      for (const m of cartMembers) {
        const response = await apiFetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-37669f54/members/${m.id}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${publicAnonKey}` }
          }
        );
        if (response.ok) successCount++;
      }
      toast.success(`Deleted ${successCount} members from the database.`);
      setCart([]);
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("An error occurred during batch deletion.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/60 z-50 transition-opacity duration-300 backdrop-blur-xs ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Slide Drawer panel */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:max-w-2xl bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className={`p-5 border-b flex items-center justify-between text-white ${isForest ? 'bg-emerald-950' : 'bg-blue-950'}`}>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-green-400 animate-pulse" />
            <div>
              <h2 className="font-extrabold text-base tracking-tight">Active Database Cart</h2>
              <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">ChurchCRM Bulk Operations Portal</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${isForest ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500 animate-pulse'}`}>
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-slate-800 font-extrabold text-lg">Your Cart is Empty</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium leading-relaxed">
                Browse the <strong>Members & Officers</strong> roster, select members using their checkboxes, and click 
                <strong>"Add Selected to Cart"</strong> to perform batch updates.
              </p>
              <Button onClick={onClose} variant="outline" className="text-xs font-bold mt-2">
                Close Drawer
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LEFT: CART MEMBER DIRECTORY */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Users className={`w-4 h-4 ${isForest ? 'text-emerald-500' : 'text-blue-500'}`} />
                    Cart Contents ({cartMembers.length})
                  </h4>
                  <button 
                    onClick={() => {
                      setCart([]);
                      toast.info("Database cart cleared.");
                    }} 
                    className="text-[10px] text-red-500 hover:underline font-bold"
                  >
                    Clear All
                  </button>
                </div>

                <div className="border rounded-2xl overflow-hidden max-h-[460px] overflow-y-auto bg-slate-50/30">
                  <Table>
                    <TableHeader className="bg-slate-50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="font-bold text-slate-700 text-xs py-2 h-auto">Member</TableHead>
                        <TableHead className="font-bold text-slate-700 text-xs py-2 h-auto">Cell Group</TableHead>
                        <TableHead className="text-right font-bold text-slate-700 text-xs py-2 h-auto">Rem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartMembers.map(member => (
                        <TableRow key={member.id} className="hover:bg-slate-50/50">
                          <TableCell className="py-2.5">
                            <div>
                              <div className="font-bold text-slate-800 text-xs">{member.name}</div>
                              <div className="text-[9px] text-slate-400 font-semibold">{member.leadershipStatus}</div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 text-xs font-medium text-slate-600">
                            {member.cellGroupName || <span className="text-slate-400 italic">None</span>}
                          </TableCell>
                          <TableCell className="py-2.5 text-right">
                            <button
                              onClick={() => {
                                setCart(cart.filter(id => id !== member.id));
                                toast.info(`${member.name} removed from cart.`);
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* RIGHT: BATCH UTILITIES */}
              <div className="space-y-5">
                <h4 className="text-slate-800 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Bulk Action Panel
                </h4>

                {/* 1. Export CSV */}
                <div className="space-y-1.5 p-3 border rounded-xl bg-slate-50/50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Data Exports</div>
                  <Button 
                    onClick={handleExportCSV}
                    disabled={isUpdating}
                    className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold h-9"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Export Cart to CSV
                  </Button>
                </div>

                {/* 2. Assign Cell Group */}
                <div className="space-y-1.5 p-3 border rounded-xl bg-slate-50/50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Cell Roster Assignment</div>
                  <div className="flex gap-2">
                    <Select value={batchGroup} onValueChange={setBatchGroup}>
                      <SelectTrigger className="flex-1 bg-white border h-9 text-xs">
                        <SelectValue placeholder="Select Group" />
                      </SelectTrigger>
                      <SelectContent>
                        {cellGroups.map(cg => (
                          <SelectItem key={cg.id} value={cg.id} className="text-xs">{cg.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleBatchAssignGroup}
                      disabled={isUpdating || !batchGroup}
                      className={`text-white text-xs font-bold shrink-0 h-9 px-3 ${isForest ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      Assign
                    </Button>
                  </div>
                </div>

                {/* 3. Training & SOL */}
                <div className="space-y-2 p-3 border rounded-xl bg-slate-50/50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Training & SOL Tier</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={batchLCSol} onValueChange={setBatchLCSol}>
                      <SelectTrigger className="bg-white border h-9 text-xs">
                        <SelectValue placeholder="LCSOL Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None" className="text-xs">None</SelectItem>
                        <SelectItem value="LCSOL 1" className="text-xs">LCSOL 1</SelectItem>
                        <SelectItem value="LCSOL 2" className="text-xs">LCSOL 2</SelectItem>
                        <SelectItem value="LCSOL 3" className="text-xs">LCSOL 3</SelectItem>
                        <SelectItem value="LCSOL 4" className="text-xs">LCSOL 4</SelectItem>
                        <SelectItem value="LCSOL 5" className="text-xs">LCSOL 5</SelectItem>
                        <SelectItem value="LCSOL 6" className="text-xs">LCSOL 6</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={batchTraining} onValueChange={setBatchTraining}>
                      <SelectTrigger className="bg-white border h-9 text-xs">
                        <SelectValue placeholder="Training Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None" className="text-xs">None</SelectItem>
                        <SelectItem value="Foundational" className="text-xs">Foundational</SelectItem>
                        <SelectItem value="Intermediate" className="text-xs">Intermediate</SelectItem>
                        <SelectItem value="Advanced" className="text-xs">Advanced</SelectItem>
                        <SelectItem value="Leadership" className="text-xs">Leadership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleBatchUpdateTraining}
                    disabled={isUpdating || (!batchLCSol && !batchTraining)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold h-9"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Update Training Status
                  </Button>
                </div>

                {/* 4. Volunteer Teams (Properties) */}
                <div className="space-y-2 p-3 border rounded-xl bg-slate-50/50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Volunteer Ministry Tags</div>
                  <div className="flex rounded-lg bg-white p-0.5 border text-xs gap-1">
                    <button 
                      onClick={() => setVolunteerAction('add')}
                      className={`flex-1 py-1 rounded-md font-bold text-[10px] transition-all ${volunteerAction === 'add' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      Add Tag
                    </button>
                    <button 
                      onClick={() => setVolunteerAction('remove')}
                      className={`flex-1 py-1 rounded-md font-bold text-[10px] transition-all ${volunteerAction === 'remove' ? 'bg-red-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      Remove Tag
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Select value={batchVolunteer} onValueChange={setBatchVolunteer}>
                      <SelectTrigger className="flex-1 bg-white border h-9 text-xs">
                        <SelectValue placeholder="Ministry Team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="worship" className="text-xs">Worship Ministry</SelectItem>
                        <SelectItem value="media" className="text-xs">Media & Creatives</SelectItem>
                        <SelectItem value="logistics" className="text-xs">Logistics & Ushering</SelectItem>
                        <SelectItem value="outreach" className="text-xs">Evangelism & Outreach</SelectItem>
                        <SelectItem value="intercession" className="text-xs">Prayer & Intercessory</SelectItem>
                        <SelectItem value="secretariat" className="text-xs">Secretariat & Comms</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleBatchUpdateVolunteers}
                      disabled={isUpdating || !batchVolunteer}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-9 shrink-0"
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {/* 5. Check-in to Event (New!) */}
                <div className="space-y-1.5 p-3 border rounded-xl bg-slate-50/50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Batch Event Check-in</div>
                  <div className="flex gap-2">
                    <Select value={batchEvent} onValueChange={setBatchEvent}>
                      <SelectTrigger className="flex-1 bg-white border h-9 text-xs">
                        <SelectValue placeholder="Select Event/Meeting" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map(ev => (
                          <SelectItem key={ev.id} value={ev.id} className="text-xs">
                            {ev.name} ({ev.date})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleBatchAddToEvent}
                      disabled={isUpdating || !batchEvent}
                      className={`text-white text-xs font-bold shrink-0 h-9 px-3 ${isForest ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      Check-in
                    </Button>
                  </div>
                </div>

                {/* 6. Send Bulk Email (New!) */}
                <div className="space-y-2.5 p-3 border rounded-xl bg-slate-50/50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Send Cart Announcement</div>
                  <div className="space-y-2">
                    <Input 
                      placeholder="Email Subject" 
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="bg-white text-xs h-8"
                    />
                    <Textarea 
                      placeholder="Draft announcement message..." 
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="bg-white text-xs min-h-[60px]"
                    />
                    <Button 
                      onClick={handleSendBulkEmail}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-9"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Open Bulk Email Client
                    </Button>
                  </div>
                </div>

                {/* 7. Destructive actions */}
                <div className="space-y-1.5 p-3 border border-red-100 rounded-xl bg-red-50/20">
                  <div className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Danger Zone</div>
                  <Button 
                    onClick={handleBatchDelete}
                    disabled={isUpdating}
                    variant="destructive"
                    className="w-full text-xs font-bold h-9"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All Selected Members
                  </Button>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t bg-slate-50 flex items-center justify-between text-xs text-slate-400 font-semibold rounded-b-2xl">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Selection remains cached until manually cleared.
          </span>
          <Button onClick={onClose} size="sm" variant="ghost" className="text-slate-600 font-bold hover:bg-slate-100 text-xs">
            Close Cart
          </Button>
        </div>

      </div>
    </>
  );
}
