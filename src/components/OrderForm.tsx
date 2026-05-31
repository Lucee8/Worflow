/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Customer, User, Order, OrderPriority, OrderStage } from '../types';
import { generateUUID, generateArticleNumber } from '../db/store';
import { 
  Users, 
  HelpCircle, 
  Search, 
  UserPlus, 
  Image as ImageIcon, 
  Trash2, 
  Calendar, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Minus 
} from 'lucide-react';

// Preset photos for workshop previews
const FURNITURE_PHOTOS = [
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1558882224-cca166733360?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800',
];

const CATEGORY_MAP: Record<string, string[]> = {
  'Door Frames': ['Set', 'Mandir Room', 'Door', 'Christian Door', 'Frame'],
  'Wooden Sofas': ['Sofa'],
  'Beds': ['Premium Bed', 'Open Bed', 'Floating Bed', 'Box Bed', 'Trolley Bed', 'Poster Bed', 'Bunk Bed', 'Hydraulic Bed'],
  'Dressing Table': ['Dressing Table'],
  'Wooden Swings': ['Swing'],
  'Wooden Safety Doors': ['Safety Door'],
  'Wooden Mandirs': ['Mandir', 'Rajasan', 'Pooja Mandir'],
  'Teapoys & Coffee Tables': ['Teapoy'],
  'Sofa Cum Beds': ['Sofa Cum Bed'],
  'Dining Tables': ['Dining'],
  'Wardrobes': ['Wardrobe'],
  'TV Units': ['TV Unit'],
  'Chaurang & Paats': ['Chaurang'],
  'Diwans': ['Open Diwan', 'Box Diwan', 'Trolley Diwan', 'Bhaiyya Khat'],
};

interface OrderFormProps {
  customers: Customer[];
  users: User[];
  orders: Order[];
  onSave: (newOrder: Order, newCustomer?: Customer) => void;
  onCancel: () => void;
}

export default function OrderForm({ customers, users, orders, onSave, onCancel }: OrderFormProps) {
  const [step, setStep] = React.useState(1);

  // Filter lists
  const activeCarpenters = users.filter((u) => u.role === 'carpenter' && u.is_active);
  const activePolish = users.filter((u) => u.role === 'polish_person' && u.is_active);

  // Helper workload count
  const getWorkload = (userId: string) => {
    return orders.filter((o) => (o.carpenter_id === userId || o.polish_person_id === userId) && o.current_status !== 'Ready to Dispatch').length;
  };

  // --- STEP 1: PRODUCT STATE ---
  const [category, setCategory] = React.useState('Door Frames');
  const [subCategory, setSubCategory] = React.useState('Set');
  const [size, setSize] = React.useState('6ft');
  const [customSize, setCustomSize] = React.useState('');
  const [designType, setDesignType] = React.useState<'Standard' | 'Custom'>('Standard');
  const [material, setMaterial] = React.useState('Plywood');
  const [finish, setFinish] = React.useState('hand polish');
  const [colorShade, setColorShade] = React.useState('Walnut');
  const [noOfUnits, setNoOfUnits] = React.useState(1);
  const [specialNotes, setSpecialNotes] = React.useState('');

  // --- STEP 2: CUSTOMER STATE ---
  const [searchCustQuery, setSearchCustQuery] = React.useState('');
  const [selectedCustId, setSelectedCustId] = React.useState<string | null>(null);
  const [isNewCust, setIsNewCust] = React.useState(false);
  
  // Fields for new customer OR editing
  const [custName, setCustName] = React.useState('');
  const [custPhone, setCustPhone] = React.useState('');
  const [custAddress, setCustAddress] = React.useState('');
  const [custNotes, setCustNotes] = React.useState('');
  const [whatsappOptIn, setWhatsappOptIn] = React.useState(true);

  // --- STEP 3: IMAGES STATE ---
  const [refImages, setRefImages] = React.useState<Array<{ id: string; url: string; type: 'Design Reference' }>>([]);
  const [imgUrlInput, setImgUrlInput] = React.useState('');

  // --- STEP 4: ASSIGNMENTS STATE ---
  const [carpenterId, setCarpenterId] = React.useState(activeCarpenters[0]?.id || '');
  const [polishPersonId, setPolishPersonId] = React.useState(activePolish[0]?.id || '');
  const [carpenterLabourRate, setCarpenterLabourRate] = React.useState<number | ''>('');
  const [polishLabourRate, setPolishLabourRate] = React.useState<number | ''>('');

  // --- STEP 5: REVIEW STATE ---
  const [orderDate, setOrderDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = React.useState(
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // today + 10 days
  );
  const [priority, setPriority] = React.useState<OrderPriority>('normal');
  const [internalNotes, setInternalNotes] = React.useState('');

  // Article Number Preview calculation
  const [articlePreview, setArticlePreview] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (carpenterId) {
      const generated = generateArticleNumber(category, carpenterId, orders, users);
      setArticlePreview(generated);
    }
  }, [category, carpenterId, orders, users]);

  // Customer filtration
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchCustQuery.toLowerCase()) ||
    c.phone.includes(searchCustQuery)
  );

  const selectExistingCustomer = (c: Customer) => {
    setSelectedCustId(c.id);
    setIsNewCust(false);
    setCustName(c.name);
    setCustPhone(c.phone);
    setCustAddress(c.address || '');
    setCustNotes(c.notes || '');
    setWhatsappOptIn(c.whatsapp_opt_in);
  };

  const startNewCustomer = () => {
    setSelectedCustId(null);
    setIsNewCust(true);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setCustNotes('');
    setWhatsappOptIn(true);
  };

  const handleAddImageUrl = () => {
    if (imgUrlInput && imgUrlInput.startsWith('http')) {
      setRefImages([...refImages, { id: generateUUID(), url: imgUrlInput, type: 'Design Reference' }]);
      setImgUrlInput('');
    } else {
      alert('Please enter a valid HTTP/HTTPS image path URL.');
    }
  };

  const handleRemoveImage = (id: string) => {
    setRefImages(refImages.filter((img) => img.id !== id));
  };

  // Step Nav validation
  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
      if (size === 'Custom' && !customSize) {
        alert('Please specify the dimensions for your Custom furniture size.');
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (!custName.trim() || !custPhone.trim()) {
        alert('Customer Name and active Phone Number are required fields.');
        return false;
      }
      return true;
    }
    if (currentStep === 4) {
      if (!carpenterId) {
        alert('A dedicated carpenter is required in order to save the production line order.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleCopyArticle = () => {
    navigator.clipboard.writeText(articlePreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    let targetCustomerId = selectedCustId || '';

    // Create customer profile if selected as new
    let newCustomerObj: Customer | undefined;
    if (isNewCust || !selectedCustId) {
      const generatedCustId = 'cust_' + generateUUID().split('-')[0];
      newCustomerObj = {
        id: generatedCustId,
        name: custName,
        phone: custPhone,
        address: custAddress,
        notes: custNotes,
        whatsapp_opt_in: whatsappOptIn,
        created_at: new Date().toISOString(),
        created_by: 'user_admin',
      };
      targetCustomerId = generatedCustId;
    }

    // Build the order record itself
    const newOrder: Order = {
      id: 'order_' + generateUUID().split('-')[0],
      article_no: articlePreview,
      customer_id: targetCustomerId,
      category,
      sub_category: subCategory,
      size,
      custom_size: size === 'Custom' ? customSize : undefined,
      design_type: designType,
      material,
      finish,
      color_shade: colorShade,
      no_of_units: noOfUnits,
      carpenter_id: carpenterId,
      carpenter_labour_rate: carpenterLabourRate !== '' ? Number(carpenterLabourRate) : undefined,
      polish_person_id: polishPersonId || undefined,
      polish_labour_rate: polishLabourRate !== '' ? Number(polishLabourRate) : undefined,
      current_status: 'Pending',
      is_delayed: false,
      priority,
      order_date: orderDate,
      delivery_date: deliveryDate,
      internal_notes: internalNotes || undefined,
      special_notes: specialNotes || undefined,
      portal_token: 'pt_' + generateUUID().split('-')[0],
      portal_token_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      qr_token: 'qr_' + generateUUID().split('-')[0],
      created_at: new Date().toISOString(),
      created_by: 'user_admin',
      images: refImages.map((img) => ({
        id: img.id,
        url: img.url,
        type: 'Design Reference',
        uploaded_at: new Date().toISOString(),
        uploaded_by: 'user_admin',
      })),
    };

    onSave(newOrder, newCustomerObj);
  };

  return (
    <div className="space-y-6">
      {/* Page Header Area */}
      <div>
        <h1 className="text-2xl font-black font-display text-stone-900 tracking-tight">Create New Order</h1>
        <p className="text-stone-500 text-xs mt-1">Register customer specifications, upload blueprint drawings and delegate workshop staff</p>
      </div>

      {/* Modern Stepper Process Indicator */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs max-w-5xl mx-auto flex items-center justify-between font-mono text-[11px] font-bold text-stone-400">
        {[
          { num: 1, name: 'Product' },
          { num: 2, name: 'Customer' },
          { num: 3, name: 'Images' },
          { num: 4, name: 'Assign' },
          { num: 5, name: 'Review' },
        ].map((item) => {
          const isActive = step === item.num;
          const isDone = step > item.num;
          return (
            <React.Fragment key={item.num}>
              <div className="flex items-center gap-2">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center border font-black ${
                    isActive
                      ? 'bg-[#593622] text-amber-300 border-amber-500 shadow-md ring-4 ring-amber-500/10'
                      : isDone
                      ? 'bg-green-600 text-white border-green-750'
                      : 'bg-stone-50 text-stone-400 border-stone-200'
                  }`}
                >
                  {item.num}
                </span>
                <span className={isActive ? 'text-stone-900 font-black font-sans' : 'text-stone-400 font-sans'}>
                  {item.name}
                </span>
              </div>
              {item.num < 5 && <div className={`flex-1 h-[2px] mx-4 max-w-[80px] hidden sm:block ${isDone ? 'bg-green-600' : 'bg-stone-100'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto items-start">
        {/* Left main form sections (depending on active step) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          
          {/* STEP 1: PRODUCT PROPERTIES */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-2">
                1. Product Configuration
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      setCategory(newCategory);
                      const validSubs = CATEGORY_MAP[newCategory] || [];
                      if (validSubs.length > 0) {
                        setSubCategory(validSubs[0]);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl text-xs focus:outline-none focus:ring-0 text-stone-700 font-semibold"
                  >
                    {Object.keys(CATEGORY_MAP).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">Sub-category *</label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl text-xs focus:outline-none focus:ring-0 text-stone-700 font-semibold"
                  >
                    {(CATEGORY_MAP[category] || []).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">Size *</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl text-xs focus:outline-none focus:ring-0 text-stone-700 font-semibold"
                  >
                    <option>3ft</option>
                    <option>4ft</option>
                    <option>6ft</option>
                    <option>Custom</option>
                  </select>
                </div>

                {size === 'Custom' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-750 mb-1.5 uppercase tracking-wide text-rose-700 animate-pulse">Custom Size Details *</label>
                    <input
                      type="text"
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      placeholder="e.g. Height 75in x Width 72in x Depth 24in"
                      className="w-full px-3 py-2.5 bg-rose-50/20 border border-rose-200 focus:border-[#593622] rounded-xl text-xs focus:outline-none text-stone-800 font-semibold placeholder:text-stone-400"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wide font-sans">Design Type *</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDesignType('Standard')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        designType === 'Standard'
                          ? 'bg-[#fcf8f2] text-amber-900 border-amber-300 shadow-sm'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      Standard Catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesignType('Custom')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        designType === 'Custom'
                          ? 'bg-[#fcf8f2] text-amber-900 border-amber-300 shadow-sm'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      Bespoke/Custom Design
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">Material Structure *</label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl text-xs focus:outline-none focus:ring-0 text-stone-700 font-semibold"
                  >
                    <option>Plywood</option>
                    <option>Sagwan</option>
                    <option>Shivan</option>
                    <option>Aakashi</option>
                    <option>Other Wood</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">Finish Type *</label>
                  <select
                    value={finish}
                    onChange={(e) => setFinish(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl text-xs focus:outline-none focus:ring-0 text-stone-700 font-semibold"
                  >
                    <option>hand polish</option>
                    <option>matt</option>
                    <option>glossy</option>
                    <option>mix matt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">Color / Shade *</label>
                  <select
                    value={colorShade}
                    onChange={(e) => setColorShade(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl text-xs focus:outline-none focus:ring-0 text-[#292524] font-semibold"
                  >
                    <option>Walnut Textures</option>
                    <option>Teak Finish</option>
                    <option>Charcoal Slate</option>
                    <option>Teak Accent</option>
                    <option>Mahogany Matte</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">No. of Units *</label>
                <div className="inline-flex items-center gap-1.5 border border-stone-250 bg-stone-50 rounded-xl p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setNoOfUnits(Math.max(1, noOfUnits - 1))}
                    className="p-1 px-2 text-stone-500 hover:text-stone-900 font-black"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="font-mono text-xs font-black px-4">{noOfUnits}</span>
                  <button
                    type="button"
                    onClick={() => setNoOfUnits(noOfUnits + 1)}
                    className="p-1 px-2 text-stone-500 hover:text-stone-900 font-black"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">Special Instructions / Note</label>
                <textarea
                  rows={3}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Soft close hinges, internal hidden key drawer, glass cabinet profiles..."
                  className="w-full p-3 bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl text-xs focus:outline-none placeholder:text-stone-400 font-semibold"
                />
              </div>
            </div>
          )}

          {/* STEP 2: CUSTOMER DIRECTORIES */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
                  2. Customer Specifications
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={startNewCustomer}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                      isNewCust
                        ? 'bg-[#593622] text-amber-300 border-amber-600'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <UserPlus size={13} /> New Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewCust(false)}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                      !isNewCust
                        ? 'bg-[#593622] text-amber-300 border-amber-600'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Search size={13} /> Lookup Existing
                  </button>
                </div>
              </div>

              {!isNewCust && (
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-stone-400" size={14} />
                    <input
                      type="text"
                      value={searchCustQuery}
                      onChange={(e) => setSearchCustQuery(e.target.value)}
                      placeholder="Search existing customers by name or telephone..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-stone-250 focus:border-[#593622] focus:outline-none rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div className="max-h-40 overflow-y-auto space-y-1 bg-stone-100 p-1.5 rounded-lg border border-stone-200">
                    <p className="text-[10px] uppercase font-mono font-bold text-stone-400 px-2.5 py-1">CUSTOMER DIRECTORY MATCHES</p>
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectExistingCustomer(c)}
                        className={`w-full flex justify-between items-center text-left p-2 rounded hover:bg-stone-50 text-xs font-bold transition ${
                          selectedCustId === c.id ? 'bg-amber-100 text-[#593622]' : 'text-stone-750'
                        }`}
                      >
                        <div>
                          <span>{c.name}</span>
                          <span className="font-mono text-stone-400 text-[10px] block font-normal">{c.phone}</span>
                        </div>
                        {selectedCustId === c.id && <Check size={14} className="text-amber-700" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl space-y-4">
                <p className="text-xs font-bold text-[#593622] uppercase tracking-wider">
                  {isNewCust ? '★ Fill New Customer Details' : '★ Customer Information Details'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="Rahul Deshmukh"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#593622] focus:outline-none rounded-xl text-xs font-semibold text-stone-850"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">Phone Number (WhatsApp notifications) *</label>
                    <input
                      type="text"
                      required
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#593622] focus:outline-none rounded-xl text-xs font-semibold text-stone-850"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">Delivery Address</label>
                  <textarea
                    rows={2}
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder="Enter complete shipping coordinates for final dispatch..."
                    className="w-full p-3 bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl text-xs focus:outline-none font-semibold text-stone-850"
                  />
                </div>

                <div className="flex items-center gap-2 select-none border-t border-stone-100 pt-3">
                  <input
                    type="checkbox"
                    id="whatsappConsent"
                    checked={whatsappOptIn}
                    onChange={() => setWhatsappOptIn(!whatsappOptIn)}
                    className="h-4 w-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <label htmlFor="whatsappConsent" className="text-xs font-sans text-stone-600">
                    <strong>Send WhatsApp Updates</strong> (Sends live production progression reports when transitioning to dispatch/delivery stage)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BLUEPRINTS IMAGES */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-2">
                3. Design Reference Drawings
              </h2>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide font-sans">
                  Simulate image upload (Paste Image URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imgUrlInput}
                    onChange={(e) => setImgUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 bg-white border border-stone-250 rounded-lg text-xs focus:border-[#593622] focus:outline-none font-semibold"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-[#593622] text-white hover:bg-[#402414] px-4 py-2 font-bold text-xs rounded-lg shadow transition shrink-0"
                  >
                    Add URL
                  </button>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap text-[#c2410c] font-bold text-[10px] mt-1 shrink-0">
                  <span className="bg-amber-100/40 p-1 px-2.5 rounded text-amber-900 border border-amber-200">Presets:</span>
                  {FURNITURE_PHOTOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRefImages([...refImages, { id: generateUUID(), url: p, type: 'Design Reference' }])}
                      className="bg-white border rounded p-1 hover:border-amber-400 font-semibold"
                    >
                      Wardrobe Preset {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {refImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                  {refImages.map((img) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden border border-stone-200 aspect-video shadow-xs bg-stone-100">
                      <img referrerPolicy="no-referrer" src={img.url} alt="Reference" className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="bg-[#b91c1c] text-white p-2 rounded-xl transition"
                          title="Remove design reference drawing"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-stone-400">
                  <ImageIcon size={32} className="text-stone-300 mb-2" />
                  <p className="text-xs font-bold text-stone-500">No layout blueprint drawings added yet</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Please paste standard image links or click standard catalog presets above.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: WORKSHOP DELEGATE */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-2">
                4. Delegate Workshop Staff
              </h2>

              {/* Carpenter Selector */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#593622] uppercase tracking-wider block">★ Select Primary Carpenter *</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeCarpenters.map((carp) => {
                    const workload = getWorkload(carp.id);
                    const isSelected = carpenterId === carp.id;
                    return (
                      <label
                        key={carp.id}
                        onClick={() => setCarpenterId(carp.id)}
                        className={`border rounded-xl p-3 flex justify-between items-center cursor-pointer transition shadow-xs ${
                          isSelected
                            ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/15 text-[#593622]'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="carpenterGroup"
                            checked={isSelected}
                            onChange={() => setCarpenterId(carp.id)}
                            className="text-amber-600 focus:ring-amber-500 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-xs text-stone-850 block">{carp.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono tracking-wider font-semibold block uppercase">Initials: {carp.initials}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-stone-150 text-stone-600 font-mono px-2 py-0.5 rounded font-black">
                          {workload} active orders
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Labour Rate Input for selected Carpenter */}
                <div className="mt-3 max-w-xs animate-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Carpenter Labour Rate (₹)
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-stone-400 text-xs font-semibold">₹</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={carpenterLabourRate}
                      onChange={(e) => setCarpenterLabourRate(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Enter carpenter labour rate"
                      className="w-full pl-7 pr-3 py-2 bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl text-xs focus:outline-none focus:ring-0 text-stone-700 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Polish Person Selector */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <p className="text-xs font-bold text-[#593622] uppercase tracking-wider block">★ Select Primary Polish Person</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activePolish.map((pol) => {
                    const workload = getWorkload(pol.id);
                    const isSelected = polishPersonId === pol.id;
                    return (
                      <label
                        key={pol.id}
                        onClick={() => setPolishPersonId(pol.id)}
                        className={`border rounded-xl p-3 flex justify-between items-center cursor-pointer transition shadow-xs ${
                          isSelected
                            ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/15 text-[#593622]'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="polishGroup"
                            checked={isSelected}
                            onChange={() => setPolishPersonId(pol.id)}
                            className="text-amber-600 focus:ring-amber-500 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-xs text-stone-850 block">{pol.name}</span>
                            <span className="text-[10px] text-stone-400 font-mono tracking-wider font-semibold block uppercase">Initials: {pol.initials}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-stone-150 text-stone-600 font-mono px-2 py-0.5 rounded font-black">
                          {workload} active orders
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Labour Rate Input for selected Polish Person */}
                <div className="mt-3 max-w-xs animate-in slide-in-from-top-1 duration-200">
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">
                    Polish Person Labour Rate (₹)
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-stone-400 text-xs font-semibold">₹</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={polishLabourRate}
                      onChange={(e) => setPolishLabourRate(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="Enter polish person labour rate"
                      className="w-full pl-7 pr-3 py-2 bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl text-xs focus:outline-none focus:ring-0 text-stone-700 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & DATE CHECKS */}
          {step === 5 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-2">
                5. Review & SAVE Order Line
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">Date of Order *</label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 focus:outline-none focus:border-[#593622] rounded-xl text-xs font-semibold text-stone-850"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">Date of Delivery *</label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 focus:outline-none focus:border-[#593622] rounded-xl text-xs font-semibold text-stone-850"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wide font-sans">Order Priority Level</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('normal')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${
                      priority === 'normal'
                        ? 'bg-stone-100 text-stone-800 border-stone-300'
                        : 'bg-stone-50 text-stone-500 border-stone-200'
                    }`}
                  >
                    Normal Priority
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('urgent')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${
                      priority === 'urgent'
                        ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm animate-pulse'
                        : 'bg-stone-50 text-stone-500 border-stone-200'
                    }`}
                  >
                    ★ Urgent / Express Delivery
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#593622] mb-1.5 uppercase tracking-wide">Internal Notes (Admin Only view)</label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Private comments, production codes, inventory checks..."
                  className="w-full p-3 bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl text-xs focus:outline-none placeholder:text-stone-400 font-semibold"
                />
              </div>
            </div>
          )}

          {/* Wizard Action sticky-like bottom bar layout */}
          <div className="flex justify-between items-center pt-5 border-t border-stone-100 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-stone-200 rounded-xl text-stone-500 hover:text-stone-800 text-xs font-bold hover:bg-stone-50 transition"
            >
              Cancel
            </button>

            <div className="flex gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-stone-250 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-bold hover:bg-stone-50 transition"
                >
                  <ChevronLeft size={13} /> Back
                </button>
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1 bg-[#593622] hover:bg-[#402414] text-white px-4 py-2 font-bold text-xs rounded-xl shadow transition"
                >
                  Next Step <ChevronRight size={13} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFormSubmission}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  Save & Register Order
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Right side static "Article Number Preview" card */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
          <div className="border border-amber-300 bg-[#fefdfa] p-4 rounded-xl space-y-2 text-center relative overflow-hidden">
            <span className="text-[9px] font-mono tracking-wider text-amber-900 font-bold uppercase block">Article Number Preview</span>
            <div className="flex items-center justify-center gap-1.5 py-1">
              <strong className="font-mono text-base tracking-widest text-[#593622]">{articlePreview || 'CAT-YYMM-XX-0001'}</strong>
              <button
                type="button"
                onClick={handleCopyArticle}
                className="text-stone-400 hover:text-stone-700 p-1"
                title="Copy code"
              >
                {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              </button>
            </div>
            <span className="text-[9px] text-stone-400 uppercase tracking-widest block font-bold font-sans">Category-YYMM-Initials-Serial (Auto generated)</span>
          </div>

          {/* Dynamic Order Summary card */}
          <div className="rounded-xl border border-stone-150 bg-stone-50/50 p-4 space-y-3 text-xs leading-relaxed">
            <p className="font-bold text-stone-800 uppercase tracking-wide border-b border-stone-150 pb-1.5">Order Summary</p>
            <div className="space-y-1.5 text-stone-600 font-sans">
              <div className="flex justify-between">
                <span>Category:</span>
                <strong className="text-stone-900">{category}</strong>
              </div>
              <div className="flex justify-between">
                <span>Sub-category:</span>
                <strong className="text-stone-900">{subCategory}</strong>
              </div>
              <div className="flex justify-between">
                <span>Size constraint:</span>
                <strong className="text-stone-900">{size === 'Custom' ? 'Custom' : size}</strong>
              </div>
              <div className="flex justify-between">
                <span>Design:</span>
                <strong className="text-stone-900">{designType}</strong>
              </div>
              <div className="flex justify-between">
                <span>Material:</span>
                <strong className="text-stone-900">{material}</strong>
              </div>
              <div className="flex justify-between">
                <span>Finish:</span>
                <strong className="text-stone-900">{finish.split(' ')[0]}</strong>
              </div>
              <div className="flex justify-between">
                <span>Units counts:</span>
                <strong className="text-stone-900">{noOfUnits}</strong>
              </div>
              {carpenterLabourRate !== '' && (
                <div className="flex justify-between">
                  <span>Carpenter Rate:</span>
                  <strong className="text-stone-900">₹{carpenterLabourRate}</strong>
                </div>
              )}
              {polishLabourRate !== '' && (
                <div className="flex justify-between">
                  <span>Polish Rate:</span>
                  <strong className="text-stone-900">₹{polishLabourRate}</strong>
                </div>
              )}
              {custName && (
                <div className="flex justify-between pt-1 border-t border-stone-150 font-serif">
                  <span>Customer:</span>
                  <strong className="text-stone-900 font-sans">{custName}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
