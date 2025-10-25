import { Download, Printer, CreditCard, DollarSign } from 'lucide-react';
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

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  originalProposalNumber?: string;
  projectCompletedDate: string;
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
  materials: LineItem[];
  laborDescription: string;
  laborHours: number;
  laborRate: number;
  subtotalMaterials: number;
  subtotalLabor: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  depositPaid: number;
  previousPayments: number;
  balanceDue: number;
  paymentTerms: string;
  lateFeePercent?: number;
  lateFeeDays?: number;
  stripePaymentLink?: string;
  bankName?: string;
  routingNumber?: string;
  accountNumber?: string;
  completedPhotos: Photo[];
}

interface InvoiceTemplateProps {
  data: InvoiceData;
  onPay?: () => void;
  showActions?: boolean;
}

export default function InvoiceTemplate({ data, onPay, showActions = true }: InvoiceTemplateProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const renderPhotoGrid = () => {
    const beforePhotos = data.completedPhotos.filter(p => p.tag === 'before');
    const afterPhotos = data.completedPhotos.filter(p => p.tag === 'after');

    if (beforePhotos.length > 0 && afterPhotos.length > 0) {
      return (
        <div className="space-y-6">
          {beforePhotos.map((beforePhoto, index) => {
            const afterPhoto = afterPhotos[index];
            if (!afterPhoto) return null;

            return (
              <div key={index} className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 relative">
                    <img
                      src={beforePhoto.url}
                      alt={beforePhoto.caption || 'Before'}
                      className="w-full h-64 object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      BEFORE
                    </span>
                  </div>
                  {beforePhoto.caption && (
                    <p className="text-sm text-gray-600 mt-2 text-center">{beforePhoto.caption}</p>
                  )}
                </div>
                <div>
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 relative">
                    <img
                      src={afterPhoto.url}
                      alt={afterPhoto.caption || 'After'}
                      className="w-full h-64 object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      AFTER
                    </span>
                  </div>
                  {afterPhoto.caption && (
                    <p className="text-sm text-gray-600 mt-2 text-center">{afterPhoto.caption}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    const gridClass = data.completedPhotos.length <= 2 ? 'grid-cols-1' :
                      data.completedPhotos.length <= 4 ? 'grid-cols-2' : 'grid-cols-3';

    return (
      <div className={`grid ${gridClass} gap-4`}>
        {data.completedPhotos.map((photo, index) => (
          <div key={index} className="relative">
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={photo.url}
                alt={photo.caption || `Completed work ${index + 1}`}
                className="w-full h-64 object-cover"
              />
            </div>
            {photo.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center">{photo.caption}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="invoice-template bg-white">
      {showActions && (
        <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Invoice Preview</h2>
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
            {onPay && data.stripePaymentLink && (
              <button
                onClick={onPay}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg"
              >
                <CreditCard className="w-5 h-5" />
                Pay Now
              </button>
            )}
          </div>
        </div>
      )}

      <div className="invoice-content max-w-5xl mx-auto p-8 print:p-0">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-600">Invoice #: <span className="font-semibold text-gray-900">{data.invoiceNumber}</span></p>
              <p className="text-gray-600">Invoice Date: <span className="font-semibold text-gray-900">{data.invoiceDate}</span></p>
              <p className="text-gray-600">Due Date: <span className="font-semibold text-red-600">{data.dueDate}</span></p>
            </div>
            {data.originalProposalNumber && (
              <div className="text-right">
                <p className="text-gray-600">Original Proposal: <span className="font-semibold text-gray-900">{data.originalProposalNumber}</span></p>
                <p className="text-gray-600">Project Completed: <span className="font-semibold text-gray-900">{data.projectCompletedDate}</span></p>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <h3 className="font-bold text-gray-900 mb-3">Bill To:</h3>
            <p className="font-semibold text-gray-900">{data.customerName}</p>
            <p className="text-gray-600 text-sm">{data.customerAddress}</p>
            <p className="text-gray-600 text-sm">{data.customerPhone}</p>
            <p className="text-gray-600 text-sm">{data.customerEmail}</p>
          </div>

          <div className="border-4 border-red-600 rounded-lg p-4 bg-red-50">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">PAYMENT SUMMARY</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Total Invoice Amount</span>
                <span className="font-semibold">{formatCurrency(data.total)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Deposit Paid</span>
                <span>-{formatCurrency(data.depositPaid)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Previous Payments</span>
                <span>-{formatCurrency(data.previousPayments)}</span>
              </div>
              <div className="border-t-2 border-red-400 my-2"></div>
              <div className="flex justify-between text-2xl font-bold text-red-600">
                <span>BALANCE DUE</span>
                <span>{formatCurrency(data.balanceDue)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-4 font-semibold">
              DUE: {data.dueDate} ({data.paymentTerms})
            </p>
          </div>
        </div>

        <div className="mb-8 bg-green-50 border-2 border-green-500 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-green-600" />
            How to Pay
          </h2>

          <div className="space-y-4">
            {data.stripePaymentLink && (
              <div className="bg-white border-2 border-green-600 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                  Pay Online (Fastest)
                </h3>
                <a
                  href={data.stripePaymentLink}
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg mt-2"
                >
                  Pay Now with Credit Card
                </a>
                <p className="text-sm text-gray-600 mt-2">
                  We accept Visa, Mastercard, Amex, Discover
                </p>
              </div>
            )}

            {data.bankName && data.routingNumber && data.accountNumber && (
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-2">🏦 Bank Transfer (ACH)</h3>
                <p className="text-sm text-gray-700">Account Name: {data.businessName}</p>
                <p className="text-sm text-gray-700">Bank: {data.bankName}</p>
                <p className="text-sm text-gray-700">Routing: {data.routingNumber}</p>
                <p className="text-sm text-gray-700">Account: {data.accountNumber}</p>
              </div>
            )}

            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">💵 Check</h3>
              <p className="text-sm text-gray-700">Make payable to: {data.businessName}</p>
              <p className="text-sm text-gray-700">Mail to: {data.businessAddress}</p>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">💸 Cash</h3>
              <p className="text-sm text-gray-700">Payment can be made in person</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-green-300">
            <h3 className="font-bold text-gray-900 mb-2">Payment Terms:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Payment due: {data.dueDate}</li>
              {data.lateFeePercent && data.lateFeeDays && (
                <li>• Late fee: {data.lateFeePercent}% after {data.lateFeeDays} days overdue</li>
              )}
              <li>• Questions? Contact us at {data.businessPhone} or {data.businessEmail}</li>
            </ul>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
            Work Completed
          </h2>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
            <p className="font-semibold text-gray-900">Project: {data.projectTitle}</p>
            <p className="text-gray-700">Location: {data.projectLocation}</p>
            <p className="text-gray-700">Completed: {data.projectCompletedDate}</p>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Materials & Supplies</h3>
          <table className="w-full border-collapse mb-6">
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

          <h3 className="text-xl font-bold text-gray-900 mb-3">Labor & Installation</h3>
          <p className="text-gray-700 mb-2">{data.laborDescription}</p>
          <p className="text-gray-700 mb-4">
            Hours: <span className="font-semibold">{data.laborHours}</span> @ {formatCurrency(data.laborRate)}/hour
          </p>
          <p className="text-lg font-semibold text-gray-900">
            Subtotal Labor: {formatCurrency(data.subtotalLabor)}
          </p>

          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <div className="flex justify-between text-gray-700 mb-2">
              <span>Subtotal</span>
              <span>{formatCurrency(data.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-2">
              <span>Sales Tax ({(data.taxRate * 100).toFixed(1)}%)</span>
              <span>{formatCurrency(data.taxAmount)}</span>
            </div>
            <div className="border-t-2 border-gray-300 my-2"></div>
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(data.total)}</span>
            </div>
          </div>
        </div>

        {data.completedPhotos.length > 0 && (
          <div className="mb-8 page-break-before">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">
              Completed Project Photos
            </h2>
            {renderPhotoGrid()}
          </div>
        )}

        <div className="text-center py-6 border-t-2 border-gray-300 mt-8">
          <p className="text-xl font-bold text-green-600 mb-3">Thank you for your business!</p>
          <p className="text-gray-700 font-semibold mb-2">
            {data.businessName} • {data.businessPhone} • {data.businessEmail}
          </p>
          {data.licenseNumber && (
            <p className="text-gray-600">License #{data.licenseNumber} • Insured</p>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }

          .invoice-content {
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
