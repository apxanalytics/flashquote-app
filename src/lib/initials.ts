export const customerInitials = (c: any) => {
  if (c?.customer_type === 'business') {
    const n = (c.business_name || c.name || '').trim();
    return n ? n[0].toUpperCase() : '?';
  }
  const f = (c.first_name || '').trim();
  const l = (c.last_name || '').trim();
  const fi = f ? f[0].toUpperCase() : '';
  const li = l ? l[0].toUpperCase() : '';
  return (fi + li) || '?';
};

export function initialsFrom(name?: string | null) {
  if (!name) return "";
  const n = name.trim().split(/\s+/);
  if (n.length === 1) return n[0].slice(0, 2).toUpperCase();
  return (n[0][0] + n[n.length - 1][0]).toUpperCase();
}
