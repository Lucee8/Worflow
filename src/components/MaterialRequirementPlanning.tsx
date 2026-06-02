import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Layers, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  Hammer, 
  ShoppingCart, 
  Lock, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Wrench, 
  ClipboardCheck, 
  FileText, 
  Send,
  Calendar,
  Layers2,
  Bookmark,
  ChevronRight,
  Info,
  Sliders,
  Sparkles,
  RotateCcw,
  Trash2,
  TrendingDown
} from 'lucide-react';
import { Order, Customer, StatusLog } from '../types';

// Types representing master inventory items
interface HardwareItem {
  id: string;
  name: string;
  category: 'Hinges' | 'Handles' | 'Drawer Channels' | 'Screws' | 'Locks' | 'Brackets' | 'Fasteners' | 'Glass Fittings' | 'Other Accessories';
  available_stock: number;
  reserved_stock: number;
  unit: string; // pcs, sets, boxes, kgs
  low_threshold: number;
  unit_cost: number;
  supplier: string;
}

interface WoodItem {
  id: string;
  name: string;
  category: 'Plywood' | 'MDF' | 'HDF' | 'Particle Board' | 'Teak Wood' | 'Oak Wood' | 'Laminate Sheets' | 'Veneers' | 'Solid Wood' | 'Other Custom Materials';
  thickness: string; // e.g. 18mm, 12mm, 3 inches
  grade: string; // e.g. IS:710, Premium, First-Class
  available_stock: number;
  reserved_stock: number;
  unit: string; // sheets, CFT, sqft
  low_threshold: number;
  unit_cost: number;
  supplier: string;
}

interface ProjectBOMItem {
  id: string; // links to master item (either wood_ or hw_)
  name: string;
  type: 'wood' | 'hardware';
  required_qty: number;
  unit: string;
}

// Preseeded default lists for Hardware Master
const PRESEEDED_HARDWARE: HardwareItem[] = [
  { id: 'hw_1', name: 'Concealed Soft-Close Hinges 3D (Clip-on)', category: 'Hinges', available_stock: 140, reserved_stock: 32, unit: 'pcs', low_threshold: 40, unit_cost: 140, supplier: 'Vardhman Hardware Solutions' },
  { id: 'hw_2', name: 'Premium Solid Brass Pull Handles 8"', category: 'Handles', available_stock: 35, reserved_stock: 8, unit: 'pcs', low_threshold: 12, unit_cost: 380, supplier: 'Royal Antique Brass Works' },
  { id: 'hw_3', name: 'Classic Telescopic Soft-Close Drawer Rails 18"', category: 'Drawer Channels', available_stock: 24, reserved_stock: 10, unit: 'sets', low_threshold: 10, unit_cost: 320, supplier: 'Apex Hardware Hub' },
  { id: 'hw_4', name: 'Twin-Thread Self-Drilling Wood Screws 1.5"', category: 'Screws', available_stock: 1800, reserved_stock: 450, unit: 'pcs', low_threshold: 500, unit_cost: 1.5, supplier: 'Metro Fasteners Pvt Ltd' },
  { id: 'hw_5', name: 'Heavy Duty 3-Bolt Wardrobe Sliding Lock set', category: 'Locks', available_stock: 15, reserved_stock: 6, unit: 'pcs', low_threshold: 5, unit_cost: 290, supplier: 'Vardhman Hardware Solutions' },
  { id: 'hw_6', name: 'Sofa Cone Profile Leg Studs (Electroplated Diamond)', category: 'Other Accessories', available_stock: 18, reserved_stock: 8, unit: 'pcs', low_threshold: 16, unit_cost: 190, supplier: 'Royal Antique Brass Works' },
  { id: 'hw_7', name: 'Reinforced Steel Structural Corner Brackets', category: 'Brackets', available_stock: 75, reserved_stock: 12, unit: 'pcs', low_threshold: 20, unit_cost: 48, supplier: 'Metro Fasteners Pvt Ltd' }
];

// Preseeded default lists for Wood Master
const PRESEEDED_WOOD: WoodItem[] = [
  { id: 'wd_1', name: 'Century Premium Waterproof Marine Plywood', category: 'Plywood', thickness: '18mm', grade: 'IS:710 Marine', available_stock: 22, reserved_stock: 8, unit: 'sheets', low_threshold: 6, unit_cost: 2400, supplier: 'Century Ply Corp' },
  { id: 'wd_2', name: 'Action TESA High-Density HDHMR Board', category: 'HDF', thickness: '12mm', grade: 'Premium Water Resistant', available_stock: 14, reserved_stock: 4, unit: 'sheets', low_threshold: 5, unit_cost: 1750, supplier: 'TESA Distributor Co' },
  { id: 'wd_3', name: 'Nagpur Teak Wood Square Rough Logs', category: 'Teak Wood', thickness: 'Rough Sawn (Various)', grade: 'Grade-A Forest Timber', available_stock: 28.5, reserved_stock: 12.0, unit: 'CFT', low_threshold: 10.0, unit_cost: 3450, supplier: 'Central Railway Timber Depot' },
  { id: 'wd_4', name: 'American White Hardwood Oak Beams', category: 'Oak Wood', thickness: '2 inches', grade: 'FAS Premium Premium', available_stock: 8.4, reserved_stock: 2.0, unit: 'CFT', low_threshold: 5.0, unit_cost: 4900, supplier: 'National Exotics Import' },
  { id: 'wd_5', name: 'Gold Gloss Acrylic Finish Laminate Leaf', category: 'Laminate Sheets', thickness: '1mm', grade: 'Gloss Deco S-F', available_stock: 12, reserved_stock: 2, unit: 'sheets', low_threshold: 4, unit_cost: 1150, supplier: 'Royale Touche' }
];

// Default dynamic BOM presets based on category keywords
const BOM_PRESETS: Record<string, Omit<ProjectBOMItem, 'id'>[]> = {
  bed: [
    { name: 'Century Premium Waterproof Marine Plywood', type: 'wood', required_qty: 6, unit: 'sheets' },
    { name: 'Nagpur Teak Wood Square Rough Logs', type: 'wood', required_qty: 8.5, unit: 'CFT' },
    { name: 'Twin-Thread Self-Drilling Wood Screws 1.5"', type: 'hardware', required_qty: 120, unit: 'pcs' },
    { name: 'Reinforced Steel Structural Corner Brackets', type: 'hardware', required_qty: 12, unit: 'pcs' }
  ],
  wardrobe: [
    { name: 'Century Premium Waterproof Marine Plywood', type: 'wood', required_qty: 8, unit: 'sheets' },
    { name: 'Gold Gloss Acrylic Finish Laminate Leaf', type: 'wood', required_qty: 4, unit: 'sheets' },
    { name: 'Concealed Soft-Close Hinges 3D (Clip-on)', type: 'hardware', required_qty: 16, unit: 'pcs' },
    { name: 'Premium Solid Brass Pull Handles 8"', type: 'hardware', required_qty: 4, unit: 'pcs' },
    { name: 'Heavy Duty 3-Bolt Wardrobe Sliding Lock set', type: 'hardware', required_qty: 2, unit: 'pcs' },
    { name: 'Twin-Thread Self-Drilling Wood Screws 1.5"', type: 'hardware', required_qty: 180, unit: 'pcs' }
  ],
  table: [
    { name: 'Nagpur Teak Wood Square Rough Logs', type: 'wood', required_qty: 3.2, unit: 'CFT' },
    { name: 'Gold Gloss Acrylic Finish Laminate Leaf', type: 'wood', required_qty: 1, unit: 'sheets' },
    { name: 'Classic Telescopic Soft-Close Drawer Rails 18"', type: 'hardware', required_qty: 2, unit: 'sets' },
    { name: 'Premium Solid Brass Pull Handles 8"', type: 'hardware', required_qty: 2, unit: 'pcs' },
    { name: 'Twin-Thread Self-Drilling Wood Screws 1.5"', type: 'hardware', required_qty: 40, unit: 'pcs' }
  ],
  sofa: [
    { name: 'Nagpur Teak Wood Square Rough Logs', type: 'wood', required_qty: 4.8, unit: 'CFT' },
    { name: 'Sofa Cone Profile Leg Studs (Electroplated Diamond)', type: 'hardware', required_qty: 4, unit: 'pcs' },
    { name: 'Twin-Thread Self-Drilling Wood Screws 1.5"', type: 'hardware', required_qty: 60, unit: 'pcs' },
    { name: 'Reinforced Steel Structural Corner Brackets', type: 'hardware', required_qty: 8, unit: 'pcs' }
  ]
};

// Simulated Consumption History logs
interface ConsumptionLog {
  id: string;
  itemName: string;
  quantityConsumed: number;
  unit: string;
  orderArticleNo: string;
  timestamp: string;
}

interface MaterialRequirementPlanningProps {
  selectedOrderId: string;
  orders: Order[];
  customers?: Customer[];
  onOrderUpdate?: (updatedOrder: Order, newLog?: StatusLog) => void;
}

export default function MaterialRequirementPlanning({ selectedOrderId, orders, customers = [], onOrderUpdate }: MaterialRequirementPlanningProps) {
  // Navigation tabs: 'dashboard', 'hardware', 'wood', 'planner', 'consumption'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'hardware' | 'wood' | 'planner'>('dashboard');

  // Master databases with local persistence
  const [hardwareInventory, setHardwareInventory] = useState<HardwareItem[]>(() => {
    const saved = localStorage.getItem('mrp_hardware_v2');
    return saved ? JSON.parse(saved) : PRESEEDED_HARDWARE;
  });

  const [woodInventory, setWoodInventory] = useState<WoodItem[]>(() => {
    const saved = localStorage.getItem('mrp_wood_v2');
    return saved ? JSON.parse(saved) : PRESEEDED_WOOD;
  });

  const [consumptionLogs, setConsumptionLogs] = useState<ConsumptionLog[]>(() => {
    const saved = localStorage.getItem('mrp_consumption_logs');
    return saved ? JSON.parse(saved) : [
      { id: 'c_1', itemName: 'Century Premium Waterproof Marine Plywood', quantityConsumed: 4, unit: 'sheets', orderArticleNo: 'ORD-5412', timestamp: '2026-06-01 14:10' },
      { id: 'c_2', itemName: 'Concealed Soft-Close Hinges 3D (Clip-on)', quantityConsumed: 12, unit: 'pcs', orderArticleNo: 'ORD-5412', timestamp: '2026-06-01 14:15' },
      { id: 'c_3', itemName: 'Nagpur Teak Wood Square Rough Logs', quantityConsumed: 3.5, unit: 'CFT', orderArticleNo: 'ORD-9021', timestamp: '2026-05-28 11:40' }
    ];
  });

  // Current active project chosen for BOM allocation
  const [activeProjectId, setActiveProjectId] = useState<string>(selectedOrderId || (orders.length > 0 ? orders[0].id : ''));
  const [selectedProjectBOM, setSelectedProjectBOM] = useState<ProjectBOMItem[]>([]);
  
  // Custom BOM item adding state
  const [newBomMatName, setNewBomMatName] = useState('');
  const [newBomMatQty, setNewBomMatQty] = useState<number>(1);
  const [newBomMatType, setNewBomMatType] = useState<'wood' | 'hardware'>('wood');
  const [requisitionOutput, setRequisitionOutput] = useState<{ name: string; type: string; shortage: number; unit: string; cost: number }[]>([]);

  // Master creation form states
  const [newHw, setNewHw] = useState<Omit<HardwareItem, 'id'>>({
    name: '', category: 'Hinges', available_stock: 50, reserved_stock: 0, unit: 'pcs', low_threshold: 10, unit_cost: 120, supplier: ''
  });
  const [newWd, setNewWd] = useState<Omit<WoodItem, 'id'>>({
    name: '', category: 'Plywood', thickness: '18mm', grade: 'IS:710', available_stock: 10, reserved_stock: 0, unit: 'sheets', low_threshold: 3, unit_cost: 2200, supplier: ''
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('mrp_hardware_v2', JSON.stringify(hardwareInventory));
  }, [hardwareInventory]);

  useEffect(() => {
    localStorage.setItem('mrp_wood_v2', JSON.stringify(woodInventory));
  }, [woodInventory]);

  useEffect(() => {
    localStorage.setItem('mrp_consumption_logs', JSON.stringify(consumptionLogs));
  }, [consumptionLogs]);

  // Sync external order selection
  useEffect(() => {
    if (selectedOrderId) {
      setActiveProjectId(selectedOrderId);
      setActiveTab('planner');
    }
  }, [selectedOrderId]);

  // Dynamic BOM Loader on selecting a different order/project
  useEffect(() => {
    if (!activeProjectId) return;
    const project = orders.find(o => o.id === activeProjectId);
    if (!project) return;

    // Load custom project list from local storage or fallback to dynamic classification presets
    const savedBOMKey = `mrp_bom_project_${activeProjectId}`;
    const savedBOM = localStorage.getItem(savedBOMKey);
    if (savedBOM) {
      setSelectedProjectBOM(JSON.parse(savedBOM));
      return;
    }

    // fallback mapping category names or items to appropriate templates
    const sub = (project.sub_category || '').toLowerCase();
    const cat = (project.category || '').toLowerCase();
    let key = 'bed';

    if (sub.includes('cabinet') || sub.includes('wardrobe') || sub.includes('almirah') || cat.includes('kitchen')) {
      key = 'wardrobe';
    } else if (sub.includes('table') || sub.includes('desk') || sub.includes('dining')) {
      key = 'table';
    } else if (sub.includes('sofa') || sub.includes('chair') || sub.includes('couch')) {
      key = 'sofa';
    }

    const matchedTemplate = BOM_PRESETS[key] || BOM_PRESETS.bed;
    const initialBOM: ProjectBOMItem[] = matchedTemplate.map((item, idx) => ({
      id: `${item.type}_item_${idx}`,
      name: item.name,
      type: item.type,
      required_qty: item.required_qty,
      unit: item.unit
    }));

    setSelectedProjectBOM(initialBOM);
    localStorage.setItem(savedBOMKey, JSON.stringify(initialBOM));
  }, [activeProjectId, orders]);

  // Save changes back to local project storage
  const saveActiveProjectBOM = (updatedBOM: ProjectBOMItem[]) => {
    setSelectedProjectBOM(updatedBOM);
    if (activeProjectId) {
      localStorage.setItem(`mrp_bom_project_${activeProjectId}`, JSON.stringify(updatedBOM));
    }
  };

  // Add Item to Bill Of Materials
  const handleAddBOMItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBomMatName.trim() || newBomMatQty <= 0) return;

    // Match unit with existing master inventory database
    let matchedUnit = 'pcs';
    if (newBomMatType === 'wood') {
      const match = woodInventory.find(w => w.name.toLowerCase().includes(newBomMatName.toLowerCase()));
      matchedUnit = match ? match.unit : 'sheets';
    } else {
      const match = hardwareInventory.find(h => h.name.toLowerCase().includes(newBomMatName.toLowerCase()));
      matchedUnit = match ? match.unit : 'pcs';
    }

    const customBOMItem: ProjectBOMItem = {
      id: `custom_bom_${Date.now()}`,
      name: newBomMatName,
      type: newBomMatType,
      required_qty: newBomMatQty,
      unit: matchedUnit
    };

    const updated = [...selectedProjectBOM, customBOMItem];
    saveActiveProjectBOM(updated);
    setNewBomMatName('');
    setNewBomMatQty(1);
  };

  // Delete Item from Project BOM
  const handleDeleteBOMItem = (id: string) => {
    const updated = selectedProjectBOM.filter(item => item.id !== id);
    saveActiveProjectBOM(updated);
  };

  // Quick helper to search master stocks
  const checkMasterStock = (name: string, type: 'wood' | 'hardware') => {
    if (type === 'wood') {
      const item = woodInventory.find(w => w.name.toLowerCase() === name.toLowerCase());
      return item ? { available: item.available_stock, reserved: item.reserved_stock, item } : null;
    } else {
      const item = hardwareInventory.find(h => h.name.toLowerCase() === name.toLowerCase());
      return item ? { available: item.available_stock, reserved: item.reserved_stock, item } : null;
    }
  };

  // PROJECT STATUS CALCULATION BASED ON INVENTORY
  // "Available", "Partially Available", "Procurement Required", "Ready for Production"
  const getProjectStatus = () => {
    if (selectedProjectBOM.length === 0) return 'No Requirements Registered';
    
    let totalItems = selectedProjectBOM.length;
    let satisfied = 0;
    let criticalOut = 0;

    selectedProjectBOM.forEach(bom => {
      const stock = checkMasterStock(bom.name, bom.type);
      if (stock) {
        const netFree = stock.available - stock.reserved;
        if (netFree >= bom.required_qty) {
          satisfied++;
        } else if (stock.available < bom.required_qty) {
          criticalOut++;
        }
      } else {
        criticalOut++; // Material not configured in stock counts as shortage
      }
    });

    if (criticalOut > 0) return 'Procurement Required';
    if (satisfied === totalItems) return 'Ready for Production';
    return 'Partially Available';
  };

  // AUTO DEDUCTION MECHANICS
  // Automatic stock subtraction after production completion
  const handleAutomaticDeduction = () => {
    const activeProject = orders.find(o => o.id === activeProjectId);
    const orderNo = activeProject?.article_no || 'Walk-In';

    // Verify if we have registered logs
    let logsToAdd: ConsumptionLog[] = [];

    // Deduct stock from state databases
    let updatedHardware = [...hardwareInventory];
    let updatedWood = [...woodInventory];

    selectedProjectBOM.forEach(bom => {
      if (bom.type === 'wood') {
        updatedWood = updatedWood.map(item => {
          if (item.name.toLowerCase() === bom.name.toLowerCase()) {
            const deductedVal = Math.max(0, item.available_stock - bom.required_qty);
            
            // Record consumption audit log
            logsToAdd.push({
              id: `c_log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              itemName: item.name,
              quantityConsumed: bom.required_qty,
              unit: item.unit,
              orderArticleNo: orderNo,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
            });

            return { ...item, available_stock: Number(deductedVal.toFixed(1)) };
          }
          return item;
        });
      } else {
        updatedHardware = updatedHardware.map(item => {
          if (item.name.toLowerCase() === bom.name.toLowerCase()) {
            const deductedVal = Math.max(0, item.available_stock - bom.required_qty);
            
            // Record consumption log
            logsToAdd.push({
              id: `c_log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              itemName: item.name,
              quantityConsumed: bom.required_qty,
              unit: item.unit,
              orderArticleNo: orderNo,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
            });

            return { ...item, available_stock: Math.max(0, item.available_stock - bom.required_qty) };
          }
          return item;
        });
      }
    });

    setHardwareInventory(updatedHardware);
    setWoodInventory(updatedWood);
    setConsumptionLogs(prev => [...logsToAdd, ...prev]);

    // Update Stage status safely
    if (activeProject && onOrderUpdate) {
      const updatedOrder = {
        ...activeProject,
        current_status: 'Carpentry' as const, // Transit safely to active Carpentry
        updated_at: new Date().toISOString().slice(0, 10)
      };
      // Emitting status log info
      onOrderUpdate(updatedOrder, {
        id: `log_mrp_${Date.now()}`,
        order_id: activeProject.id,
        stage: 'Carpentry',
        changed_by: 'system',
        changed_by_name: 'MRP Automated System',
        changed_by_role: 'admin',
        timestamp: new Date().toISOString(),
        note: 'Automatic MRP Stock Deduction executed successfully. Wood cutting and accessories issued.'
      });
    }

    alert(`🎉 INVENTORY DEDUCTION COMMITTED!\nSuccessfully subtracted and registered cutting & assembly materials on ${selectedProjectBOM.length} component categories. Cleaned logs have been added to the consumption registry.`);
  };

  // STOCK RESERVATION
  const handleReserveProjectStock = () => {
    let updatedHardware = [...hardwareInventory];
    let updatedWood = [...woodInventory];

    selectedProjectBOM.forEach(bom => {
      if (bom.type === 'wood') {
        updatedWood = updatedWood.map(item => {
          if (item.name.toLowerCase() === bom.name.toLowerCase()) {
            // Allocate reservation up to available stock
            const potentialReserve = Math.min(item.available_stock, item.reserved_stock + bom.required_qty);
            return { ...item, reserved_stock: Number(potentialReserve.toFixed(1)) };
          }
          return item;
        });
      } else {
        updatedHardware = updatedHardware.map(item => {
          if (item.name.toLowerCase() === bom.name.toLowerCase()) {
            const potentialReserve = Math.min(item.available_stock, item.reserved_stock + bom.required_qty);
            return { ...item, reserved_stock: potentialReserve };
          }
          return item;
        });
      }
    });

    setHardwareInventory(updatedHardware);
    setWoodInventory(updatedWood);
    alert(`🔐 MATERIALS RESERVATION COMPLETE!\nWe have successfully reserved in-stock materials exclusively for Project Room allocation. This protects items against other active walk-in orders.`);
  };

  // AUTOMATIC CALCULATED REQUISITIONS
  const handleGeneratePurchaseRequisition = () => {
    const list: typeof requisitionOutput = [];

    selectedProjectBOM.forEach(bom => {
      const stock = checkMasterStock(bom.name, bom.type);
      if (stock) {
        const netFree = stock.available - stock.reserved;
        if (netFree < bom.required_qty) {
          const shortage = bom.required_qty - netFree;
          list.push({
            name: bom.name,
            type: bom.type,
            shortage: Number(shortage.toFixed(1)),
            unit: bom.unit,
            cost: Number((shortage * stock.item.unit_cost).toFixed(0))
          });
        }
      } else {
        // Not configured in master, estimate normal value
        list.push({
          name: bom.name,
          type: bom.type,
          shortage: bom.required_qty,
          unit: bom.unit,
          cost: bom.type === 'wood' ? bom.required_qty * 1800 : bom.required_qty * 150
        });
      }
    });

    setRequisitionOutput(list);
  };

  // Master lists item handlers
  const handleAddMasterHardware = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHw.name.trim()) return;

    const added: HardwareItem = {
      ...newHw,
      id: `hw_custom_${Date.now()}`
    };

    setHardwareInventory(prev => [...prev, added]);
    setNewHw({ name: '', category: 'Hinges', available_stock: 50, reserved_stock: 0, unit: 'pcs', low_threshold: 10, unit_cost: 120, supplier: '' });
    alert('✅ Hardware master item created.');
  };

  const handleAddMasterWood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWd.name.trim()) return;

    const added: WoodItem = {
      ...newWd,
      id: `wood_custom_${Date.now()}`
    };

    setWoodInventory(prev => [...prev, added]);
    setNewWd({ name: '', category: 'Plywood', thickness: '18mm', grade: 'IS:710', available_stock: 10, reserved_stock: 0, unit: 'sheets', low_threshold: 3, unit_cost: 2200, supplier: '' });
    alert('✅ Wood master item created.');
  };

  // Dashboard Aggregates
  const totalHwStockCount = hardwareInventory.reduce((acc, h) => acc + h.available_stock, 0);
  const totalWoodStockCount = woodInventory.reduce((acc, w) => acc + w.available_stock, 0);
  
  // Inventory financial evaluation
  const hwInventoryValue = hardwareInventory.reduce((acc, h) => acc + (h.available_stock * h.unit_cost), 0);
  const woodInventoryValue = woodInventory.reduce((acc, w) => acc + (w.available_stock * w.unit_cost), 0);
  const totalValue = hwInventoryValue + woodInventoryValue;

  // Calculate alert counts
  const hwLowCount = hardwareInventory.filter(h => h.available_stock <= h.low_threshold).length;
  const woodLowCount = woodInventory.filter(w => w.available_stock <= w.low_threshold).length;
  const totalAlertCount = hwLowCount + woodLowCount;

  // Identify active order products
  const activeProjectObj = orders.find(o => o.id === activeProjectId);

  return (
    <div className="bg-[#fbfcfa] border border-[#593622]/20 rounded-2xl p-6 space-y-6 shadow-sm print:hidden">
      
      {/* MRP HEADER BRANDING */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#593622]/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#593622] text-amber-200">
              <Boxes size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="bg-amber-100/80 text-[#593622] px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest block w-max">
                ERP Integrated Workshop
              </span>
              <h2 className="text-xl font-black text-[#593622] tracking-tight font-display mt-0.5 uppercase leading-none">
                Material Requirement Planning (MRP) Dashboard
              </h2>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-1 font-sans">
            Streamline cabinet-making wood volumes, timber logs estimation, custom hinges, sliding handles & accessories inventory.
          </p>
        </div>

        {/* Global Tab Switchers */}
        <div className="flex bg-stone-150 p-1 rounded-xl border self-start lg:self-center">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'dashboard' ? 'bg-[#593622] text-white shadow-xs' : 'text-stone-500 hover:text-stone-850'
            }`}
          >
            📊 Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'hardware' ? 'bg-[#593622] text-white shadow-xs' : 'text-stone-500 hover:text-stone-850'
            }`}
          >
            ⚙️ Hardware Master
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wood')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'wood' ? 'bg-[#593622] text-white shadow-xs' : 'text-stone-500 hover:text-stone-850'
            }`}
          >
            🪵 Wood &amp; Boards Master
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'planner' ? 'bg-[#593622] text-white shadow-xs' : 'text-stone-500 hover:text-stone-850'
            }`}
          >
            📋 Project BOM Planner
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* TOP COUNTERS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Hardware Stock count */}
            <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">Total Hardware Units</span>
                <strong className="text-2xl font-black text-stone-900 block mt-1">{totalHwStockCount} <span className="text-xs font-normal text-stone-500">pcs/sets</span></strong>
                <span className="text-[10px] text-stone-500 font-sans block mt-0.5">Asset Value: ₹{hwInventoryValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-900 border border-amber-200">
                <Wrench size={18} />
              </div>
            </div>

            {/* Total Wood Stock count */}
            <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">Total Wood Inventory</span>
                <strong className="text-2xl font-black text-stone-900 block mt-1">{totalWoodStockCount} <span className="text-xs font-normal text-stone-500">units</span></strong>
                <span className="text-[10px] text-stone-500 font-sans block mt-0.5">Asset Value: ₹{woodInventoryValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-stone-100 rounded-xl text-stone-800 border border-stone-300">
                <Hammer size={18} />
              </div>
            </div>

            {/* Low-stock alerted materials */}
            <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">Low-Stock Warnings</span>
                <strong className={`text-2xl font-black block mt-1 ${totalAlertCount > 0 ? 'text-red-700 font-black animate-pulse' : 'text-[#593622]'}`}>
                  {totalAlertCount} <span className="text-xs font-normal text-stone-450">Alerts active</span>
                </strong>
                <span className="text-[10px] text-red-650 font-bold block mt-0.5">{hwLowCount} HW &bull; {woodLowCount} Wood Rows</span>
              </div>
              <div className={`p-3 rounded-xl border ${totalAlertCount > 0 ? 'bg-red-50 text-red-800 border-red-200' : 'bg-stone-50 text-stone-400'}`}>
                <AlertCircle size={18} />
              </div>
            </div>

            {/* General valuation */}
            <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">Total Inventory Value</span>
                <strong className="text-2xl font-black text-[#69422a] block mt-1">₹{totalValue.toLocaleString('en-IN')}</strong>
                <span className="text-[10px] text-[#593622]/70 font-semibold block mt-0.5">Overall Material Valuation</span>
              </div>
              <div className="p-3 bg-[#593622]/10 rounded-xl text-[#593622] border border-[#593622]/20">
                <DollarSign size={18} />
              </div>
            </div>
            
          </div>

          {/* TWO PANEL REPORT: LOW STOCK & RECENT CONSUMPTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Low Stock Watchlist */}
            <div className="bg-white p-5 border border-stone-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase text-[#593622] flex items-center gap-1.5">
                    🚨 Low Stock Alerts Watchlist
                  </h3>
                  <p className="text-[10px] text-stone-400 mt-0.5">Critical restock thresholds crossed or reached</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-red-105 border border-red-200 text-red-700 rounded-lg uppercase font-bold">
                  Refill Needed
                </span>
              </div>

              <div className="space-y-2.5 overflow-y-auto max-h-[280px]">
                {hardwareInventory.filter(h => h.available_stock <= h.low_threshold).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50/30 rounded-xl border border-red-100 text-xs">
                    <div>
                      <strong className="text-stone-900 block">{item.name}</strong>
                      <span className="text-[10px] text-stone-400 font-sans block mt-0.5">Hardware / Category: {item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-red-700 block font-mono">Stock: {item.available_stock} {item.unit}</span>
                      <span className="text-[9px] text-stone-450 block font-sans">Min Limit: {item.low_threshold}</span>
                    </div>
                  </div>
                ))}

                {woodInventory.filter(w => w.available_stock <= w.low_threshold).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50/30 rounded-xl border border-red-100 text-xs">
                    <div>
                      <strong className="text-stone-900 block">{item.name}</strong>
                      <span className="text-[10px] text-stone-400 font-sans block mt-0.5">Wood / Grade: {item.grade} &bull; {item.thickness}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-red-700 block font-mono">Stock: {item.available_stock} {item.unit}</span>
                      <span className="text-[9px] text-stone-450 block font-sans">Min Limit: {item.low_threshold}</span>
                    </div>
                  </div>
                ))}

                {hardwareInventory.filter(h => h.available_stock <= h.low_threshold).length === 0 &&
                 woodInventory.filter(w => w.available_stock <= w.low_threshold).length === 0 && (
                  <div className="p-8 text-center text-stone-450 italic text-xs font-sans">
                    ✨ No materials are below stock thresholds. Your inventory levels are optimal!
                  </div>
                )}
              </div>
            </div>

            {/* Material Consumption Report */}
            <div className="bg-white p-5 border border-stone-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase text-[#593622] flex items-center gap-1.5">
                    🪵 Material Cutting &amp; Consumption History
                  </h3>
                  <p className="text-[10px] text-stone-400 mt-0.5">Recorded items issued for project assembly and sawing</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#593622]/10 text-[#593622] rounded-lg uppercase font-bold">
                  Real-time Logs
                </span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[280px]">
                {consumptionLogs.map(log => (
                  <div key={log.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 text-xs flex items-center justify-between">
                    <div>
                      <strong className="text-stone-900 font-bold block">{log.itemName}</strong>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] px-1 bg-stone-200 rounded text-stone-600 font-mono">Order: {log.orderArticleNo}</span>
                        <span className="text-[10px] text-stone-405 font-medium">{log.timestamp}</span>
                      </div>
                    </div>
                    <div className="font-mono text-stone-950 font-black text-right">
                      -{log.quantityConsumed} {log.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ACTIVE PROJECTS OUTLOOK */}
          <div className="bg-[#593622]/5 p-5 border border-[#593622]/15 rounded-2xl space-y-3">
            <h3 className="text-xs font-black uppercase text-[#593622] tracking-wider flex items-center gap-1.5">
              📋 Materials Required for Active Workshop Projects ({orders.length} orders loaded)
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Integrate with customer design files or wood schedules. Select any order from the **Project BOM Planner** tab to dynamically evaluate materials and trigger automatic stock deductions.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {orders.map(o => (
                <button
                  key={o.id}
                  onClick={() => {
                    setActiveProjectId(o.id);
                    setActiveTab('planner');
                  }}
                  className="bg-white border hover:border-amber-500 hover:text-[#593622] p-2 rounded-xl text-[11px] font-bold text-stone-800 transition flex items-center gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  <strong>{o.article_no}</strong>: {o.sub_category}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: HARDWARE MASTER INVENTORY */}
      {activeTab === 'hardware' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase text-[#593622]">🛠️ Master Hardware Inventory Database</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">Add, edit, or adjust safety thresholds of accessories</p>
            </div>
          </div>

          <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b text-stone-500 font-bold uppercase text-[9px] tracking-wider select-none">
                    <th className="py-2.5 px-4">Item Name / Specification</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Available Stock</th>
                    <th className="py-2.5 px-3 text-center">Reserved Stock</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-4 text-center">Supplier</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 font-semibold text-stone-800">
                  {hardwareInventory.map(item => {
                    const isLow = item.available_stock <= item.low_threshold;
                    return (
                      <tr key={item.id} className="hover:bg-amber-50/5">
                        <td className="py-2.5 px-4 text-stone-900 font-black text-xs">{item.name}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-600 text-[10px] uppercase font-bold">{item.category}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            value={item.available_stock}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              setHardwareInventory(current => current.map(x => x.id === item.id ? { ...x, available_stock: val } : x));
                            }}
                            className="w-16 bg-stone-50 border p-1 rounded font-mono font-bold text-[#593622] text-center"
                          />
                          <span className="text-[10px] text-stone-400 font-sans block mt-0.5">{item.unit}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-stone-500">{item.reserved_stock} {item.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-stone-900">₹{item.unit_cost}</td>
                        <td className="py-2.5 px-4 text-stone-500 font-normal">{item.supplier || 'Local Supplier'}</td>
                        <td className="py-2.5 px-3 text-center">
                          {isLow ? (
                            <span className="px-2 py-0.5 bg-red-50 text-red-800 border border-red-200 rounded-full text-[10px] font-black tracking-wide shrink-0 animate-pulse">
                              ⚠️ LOW STOCK
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-250 rounded-full text-[10px] font-black tracking-wide shrink-0">
                              ✓ ADEQUATE
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove ${item.name} from Master Hardware?`)) {
                                setHardwareInventory(prev => prev.filter(x => x.id !== item.id));
                              }
                            }}
                            className="p-1 text-stone-400 hover:text-red-700 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MASTER HARDWARE CREATION FORM */}
          <form onSubmit={handleAddMasterHardware} className="bg-white border rounded-2xl p-5 space-y-4 shadow-3xs">
            <h4 className="text-xs font-black uppercase text-[#593622] tracking-wider flex items-center gap-1">
              <Plus size={14} /> Insert New Hardware Master Item
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Hardware Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telescopic slides 20 inch"
                  value={newHw.name}
                  onChange={(e) => setNewHw({ ...newHw, name: e.target.value })}
                  className="w-full bg-stone-50 border p-2 rounded-lg font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Category</label>
                <select
                  value={newHw.category}
                  onChange={(e: any) => setNewHw({ ...newHw, category: e.target.value })}
                  className="w-full bg-stone-50 border p-2 rounded-lg text-stone-900 font-bold focus:outline-none"
                >
                  <option value="Hinges">Hinges</option>
                  <option value="Handles">Handles</option>
                  <option value="Drawer Channels">Drawer Channels</option>
                  <option value="Screws">Screws</option>
                  <option value="Locks">Locks</option>
                  <option value="Brackets">Brackets</option>
                  <option value="Fasteners">Fasteners</option>
                  <option value="Glass Fittings">Glass Fittings</option>
                  <option value="Other Accessories">Other Accessories</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Starting Stock Qty</label>
                <input
                  type="number"
                  required
                  value={newHw.available_stock}
                  onChange={(e) => setNewHw({ ...newHw, available_stock: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-stone-50 border p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Hardware Unit</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pcs, sets, boxes"
                  value={newHw.unit}
                  onChange={(e) => setNewHw({ ...newHw, unit: e.target.value })}
                  className="w-full bg-stone-50 border p-2 rounded-lg text-stone-900 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Alert Threshold Limit</label>
                <input
                  type="number"
                  required
                  value={newHw.low_threshold}
                  onChange={(e) => setNewHw({ ...newHw, low_threshold: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-stone-50 border p-2 rounded-lg text-stone-900 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Estimated Unit Rate (₹)</label>
                <input
                  type="number"
                  required
                  value={newHw.unit_cost}
                  onChange={(e) => setNewHw({ ...newHw, unit_cost: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-stone-50 border p-2 rounded-lg font-bold text-stone-900"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Registered Supplier</label>
                <input
                  type="text"
                  placeholder="e.g. Vardhman Fasteners"
                  value={newHw.supplier}
                  onChange={(e) => setNewHw({ ...newHw, supplier: e.target.value })}
                  className="w-full bg-stone-50 border p-2 rounded-lg text-stone-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#593622] hover:bg-[#402414] text-white rounded-xl text-xs font-black uppercase tracking-wider transition"
            >
              Add Item to master list
            </button>
          </form>

        </div>
      )}

      {/* TAB 3: WOOD & BOARDS MASTER INVENTORY */}
      {activeTab === 'wood' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase text-[#593622]">🪵 Master Wood &amp; Panel Sheets Inventory Database</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">Manage teak timber, oak, HDHMR sheets, thickness standards and suppliers</p>
            </div>
          </div>

          <div className="bg-white border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b text-stone-500 font-bold uppercase text-[9px] tracking-wider select-none font-sans">
                    <th className="py-2.5 px-4">Item Name / Timber Type</th>
                    <th className="py-2.5 px-3">Grade</th>
                    <th className="py-2.5 px-2">Thickness</th>
                    <th className="py-2.5 px-3 text-center">Available Stock</th>
                    <th className="py-2.5 px-3 text-center">Reserved Stock</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-4 text-center">Manufacturer / Supplier</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150 font-semibold text-stone-800">
                  {woodInventory.map(item => {
                    const isLow = item.available_stock <= item.low_threshold;
                    return (
                      <tr key={item.id} className="hover:bg-amber-50/5">
                        <td className="py-2.5 px-4 text-stone-900 font-black text-xs">
                          <div>
                            <span>{item.name}</span>
                            <span className="block text-[9px] text-[#593622] font-black">{item.category}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-[11px]">{item.grade}</td>
                        <td className="py-2.5 px-2 font-mono text-[11px] text-stone-605">{item.thickness}</td>
                        <td className="py-2.5 px-3 text-center animate-fade-in">
                          <input
                            type="number"
                            step="0.1"
                            value={item.available_stock}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value));
                              setWoodInventory(current => current.map(x => x.id === item.id ? { ...x, available_stock: val } : x));
                            }}
                            className="w-16 bg-stone-50 border p-1 rounded font-mono font-bold text-[#593622] text-center"
                          />
                          <span className="text-[10px] text-stone-400 block mt-0.5">{item.unit}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-stone-500">{item.reserved_stock} {item.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-stone-900">₹{item.unit_cost}</td>
                        <td className="py-2.5 px-4 text-stone-500 font-normal">{item.supplier || 'Timber Wholesalers'}</td>
                        <td className="py-2.5 px-3 text-center">
                          {isLow ? (
                            <span className="px-2 py-0.5 bg-red-50 text-red-800 border border-red-200 rounded-full text-[10px] font-black tracking-wide shrink-0 animate-pulse">
                              ⚠️ LOW STOCK
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-250 rounded-full text-[10px] font-black tracking-wide shrink-0">
                              ✓ ADEQUATE
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-normal">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove ${item.name} from Master Wood Database?`)) {
                                setWoodInventory(prev => prev.filter(x => x.id !== item.id));
                              }
                            }}
                            className="p-1 text-stone-400 hover:text-red-700 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MASTER WOOD CREATION FORM */}
          <form onSubmit={handleAddMasterWood} className="bg-white border rounded-2xl p-5 space-y-4 shadow-3xs">
            <h4 className="text-xs font-black uppercase text-[#593622] tracking-wider flex items-center gap-1">
              <Plus size={14} /> Configure New Master Timber / board Plank Item
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Timber or Panel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Teak Log 3x4 Beams"
                  value={newWd.name}
                  onChange={(e) => setNewWd({ ...newWd, name: e.target.value })}
                  className="w-full bg-stone-50 border p-2 rounded-lg font-semibold text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#593622] uppercase mb-1 font-black">Wood Category</label>
                <select
                  value={newWd.category}
                  onChange={(e: any) => setNewWd({ ...newWd, category: e.target.value })}
                  className="w-full bg-stone-50 border p-2 rounded-lg text-stone-900 font-black focus:outline-none"
                >
                  <option value="Plywood">Plywood</option>
                  <option value="MDF">MDF</option>
                  <option value="HDF">HDF</option>
                  <option value="Particle Board">Particle Board</option>
                  <option value="Teak Wood">Teak Wood</option>
                  <option value="Oak Wood">Oak Wood</option>
                  <option value="Laminate Sheets">Laminate Sheets</option>
                  <option value="Veneers">Veneers</option>
                  <option value="Solid Wood">Solid Wood</option>
                  <option value="Other Custom Materials">Other Custom Materials</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Thickness Indicator</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 18mm, 12mm, 4 inches"
                  value={newWd.thickness}
                  onChange={(e) => setNewWd({ ...newWd, thickness: e.target.value })}
                  className="w-full bg-stone-50 border p-2 rounded-lg focus:ring-1 focus:ring-amber-500 text-stone-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase mb-1">Wood Grade Standards</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IS:710 Marine, AAA Seasoned"
                  value={newWd.grade}
                  onChange={(e) => setNewWd({ ...newWd, grade: e.target.value })}
                  className="w-full bg-stone-50 border p-2 rounded-lg text-stone-900 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs pt-1">
              <div>
                <label className="block text-[10px] font-bold text-stone-450 uppercase mb-1">Stock Vol</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWd.available_stock}
                  onChange={(e) => setNewWd({ ...newWd, available_stock: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-stone-50 border p-2 rounded-lg text-stone-900 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-450 uppercase mb-1">Wood Unit</label>
                <select
                  value={newWd.unit}
                  onChange={(e) => setNewWd({ ...newWd, unit: e.target.value })}
                  className="w-full bg-stone-50 border p-2 rounded-lg text-stone-900 font-semibold"
                >
                  <option value="sheets">sheets</option>
                  <option value="CFT">CFT (Cubic Feet)</option>
                  <option value="sqft">sqft</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-450 uppercase mb-1">Low-Limit limit</label>
                <input
                  type="number"
                  required
                  value={newWd.low_threshold}
                  onChange={(e) => setNewWd({ ...newWd, low_threshold: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-stone-50 border p-2 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-450 uppercase mb-1">Procurement Unit Cost (₹)</label>
                <input
                  type="number"
                  required
                  value={newWd.unit_cost}
                  onChange={(e) => setNewWd({ ...newWd, unit_cost: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-stone-50 border p-2 rounded-lg font-black text-stone-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#593622] hover:bg-[#402414] text-white rounded-xl text-xs font-black uppercase tracking-wider transition"
            >
              Add Item to master database
            </button>
          </form>

        </div>
      )}

      {/* TAB 4: PROJECT BOM AND ALLOCATION PLANNER */}
      {activeTab === 'planner' && (
        <div className="space-y-6 animate-fade-in font-sans">
          
          {/* Linked projects indicator info bar */}
          <div className="bg-[#f2efe9] rounded-2xl p-5 border border-stone-250 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans text-xs">
            <div className="space-y-1.5 min-w-0">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Requirement planning console</span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-[#593622]">Connect Active Workshop Order:</span>
                <select
                  value={activeProjectId}
                  onChange={(e) => {
                    setActiveProjectId(e.target.value);
                    setRequisitionOutput([]);
                  }}
                  className="p-1 px-3 bg-white border border-stone-300 font-bold text-stone-950 rounded-lg focus:ring-1 focus:ring-[#593622] focus:outline-none"
                >
                  <option value="">-- Click to choose client project --</option>
                  {orders.map(o => {
                    const client = customers.find(c => c.id === o.customer_id);
                    return (
                      <option key={o.id} value={o.id}>
                        {o.article_no} • {o.sub_category} (Customer: {client ? client.name : 'Walk-In'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {activeProjectObj ? (() => {
                const client = customers.find(c => c.id === activeProjectObj.customer_id);
                return (
                  <div className="text-stone-600 block mt-1">
                    📄 Standard Specifications: <strong className="text-stone-900">{activeProjectObj.sub_category}</strong> in{' '}
                    <strong className="text-stone-900">{activeProjectObj.material}</strong> for <strong className="text-[#593622]">{client ? client.name : 'Walk-In'}</strong> &bull; Finish: <strong className="font-semibold text-stone-800">{activeProjectObj.finish || 'Polished'}</strong>
                  </div>
                );
              })() : (
                <p className="text-stone-450 italic">Please select an active order above to construct and verify its Bill of Materials (BOM) planning sheet.</p>
              )}
            </div>

            {/* Dynamic Status block indicator calculated on stock */}
            {activeProjectObj && (
              <div className="shrink-0 text-center md:text-right space-y-1 bg-white p-3.5 rounded-xl border border-stone-250 shadow-2xs">
                <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Inventory Verification Outcome</span>
                <div className="pt-0.5">
                  {getProjectStatus() === 'Ready for Production' && (
                    <span className="p-1 px-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg font-black text-xs uppercase inline-block select-none">
                      ✅ Ready for Production
                    </span>
                  )}
                  {getProjectStatus() === 'Partially Available' && (
                    <span className="p-1 px-3 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg font-black text-xs uppercase inline-block">
                      ⚠️ Partially Available
                    </span>
                  )}
                  {getProjectStatus() === 'Procurement Required' && (
                    <span className="p-1 px-3 bg-rose-50 text-rose-800 border border-rose-300 rounded-lg font-black text-xs uppercase inline-block animate-pulse">
                      🚨 Procurement Required
                    </span>
                  )}
                  {getProjectStatus() === 'No Requirements Registered' && (
                    <span className="p-1 px-3 bg-stone-100 text-stone-500 rounded-lg font-black text-xs uppercase inline-block">
                      No materials registered
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* OVERVIEW TABLE FOR THE DYNAMIC ORDER BILL OF MATERIALS (BOM) */}
          {activeProjectObj ? (
            <div className="space-y-6">
              
              <div className="bg-white border rounded-2xl overflow-hidden">
                <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-[#593622] tracking-wider font-display">
                    🔨 Bill of Materials (BOM) configuration
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleReserveProjectStock}
                      className="p-1.5 px-3 bg-[#593622]/10 border border-[#593622]/30 text-[#593622] hover:bg-[#593622]/20 transition rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                    >
                      <Lock size={11} /> Allocate Reserved Stock
                    </button>
                    <button
                      type="button"
                      onClick={handleGeneratePurchaseRequisition}
                      className="p-1.5 px-3 bg-amber-50 border border-amber-250 text-amber-900 hover:bg-amber-100 transition rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                    >
                      <ShoppingCart size={11} /> Check Shortages &amp; Quote
                    </button>
                    <button
                      type="button"
                      onClick={handleAutomaticDeduction}
                      className="p-1.5 px-3 bg-emerald-700 text-white hover:bg-emerald-800 transition rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
                      title="Automatic stock deduction after production"
                    >
                      <ClipboardCheck size={11} /> Auto Stock Deduction
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-stone-100 border-b text-stone-500 font-bold uppercase text-[9px] tracking-wider select-none font-sans text-center">
                        <th className="py-2 px-4 text-left border-r min-w-[220px]">Required Component Item</th>
                        <th className="py-2 px-2 border-r">Requirement Type</th>
                        <th className="py-2 px-2 border-r text-center">Required Qty</th>
                        <th className="py-2 px-2 border-r text-center">Unreserved Free Stock</th>
                        <th className="py-2 px-2 border-r text-center">Global Available Master Stock</th>
                        <th className="py-2 px-3 text-right">Pre-check Shortage</th>
                        <th className="py-2 px-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-semibold text-stone-850">
                      {selectedProjectBOM.length > 0 ? (
                        selectedProjectBOM.map(bom => {
                          const stock = checkMasterStock(bom.name, bom.type);
                          const netFreeStock = stock ? stock.available - stock.reserved : 0;
                          const hasDeficit = stock ? (stock.item.available_stock < bom.required_qty) : true;
                          const netShortage = stock ? Math.max(0, bom.required_qty - netFreeStock) : bom.required_qty;
                          
                          return (
                            <tr key={bom.id} className="hover:bg-amber-50/5">
                              {/* Material Master Label */}
                              <td className="py-2 px-4 text-left border-r font-black text-stone-900 flex items-center gap-2">
                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${bom.type === 'wood' ? 'bg-amber-600' : 'bg-stone-605'}`} />
                                <div>
                                  <span className="block text-xs">{bom.name}</span>
                                  {!stock && (
                                    <span className="block text-[8px] text-red-500 font-bold font-mono tracking-wider">⚠️ NOT IN MASTER</span>
                                  )}
                                </div>
                              </td>

                              {/* Material Category Type */}
                              <td className="py-2 px-2 border-r text-center uppercase text-[10px]">
                                <span className={`p-0.5 px-2 rounded-lg font-black border text-[9px] ${
                                  bom.type === 'wood' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-stone-550 text-[#593622] bg-[#593622]/10 border-stone-300'
                                }`}>
                                  {bom.type === 'wood' ? 'WOOD PANEL' : 'HARDWARE'}
                                </span>
                              </td>

                              {/* Required Quantity Input */}
                              <td className="py-1 px-2 border-r text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={bom.required_qty}
                                    onChange={(e) => {
                                      const val = Math.max(0.1, Number(e.target.value));
                                      const updated = selectedProjectBOM.map(x => x.id === bom.id ? { ...x, required_qty: val } : x);
                                      saveActiveProjectBOM(updated);
                                    }}
                                    className="w-14 bg-stone-50 text-center border p-0.5 rounded font-mono font-bold text-stone-950"
                                  />
                                  <span className="text-[10px] text-stone-400 font-sans uppercase font-black">{bom.unit}</span>
                                </div>
                              </td>

                              {/* Net Free Stock */}
                              <td className="py-2 px-2 border-r text-center font-mono">
                                {stock ? (
                                  <span className={netFreeStock >= bom.required_qty ? 'text-emerald-700 font-extrabold' : 'text-amber-700'}>
                                    {netFreeStock.toFixed(1)} {bom.unit}
                                  </span>
                                ) : (
                                  <span className="text-red-500 italic">0.0</span>
                                )}
                              </td>

                              {/* Master Global Available Stock */}
                              <td className="py-2 px-2 border-r text-center font-mono text-stone-550">
                                {stock ? (
                                  <span>{stock.available} {bom.unit} <span className="text-[10px] text-stone-400 block font-sans">({stock.reserved} reserved)</span></span>
                                ) : (
                                  <span className="text-red-500">Not config</span>
                                )}
                              </td>

                              {/* Shortage indicator */}
                              <td className="py-2 px-3 border-r text-right font-mono text-xs">
                                {netShortage > 0 ? (
                                  <span className="p-1 px-2 bg-red-101 text-red-700 text-[11px] font-black tracking-tight rounded-lg border border-red-150">
                                    Shortage: {netShortage.toFixed(1)} {bom.unit}
                                  </span>
                                ) : (
                                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                    ✓ Available
                                  </span>
                                )}
                              </td>

                              {/* Remove BOM line */}
                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBOMItem(bom.id)}
                                  className="p-1 rounded text-stone-300 hover:text-red-700 hover:bg-stone-100 transition"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-stone-400 font-medium italic font-sans bg-stone-50/40">
                            No Bill of Material lines configured. Choose a category template below or configure custom lines.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DYNAMIC BOM BUILDER: INSERT WOOD OR HARDWARE LINK */}
              <form onSubmit={handleAddBOMItem} className="bg-white border rounded-2xl p-4 shadow-3xs space-y-3 font-sans">
                <h5 className="text-[10px] font-black uppercase text-[#593622] tracking-wider select-none leading-none">
                  ➕ APPEND CUSTOM MATERIALS LINE ITEM IN THIS BILL OF MATERIALS (BOM)
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-end">
                  
                  {/* Item selector matching master logs/hardware */}
                  <div className="sm:col-span-6">
                    <label className="block text-[9px] font-bold text-stone-400 uppercase mb-1">Select from master stock logs / configure item</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nagpur Teak Wood Square Rough Logs or Hinges 3D"
                      value={newBomMatName}
                      onChange={(e) => setNewBomMatName(e.target.value)}
                      className="w-full bg-stone-50 border p-2 rounded-lg font-bold text-stone-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      list="master_mrp_items"
                    />
                    <datalist id="master_mrp_items">
                      {woodInventory.map(w => <option key={w.id} value={w.name}>{w.name} (Wood)</option>)}
                      {hardwareInventory.map(h => <option key={h.id} value={h.name}>{h.name} (Hardware)</option>)}
                    </datalist>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-bold text-stone-400 uppercase mb-1">Requirement Class</label>
                    <select
                      value={newBomMatType}
                      onChange={(e: any) => setNewBomMatType(e.target.value)}
                      className="w-full bg-stone-50 border p-2 rounded-lg text-stone-950 font-bold focus:outline-none"
                    >
                      <option value="wood">Wood Panel Sheet</option>
                      <option value="hardware">Hardware / Pull-Lock</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[9px] font-bold text-stone-400 uppercase mb-1">Required quantity</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newBomMatQty || ''}
                      onChange={(e) => setNewBomMatQty(Math.max(0.1, Number(e.target.value)))}
                      className="w-full bg-stone-50 border p-2 rounded-lg text-stone-900 font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="w-full bg-[#593622] hover:bg-[#402414] text-white p-2 rounded-lg font-black uppercase text-[10px] tracking-wider transition-all"
                    >
                      Add Material Row
                    </button>
                  </div>

                </div>
              </form>

              {/* AUTOMATIC GENERATED REQUISITIONS BOX IF TRIGGERED */}
              {requisitionOutput.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 space-y-4 font-sans animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
                        <ShoppingCart size={14} /> Dynamic Shortage Procurement Sheet &amp; Supplier Quote Cost
                      </h4>
                      <p className="text-[10px] text-amber-850 mt-0.5">Estimated procurement requisition list to fulfill the calculated shortages</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRequisitionOutput([])}
                      className="text-amber-900 hover:text-red-700 font-black text-xs"
                    >
                      Dismiss Requisition
                    </button>
                  </div>

                  <div className="border border-amber-300 rounded-xl overflow-hidden bg-white text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-amber-100 text-amber-950 font-black select-none text-[9px] uppercase font-sans text-center">
                          <th className="py-2 px-3 text-left border-r border-amber-200">Shortage Item Name</th>
                          <th className="py-2 px-3 border-r border-amber-200">Category</th>
                          <th className="py-2 px-3 border-r border-amber-200 text-center">Procurement Qty Deficit</th>
                          <th className="py-2 px-3 text-right">Estimated Subtotal Cost (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100 font-semibold text-stone-850 text-center">
                        {requisitionOutput.map((item, idx) => (
                          <tr key={idx} className="hover:bg-amber-55/35">
                            <td className="py-2 px-3 text-left border-r border-amber-100 font-bold text-stone-900">{item.name}</td>
                            <td className="py-2 px-3 border-r border-amber-100 uppercase text-[9px] font-bold">{item.type}</td>
                            <td className="py-2 px-3 border-r border-amber-100 text-center text-red-700 font-mono font-bold">+{item.shortage} {item.unit}</td>
                            <td className="py-2 px-3 text-right font-mono text-stone-900">₹{item.cost.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        <tr className="bg-amber-50 font-black text-amber-950">
                          <td colSpan={3} className="py-3 px-3 border-r border-amber-100 text-right uppercase tracking-wider text-[10px]">
                            GRAND PROCUREMENT BUDGET REQUIRED:
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-sm font-black text-amber-900">
                            ₹{requisitionOutput.reduce((acc, item) => acc + item.cost, 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        // Mark active items in stock as ordered simulation
                        alert('✈️ SUPPLIER ENQUIRY SENT!\nPurchase Requisition submitted to Nagpur Teak Depot. Master inventory updates sent.');
                        setRequisitionOutput([]);
                      }}
                      className="px-4 py-1.5 bg-[#593622] hover:bg-[#402414] text-white rounded-lg font-black uppercase text-[10px] tracking-wider"
                    >
                      Send Supplier Enquiry (₹ Requisition)
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border text-stone-450 italic text-xs">
              ⚠️ No connected active furniture workshop list selected. Please select one of the client projects above to plan its custom materials log.
            </div>
          )}

        </div>
      )}

    </div>
  );
}
