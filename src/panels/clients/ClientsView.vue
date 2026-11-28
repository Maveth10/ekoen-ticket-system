<template>
  <div class="w-full h-full bg-[#f4f6f8] overflow-auto overflow-x-hidden client-custom-scrollbar" @scroll="handleScroll">
    <div class="w-full flex flex-col pb-16 min-h-full">
      
      <!-- 1. UNIWERSALNE KAFELKI KPI -->
      <UniversalKpi 
        title="Baza Klientów"
        subtitle="Zarządzanie kartoteką klientów i filtrami systemowymi."
        :views="[
          { label: 'Firmy', value: 'companies' },
          { label: 'Osoby Prywatne', value: 'private' }
        ]"
        :activeView="activeModule"
        :activeTabs="store.activeTabs"
        :tabs="store.kpiTabs"
        :tabCounts="tabCounts"
        @switch-view="activeModule = $event"
        @select-tab="setActiveTab"
        @edit-tab="editTab"
        @delete-tab="deleteTab"
        @open-modal="openNewTabModal"
        @reorder-tabs="handleReorderTabs"
        @save-settings="saveUserConfig"
      />

      <!-- 2. UNIWERSALNA WYSZUKIWARKA -->
      <UniversalSearch 
        :queries="store.searchQueriesMain"
        placeholder="Szukaj danych (np. Orlen, MIASTO: Wrocław)..."
        @add-row="store.searchQueriesMain.push({ id: 'm_' + Date.now(), logic: 'AND', text: '' })"
        @remove-row="(id) => store.searchQueriesMain = store.searchQueriesMain.filter(q => q.id !== id)"
      >
        <template #actions>
          <div class="bg-slate-50 border border-slate-200/80 rounded-xl px-4 text-[11px] font-black tracking-wider uppercase text-slate-500 shadow-sm flex items-center gap-2 h-[42px] mr-2">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            WIDOCZNYCH: <span class="text-[#58b347] font-black text-sm ml-1">{{ filteredClients.length }} / {{ store.clients.length }}</span>
          </div>

          <button @click="openAddClientModal" class="bg-[#58b347] text-white font-extrabold px-5 py-2.5 rounded-xl text-[13px] hover:bg-[#499b3a] shadow-md shadow-[#58b347]/20 transition-all flex items-center gap-2 h-[42px]">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nowy Klient
          </button>
        </template>
      </UniversalSearch>

      <!-- Skeleton Loader -->
      <div v-if="store.isLoading" class="px-8 pt-6 pb-8 flex-1 flex flex-col gap-3 w-full">
        <SkeletonCard v-for="n in 5" :key="n" />
      </div>

      <!-- Lista klientów -->
      <ClientsList 
        v-else
        :clients="filteredClients"
        :allStations="store.stations"
        :expandedIds="store.expandedIds"
        :currentPage="currentPage"
        :itemsPerPage="itemsPerPage"
        :searchQueries="store.searchQueriesMain"
        @toggle="toggleAccordion"
        @load-more="currentPage++"
        @open-analytics="openStationAnalyticsModal"
        @edit-client="openEditClientModal"
        @delete-client="confirmDeleteClient"
        @merge-client="openMergeClientModal"
        @create-offer="handleCreateOfferForClient"
      />

    </div>

    <!-- Modale -->
    <UniversalTabModal 
      :show="showTabModal"
      :isEditing="!!editingTabId"
      :form="modalForm"
      :searchQueries="searchQueriesModal"
      @close="showTabModal = false"
      @save="saveTab"
    />

    <ClientFormModal 
      :show="showClientModal"
      :clientData="selectedClientForEdit"
      @close="showClientModal = false"
      @save="handleSaveClient"
    />

    <ConfirmModal 
      :show="confirmModal.show"
      :message="confirmModal.message"
      @cancel="confirmModal.show = false"
      @confirm="executeConfirm"
    />

    <!-- MODAL SCALANIA DUPLIKATÓW KLIENTÓW -->
    <Teleport to="body">
      <div
        v-if="showMergeModal"
        @click.self="showMergeModal = false"
        class="fixed inset-0 z-[2130] bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
          <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 class="text-xs font-black uppercase tracking-widest">Scalanie duplikatu klienta</h3>
            <button type="button" @click="showMergeModal = false" class="text-slate-400 hover:text-white cursor-pointer">✕</button>
          </div>

          <div class="p-6 space-y-4">
            <div class="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs">
              <div class="text-[10px] font-black uppercase tracking-wider text-rose-600 mb-0.5">
                Scalany duplikat (zostanie usunięty po przepisaniu danych):
              </div>
              <div class="font-black text-sm text-slate-800">{{ mergeSourceClient?.name || '-' }}</div>
              <div class="text-[11px] font-semibold text-slate-500 mt-0.5">
                Przypisane stacje: <span class="font-black text-slate-700">{{ getClientStations(mergeSourceClient || {}, store.stations).length }}</span>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                Wybierz docelową, poprawną firmę *
              </label>
              <input
                v-model="mergeSearchFilter"
                type="text"
                placeholder="Filtruj listę klientów..."
                class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-800 mb-2 focus:outline-none focus:border-[#58b347]"
              />
              <select
                v-model="mergeTargetClientId"
                class="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-extrabold text-slate-800 focus:outline-none focus:border-[#58b347]"
              >
                <option value="">-- Wybierz firmę docelową --</option>
                <option v-for="cand in mergeTargetCandidates" :key="cand.id" :value="cand.id">
                  {{ cand.name }}{{ cand.nip ? ` (NIP: ${cand.nip})` : '' }}
                </option>
              </select>
            </div>

            <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-900 leading-relaxed">
              Wszystkie oferty, zgłoszenia i stacje przypisane do <strong>{{ mergeSourceClient?.name }}</strong> zostaną przepisane na wybraną firmę docelową.
            </div>
          </div>

          <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
            <button type="button" @click="showMergeModal = false" class="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 cursor-pointer">
              Anuluj
            </button>
            <button
              type="button"
              :disabled="!mergeTargetClientId || isMergingClient"
              @click="confirmMergeClient"
              class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {{ isMergingClient ? 'Scalanie...' : 'Scal klientów' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL ANALITYKI WYBRANEJ STACJI -->
    <Teleport to="body">
      <div
        v-if="analyticsStation"
        @click.self="analyticsStation = null"
        class="fixed inset-0 z-[2130] bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
          <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
            <div>
              <h3 class="text-xs font-black uppercase tracking-widest">
                Analityka stacji: <span class="text-[#7ce368] font-mono">{{ analyticsStation.public_id || analyticsStation.name || analyticsStation.id }}</span>
              </h3>
              <div class="text-[11px] text-slate-400 font-semibold mt-0.5">
                {{ analyticsStation.city || '-' }}{{ analyticsStation.street_number || analyticsStation.street ? `, ${analyticsStation.street_number || analyticsStation.street}` : '' }}
              </div>
            </div>
            <button type="button" @click="analyticsStation = null" class="text-slate-400 hover:text-white cursor-pointer">✕</button>
          </div>

          <div class="p-6 overflow-y-auto client-custom-scrollbar space-y-4 text-xs">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div class="text-[9.5px] font-black uppercase text-slate-400">Status stacji</div>
                <div class="font-black text-slate-800 mt-1">{{ analyticsStation.status || 'Aktywna' }}</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div class="text-[9.5px] font-black uppercase text-slate-400">Technik rejonu</div>
                <div class="font-bold text-slate-700 mt-1 truncate">{{ analyticsStation.technician_id || analyticsStation.tech || 'Nieprzypisany' }}</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div class="text-[9.5px] font-black uppercase text-slate-400">Aktywne zgłoszenie</div>
                <div class="font-mono font-black text-rose-600 mt-1">{{ analyticsStation.active_ticket_id || 'Brak' }}</div>
              </div>
              <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div class="text-[9.5px] font-black uppercase text-slate-400">Status zgłoszenia</div>
                <div class="font-bold text-slate-700 mt-1">{{ analyticsStation.ticket_status || '-' }}</div>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1.5">
              <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">Dane techniczne i logistyczne</div>
              <div v-if="analyticsStation.model || analyticsStation.station_model || analyticsStation.product">
                <span class="text-slate-400 font-bold">Model:</span>
                <span class="font-bold text-slate-800 ml-1">{{ analyticsStation.model || analyticsStation.station_model || analyticsStation.product }}</span>
              </div>
              <div v-if="analyticsStation.logistics_info">
                <span class="text-slate-400 font-bold">Logistyka / Dojazd:</span>
                <span class="font-semibold text-slate-700 ml-1">{{ analyticsStation.logistics_info }}</span>
              </div>
              <div v-if="analyticsStation.gps_lat && analyticsStation.gps_lng">
                <span class="text-slate-400 font-bold">Współrzędne GPS:</span>
                <span class="font-mono font-bold text-slate-700 ml-1">{{ analyticsStation.gps_lat }}, {{ analyticsStation.gps_lng }}</span>
              </div>
            </div>
          </div>

          <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button type="button" @click="analyticsStation = null" class="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-wider cursor-pointer">
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 1. IMPORTY LOKALNYCH KOMPONENTÓW UI
import ClientsList from './ClientsList.vue'

// 2. IMPORTY UNIWERSALNYCH KOMPONENTÓW UI
import UniversalKpi from '../../common/UniversalKpi.vue'
import UniversalSearch from '../../common/UniversalSearch.vue'
import UniversalTabModal from '../../common/UniversalTabModal.vue'
import ConfirmModal from '../../common/ConfirmModal.vue'
import SkeletonCard from '../../common/SkeletonCard.vue'
import ClientFormModal from '../../modals/ClientFormModal.vue'

// 3. IMPORTY LOGIKI BIZNESOWEJ
import { useClientsStore } from '../../stores/useClientsStore'
import { useOffersStore } from '../../stores/useOffersStore'
import { useSearchFilters } from '../../composables/useSearchFilters'
import { useSmartKpiFilters } from '../../composables/useSmartKpiFilters'

// Inicjalizacja stanu i logiki
const store = useClientsStore()
const offersStore = useOffersStore()
const { checkClientSearch } = useSearchFilters()

// Stany widoku (UI States)
const activeModule = ref('companies')
const currentPage = ref(1)
const itemsPerPage = 50

// Stan modalu filtrów/zakładek
const showTabModal = ref(false)
const editingTabId = ref(null)
const modalForm = ref({ name: "", color: "#58b347", iconPreviewBase64: "", selectedIconName: "" })
const searchQueriesModal = ref([{ id: 'd_' + Date.now(), logic: 'AND', text: '' }])

// Stan modalu dodawania / edycji klienta
const showClientModal = ref(false)
const selectedClientForEdit = ref(null)

const confirmModal = ref({ show: false, message: "", onConfirm: null })

// ==========================================
// POMOCNIK DO WYSZUKIWANIA STACJI KLIENTA
// ==========================================
const getClientStations = (c, allStations) => {
  const cid = String(c.id || '').trim().toLowerCase()
  const cname = String(c.name || '').trim().toLowerCase()
  return allStations.filter(s => {
    const sid = String(s.client_id || s.clientId || '').trim().toLowerCase()
    return sid === cid || sid === cname
  })
}

// Funkcja testująca czy Klient zalicza dany filtr (odpowiednik evaluateTab)
const evaluateClientTab = (c, tab, stationsList) => {
    if (tab.filter === 'ALL') return true
    if (tab.filter === 'VIP') { let sla = parseInt(c.sla_hours || c.sla) || 48; return sla > 0 && sla < 48 }
    if (tab.filter === 'MISSING_CONTACT') return !c.contact_person || !c.phone || !c.email
    if (tab.filter === 'NO_STATIONS') return getClientStations(c, stationsList).length === 0
    if (tab.filter === 'HAS_STATIONS') return getClientStations(c, stationsList).length > 0
    if (tab.filter === 'ACTIVE_TICKETS') {
      return getClientStations(c, stationsList).some(s => {
        const tStat = s.ticket_status ? String(s.ticket_status).trim().toLowerCase() : ''
        return s.active_ticket_id && !tStat.includes('zakończ') && !tStat.includes('zamknięt') && !tStat.includes('wykonano')
      })
    }
    if (tab.filter === 'CUSTOM' && tab.customQueries) {
      const validSearch = tab.customQueries.filter(q => q.text.trim() !== '')
      if (validSearch.length === 0) return true
      let match = checkClientSearch(c, validSearch[0].text, stationsList)
      if (validSearch[0].logic === 'NOT') match = !match
      for (let i = 1; i < validSearch.length; i++) {
        const cMet = checkClientSearch(c, validSearch[i].text, stationsList)
        if (validSearch[i].logic === 'AND') match = match && cMet
        else if (validSearch[i].logic === 'OR') match = match || cMet
        else if (validSearch[i].logic === 'NOT') match = match && !cMet
      }
      return match
    }
    return true
}

// ==========================================
// UŻYCIE LOGIKI MULTI-SELECT ORAZ ZLICZANIA KPI
// ==========================================

const tabCounts = computed(() => {
  const counts = {}
  const clientsList = store.clients
  const stationsList = store.stations

  if (!store.kpiTabs || !Array.isArray(store.kpiTabs)) return counts
  
  // W systemie klientów szukajka działa na wyniki KPI
  let searchFilteredBase = clientsList
  const validSearch = store.searchQueriesMain.filter(q => q.text.trim() !== '')
  if (validSearch.length > 0) {
    searchFilteredBase = searchFilteredBase.filter(c => {
      let match = checkClientSearch(c, validSearch[0].text, stationsList)
      if (validSearch[0].logic === 'NOT') match = !match
      for (let i = 1; i < validSearch.length; i++) {
        const cMet = checkClientSearch(c, validSearch[i].text, stationsList)
        if (validSearch[i].logic === 'AND') match = match && cMet
        else if (validSearch[i].logic === 'OR') match = match || cMet
        else if (validSearch[i].logic === 'NOT') match = match && !cMet
      }
      return match
    })
  }

  // W bazie klientów (ponieważ nie ma konfliktów miedzy statusami jak 'Nowe' / 'Zamkniete'), 
  // zliczamy czysty wynik każdego filtra.
  store.kpiTabs.forEach(tab => {
    if (!tab || !tab.id) return 
    counts[tab.id] = searchFilteredBase.filter(c => evaluateClientTab(c, tab, stationsList)).length
  })
  
  return counts
})

const filteredClients = computed(() => {
  let base = store.clients
  const activeTabsIds = store.activeTabs || ['ALL']
  
  // Logika Multi-Select (Krzyżowanie warunków "LUB" / "ORAZ")
  if (!activeTabsIds.includes('ALL')) {
      const activeTabObjs = activeTabsIds.map(id => store.kpiTabs.find(t => t.id === id)).filter(Boolean)
      
      base = base.filter(c => {
          // Klienci muszą spełnić WSZYSTKIE zaznaczone warunki krzyżowo (Systemowe)
          return activeTabObjs.every(tab => evaluateClientTab(c, tab, store.stations))
      })
  }

  // Zastosowanie głównej szukajki z inputa
  const validSearch = store.searchQueriesMain.filter(q => q.text.trim() !== '')
  if (validSearch.length > 0) {
    base = base.filter(c => {
      let match = checkClientSearch(c, validSearch[0].text, store.stations)
      if (validSearch[0].logic === 'NOT') match = !match
      for (let i = 1; i < validSearch.length; i++) {
        const cMet = checkClientSearch(c, validSearch[i].text, store.stations)
        if (validSearch[i].logic === 'AND') match = match && cMet
        else if (validSearch[i].logic === 'OR') match = match || cMet
        else if (validSearch[i].logic === 'NOT') match = match && !cMet
      }
      return match
    })
  }

  return [...base]
})

// ==========================================
// OBSŁUGA AKCJI UI
// ==========================================

const openAddClientModal = () => {
  selectedClientForEdit.value = null
  showClientModal.value = true
}

const openEditClientModal = (client) => {
  selectedClientForEdit.value = client
  showClientModal.value = true
}

const handleSaveClient = (clientPayload) => {
  store.saveClientToBase(clientPayload)
  showClientModal.value = false
}

const confirmDeleteClient = (client) => {
  confirmModal.value = {
    show: true,
    message: `Czy na pewno chcesz usunąć klienta ${client.name}? Tej operacji nie można cofnąć.`,
    onConfirm: () => {
      store.deleteClientFromBase(client.id)
    }
  }
}

const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  if (scrollTop + clientHeight >= scrollHeight - 60) {
    if (filteredClients.value.length > currentPage.value * itemsPerPage) currentPage.value++
  }
}

const toggleAccordion = (id) => {
  if (store.expandedIds.includes(id)) {
    store.expandedIds = store.expandedIds.filter(x => x !== id)
  } else {
    store.expandedIds.push(id)
  }
}

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
  if (tab.filter !== 'CUSTOM') return
  editingTabId.value = tab.id
  modalForm.value = { name: tab.name, color: tab.color, iconPreviewBase64: tab.icon, selectedIconName: "" }
  searchQueriesModal.value = tab.customQueries ? JSON.parse(JSON.stringify(tab.customQueries)) : [{ id: 'd_' + Date.now(), logic: 'AND', text: '' }]
  showTabModal.value = true
}

const saveUserConfig = () => {
  store.saveTabsConfiguration()
}

const deleteTab = (id) => {
  confirmModal.value = {
    show: true,
    message: "Usunąć ten filtr (zakładkę)?",
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

const executeConfirm = () => {
  if (confirmModal.value.onConfirm) confirmModal.value.onConfirm()
  confirmModal.value.show = false
}

const saveTab = ({ form, queries }) => {
  const isEdit = !!editingTabId.value
  
  const tabData = {
    id: isEdit ? editingTabId.value : 'CUSTOM_' + Date.now(),
    name: form.name.toUpperCase(),
    filter: 'CUSTOM',
    color: form.color || '#58b347',
    icon: form.iconPreviewBase64,
    customQueries: JSON.parse(JSON.stringify(queries))
  }

  if (isEdit) {
    const idx = store.kpiTabs.findIndex(t => t.id === editingTabId.value)
    if (idx !== -1) store.kpiTabs[idx] = tabData
  } else {
    store.kpiTabs.push(tabData)
    store.activeTabs = [tabData.id]
  }

  showTabModal.value = false
  saveUserConfig()
}

const handleReorderTabs = ({ sourceId, targetId }) => {
  if (sourceId === targetId) return
  
  const tabs = [...store.kpiTabs]
  const srcIdx = tabs.findIndex(t => t.id === sourceId)
  const tgtIdx = tabs.findIndex(t => t.id === targetId)
  
  if (srcIdx === -1 || tgtIdx === -1) return
  
  const [movedTab] = tabs.splice(srcIdx, 1)
  tabs.splice(tgtIdx, 0, movedTab)
  
  store.kpiTabs = tabs
  saveUserConfig()
}

const analyticsStation = ref(null)

const openStationAnalyticsModal = (stOrName) => {
  if (stOrName && typeof stOrName === 'object') {
    analyticsStation.value = stOrName
    return
  }
  const q = String(stOrName || '').trim().toLowerCase()
  const found = (store.stations || []).find(s =>
    String(s.public_id || s.name || s.id || '').toLowerCase().includes(q)
  )
  analyticsStation.value = found || { public_id: String(stOrName || 'Stacja'), status: 'Aktywna' }
}

const handleCreateOfferForClient = (client) => {
  if (!client) return
  offersStore.openNewOfferFromTicket({
    clientName: client.name || '',
    clientNip: client.nip || '',
    clientAddress: client.address || '',
    clientContact: [client.contact_person, client.email, client.phone].filter(Boolean).join(' • ')
  })
  const offersNavBtn = document.querySelector('[data-nav="offers"], a[href*="offers"], button[data-module="offers"]')
  if (offersNavBtn) offersNavBtn.click()
  else window.location.hash = '#/offers'
}

const showMergeModal = ref(false)
const mergeSourceClient = ref(null)
const mergeSearchFilter = ref('')
const mergeTargetClientId = ref('')
const isMergingClient = ref(false)

const openMergeClientModal = (client) => {
  mergeSourceClient.value = client
  mergeSearchFilter.value = ''
  mergeTargetClientId.value = ''
  showMergeModal.value = true
}

const mergeTargetCandidates = computed(() => {
  const srcId = String(mergeSourceClient.value?.id || '')
  const srcNameLow = String(mergeSourceClient.value?.name || '').trim().toLowerCase()
  const q = mergeSearchFilter.value.toLowerCase().trim()

  return (store.clients || []).filter(c => {
    const isSame = String(c.id || '') === srcId || String(c.name || '').trim().toLowerCase() === srcNameLow
    if (isSame) return false
    if (!q) return true
    return `${c.name || ''} ${c.nip || ''} ${c.address || ''}`.toLowerCase().includes(q)
  })
})

const confirmMergeClient = async () => {
  if (!mergeSourceClient.value || !mergeTargetClientId.value) return
  const target = (store.clients || []).find(c => String(c.id) === String(mergeTargetClientId.value))
  if (!target) return

  isMergingClient.value = true
  try {
    const res = await store.mergeClients(mergeSourceClient.value, target)
    if (res && res.success) {
      showMergeModal.value = false
      mergeSourceClient.value = null
    } else {
      alert(res?.error || 'Nie udało się scalić klientów.')
    }
  } finally {
    isMergingClient.value = false
  }
}

onMounted(() => {
  store.fetchClientsData()
})
</script>