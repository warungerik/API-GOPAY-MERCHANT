<template>
  <div>

    <div v-if="isDataLoading" class="card mb loader-card">
      <div class="loader-inner">
        <div class="db-spinner"></div>
        <div class="loader-text-wrap">
          <strong class="loader-title">Memuat Data Dashboard...</strong>
          <span class="loader-sub">Mengambil statistik omset & mutasi transaksi dari database...</span>
        </div>
      </div>
    </div>

    <div v-else class="dashboard-fade-in">

      <div class="card mb">
        <div class="card-h">
          <h2 class="ct">Profil Merchant: {{ currentUser?.name }}</h2>
          <span class="badge-g">ACTIVE</span>
        </div>
        <div class="ci">Email: <strong>{{ currentUser?.email }}</strong> | Merchant ID: <strong>#{{ currentUser?.id }}</strong></div>
      </div>

      <div class="sg">
        <div class="sc"><div class="sl">OMSET LUNAS</div><div class="sv green">Rp {{ (merchantStats.totalPaidVolume||0).toLocaleString('id-ID') }}</div></div>
        <div class="sc"><div class="sl">TRANSAKSI SUKSES</div><div class="sv blue">{{ (merchantStats.totalPaidCount||0).toLocaleString('id-ID') }}</div></div>
        <div class="sc"><div class="sl">PENDING</div><div class="sv amber">{{ (merchantStats.totalPendingCount||0).toLocaleString('id-ID') }}</div></div>
      </div>

    <div class="card mb">
      <div class="card-h">
        <div>
          <h3 class="ct">Grafik Tren Transaksi</h3>
          <p class="ci" style="margin-top:2px;">Perbandingan tren transaksi Lunas (Paid), Pending, dan Kadaluarsa (Expired)</p>
        </div>

        <div class="chart-controls-row">

          <div class="series-toggle-group">
            <button class="st-btn btn-paid" :class="{ active: showSeries.paid }" @click="showSeries.paid = !showSeries.paid">
              <span class="st-dot dot-paid"></span> Lunas
            </button>
            <button class="st-btn btn-pending" :class="{ active: showSeries.pending }" @click="showSeries.pending = !showSeries.pending">
              <span class="st-dot dot-pending"></span> Pending
            </button>
            <button class="st-btn btn-expired" :class="{ active: showSeries.expired }" @click="showSeries.expired = !showSeries.expired">
              <span class="st-dot dot-expired"></span> Expired
            </button>
          </div>

          <div class="timeframe-group">
            <button class="tf-btn" :class="{ active: timeframe === 1 }" @click="timeframe = 1">Hari Ini</button>
            <button class="tf-btn" :class="{ active: timeframe === 3 }" @click="timeframe = 3">3 Hari</button>
            <button class="tf-btn" :class="{ active: timeframe === 7 }" @click="timeframe = 7">7 Hari</button>
            <button class="tf-btn" :class="{ active: timeframe === 14 }" @click="timeframe = 14">14 Hari</button>
            <button class="tf-btn" :class="{ active: timeframe === 30 }" @click="timeframe = 30">30 Hari</button>
          </div>
        </div>
      </div>

      <div class="chart-summary">
        <div class="cs-item">
          <span class="cs-lbl">TOTAL OMSET LUNAS</span>
          <strong class="cs-val green-text">Rp {{ chartPaidVolume.toLocaleString('id-ID') }}</strong>
        </div>
        <div class="cs-item">
          <span class="cs-lbl">TOTAL PENDING</span>
          <strong class="cs-val amber-text">Rp {{ chartPendingVolume.toLocaleString('id-ID') }}</strong>
        </div>
        <div class="cs-item">
          <span class="cs-lbl">TOTAL EXPIRED</span>
          <strong class="cs-val red-text">Rp {{ chartExpiredVolume.toLocaleString('id-ID') }}</strong>
        </div>
      </div>

      <div class="chart-container">
        <svg viewBox="0 0 600 200" class="line-chart-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradientPaid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#00AED6" stop-opacity="0.30" />
              <stop offset="100%" stop-color="#00AED6" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <line x1="20" y1="30" x2="580" y2="30" class="chart-grid-line" />
          <line x1="20" y1="80" x2="580" y2="80" class="chart-grid-line" />
          <line x1="20" y1="130" x2="580" y2="130" class="chart-grid-line" />
          <line x1="20" y1="175" x2="580" y2="175" class="chart-grid-line axis" />

          <path v-if="showSeries.paid" :d="svgPaidAreaPath" fill="url(#chartGradientPaid)" />

          <path v-if="showSeries.paid" :d="svgPaidPath" fill="none" stroke="#00AED6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          <path v-if="showSeries.pending" :d="svgPendingPath" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-dasharray="6 3" stroke-linecap="round" stroke-linejoin="round" />
          <path v-if="showSeries.expired" :d="svgExpiredPath" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-dasharray="4 4" stroke-linecap="round" stroke-linejoin="round" />

          <g v-if="showSeries.paid">
            <g
              v-for="(p, idx) in chartPaidPoints"
              :key="'paid-'+idx"
              class="chart-point-group"
              @mouseenter="hoveredPoint = p"
              @mouseleave="hoveredPoint = null"
              @click="togglePoint(p)"
            >
              <circle :cx="p.x" :cy="p.y" r="14" fill="transparent" />
              <circle :cx="p.x" :cy="p.y" r="4" class="chart-dot-inner dot-paid-inner" :class="{ 'is-active': hoveredPoint?.label === p.label }" />
            </g>
          </g>

          <g v-if="showSeries.pending">
            <g
              v-for="(p, idx) in chartPendingPoints"
              :key="'pending-'+idx"
              class="chart-point-group"
              @mouseenter="hoveredPoint = p"
              @mouseleave="hoveredPoint = null"
              @click="togglePoint(p)"
            >
              <circle :cx="p.x" :cy="p.y" r="14" fill="transparent" />
              <circle :cx="p.x" :cy="p.y" r="3.5" class="chart-dot-inner dot-pending-inner" :class="{ 'is-active': hoveredPoint?.label === p.label }" />
            </g>
          </g>

          <g v-if="showSeries.expired">
            <g
              v-for="(p, idx) in chartExpiredPoints"
              :key="'expired-'+idx"
              class="chart-point-group"
              @mouseenter="hoveredPoint = p"
              @mouseleave="hoveredPoint = null"
              @click="togglePoint(p)"
            >
              <circle :cx="p.x" :cy="p.y" r="14" fill="transparent" />
              <circle :cx="p.x" :cy="p.y" r="3.5" class="chart-dot-inner dot-expired-inner" :class="{ 'is-active': hoveredPoint?.label === p.label }" />
            </g>
          </g>
        </svg>

        <Transition name="fade-top">
          <div
            v-if="hoveredPoint"
            class="chart-tooltip"
            :class="{ 'pos-below': isTooltipBelow }"
            :style="{ left: tooltipXPercent + '%', top: tooltipYPercent + '%' }"
          >
            <div class="tt-header">
              <span class="tt-date">{{ hoveredPoint.label }}</span>
              <button class="tt-close" @click.stop="hoveredPoint = null">&times;</button>
            </div>
            <div class="tt-rows">
              <div class="tt-row green-row" v-if="showSeries.paid">
                <span class="tt-dot dot-paid"></span> Lunas: <strong>Rp {{ hoveredPoint.paidAmount.toLocaleString('id-ID') }}</strong> ({{ hoveredPoint.paidCount }} tx)
              </div>
              <div class="tt-row amber-row" v-if="showSeries.pending">
                <span class="tt-dot dot-pending"></span> Pending: <strong>Rp {{ hoveredPoint.pendingAmount.toLocaleString('id-ID') }}</strong> ({{ hoveredPoint.pendingCount }} tx)
              </div>
              <div class="tt-row red-row" v-if="showSeries.expired">
                <span class="tt-dot dot-expired"></span> Expired: <strong>Rp {{ hoveredPoint.expiredAmount.toLocaleString('id-ID') }}</strong> ({{ hoveredPoint.expiredCount }} tx)
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <div class="chart-x-labels">
        <span v-for="(p, idx) in labelStepPoints" :key="idx" class="x-label">{{ p.label }}</span>
      </div>

      <Transition name="fade-top">
        <div v-if="hoveredPoint" class="chart-active-banner">
          <span class="ab-date">Periode {{ hoveredPoint.label }}</span>
          <span class="ab-stat green-text">🟢 Lunas: <strong>Rp {{ hoveredPoint.paidAmount.toLocaleString('id-ID') }}</strong> ({{ hoveredPoint.paidCount }} tx)</span>
          <span class="ab-stat amber-text">🟡 Pending: <strong>Rp {{ hoveredPoint.pendingAmount.toLocaleString('id-ID') }}</strong> ({{ hoveredPoint.pendingCount }} tx)</span>
          <span class="ab-stat red-text">🔴 Expired: <strong>Rp {{ hoveredPoint.expiredAmount.toLocaleString('id-ID') }}</strong> ({{ hoveredPoint.expiredCount }} tx)</span>
        </div>
      </Transition>
    </div>

    <div class="card">
      <div class="card-h">
        <h3 class="ct">Transaksi Terakhir</h3>
        <NuxtLink to="/dashboard/transactions" class="lk">Lihat Semua →</NuxtLink>
      </div>

      <div class="tw">
        <table>
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>NOMINAL</th>
              <th>PELANGGAN</th>
              <th>STATUS</th>
              <th>WAKTU</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in paginatedTransactions" :key="t.orderId">
              <td class="mono bold">{{ t.orderId }}</td>
              <td class="mono">Rp {{ t.totalAmount.toLocaleString('id-ID') }}</td>
              <td>{{ t.customerName }}</td>
              <td><span class="sb" :class="'s-'+t.status.toLowerCase()">{{ t.status }}</span></td>
              <td class="muted sm">{{ fmt(t.createdAt) }}</td>
            </tr>
            <tr v-if="transactionsList.length === 0">
              <td colspan="5" class="empty">Belum ada transaksi.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-bar">
        <button class="btn btn-outline btn-sm" :disabled="currentPage === 1" @click="prevPage">
          ← Prev
        </button>
        <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
        <button class="btn btn-outline btn-sm" :disabled="currentPage >= totalPages" @click="nextPage">
          Next →
        </button>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dashboard' });

const { currentUser } = useAuth();
const { merchantStats, transactionsList, fetchMerchantStats, fetchTransactions } = useMerchant();

const isDataLoading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 10;
const timeframe = ref(7);
const hoveredPoint = ref(null);

const totalPages = computed(() => {
  return Math.ceil(transactionsList.value.length / itemsPerPage) || 1;
});

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return transactionsList.value.slice(start, start + itemsPerPage);
});

const showSeries = ref({ paid: true, pending: true, expired: true });

function buildSvgPath(pts) {
  if (!pts || pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

const dailyData = computed(() => {
  const days = [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  if (timeframe.value === 1) {

    const hours = [0, 4, 8, 12, 16, 20];
    hours.forEach(h => {
      const label = `${String(h).padStart(2, '0')}:00`;
      days.push({
        dateStr: todayStr,
        hour: h,
        label,
        paidAmount: 0, paidCount: 0,
        pendingAmount: 0, pendingCount: 0,
        expiredAmount: 0, expiredCount: 0
      });
    });

    (transactionsList.value || []).forEach(t => {
      const status = String(t.status || '').toUpperCase();
      const txDateObj = new Date(t.paidAt || t.createdAt);
      const txDate = txDateObj.toISOString().split('T')[0];

      if (txDate === todayStr) {
        const txHour = txDateObj.getHours();
        const bucket = days.slice().reverse().find(d => txHour >= d.hour);
        if (bucket) {
          const amt = Number(t.totalAmount || t.netAmount || 0);
          if (status === 'PAID') {
            bucket.paidAmount += amt;
            bucket.paidCount += 1;
          } else if (status === 'PENDING') {
            bucket.pendingAmount += amt;
            bucket.pendingCount += 1;
          } else if (status === 'EXPIRED') {
            bucket.expiredAmount += amt;
            bucket.expiredCount += 1;
          }
        }
      }
    });

    return days;
  }

  for (let i = timeframe.value - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    days.push({
      dateStr,
      label,
      paidAmount: 0, paidCount: 0,
      pendingAmount: 0, pendingCount: 0,
      expiredAmount: 0, expiredCount: 0
    });
  }

  (transactionsList.value || []).forEach(t => {
    const status = String(t.status || '').toUpperCase();
    const txDate = new Date(t.paidAt || t.createdAt).toISOString().split('T')[0];
    const found = days.find(d => d.dateStr === txDate);
    if (found) {
      const amt = Number(t.totalAmount || t.netAmount || 0);
      if (status === 'PAID') {
        found.paidAmount += amt;
        found.paidCount += 1;
      } else if (status === 'PENDING') {
        found.pendingAmount += amt;
        found.pendingCount += 1;
      } else if (status === 'EXPIRED') {
        found.expiredAmount += amt;
        found.expiredCount += 1;
      }
    }
  });

  return days;
});

const chartPaidVolume = computed(() => {
  return dailyData.value.reduce((sum, d) => sum + d.paidAmount, 0);
});

const chartPendingVolume = computed(() => {
  return dailyData.value.reduce((sum, d) => sum + d.pendingAmount, 0);
});

const chartExpiredVolume = computed(() => {
  return dailyData.value.reduce((sum, d) => sum + d.expiredAmount, 0);
});

const chartMax = computed(() => {
  const allValues = [];
  dailyData.value.forEach(d => {
    if (showSeries.value.paid) allValues.push(d.paidAmount);
    if (showSeries.value.pending) allValues.push(d.pendingAmount);
    if (showSeries.value.expired) allValues.push(d.expiredAmount);
  });
  const max = Math.max(...allValues, 10000);
  return Math.ceil(max * 1.15);
});

const chartPaidPoints = computed(() => {
  const width = 600;
  const height = 180;
  const padding = 20;
  const count = dailyData.value.length;
  const max = chartMax.value;

  return dailyData.value.map((d, index) => {
    const x = padding + (index / (count - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - (d.paidAmount / max) * (height - 2 * padding);
    return { x, y, ...d };
  });
});

const chartPendingPoints = computed(() => {
  const width = 600;
  const height = 180;
  const padding = 20;
  const count = dailyData.value.length;
  const max = chartMax.value;

  return dailyData.value.map((d, index) => {
    const x = padding + (index / (count - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - (d.pendingAmount / max) * (height - 2 * padding);
    return { x, y, ...d };
  });
});

const chartExpiredPoints = computed(() => {
  const width = 600;
  const height = 180;
  const padding = 20;
  const count = dailyData.value.length;
  const max = chartMax.value;

  return dailyData.value.map((d, index) => {
    const x = padding + (index / (count - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - (d.expiredAmount / max) * (height - 2 * padding);
    return { x, y, ...d };
  });
});

const labelStepPoints = computed(() => {
  const pts = chartPaidPoints.value;
  if (pts.length <= 7) return pts;
  const step = Math.ceil(pts.length / 6);
  return pts.filter((_, idx) => idx % step === 0 || idx === pts.length - 1);
});

const svgPaidPath = computed(() => buildSvgPath(chartPaidPoints.value));
const svgPendingPath = computed(() => buildSvgPath(chartPendingPoints.value));
const svgExpiredPath = computed(() => buildSvgPath(chartExpiredPoints.value));

const svgPaidAreaPath = computed(() => {
  const pts = chartPaidPoints.value;
  if (pts.length === 0) return '';
  const path = svgPaidPath.value;
  const last = pts[pts.length - 1];
  const first = pts[0];
  return `${path} L ${last.x} 175 L ${first.x} 175 Z`;
});

const tooltipXPercent = computed(() => {
  if (!hoveredPoint.value) return 0;
  const pct = (hoveredPoint.value.x / 600) * 100;
  return Math.min(Math.max(pct, 26), 74);
});

const tooltipYPercent = computed(() => {
  if (!hoveredPoint.value) return 0;
  const pct = (hoveredPoint.value.y / 200) * 100;
  return pct;
});

const isTooltipBelow = computed(() => {
  if (!hoveredPoint.value) return false;
  return hoveredPoint.value.y < 95;
});

function togglePoint(p) {
  if (hoveredPoint.value && hoveredPoint.value.label === p.label) {
    hoveredPoint.value = null;
  } else {
    hoveredPoint.value = p;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function fmt(d) {
  return d ? new Date(d).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-';
}

onMounted(async () => {
  try {
    await Promise.all([
      fetchMerchantStats(),
      fetchTransactions('', '', '', '', 100, 0)
    ]);
  } finally {
    isDataLoading.value = false;
  }
});
</script>

<style scoped>
.loader-card {
  padding: 48px 24px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.03);
}

.loader-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.db-spinner {
  width: 44px;
  height: 44px;
  border: 3px solid #E2E8F0;
  border-top-color: #00AED6;
  border-right-color: #10B981;
  border-radius: 50%;
  animation: dbSpin 0.75s linear infinite;
}

@keyframes dbSpin {
  to { transform: rotate(360deg); }
}

.loader-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.loader-title {
  font-size: 0.95rem;
  color: #0F172A;
  font-weight: 800;
}

.loader-sub {
  font-size: 0.78rem;
  color: #64748B;
}

.dashboard-fade-in {
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.card { background: #fff; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.mb { margin-bottom: 16px; }
.card-h { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.ct { font-size: 0.95rem; font-weight: 700; color: #0F172A; display: flex; align-items: center; gap: 8px; }
.ci { font-size: 0.82rem; color: #64748B; }
.badge-g { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; padding: 2px 10px; border-radius: 20px; font-size: 0.68rem; font-weight: 800; }
.sg { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 16px; }
.sc { background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 14px; box-shadow: 0 1px 4px rgba(0,0,0,0.03); }
.sl { font-size: 0.65rem; color: #94A3B8; font-weight: 700; }
.sv { font-size: 1.3rem; font-weight: 800; margin-top: 4px; font-family: 'JetBrains Mono', monospace; }
.sv.green { color: #059669; } .sv.blue { color: #0891B2; } .sv.amber { color: #D97706; }
.lk { color: #00AED6; font-size: 0.78rem; font-weight: 700; text-decoration: none; }
.tw { overflow-x: auto; -webkit-overflow-scrolling: touch; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; min-width: 500px; }
th { padding: 10px 12px; background: #F8FAFC; color: #64748B; font-weight: 700; font-size: 0.7rem; border-bottom: 1px solid #E2E8F0; white-space: nowrap; }
td { padding: 12px; border-bottom: 1px solid #F1F5F9; color: #1E293B; }
tr:hover td { background: #F8FAFC; }
.mono { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; } .bold { font-weight: 700; } .muted { color: #94A3B8; } .sm { font-size: 0.72rem; }
.empty { text-align: center; color: #94A3B8; padding: 30px; }
.sb { display: inline-flex; padding: 2px 10px; border-radius: 20px; font-size: 0.68rem; font-weight: 800; }
.s-paid { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.s-pending { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }
.s-expired { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }

.chart-controls-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.series-toggle-group {
  display: flex;
  gap: 4px;
  background: #F8FAFC;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
}

.st-btn {
  background: transparent;
  border: none;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #94A3B8;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.st-btn.active { background: #fff; color: #1E293B; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.st-btn.btn-paid.active { color: #00AED6; }
.st-btn.btn-pending.active { color: #D97706; }
.st-btn.btn-expired.active { color: #DC2626; }

.st-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.dot-paid { background: #00AED6; box-shadow: 0 0 6px rgba(0,174,214,0.5); }
.dot-pending { background: #F59E0B; box-shadow: 0 0 6px rgba(245,158,11,0.5); }
.dot-expired { background: #EF4444; box-shadow: 0 0 6px rgba(239,68,68,0.5); }

.dot-paid-inner { fill: #00AED6; stroke: #fff; stroke-width: 2; }
.dot-pending-inner { fill: #F59E0B; stroke: #fff; stroke-width: 2; }
.dot-expired-inner { fill: #EF4444; stroke: #fff; stroke-width: 2; }

.timeframe-group {
  display: flex;
  gap: 4px;
  background: #F8FAFC;
  padding: 3px;
  border-radius: 10px;
  border: 1px solid #E2E8F0;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.tf-btn {
  background: transparent;
  border: none;
  padding: 5px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748B;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.tf-btn.active { background: #00AED6; color: #ffffff; box-shadow: 0 2px 6px rgba(0, 174, 214, 0.25); }

.chart-summary { display: flex; gap: 24px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid #F1F5F9; flex-wrap: wrap; }
.cs-item { display: flex; flex-direction: column; }
.cs-lbl { font-size: 0.65rem; font-weight: 800; color: #94A3B8; letter-spacing: 0.3px; }
.cs-val { font-size: 1.1rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
.green-text { color: #059669; } .prim { color: #0891B2; } .amber-text { color: #D97706; } .red-text { color: #DC2626; }

.chart-container { position: relative; width: 100%; height: 200px; overflow: visible; }
.line-chart-svg { width: 100%; height: 100%; overflow: visible; }
.chart-grid-line { stroke: #F1F5F9; stroke-dasharray: 4 4; stroke-width: 1; }
.chart-grid-line.axis { stroke: #CBD5E1; stroke-dasharray: none; }

.chart-point-group { cursor: pointer; }
.chart-dot-outer { fill: #00AED6; fill-opacity: 0.2; transition: all 0.2s ease; }
.chart-dot-inner { transition: all 0.2s ease; }
.chart-point-group:hover .chart-dot-inner,
.chart-dot-inner.is-active { r: 5.5; }

.chart-tooltip {
  position: absolute;
  transform: translate(-50%, -115%);
  background: #0F172A;
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 100;
  text-align: center;
  white-space: nowrap;
  border: 1px solid #00AED6;
  max-width: 85vw;
  box-sizing: border-box;
  transition: transform 0.15s ease, left 0.15s ease, top 0.15s ease;
}

.chart-tooltip.pos-below {
  transform: translate(-50%, 15px) !important;
}

.tt-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 2px; }
.tt-date { font-size: 0.68rem; color: #94A3B8; font-weight: 600; }
.tt-close { background: transparent; border: none; color: #94A3B8; font-size: 0.9rem; cursor: pointer; padding: 0 2px; line-height: 1; }
.tt-close:hover { color: #fff; }

.tt-rows { display: flex; flex-direction: column; gap: 3px; margin-top: 4px; text-align: left; }
.tt-row { font-size: 0.72rem; display: flex; align-items: center; gap: 6px; }
.tt-row strong { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; }
.tt-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

.chart-x-labels { display: flex; justify-content: space-between; padding: 6px 12px 0; font-size: 0.7rem; color: #94A3B8; font-weight: 600; }

.chart-active-banner {
  margin-top: 10px;
  padding: 8px 14px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.78rem;
  color: #334155;
  font-weight: 600;
  flex-wrap: wrap;
}
.ab-date { font-weight: 800; color: #0F172A; }
.ab-stat { display: inline-flex; align-items: center; gap: 4px; }
.ab-stat strong { font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; }

.pagination-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 10px; border-top: 1px solid #E2E8F0; }
.page-info { font-size: 0.8rem; color: #64748B; font-weight: 600; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 12px; border-radius: 8px; font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; outline: none; text-decoration: none; white-space: nowrap; }
.btn-outline { background: #fff; border: 1px solid #CBD5E1; color: #334155; }
.btn-outline:hover:not(:disabled) { background: #F8FAFC; border-color: #94A3B8; }
.btn-outline:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .card { padding: 14px 12px; }
  .sg { grid-template-columns: 1fr; gap: 8px; }
  .sv { font-size: 1.1rem; }
  th { font-size: 0.62rem; padding: 8px; }
  td { padding: 10px 8px; font-size: 0.75rem; }
  .chart-summary { flex-direction: column; gap: 8px; }

  .chart-tooltip {
    max-width: 80vw;
    font-size: 0.7rem;
    padding: 6px 10px;
  }
}
</style>
