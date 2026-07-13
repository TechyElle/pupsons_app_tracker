import React, { useState } from 'react';
import { Tabs, TabsContent } from './components/ui/tabs';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  BarChart3, 
  BookOpen, 
  Heart, 
  ClipboardList, 
  Bot, 
  Menu, 
  X, 
  Activity,
  FileSpreadsheet,
  Palette,
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Plus
} from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { CellGroupsModule } from './components/CellGroupsModule';
import { MembersModule } from './components/MembersModule';
import { WeeklyTrackerModule } from './components/WeeklyTrackerModule';
import { TrainingModule } from './components/TrainingModule';
import { FundraisingModule } from './components/FundraisingModule';
import { ContentCalendarModule } from './components/ContentCalendarModule';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { EvangelismModule } from './components/EvangelismModule';
import { MeetingMinutesModule } from './components/MeetingMinutesModule';
import { GeminiModule } from './components/GeminiModule';
import { SpreadsheetReportsModule } from './components/SpreadsheetReportsModule';
import { CartDrawer } from './components/CartDrawer';
import { LoginPage } from './components/LoginPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('sons_session') === 'active';
    } catch {
      return false;
    }
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  
  // Theme state: classic (blue) vs forest (emerald)
  const [themeMode, setThemeMode] = useState<'classic' | 'forest'>(() => {
    try {
      const saved = localStorage.getItem('sons_theme');
      return (saved as 'classic' | 'forest') || 'classic';
    } catch {
      return 'classic';
    }
  });

  const [cart, setCart] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sons_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSetCart = (newCart: string[]) => {
    setCart(newCart);
    localStorage.setItem('sons_cart', JSON.stringify(newCart));
  };

  const handleSetTheme = (newTheme: 'classic' | 'forest') => {
    setThemeMode(newTheme);
    localStorage.setItem('sons_theme', newTheme);
  };

  const isForest = themeMode === 'forest';

  const handleSignIn = () => {
    try {
      sessionStorage.setItem('sons_session', 'active');
    } catch {
      // Continue even when storage is unavailable.
    }
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginPage onSignIn={handleSignIn} />;
  }

  const navigationItems = [
    { value: 'dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-blue-500 hover:bg-blue-50' },
    { value: 'cellgroups', label: 'Cell Groups', icon: Users, color: 'text-indigo-500 hover:bg-indigo-50' },
    { value: 'members', label: 'Members & Officers', icon: Users, color: 'text-purple-500 hover:bg-purple-50' },
    { value: 'sheets', label: 'Database Sheets', icon: FileSpreadsheet, color: 'text-emerald-600 hover:bg-emerald-50' },
    { value: 'weekly', label: 'Weekly Tracker', icon: Calendar, color: 'text-green-500 hover:bg-green-50' },
    { value: 'evangelism', label: 'Evangelism', icon: Heart, color: 'text-red-500 hover:bg-red-50' },
    { value: 'training', label: 'Training & SOL', icon: BookOpen, color: 'text-orange-500 hover:bg-orange-50' },
    { value: 'fundraising', label: 'Finances & Campaigns', icon: DollarSign, color: 'text-emerald-500 hover:bg-emerald-50' },
    { value: 'content', label: 'Content Strategy', icon: FileText, color: 'text-pink-500 hover:bg-pink-50' },
    { value: 'minutes', label: 'Minutes of Meeting', icon: ClipboardList, color: 'text-amber-500 hover:bg-amber-50' },
    { value: 'gemini', label: 'Gemini AI Assistant', icon: Bot, color: 'text-teal-500 hover:bg-teal-50' },
  ];

  const getActiveTabTitle = () => {
    const item = navigationItems.find(item => item.value === activeTab);
    return item ? item.label : 'PUP Seeds of the Nations';
  };

  return (
    <div className="teamhub-shell min-h-screen flex flex-col md:flex-row">
      <Toaster position="top-right" richColors />

      {/* Mobile Top Bar */}
      <header className="teamhub-mobile-header py-4 px-4 flex items-center justify-between md:hidden text-white">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-400 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">PUP SONs</h1>
            <p className="text-xs text-blue-200">Cell Group Tracker</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Mobile Cart Button */}
          <button 
            onClick={() => setCartDrawerOpen(true)}
            className="p-1.5 hover:bg-white/10 rounded-xl relative text-white flex items-center gap-1"
          >
            <span className="text-base">🛒</span>
            {cart.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-white text-[9px] font-black animate-pulse ${isForest ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                {cart.length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 hover:bg-white/10 rounded-md transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside className={`teamhub-sidebar
        fixed inset-y-0 left-0 z-50 w-72 text-slate-100 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:z-auto
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Brand Header */}
          <div className="teamhub-brand p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="teamhub-mark w-10 h-10 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">PUP SONs</h1>
                <p className="text-xs text-emerald-100/75 font-medium">TeamHub Admin</p>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 hover:bg-white/10 rounded-md md:hidden transition-colors"
            >
              <X className="w-5 h-5 text-slate-200" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="teamhub-nav p-4 space-y-1">
            <div className="teamhub-brand-chip mb-3 mx-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-50/90">
              <Activity className="h-3.5 w-3.5" />
              HR Team Management
            </div>
            <p className="teamhub-nav-label px-3 pt-1 pb-2">Workspace</p>
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.value;
              return (
                <React.Fragment key={item.value}>
                {index === 4 && <p className="teamhub-nav-label px-3 pt-5 pb-2">Management</p>}
                <button
                  onClick={() => {
                    setActiveTab(item.value);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 group
                    ${isActive 
                      ? 'teamhub-nav-active text-white'
                      : 'text-emerald-50/70 hover:text-white hover:bg-white/8'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-emerald-100/70'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.value === 'fundraising' && cart.length > 0 && (
                    <span className="bg-emerald-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse">
                      {cart.length}
                    </span>
                  )}
                </button>
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="teamhub-sidebar-footer p-4 space-y-3">
          <div className="teamhub-user-card rounded-2xl border border-white/10 bg-black/10 p-3">
            <div className="flex items-center gap-3">
              <div className="teamhub-avatar w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm">
                SONS
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Platform Role</p>
                <p className="text-sm text-slate-200 font-bold">Administrator</p>
              </div>
            </div>
          </div>

          {/* Theme Toggle Selector */}
          <div className="teamhub-theme-toggle pt-3 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              Theme Mode
            </span>
            <div className="flex rounded-lg p-0.5 border border-white/10 bg-black/10">
              <button 
                onClick={() => handleSetTheme('classic')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all text-[10px] ${themeMode === 'classic' ? 'bg-white text-emerald-950 shadow-xs' : 'text-emerald-100/70 hover:text-white'}`}
              >
                Classic
              </button>
              <button 
                onClick={() => handleSetTheme('forest')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all text-[10px] ${themeMode === 'forest' ? 'bg-white text-emerald-950 shadow-xs' : 'text-emerald-100/70 hover:text-white'}`}
              >
                Forest
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Content */}
      <main className="teamhub-main flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Top Header - Desktop Only */}
        <header className="teamhub-topbar hidden md:flex sticky top-0 z-40 px-8 py-4 flex-row items-center justify-between">
          <div>
            <div className="teamhub-breadcrumb flex items-center gap-2 text-[11px] font-semibold text-slate-400 mb-1">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>SONS Database</span><span>/</span><span className="text-emerald-700">Overview</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{getActiveTabTitle()}</h2>
              <span className="teamhub-pill rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                Updated 6m ago
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="teamhub-search hidden lg:flex items-center gap-2">
              <Search className="w-4 h-4" />
              <input aria-label="Search the database" placeholder="Search anything..." />
              <kbd>⌘ K</kbd>
            </label>
            <button aria-label="Notifications" className="teamhub-icon-button relative">
              <Bell className="w-4 h-4" />
              <span className="teamhub-notification-dot" />
            </button>
            <button 
              onClick={() => setCartDrawerOpen(true)}
              className="teamhub-cart relative px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New report</span>
              <span className="px-2 py-0.5 rounded-full text-white text-[10px] font-black bg-emerald-700">
                {cart.length}
              </span>
            </button>
            <button className="teamhub-profile flex items-center gap-2 pl-2 ml-1">
              <span className="teamhub-profile-image">S</span>
              <span className="hidden xl:block text-left leading-tight"><strong>SONS Admin</strong><small>Administrator</small></span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <div className="teamhub-workspace flex-1 p-6 md:p-8">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="dashboard" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <AnalyticsDashboard themeMode={themeMode} />
            </TabsContent>

            <TabsContent value="cellgroups" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <CellGroupsModule themeMode={themeMode} />
            </TabsContent>

            <TabsContent value="members" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <MembersModule cart={cart} setCart={handleSetCart} themeMode={themeMode} />
            </TabsContent>

            <TabsContent value="sheets" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <SpreadsheetReportsModule themeMode={themeMode} />
            </TabsContent>

            <TabsContent value="weekly" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <WeeklyTrackerModule themeMode={themeMode} />
            </TabsContent>

            <TabsContent value="evangelism" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <EvangelismModule themeMode={themeMode} />
            </TabsContent>

            <TabsContent value="training" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <TrainingModule themeMode={themeMode} />
            </TabsContent>

            <TabsContent value="fundraising" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <FundraisingModule themeMode={themeMode} />
            </TabsContent>

            <TabsContent value="content" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <ContentCalendarModule themeMode={themeMode} />
            </TabsContent>

            <TabsContent value="minutes" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <MeetingMinutesModule themeMode={themeMode} />
            </TabsContent>

            <TabsContent value="gemini" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <GeminiModule themeMode={themeMode} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Slide-out Database Cart Drawer */}
      <CartDrawer 
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        setCart={handleSetCart}
        themeMode={themeMode}
      />
    </div>
  );
}
