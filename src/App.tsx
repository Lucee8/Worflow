/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { loadState, saveState, AppState } from './db/store';
import { User, Customer, Order, StatusLog } from './types';

// Component imports
import SimulationHUD from './components/SimulationHUD';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import DashboardTab from './components/DashboardTab';
import OrdersTab from './components/OrdersTab';
import OrderForm from './components/OrderForm';
import OrderDetailsView from './components/OrderDetailsView';
import CalendarTab from './components/CalendarTab';
import UsersTab from './components/UsersTab';
import WorkerDashboard from './components/WorkerDashboard';

// Utility icons
import { HardHat, SlidersHorizontal, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';

export default function App() {
  // Database store loader state
  const [db, setDb] = React.useState<AppState>(() => loadState());
  const [currentTab, setCurrentTab] = React.useState<string>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(null);

  // Active simulated user session (start as null to show login page by default)
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);

  // Save database shifts on mutations
  const updateDbState = (newDb: AppState) => {
    setDb(newDb);
    saveState(newDb);
  };

  // Wire automatic login bypasses when role-swapping in HUD
  const handleHUDUserSwitch = (user: User) => {
    setCurrentUser(user);
    // Automatically navigate to correct tab
    if (user.role === 'admin') {
      setCurrentTab('dashboard');
    } else {
      setCurrentTab('my_orders');
    }
    setSelectedOrderId(null);
  };

  const handleResetDB = () => {
    if (window.confirm('Reset workshop demo database to factory defaults?')) {
      localStorage.removeItem('bhise_workshop_tracker_db');
      const fresh = loadState();
      setDb(fresh);
      setCurrentUser(fresh.users[0]);
      setCurrentTab('dashboard');
      setSelectedOrderId(null);
      alert('Local database re-seeded successfully.');
    }
  };

  // Simulation viewport helper state (handled in HUD)
  const [simWidth] = React.useState<string>('100%');

  // Trigger login from screen
  const handleLoginSuccess = (matched: User) => {
    setCurrentUser(matched);
    if (matched.role === 'admin') {
      setCurrentTab('dashboard');
    } else {
      setCurrentTab('my_orders');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  // Staging CRUD updates actions
  const handleSaveOrder = (newOrder: Order, newCustomer?: Customer) => {
    const updatedOrders = [newOrder, ...db.orders];
    let updatedCusts = [...db.customers];
    if (newCustomer) {
      updatedCusts = [newCustomer, ...db.customers];
    }

    // Auto log creations phase
    const log: StatusLog = {
      id: 'log_' + Math.random().toString(36).substring(2, 9),
      order_id: newOrder.id,
      stage: 'Pending',
      changed_by: currentUser?.id || 'admin',
      changed_by_name: currentUser?.name || 'Admin',
      changed_by_role: currentUser?.role || 'admin',
      timestamp: new Date().toISOString(),
      note: `Bespoke furniture order registered. Previewing Article Code: ${newOrder.article_no}.`,
    };

    const updatedLogs = [log, ...db.statusLogs];

    updateDbState({
      ...db,
      orders: updatedOrders,
      customers: updatedCusts,
      statusLogs: updatedLogs,
    });

    setCurrentTab('orders'); // Jump back to listings tab
    alert(`Success: Order registered! Article NO is ${newOrder.article_no}`);
  };

  const handleUpdateOrder = (updatedOrder: Order, newLog?: StatusLog) => {
    const freshOrders = db.orders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
    let freshLogs = [...db.statusLogs];
    if (newLog) {
      freshLogs = [newLog, ...db.statusLogs];
    }

    updateDbState({
      ...db,
      orders: freshOrders,
      statusLogs: freshLogs,
    });
  };

  const handleAddUser = (newUser: User) => {
    const updatedUsers = [...db.users, newUser];
    updateDbState({
      ...db,
      users: updatedUsers,
    });
  };

  const handleUpdateUser = (updatedUser: User) => {
    const updatedUsers = db.users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    updateDbState({
      ...db,
      users: updatedUsers,
    });

    // Check if updating currently simulated user
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  // Nav to specific order details tab
  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentTab('order_details');
  };

  // If logged out entirely, render promotional Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-stone-100/50 relative">
        <SimulationHUD
          users={db.users}
          currentUser={null}
          onUserChange={handleHUDUserSwitch}
          onReset={handleResetDB}
        />
        <div className="mx-auto transition-all" style={{ maxWidth: simWidth }}>
          <LoginScreen onLoginSuccess={handleLoginSuccess} users={db.users} />
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col relative transition-all duration-300">
      
      {/* Simulation HUD (Sandbox Controls) */}
      <SimulationHUD
        users={db.users}
        currentUser={currentUser}
        onUserChange={handleHUDUserSwitch}
        onReset={handleResetDB}
      />

      {/* Main Sandbox limits wrapper */}
      <div className="mx-auto w-full transition-all duration-300 flex-1 flex flex-col lg:flex-row" style={{ maxWidth: simWidth }}>
        
        {/* Responsive Side Menu Drawer */}
        <Sidebar
          currentUser={currentUser}
          currentTab={currentTab}
          onTabChange={(tab) => {
            setSelectedOrderId(null);
            setCurrentTab(tab);
          }}
          onLogout={handleLogout}
          notificationsCount={db.orders.filter(o => o.current_status === 'Pending').length}
        />

        {/* Dynamic Inner Application Page Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-20 lg:pb-8">
          
          {/* TAB: DASHBOARD VIEW (Admin Only) */}
          {currentTab === 'dashboard' && isAdmin && (
            <DashboardTab
              orders={db.orders}
              users={db.users}
              customers={db.customers}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onViewOrder={handleViewOrder}
            />
          )}

          {/* TAB: ORDERS DIRECTORY LISTINGS (Admin Only) */}
          {currentTab === 'orders' && isAdmin && (
            <OrdersTab
              orders={db.orders}
              users={db.users}
              customers={db.customers}
              onViewOrder={handleViewOrder}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              isAdmin={isAdmin}
            />
          )}

          {/* TAB: CREATE NEW CUSTOM SERIAL ORDER (Wizard Form, Admin Only) */}
          {currentTab === 'create_order' && isAdmin && (
            <OrderForm
              orders={db.orders}
              users={db.users}
              customers={db.customers}
              onSave={handleSaveOrder}
              onCancel={() => setCurrentTab('orders')}
            />
          )}

          {/* TAB: CALENDAR DEADLINES TRACKING (Admin Only) */}
          {currentTab === 'calendar' && isAdmin && (
            <CalendarTab
              orders={db.orders}
              customers={db.customers}
              onViewOrder={handleViewOrder}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {/* TAB: TEAM MEMBERS DIRECTORY ROSTERS (Admin Only) */}
          {currentTab === 'users' && isAdmin && (
            <UsersTab
              users={db.users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              currentUser={currentUser}
            />
          )}

          {/* TAB: REPORTS GRAPHS VIEW (Simulated, Admin Only) */}
          {currentTab === 'reports' && isAdmin && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">Workshop Reports</h1>
                <p className="text-stone-500 text-xs">Deep dive monthly volume logs and staff workload capacities</p>
              </div>
              <div className="bg-white p-12 text-center rounded-2xl border border-stone-200">
                <SlidersHorizontal size={28} className="mx-auto text-stone-300 mb-2" />
                <p className="text-xs font-bold text-stone-550">Analytical dashboards are loaded automatically inside the workshop database.</p>
                <button onClick={() => setCurrentTab('dashboard')} className="mt-4 px-4 py-1.5 bg-[#593622] hover:bg-[#402414] text-white font-bold text-xs rounded-xl">
                  Go back to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS & PARAMETERS (Simulated, Admin Only) */}
          {currentTab === 'settings' && isAdmin && (
            <div className="space-y-6 font-sans">
              <div>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">Staging Settings</h1>
                <p className="text-stone-500 text-xs">Configure custom furniture category templates and alert thresholds</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-4">
                <strong className="text-stone-850 text-xs block font-bold uppercase tracking-wider">SMS & WhatsApp Alerts Gateway</strong>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <strong className="block text-stone-800 text-xs">On creation: Send welcome link</strong>
                      <span className="text-[10px] text-stone-400 block font-normal">Triggers private tracking URL automatically on WhatsApp</span>
                    </div>
                    <span className="h-5 w-9 bg-green-500 rounded-full flex items-center px-1 font-bold"><span className="h-4.5 w-4.5 bg-white rounded-full ml-auto" /></span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <strong className="block text-stone-800 text-xs">On QC Failure: Alert technician</strong>
                      <span className="text-[10px] text-stone-400 block font-normal">Sends immediate SMS alerts to assigned carpenters containing notes</span>
                    </div>
                    <span className="h-5 w-9 bg-green-500 rounded-full flex items-center px-1 font-bold"><span className="h-4.5 w-4.5 bg-white rounded-full ml-auto" /></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WORKER ASSIGNED WORKBENCH (Carpenter or Polish Person Only) */}
          {currentTab === 'my_orders' && !isAdmin && (
            <WorkerDashboard
              currentUser={currentUser}
              orders={db.orders}
              customers={db.customers}
              statusLogs={db.statusLogs}
              onUpdateOrder={handleUpdateOrder}
            />
          )}

          {/* TAB: PROFILE PAGE (Carpenter or Polish Person Only) */}
          {currentTab === 'profile' && !isAdmin && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-stone-900 tracking-tight font-display">My Team Member Settings</h1>
                <p className="text-stone-500 text-xs">Review personal workload, telephone details, and workshop credentials</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-stone-250 max-w-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-500 font-extrabold text-[#1a110a] text-sm tracking-wide rounded-full flex items-center justify-center">
                    {currentUser.initials}
                  </div>
                  <div>
                    <strong className="text-stone-900 text-xs text-sm block font-bold">{currentUser.name}</strong>
                    <span className="text-[10px] uppercase font-mono text-stone-450 block font-black">{currentUser.role.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="text-xs space-y-1 text-stone-500 border-t pt-3 font-sans">
                  <div className="flex justify-between">
                    <span>Active Level:</span>
                    <strong className="text-green-600">ACTIVE</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact Line:</span>
                    <strong className="text-stone-800">{currentUser.phone || '—'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned Serial initials:</span>
                    <strong className="text-stone-900 font-mono">{currentUser.initials}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW TAB (Admin Only / Deep view): FULL SPEC SHEET & DETAILS */}
          {currentTab === 'order_details' && selectedOrderId && (
            <OrderDetailsView
              orderId={selectedOrderId}
              orders={db.orders}
              users={db.users}
              customers={db.customers}
              statusLogs={db.statusLogs}
              onBack={() => {
                setSelectedOrderId(null);
                setCurrentTab(isAdmin ? 'orders' : 'my_orders');
              }}
              onUpdateOrder={handleUpdateOrder}
              currentUser={currentUser}
            />
          )}

        </main>
      </div>
    </div>
  );
}
