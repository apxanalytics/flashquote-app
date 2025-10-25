import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProposalTemplate from '../components/ProposalTemplate';
import InvoiceTemplate from '../components/InvoiceTemplate';

export default function TemplatePreviewPage() {
  const [activeTemplate, setActiveTemplate] = useState<'proposal' | 'invoice'>('proposal');

  const sampleProposalData = {
    proposalNumber: 'PROP-2024-001',
    date: 'October 16, 2024',
    validUntil: 'November 15, 2024',
    businessName: "Mike's Remodeling",
    businessPhone: '(555) 123-4567',
    businessEmail: 'mike@mikesremodeling.com',
    businessWebsite: 'www.mikesremodeling.com',
    licenseNumber: 'CL-12345',
    businessAddress: '123 Main Street, Suite 100, Austin, TX 78701',
    customerName: 'Sarah Williams',
    customerAddress: '456 Oak Avenue, Austin, TX 78702',
    customerPhone: '(555) 987-6543',
    customerEmail: 'sarah@email.com',
    projectTitle: 'Bathroom Remodel',
    projectLocation: '456 Oak Avenue, Austin, TX 78702',
    estimatedDuration: '4 business days',
    startDate: 'November 1, 2024',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800',
        caption: 'Bathroom - Existing floor tile',
        tag: 'before' as const,
      },
      {
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
        caption: 'Bathroom - Wall condition',
      },
      {
        url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800',
        caption: 'Bathroom - Current fixtures',
      },
    ],
    scopeOfWork: [
      'Remove existing floor and wall tile',
      'Inspect and repair subfloor as needed',
      'Install new ceramic floor tile (90 sq ft)',
      'Install new wall tile halfway up walls (170 sq ft)',
      'Re-install toilet and ensure proper sealing',
      'Clean and haul away all debris',
      'Final inspection and walk-through',
    ],
    materials: [
      { description: 'Ceramic floor tile (12x12 inch)', quantity: 90, unit: 'sq ft', price: 4.50 },
      { description: 'Wall tile (4x4 inch)', quantity: 170, unit: 'sq ft', price: 3.25 },
      { description: 'Thinset mortar', quantity: 3, unit: 'bags', price: 22.00 },
      { description: 'Grout (sanded)', quantity: 2, unit: 'bags', price: 18.00 },
      { description: 'Tile spacers and supplies', quantity: 1, unit: 'lot', price: 45.00 },
    ],
    laborDescription: 'Professional tile installation and finishing',
    laborHours: 32,
    laborRate: 85.00,
    timeline: {
      duration: '4 business days',
      startDate: 'November 1, 2024',
      completionDate: 'November 6, 2024',
    },
    subtotalMaterials: 1023.50,
    subtotalLabor: 2720.00,
    subtotal: 3743.50,
    taxRate: 0.085,
    taxAmount: 318.20,
    total: 4061.70,
    depositPercent: 50,
    depositAmount: 2030.85,
    balanceDue: 2030.85,
    terms: `Payment Terms: Net 15 days from invoice date
Deposit: 50% deposit required to begin work
Balance Due: Upon completion of work
Warranty: 1 year warranty on workmanship
Change Orders: Any changes to the original scope of work will be subject to additional charges
Permits: Customer is responsible for obtaining necessary permits if required by local ordinance
Liability: Mike's Remodeling carries general liability insurance and workers compensation
Cancellation: 48 hours notice required for cancellation without penalty`,
  };

  const sampleInvoiceData = {
    invoiceNumber: 'INV-2024-001',
    invoiceDate: 'November 8, 2024',
    dueDate: 'November 23, 2024',
    originalProposalNumber: 'PROP-2024-001',
    projectCompletedDate: 'November 6, 2024',
    businessName: "Mike's Remodeling",
    businessPhone: '(555) 123-4567',
    businessEmail: 'mike@mikesremodeling.com',
    businessWebsite: 'www.mikesremodeling.com',
    licenseNumber: 'CL-12345',
    businessAddress: '123 Main Street, Suite 100, Austin, TX 78701',
    customerName: 'Sarah Williams',
    customerAddress: '456 Oak Avenue, Austin, TX 78702',
    customerPhone: '(555) 987-6543',
    customerEmail: 'sarah@email.com',
    projectTitle: 'Bathroom Remodel',
    projectLocation: '456 Oak Avenue, Austin, TX 78702',
    materials: [
      { description: 'Ceramic floor tile (12x12 inch)', quantity: 90, unit: 'sq ft', price: 4.50 },
      { description: 'Wall tile (4x4 inch)', quantity: 170, unit: 'sq ft', price: 3.25 },
      { description: 'Thinset mortar', quantity: 3, unit: 'bags', price: 22.00 },
      { description: 'Grout (sanded)', quantity: 2, unit: 'bags', price: 18.00 },
      { description: 'Tile spacers and supplies', quantity: 1, unit: 'lot', price: 45.00 },
    ],
    laborDescription: 'Professional tile installation and finishing',
    laborHours: 32,
    laborRate: 85.00,
    subtotalMaterials: 1023.50,
    subtotalLabor: 2720.00,
    subtotal: 3743.50,
    taxRate: 0.085,
    taxAmount: 318.20,
    total: 4061.70,
    depositPaid: 2030.85,
    previousPayments: 0,
    balanceDue: 2030.85,
    paymentTerms: 'Net 15',
    lateFeePercent: 1.5,
    lateFeeDays: 30,
    stripePaymentLink: 'https://pay.stripe.com/invoice/example',
    bankName: 'First National Bank',
    routingNumber: '123456789',
    accountNumber: '****1234',
    completedPhotos: [
      {
        url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800',
        caption: 'Before - Old cracked tile',
        tag: 'before' as const,
      },
      {
        url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800',
        caption: 'After - New tile installation',
        tag: 'after' as const,
      },
      {
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
        caption: 'Completed bathroom overview',
      },
    ],
  };

  return (
          <div className="max-w-7xl mx-auto px-4 pb-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Template Preview</h1>
          <p className="text-xl text-gray-600">
            See how your professional proposals and invoices will look
          </p>
        </div>

        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setActiveTemplate('proposal')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTemplate === 'proposal'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-600'
            }`}
          >
            Proposal Template
          </button>
          <button
            onClick={() => setActiveTemplate('invoice')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTemplate === 'invoice'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-600'
            }`}
          >
            Invoice Template
          </button>
        </div>

        <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-6">
          {activeTemplate === 'proposal' ? (
            <ProposalTemplate data={sampleProposalData} showActions={true} />
          ) : (
            <InvoiceTemplate data={sampleInvoiceData} showActions={true} />
          )}
        </div>

        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3">About These Templates</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">•</span>
              <span>Professional, print-quality layouts optimized for PDF generation</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">•</span>
              <span>Automatic photo organization with before/after comparison support</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">•</span>
              <span>Mobile-responsive design for customer viewing on any device</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">•</span>
              <span>Clickable phone numbers and email addresses for easy contact</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">•</span>
              <span>Clear pricing breakdown with materials, labor, and tax calculations</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">•</span>
              <span>Multiple payment options displayed prominently on invoices</span>
            </li>
          </ul>
        </div>
      </div>
  );
}
