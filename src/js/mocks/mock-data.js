/**
 * Authentic Mock Dataset for Cirota Tiffin Subscription
 */

// Food images (high quality food photos from Unsplash)
export const FOOD_IMAGES = {
  aalo_dum: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
  paneer_butter: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
  egg_curry: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
  chole_poori: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
  dal_makhani: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=500&auto=format&fit=crop&q=80',
  chicken_thali: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80',
  healthy_breakfast: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80'
};

// 4 Plan Types with frequency pricing & short-term options
// Pricing matches the official Cirota menu card (prices wef 01 Aug 2026)
export const MOCK_PLANS = [
  {
    id: 'plan_veg_lite',
    name: 'Veg Lite',
    category: 'veg',
    tier: 'lite',
    description: 'Budget-friendly vegetarian meals — paratha/poori breakfast, dal-rice lunch, sabzi-roti dinner.',
    trial_price: 50,
    pricing: {
      times_3: { monthly: 3200, daily_rate: 107 },
      times_2: { monthly: 2500, daily_rate: 83 },
      times_1: { monthly: 1350, daily_rate: 45 }
    },
    short_term_options: [
      { days: 1, price_3_times: 50, price_2_times: 50, price_1_time: 50, is_trial: true },
      { days: 7, price_3_times: 850, price_2_times: 700, price_1_time: 360 },
      { days: 15, price_3_times: 1700, price_2_times: 1300, price_1_time: 700 },
      { days: 30, price_3_times: 3200, price_2_times: 2500, price_1_time: 1350 }
    ],
    includes: ['Paratha / Poori / Sattu Breakfast', 'Dal-Rice-Sabzi Lunch', 'Seasonal Sabzi & Roti Dinner', 'Fryums']
  },
  {
    id: 'plan_nonveg_lite',
    name: 'Non-Veg Lite',
    category: 'nonveg',
    tier: 'lite',
    description: 'Budget-friendly non-vegetarian meals with egg/chicken curry on select days.',
    trial_price: 65,
    pricing: {
      times_3: { monthly: 3600, daily_rate: 120 },
      times_2: { monthly: 2800, daily_rate: 93 },
      times_1: { monthly: 1500, daily_rate: 50 }
    },
    short_term_options: [
      { days: 1, price_3_times: 65, price_2_times: 65, price_1_time: 65, is_trial: true },
      { days: 7, price_3_times: 950, price_2_times: 750, price_1_time: 400 },
      { days: 15, price_3_times: 1900, price_2_times: 1500, price_1_time: 800 },
      { days: 30, price_3_times: 3600, price_2_times: 2800, price_1_time: 1500 }
    ],
    includes: ['Paratha / Poori Breakfast', 'Egg / Chicken Curry (select days)', 'Dal-Rice Lunch', 'Roti Dinner']
  },
  {
    id: 'plan_veg_prime',
    name: 'Veg Prime',
    category: 'veg',
    tier: 'prime',
    popular: true,
    description: 'Versatile dishes, generous portions — comes with salad. Paneer, Kofta & Ghee Khichdi specials.',
    trial_price: 70,
    pricing: {
      times_3: { monthly: 4500, daily_rate: 150 },
      times_2: { monthly: 3500, daily_rate: 117 },
      times_1: { monthly: 1800, daily_rate: 60 }
    },
    short_term_options: [
      { days: 1, price_3_times: 70, price_2_times: 70, price_1_time: 70, is_trial: true },
      { days: 7, price_3_times: 1150, price_2_times: 900, price_1_time: 500 },
      { days: 15, price_3_times: 2300, price_2_times: 1800, price_1_time: 1000 },
      { days: 30, price_3_times: 4500, price_2_times: 3500, price_1_time: 1800 }
    ],
    includes: ['Paratha + Fruit/Curd Breakfast', 'Paneer Butter Masala / Soya Chaap', 'Salad with every meal', 'Ghee Khichdi & Papad (Sat)']
  },
  {
    id: 'plan_nonveg_prime',
    name: 'Non-Veg Prime',
    category: 'nonveg',
    tier: 'prime',
    description: 'Best of both worlds — generous non-veg portions with salad. Butter Chicken & Chicken Curry specials.',
    trial_price: 90,
    pricing: {
      times_3: { monthly: 5100, daily_rate: 170 },
      times_2: { monthly: 3900, daily_rate: 130 },
      times_1: { monthly: 2000, daily_rate: 67 }
    },
    short_term_options: [
      { days: 1, price_3_times: 90, price_2_times: 90, price_1_time: 90, is_trial: true },
      { days: 7, price_3_times: 1300, price_2_times: 1000, price_1_time: 550 },
      { days: 15, price_3_times: 2600, price_2_times: 2000, price_1_time: 1100 },
      { days: 30, price_3_times: 5100, price_2_times: 3900, price_1_time: 2000 }
    ],
    includes: ['Paratha + Fruit/Curd Breakfast', 'Butter Chicken / Chicken Masala', 'Salad with every meal', 'Chicken Chilli (Sun)']
  }
];

// Add-Ons Registry with per-unit prices
export const MOCK_ADDONS = [
  { id: 'addon_roti', name: 'Extra Phulka Roti', unit_price: 8, credit_price: 6 },
  { id: 'addon_paratha', name: 'Extra Butter Paratha', unit_price: 15, credit_price: 12 },
  { id: 'addon_rice', name: 'Half Steamed Rice', unit_price: 25, credit_price: 20 },
  { id: 'addon_sabzi', name: 'Extra Special Sabzi', unit_price: 35, credit_price: 25 },
  { id: 'addon_egg', name: 'Extra Boiled / Curry Egg (1 pc)', unit_price: 20, credit_price: 15 },
  { id: 'addon_salad', name: 'Green Salad & Raita Bowl', unit_price: 20, credit_price: 15 }
];

// 4 Mock Customer Personas
export const MOCK_CUSTOMERS = {
  'cust_active_1': {
    id: 'cust_active_1',
    name: 'Amit Sharma',
    phone: '9876543210',
    email: 'amit.sharma@example.com',
    area: 'Lalpur',
    address: 'Flat 302, Green Valley Apts, Circular Rd, Lalpur, Ranchi',
    plan_id: 'plan_veg_prime',
    frequency: 'times_2', // Lunch & Dinner
    status: 'active', // 'active' | 'paused_indefinite' | 'stopped_no_balance'
    validity_days_total: 30,
    validity_days_remaining: 19,
    meals_remaining_count: 38,
    start_date: '2026-08-10',
    next_renewal_date: '2026-09-15',
    dues_amount: 0
  },
  'cust_low_validity': {
    id: 'cust_low_validity',
    name: 'Priya Verma',
    phone: '9876543211',
    email: 'priya.v@example.com',
    area: 'Kanke Road',
    address: 'House 14, CMPDI Colony, Kanke Road, Ranchi',
    plan_id: 'plan_nonveg_lite',
    frequency: 'times_3',
    status: 'active',
    validity_days_total: 30,
    validity_days_remaining: 2, // Low balance urgency trigger!
    meals_remaining_count: 6,
    start_date: '2026-07-28',
    next_renewal_date: '2026-08-29',
    dues_amount: 0
  },
  'cust_paused_indefinite': {
    id: 'cust_paused_indefinite',
    name: 'Rahul Sen',
    phone: '9876543212',
    email: 'rahul.sen@example.com',
    area: 'Morabadi',
    address: 'Near Tagore Hill, Morabadi, Ranchi',
    plan_id: 'plan_veg_lite',
    frequency: 'times_2',
    status: 'paused_indefinite', // Paused state to test Resume button
    validity_days_total: 30,
    validity_days_remaining: 14,
    meals_remaining_count: 28,
    start_date: '2026-08-01',
    next_renewal_date: '2026-09-05',
    dues_amount: 0
  },
  'cust_stopped_no_balance': {
    id: 'cust_stopped_no_balance',
    name: 'Vikram Sahay',
    phone: '9876543213',
    email: 'vikram.s@example.com',
    area: 'Doranda',
    address: 'St. Xavier School Lane, Doranda, Ranchi',
    plan_id: 'plan_veg_prime',
    frequency: 'times_1',
    status: 'stopped_no_balance',
    validity_days_total: 30,
    validity_days_remaining: 0,
    meals_remaining_count: 0,
    start_date: '2026-07-15',
    next_renewal_date: '2026-08-15',
    dues_amount: 1450
  }
};

// Meal Sequence for the swipeable carousel (§4a)
export const MOCK_MEALS_SEQUENCE = [
  {
    id: 'meal_prev_1',
    order_id: 'order_101',
    meal_type: 'breakfast',
    date: '2026-08-27',
    dish_name: 'Poha + Sprouts + Jalebi',
    image_url: FOOD_IMAGES.healthy_breakfast,
    estimated_delivery: 'Delivered ~8:30 AM',
    status: 'delivered',
    components: [
      { id: 'c1', name: 'Indori Poha', quantity: 1, base_qty: 1, is_removable: false, extra_unit_price: 25, credit_price: 15 },
      { id: 'c2', name: 'Boiled Moong Sprouts', quantity: 1, base_qty: 1, is_removable: true, extra_unit_price: 20, credit_price: 15 },
      { id: 'c3', name: 'Jalebi (2 pcs)', quantity: 1, base_qty: 1, is_removable: true, extra_unit_price: 20, credit_price: 15 }
    ]
  },
  {
    id: 'meal_current_2',
    order_id: 'order_102',
    meal_type: 'lunch',
    date: '2026-08-27',
    dish_name: 'Aalo Dum + Rice + Fryums',
    image_url: FOOD_IMAGES.aalo_dum,
    estimated_delivery: 'Lunch • Arriving ~1:00 PM',
    status: 'upcoming',
    cutoff_time: '10:00 AM',
    components: [
      { id: 'c1', name: 'Dum Aalo Curry', quantity: 1, base_qty: 1, is_removable: false, extra_unit_price: 35, credit_price: 20 },
      { id: 'c2', name: 'Steamed Basmati Rice', quantity: 1, base_qty: 1, is_removable: true, extra_unit_price: 25, credit_price: 15 },
      { id: 'c3', name: 'Phulka Roti (3 pcs)', quantity: 3, base_qty: 3, is_removable: true, extra_unit_price: 8, credit_price: 6 },
      { id: 'c4', name: 'Crispy Fryums & Pickle', quantity: 1, base_qty: 1, is_removable: true, extra_unit_price: 15, credit_price: 10 }
    ]
  },
  {
    id: 'meal_next_3',
    order_id: 'order_103',
    meal_type: 'dinner',
    date: '2026-08-27',
    dish_name: 'Paneer Butter Masala + Roti',
    image_url: FOOD_IMAGES.paneer_butter,
    estimated_delivery: 'Dinner • Today, ~8:00 PM',
    status: 'upcoming',
    cutoff_time: '5:00 PM',
    components: [
      { id: 'c1', name: 'Paneer Butter Masala', quantity: 1, base_qty: 1, is_removable: false, extra_unit_price: 45, credit_price: 30 },
      { id: 'c2', name: 'Butter Phulka Roti', quantity: 4, base_qty: 4, is_removable: true, extra_unit_price: 8, credit_price: 6 },
      { id: 'c3', name: 'Yellow Dal Tadka', quantity: 1, base_qty: 1, is_removable: true, extra_unit_price: 25, credit_price: 15 },
      { id: 'c4', name: 'Salad & Green Chutney', quantity: 1, base_qty: 1, is_removable: true, extra_unit_price: 15, credit_price: 10 }
    ]
  },
  {
    id: 'meal_next_4',
    order_id: 'order_104',
    meal_type: 'breakfast',
    date: '2026-08-28',
    dish_name: 'Chole Poori + Pickle',
    image_url: FOOD_IMAGES.chole_poori,
    estimated_delivery: 'Breakfast • Tomorrow, ~8:30 AM',
    status: 'upcoming',
    cutoff_time: '5:30 AM',
    components: [
      { id: 'c1', name: 'Amritsari Chole', quantity: 1, base_qty: 1, is_removable: false, extra_unit_price: 35, credit_price: 20 },
      { id: 'c2', name: 'Poori', quantity: 4, base_qty: 4, is_removable: true, extra_unit_price: 10, credit_price: 8 }
    ]
  },
  {
    id: 'meal_next_5',
    order_id: 'order_105',
    meal_type: 'lunch',
    date: '2026-08-28',
    dish_name: 'Dal Makhani + Jeera Rice',
    image_url: FOOD_IMAGES.dal_makhani,
    estimated_delivery: 'Lunch • Tomorrow, ~1:00 PM',
    status: 'upcoming',
    cutoff_time: '10:00 AM',
    components: [
      { id: 'c1', name: 'Dal Makhani', quantity: 1, base_qty: 1, is_removable: false, extra_unit_price: 40, credit_price: 25 },
      { id: 'c2', name: 'Jeera Rice', quantity: 1, base_qty: 1, is_removable: true, extra_unit_price: 25, credit_price: 15 },
      { id: 'c3', name: 'Phulka Roti', quantity: 3, base_qty: 3, is_removable: true, extra_unit_price: 8, credit_price: 6 }
    ]
  }
];

// Admin Daily Sheet Dataset (§5 item 4)
export const MOCK_DAILY_SHEET = [
  {
    id: 'row_1',
    customer_id: 'cust_active_1',
    partner: 'Zomato Delivery',
    area: 'Lalpur',
    customer_name: 'Amit Sharma',
    phone: '9876543210',
    subscription: 'Veg Prime (2x)',
    meal_type: 'lunch',
    roti_count: 3,
    rice_portion: 'Basmati Rice',
    special_notes: 'Extra spicy sabzi',
    delivered: true,
    status: 'delivered'
  },
  {
    id: 'row_2',
    customer_id: 'cust_low_validity',
    partner: 'Swiggy Genie',
    area: 'Kanke Road',
    customer_name: 'Priya Verma',
    phone: '9876543211',
    subscription: 'Non-Veg Lite (3x)',
    meal_type: 'lunch',
    roti_count: 4,
    rice_portion: 'Standard Rice',
    special_notes: 'Egg Curry preferred',
    delivered: false,
    status: 'pending'
  },
  {
    id: 'row_3',
    customer_id: 'cust_paused_indefinite',
    partner: 'In-House Rider',
    area: 'Morabadi',
    customer_name: 'Rahul Sen',
    phone: '9876543212',
    subscription: 'Veg Lite (2x)',
    meal_type: 'lunch',
    roti_count: 3,
    rice_portion: 'Standard Rice',
    special_notes: 'Leave at security gate',
    delivered: false,
    status: 'paused'
  },
  {
    id: 'row_4',
    customer_id: 'cust_4',
    partner: 'In-House Rider',
    area: 'Hinoo',
    customer_name: 'Deepak Kumar',
    phone: '9876543214',
    subscription: 'Non-Veg Prime (2x)',
    meal_type: 'lunch',
    roti_count: 4,
    rice_portion: 'Jeera Rice',
    special_notes: 'Less oil',
    delivered: true,
    status: 'delivered'
  },
  {
    id: 'row_5',
    customer_id: 'cust_5',
    partner: 'Shadowfax',
    area: 'Doranda',
    customer_name: 'Sunita Rao',
    phone: '9876543215',
    subscription: 'Veg Prime (1x)',
    meal_type: 'lunch',
    roti_count: 2,
    rice_portion: 'Brown Rice',
    special_notes: 'No garlic',
    delivered: false,
    status: 'pending'
  }
];

// Kitchen Prep Summary Dataset (§5 item 5)
export const MOCK_KITCHEN_SUMMARY = {
  date: '2026-08-27',
  total_packets_today: 148,
  breakdown: {
    breakfast: {
      total: 38,
      veg_lite: 18,
      veg_prime: 12,
      nonveg_lite: 5,
      nonveg_prime: 3,
      total_rotis_parathas: 114
    },
    lunch: {
      total: 62,
      veg_lite: 24,
      veg_prime: 22,
      nonveg_lite: 10,
      nonveg_prime: 6,
      total_rotis_parathas: 218,
      rice_kg_approx: '18.5 kg'
    },
    dinner: {
      total: 48,
      veg_lite: 19,
      veg_prime: 18,
      nonveg_lite: 7,
      nonveg_prime: 4,
      total_rotis_parathas: 172,
      rice_kg_approx: '12.0 kg'
    }
  },
  area_distribution: [
    { area: 'Lalpur', packets: 42 },
    { area: 'Kanke Road', packets: 36 },
    { area: 'Morabadi', packets: 28 },
    { area: 'Doranda', packets: 24 },
    { area: 'Hinoo', packets: 18 }
  ]
};

// Payment History Mock
export const MOCK_PAYMENTS = [
  {
    id: 'pay_109283',
    date: '2026-08-10 14:22',
    amount: 4399,
    plan_name: 'Veg Prime (2x Daily)',
    method: 'Razorpay UPI (Google Pay)',
    status: 'success',
    invoice_url: '#'
  },
  {
    id: 'pay_107821',
    date: '2026-07-10 10:15',
    amount: 4399,
    plan_name: 'Veg Prime (2x Daily)',
    method: 'Razorpay UPI (PhonePe)',
    status: 'success',
    invoice_url: '#'
  },
  {
    id: 'pay_106512',
    date: '2026-06-10 11:30',
    amount: 4399,
    plan_name: 'Veg Prime (2x Daily)',
    method: 'Net Banking (HDFC)',
    status: 'failed',
    invoice_url: '#'
  }
];
