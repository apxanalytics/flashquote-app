export interface VideoTutorial {
  id: number;
  title: string;
  duration: string;
  videoId: string;
  description: string;
  thumbnail: string;
  category: string;
}

export const videoTutorials: VideoTutorial[] = [
  {
    id: 1,
    title: 'Welcome to FlashQuote - Quick Start',
    duration: '2:45',
    videoId: 'dQw4w9WgXcQ',
    description: 'Get started in under 3 minutes - see how FlashQuote works from job site to payment',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    category: 'getting-started'
  },
  {
    id: 2,
    title: 'Creating Your First Proposal',
    duration: '3:24',
    videoId: 'dQw4w9WgXcQ',
    description: 'Follow along as we walk a real job site and create a professional proposal with voice input',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    category: 'proposals'
  },
  {
    id: 3,
    title: 'Mastering Voice Input',
    duration: '2:15',
    videoId: 'dQw4w9WgXcQ',
    description: 'Learn how to talk naturally to your AI assistant and get accurate proposals every time',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    category: 'voice'
  },
  {
    id: 4,
    title: 'Sending and Tracking Proposals',
    duration: '3:45',
    videoId: 'dQw4w9WgXcQ',
    description: 'See how customers receive proposals and learn to track opens and engagement',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    category: 'proposals'
  },
  {
    id: 5,
    title: 'Converting Proposals to Invoices',
    duration: '2:50',
    videoId: 'dQw4w9WgXcQ',
    description: 'Mark jobs complete and generate invoices automatically - it takes 30 seconds',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    category: 'invoicing'
  },
  {
    id: 6,
    title: 'Setting Up Stripe Payments',
    duration: '4:10',
    videoId: 'dQw4w9WgXcQ',
    description: 'Connect Stripe and start accepting credit card payments - money in your bank in 1-2 days',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    category: 'payments'
  },
  {
    id: 7,
    title: 'Customizing Your AI Settings',
    duration: '3:30',
    videoId: 'dQw4w9WgXcQ',
    description: 'Configure pricing, writing style, and how your AI assistant behaves',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    category: 'settings'
  },
  {
    id: 8,
    title: 'Managing Customers and Jobs',
    duration: '2:55',
    videoId: 'dQw4w9WgXcQ',
    description: 'Track all your customers, see job history, and manage your pipeline',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    category: 'management'
  },
  {
    id: 9,
    title: 'Mobile App Tips and Tricks',
    duration: '3:15',
    videoId: 'dQw4w9WgXcQ',
    description: 'Pro tips for using FlashQuote on your phone at job sites',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    category: 'mobile'
  },
  {
    id: 10,
    title: 'Dashboard Overview',
    duration: '2:40',
    videoId: 'dQw4w9WgXcQ',
    description: 'Tour your dashboard and learn where everything is',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    category: 'getting-started'
  }
];

export const videoCategories = [
  { id: 'all', label: 'All Videos' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'proposals', label: 'Proposals' },
  { id: 'voice', label: 'Voice Input' },
  { id: 'invoicing', label: 'Invoicing' },
  { id: 'payments', label: 'Payments' },
  { id: 'settings', label: 'Settings' },
  { id: 'management', label: 'Management' },
  { id: 'mobile', label: 'Mobile App' }
];
