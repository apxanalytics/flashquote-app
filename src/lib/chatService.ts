import { supabase } from './supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  intent?: string;
  actions?: ChatAction[];
  quickReplies?: string[];
  source?: 'rule' | 'ai';
}

export interface ChatAction {
  label: string;
  type: 'navigate' | 'function' | 'external';
  value: string;
}

export interface ChatIntent {
  intent: string;
  confidence: 'high' | 'medium' | 'low';
  entity?: string;
}

export interface UserContext {
  businessName: string;
  currentPage: string;
  activeJobsCount: number;
  pendingInvoicesCount: number;
  overdueInvoicesCount: number;
  recentActivity: any[];
}

class ChatService {
  private history: ChatMessage[] = [];
  private messageCount: number = 0;
  private lastResetTime: number = Date.now();

  detectIntent(message: string): ChatIntent {
    const msg = message.toLowerCase().trim();

    if ((msg.includes('create') || msg.includes('new') || msg.includes('start')) &&
        (msg.includes('job') || msg.includes('proposal'))) {
      return { intent: 'CREATE_JOB', confidence: 'high' };
    }

    if ((msg.includes('create') || msg.includes('new')) && msg.includes('invoice')) {
      return { intent: 'CREATE_INVOICE', confidence: 'high' };
    }

    if ((msg.includes('status') || msg.includes('check') || msg.includes('find')) &&
        (msg.includes('job') || msg.includes('proposal'))) {
      const customerName = this.extractCustomerName(msg);
      return { intent: 'CHECK_STATUS', confidence: 'high', entity: customerName };
    }

    if (msg.includes('send') && msg.includes('invoice')) {
      return { intent: 'SEND_INVOICE', confidence: 'high' };
    }

    if (msg.includes('overdue') || msg.includes('unpaid') || msg.includes('owe')) {
      return { intent: 'CHECK_OVERDUE', confidence: 'high' };
    }

    if (msg.includes('customer') && (msg.includes('list') || msg.includes('show') || msg.includes('all'))) {
      return { intent: 'LIST_CUSTOMERS', confidence: 'high' };
    }

    if ((msg.includes('how') || msg.includes('help') || msg.includes('guide')) || msg.includes('?')) {
      return { intent: 'HELP', confidence: 'high' };
    }

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      return { intent: 'GREETING', confidence: 'high' };
    }

    return { intent: 'UNKNOWN', confidence: 'low' };
  }

  private extractCustomerName(message: string): string {
    const words = message.split(' ');
    const nameKeywords = ['for', 'from', 'with', 'about'];

    for (let i = 0; i < words.length; i++) {
      if (nameKeywords.includes(words[i].toLowerCase()) && i + 1 < words.length) {
        return words.slice(i + 1).join(' ').replace(/[?.!,]/g, '').trim();
      }
    }

    return '';
  }

  async getUserContext(): Promise<UserContext> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return {
          businessName: 'User',
          currentPage: window.location.pathname,
          activeJobsCount: 0,
          pendingInvoicesCount: 0,
          overdueInvoicesCount: 0,
          recentActivity: []
        };
      }

      const { data: profile } = await supabase
        .from('contractor_profiles')
        .select('business_name')
        .eq('id', user.id)
        .maybeSingle();

      const { count: activeJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_progress']);

      const { count: pendingInvoices } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      const { count: overdueInvoices } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'overdue');

      const { data: recentActivity } = await supabase
        .from('jobs')
        .select('id, title, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        businessName: profile?.business_name || 'User',
        currentPage: window.location.pathname,
        activeJobsCount: activeJobs || 0,
        pendingInvoicesCount: pendingInvoices || 0,
        overdueInvoicesCount: overdueInvoices || 0,
        recentActivity: recentActivity || []
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return {
        businessName: 'User',
        currentPage: window.location.pathname,
        activeJobsCount: 0,
        pendingInvoicesCount: 0,
        overdueInvoicesCount: 0,
        recentActivity: []
      };
    }
  }

  checkRateLimit(): { allowed: boolean; message?: string } {
    const now = Date.now();
    const timeSinceReset = now - this.lastResetTime;

    if (timeSinceReset > 3600000) {
      this.messageCount = 0;
      this.lastResetTime = now;
    }

    if (this.messageCount >= 50) {
      return {
        allowed: false,
        message: "You've reached the message limit (50 per hour). Please try again later or contact support for urgent issues."
      };
    }

    this.messageCount++;
    return { allowed: true };
  }

  addToHistory(role: 'user' | 'assistant', content: string, intent?: string): void {
    this.history.push({
      id: Date.now().toString(),
      role,
      content,
      timestamp: Date.now(),
      intent,
      source: intent ? 'rule' : undefined
    });

    if (this.history.length > 10) {
      this.history.shift();
    }
  }

  getHistory(): ChatMessage[] {
    return this.history;
  }

  clearHistory(): void {
    this.history = [];
  }

  async handleMessage(userMessage: string): Promise<ChatMessage> {
    const rateCheck = this.checkRateLimit();
    if (!rateCheck.allowed) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: rateCheck.message!,
        timestamp: Date.now(),
        source: 'rule'
      };
    }

    this.addToHistory('user', userMessage);

    const { intent, entity } = this.detectIntent(userMessage);

    let response: Partial<ChatMessage>;

    if (intent !== 'UNKNOWN') {
      response = await this.handleIntent(intent, entity, userMessage);
    } else {
      response = await this.handleWithAI(userMessage);
    }

    const message: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response.content || 'I can help you with that.',
      timestamp: Date.now(),
      intent,
      actions: response.actions,
      quickReplies: response.quickReplies,
      source: response.source || 'rule'
    };

    this.addToHistory('assistant', message.content, intent);

    return message;
  }

  private async handleIntent(intent: string, entity?: string, userMessage?: string): Promise<Partial<ChatMessage>> {
    switch (intent) {
      case 'GREETING':
        return this.handleGreeting();
      case 'CREATE_JOB':
        return this.handleCreateJob();
      case 'CREATE_INVOICE':
        return this.handleCreateInvoice();
      case 'CHECK_STATUS':
        return await this.handleCheckStatus(entity);
      case 'CHECK_OVERDUE':
        return await this.handleCheckOverdue();
      case 'LIST_CUSTOMERS':
        return this.handleListCustomers();
      case 'HELP':
        return this.handleHelp(userMessage);
      default:
        return {
          content: "I'm not sure I understood that. Could you rephrase?",
          quickReplies: [
            'Create new job',
            'Check job status',
            'View overdue invoices',
            'List customers'
          ]
        };
    }
  }

  private handleGreeting(): Partial<ChatMessage> {
    const greetings = [
      "Hi! I'm your AI assistant. How can I help you today?",
      "Hello! What can I do for you?",
      "Hey there! Need help with something?",
      "Hi! Ready to help you manage your jobs and invoices."
    ];

    return {
      content: greetings[Math.floor(Math.random() * greetings.length)],
      quickReplies: [
        'Create new job',
        'Check overdue invoices',
        'List all customers',
        'What can you do?'
      ]
    };
  }

  private handleCreateJob(): Partial<ChatMessage> {
    return {
      content: "I'll help you create a new job! Would you like to:",
      actions: [
        { label: 'Start New Job', type: 'navigate', value: '/jobs/new' },
        { label: 'Use Voice Input', type: 'navigate', value: '/jobs/new?voice=true' },
      ],
      quickReplies: [
        'Show me the guide',
        'What info do I need?',
        'Can I use voice?'
      ]
    };
  }

  private handleCreateInvoice(): Partial<ChatMessage> {
    return {
      content: "Let's create an invoice! I can help you:",
      actions: [
        { label: 'Create Invoice', type: 'navigate', value: '/invoices/new' },
        { label: 'View All Invoices', type: 'navigate', value: '/invoices' },
      ],
      quickReplies: [
        'How do I get paid faster?',
        'What payment methods work?',
        'Can AI send it automatically?'
      ]
    };
  }

  private async handleCheckStatus(customerName?: string): Promise<Partial<ChatMessage>> {
    if (!customerName) {
      return {
        content: "I can check job status for you! Which customer are you asking about?",
        actions: [
          { label: 'View All Jobs', type: 'navigate', value: '/jobs' },
          { label: 'View All Customers', type: 'navigate', value: '/customers' }
        ]
      };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          content: "Please log in to check job status.",
          actions: [{ label: 'Log In', type: 'navigate', value: '/login' }]
        };
      }

      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .ilike('name', `%${customerName}%`)
        .limit(5);

      if (!customers || customers.length === 0) {
        return {
          content: `I couldn't find a customer named "${customerName}". Would you like to:`,
          actions: [
            { label: 'View All Customers', type: 'navigate', value: '/customers' },
            { label: 'Create New Customer', type: 'navigate', value: '/customers/new' }
          ],
          quickReplies: ['List all customers', 'Create new job']
        };
      }

      if (customers.length === 1) {
        const customer = customers[0];
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!jobs || jobs.length === 0) {
          return {
            content: `I found ${customer.name}, but they don't have any jobs yet.`,
            actions: [
              { label: 'Create Job', type: 'navigate', value: `/jobs/new?customer=${customer.id}` }
            ]
          };
        }

        const job = jobs[0];
        const statusEmoji = job.status === 'completed' ? '✅' : job.status === 'in_progress' ? '🔄' : '📋';

        return {
          content: `Here's the latest for ${customer.name}:\n\n` +
                   `${statusEmoji} Job: ${job.title}\n` +
                   `💰 Amount: $${job.price || 0}\n` +
                   `📊 Status: ${job.status.replace('_', ' ')}\n` +
                   `📅 Created: ${new Date(job.created_at).toLocaleDateString()}`,
          actions: [
            { label: 'View Job Details', type: 'navigate', value: `/jobs/${job.id}` },
            { label: 'Create Invoice', type: 'navigate', value: `/invoices/new?job=${job.id}` }
          ],
          quickReplies: ['Create invoice for this job', 'Check other customers']
        };
      }

      return {
        content: `I found ${customers.length} customers matching "${customerName}":\n\n` +
                 customers.map(c => `• ${c.name}`).join('\n'),
        actions: [
          { label: 'View All Customers', type: 'navigate', value: '/customers' }
        ],
        quickReplies: ['Show me the first one', 'List all customers']
      };

    } catch (error) {
      console.error('Error checking status:', error);
      return {
        content: "I had trouble checking that. Please try again or view your jobs manually.",
        actions: [
          { label: 'View Jobs', type: 'navigate', value: '/jobs' }
        ]
      };
    }
  }

  private async handleCheckOverdue(): Promise<Partial<ChatMessage>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          content: "Please log in to check overdue invoices.",
          actions: [{ label: 'Log In', type: 'navigate', value: '/login' }]
        };
      }

      const { data: overdueInvoices, count } = await supabase
        .from('invoices')
        .select('*, customers(name)', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'overdue')
        .order('due_date', { ascending: true });

      if (!overdueInvoices || overdueInvoices.length === 0) {
        return {
          content: "Great news! You don't have any overdue invoices. 🎉",
          quickReplies: [
            'Check pending invoices',
            'Create new invoice',
            'View all invoices'
          ]
        };
      }

      const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      const invoiceList = overdueInvoices.slice(0, 5).map(inv => {
        const daysOverdue = Math.floor((Date.now() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24));
        return `• ${inv.customers?.name || 'Unknown'} - $${inv.total || 0} (${daysOverdue} days overdue)`;
      }).join('\n');

      return {
        content: `You have ${count} overdue invoice${count !== 1 ? 's' : ''} totaling $${totalOverdue.toFixed(2)}:\n\n${invoiceList}${count! > 5 ? `\n\n...and ${count! - 5} more` : ''}`,
        actions: [
          { label: 'View All Overdue', type: 'navigate', value: '/invoices?status=overdue' },
          { label: 'Send Reminders', type: 'function', value: 'sendReminders' }
        ],
        quickReplies: [
          'Send payment reminders',
          'Which customer owes most?',
          'View all invoices'
        ]
      };

    } catch (error) {
      console.error('Error checking overdue:', error);
      return {
        content: "I had trouble checking overdue invoices. Please try viewing them manually.",
        actions: [
          { label: 'View Invoices', type: 'navigate', value: '/invoices' }
        ]
      };
    }
  }

  private handleListCustomers(): Partial<ChatMessage> {
    return {
      content: "I can show you your customers!",
      actions: [
        { label: 'View All Customers', type: 'navigate', value: '/customers' },
        { label: 'Add New Customer', type: 'navigate', value: '/customers/new' }
      ],
      quickReplies: [
        'Who owes me money?',
        'Show recent jobs',
        'Create new customer'
      ]
    };
  }

  private handleHelp(userMessage?: string): Partial<ChatMessage> {
    const helpTopics = {
      'proposal': 'To create a proposal, go to Jobs → New Job. You can use voice input or type the details. The AI will generate a professional proposal automatically.',
      'invoice': 'To create an invoice, go to Invoices → New Invoice. Select a completed job or enter details manually. You can send it immediately or save as draft.',
      'payment': 'To get paid faster: 1) Enable auto-reminders in Settings, 2) Offer multiple payment methods, 3) Send invoices immediately after job completion.',
      'ai': 'AI features include: Auto-proposals from voice, smart follow-ups, payment reminders, and this chat assistant. Configure AI behavior in Settings → AI Assistant.',
    };

    if (userMessage) {
      const msg = userMessage.toLowerCase();
      for (const [topic, answer] of Object.entries(helpTopics)) {
        if (msg.includes(topic)) {
          return {
            content: answer,
            actions: [
              { label: 'View Help Center', type: 'navigate', value: '/help' }
            ],
            quickReplies: ['Show me more help topics', 'Contact support']
          };
        }
      }
    }

    return {
      content: "I can help you with:\n\n" +
               "• Creating proposals and jobs\n" +
               "• Sending invoices and tracking payments\n" +
               "• Managing customers\n" +
               "• Understanding AI features\n" +
               "• Troubleshooting issues\n\n" +
               "What would you like help with?",
      actions: [
        { label: 'Help Center', type: 'navigate', value: '/help' },
        { label: 'Watch Tutorials', type: 'navigate', value: '/help/videos' }
      ],
      quickReplies: [
        'How do I create a proposal?',
        'How do I get paid faster?',
        'How does AI work?',
        'Contact support'
      ]
    };
  }

  private async handleWithAI(userMessage: string): Promise<Partial<ChatMessage>> {
    try {
      const context = await this.getUserContext();

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/chat-assistant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context,
          history: this.history.slice(-5)
        }),
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const data = await response.json();

      return {
        content: data.response,
        quickReplies: data.quickReplies || this.getDefaultQuickReplies(),
        source: 'ai'
      };

    } catch (error) {
      console.error('AI error:', error);
      return {
        content: "I'm having trouble processing that right now. Here are some things I can definitely help with:",
        quickReplies: [
          'Create new job',
          'Check overdue invoices',
          'List customers',
          'View help center'
        ],
        source: 'rule'
      };
    }
  }

  private getDefaultQuickReplies(): string[] {
    return [
      'Create new job',
      'Check job status',
      'View overdue invoices',
      'List customers'
    ];
  }
}

export const chatService = new ChatService();
