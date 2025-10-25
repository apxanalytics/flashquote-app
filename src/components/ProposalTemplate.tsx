import { Download, Printer, Check } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';

interface Photo {
  url: string;
  caption?: string;
  tag?: 'before' | 'after';
}

interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  price: number;
}

interface ProposalData {
  proposalNumber: string;
  date: string;
  validUntil: string;
  businessName: string;
  businessLogo?: string;
  businessPhone: string;
  businessEmail: string;
  businessWebsite?: string;
  licenseNumber?: string;
  businessAddress: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  projectTitle: string;
  projectLocation: string;
  estimatedDuration: string;
  startDate: string;
  photos: Photo[];
  scopeOfWork: string[];
  materials: LineItem[];
  laborDescription: string;
  laborHours: number;
  laborRate: number;
  timeline: {
    duration: string;
    startDate: string;
    completionDate: string;
  };
  subtotalMaterials: number;
  subtotalLabor: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  depositPercent: number;
  depositAmount: number;
  balanceDue: number;
  terms: string;
}

interface ProposalTemplateProps {
  data: ProposalData;
  onAccept?: () => void;
  showActions?: boolean;
}

export default function ProposalTemplate({ data, onAccept, showActions = true }: ProposalTemplateProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const renderPhotoGrid = () => {
    const photoCount = data.photos.length;

    let gridClass = 'grid gap-4';
    if (photoCount === 1 || photoCount === 2) {
      gridClass += ' grid-cols-1';
    } else if (photoCount === 3 || photoCount === 4) {
      gridClass += ' grid-cols-2';
    } else {
      gridClass += ' grid-cols-3';
    }

    return (
      <div className={gridClass}>
        {data.photos.map((photo, index) => (
          <div key={index} className="relative">
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={photo.url}
                alt={photo.caption || `Project photo ${index + 1}`}
                className="w-full h-64 object-cover"
              />
            </div>
            {photo.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center">{photo.caption}</p>
            )}
            {photo.tag && (
              <span className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${
                photo.tag === 'before' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}>
                {photo.tag.toUpperCase()}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="proposal-template bg-white">
      {showActions && (
        <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Proposal Preview</h2>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            {onAccept && (
              <button
                onClick={onAccept}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg"
              >
                <Check className="w-5 h-5" />
                Accept & Sign
              </button>
            )}
          </div>
        </div>
      )}

      <div className="proposal-content max-w-5xl mx-auto p-8 print:p-0">
        <div className="mb-8 flex justify-between items-start border-b-2 border-gray-300 pb-6">
          <div className="flex items-center">
            {data.businessLogo ? (
              <img src={data.businessLogo} alt={data.businessName} className="h-16 w-auto" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{data.businessName}</div>
            )}
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-gray-900">{data.businessName}</p>
            <p className="text-gray-600">
              <a href={`tel:${data.businessPhone}`} className="hover:text-blue-600">{data.businessPhone}</a>
            </p>
            <p className="text-gray-600">
              <a href={`mailto:${data.businessEmail}`} className="hover:text-blue-600">{data.businessEmail}</a>
            </p>
            {data.businessWebsite && (
              <p className="text-gray-600">{data.businessWebsite}</p>
            )}
            {data.licenseNumber && (
              <p className="text-gray-600">License #{data.licenseNumber}</p>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PROPOSAL</h1>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-600">Proposal #: <span className="font-semibold text-gray-900">{data.proposalNumber}</span></p>
              <p className="text-gray-600">Date: <span className="font-semibold text-gray-900">{data.date}</span></p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Valid Until: <span className="font-semibold text-gray-900">{data.validUntil}</span></p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <h3 className="font-bold text-gray-900 mb-3">Prepared For:</h3>
            <p className="font-semibold text-gray-900">{data.customerName}</p>
            <p className="text-gray-600 text-sm">{data.customerAddress}</p>
            <p className="text-gray-600 text-sm">{data.customerPhone}</p>
            <p className="text-gray-600 text-sm">{data.customerEmail}</p>
          </div>

          <div className="border-2 border-gray-300 rounded-lg p-4 bg-blue-50">
            <h3 className="font-bold text-gray-900 mb-3">Project Information:</h3>
            <p className="text-sm"><span className="font-semibold">Project:</span> {data.projectTitle}</p>
            <p className="text-sm"><span className="font-semibold">Location:</span> {data.projectLocation}</p>
            <p className="text-sm"><span className="font-semibold">Duration:</span> {data.estimatedDuration}</p>
            <p className="text-sm"><span className="font-semibold">Start Date:</span> {data.startDate}</p>
          </div>
        </div>

        {data.photos.length > 0 && (
          <div className="mb-8 page-break-before">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
              Project Site Photos
            </h2>
            {renderPhotoGrid()}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
            Scope of Work
          </h2>
          <ul className="space-y-2">
            {data.scopeOfWork.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
            Materials & Supplies
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left p-3 font-semibold text-gray-900">Item Description</th>
                <th className="text-center p-3 font-semibold text-gray-900">Quantity</th>
                <th className="text-center p-3 font-semibold text-gray-900">Unit</th>
                <th className="text-right p-3 font-semibold text-gray-900">Price</th>
                <th className="text-right p-3 font-semibold text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.materials.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-3 text-gray-700">{item.description}</td>
                  <td className="p-3 text-center text-gray-700">{item.quantity}</td>
                  <td className="p-3 text-center text-gray-700">{item.unit}</td>
                  <td className="p-3 text-right text-gray-700">{formatCurrency(item.price)}</td>
                  <td className="p-3 text-right font-semibold text-gray-900">
                    {formatCurrency(item.quantity * item.price)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={4} className="p-3 text-right text-gray-900">Subtotal Materials:</td>
                <td className="p-3 text-right text-gray-900">{formatCurrency(data.subtotalMaterials)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
            Labor & Installation
          </h2>
          <p className="text-gray-700 mb-3">{data.laborDescription}</p>
          <p className="text-gray-700">
            Estimated hours: <span className="font-semibold">{data.laborHours}</span> @ {formatCurrency(data.laborRate)}/hour
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-4">
            Subtotal Labor: {formatCurrency(data.subtotalLabor)}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
            Project Timeline
          </h2>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Estimated Duration:</span> {data.timeline.duration}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Proposed Start Date:</span> {data.timeline.startDate}
            </p>
            <p className="text-gray-700 mb-3">
              <span className="font-semibold">Estimated Completion:</span> {data.timeline.completionDate}
            </p>
            <p className="text-sm text-gray-600 italic">
              *Timeline may vary based on weather and material availability
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="border-4 border-blue-600 rounded-lg p-6 bg-blue-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">INVESTMENT SUMMARY</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Materials</span>
                <span>{formatCurrency(data.subtotalMaterials)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Labor</span>
                <span>{formatCurrency(data.subtotalLabor)}</span>
              </div>
              <div className="border-t-2 border-gray-300 my-2"></div>
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>{formatCurrency(data.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Sales Tax ({(data.taxRate * 100).toFixed(1)}%)</span>
                <span>{formatCurrency(data.taxAmount)}</span>
              </div>
              <div className="border-t-2 border-gray-400 my-2"></div>
              <div className="flex justify-between text-2xl font-bold text-gray-900">
                <span>TOTAL INVESTMENT</span>
                <span>{formatCurrency(data.total)}</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t-2 border-blue-300">
              <div className="flex justify-between text-lg font-semibold text-gray-900 mb-2">
                <span>Deposit Required ({data.depositPercent}%):</span>
                <span>{formatCurrency(data.depositAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-gray-900">
                <span>Balance Due Upon Completion:</span>
                <span>{formatCurrency(data.balanceDue)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
            Terms & Conditions
          </h2>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {data.terms}
          </div>
        </div>

        <div className="mb-8 border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Proposal Acceptance</h2>
          <p className="text-gray-700 mb-6">
            By signing below, you accept this proposal and authorize {data.businessName} to begin work.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-600 mb-2">Customer Signature:</p>
              <div className="border-b-2 border-gray-400 h-16"></div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Date:</p>
              <div className="border-b-2 border-gray-400 h-16"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 italic">
            (Digital signature via DocuSign when sent electronically)
          </p>
        </div>

        <div className="text-center py-6 border-t-2 border-gray-300 mt-8">
          <p className="text-gray-700 font-semibold mb-2">
            {data.businessName} • {data.businessPhone} • {data.businessEmail}
            {data.licenseNumber && ` • License #${data.licenseNumber}`}
          </p>
          <p className="text-gray-600 italic">Thank you for considering us for your project!</p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }

          .proposal-content {
            max-width: 100%;
            padding: 0;
          }

          .page-break-before {
            page-break-before: always;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          @page {
            margin: 1in;
            size: letter;
          }
        }
      `}</style>
    </div>
  );
}
