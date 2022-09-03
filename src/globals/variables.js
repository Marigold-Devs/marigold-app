// Constants
export const APP_KEY = 'marigold_app';
export const GENERIC_ERROR_MESSAGE =
  'An error occurred while processing your request';

export const EMPTY_CHARACTER = '—';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export const SEARCH_DEBOUNCE_MS = 500;

// Others
export const userTypes = {
  MANAGER: 'manager',
  PERSONNEL: 'personnel',
};

export const clientTypes = {
  SUPPLIER: 'supplier',
  CUSTOMER: 'customer',
};

export const vatTypes = {
  VAT: 'vat',
  VAT_E: 'vat-e',
};

export const priceTypes = {
  DELIVERY: 'delivery',
  MARKET: 'market',
  PICKUP: 'pickup',
  SPECIAL: 'special',
};

export const productStatuses = {
  AVAILABLE: 'available',
  REORDER: 'reorder',
  OUT_OF_STOCK: 'out_of_stock',
};

export const preorderStatuses = {
  APPROVED: 'approved',
  PENDING: 'pending',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const deliveryStatuses = {
  PENDING: 'pending',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const paymentStatuses = {
  PAID: 'paid',
  UNPAID: 'unpaid',
};

export const deliveryTypes = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
  MARKET: 'market',
  SPECIAL: 'special',
};

export const dateRangeTypes = {
  DAILY: 'daily',
  MONTHLY: 'monthly',
  DATE_RANGE: 'date_range',
};
