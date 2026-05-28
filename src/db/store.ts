/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Customer, Order, StatusLog, Payment, Material, AlertRule, OrderStage } from '../types';

// Helper to generate UUIDs
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Initial Seed Users
const SEED_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'Admin',
    email: 'admin@bhisesworkshop.com',
    role: 'admin',
    initials: 'AD',
    is_active: true,
    last_seen: 'Today, 10:30 AM',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_sagar',
    name: 'Sagar',
    email: 'sagar@bhisesworkshop.com',
    role: 'carpenter',
    initials: 'SG',
    is_active: true,
    last_seen: 'Today, 09:15 AM',
    created_at: '2026-01-05T00:00:00Z',
    phone: '9876543210',
  },
  {
    id: 'user_vijay',
    name: 'Vijay',
    email: 'vijay@bhisesworkshop.com',
    role: 'carpenter',
    initials: 'VJ',
    is_active: true,
    last_seen: 'Today, 08:45 AM',
    created_at: '2026-01-06T00:00:00Z',
    phone: '9876501234',
  },
  {
    id: 'user_mahesh',
    name: 'Mahesh',
    email: 'mahesh@bhisesworkshop.com',
    role: 'polish_person',
    initials: 'MK',
    is_active: true,
    last_seen: 'Today, 09:50 AM',
    created_at: '2026-01-10T00:00:00Z',
    phone: '9876501235',
  },
  {
    id: 'user_ramesh',
    name: 'Ramesh',
    email: 'ramesh@bhisesworkshop.com',
    role: 'polish_person',
    initials: 'RP',
    is_active: true,
    last_seen: 'Yesterday, 06:20 PM',
    created_at: '2026-01-11T00:00:00Z',
    phone: '9876501236',
  },
  {
    id: 'user_pooja',
    name: 'Pooja',
    email: 'pooja@bhisesworkshop.com',
    role: 'carpenter',
    initials: 'PJ',
    is_active: true,
    last_seen: 'Yesterday, 05:10 PM',
    created_at: '2026-01-15T00:00:00Z',
    phone: '9876501237',
  },
  {
    id: 'user_sneha',
    name: 'Sneha',
    email: 'sneha@bhisesworkshop.com',
    role: 'polish_person',
    initials: 'SN',
    is_active: true,
    last_seen: 'Yesterday, 04:35 PM',
    created_at: '2026-01-16T00:00:00Z',
    phone: '9876501238',
  },
  {
    id: 'user_amit',
    name: 'Amit',
    email: 'amit@bhisesworkshop.com',
    role: 'carpenter',
    initials: 'AK',
    is_active: false,
    last_seen: '2 Jun 2026, 11:20 AM',
    created_at: '2026-02-01T00:00:00Z',
    phone: '9876501239',
  },
  {
    id: 'user_vishal',
    name: 'Vishal',
    email: 'vishal@bhisesworkshop.com',
    role: 'polish_person',
    initials: 'VS',
    is_active: false,
    last_seen: '1 Jun 2026, 07:40 PM',
    created_at: '2026-02-10T00:00:00Z',
    phone: '9876501240',
  },
  {
    id: 'user_tushar',
    name: 'Tushar',
    email: 'tushar@bhisesworkshop.com',
    role: 'carpenter',
    initials: 'TK',
    is_active: true,
    last_seen: 'Today, 07:55 AM',
    created_at: '2026-02-20T00:00:00Z',
    phone: '9876501241',
  },
];

// Initial Seed Customers
const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'cust_rahul',
    name: 'Rahul Deshmukh',
    phone: '9876543210',
    address: 'Flat 402, Sunshine Meadows, Karve Road, Pune, Maharashtra',
    notes: 'Requires walnut shade alignment with standard veneer catalog',
    whatsapp_opt_in: true,
    created_at: '2026-05-10T10:00:00Z',
    created_by: 'user_admin',
  },
  {
    id: 'cust_sneha',
    name: 'Sneha Patil',
    phone: '9812345678',
    address: 'Sector 15, Vashi, Navi Mumbai, Maharashtra',
    notes: 'Deliver on weekdays only. High priority finish checks.',
    whatsapp_opt_in: true,
    created_at: '2026-05-12T11:00:00Z',
    created_by: 'user_admin',
  },
  {
    id: 'cust_vijay',
    name: 'Vijay Kadam',
    phone: '9923456789',
    address: 'Bunglow No. 5, Bramha Suncity, Kalyani Nagar, Pune',
    notes: 'Wants premium telescopic channels on cabinets.',
    whatsapp_opt_in: false,
    created_at: '2026-05-15T09:30:00Z',
    created_by: 'user_admin',
  },
  {
    id: 'cust_amit',
    name: 'Amit Shinde',
    phone: '9834567890',
    address: 'Building C, Green Forest, Baner, Pune',
    notes: 'Needs solid pine wood accent instead of routine plywood.',
    whatsapp_opt_in: true,
    created_at: '2026-05-16T14:20:00Z',
    created_by: 'user_admin',
  },
  {
    id: 'cust_pooja',
    name: 'Pooja Jagtap',
    phone: '9745678901',
    address: 'Near Shaniwar Wada, Shivaji Nagar, Pune',
    notes: 'Verify sizing constraints for bedroom corridor door passage.',
    whatsapp_opt_in: true,
    created_at: '2026-05-17T15:00:00Z',
    created_by: 'user_admin',
  },
  {
    id: 'cust_neha',
    name: 'Neha Kulkarni',
    phone: '9656789012',
    address: 'Hill View Apartments, Kothrud, Pune',
    notes: 'Handles must be custom minimalist heavy matte-black tabs.',
    whatsapp_opt_in: true,
    created_at: '2026-05-18T08:45:00Z',
    created_by: 'user_admin',
  },
  {
    id: 'cust_aliya',
    name: 'Aliya Patil',
    phone: '9567890123',
    address: 'Lake Vista Row Houses, Pashan, Pune',
    notes: 'Double coat laminate for kitchen sub-units.',
    whatsapp_opt_in: true,
    created_at: '2026-05-18T12:00:00Z',
    created_by: 'user_admin',
  },
  {
    id: 'cust_meera',
    name: 'Meera Joshi',
    phone: '9478901234',
    address: 'R Deccan Road, Deccan Gymkhana, Pune',
    notes: 'Needs precise alignment for standard room dimensions.',
    whatsapp_opt_in: false,
    created_at: '2026-05-19T10:00:00Z',
    created_by: 'user_admin',
  },
  {
    id: 'cust_ramesh_p',
    name: 'Ramesh Pawar',
    phone: '9389012345',
    address: 'Shahu Colony, Laxmi Road, Pune',
    notes: 'Polish must use Italian PU matte finishing catalog.',
    whatsapp_opt_in: true,
    created_at: '2026-05-19T11:15:00Z',
    created_by: 'user_admin',
  },
  {
    id: 'cust_pravin',
    name: 'Pravin Tapkir',
    phone: '9290123456',
    address: 'Mayur Colony, Kothrud, Pune',
    notes: 'Verify locks for the hidden file vault.',
    whatsapp_opt_in: false,
    created_at: '2026-05-20T16:00:00Z',
    created_by: 'user_admin',
  },
];

// Seed Wardrobe/Cupboard Interior & Production photos for dynamic representation
const FURNITURE_PHOTOS = [
  'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1558882224-cca166733360?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800',
];

// Initial Seed Orders
const SEED_ORDERS: Order[] = [
  {
    id: 'order_1',
    article_no: 'BDR-2405-SG-0001',
    customer_id: 'cust_rahul',
    category: 'Bedroom',
    sub_category: 'Wardrobe',
    size: '6ft',
    design_type: 'Standard',
    material: 'Plywood',
    finish: 'Laminate',
    color_shade: 'Walnut',
    no_of_units: 1,
    carpenter_id: 'user_sagar',
    polish_person_id: 'user_mahesh',
    current_status: 'Carpentry',
    is_delayed: false,
    priority: 'normal',
    order_date: '2026-05-18',
    delivery_date: '2026-05-25',
    internal_notes: 'Wants smooth hydraulic hinges and premium drawers with dual keys.',
    portal_token: 'pt_token_1',
    portal_token_expires: '2026-06-25T00:00:00Z',
    qr_token: 'qr_token_1',
    created_at: '2026-05-18T10:15:00Z',
    created_by: 'user_admin',
    images: [
      { id: 'img_1_1', url: FURNITURE_PHOTOS[0], type: 'Design Reference', uploaded_at: '2026-05-18T10:15:00Z', uploaded_by: 'user_admin' },
      { id: 'img_1_2', url: FURNITURE_PHOTOS[1], type: 'Design Reference', uploaded_at: '2026-05-18T10:20:00Z', uploaded_by: 'user_admin' },
    ],
  },
  {
    id: 'order_2',
    article_no: 'LVR-2405-SG-0002',
    customer_id: 'cust_sneha',
    category: 'Living Room',
    sub_category: 'Sofa',
    size: 'Custom',
    custom_size: 'L-shape 7-seater',
    design_type: 'Custom',
    material: 'Solid Wood',
    finish: 'Teak Polish',
    color_shade: 'Teak',
    no_of_units: 1,
    carpenter_id: 'user_sagar',
    polish_person_id: 'user_mahesh',
    current_status: 'Polish',
    is_delayed: false,
    priority: 'urgent',
    order_date: '2026-05-15',
    delivery_date: '2026-05-28',
    internal_notes: 'Urgent delivery request. Client requested high gloss lacquer coat.',
    portal_token: 'pt_token_2',
    portal_token_expires: '2026-06-28T00:00:00Z',
    qr_token: 'qr_token_2',
    created_at: '2026-05-15T11:00:00Z',
    created_by: 'user_admin',
    images: [
      { id: 'img_2_1', url: FURNITURE_PHOTOS[2], type: 'Design Reference', uploaded_at: '2026-05-15T11:05:00Z', uploaded_by: 'user_admin' },
    ],
  },
  {
    id: 'order_3',
    article_no: 'KIT-2405-VJ-0001',
    customer_id: 'cust_vijay',
    category: 'Kitchen',
    sub_category: 'Cabinet',
    size: '6ft',
    design_type: 'Standard',
    material: 'MDF',
    finish: 'Matte White',
    color_shade: 'White Accent',
    no_of_units: 1,
    carpenter_id: 'user_vijay',
    polish_person_id: 'user_ramesh',
    current_status: 'QC Check 1',
    is_delayed: false,
    priority: 'normal',
    order_date: '2026-05-16',
    delivery_date: '2026-05-30',
    internal_notes: 'Check hydraulic struts during QC 1. Standard glossy white polish finish.',
    portal_token: 'pt_token_3',
    portal_token_expires: '2026-06-30T00:00:00Z',
    qr_token: 'qr_token_3',
    created_at: '2026-05-16T09:30:00Z',
    created_by: 'user_admin',
    images: [
      { id: 'img_3_1', url: FURNITURE_PHOTOS[3], type: 'Design Reference', uploaded_at: '2026-05-16T09:30:00Z', uploaded_by: 'user_admin' },
    ],
  },
  {
    id: 'order_4',
    article_no: 'OFF-2405-PJ-0001',
    customer_id: 'cust_amit',
    category: 'Office',
    sub_category: 'Table',
    size: '4ft',
    design_type: 'Standard',
    material: 'Plywood',
    finish: 'Laminate',
    color_shade: 'Charcoal',
    no_of_units: 1,
    carpenter_id: 'user_pooja',
    current_status: 'Design',
    is_delayed: false,
    priority: 'normal',
    order_date: '2026-05-20',
    delivery_date: '2026-06-02',
    internal_notes: 'Wants built-in wire conduits and standard sleek layout.',
    portal_token: 'pt_token_4',
    portal_token_expires: '2026-07-02T00:00:00Z',
    qr_token: 'qr_token_4',
    created_at: '2026-05-20T14:20:00Z',
    created_by: 'user_admin',
    images: [],
  },
  {
    id: 'order_5',
    article_no: 'BDR-2405-TK-0001',
    customer_id: 'cust_pooja',
    category: 'Bedroom',
    sub_category: 'Bed',
    size: '6ft',
    design_type: 'Standard',
    material: 'Solid Wood',
    finish: 'Teak Polish',
    color_shade: 'Mahogany',
    no_of_units: 1,
    carpenter_id: 'user_tushar',
    polish_person_id: 'user_sneha',
    current_status: 'Ready to Dispatch',
    is_delayed: false,
    priority: 'normal',
    order_date: '2026-05-10',
    delivery_date: '2026-05-22',
    internal_notes: 'Customer looking for delivery on priority. Completed double-cross slats check.',
    portal_token: 'pt_token_5',
    portal_token_expires: '2026-06-22T00:00:00Z',
    qr_token: 'qr_token_5',
    created_at: '2026-05-10T15:00:00Z',
    created_by: 'user_admin',
    images: [],
  },
  {
    id: 'order_6',
    article_no: 'KIT-2405-SG-0003',
    customer_id: 'cust_neha',
    category: 'Kitchen',
    sub_category: 'Cabinet',
    size: '6ft',
    design_type: 'Standard',
    material: 'Plywood',
    finish: 'Laminate',
    color_shade: 'White Accent',
    no_of_units: 1,
    carpenter_id: 'user_sagar',
    polish_person_id: 'user_mahesh',
    current_status: 'Carpentry',
    is_delayed: false,
    priority: 'normal',
    order_date: '2026-05-18',
    delivery_date: '2026-05-29',
    internal_notes: 'Soft close hinges, 2 drawers with lock, etc.',
    portal_token: 'pt_token_6',
    portal_token_expires: '2026-06-29T00:00:00Z',
    qr_token: 'qr_token_6',
    created_at: '2026-05-18T08:45:00Z',
    created_by: 'user_admin',
    images: [],
  },
  {
    id: 'order_7',
    article_no: 'LVR-2405-SG-0004',
    customer_id: 'cust_aliya',
    category: 'Living Room',
    sub_category: 'Table',
    size: '3ft',
    design_type: 'Standard',
    material: 'Plywood',
    finish: 'Laminate',
    color_shade: 'Teak',
    no_of_units: 1,
    carpenter_id: 'user_sagar',
    polish_person_id: 'user_mahesh',
    current_status: 'Carpentry',
    is_delayed: true,
    priority: 'normal',
    order_date: '2026-05-14',
    delivery_date: '2026-05-31',
    internal_notes: 'Delayed due to veneer shipment issues.',
    portal_token: 'pt_token_7',
    portal_token_expires: '2026-06-31T00:00:00Z',
    qr_token: 'qr_token_7',
    created_at: '2026-05-14T12:00:00Z',
    created_by: 'user_admin',
    images: [],
  },
  {
    id: 'order_8',
    article_no: 'KIT-2405-VJ-0002',
    customer_id: 'cust_meera',
    category: 'Kitchen',
    sub_category: 'Cabinet',
    size: '6ft',
    design_type: 'Standard',
    material: 'MDF',
    finish: 'Matte White',
    color_shade: 'Teak',
    no_of_units: 1,
    carpenter_id: 'user_vijay',
    polish_person_id: 'user_mahesh',
    current_status: 'QC Check 2',
    is_delayed: true,
    priority: 'normal',
    order_date: '2026-05-11',
    delivery_date: '2026-06-03',
    internal_notes: 'Varnish thickness needs inspection. Flagged for review.',
    portal_token: 'pt_token_8',
    portal_token_expires: '2026-07-03T00:00:00Z',
    qr_token: 'qr_token_8',
    created_at: '2026-05-11T10:00:00Z',
    created_by: 'user_admin',
    images: [],
  },
  {
    id: 'order_9',
    article_no: 'BDR-2405-PJ-0002',
    customer_id: 'cust_ramesh_p',
    category: 'Bedroom',
    sub_category: 'Wardrobe',
    size: 'Custom',
    custom_size: '7ft x 8ft high spacing cupboard',
    design_type: 'Custom',
    material: 'Solid Wood',
    finish: 'Teak Polish',
    color_shade: 'Walnut',
    no_of_units: 1,
    carpenter_id: 'user_pooja',
    polish_person_id: 'user_ramesh',
    current_status: 'Polish',
    is_delayed: false,
    priority: 'normal',
    order_date: '2026-05-19',
    delivery_date: '2026-06-04',
    internal_notes: 'Uses PU Italian high-grade polish coats. Apply base stain carefully.',
    portal_token: 'pt_token_9',
    portal_token_expires: '2026-07-04T00:00:00Z',
    qr_token: 'qr_token_9',
    created_at: '2026-05-19T11:15:00Z',
    created_by: 'user_admin',
    images: [],
  },
  {
    id: 'order_10',
    article_no: 'OFF-2405-TK-0002',
    customer_id: 'cust_pravin',
    category: 'Office',
    sub_category: 'Table',
    size: '4ft',
    design_type: 'Standard',
    material: 'MDF',
    finish: 'Laminate',
    color_shade: 'Charcoal',
    no_of_units: 1,
    carpenter_id: 'user_tushar',
    current_status: 'Ready to Dispatch',
    is_delayed: false,
    priority: 'normal',
    order_date: '2026-05-20',
    delivery_date: '2026-06-05',
    internal_notes: 'Completed edge-banding check successfully. Safe for shipment wrapper loading.',
    portal_token: 'pt_token_10',
    portal_token_expires: '2026-07-05T00:00:00Z',
    qr_token: 'qr_token_10',
    created_at: '2026-05-20T16:00:00Z',
    created_by: 'user_admin',
    images: [],
  },
];

// Initial Seed Logs
const SEED_LOGS: StatusLog[] = [
  {
    id: 'log_1',
    order_id: 'order_1',
    stage: 'Pending',
    changed_by: 'user_admin',
    changed_by_name: 'Admin',
    changed_by_role: 'admin',
    timestamp: '2026-05-18T10:15:00Z',
    note: 'Order initiated for Rahul Deshmukh.',
  },
  {
    id: 'log_2',
    order_id: 'order_1',
    stage: 'Design',
    changed_by: 'user_admin',
    changed_by_name: 'Admin',
    changed_by_role: 'admin',
    timestamp: '2026-05-19T11:30:00Z',
    note: 'Initial blueprints uploaded. Wardrobe internal dividers layout designed.',
  },
  {
    id: 'log_3',
    order_id: 'order_1',
    stage: 'Carpentry',
    changed_by: 'user_sagar',
    changed_by_name: 'Sagar CR',
    changed_by_role: 'carpenter',
    timestamp: '2026-05-20T09:45:00Z',
    note: 'Carpentry setup underway. Raw panel cutting complete.',
  },
];

// Seed Material stock for Phase 2 readiness
const SEED_MATERIALS: Material[] = [
  { id: 'mat_ply', name: 'Marine Grade Plywood 18mm', unit: 'sqft', qty_in_stock: 1200, reorder_level: 300, last_updated: '2026-05-28T12:00:00Z', updated_by: 'user_admin' },
  { id: 'mat_laminate', name: 'Walnut Texture Laminate Sheet 1mm', unit: 'piece', qty_in_stock: 45, reorder_level: 15, last_updated: '2026-05-28T12:00:00Z', updated_by: 'user_admin' },
  { id: 'mat_hinges', name: 'Soft Close Soft-Touch Hinges', unit: 'piece', qty_in_stock: 180, reorder_level: 50, last_updated: '2026-05-28T12:30:00Z', updated_by: 'user_admin' },
  { id: 'mat_adhesive', name: 'Premium Wood Adhesive', unit: 'litre', qty_in_stock: 90, reorder_level: 20, last_updated: '2026-05-28T11:00:00Z', updated_by: 'user_admin' },
];

export interface AppState {
  users: User[];
  customers: Customer[];
  orders: Order[];
  statusLogs: StatusLog[];
  materials: Material[];
  payments: Payment[];
  currentUser: User | null;
}

export function loadState(): AppState {
  try {
    const data = localStorage.getItem('bhise_workshop_tracker_db');
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.users && parsed.orders && parsed.customers) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed reading localStorage database', error);
  }

  // Fallback to seeded data
  const state: AppState = {
    users: SEED_USERS,
    customers: SEED_CUSTOMERS,
    orders: SEED_ORDERS,
    statusLogs: SEED_LOGS,
    materials: SEED_MATERIALS,
    payments: [],
    currentUser: SEED_USERS[0], // Start as Admin for convenience, login allows changes
  };
  saveState(state);
  return state;
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem('bhise_workshop_tracker_db', JSON.stringify(state));
  } catch (err) {
    console.error('Failed writing to localStorage database', err);
  }
}

// Generate serial formula: YY/MM/BH(1st 2 chars of name)/0000(sr.no. in series)
export function generateArticleNumber(
  category: string,
  carpenterId: string,
  allOrders: Order[],
  allUsers: User[]
): string {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');

  const carpenter = allUsers.find(u => u.id === carpenterId);
  const namePart = carpenter ? carpenter.name.substring(0, 2).toUpperCase() : 'XX';

  // Count existing orders globally as series count
  const nextSerial = allOrders.length + 1;
  const nnnn = String(nextSerial).padStart(4, '0');

  return `${yy}/${mm}/${namePart}/${nnnn}`;
}
