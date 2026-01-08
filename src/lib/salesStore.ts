export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  vatId: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  address: string;
  createdAt: number;
  createdBy: string;
}

export interface ActivityLog {
  id: string;
  date: number;
  salesPerson: string;
  customerId: string;
  customerName: string;
  planSlug: string;
  planName: string;
  action: 'link_created' | 'checkout_opened' | 'paid' | 'pending';
  paymentMethod?: string;
  link?: string;
}

// Mock storage functions
export const getCustomers = (): Customer[] => {
  const stored = localStorage.getItem('winerim_customers');
  return stored ? JSON.parse(stored) : [];
};

export const saveCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  const existing = customers.findIndex(c => c.id === customer.id);
  if (existing >= 0) {
    customers[existing] = customer;
  } else {
    customers.push(customer);
  }
  localStorage.setItem('winerim_customers', JSON.stringify(customers));
};

export const getActivityLogs = (): ActivityLog[] => {
  const stored = localStorage.getItem('winerim_activity_logs');
  return stored ? JSON.parse(stored) : [];
};

export const saveActivityLog = (log: ActivityLog): void => {
  const logs = getActivityLogs();
  logs.unshift(log); // Add to beginning
  localStorage.setItem('winerim_activity_logs', JSON.stringify(logs.slice(0, 100))); // Keep last 100
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
