import { useEffect, useState } from 'react';
import { STATES } from '../lib/states';
import { X } from 'lucide-react';
import { Field, Input, Select } from './Form';

type Mode = 'create' | 'edit';
type Customer = any;

interface CustomerEditorProps {
  open: boolean;
  mode: Mode;
  initial?: Customer | null;
  onClose: () => void;
  onSaved: (c?: Customer) => void;
  onDeleted?: () => void;
}

export default function CustomerEditor({
  open,
  mode,
  initial,
  onClose,
  onSaved,
  onDeleted,
}: CustomerEditorProps) {
  const [customer_type, setType] = useState<'individual' | 'business'>('individual');
  const [first_name, setFirst] = useState('');
  const [last_name, setLast] = useState('');
  const [business_name, setBiz] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [preferred_contact, setPref] = useState<'sms' | 'email' | 'both'>('both');

  const [editing, setEditing] = useState(mode === 'create');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initial) {
      setType(initial.customer_type || 'individual');
      setFirst(initial.first_name || '');
      setLast(initial.last_name || '');
      setBiz(initial.business_name || '');
      setEmail(initial.email || '');
      setPhone(initial.phone || '');
      setStreet(initial.street || '');
      setCity(initial.city || '');
      setState(initial.state || '');
      setZip(initial.zip || '');
      setPref(initial.preferred_contact || 'both');
      setEditing(false);
      setConfirmDelete(false);
    } else {
      setType('individual');
      setFirst('');
      setLast('');
      setBiz('');
      setEmail('');
      setPhone('');
      setStreet('');
      setCity('');
      setState('');
      setZip('');
      setPref('both');
      setEditing(true);
      setConfirmDelete(false);
    }
    setErr(null);
  }, [open, mode, initial]);

  if (!open) return null;

  const save = async () => {
    setErr(null);

    if (customer_type === 'individual' && (!first_name.trim() || !last_name.trim())) {
      setErr('First name and last name are required for individual customers');
      return;
    }
    if (customer_type === 'business' && !business_name.trim()) {
      setErr('Business name is required for business customers');
      return;
    }

    setBusy(true);
    const payload = {
      customer_type,
      first_name: first_name.trim() || null,
      last_name: last_name.trim() || null,
      business_name: business_name.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      street: street.trim() || null,
      city: city.trim() || null,
      state: state.trim() || null,
      zip: zip.trim() || null,
      preferred_contact,
    };

    try {
      let customer;
      if (mode === 'create') {
        customer = await window.customerAPI.create(payload);
      } else {
        await window.customerAPI.update(initial.id, payload);
        customer = { ...initial, ...payload };
      }
      setEditing(false);
      onSaved(customer);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    setErr(null);
    setBusy(true);
    try {
      await window.customerAPI.delete(initial.id);
      onDeleted?.();
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDiscard = () => {
    if (mode === 'create') {
      onClose();
    } else {
      setEditing(false);
      if (initial) {
        setType(initial.customer_type || 'individual');
        setFirst(initial.first_name || '');
        setLast(initial.last_name || '');
        setBiz(initial.business_name || '');
        setEmail(initial.email || '');
        setPhone(initial.phone || '');
        setStreet(initial.street || '');
        setCity(initial.city || '');
        setState(initial.state || '');
        setZip(initial.zip || '');
        setPref(initial.preferred_contact || 'both');
      }
      setErr(null);
    }
  };

  const disabled = !editing;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-dark-border">
        <div className="sticky top-0 bg-dark-card border-b border-dark-border p-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">
            {mode === 'create' ? 'Add Customer' : 'Customer Details'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Customer Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={disabled}
                onClick={() => setType('individual')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  customer_type === 'individual'
                    ? 'bg-blue-500 text-white'
                    : 'bg-dark-bg text-gray-400 hover:bg-dark-hover'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Individual
              </button>
              <button
                disabled={disabled}
                onClick={() => setType('business')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  customer_type === 'business'
                    ? 'bg-blue-500 text-white'
                    : 'bg-dark-bg text-gray-400 hover:bg-dark-hover'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Business
              </button>
            </div>
          </div>

          {customer_type === 'individual' ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Field label={<>First Name <span className="text-red-400">*</span></>}>
                {(id) => (
                  <Input
                    id={id}
                    disabled={disabled}
                    value={first_name}
                    onChange={(e) => setFirst(e.target.value)}
                    autoComplete="given-name"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="John"
                  />
                )}
              </Field>
              <Field label={<>Last Name <span className="text-red-400">*</span></>}>
                {(id) => (
                  <Input
                    id={id}
                    disabled={disabled}
                    value={last_name}
                    onChange={(e) => setLast(e.target.value)}
                    autoComplete="family-name"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Smith"
                  />
                )}
              </Field>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Name <span className="text-red-400">*</span>
              </label>
              <input
                disabled={disabled}
                value={business_name}
                onChange={(e) => setBiz(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Acme Corporation"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                disabled={disabled}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input
                disabled={disabled}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="(555) 555-0001"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Street Address</label>
            <input
              disabled={disabled}
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
              <input
                disabled={disabled}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
              <select
                disabled={disabled}
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Zip</label>
              <input
                disabled={disabled}
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="12345"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preferred Contact Method
            </label>
            <div className="flex gap-4">
              {(['sms', 'email', 'both'] as const).map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <input
                    disabled={disabled}
                    type="radio"
                    checked={preferred_contact === opt}
                    onChange={() => setPref(opt)}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-white capitalize">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {err && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {err}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-dark-card border-t border-dark-border p-6">
          <div className="flex justify-between items-center">
            {mode === 'edit' && !editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleDiscard}
                  className="px-6 py-3 rounded-xl border-2 border-gray-600 text-gray-300 font-semibold hover:bg-dark-hover transition-colors"
                >
                  {mode === 'create' ? 'Cancel' : 'Discard'}
                </button>
                <button
                  disabled={busy}
                  onClick={save}
                  className="px-6 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {busy ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}

            {mode === 'edit' && (
              <div>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300 text-sm">Are you sure?</span>
                    <button
                      disabled={busy}
                      onClick={del}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {busy ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-4 py-2 rounded-lg bg-dark-bg text-gray-300 font-semibold hover:bg-dark-hover transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
