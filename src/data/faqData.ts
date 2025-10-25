export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const faqData: FAQ[] = [
  {
    id: 1,
    category: 'getting-started',
    question: 'Do I need any special equipment?',
    answer: 'Just a smartphone! FlashQuote works on iPhone (iOS 14+) and Android (10+). You can also use it on a computer, but the magic happens on your phone at job sites.',
    keywords: ['equipment', 'phone', 'requirements', 'smartphone', 'device']
  },
  {
    id: 2,
    category: 'getting-started',
    question: 'How long does setup take?',
    answer: 'About 10-15 minutes total. Follow our 5-step Getting Started Guide and you\'ll be ready to create your first proposal.',
    keywords: ['setup', 'time', 'getting started', 'onboarding', 'how long']
  },
  {
    id: 3,
    category: 'creating-proposals',
    question: 'How do I create a proposal?',
    answer: '1. Tap "New Job"\n2. Enter customer name and phone\n3. Tap the microphone and talk while walking the job\n4. Take photos\n5. Tap "Generate Proposal"\n6. Review and send\n\nThe whole process takes about 10 minutes.',
    keywords: ['create', 'proposal', 'how to', 'new job', 'make proposal']
  },
  {
    id: 4,
    category: 'creating-proposals',
    question: 'What should I say when recording?',
    answer: 'Just describe what you see naturally, like you\'re talking to a helper:\n\n"This kitchen is about 12 by 15 feet. They want to replace all the cabinets - looks like 15 upper cabinets and 12 lower cabinets. New countertops, probably quartz. The backsplash needs updating too. Appliances stay. Should take about 5 to 6 days."\n\nThe AI understands contractor language and extracts the important details.',
    keywords: ['voice', 'recording', 'what to say', 'talk', 'describe']
  },
  {
    id: 5,
    category: 'voice-input',
    question: 'Does voice input work offline?',
    answer: 'The voice recording works offline, but generating the proposal requires internet. Record your walkthrough, then generate when you have signal.',
    keywords: ['offline', 'internet', 'voice', 'recording', 'no connection']
  },
  {
    id: 6,
    category: 'voice-input',
    question: 'Can I edit the AI-generated proposal?',
    answer: 'Yes! After the AI generates the proposal, you can edit every field - prices, descriptions, timeline, everything. Think of the AI as your first draft that you refine.',
    keywords: ['edit', 'change', 'modify', 'adjust', 'customize']
  },
  {
    id: 7,
    category: 'sending-tracking',
    question: 'How do customers receive proposals?',
    answer: 'They get a text message (and/or email) with a link:\n\n"Hi Sarah! Here\'s your bathroom remodel proposal from Mike\'s Remodeling. Tap to view and sign: [link]"\n\nWhen they tap the link, they see the proposal on their phone. They can sign with their finger.',
    keywords: ['send', 'customer', 'receive', 'text', 'email', 'delivery']
  },
  {
    id: 8,
    category: 'sending-tracking',
    question: 'How do I know if they viewed my proposal?',
    answer: 'You get a notification: "Sarah Williams viewed your proposal."\n\nYour dashboard shows:\n• Sent (not opened yet)\n• Viewed (they looked at it)\n• Viewed 3x (they\'re seriously considering it)',
    keywords: ['tracking', 'viewed', 'notification', 'status', 'opened']
  },
  {
    id: 9,
    category: 'sending-tracking',
    question: 'Can I resend a proposal?',
    answer: 'Yes! Go to the job details and tap "Resend Proposal." You can also edit it first if you want to adjust pricing or details.',
    keywords: ['resend', 'send again', 'forward', 'share']
  },
  {
    id: 10,
    category: 'invoicing-payments',
    question: 'How do I create an invoice?',
    answer: 'Two ways:\n1. When you mark a job "Complete," AI asks: "Create invoice now?" Tap yes.\n2. Go to job detail, tap "Create Invoice" button.\n\nThe invoice auto-fills from the proposal. Adjust if you did any extra work, then send.',
    keywords: ['invoice', 'create', 'billing', 'payment', 'bill']
  },
  {
    id: 11,
    category: 'invoicing-payments',
    question: 'How do customers pay invoices?',
    answer: 'They get a text/email with payment link. They tap it, enter credit card info, done. Money hits your bank in 1-2 days.\n\n(Requires Stripe connection - see Settings → Payment Settings)',
    keywords: ['pay', 'payment', 'customer pay', 'credit card', 'online payment']
  },
  {
    id: 12,
    category: 'invoicing-payments',
    question: 'What payment methods are accepted?',
    answer: 'Credit cards (Visa, Mastercard, Amex, Discover), debit cards, and Apple Pay through Stripe. You can also manually mark cash/check payments as paid.',
    keywords: ['payment methods', 'credit card', 'debit', 'apple pay', 'cash']
  },
  {
    id: 13,
    category: 'customers-jobs',
    question: 'How do I add a new customer?',
    answer: 'You don\'t need to add customers separately. When you create a new job, just enter their name and phone number. The system automatically creates the customer record.',
    keywords: ['customer', 'add', 'new', 'contact', 'client']
  },
  {
    id: 14,
    category: 'customers-jobs',
    question: 'Can I track multiple jobs for the same customer?',
    answer: 'Yes! All jobs are linked to customers. Visit the customer\'s profile to see all past and current jobs, plus total revenue from that customer.',
    keywords: ['multiple jobs', 'customer history', 'repeat customer', 'track']
  },
  {
    id: 15,
    category: 'ai-settings',
    question: 'How do I adjust my AI\'s pricing?',
    answer: 'Go to Settings → AI Configuration. Set your hourly rate, material markup percentage, and regional cost adjustments. The AI uses these to calculate prices.',
    keywords: ['pricing', 'ai settings', 'hourly rate', 'configure', 'adjust']
  },
  {
    id: 16,
    category: 'ai-settings',
    question: 'Can I change the AI\'s writing style?',
    answer: 'Yes! In Settings → AI Configuration, choose:\n• Professional (formal)\n• Friendly (conversational)\n• Technical (detailed)\n\nYou can also add custom phrases the AI should include.',
    keywords: ['writing style', 'tone', 'professional', 'friendly', 'customize']
  },
  {
    id: 17,
    category: 'troubleshooting',
    question: 'My voice recording isn\'t working',
    answer: 'Check:\n1. Microphone permissions (Settings → Privacy → Microphone)\n2. Try reloading the app\n3. Check if your browser/device supports voice recording\n4. Try using Chrome browser (best compatibility)',
    keywords: ['voice not working', 'microphone', 'recording broken', 'audio problem']
  },
  {
    id: 18,
    category: 'troubleshooting',
    question: 'The AI generated weird prices',
    answer: 'This usually means your hourly rate or material markup isn\'t set. Go to Settings → AI Configuration and set your pricing defaults. Then regenerate the proposal.',
    keywords: ['wrong price', 'pricing error', 'incorrect cost', 'bad estimate']
  },
  {
    id: 19,
    category: 'troubleshooting',
    question: 'I can\'t send proposals',
    answer: 'Check:\n1. Customer has valid phone number or email\n2. You have active subscription\n3. Check your communication settings\n4. Try the web version if on mobile',
    keywords: ['cant send', 'send not working', 'proposal wont send', 'error sending']
  },
  {
    id: 20,
    category: 'billing-account',
    question: 'How much does FlashQuote cost?',
    answer: '$99/month (or $79/month if you pay annually).\n\nIncludes:\n✓ Unlimited proposals\n✓ Unlimited invoices\n✓ Unlimited customers\n✓ All AI features\n✓ Payment processing (Stripe fees separate)\n✓ Email & text support',
    keywords: ['cost', 'price', 'pricing', 'subscription', 'how much']
  },
  {
    id: 21,
    category: 'billing-account',
    question: 'Can I cancel anytime?',
    answer: 'Yes! Cancel anytime from Settings → Billing. No contracts, no cancellation fees. Your data stays accessible for 30 days after cancellation.',
    keywords: ['cancel', 'cancellation', 'subscription', 'stop service']
  },
  {
    id: 22,
    category: 'billing-account',
    question: 'What are the payment processing fees?',
    answer: 'Stripe charges 2.9% + $0.30 per transaction. This is standard for online payments and goes to Stripe (not us). The money goes directly to your bank account.',
    keywords: ['fees', 'stripe fees', 'transaction cost', 'processing fees']
  },
  {
    id: 23,
    category: 'security-privacy',
    question: 'Is my data secure?',
    answer: 'Yes. All data is encrypted in transit (SSL) and at rest. We\'re hosted on enterprise-grade servers. We never share your customer data. Full details in our Privacy Policy.',
    keywords: ['security', 'secure', 'safe', 'privacy', 'data protection']
  },
  {
    id: 24,
    category: 'security-privacy',
    question: 'Do you sell my data?',
    answer: 'Never. Your customer data is yours. We don\'t sell it, rent it, or share it with anyone. We make money from subscriptions, not data.',
    keywords: ['sell data', 'privacy', 'data sharing', 'third party']
  },
  {
    id: 25,
    category: 'security-privacy',
    question: 'What happens to my data if I cancel?',
    answer: 'Your data stays accessible (read-only) for 30 days. During this time, you can export everything. After 30 days, it\'s permanently deleted.',
    keywords: ['cancel', 'data deletion', 'export', 'download data']
  }
];

export const categories = [
  { id: 'all', label: 'All Questions', icon: '📚' },
  { id: 'getting-started', label: 'Getting Started', icon: '🚀' },
  { id: 'creating-proposals', label: 'Creating Proposals', icon: '📝' },
  { id: 'voice-input', label: 'Voice Input', icon: '🎤' },
  { id: 'sending-tracking', label: 'Sending & Tracking', icon: '📤' },
  { id: 'invoicing-payments', label: 'Invoicing & Payments', icon: '💰' },
  { id: 'customers-jobs', label: 'Customers & Jobs', icon: '👥' },
  { id: 'ai-settings', label: 'AI Settings', icon: '⚙️' },
  { id: 'troubleshooting', label: 'Troubleshooting', icon: '🔧' },
  { id: 'billing-account', label: 'Billing & Account', icon: '💳' },
  { id: 'security-privacy', label: 'Security & Privacy', icon: '🔒' }
];
