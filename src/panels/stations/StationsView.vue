<template>
<div class="flex flex-col h-full bg-[#f4f6f8] relative z-10 overflow-auto stations-custom-scrollbar" @click="closeAllDropdowns" @scroll="handleScroll">
    
<!-- 1. UNIWERSALNE KPI -->
    <UniversalKpi 
      title="Baza Stacji"
      subtitle="Zarządzanie infrastrukturą ładowania i jej lokalizacją."
      :views="[
        { label: 'Ekoenergetyka', value: 'ekoenergetyka' },
        { label: 'Ekoen', value: 'ekoen' }
      ]"
      :activeView="store.activeModule"
      @switch-view="switchModule"
      :activeTabs="store.activeTabs"
      :tabs="store.kpiTabs"
      :tabCounts="tabCounts"
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
      placeholder="Szukaj ID zgłoszenia, klienta, miasto, technika..."
      @add-row="store.searchQueriesMain.push({ id: 'sq_' + Date.now(), logic: 'AND', text: '' })"
      @remove-row="(id) => store.searchQueriesMain = store.searchQueriesMain.filter(q => q.id !== id)"
    >
      <template #actions>
        
        <div class="bg-slate-50 border border-slate-200/80 rounded-xl px-4 text-[11px] font-black tracking-wider uppercase text-slate-500 shadow-sm flex items-center gap-2 h-[42px] mr-2">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          WIDOCZNYCH: <span class="text-[#58b347] font-black text-sm ml-1">{{ filteredStations.length }} / {{ store.stations.length }}</span>
        </div>

        <div class="relative">
          <button @click.stop="isColDropdownOpen = !isColDropdownOpen" class="bg-white border border-slate-200 text-slate-600 font-extrabold px-4 py-2.5 rounded-xl text-[13px] hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2 h-[42px] mr-2">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg> Kolumny
          </button>
          <div v-show="isColDropdownOpen" @click.stop class="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-[150] p-4">
            <p class="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 border-b border-slate-100 pb-2 px-2">WIDOCZNE KOLUMNY</p>
            <div class="max-h-[320px] overflow-y-auto stations-custom-scrollbar pr-1">
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

        <button v-if="selectedIds.length > 0" @click="massDelete" class="bg-red-50 text-red-600 border border-red-100 font-extrabold px-4 py-2.5 rounded-xl text-[13px] hover:bg-red-100 shadow-sm transition-all flex items-center gap-2 h-[42px] mr-2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          Usuń ({{ selectedIds.length }})
        </button>

        <button @click.stop="openAddStationModal" class="bg-[#58b347] text-white font-extrabold px-5 py-2.5 rounded-xl text-[13px] hover:bg-[#499b3a] shadow-md shadow-[#58b347]/20 transition-all flex items-center gap-2 h-[42px]">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nowa stacja
        </button>
      </template>
    </UniversalSearch>

    <!-- 3. GŁÓWNA TREŚĆ -->
    <div class="px-8 pt-4 pb-8 flex-1 flex flex-col relative shrink-0">
      
      <div v-if="store.isLoading" class="flex-1 flex flex-col gap-3 w-full">
        <div class="w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-pulse flex flex-col gap-4" v-for="n in 5" :key="n">
           <div class="h-10 bg-slate-200 rounded-xl w-full"></div>
        </div>
      </div>

      <StationsList 
        v-else
        :stations="paginatedStations" 
        :isLoading="store.isLoading"
        :visibleColumns="visibleColumns"
        :selectedIds="selectedIds"
        :mutedIds="store.mutedIds"
        :currentSort="currentSort"
        @sort="sortBy"
        @toggle-select-all="toggleSelectAll"
        @toggle-select="toggleSelectOne"
        @toggle-mute-all="toggleMuteAll"
        @toggle-mute="toggleMuteOne"
        @drag-start="idx => draggedHeaderIdx = idx"
        @drop-col="onHeaderDrop"
        @open-analytics="openAnalytics"
        @open-edit="openAddStationModal"
      />
    </div>

    <!-- TOAST -->
    <div v-show="toast.show" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#58b347] text-white px-8 py-3.5 rounded-full shadow-[0_10px_30px_rgba(88,179,71,0.5)] flex items-center justify-center gap-3 border border-[#499b3a] transition-all duration-300">
      <svg class="w-5 h-5 shrink-0 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span class="text-[13px] font-black uppercase tracking-widest whitespace-nowrap">{{ toast.msg }}</span>
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
    
    <!-- Analityka -->
    <StationAnalyticsModal 
      :show="showAnalyticsModal" 
      :stationQp="analyticsQp"
      @close="showAnalyticsModal = false"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStationsStore } from '../../stores/useStationsStore'
import { useSmartKpiFilters } from '../../composables/useSmartKpiFilters'

import UniversalKpi from '../../common/UniversalKpi.vue'
import UniversalSearch from '../../common/UniversalSearch.vue'
import UniversalTabModal from '../../common/UniversalTabModal.vue'
import ConfirmModal from '../../common/ConfirmModal.vue'
import StationsList from './StationsList.vue'
import StationAnalyticsModal from '../../modals/StationAnalyticsModal.vue'

const store = useStationsStore()

const switchModule = (mod) => {
  store.activeModule = mod
}

const currentPage = ref(1)
const selectedIds = ref([])
const toast = ref({ show: false, msg: '' })

const showTabModal = ref(false)
const editingTabId = ref(null)
const modalForm = ref({ name: "", color: "#58b347", iconPreviewBase64: "", selectedIconName: "" })
const searchQueriesModal = ref([{ id: 'd_' + Date.now(), logic: 'AND', text: '' }])
const confirmModal = ref({ show: false, message: "", onConfirm: null })

const showAnalyticsModal = ref(false)
const analyticsQp = ref('')

const isColDropdownOpen = ref(false)
const currentSort = ref({ col: null, dir: 'asc' })
const draggedMenuColIdx = ref(null)
const draggedHeaderIdx = ref(null)

const columns = ref([
  { id: 'actions', label: 'AKCJE', visible: true, locked: true, sortable: false, width: '120px' },
  { id: 'public_id', label: 'ID STACJI', visible: true, sortable: true, width: '140px' },
  { id: 'client', label: 'KLIENT', visible: true, sortable: true, width: '180px' },
  { id: 'location', label: 'LOKALIZACJA', visible: true, sortable: true, width: '280px' },
  { id: 'region', label: 'REGION', visible: true, sortable: true, width: '130px' },
  { id: 'model', label: 'MODEL', visible: true, sortable: true, width: '160px' },
  { id: 'udt', label: 'UDT', visible: true, sortable: true, width: '120px' },
  { id: 'ticket', label: 'AKTYWNE ZGŁOSZENIE', visible: true, sortable: true, width: '210px' },
  { id: 'tech', label: 'OPIEKUN', visible: true, sortable: true, width: '200px' },
  { id: 'status', label: 'STATUS', visible: true, sortable: true, width: '180px' }
])

const visibleColumns = computed(() => columns.value.filter(c => c.visible))

// --- FUNKCJE POMOCNICZE WYSZUKIWANIA I EWALUACJI ---
const isActiveTicket = (s) => {
  let activeTickets = []
  if (store.tickets.length > 0) {
    store.tickets.forEach(t => {
      const tStatus = String(t.status || t.ticket_status || t.status_zlecenia || '').toLowerCase().trim()
      const qpMatch = String(t.qp_id || t.station_id || t.qp || '').toLowerCase().trim()
      const sid = String(s.id).toLowerCase().trim()
      const spub = String(s.public_id).toLowerCase().trim()
      
      const isMatch = qpMatch !== '' && (qpMatch === sid || qpMatch === spub || qpMatch.startsWith(spub + '_') || qpMatch.startsWith(spub + '-'))
      if (isMatch && !tStatus.includes('zakończ') && !tStatus.includes('zamknięt') && !tStatus.includes('closed') && !tStatus.includes('anulowan') && !tStatus.includes('cancelled') && !tStatus.includes('wykonano')) {
          activeTickets.push(t)
      }
    })
  } else {
    // Fallback
    if (s.active_ticket_id && String(s.active_ticket_id).trim() !== '') {
      const tStatus = s.ticket_status ? String(s.ticket_status).trim().toLowerCase() : ''
      if (!tStatus.includes('zakończ') && !tStatus.includes('zamknięt') && !tStatus.includes('closed') && !tStatus.includes('anulowan') && !tStatus.includes('cancelled') && !tStatus.includes('wykonano')) {
          activeTickets.push(s)
      }
    }
  }
  return activeTickets.length > 0
}

const checkStationSearch = (s, queryStr) => {
  let q = String(queryStr || '').toLowerCase().trim()
  if (!q) return true
  
  if (q.startsWith('technik:')) q = q.replace('technik:', '').trim()
  if (q.startsWith('tech_exact:')) q = q.replace('tech_exact:', '').trim()

  const superString = [
    s.public_id, s.city, s.street, s.client_id, s.technician_id, s.model, s.street_number, s.active_ticket_id, s.ticket_technician
  ].filter(Boolean).join(' | ').toLowerCase()
  
  return superString.includes(q)
}

const evaluateStationTab = (s, tab) => {
  if (tab.filter === 'ALL') return true
  // --- ZMIENIONO NA BŁYSKAWICZNE ODPYTYWANIE STORE ---
  if (tab.filter === 'AWARIE') return store.getStationActiveTickets(s).length > 0
  if (tab.filter === 'NO_GPS') return !s.gps_lat || !s.gps_lng || String(s.gps_lat).trim() === ''
  if (tab.filter === 'MUTED') return store.mutedIds.has(s.id)
  
  if ((tab.filter === 'CUSTOM' || tab.filter === 'SYSTEM') && tab.customQueries) {
    const validSearch = tab.customQueries.filter(q => q.text.trim() !== '')
    if (validSearch.length === 0) return true
    
    let match = checkStationSearch(s, validSearch[0].text)
    if (validSearch[0].logic === 'NOT') match = !match
    for (let i = 1; i < validSearch.length; i++) {
      const cMet = checkStationSearch(s, validSearch[i].text)
      if (validSearch[i].logic === 'AND') match = match && cMet
      else if (validSearch[i].logic === 'OR') match = match || cMet
      else if (validSearch[i].logic === 'NOT') match = match && !cMet
    }
    return match
  }
  return true
}

// --- WPIĘCIE LOGIKI USE-SMART-KPI-FILTERS ---
store.getBaseList = () => store.stations
store.duplicateIds = []

const { evaluateQueries } = useSmartKpiFilters(store, checkStationSearch)


// --- LOGIKA MULTI-SELECT (ZLICZANIE CYFEREK) ---
const tabCounts = computed(() => {
  const counts = {}
  if (!store.kpiTabs) return counts
  
  let searchFilteredBase = store.stations
  const validSearch = store.searchQueriesMain.filter(q => q.text.trim() !== '')
  
  if (validSearch.length > 0) {
    searchFilteredBase = searchFilteredBase.filter(s => evaluateQueries(s, store.searchQueriesMain))
  }

  store.kpiTabs.forEach(tab => {
     let isTech = tab.id.startsWith('TECH_')
     const activeTabsIds = store.activeTabs || ['ALL']
     const activeTabObjs = activeTabsIds.filter(id => id !== 'ALL').map(id => store.kpiTabs.find(t => t.id === id)).filter(Boolean)
     
     let techTabs = activeTabObjs.filter(t => t.id.startsWith('TECH_'))
     let otherTabs = activeTabObjs.filter(t => !t.id.startsWith('TECH_'))
     
     // Wbudowana "madrosc kaflowa": Symulujemy grupy, wykluczając konkurencyjne kafelki z tej samej grupy
     let simulatedTechGroup = isTech ? [tab] : techTabs
     let simulatedOtherGroup = !isTech ? [...otherTabs, tab] : otherTabs
     
     counts[tab.id] = searchFilteredBase.filter(s => {
        let passTech = simulatedTechGroup.length === 0 || simulatedTechGroup.some(t => evaluateStationTab(s, t))
        let passOther = simulatedOtherGroup.length === 0 || simulatedOtherGroup.every(t => evaluateStationTab(s, t))
        return passTech && passOther
     }).length
  })
  
  return counts
})


// --- LOGIKA MULTI-SELECT (FILTROWANIE TABELI BAZOWEJ) ---
const filteredStations = computed(() => {
  let base = store.stations
  const activeTabsIds = store.activeTabs || ['ALL']
  
  // Krzyżowanie filtrów LUB/ORAZ
  if (!activeTabsIds.includes('ALL')) {
      const activeTabObjs = activeTabsIds.map(id => store.kpiTabs.find(t => t.id === id)).filter(Boolean)
      
      const techTabs = activeTabObjs.filter(t => t.id.startsWith('TECH_'))
      const otherTabs = activeTabObjs.filter(t => !t.id.startsWith('TECH_'))
      
      base = base.filter(s => {
          let passTech = techTabs.length === 0 || techTabs.some(tab => evaluateStationTab(s, tab))
          let passOther = otherTabs.length === 0 || otherTabs.every(tab => evaluateStationTab(s, tab))
          return passTech && passOther
      })
  }

  // Aplikowanie wyników inputa
  const validSearch = store.searchQueriesMain.filter(q => q.text.trim() !== '')
  if (validSearch.length > 0) {
    base = base.filter(s => evaluateQueries(s, store.searchQueriesMain))
  }

  // Sortowanie
  if (currentSort.value.col) {
    base.sort((a, b) => {
      let valA = '', valB = ''
      const col = currentSort.value.col
      if (col === 'client') { valA = a.client_id || ''; valB = b.client_id || ''; }
      else if (col === 'tech') { valA = a.technician_id || ''; valB = b.technician_id || ''; }
      else if (col === 'location') { valA = a.city || ''; valB = b.city || ''; }
      else if (col === 'ticket') { valA = a.active_ticket_id || ''; valB = b.active_ticket_id || ''; }
      else { valA = a[col] || ''; valB = b[col] || ''; }

      valA = String(valA).toLowerCase(); valB = String(valB).toLowerCase()
      if (valA < valB) return currentSort.value.dir === 'asc' ? -1 : 1
      if (valA > valB) return currentSort.value.dir === 'asc' ? 1 : -1
      return 0
    })
  }
  
  return base
})

const paginatedStations = computed(() => filteredStations.value.slice(0, currentPage.value * 50))

// --- RESZTA LOGIKI ---
const sortBy = (colId) => {
  if (currentSort.value.col === colId) currentSort.value.dir = currentSort.value.dir === 'asc' ? 'desc' : 'asc'
  else { currentSort.value.col = colId; currentSort.value.dir = 'asc' }
}

const toggleSelectAll = () => {
  if (selectedIds.value.length === filteredStations.value.length) selectedIds.value = []
  else selectedIds.value = filteredStations.value.map(t => t.id)
}

const toggleSelectOne = (id) => {
  if (selectedIds.value.includes(id)) selectedIds.value = selectedIds.value.filter(x => x !== id)
  else selectedIds.value.push(id)
}

const toggleMuteAll = () => {
  if (selectedIds.value.length === 0) { alert("Zaznacz najpierw stacje w tabeli!"); return }
  store.toggleMuteBulk(selectedIds.value)
  toast.value = { show: true, msg: `Zmieniono status wyciszenia dla ${selectedIds.value.length} stacji.` }
  setTimeout(() => { toast.value.show = false }, 3000)
}

const toggleMuteOne = (id) => {
  store.toggleMuteBulk([id])
  toast.value = { show: true, msg: `Zmieniono status wyciszenia stacji.` }
  setTimeout(() => { toast.value.show = false }, 2500)
}

const massDelete = () => {
  confirmModal.value = {
    show: true, message: `Czy na pewno chcesz usunąć ${selectedIds.value.length} zaznaczonych stacji?`,
    onConfirm: () => {
      store.deleteStationsBulk(selectedIds.value)
      selectedIds.value = []
      toast.value = { show: true, msg: 'Stacje usunięte!' }
      setTimeout(() => { toast.value.show = false }, 3000)
    }
  }
}

const openAddStationModal = (id = null) => {
  if (typeof window.m_openQuickAddStation === 'function') {
    if (id) {
       const s = store.stations.find(x => x.id === id)
       window.m_openQuickAddStation(true, s.gps_lat, s.gps_lng, s)
    } else {
       window.m_openQuickAddStation(false)
    }
  } else {
    toast.value = { show: true, msg: 'Moduł edycji stacji (Modal_AddStation) niedostępny.' }
    setTimeout(() => { toast.value.show = false }, 3000)
  }
}

const openAnalytics = (qp) => {
  analyticsQp.value = qp
  showAnalyticsModal.value = true
}

const loadColumnsConfig = () => {
  try {
    const localStore = JSON.parse(localStorage.getItem('EKOEN_STATIONS_UI')) || {}
    if (localStore.cols_stations && localStore.cols_stations.length > 0) columns.value = localStore.cols_stations
  } catch (e) {}
}

const saveColumnsConfig = () => {
  try {
    const localStore = JSON.parse(localStorage.getItem('EKOEN_STATIONS_UI')) || {}
    localStore.cols_stations = columns.value
    localStorage.setItem('EKOEN_STATIONS_UI', JSON.stringify(localStore))
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
  if (draggedColId === 'actions' || targetColId === 'actions') return
  const realDraggedIdx = columns.value.findIndex(c => c.id === draggedColId)
  const realTargetIdx = columns.value.findIndex(c => c.id === targetColId)
  const moved = columns.value.splice(realDraggedIdx, 1)[0]
  columns.value.splice(realTargetIdx, 0, moved)
  draggedHeaderIdx.value = null
  saveColumnsConfig()
}

const closeAllDropdowns = () => {
  isColDropdownOpen.value = false
}

// === ZAAWANSOWANA LOGIKA ZAKŁADEK ===
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
  currentPage.value = 1
  saveUserConfig()
}

const openNewTabModal = () => {
  editingTabId.value = null
  modalForm.value = { name: "", color: "#58b347", iconPreviewBase64: "", selectedIconName: "" }
  searchQueriesModal.value = [{ id: 'd_' + Date.now(), logic: 'AND', text: '' }]
  showTabModal.value = true
}

const editTab = (tab) => {
  if (tab.filter === 'ALL' || tab.filter === 'AWARIE' || tab.filter === 'NO_GPS' || tab.filter === 'MUTED') return
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

const executeConfirm = () => {
  if (confirmModal.value.onConfirm) confirmModal.value.onConfirm()
  confirmModal.value.show = false
}

const saveUserConfig = () => store.saveTabsConfiguration()

// --- NIESKOŃCZONE PRZEWIJANIE (INFINITE SCROLL) ---
const handleScroll = (e) => {
  const target = e.target;
  // Jeśli użytkownik dotarł do 90% paska przewijania, załaduj kolejną paczkę 50 stacji
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 200) {
    if (filteredStations.value.length > currentPage.value * 50) {
       currentPage.value++;
    }
  }
}

onMounted(() => {
  loadColumnsConfig()
  store.fetchStationsData()
})
</script>

<style scoped>
.stations-custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.stations-custom-scrollbar::-webkit-scrollbar-track { background: rgba(241, 245, 249, 0.4); border-radius: 10px; }
.stations-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }
.stations-custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.8); }

.stations-appearance-none { -moz-appearance: none; -webkit-appearance: none; appearance: none; }
</style>