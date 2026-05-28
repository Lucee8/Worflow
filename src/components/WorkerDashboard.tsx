/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Order, Customer, User, StatusLog, OrderStage } from '../types';
import { generateUUID } from '../db/store';
import { Clock, Eye, AlertCircle, CheckCircle, Upload, ArrowLeft, Image as ImageIcon, Camera } from 'lucide-react';

interface WorkerDashboardProps {
  currentUser: User;
  orders: Order[];
  customers: Customer[];
  statusLogs: StatusLog[];
  onUpdateOrder: (updatedOrder: Order, newLog?: StatusLog) => void;
}

export default function WorkerDashboard({
  currentUser,
  orders,
  customers,
  statusLogs,
  onUpdateOrder,
}: WorkerDashboardProps) {
  const isCarpenter = currentUser.role === 'carpenter';
  const myStage: OrderStage = isCarpenter ? 'Carpentry' : 'Polish';

  // Filter orders assigned to this worker
  const myOrders = orders.filter((o) => {
    if (isCarpenter) {
      return o.carpenter_id === currentUser.id;
    } else {
      // Polish person sees work only after carpentry passes QC Check 1
      return o.polish_person_id === currentUser.id && o.current_status !== 'Pending' && o.current_status !== 'Design' && o.current_status !== 'Carpentry' && o.current_status !== 'QC Check 1';
    }
  });

  // State: selected order for active edit
  const [activeOrder, setActiveOrder] = React.useState<Order | null>(null);

  // Form States for updating status (Section 5 and 6)
  const [progressStatus, setProgressStatus] = React.useState<'in_progress' | 'completed'>('in_progress');
  const [updateNotes, setUpdateNotes] = React.useState('');
  const [inProgressFiles, setInProgressFiles] = React.useState<string[]>([]);
  const [simulateUrlInput, setSimulateUrlInput] = React.useState('');

  const handleOpenUpdate = (ord: Order) => {
    setActiveOrder(ord);
    setProgressStatus(ord.current_status === myStage ? 'in_progress' : 'completed');
    setUpdateNotes('');
    setInProgressFiles(ord.images.filter(img => img.type === 'In-Progress').map(img => img.url));
  };

  const handleAddPhotos = () => {
    if (simulateUrlInput && simulateUrlInput.startsWith('http')) {
      setInProgressFiles([...inProgressFiles, simulateUrlInput]);
      setSimulateUrlInput('');
    } else {
      alert('Please enter a valid HTTP image path url, e.g. https://images.unsplash.com/photo-1595428774223-ef52624120d2');
    }
  };

  const handleSaveStagingUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    if (activeOrder.current_status !== myStage) {
      alert(`Access denied: You are assigned, but you can update order files and stage only during the "${myStage}" stage.`);
      return;
    }

    const nextStage: OrderStage = progressStatus === 'completed'
      ? (isCarpenter ? 'QC Check 1' : 'QC Check 2')
      : myStage;

    const log: StatusLog = {
      id: 'log_' + generateUUID().split('-')[0],
      order_id: activeOrder.id,
      stage: nextStage,
      changed_by: currentUser.id,
      changed_by_name: currentUser.name,
      changed_by_role: currentUser.role,
      timestamp: new Date().toISOString(),
      note: updateNotes || `${currentUser.name} logged progress update: status set to "${progressStatus === 'completed' ? 'Completed' : 'In Progress'}".`,
    };

    // Reconstruct order images with newly uploaded list
    const existingOtherImages = activeOrder.images.filter(img => img.type !== 'In-Progress');
    const newInProgressImages = inProgressFiles.map(url => ({
      id: 'img_' + generateUUID().split('-')[0],
      url,
      type: 'In-Progress' as const,
      uploaded_at: new Date().toISOString(),
      uploaded_by: currentUser.name,
    }));

    const updatedOrder: Order = {
      ...activeOrder,
      current_status: nextStage,
      images: [...existingOtherImages, ...newInProgressImages],
      updated_at: new Date().toISOString(),
    };

    onUpdateOrder(updatedOrder, log);
    setActiveOrder(null);
    alert(`Success: Staging status saved. Order advanced to "${nextStage}".`);
  };

  if (activeOrder) {
    // --- MODE B: UPDATE STATUS PAGE LAYOUT ---
    const activeCust = customers.find((c) => c.id === activeOrder.customer_id);
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header navigation back */}
        <button
          onClick={() => setActiveOrder(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition"
        >
          <ArrowLeft size={14} /> Back to workbench listings
        </button>

        <div className="pb-2 border-b border-stone-200">
          <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight font-display">Update Technical Status</h1>
          <p className="text-stone-500 text-xs">Verify measurements, log notes, and upload floor completion photographs</p>
        </div>

        {/* Dynamic Splits design columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left specification summarizations column */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4 font-sans text-xs">
            <h3 className="font-display font-black text-stone-900 text-sm border-b border-stone-100 pb-2">Order Information Details</h3>
            
            <div className="space-y-3.5 leading-relaxed text-stone-600">
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase">Article Number</span>
                <strong className="text-stone-900 text-sm font-mono mt-0.5 block tracking-wide">{activeOrder.article_no}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase">Customer Match</span>
                <strong className="text-stone-850 text-xs block mt-0.5">{activeCust?.name || 'Walkin Customer'}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase">Goal Delivery deadline</span>
                <strong className="text-stone-850 text-xs block font-mono mt-0.5">{activeOrder.delivery_date}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase">Current workshop Stage</span>
                <span className="px-2 py-0.5 mt-1 rounded bg-stone-150 text-stone-700 font-bold text-[10px] block border w-fit">
                  {activeOrder.current_status}
                </span>
              </div>
            </div>
          </div>

          {/* Right actual Update Status inputs panel column matching screenshot 2 */}
          <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
            <form onSubmit={handleSaveStagingUpdate} className="space-y-6 text-xs text-stone-600">
              
              {/* Radios inputs matching completed states */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider font-sans">Progress Status *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`border rounded-xl p-3.5 flex items-center gap-3 cursor-pointer transition ${
                      progressStatus === 'in_progress'
                        ? 'bg-amber-50/40 border-amber-500 ring-2 ring-amber-500/10 text-amber-900'
                        : 'bg-stone-50 border-stone-200 text-stone-550'
                    }`}
                  >
                    <input
                      type="radio"
                      name="progressRadios"
                      checked={progressStatus === 'in_progress'}
                      onChange={() => setProgressStatus('in_progress')}
                      className="text-amber-700 focus:ring-amber-500 font-bold shrink-0 cursor-pointer"
                    />
                    <div>
                      <strong className="text-xs block font-sans">In Progress</strong>
                      <span className="text-[10px] text-stone-400 font-medium font-sans">Continue work on active cabinetry floor cutting</span>
                    </div>
                  </label>

                  <label
                    className={`border rounded-xl p-3.5 flex items-center gap-3 cursor-pointer transition ${
                      progressStatus === 'completed'
                        ? 'bg-green-50/40 border-green-500 ring-2 ring-green-500/10 text-green-900'
                        : 'bg-stone-50 border-stone-200 text-stone-550'
                    }`}
                  >
                    <input
                      type="radio"
                      name="progressRadios"
                      checked={progressStatus === 'completed'}
                      onChange={() => setProgressStatus('completed')}
                      className="text-green-700 focus:ring-green-500 font-bold shrink-0 cursor-pointer"
                    />
                    <div>
                      <strong className="text-xs block font-sans">
                        Completed (Move to {isCarpenter ? 'QC Check 1' : 'QC Check 2'})
                      </strong>
                      <span className="text-[10px] text-stone-400 font-medium font-sans">Mark department task finished successfully</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Add Progress notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-widest mb-1.5 font-sans">Add Notes *</label>
                <textarea
                  rows={3}
                  required
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Describe details: carcass work completed. Ready for QC. Materials cut sizes check passed."
                  className="w-full p-3 bg-stone-50 border border-stone-250 focus:border-[#593622] rounded-xl text-xs focus:outline-none font-semibold text-stone-850"
                />
              </div>

              {/* Upload dynamic live photos (Simulated Paste url) */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-widest font-sans">Upload progress photographs</label>
                
                <div className="flex gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <input
                    type="text"
                    value={simulateUrlInput}
                    onChange={(e) => setSimulateUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-1595..."
                    className="flex-1 px-3 py-2 bg-white border border-stone-250 rounded-lg focus:outline-none focus:border-[#593622] font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotos}
                    className="bg-[#593622] text-white hover:bg-[#402414] px-4 py-2 font-bold rounded-lg text-xs transition shrink-0"
                  >
                    Add Photo
                  </button>
                </div>

                {/* Grid gallery of files uploaded */}
                {inProgressFiles.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {inProgressFiles.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-stone-200">
                        <img referrerPolicy="no-referrer" src={url} alt="Uploaded" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          onClick={() => setInProgressFiles(inProgressFiles.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded font-bold"
                          title="delete"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 border-2 border-dashed border-stone-250 rounded-xl flex flex-col items-center justify-center text-stone-400 select-none">
                    <Camera size={24} className="text-stone-300 mb-1" />
                    <p className="font-bold text-stone-500">No completion photographs present</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">Please add a simulated image link above to inspect progress.</p>
                  </div>
                )}
              </div>

              {/* Action save brown button */}
              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-2.5 border rounded-xl text-stone-500 font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activeOrder.current_status !== myStage}
                  className="bg-[#593622] hover:bg-[#402414] disabled:opacity-50 text-white font-black px-5 py-2.5 rounded-xl shadow transition text-xs"
                >
                  Save Update
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    );
  }

  // --- MODE A: LISTING WINDOW ---
  return (
    <div className="space-y-6">
      
      {/* Worker workbench Header details block */}
      <div>
        <h1 className="text-2xl font-black font-display text-stone-900 tracking-tight">
          Workbench: {currentUser.name} ({currentUser.initials})
        </h1>
        <p className="text-stone-500 text-xs mt-1">
          Role: <strong className="uppercase">{currentUser.role.replace('_', ' ')}</strong> | Assigned work orders list overview
        </p>
      </div>

      {/* Orders Listings segment cards */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600 border-collapse" style={{ contentVisibility: 'auto' }}>
            <thead>
              <tr className="bg-stone-50 border-b border-stone-150 font-mono text-[10px] uppercase text-stone-400 font-black">
                <th className="py-3 px-4">Article No.</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Stage Status</th>
                <th className="py-3 px-4">Delivery Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {myOrders.length > 0 ? (
                myOrders.map((ord) => {
                  const matchingCust = customers.find((c) => c.id === ord.customer_id);
                  const isStagedMine = ord.current_status === myStage;
                  return (
                    <tr key={ord.id} className="hover:bg-stone-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-black text-stone-900">
                        {ord.article_no}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-stone-850">
                        {matchingCust?.name || 'Walk-In'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-stone-700">{ord.current_status}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-500 font-semibold">{ord.delivery_date}</td>
                      <td className="py-3.5 px-4">
                        {isStagedMine ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 font-bold text-[9px] animate-pulse">
                            Needs Update
                          </span>
                        ) : ord.current_status === 'Ready to Dispatch' ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 font-bold text-[9px]">
                            Dispatched
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-stone-400 bg-stone-50 border border-stone-200 rounded-full px-2 py-0.5 font-bold text-[9px]">
                            Staged
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenUpdate(ord)}
                          className={`p-1.5 px-3.5 rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1 ml-auto ${
                            isStagedMine
                              ? 'bg-[#593622] hover:bg-[#402414] text-white font-black'
                              : 'bg-stone-100 text-stone-400 cursor-not-allowed hover:bg-stone-100 hover:text-stone-400'
                          }`}
                          disabled={!isStagedMine}
                        >
                          <Eye size={12} />
                          Update Status
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 font-sans italic">
                    <Clock size={20} className="mx-auto text-stone-300 mb-1" />
                    No orders currently assigned to your workbench.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Persistent warning banner message as shown in screenshot 1 */}
      <div className="bg-[#eff6ff] border border-blue-200 p-4 rounded-xl flex gap-3 text-xs text-blue-800 leading-normal">
        <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={16} />
        <div>
          <span className="font-bold">Technical update restriction guidelines</span>
          <p className="text-stone-600 mt-1">
            As a <strong>{currentUser.role.replace('_', ' ')}</strong> profile, you can update status and attach completion photos exclusively for orders currently at the <strong>{myStage}</strong> stage. Orders under QC or other departments are read-only.
          </p>
        </div>
      </div>

    </div>
  );
}
