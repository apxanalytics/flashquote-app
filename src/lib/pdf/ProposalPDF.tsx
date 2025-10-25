import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, fontFamily: 'Helvetica' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  h1: { fontSize: 18, fontWeight: 700 },
  muted: { color: '#666' },
  table: { marginTop: 8, borderTop: '1 solid #ddd', borderLeft: '1 solid #ddd' },
  tr: { flexDirection: 'row' },
  th: {
    padding: 6,
    fontWeight: 700,
    backgroundColor: '#f7f7f7',
    borderRight: '1 solid #ddd',
    borderBottom: '1 solid #ddd',
    flexGrow: 1,
    textAlign: 'right',
  },
  td: {
    padding: 6,
    borderRight: '1 solid #ddd',
    borderBottom: '1 solid #ddd',
    flexGrow: 1,
    textAlign: 'right',
  },
  tdLeft: { textAlign: 'left' },
  totals: { marginTop: 12, alignItems: 'flex-end' },
  bold: { fontWeight: 700 },
});

interface ScopeItem {
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ProposalPDFProps {
  data: {
    proposal: any;
    job: any;
    customer: any;
    items: ScopeItem[];
    summary: { subtotal: number };
    taxPct?: number;
    depositPct?: number;
  };
}

function money(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(n) || 0
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(n) || 0);
}

function round2(n: number) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function ProposalPDF({ data }: ProposalPDFProps) {
  const { proposal, job, customer, items, summary, taxPct = 0, depositPct = 0 } = data;
  const tax = round2(summary.subtotal * (taxPct / 100));
  const total = round2(summary.subtotal + tax);
  const deposit = round2(total * (depositPct / 100));

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.h1}>Proposal</Text>
            <Text style={styles.muted}>#{proposal.id}</Text>
          </View>
          <View>
            <Text style={styles.bold}>{customer?.name || 'Customer'}</Text>
            {customer?.address ? <Text>{customer.address}</Text> : null}
            {customer?.email || customer?.phone ? (
              <Text>
                {[customer?.email, customer?.phone].filter(Boolean).join('  •  ')}
              </Text>
            ) : null}
          </View>
        </View>

        <View>
          <Text style={styles.bold}>Job</Text>
          <Text>{job?.title || job?.id}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.th, styles.tdLeft, { flexBasis: 200, flexGrow: 2 }]}>
              Description
            </Text>
            <Text style={styles.th}>Qty</Text>
            <Text style={styles.th}>Unit</Text>
            <Text style={styles.th}>$/Unit</Text>
            <Text style={styles.th}>Line Total</Text>
          </View>
          {items.map((it, i) => (
            <View key={i} style={styles.tr}>
              <Text style={[styles.td, styles.tdLeft, { flexBasis: 200, flexGrow: 2 }]}>
                {it.description}
              </Text>
              <Text style={styles.td}>{fmt(it.quantity)}</Text>
              <Text style={styles.td}>{(it.unit || '').toUpperCase()}</Text>
              <Text style={styles.td}>{money(it.unit_price)}</Text>
              <Text style={styles.td}>{money(it.total)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <Text>Subtotal: {money(summary.subtotal)}</Text>
          <Text>
            Tax ({fmt(taxPct)}%): {money(tax)}
          </Text>
          <Text style={styles.bold}>Total: {money(total)}</Text>
          {depositPct ? (
            <Text>
              Deposit ({fmt(depositPct)}%): {money(deposit)}
            </Text>
          ) : null}
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.muted}>
            Terms: Prices are estimates based on stated scope. Change orders may apply.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
