<template>
  <div class="w-full h-full bg-[#f4f6f8] overflow-auto overflow-x-hidden billings-custom-scrollbar" @click="closeAllDropdowns">
    <div class="w-full flex flex-col pb-16 min-h-full">
      
      <!-- 1. UNIWERSALNE KPI -->
      <UniversalKpi 
        title="Rozliczenia i Biling"
        subtitle="Kalkulacje usług EEP (EUR), zlecenia własne i komercyjne EKOEN (PLN) oraz weryfikacja cenników."
        :views="[
          { label: 'Wszystkie', value: 'ALL' },
          { label: 'EEP (EUR)', value: 'EEP' },
          { label: 'EKOEN (PLN)', value: 'EKOEN' }
        ]"
        :activeView="activeBillingMode"
        :activeTabs="store.activeTabs"
        :tabs="store.kpiTabs"
        :tabCounts="tabCounts"
        @switch-view="activeBillingMode = $event"
        @select-tab="setActiveTab"
        @edit-tab="editTab"
        @delete-tab="confirmDeleteTab"
        @open-modal="openNewTabModal"
        @reorder-tabs="handleReorderTabs"
        @save-settings="saveUserConfig"
      />

      <!-- 2. UNIWERSALNA WYSZUKIWARKA -->
      <UniversalSearch 
        :queries="store.searchQueriesMain"
        placeholder="Szukaj po numerze zgłoszenia, stacji, kliencie..."
        @add-row="store.searchQueriesMain.push({ id: 'tq_' + Date.now(), logic: 'AND', text: '' })"
        @remove-row="(id) => store.searchQueriesMain = store.searchQueriesMain.filter(q => q.id !== id)"
      >
        <template #actions>
          <!-- Szybki filtr kontroli fakturowania i ponownych wizyt -->
          <select
            v-model="quickBillingFilter"
            class="bg-white border rounded-xl px-3.5 text-xs font-extrabold h-[42px] mr-2 shadow-sm focus:outline-none focus:border-[#58b347] cursor-pointer transition-colors"
            :class="quickBillingFilter !== 'ALL' ? 'border-amber-400 text-amber-800 bg-amber-50' : 'border-slate-200 text-slate-600'"
          >
            <option value="ALL">Filtr: Wszystkie pozycje</option>
            <option value="UNBILLED_PLN">EKOEN bez faktury (FV: NIE)</option>
            <option value="INVOICED_PLN">EKOEN zafakturowane (FV: TAK)</option>
            <option value="REVISIT">Wymagana ponowna wizyta</option>
            <option value="PRELIM">Wstępne (Do weryfikacji)</option>
          </select>

          <div class="bg-slate-50 border border-slate-200/80 rounded-xl px-4 text-[11px] font-black tracking-wider uppercase text-slate-500 shadow-sm flex items-center gap-2 h-[42px] mr-2">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            WIDOCZNE: <span class="text-[#58b347] font-black text-sm ml-1">{{ filteredBillings.length }} / {{ store.billings.length }}</span>
          </div>

          <!-- Przycisk Masowego Usuwania -->
          <button v-if="selectedIds.length > 0" @click="massDelete" class="bg-red-50 text-red-600 border border-red-100 font-extrabold px-4 py-2.5 rounded-xl text-[13px] hover:bg-red-100 shadow-sm transition-all flex items-center gap-2 h-[42px] mr-2">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            Usuń ({{ selectedIds.length }})
          </button>

          <!-- Przycisk Wyboru Kolumn -->
          <div class="relative">
            <button @click.stop="isColDropdownOpen = !isColDropdownOpen" class="bg-white border border-slate-200 text-slate-600 font-extrabold px-4 py-2.5 rounded-xl text-[13px] hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 h-[42px]">
              <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg> Kolumny
            </button>
            <div v-show="isColDropdownOpen" @click.stop class="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-[150] p-4">
              <p class="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 border-b border-slate-100 pb-2 px-2">WIDOCZNE KOLUMNY</p>
              <div class="max-h-[320px] overflow-y-auto billings-custom-scrollbar pr-1">
                <div v-for="(col, idx) in columns" :key="col.id" v-show="!col.locked" 
                     draggable="true" 
                     @dragstart="draggedMenuColIdx = idx" 
                     @dragover.prevent 
                     @drop="onMenuColDrop(idx)"
                     @click.stop="col.visible = !col.visible; saveColumnsConfig()" 
                     class="flex items-center gap-3 w-full cursor-pointer px-3 py-2.5 rounded-lg transition-all mb-1 group" 
                     :class="col.visible ? 'bg-[#f0f7f1] text-[#58b347]' : 'bg-transparent text-slate-500 hover:bg-slate-50'">
                  <div class="w-1.5 h-6 rounded-full shrink-0 transition-all" :class="col.visible ? 'bg-[#58b347]' : 'bg-transparent'"></div>
                  <span class="text-[11px] font-black uppercase tracking-widest flex-1">{{ col.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UniversalSearch>

      <!-- PASEK PODSUMOWANIA FINANSOWEGO (EEP EUR + EKOEN PLN + KOSZTY) -->
      <div v-if="!store.isLoading && filteredBillings.length > 0" class="px-8 pt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        <div class="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-emerald-500 p-4 shadow-2xs">
          <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">Rozliczone EEP (EUR)</div>
          <div class="text-xl font-black font-mono text-emerald-700 mt-1">€ {{ financialSummary.eepEurSettled.toFixed(2) }}</div>
          <div class="text-[11px] font-bold text-slate-400 mt-0.5 flex items-center justify-between">
            <span>≈ {{ (financialSummary.eepEurSettled * (Number(store.nbpRate) || 4.3)).toFixed(2) }} PLN</span>
            <span v-if="financialSummary.eepEurPrelim > 0" class="text-blue-600 font-extrabold">+€{{ financialSummary.eepEurPrelim.toFixed(0) }} wstępne</span>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-sky-500 p-4 shadow-2xs">
          <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">Zlecenia EKOEN do FV (PLN)</div>
          <div class="text-xl font-black font-mono text-sky-700 mt-1">{{ financialSummary.ekoenPlnSettled.toFixed(2) }} PLN</div>
          <div class="text-[11px] font-bold mt-0.5 flex items-center justify-between">
            <span class="text-slate-400">Zatwierdzone netto</span>
            <span
              v-if="financialSummary.unbilledPlnCount > 0"
              @click="quickBillingFilter = quickBillingFilter === 'UNBILLED_PLN' ? 'ALL' : 'UNBILLED_PLN'"
              class="text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded text-[10px] font-black cursor-pointer hover:bg-amber-100"
            >
              Brak FV: {{ financialSummary.unbilledPlnCount }}
            </span>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-slate-400 p-4 shadow-2xs">
          <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">Wewnętrzne bez FV & Koszty</div>
          <div class="text-xl font-black font-mono text-slate-700 mt-1">{{ financialSummary.internalPlnTotal.toFixed(2) }} PLN</div>
          <div class="text-[11px] font-bold text-rose-500 mt-0.5 truncate">
            Koszty: €{{ financialSummary.orderCostEurTotal.toFixed(2) }} • Robocizna: {{ financialSummary.laborPlnTotal.toFixed(2) }} zł
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200/90 border-l-4 border-l-[#58b347] p-4 shadow-2xs">
          <div class="text-[10px] font-black uppercase tracking-widest text-[#499b3a]">Łączna Wartość Widoku (PLN)</div>
          <div class="text-xl font-black font-mono text-[#499b3a] mt-1">{{ financialSummary.combinedPlnSettled.toFixed(2) }} PLN</div>
          <div class="text-[11px] font-bold text-slate-400 mt-0.5">
            Suma EEP (wg NBP {{ (Number(store.nbpRate) || 4.3).toFixed(4) }}) + EKOEN
          </div>
        </div>
      </div>

      <!-- SKELETON LOADER -->
      <div v-if="store.isLoading" class="px-8 pt-6 pb-8 flex-1 flex flex-col gap-3 w-full">
        <SkeletonCard v-for="n in 5" :key="n" />
      </div>

      <!-- 3. ZEWNĘTRZNA LISTA AKORDEONÓW ROZLICZEŃ -->
      <BillingsList v-else
        :groupedBillings="groupedBillings"
        :isLoading="store.isLoading"
        :visibleColumns="visibleColumns"
        :selectedIds="selectedIds"
        :currentSort="currentSort"
        :openAccordions="openAccordions"
        @toggle-accordion="toggleAccordion"
        @toggle-currency="toggleCurrency"
        @toggle-select-all-in-group="toggleSelectAllInGroup"
        @toggle-select="toggleSelectOne"
        @copy="copyValue"
        @open-settlement="openSettlementModal"
        @sort="sortBy"
        @drag-start="idx => draggedHeaderIdx = idx"
        @drop-col="onHeaderDrop"
      />

    </div>

    <!-- TOAST -->
    <div v-show="toast.show" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex justify-center pointer-events-none">
      <div class="bg-[#58b347] text-white px-8 py-3.5 rounded-full shadow-[0_10px_30px_rgba(88,179,71,0.5)] flex items-center justify-center gap-3 border border-[#499b3a] transition-all duration-300">
        <svg class="w-5 h-5 shrink-0 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="text-[13px] font-black uppercase tracking-widest whitespace-nowrap">{{ toast.msg }}</span>
      </div>
    </div>

    <!-- MODALE -->
    <UniversalTabModal 
      :show="showTabModal" :isEditing="!!editingTabId" :form="modalForm" :searchQueries="searchQueriesModal"
      @close="showTabModal = false" @save="saveTab"
    />
    <ConfirmModal 
      :show="confirmModal.show" :message="confirmModal.message"
      @cancel="confirmModal.show = false" @confirm="executeConfirm"
    />
    <SettlementModal 
      :show="showSettlementModal" 
      :ticketId="selectedTicketIdForSettlement"
      @close="showSettlementModal = false"
      @save="saveSettlement"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBillingsStore } from '../../stores/useBillingsStore'
import { useSearchFilters } from '../../composables/useSearchFilters'
import { useSmartKpiFilters } from '../../composables/useSmartKpiFilters'

import UniversalKpi from '../../common/UniversalKpi.vue'
import UniversalSearch from '../../common/UniversalSearch.vue'
import SkeletonCard from '../../common/SkeletonCard.vue'
import BillingsList from './BillingsList.vue'

import UniversalTabModal from '../../common/UniversalTabModal.vue'
import ConfirmModal from '../../common/ConfirmModal.vue'
import SettlementModal from '../../modals/SettlementModal.vue'

const store = useBillingsStore()
const { checkBillingSearch } = useSearchFilters()

// Stany UI
const isColDropdownOpen = ref(false)
const selectedIds = ref([])
const currentSort = ref({ col: 'closed_date', dir: 'desc' })
const toast = ref({ show: false, msg: '' })
const openAccordions = ref([])
const draggedMenuColIdx = ref(null)
const draggedHeaderIdx = ref(null)

// Stany Modali
const showTabModal = ref(false)
const editingTabId = ref(null)
const modalForm = ref({ name: "", color: "#58b347", iconPreviewBase64: "", selectedIconName: "" })
const searchQueriesModal = ref([{ id: 'd_' + Date.now(), logic: 'AND', text: '' }])
const confirmModal = ref({ show: false, message: "", onConfirm: null })

const showSettlementModal = ref(false)
const selectedTicketIdForSettlement = ref(null)

const activeBillingMode = ref('ALL') // 'ALL' | 'EEP' | 'EKOEN'
const quickBillingFilter = ref('ALL') // 'ALL' | 'UNBILLED_PLN' | 'INVOICED_PLN' | 'REVISIT' | 'PRELIM'

const columns = ref([
  { id: 'selection', label: '', visible: true, locked: true, sortable: false, width: '50px' },
  { id: 'status', label: 'STATUS', visible: true, sortable: true, width: '145px' },
  { id: 'ticket_id', label: 'NR ZGŁOSZENIA', visible: true, sortable: true, width: '155px' },
  { id: 'station', label: 'STACJA / KLIENT', visible: true, sortable: true, width: '210px' },
  { id: 'closed_date', label: 'DATA ZAMKNIĘCIA', visible: true, sortable: true, width: '155px' },
  { id: 'technician', label: 'OSTATNI TECHNIK', visible: true, sortable: true, width: '170px' },
  { id: 'details', label: 'ZAKRES / LOGISTYKA', visible: true, sortable: false, width: '250px' },
  { id: 'amount', label: 'KWOTA / TRYB', visible: true, sortable: true, width: '185px' },
  { id: 'actions', label: 'AKCJE', visible: true, locked: true, sortable: false, width: '110px' }
])

const visibleColumns = computed(() => columns.value.filter(c => c.visible))

const parseBillingMeta = (item) => {
  let sd = item?.saved_data
  if (typeof sd === 'string') {
    try { sd = JSON.parse(sd) } catch (e) { sd = null }
  }
  const dispId = String(item?.ticket_id || item?.id || '').toUpperCase()
  const rawMode = String(sd?.settlement_mode || item?.settlement_mode || '').toUpperCase()
  const mode = rawMode === 'EKOEN' || (!rawMode && (dispId.startsWith('EE_') || dispId.startsWith('OES/'))) ? 'EKOEN' : 'EEP'

  const isWstepne = item?.billing_state === 'PRE_SETTLED' ||
    String(item?.billing_status || '').toUpperCase().includes('WSTĘPN') ||
    String(item?.status || '').toUpperCase().includes('WSTĘPN') ||
    String(item?.ticket_status || '').toUpperCase().includes('WSTĘPN')

  const isSettled = item?.billing_state === 'SETTLED' ||
    item?.billing_state === 'CORRECTED' ||
    (String(item?.status || '').toUpperCase().includes('ROZLICZONE') && !isWstepne)

  const eur = mode === 'EEP' ? (parseFloat(sd?.total_eur ?? item?.total_eur) || 0) : 0
  const orderCostEur = mode === 'EEP' ? (parseFloat(sd?.order_cost_eur) || 0) : 0
  const pln = mode === 'EKOEN' ? (parseFloat(sd?.total_pln ?? item?.total_pln) || 0) : 0
  const internalPln = mode === 'EKOEN' ? (parseFloat(sd?.internal_cost_pln) || 0) : 0
  const laborPln = mode === 'EKOEN' ? (parseFloat(sd?.labor_cost_pln) || 0) : 0
  const invoiceIssued = String(sd?.invoice_issued || 'NIE').toUpperCase() === 'TAK'
  const revisit = String(sd?.status_revisit || '').toUpperCase() === 'TAK' ||
    (Array.isArray(sd?.visits_array) && sd.visits_array.some(v => Boolean(v.status_revisit)))

  return {
    sd, mode, isWstepne, isSettled,
    eur, orderCostEur, pln, internalPln, laborPln,
    invoiceIssued, revisit
  }
}

// --- UŻYCIE NOWEGO, INTELIGENTNEGO COMPOSABLE ---
store.getBaseList = () => store.billings
store.duplicateIds = []

const { filteredBaseList, tabCounts } = useSmartKpiFilters(store, checkBillingSearch)

const filteredBillings = computed(() => {
  let base = filteredBaseList.value.filter(item => {
    if (item.billing_state === 'NEW' || item.status === 'Nowe' || item.ticket_status === 'Nowe') return false
    const meta = parseBillingMeta(item)

    if (activeBillingMode.value === 'EEP' && meta.mode !== 'EEP') return false
    if (activeBillingMode.value === 'EKOEN' && meta.mode !== 'EKOEN') return false

    if (quickBillingFilter.value === 'UNBILLED_PLN') {
      if (meta.mode !== 'EKOEN' || meta.invoiceIssued || meta.pln <= 0) return false
    } else if (quickBillingFilter.value === 'INVOICED_PLN') {
      if (meta.mode !== 'EKOEN' || !meta.invoiceIssued) return false
    } else if (quickBillingFilter.value === 'REVISIT') {
      if (!meta.revisit) return false
    } else if (quickBillingFilter.value === 'PRELIM') {
      if (!meta.isWstepne) return false
    }

    return true
  })

  // Aplikujemy tylko sortowanie (filtry obsługuje już Composable!)
  if (currentSort.value.col) {
    const col = currentSort.value.col
    const dir = currentSort.value.dir

    base.sort((a, b) => {
      let valA = a[col] || ''; let valB = b[col] || ''
      if (col === 'station') { valA = a.qp || ''; valB = b.qp || '' }

      if (col === 'closed_date') {
        let isEmptyA = (!valA || valA === '-' || valA === 'Brak daty')
        let isEmptyB = (!valB || valB === '-' || valB === 'Brak daty')
        if (isEmptyA && !isEmptyB) return -1
        if (!isEmptyA && isEmptyB) return 1
        if (isEmptyA && isEmptyB) return 0
        
        let dateA = new Date(valA).getTime()
        let dateB = new Date(valB).getTime()
        if (!isNaN(dateA) && !isNaN(dateB)) return dir === 'asc' ? dateA - dateB : dateB - dateA
      }

      valA = String(valA).toLowerCase()
      valB = String(valB).toLowerCase()
      if (valA < valB) return dir === 'asc' ? -1 : 1
      if (valA > valB) return dir === 'asc' ? 1 : -1
      return 0
    })
  }

  return base
})

const groupedBillings = computed(() => {
  const groups = {}
  const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']

  filteredBillings.value.forEach(item => {
    if (item.billing_state === 'NEW' || item.status === 'Nowe' || item.ticket_status === 'Nowe') return

    let sortKey = '9999-99'
    let label = 'ZAMKNIĘTE BEZ DATY (Błąd Systemu / Do wyjaśnienia)'
    
    const isWstepne = item.billing_state === 'PRE_SETTLED' || 
                      String(item.billing_status || '').toUpperCase().includes('WSTĘPN') || 
                      String(item.status || '').toUpperCase().includes('WSTĘPN') ||
                      String(item.ticket_status || '').toUpperCase().includes('WSTĘPN')
    
    if (isWstepne) {
       sortKey = '9999-98'
       label = 'WSTĘPNIE ROZLICZONE (Do weryfikacji)'
    } else {
       let rawDate = item.closed_date || item.date_closed || item.end_datetime || item.updated_at || item.created_at || item.start_datetime
       if (rawDate && rawDate !== '-' && rawDate !== 'Brak daty') {
           let d = new Date(rawDate)
           if (isNaN(d.getTime()) && typeof rawDate === 'string') {
               let parts = rawDate.split(/[-. /T:]/)
               if (parts.length >= 3) {
                   let day = parseInt(parts[0], 10), month = parseInt(parts[1], 10) - 1, year = parseInt(parts[2], 10)
                   if (year < 100) { year = parseInt(parts[0], 10); day = parseInt(parts[2], 10) }
                   d = new Date(year, month, day)
               }
           }
           if (!isNaN(d.getTime())) {
             const y = d.getFullYear()
             const m = String(d.getMonth() + 1).padStart(2, '0')
             sortKey = `${y}-${m}`
             label = `${monthNames[d.getMonth()]} ${y}`
           }
       }
    }

    if (!groups[sortKey]) {
      groups[sortKey] = { key: sortKey, label: label, items: [], settledCount: 0, totalEur: 0, eepEur: 0, ekoenPln: 0 }
    }

    groups[sortKey].items.push(item)
    const meta = parseBillingMeta(item)
    const rate = Number(store.nbpRate) || 4.30

    if (meta.isSettled) {
      groups[sortKey].settledCount++
      if (meta.mode === 'EKOEN') {
        groups[sortKey].ekoenPln += meta.pln
        groups[sortKey].totalEur += (meta.pln / rate)
      } else {
        groups[sortKey].eepEur += meta.eur
        groups[sortKey].totalEur += meta.eur
      }
    }
  })

  return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key))
})

const financialSummary = computed(() => {
  let eepEurSettled = 0
  let eepEurPrelim = 0
  let ekoenPlnSettled = 0
  let unbilledPlnCount = 0
  let internalPlnTotal = 0
  let orderCostEurTotal = 0
  let laborPlnTotal = 0

  filteredBillings.value.forEach(item => {
    const m = parseBillingMeta(item)
    if (m.mode === 'EEP') {
      if (m.isSettled) eepEurSettled += m.eur
      else if (m.isWstepne) eepEurPrelim += m.eur
      if (m.isSettled || m.isWstepne) orderCostEurTotal += m.orderCostEur
    } else {
      if (m.isSettled) ekoenPlnSettled += m.pln
      if ((m.isSettled || m.isWstepne) && m.pln > 0 && !m.invoiceIssued) unbilledPlnCount++
      if (m.isSettled || m.isWstepne) {
        internalPlnTotal += m.internalPln
        laborPlnTotal += m.laborPln
      }
    }
  })

  const rate = Number(store.nbpRate) || 4.30
  return {
    eepEurSettled,
    eepEurPrelim,
    ekoenPlnSettled,
    unbilledPlnCount,
    internalPlnTotal,
    orderCostEurTotal,
    laborPlnTotal,
    combinedPlnSettled: (eepEurSettled * rate) + ekoenPlnSettled
  }
})

// --- AKCJE INTERFEJSU WIDOKU ---
const closeAllDropdowns = () => { isColDropdownOpen.value = false }
const sortBy = (colId) => {
  if (currentSort.value.col === colId) currentSort.value.dir = currentSort.value.dir === 'asc' ? 'desc' : 'asc'
  else { currentSort.value.col = colId; currentSort.value.dir = 'asc' }
}

const toggleAccordion = (key) => {
  if (openAccordions.value.includes(key)) openAccordions.value = openAccordions.value.filter(k => k !== key)
  else openAccordions.value.push(key)
}

const toggleCurrency = (key) => {
  const current = store.groupCurrency[key] || 'EUR'
  store.groupCurrency[key] = current === 'EUR' ? 'PLN' : 'EUR'
}

const toggleSelectAllInGroup = (group) => {
  const allMatch = group.items.length > 0 && group.items.every(i => selectedIds.value.includes(i.id))
  if (allMatch) group.items.forEach(i => { selectedIds.value = selectedIds.value.filter(id => id !== i.id) })
  else group.items.forEach(i => { if (!selectedIds.value.includes(i.id)) selectedIds.value.push(i.id) })
}

const toggleSelectOne = (id) => {
  if (selectedIds.value.includes(id)) selectedIds.value = selectedIds.value.filter(x => x !== id)
  else selectedIds.value.push(id)
}

const copyValue = (val) => {
  if (!val || val === '-' || !String(val).trim()) return
  navigator.clipboard.writeText(String(val)).then(() => {
    toast.value = { show: true, msg: 'Skopiowano do schowka!' }
    setTimeout(() => { toast.value.show = false }, 2000)
  })
}

const massDelete = () => {
  confirmModal.value = {
    show: true, 
    message: `Usunąć zaznaczone zgłoszenia (${selectedIds.value.length}) z rozliczeń?`,
    onConfirm: () => {
      selectedIds.value.forEach(id => store.deleteBilling(id))
      selectedIds.value = []
      toast.value = { show: true, msg: 'Zgłoszenia usunięte z bilingu.' }
      setTimeout(() => { toast.value.show = false }, 3000)
    }
  }
}

// ===============================================
// OBSŁUGA MODALA ROZLICZEŃ I BAZY
// ===============================================
const openSettlementModal = (id) => {
  selectedTicketIdForSettlement.value = id
  showSettlementModal.value = true
}

const saveSettlement = (payload) => {
  showSettlementModal.value = false
  if (typeof google !== 'undefined' && google.script) {
    google.script.run
      .withSuccessHandler(() => {
        updateStoreWithPayload(payload)
        toast.value = { show: true, msg: `Zapisano (${payload.ticket_status})!` }
        setTimeout(() => { toast.value.show = false }, 3000)
      })
      .withFailureHandler(() => {
        toast.value = { show: true, msg: 'Błąd połączenia. Zapisano tylko lokalnie!' }
        setTimeout(() => { toast.value.show = false }, 3000)
        updateStoreWithPayload(payload)
      })
      .saveUnifiedSettlement(payload)
  } else {
    updateStoreWithPayload(payload)
    toast.value = { show: true, msg: `Zapisano lokalnie (${payload.ticket_status})!` }
    setTimeout(() => { toast.value.show = false }, 3000)
  }
}

const updateStoreWithPayload = (payload) => {
  const bIdx = store.billings.findIndex(t => String(t.id) === String(payload.raw_id) || String(t.ticket_id) === String(payload.raw_id))
  if (payload.is_deleted) {
    if (bIdx > -1) store.billings.splice(bIdx, 1)
  } else {
    const updatedBilling = {
      id: payload.raw_id,
      ticket_id: payload.ticket_id,
      client: payload.client,
      qp: payload.qp,
      technician: payload.tech,
      technician_id: payload.tech,
      billing_state: payload.billing_state,
      status: payload.ticket_status,
      ticket_status: payload.ticket_status,
      closed_date: payload.date || (bIdx > -1 ? store.billings[bIdx].closed_date : ''),
      total_eur: payload.total_eur,
      total_pln: payload.total_pln,
      settlement_mode: payload.settlement_mode || 'EEP',
      report_url: payload.report_url || '',
      saved_data: JSON.parse(JSON.stringify(payload))
    }
    if (bIdx > -1) store.billings[bIdx] = { ...store.billings[bIdx], ...updatedBilling }
    else store.billings.push(updatedBilling)
  }
}

const executeConfirm = () => {
  if (confirmModal.value.onConfirm) confirmModal.value.onConfirm()
  confirmModal.value.show = false
}

// LOGIKA ZAKŁADEK I KOLUMN
const loadColumnsConfig = () => {
  try {
    const localStore = JSON.parse(localStorage.getItem('EKOEN_BILLINGS_UI')) || {}
    if (localStore.cols_billings && localStore.cols_billings.length > 0) {
      const savedCols = localStore.cols_billings
      if (!savedCols.some(c => c.id === 'details')) {
        const amtIdx = savedCols.findIndex(c => c.id === 'amount' || c.id === 'actions')
        const detailsCol = { id: 'details', label: 'ZAKRES / LOGISTYKA', visible: true, sortable: false, width: '250px' }
        if (amtIdx > -1) savedCols.splice(amtIdx, 0, detailsCol)
        else savedCols.push(detailsCol)
      }
      if (!savedCols.some(c => c.id === 'amount')) {
        const actIdx = savedCols.findIndex(c => c.id === 'actions')
        const amountCol = { id: 'amount', label: 'KWOTA / TRYB', visible: true, sortable: true, width: '185px' }
        if (actIdx > -1) savedCols.splice(actIdx, 0, amountCol)
        else savedCols.push(amountCol)
      }
      columns.value = savedCols
    }
  } catch (e) {}
}

const saveColumnsConfig = () => {
  try {
    const localStore = JSON.parse(localStorage.getItem('EKOEN_BILLINGS_UI')) || {}
    localStore.cols_billings = columns.value
    localStorage.setItem('EKOEN_BILLINGS_UI', JSON.stringify(localStore))
  } catch (e) {}
}

const onMenuColDrop = (targetIdx) => {
  if (draggedMenuColIdx.value === null || draggedMenuColIdx.value === targetIdx) return
  const moved = columns.value.splice(draggedMenuColIdx.value, 1)[0]
  columns.value.splice(targetIdx, 0, moved)
  draggedMenuColIdx.value = null
  saveColumnsConfig()
}

const onHeaderDrop = (targetIdx) => {
  if (draggedHeaderIdx.value === null || draggedHeaderIdx.value === targetIdx) return
  const draggedColId = visibleColumns.value[draggedHeaderIdx.value].id
  const targetColId = visibleColumns.value[targetIdx].id
  if (draggedColId === 'selection' || targetColId === 'selection' || draggedColId === 'actions' || targetColId === 'actions') return
  
  const realDraggedIdx = columns.value.findIndex(c => c.id === draggedColId)
  const realTargetIdx = columns.value.findIndex(c => c.id === targetColId)
  
  const moved = columns.value.splice(realDraggedIdx, 1)[0]
  columns.value.splice(realTargetIdx, 0, moved)
  draggedHeaderIdx.value = null
  saveColumnsConfig()
}

// LOGIKA MULTI-SELECT 
const setActiveTab = (filterId) => {
  let current = store.activeTabs ? [...store.activeTabs] : ['ALL']

  if (filterId === 'ALL') {
    current = ['ALL']
  } else {
    current = current.filter(id => id !== 'ALL')
    if (current.includes(filterId)) {
      current = current.filter(id => id !== filterId)
      if (current.length === 0) current = ['ALL']
    } else {
      current.push(filterId)
    }
  }
  
  store.activeTabs = current
  saveUserConfig()
}

const openNewTabModal = () => {
  editingTabId.value = null
  modalForm.value = { name: "", color: "#58b347", iconPreviewBase64: "", selectedIconName: "" }
  searchQueriesModal.value = [{ id: 'd_' + Date.now(), logic: 'AND', text: '' }]
  showTabModal.value = true
}

const editTab = (tab) => {
  if (tab.filter !== 'CUSTOM') return
  editingTabId.value = tab.id
  modalForm.value = { name: tab.name, color: tab.color, iconPreviewBase64: tab.icon, selectedIconName: "" }
  searchQueriesModal.value = tab.customQueries ? JSON.parse(JSON.stringify(tab.customQueries)) : [{ id: 'd_' + Date.now(), logic: 'AND', text: '' }]
  showTabModal.value = true
}

const confirmDeleteTab = (id) => {
  confirmModal.value = {
    show: true, message: "Usunąć ten filtr (zakładkę)?",
    onConfirm: () => {
      store.kpiTabs = store.kpiTabs.filter(t => t.id !== id)
      if (store.activeTabs && store.activeTabs.includes(id)) {
          store.activeTabs = store.activeTabs.filter(tabId => tabId !== id);
          if (store.activeTabs.length === 0) store.activeTabs = ['ALL']; 
      }
      saveUserConfig()
    }
  }
}

const saveTab = ({ form, queries }) => {
  const validQ = queries.filter(q => q.text.trim() !== '')
  if (editingTabId.value) {
    const tab = store.kpiTabs.find(t => t.id === editingTabId.value)
    if (tab) { tab.name = form.name; tab.color = form.color; tab.icon = form.iconPreviewBase64; tab.customQueries = JSON.parse(JSON.stringify(validQ)) }
  } else {
    store.kpiTabs.push({ id: "TAB_" + Date.now(), name: form.name, filter: "CUSTOM", color: form.color, icon: form.iconPreviewBase64, customQueries: JSON.parse(JSON.stringify(validQ)) })
    store.activeTabs = [store.kpiTabs[store.kpiTabs.length - 1].id]
  }
  saveUserConfig()
  showTabModal.value = false
}

const handleReorderTabs = ({ sourceId, targetId }) => {
  const tabs = [...store.kpiTabs]
  const srcIdx = tabs.findIndex(t => t.id === sourceId)
  const tgtIdx = tabs.findIndex(t => t.id === targetId)
  if (srcIdx !== -1 && tgtIdx !== -1) {
    const [movedTab] = tabs.splice(srcIdx, 1)
    tabs.splice(tgtIdx, 0, movedTab)
    store.kpiTabs = tabs
    saveUserConfig()
  }
}

const saveUserConfig = () => store.saveTabsConfiguration()

onMounted(() => {
  loadColumnsConfig()
  store.fetchBillingsData()
})
</script>

<style scoped>
.billings-custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.billings-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.billings-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
.billings-custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.8); }
</style>