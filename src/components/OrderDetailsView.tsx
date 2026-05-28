/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Order, User, Customer, OrderStage, StatusLog } from '../types';
import { generateUUID } from '../db/store';
import { 
  ChevronLeft, 
  Edit, 
  Phone, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Hammer, 
  Sparkles, 
  ShieldCheck, 
  ClipboardCheck, 
  X,
  Plus
} from 'lucide-react';

interface OrderDetailsViewProps {
  orderId: string;
  orders: Order[];
  users: User[];
  customers: Customer[];
  statusLogs: StatusLog[];
  onBack: () => void;
  onUpdateOrder: (updatedOrder: Order, newLog?: StatusLog) => void;
  currentUser: User;
}

export default function OrderDetailsView({
  orderId,
  orders,
  users,
  customers,
  statusLogs,
  onBack,
  onUpdateOrder,
  currentUser,
}: OrderDetailsViewProps) {
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    return (
      <div className="py-12 text-center text-stone-500 font-sans">
        <AlertCircle className="mx-auto text-stone-400 mb-2" size={24} />
        Order record not found inside the active database.
        <button onClick={onBack} className="block mx-auto mt-4 px-4 py-2 bg-[#593622] text-white text-xs font-bold rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  const cust = customers.find((c) => c.id === order.customer_id);
  const carpenter = users.find((u) => u.id === order.carpenter_id);
  const polish = order.polish_person_id ? users.find((u) => u.id === order.polish_person_id) : null;
  const adminAuthor = users.find((u) => u.id === order.created_by);

  const orderLogs = statusLogs.filter((l) => l.order_id === order.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Image Upload simulation state
  const [newImgUrl, setNewImgUrl] = React.useState('');
  const [showImgModal, setShowImgModal] = React.useState(false);
  const [imgType, setImgType] = React.useState<'Design Reference' | 'In-Progress' | 'Final'>('In-Progress');

  // QC Failure Note State
  const [showQcFailModal, setShowQcFailModal] = React.useState(false);
  const [qcFailLogStage, setQcFailLogStage] = React.useState<OrderStage>('Carpentry');
  const [qcFailNote, setQcFailNote] = React.useState('');

  const isAdmin = currentUser.role === 'admin';

  const stages: OrderStage[] = [
    'Pending',
    'Design',
    'Carpentry',
    'QC Check 1',
    'Polish',
    'QC Check 2',
    'Ready to Dispatch',
    'Dispatched',
  ];

  const currentStageIndex = stages.indexOf(order.current_status);

  // Administrative transition actions
  const triggerTransition = (nextStage: OrderStage, notesText = '', qcPassedValue: boolean | null = null) => {
    const log: StatusLog = {
      id: 'log_' + generateUUID().split('-')[0],
      order_id: order.id,
      stage: nextStage,
      changed_by: currentUser.id,
      changed_by_name: currentUser.name,
      changed_by_role: currentUser.role,
      timestamp: new Date().toISOString(),
      note: notesText || `Order transitioned forward to ${nextStage}.`,
      qc_passed: qcPassedValue,
    };

    const updatedOrder: Order = {
      ...order,
      current_status: nextStage,
      // If going backwards, we mark delayed if QC failed
      is_delayed: qcPassedValue === false ? true : order.is_delayed,
      updated_at: new Date().toISOString(),
    };

    onUpdateOrder(updatedOrder, log);
    alert(`Order updated & status logged successful: now in "${nextStage}" stage.`);
  };

  const handleAdminStepAction = (actionType: 'forward' | 'fail_qc_1' | 'fail_qc_2') => {
    if (actionType === 'forward') {
      const nextIdx = currentStageIndex + 1;
      if (nextIdx < stages.length) {
        triggerTransition(stages[nextIdx], `Admin advanced order to "${stages[nextIdx]}".`);
      }
    } else if (actionType === 'fail_qc_1') {
      setQcFailLogStage('Carpentry');
      setShowQcFailModal(true);
    } else if (actionType === 'fail_qc_2') {
      setQcFailLogStage('Polish');
      setShowQcFailModal(true);
    }
  };

  const submitQcFailure = () => {
    if (!qcFailNote.trim()) {
      alert('Please fill out a specific note text detailing what failed during quality audits.');
      return;
    }
    setShowQcFailModal(false);
    triggerTransition(qcFailLogStage, `QC audit failed: ${qcFailNote}`, false);
    setQcFailNote('');
  };

  const handleAddImage = () => {
    if (!newImgUrl.trim() || !newImgUrl.startsWith('http')) {
      alert('Please provide a valid HTTP url representation for mock photo upload.');
      return;
    }
    const updatedOrder: Order = {
      ...order,
      images: [
        ...order.images,
        {
          id: 'img_' + generateUUID().split('-')[0],
          url: newImgUrl,
          type: imgType,
          uploaded_at: new Date().toISOString(),
          uploaded_by: currentUser.name,
        }
      ],
      updated_at: new Date().toISOString(),
    };
    onUpdateOrder(updatedOrder);
    setNewImgUrl('');
    setShowImgModal(false);
    alert('Progress photo appended successfully!');
  };

  const handleToggleDelayed = () => {
    const updated: Order = {
      ...order,
      is_delayed: !order.is_delayed,
      updated_at: new Date().toISOString(),
    };
    onUpdateOrder(updated);
  };

  return (
    <div className="space-y-6">
      {/* Scrollable Back Navigation Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-800 transition"
        >
          <ChevronLeft size={16} /> Back to Listings
        </button>

        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={handleToggleDelayed}
                className={`text-[10px] uppercase font-mono font-black border tracking-wider px-2.5 py-1.5 rounded-lg shadow-xs transition ${
                  order.is_delayed
                    ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                ⚠ Flag {order.is_delayed ? 'Urgent Safe' : 'Overdue Delayed'}
              </button>
              <button
                onClick={() => alert('Administrative fast-edit features are ready in Stage Progress.')}
                className="inline-flex items-center gap-1.5 bg-white border border-stone-250 hover:bg-stone-50 text-stone-700 font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition"
              >
                <Edit size={12} /> Edit Specifications
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Order Title bar detail */}
      <div className="bg-[#fcfcfb] border border-stone-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black font-display text-stone-900 tracking-tight">{order.article_no}</h1>
            <span
              className={`px-3 py-0.5 text-[10px] uppercase font-mono font-black border rounded-md ${
                order.current_status === 'Ready to Dispatch'
                  ? 'bg-green-150 text-green-800 border-green-300'
                  : order.current_status === 'Dispatched'
                  ? 'bg-emerald-100 text-emerald-850 border-emerald-300'
                  : 'bg-amber-100 text-[#593622] border-amber-300 animate-pulse'
              }`}
            >
              {order.current_status === 'Ready to Dispatch' ? 'Ready' : order.current_status === 'Dispatched' ? 'Dispatched' : 'In Production'}
            </span>
          </div>
          <p className="text-stone-500 text-xs">
            Customer: <strong>{cust?.name || 'Walk-In'}</strong> ({cust?.phone || 'No Phone'}) | Assigned Carpenter:{' '}
            <strong>{carpenter?.name || 'Unassigned'}</strong>
          </p>
        </div>

        {/* Dense visual dates metadata row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-3 rounded-xl border border-stone-150 font-sans text-xs">
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase">Order Date</span>
            <strong className="text-stone-850 mt-0.5 block">{order.order_date}</strong>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase">Delivery Target</span>
            <strong className="text-stone-850 mt-0.5 block font-mono text-[11px] font-black">{order.delivery_date}</strong>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase">Priority</span>
            <span className={`font-black text-[10px] block mt-0.5 uppercase ${order.priority === 'urgent' ? 'text-rose-600 animate-pulse' : 'text-stone-600'}`}>
              {order.priority}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold block uppercase">Created By</span>
            <strong className="text-stone-850 mt-0.5 block truncate">{adminAuthor?.name || 'Administrator'}</strong>
          </div>
        </div>
      </div>

      {/* Grid segments: 7 core sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" style={{ contentVisibility: 'auto' }}>
        
        {/* Left column info panels */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SECTION 1: STAGE PROGRESS STEPPER CARD */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
            <div className="pb-3 border-b border-stone-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Section 1: Production Pipeline</h2>
              <p className="text-[11px] text-stone-400 mt-0.5">Physical item progression updates through workshop verification gates</p>
            </div>

            {/* Stepper with current position */}
            <div className="w-full py-1">
              {/* Mobile View: Vertical Timeline */}
              <div className="md:hidden space-y-3.5 relative pl-1.5 py-1">
                {stages.map((stg, i) => {
                  const passed = i < currentStageIndex;
                  const active = i === currentStageIndex;
                  return (
                    <div key={stg} className="flex items-center gap-4 relative">
                      {i < stages.length - 1 && (
                        <div className={`absolute left-[13px] top-[28px] w-0.5 h-[18px] ${passed ? 'bg-green-600' : 'bg-stone-200'}`} />
                      )}
                      <motion.div
                        initial={active ? { scale: 0.82 } : { scale: 1 }}
                        animate={active ? { scale: [1, 1.08, 1], y: [0, -2, 0] } : { scale: 1, y: 0 }}
                        transition={active ? { type: "tween", duration: 1.5, ease: "easeInOut", repeat: Infinity } : { type: "tween", duration: 0.2 }}
                        className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-mono font-bold transition ${
                          active
                            ? 'bg-[#593622] text-amber-300 border-amber-500 shadow-md ring-4 ring-amber-500/10'
                            : passed
                            ? 'bg-green-600 text-white border-green-700'
                            : 'bg-white text-stone-400 border-stone-200'
                        }`}
                      >
                        {passed ? (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>✓</motion.span>
                        ) : i + 1}
                      </motion.div>
                      <div className="flex-1">
                        <span className={`text-[11px] font-semibold ${active ? 'text-stone-900 font-bold' : 'text-stone-500'}`}>
                          {stg}
                        </span>
                        {active && (
                          <motion.span 
                            initial={{ opacity: 0, x: -5 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            className="text-[9px] text-[#593622] font-black uppercase tracking-wider block leading-none mt-1"
                          >
                            Current Stage
                          </motion.span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: Horizontal Stepper */}
              <div className="hidden md:block overflow-x-auto no-scrollbar w-full py-1">
                <div className="relative flex justify-between min-w-[720px] font-mono text-[10px] font-bold text-stone-400 py-2">
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-stone-100 -translate-y-1/2" />
                  {stages.map((stg, i) => {
                    const passed = i < currentStageIndex;
                    const active = i === currentStageIndex;
                    return (
                      <div key={stg} className="relative z-10 flex flex-col items-center shrink-0 w-[80px]">
                        <motion.div
                          initial={active ? { scale: 0.75, y: 4 } : { scale: 1, y: 0 }}
                          animate={active ? { scale: [1, 1.08, 1], y: [0, -3, 0] } : { scale: 1, y: 0 }}
                          transition={active ? { type: "tween", ease: "easeInOut", duration: 1.5, repeat: Infinity } : { type: "spring", stiffness: 220, damping: 15 }}
                          className={`h-7 w-7 rounded-full flex items-center justify-center border transition ${
                            active
                              ? 'bg-[#593622] text-amber-300 border-amber-500 shadow-md ring-4 ring-amber-500/10'
                              : passed
                              ? 'bg-green-600 text-white border-green-700'
                              : 'bg-white text-stone-400 border-stone-200'
                          }`}
                        >
                          {passed ? (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>✓</motion.span>
                          ) : (
                            i + 1
                          )}
                        </motion.div>
                        <span className={`text-[9px] font-sans text-center mt-2 block truncate w-full ${active ? 'text-stone-900 font-extrabold' : 'text-stone-400'}`}>
                          {stg}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stage description + admin control layout */}
            <motion.div
              key={order.current_status}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="bg-stone-50 p-4 rounded-xl border border-stone-150 space-y-3.5 text-xs leading-relaxed"
            >
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-bold text-[#593622] uppercase tracking-wider">Current Active Gate</span>
                  <p className="text-stone-850 font-bold font-sans text-sm mt-0.5">
                    {order.current_status}
                  </p>
                </div>
                <div className="font-mono text-stone-400 text-[10px] font-bold">
                  Staged order tracking: {currentStageIndex + 1} of 7 completed
                </div>
              </div>

              <p className="text-stone-600 text-[11px]">
                {order.current_status === 'Pending' && 'Order registered. Design drawing specifications draft validation pending.'}
                {order.current_status === 'Design' && 'Draft blueprint measurements and catalog reviews active under designers.'}
                {order.current_status === 'Carpentry' && 'Carpentry workshop underway. Assembly, edge-banding and framework cutting.'}
                {order.current_status === 'QC Check 1' && 'Administrator checking structural integrity, dimension margins and joints before routing to polish.'}
                {order.current_status === 'Polish' && 'Polish department staining, sealing, high-gloss PU sealer coating.'}
                {order.current_status === 'QC Check 2' && 'Admin final review checking varnish thickness, lacquer evenness, soft-closes.'}
                {order.current_status === 'Ready to Dispatch' && 'Pass checks! Secure wrapping processed and item logged for dispatch truck.'}
                {order.current_status === 'Dispatched' && 'Furniture item has been securely dispatched to the customer delivery destination.'}
              </p>

              {/* Administrative Transition triggers buttons */}
              {isAdmin && order.current_status !== 'Dispatched' && (
                <div className="pt-2 flex flex-wrap gap-2 border-t border-stone-150">
                  <span className="text-[10px] font-bold text-stone-400 block w-full">ADMIN CONTROLLER GATEWAYS:</span>
                  
                  {order.current_status !== 'Carpentry' && order.current_status !== 'Polish' && order.current_status !== 'Ready to Dispatch' && (
                    <button
                      onClick={() => handleAdminStepAction('forward')}
                      className="bg-[#593622] hover:bg-[#402414] text-white px-3 py-1.5 font-bold rounded-lg text-[10px] uppercase tracking-wider transition shadow-sm flex items-center gap-1"
                    >
                      <CheckCircle2 size={11} /> Advanced Stage Forward
                    </button>
                  )}

                  {order.current_status === 'Ready to Dispatch' && (
                    <button
                      onClick={() => triggerTransition('Dispatched', 'Admin authorized logistics departure: Order registered on transport manifest.', true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 font-bold rounded-lg text-[10px] uppercase tracking-wider transition shadow-sm flex items-center gap-1"
                    >
                      <CheckCircle2 size={11} /> Ship & Dispatch Furniture
                    </button>
                  )}

                  {order.current_status === 'QC Check 1' && (
                    <>
                      <button
                        onClick={() => triggerTransition('Polish', 'Admin audited structural joints: QC Pass 1 successful.', true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 font-bold rounded-lg text-[10px] uppercase tracking-wider transition"
                      >
                        Pass QC Check 1
                      </button>
                      <button
                        onClick={() => handleAdminStepAction('fail_qc_1')}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 font-bold rounded-lg text-[10px] uppercase tracking-wider transition"
                      >
                        Fail (Send back to Carpentry)
                      </button>
                    </>
                  )}

                  {order.current_status === 'QC Check 2' && (
                    <>
                      <button
                        onClick={() => triggerTransition('Ready to Dispatch', 'Admin audited PU luster coats: QC Pass 2 successful.', true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 font-bold rounded-lg text-[10px] uppercase tracking-wider transition"
                      >
                        Pass QC Check 2
                      </button>
                      <button
                        onClick={() => handleAdminStepAction('fail_qc_2')}
                        className="bg-[#be123c] hover:bg-[#9f1239] text-white px-2.5 py-1.5 font-bold rounded-lg text-[10px] uppercase tracking-wider transition"
                      >
                        Fail (Send back to Polish)
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* SECTION 2: PRODUCT DETAILS */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="pb-3 border-b border-stone-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Section 2: Product Specifications</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs font-sans leading-relaxed text-stone-600">
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wide">Category</span>
                <strong className="text-stone-850 block font-normal text-sm mt-0.5">{order.category}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wide">Sub-category</span>
                <strong className="text-stone-850 block font-normal text-sm mt-0.5">{order.sub_category}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wide">Sizing constraints</span>
                <strong className="text-stone-850 block font-normal text-sm mt-0.5">
                  {order.size === 'Custom' ? order.custom_size || 'Custom' : order.size}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wide">Design blueprints</span>
                <span className="block mt-1">
                  <span className={`px-2 py-0.5 font-bold text-[9px] border rounded ${order.design_type === 'Custom' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-stone-50 text-stone-600 border-stone-200'}`}>
                    {order.design_type} Layout
                  </span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wide">Structural Material</span>
                <strong className="text-stone-850 block font-normal text-sm mt-0.5">{order.material}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wide">Finish Polish</span>
                <strong className="text-stone-850 block font-normal text-sm mt-0.5">{order.finish}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wide">Color shade shade</span>
                <strong className="text-stone-850 block font-normal text-sm mt-0.5">{order.color_shade}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wide">Units count count</span>
                <strong className="text-stone-850 block font-normal text-sm mt-0.5">{order.no_of_units} pieces</strong>
              </div>
            </div>

            {order.special_notes && (
              <div className="bg-[#fef9c3]/30 p-3.5 rounded-xl border border-[#fef08a] text-xs">
                <span className="font-bold text-amber-900 block font-sans">ℹ Special design specifications</span>
                <p className="text-stone-700 mt-1">{order.special_notes}</p>
              </div>
            )}
          </div>

          {/* SECTION 3: RECENT STATUS TIMELINE LOG (Permanently logged) */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="pb-3 border-b border-stone-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Section 3: Workshop Progress Logs</h2>
              <p className="text-[11px] text-stone-400 mt-0.5">Permanent log archives of status updates and Quality checks</p>
            </div>

            <div className="relative border-l-2 border-stone-100 ml-3.5 pl-5 space-y-5">
              {orderLogs.length > 0 ? (
                orderLogs.map((log) => {
                  const isQcFail = log.qc_passed === false;
                  return (
                    <div key={log.id} className="relative">
                      {/* Timeline Dot icon */}
                      <span className="absolute -left-[27px] top-0.5 bg-white border border-stone-300 h-3.5 w-3.5 rounded-full flex items-center justify-center">
                        <span className={`h-1.5 w-1.5 rounded-full ${isQcFail ? 'bg-rose-500' : 'bg-[#593622]'}`} />
                      </span>
                      <div className="text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-stone-900">{log.stage}</strong>
                          <span className="text-stone-400 text-[10px]">by {log.changed_by_name} ({log.changed_by_role.toUpperCase()})</span>
                          <span className="text-stone-400 text-[10px] font-mono shrink-0 ml-auto bg-stone-50 border p-0.5 px-2 rounded">
                            {new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {log.note && <p className="text-stone-600 mt-1 bg-stone-50/55 p-2 rounded-lg border border-stone-100 italic">{log.note}</p>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-stone-400 font-sans italic">No progress logs recorded for this order yet.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right sidebar column info panels */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SECTION 4: ASSIGNED STAFF CARD */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-display font-black text-stone-900 text-sm">Assigned To</h3>
            
            <div className="space-y-4">
              {/* Carpenter Assigned details */}
              <div className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <div className="h-9 w-9 rounded-lg bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                  {carpenter?.initials || 'CR'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-stone-450 uppercase font-mono block font-bold">CARPENTRY</span>
                  <strong className="text-stone-850 text-xs block truncate">{carpenter?.name || 'Not Delegate yet'}</strong>
                  {carpenter?.phone && (
                    <a href={`tel:${carpenter.phone}`} className="inline-flex items-center gap-1 text-[10px] text-amber-700 hover:underline font-bold mt-1">
                      <Phone size={10} /> Call ({carpenter.phone})
                    </a>
                  )}
                </div>
              </div>

              {/* Polish Assigned details */}
              <div className="flex items-center gap-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <div className="h-9 w-9 rounded-lg bg-[#0d9488] text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                  {polish?.initials || 'PL'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-[#0d9488]/80 uppercase font-mono block font-bold">POLISH / FINISH</span>
                  <strong className="text-stone-850 text-xs block truncate">{polish?.name || 'Delegates during QC 1 check'}</strong>
                  {polish?.phone && (
                    <a href={`tel:${polish.phone}`} className="inline-flex items-center gap-1 text-[10px] text-amber-700 hover:underline font-bold mt-1">
                      <Phone size={10} /> Call ({polish.phone})
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: CUSTOMER DETAILS CARD */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-display font-black text-stone-950 text-sm">Customer Details View</h3>
            
            <div className="space-y-2.5 text-xs text-stone-600">
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase">Name</span>
                <strong className="text-stone-850 text-sm block mt-0.5">{cust?.name || 'Walk-In'}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 font-bold block uppercase">Phone Number</span>
                <strong className="text-stone-800 text-xs block font-mono mt-0.5">{cust?.phone || 'No phone specifications'}</strong>
              </div>
              {cust?.address && (
                <div>
                  <span className="text-[10px] text-stone-400 font-bold block uppercase">Shipping Coordinates</span>
                  <p className="text-stone-700 mt-0.5 leading-normal bg-stone-50 p-2 rounded-lg border border-stone-100 text-[11px] font-medium">{cust.address}</p>
                </div>
              )}
              {cust?.notes && (
                <div>
                  <span className="text-[10px] text-stone-400 font-bold block uppercase">Profile Notes</span>
                  <p className="text-stone-500 mt-0.5 italic">{cust.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 6: REFERENCE PHOTOS GALLERY GRID */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-stone-950 text-sm">Reference Gallery</h3>
              <button
                type="button"
                onClick={() => setShowImgModal(true)}
                className="text-[10px] text-amber-700 hover:underline font-bold flex items-center gap-0.5"
              >
                <Plus size={12} /> Add Photo
              </button>
            </div>

            {order.images && order.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {order.images.map((img) => (
                  <div key={img.id} className="relative group overflow-hidden border rounded-lg aspect-square bg-stone-50">
                    <img referrerPolicy="no-referrer" src={img.url} alt="Spec" className="object-cover w-full h-full" />
                    <span className="absolute bottom-1 left-1 bg-black/75 text-stone-300 px-1 py-0.5 text-[8px] font-bold rounded uppercase">
                      {img.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 border border-dashed rounded-xl text-center text-stone-400 text-xs font-sans">
                No specification drawings added for this order.
              </div>
            )}
          </div>

          {/* SECTION 7: FILES & DOCUMENTS SLOTS */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="font-display font-black text-stone-950 text-sm">Files & Sheets</h3>
            <div className="flex gap-2.5 items-center p-3.5 bg-stone-50 border border-stone-100 rounded-xl cursor-pointer" onClick={() => alert("Files & document uploads (Phase 3 spec) is simulated.")}>
              <FileText size={18} className="text-stone-400 shrink-0" />
              <div>
                <strong className="text-stone-800 text-xs leading-none">Drafting specs PDF</strong>
                <p className="text-[10px] text-stone-400 block mt-1 font-mono uppercase">929 KB | Admin schema</p>
              </div>
              <Upload size={14} className="text-stone-400 ml-auto" />
            </div>
          </div>

        </div>
      </div>

      {/* QC Failure Reason note modal details dialog popup */}
      {showQcFailModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <strong className="text-stone-900 text-sm capitalize">Log QC Fail: {order.current_status}</strong>
              <button onClick={() => setShowQcFailModal(false)} className="text-stone-400 hover:text-stone-600">
                <X size={15} />
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <p className="text-stone-500">
                QC audits failures will trigger order state routing backward to <strong>{qcFailLogStage}</strong> department.
              </p>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-widest mb-1.5">Specify Fail Audit notes *</label>
                <textarea
                  required
                  rows={3}
                  value={qcFailNote}
                  onChange={(e) => setQcFailNote(e.target.value)}
                  placeholder="e.g. Laminate edge banding bubbled near corners. Sand and re-coat varnish."
                  className="w-full p-2.5 bg-stone-50 border border-stone-250 rounded-lg focus:outline-none focus:border-rose-500 font-semibold"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowQcFailModal(false)}
                className="px-3.5 py-1.5 rounded-lg border text-stone-650 hover:bg-stone-50 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={submitQcFailure}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-sm"
              >
                Commit QC Failure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image addition simulated URL popup modal */}
      {showImgModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <strong className="text-stone-900 text-sm">Add Workshop Progress Photo</strong>
              <button onClick={() => setShowImgModal(false)} className="text-stone-400 hover:text-stone-600">
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-stone-600">
              <div>
                <label className="block text-xs font-bold text-stone-700 tracking-wider uppercase mb-1.5">Photo Classification</label>
                <select
                  value={imgType}
                  onChange={(e) => setImgType(e.target.value as any)}
                  className="w-full p-2 bg-stone-50 border border-stone-250 focus:outline-none rounded-lg font-bold"
                >
                  <option>In-Progress</option>
                  <option>Final</option>
                  <option>Design Reference</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 tracking-wider uppercase mb-1.5">Paster Photo URL Link</label>
                <input
                  type="text"
                  value={newImgUrl}
                  onChange={(e) => setNewImgUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-250 focus:outline-none focus:border-[#593622] rounded-lg font-semibold"
                />
              </div>

              <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[10px] text-amber-900 leading-normal">
                Quick Preset: Paste <code className="bg-white p-0.5 font-bold font-mono text-[9px]">https://images.unsplash.com/photo-1595428774223-ef52624120d2</code>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                onClick={() => setShowImgModal(false)}
                className="px-3.5 py-1.5 rounded-lg border text-stone-500 font-bold hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddImage}
                className="bg-[#593622] text-white hover:bg-[#402414] font-bold px-3.5 py-1.5 rounded-lg shadow-sm"
              >
                Append Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
