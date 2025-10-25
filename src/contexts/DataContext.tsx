import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';
import {
  Customer,
  Job,
  Invoice,
  Activity,
  Notification,
  customersAPI,
  jobsAPI,
  invoicesAPI,
  activitiesAPI,
  notificationsAPI,
} from '../lib/api';
import { mockCustomers } from '../data/mockCustomers';
import { mockJobs } from '../data/mockJobs';
import { mockInvoices } from '../data/mockInvoices';

interface DataContextType {
  customers: Customer[];
  jobs: Job[];
  invoices: Invoice[];
  activities: Activity[];
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  refreshData: () => Promise<void>;
  refetchCustomers: () => Promise<void>;
  createCustomer: (customer: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Customer>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  createJob: (job: Omit<Job, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'customer'>) => Promise<Job>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<Job>;
  deleteJob: (id: string) => Promise<void>;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'customer' | 'job' | 'items'>) => Promise<Invoice>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<void>;
  createActivity: (activity: Omit<Activity, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  getJobById: (id: string) => Job | undefined;
  getInvoiceById: (id: string) => Invoice | undefined;
  getCustomerJobs: (customerId: string) => Job[];
  getCustomerInvoices: (customerId: string) => Invoice[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [isDemoMode, setIsDemoMode] = useState(false);
  const [realCustomers, setRealCustomers] = useState<Customer[]>([]);
  const [realJobs, setRealJobs] = useState<Job[]>([]);
  const [realInvoices, setRealInvoices] = useState<Invoice[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const customers = isDemoMode ? mockCustomers : realCustomers;
  const jobs = isDemoMode ? mockJobs : realJobs;
  const invoices = isDemoMode ? mockInvoices : realInvoices;

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
    showToast(isDemoMode ? 'Demo mode disabled - showing real data' : 'Demo mode enabled - showing demo data', 'success');
  };

  const refreshData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [customersData, jobsData, invoicesData, activitiesData, notificationsData] = await Promise.all([
        customersAPI.getAll(),
        jobsAPI.getAll(),
        invoicesAPI.getAll(),
        activitiesAPI.getAll(),
        notificationsAPI.getAll(),
      ]);

      setRealCustomers(customersData);
      setRealJobs(jobsData);
      setRealInvoices(invoicesData);
      setActivities(activitiesData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, showToast]);

  const refetchCustomers = useCallback(async () => {
    if (!user) return;

    try {
      const customersData = await customersAPI.getAll();
      setRealCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const customer = await customersAPI.create({
        ...customerData,
        user_id: profile!.id,
      });
      setRealCustomers(prev => [customer, ...prev]);

      await createActivity({
        entity_type: 'customer',
        entity_id: customer.id,
        action: 'created',
        description: `New customer added: ${customer.name}`,
      });

      showToast(`Customer ${customer.name} added successfully`, 'success');
      return customer;
    } catch (error) {
      showToast('Failed to create customer', 'error');
      throw error;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const customer = await customersAPI.update(id, updates);
      setRealCustomers(prev => prev.map(c => c.id === id ? customer : c));
      showToast('Customer updated successfully', 'success');
      return customer;
    } catch (error) {
      showToast('Failed to update customer', 'error');
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await customersAPI.delete(id);
      setRealCustomers(prev => prev.filter(c => c.id !== id));
      showToast('Customer deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete customer', 'error');
      throw error;
    }
  };

  const createJob = async (jobData: Omit<Job, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'customer'>) => {
    try {
      const job = await jobsAPI.create({
        ...jobData,
        user_id: profile!.id,
      });
      setRealJobs(prev => [job, ...prev]);

      await createActivity({
        entity_type: 'job',
        entity_id: job.id,
        action: 'created',
        description: `New job created: ${job.title}`,
      });

      showToast('Job created successfully', 'success');
      return job;
    } catch (error) {
      showToast('Failed to create job', 'error');
      throw error;
    }
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    try {
      const job = await jobsAPI.update(id, updates);
      setRealJobs(prev => prev.map(j => j.id === id ? job : j));

      if (updates.status) {
        const statusMessages: Record<string, string> = {
          sent: 'Proposal sent to customer',
          viewed: 'Customer viewed proposal',
          signed: 'Proposal signed by customer',
          'in-progress': 'Job in progress',
          completed: 'Job completed',
          paid: 'Payment received',
        };

        const message = statusMessages[updates.status];
        if (message) {
          await createActivity({
            entity_type: 'job',
            entity_id: id,
            action: updates.status,
            description: `${message}: ${job.title}`,
          });
        }
      }

      showToast('Job updated successfully', 'success');
      return job;
    } catch (error) {
      showToast('Failed to update job', 'error');
      throw error;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await jobsAPI.delete(id);
      setRealJobs(prev => prev.filter(j => j.id !== id));
      showToast('Job deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete job', 'error');
      throw error;
    }
  };

  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'customer' | 'job' | 'items'>) => {
    try {
      const invoice = await invoicesAPI.create({
        ...invoiceData,
        user_id: profile!.id,
      });
      setRealInvoices(prev => [invoice, ...prev]);

      await createActivity({
        entity_type: 'invoice',
        entity_id: invoice.id,
        action: 'created',
        description: `Invoice ${invoice.invoice_number} created`,
      });

      showToast('Invoice created successfully', 'success');
      return invoice;
    } catch (error) {
      showToast('Failed to create invoice', 'error');
      throw error;
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const invoice = await invoicesAPI.update(id, updates);
      setRealInvoices(prev => prev.map(i => i.id === id ? invoice : i));

      if (updates.status) {
        const statusMessages: Record<string, string> = {
          sent: 'Invoice sent to customer',
          viewed: 'Customer viewed invoice',
          paid: 'Payment received',
          overdue: 'Invoice is overdue',
        };

        const message = statusMessages[updates.status];
        if (message) {
          await createActivity({
            entity_type: 'invoice',
            entity_id: id,
            action: updates.status,
            description: `${message}: ${invoice.invoice_number}`,
          });
        }
      }

      showToast('Invoice updated successfully', 'success');
      return invoice;
    } catch (error) {
      showToast('Failed to update invoice', 'error');
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await invoicesAPI.delete(id);
      setRealInvoices(prev => prev.filter(i => i.id !== id));
      showToast('Invoice deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete invoice', 'error');
      throw error;
    }
  };

  const createActivity = async (activityData: Omit<Activity, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const activity = await activitiesAPI.create({
        ...activityData,
        user_id: profile!.id,
      });
      setActivities(prev => [activity, ...prev]);
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read', 'success');
    } catch (error) {
      showToast('Failed to mark notifications as read', 'error');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getCustomerById = (id: string) => customers.find(c => c.id === id);
  const getJobById = (id: string) => jobs.find(j => j.id === id);
  const getInvoiceById = (id: string) => invoices.find(i => i.id === id);
  const getCustomerJobs = (customerId: string) => jobs.filter(j => j.customer_id === customerId);
  const getCustomerInvoices = (customerId: string) => invoices.filter(i => i.customer_id === customerId);

  return (
    <DataContext.Provider
      value={{
        customers,
        jobs,
        invoices,
        activities,
        notifications,
        unreadCount,
        isLoading,
        isDemoMode,
        toggleDemoMode,
        refreshData,
        refetchCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        createJob,
        updateJob,
        deleteJob,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        createActivity,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        getCustomerById,
        getJobById,
        getInvoiceById,
        getCustomerJobs,
        getCustomerInvoices,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
