import { useState, useEffect, useCallback } from 'react';
import { Plus, Save, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from './Toast';
import { useAuth } from '../contexts/AuthContext';
import { Field, Input, Select } from './Form';
import { fn, authHeaders, fetchJSON } from '../lib/http';
import { supabase } from '../lib/supabase';

interface PriceBookItem {
  id?: string;
  name: string;
  unit: 'each' | 'sqft' | 'lf' | 'hour' | 'day';
  default_price: number;
  aliases: string[];
  aliasesText?: string;
  priceText?: string;
}

export default function PriceBookTab() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [items, setItems] = useState<PriceBookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const loadPriceBook = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { items } = await fetchJSON(fn('list-pricebook'), {
        headers: await authHeaders(),
      });
      setItems((items || []).map((item: PriceBookItem) => ({
        ...item,
        aliasesText: item.aliases.join(', '),
        priceText: item.default_price > 0 ? item.default_price.toFixed(2) : '',
      })));
    } catch (e: any) {
      console.error('Failed to load price book:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPriceBook();
  }, [loadPriceBook]);

  async function saveItem(item: PriceBookItem) {
    if (!item.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    if (item.default_price < 0) {
      showToast('Price must be non-negative', 'error');
      return;
    }

    if (!user) {
      showToast('Not authenticated', 'error');
      return;
    }

    setSaving(item.id || 'new');

    try {
      const aliases = (item.aliasesText || '')
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const price = parseFloat(item.priceText || '0') || 0;

      await fetchJSON(fn('upsert-pricebook'), {
        method: 'POST',
        headers: { "content-type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({
          id: item.id,
          name: item.name,
          unit: item.unit,
          default_price: parseFloat(price.toFixed(2)),
          aliases,
        }),
      });

      showToast('Price book item saved', 'success');
      await loadPriceBook();
    } catch (e: any) {
      showToast(e.message || 'Failed to save', 'error');
    } finally {
      setSaving(null);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this price book item?')) return;

    try {
      const { error } = await supabase
        .from('pricing_categories')
        .delete()
        .eq('id', id);

      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Item deleted', 'success');
        await loadPriceBook();
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to delete', 'error');
    }
  }

  function addNewRow() {
    setItems([
      ...items,
      {
        name: '',
        unit: 'each',
        default_price: 0,
        aliases: [],
        aliasesText: '',
        priceText: '',
      },
    ]);
  }

  function updateItem(index: number, updates: Partial<PriceBookItem>) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    setItems(newItems);
  }

  if (loading) {
    return <div className="text-gray-400">Loading price book...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Price Book</h2>
        <p className="text-gray-400 mb-4">
          Define common items with units and prices. The system will automatically detect these in voice/text descriptions.
        </p>
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <strong>Example:</strong> Add "Plank Flooring" with unit "sqft" and price "$2.00". Add aliases like "lvp, vinyl plank, luxury vinyl".
              When you say "800 sf of plank flooring", the system will auto-fill quantity=800, unit=sqft, price=$2.00.
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.id || `new-${idx}`} className="bg-dark-card border border-dark-border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-3">
                <Field label="Name *">
                  {(id) => (
                    <Input
                      id={id}
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(idx, { name: e.target.value })}
                      placeholder="e.g., Plank Flooring"
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent text-sm"
                    />
                  )}
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Unit *">
                  {(id) => (
                    <Select
                      id={id}
                      value={item.unit}
                      onChange={(e) => updateItem(idx, { unit: e.target.value as any })}
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent text-sm"
                    >
                      <option value="each">Each</option>
                      <option value="sqft">SqFt</option>
                      <option value="lf">LF</option>
                      <option value="hour">Hour</option>
                      <option value="day">Day</option>
                    </Select>
                  )}
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Price *">
                  {(id) => (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                        $
                      </span>
                      <Input
                        id={id}
                        type="text"
                        inputMode="decimal"
                        value={item.priceText || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
                            updateItem(idx, { priceText: val });
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value;
                          if (val === '' || val === '0') {
                            updateItem(idx, { priceText: '', default_price: 0 });
                          } else {
                            const parsed = parseFloat(val);
                            if (!isNaN(parsed) && parsed >= 0) {
                              const formatted = parsed.toFixed(2);
                              updateItem(idx, { priceText: formatted, default_price: parseFloat(formatted) });
                            } else {
                              updateItem(idx, { priceText: '', default_price: 0 });
                            }
                          }
                        }}
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent text-sm"
                      />
                    </div>
                  )}
                </Field>
              </div>

              <div className="md:col-span-4">
                <Field label="Aliases (comma-separated)">
                  {(id) => (
                    <Input
                      id={id}
                      type="text"
                      value={item.aliasesText || ''}
                      onChange={(e) => updateItem(idx, { aliasesText: e.target.value })}
                      placeholder="e.g., lvp, vinyl plank, luxury vinyl"
                      className="w-full px-3 py-2 bg-dark-bg border border-dark-border text-white rounded-lg focus:ring-2 focus:ring-accent-cyan focus:border-transparent text-sm"
                    />
                  )}
                </Field>
              </div>

              <div className="md:col-span-1 flex items-end gap-2">
                <button
                  onClick={() => saveItem(item)}
                  disabled={saving === (item.id || 'new')}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Save"
                >
                  <Save className="w-4 h-4 mx-auto" />
                </button>
                {item.id && (
                  <button
                    onClick={() => deleteItem(item.id!)}
                    className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition border border-red-500/30"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addNewRow}
          className="w-full py-3 border-2 border-dashed border-dark-border text-gray-400 rounded-lg hover:border-accent-cyan hover:text-accent-cyan transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Row
        </button>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-lg p-4 text-sm text-gray-400">
        <h3 className="font-semibold text-white mb-2">How Price Book Works:</h3>
        <ul className="space-y-1 list-disc list-inside">
          <li>Add items with their typical unit (sqft, lf, each, etc.) and default price</li>
          <li>Add aliases for variations (e.g., "lvp" for "luxury vinyl plank")</li>
          <li>When you create a line item via voice or text, the system searches for matches</li>
          <li>If found, it auto-fills quantity, unit, and price based on your description</li>
          <li>Items with low confidence (&lt;80%) show a ⚠️ Review badge for you to verify</li>
        </ul>
      </div>
    </div>
  );
}
