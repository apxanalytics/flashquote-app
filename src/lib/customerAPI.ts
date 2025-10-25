import { database } from './database';
import type { Customer } from './types';

export const customerAPI = {
  async create(data: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    return database.customers.create(data);
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    return database.customers.update(id, data);
  },

  async delete(id: string): Promise<void> {
    return database.customers.delete(id);
  },
};

declare global {
  interface Window {
    customerAPI: typeof customerAPI;
  }
}

if (typeof window !== 'undefined') {
  window.customerAPI = customerAPI;
}
