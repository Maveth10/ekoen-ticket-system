<template>
  <div class="flex flex-col h-full bg-[#f4f6f8] relative z-10 overflow-y-auto custom-scrollbar" @click="closeAllDropdowns">
    
    <!-- GÓRNA SEKCJA: KPI i WYSZUKIWARKA -->
    <div class="shrink-0">
      <UniversalKpi 
        title="Magazyn i Flota"
        subtitle="Logistyka zasobów centralnych, mobilnych i zużyć."
        :views="[
          { label: 'Magazyn Centralny', value: 'zg_central' },
          { label: 'W Terenie', value: 'mobile' },
          { label: 'Historia Operacji', value: 'logs' }
        ]"
        :activeView="store.activeModule"
        :activeTabs="store.activeTabs"
        :tabs="visibleKpiTabs"
        :tabCounts="tabCounts"
        @switch-view="switchModule"
        @select-tab="setActiveTab"
        @edit-tab="editTab"
        @delete-tab="confirmDeleteTab"
        @open-modal="openNewTabModal"
        @reorder-tabs="handleReorderTabs"
        @save-settings="saveUserConfig"
      >
        <template #custom-tab-content="{ tab }">
          <div v-if="tab.id === 'LOW_STOCK'" class="overflow-hidden pr-2 flex-1 flex flex-col justify-center pointer-events-auto">
            <div class="flex items-center gap-1 mb-1 w-full overflow-hidden">
              <p class="text-[10px] font-black uppercase tracking-widest pointer-events-none truncate shrink-0" :class="tabCounts[tab.id] > 0 ? 'text-red-400' : 'text-slate-400'">Niski Stan (≤</p>
              <input type="number" min="0" max="99" v-model.number="store.lowStockThreshold" @click.stop @change="saveUserConfig" class="w-6 text-center font-black text-xs text-red-600 bg-transparent border-b border-red-200 hover:border-red-400 py-0 focus:outline-none shadow-none shrink-0 appearance-none m-0 transition-colors" title="Zmień limit" />
              <p class="text-[10px] font-black uppercase tracking-widest pointer-events-none shrink-0" :class="tabCounts[tab.id] > 0 ? 'text-red-400' : 'text-slate-400'">)</p>
            </div>
            <p class="text-3xl font-black pointer-events-none" :class="tabCounts[tab.id] > 0 ? 'text-red-600 animate-pulse' : 'text-slate-800'">{{ tabCounts[tab.id] }}</p>
          </div>
        </template>
      </UniversalKpi>

      <UniversalSearch 
        :queries="store.searchQueriesMain"
        placeholder="Szukaj części po nazwie, kodzie lub kategorii..."
        @add-row="store.searchQueriesMain.push({ id: 'sq_' + Date.now(), logic: 'AND', text: '' })"
        @remove-row="(id) => store.searchQueriesMain = store.searchQueriesMain.filter(q => q.id !== id)"
      >
        <template #actions>
          <div class="bg-slate-50 border border-slate-200/80 rounded-xl px-4 text-[11px] font-black tracking-wider uppercase text-slate-500 shadow-sm flex items-center gap-2 h-[42px] mr-2">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            WIDOCZNYCH: <span class="text-[#58b347] font-black text-sm ml-1">{{ visibleCount }} / {{ store.activeModule === 'logs' ? store.logs.length : store.parts.length }}</span>
          </div>

          <button v-if="store.activeModule !== 'logs'" @click.stop="openAddPartModal(null)" class="bg-[#58b347] text-white font-extrabold px-5 py-2.5 rounded-xl text-[13px] hover:bg-[#499b3a] shadow-md shadow-[#58b347]/20 transition-all flex items-center gap-2 h-[42px]">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Nowa Część
          </button>
        </template>
      </UniversalSearch>
    </div>

    <!-- DOLNA SEKCJA -->
    <div class="px-8 pt-6 pb-8 w-full flex items-stretch gap-6 relative">
      
      <!-- SZKIELET ŁADOWANIA (Tylko przy absolutnie pustej bazie na start) -->
      <div v-if="store.isLoading && store.parts.length === 0" class="w-full flex gap-6">
        <div class="flex-1 flex flex-col gap-3">
          <div class="w-full bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-pulse flex flex-col gap-4" v-for="n in 5" :key="n">
             <div class="h-10 bg-slate-200 rounded-xl w-full"></div>
          </div>
        </div>
        <div class="w-[360px] xl:w-[420px] shrink-0 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-pulse"></div>
      </div>

      <!-- WŁAŚCIWY INTERFEJS PO ZAŁADOWANIU DANYCH -->
      <template v-else>
        <!-- LEWA KOLUMNA (TABELA CENTRALNA/MOBILNA) -->
        <StorageList 
          v-if="store.activeModule !== 'logs'"
          class="flex-1 min-w-0"
          :groupedParts="groupedParts" 
          :filteredLogs="filteredLogs"
          @toggle-category="toggleCategory"
          @lock-part="lockPart"
          @hover-part="hoverPart"
          @open-movement="openMovementModal"
        />

        <!-- WIDOK: HISTORIA ZMIAN (LOGI) -->
        <div v-if="store.activeModule === 'logs'" class="w-full bg-white/95 backdrop-blur-sm border border-white/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-max overflow-hidden flex-1">
          <div class="p-5 border-b border-slate-100/60 flex justify-between items-center bg-white shrink-0 sticky top-0 z-20">
            <h2 class="font-bold text-sm text-slate-800 uppercase tracking-widest">Rejestr Operacji Magazynowych</h2>
          </div>
          <div class="flex-1 overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest sticky top-0 z-10">
                <tr>
                  <th class="px-6 py-4 w-1/6">Data operacji</th>
                  <th class="px-6 py-4 w-1/6">Typ</th>
                  <th class="px-6 py-4 w-1/3">Asortyment (SKU)</th>
                  <th class="px-6 py-4 w-1/12 text-center">Ilość</th>
                  <th class="px-6 py-4 w-1/6">Lokalizacja / Technik</th>
                  <th class="px-6 py-4 w-1/4">Szczegóły / Zlecenie</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100/60 text-xs">
                <tr v-for="log in store.logs" :key="log.id" class="hover:bg-slate-50/80 transition-colors">
                  
                  <td class="px-6 py-4 text-[11px] font-bold text-slate-400 font-mono whitespace-nowrap uppercase tracking-wider">
                    {{ log.date ? new Date(log.date).toLocaleString('pl-PL') : 'Brak daty' }}
                  </td>
                  
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-[9px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-widest"
                          :class="{
                            'border-[#58b347]/50 text-[#499b3a] bg-[#58b347]/10': log.operation_type === 'DOSTAWA',
                            'border-blue-300 text-blue-600 bg-blue-50': log.operation_type === 'PRZESUNIĘCIE',
                            'border-orange-300 text-orange-600 bg-orange-50': log.operation_type === 'ZUŻYCIE',
                            'border-slate-300 text-slate-600 bg-slate-100': !['DOSTAWA', 'PRZESUNIĘCIE', 'ZUŻYCIE'].includes(log.operation_type)
                          }">
                      {{ log.operation_type }}
                    </span>
                  </td>
                  
                  <td class="px-6 py-4">
                    <div class="text-slate-800 font-bold text-sm leading-tight">{{ getPartName(log.part_sku) }}</div>
                    <div class="text-[10px] font-bold text-slate-400 font-mono mt-1 uppercase tracking-wider">{{ log.part_sku }}</div>
                  </td>
                  
                  <td class="px-6 py-4 font-bold text-slate-800 text-center text-sm tabular-nums">
                    {{ log.quantity }} <span class="font-bold text-[9px] text-slate-400 uppercase">{{ getPartUnit(log.part_sku) }}</span>
                  </td>
                  
                  <td class="px-6 py-4 text-xs font-bold text-slate-700">
                    {{ formatLocation(log.technician_id) }}
                  </td>

                  <td class="px-6 py-4 text-xs">
                    <div v-if="log.ticket_id" class="text-[10px] font-bold font-mono text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded w-max mb-1">
                      {{ log.ticket_id }}
                    </div>
                    <div class="text-slate-500 font-medium leading-relaxed max-w-xs">{{ log.notes }}</div>
                  </td>

                </tr>
                <tr v-if="store.logs.length === 0">
                  <td colspan="6" class="text-center p-12 text-slate-400 font-bold">Brak zapisanych operacji w logach.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- PRAWY PANEL (Szczegóły - Widoczny tylko poza logami) -->
        <div v-show="store.activeModule !== 'logs'" class="w-[360px] xl:w-[420px] shrink-0 relative">
          <div class="sticky top-6 flex flex-col bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden transition-all" style="height: calc(100vh - 120px);">  

            <template v-if="!activePartDetails">
                <div class="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400 bg-slate-50/50">
                  <div class="w-16 h-16 bg-white border border-[#58b347]/20 rounded-2xl shadow-sm flex items-center justify-center text-[#58b347] mb-4">
                    <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </div>
                  <p class="text-sm font-bold text-slate-600">Szczegóły elementu</p>
                  <p class="mt-2 text-xs font-medium max-w-[200px] leading-relaxed">Najedź kursorem na część na liście, aby zobaczyć stany na oddziałach i w autach. Kliknij wiersz, aby go zablokować.</p>
                </div>
            </template>
              
            <template v-else>
                <div class="flex flex-col h-full bg-white relative">
                  <div class="p-8 border-b border-slate-100 bg-slate-50/50 shrink-0 flex flex-col justify-center items-center text-center">
                    <div class="absolute top-4 right-4 flex items-center gap-2">
                      <button @click="openAddPartModal(activePartDetails)" class="text-slate-400 hover:text-[#58b347] bg-white border border-slate-200 p-2 rounded-xl shadow-sm transition-colors" title="Edytuj Część">
                         <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                      </button>
                    </div>
                    <div class="w-12 h-12 bg-white rounded-xl border border-[#58b347]/20 shadow-sm flex items-center justify-center text-[#58b347] mb-4">
                      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                    </div>
                    <div class="text-[9px] font-extrabold text-[#58b347] uppercase tracking-widest mb-2">{{ activePartDetails.category || 'Inne' }}</div>
                    <h2 class="text-[15px] font-black text-slate-900 leading-snug px-4">{{ activePartDetails.name }}</h2>
                    <div class="text-[10px] font-bold font-mono text-slate-500 bg-white border border-slate-200 px-4 py-1.5 rounded-full uppercase tracking-wider mt-4 shadow-sm">{{ activePartDetails.id_sku || activePartDetails.sku }}</div>
                  </div>

                  <div class="p-6 border-b border-slate-100 shrink-0 bg-white grid grid-cols-2 gap-2 text-center">
                    <div class="border border-slate-200 rounded-xl p-2 bg-slate-50">
                      <p class="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Magazyn Centralny</p>
                      <p class="text-lg font-black text-slate-800">{{ parseInt(activePartDetails.zg_stock) || 0 }}</p>
                    </div>
                    <div class="border border-red-200 rounded-xl p-2 bg-red-50">
                      <p class="text-[9px] font-extrabold text-red-400 uppercase tracking-widest mb-1">Zużyte łącznie</p>
                      <p class="text-lg font-black text-red-600">{{ parseInt(activePartDetails.used_stock) > 0 ? parseInt(activePartDetails.used_stock) : '-' }}</p>
                    </div>
                  </div>

                  <div class="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
                    <div class="px-6 py-4 bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase border-b border-slate-100 tracking-widest sticky top-0 z-10 shadow-sm">Zapas w autach ({{ totalMobileStock }} szt.):</div>
                    <div class="flex flex-col">
                      <div v-if="mobileBreakdown.length === 0" class="p-8 text-center text-xs font-bold text-slate-400">Brak wyposażenia u techników.</div>
                      <div v-else v-for="mob in mobileBreakdown" :key="mob.techId" class="flex items-start justify-between px-6 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-none">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-[12px] text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0" :style="`background-color: ${mob.color}`">{{ getInitials(mob.techName) }}</div>
                          <div class="flex flex-col text-[11px] font-black text-slate-800 uppercase tracking-widest leading-tight">
                            <span>{{ mob.firstName }}</span>
                            <span>{{ mob.lastName }}</span>
                          </div>
                        </div>
                        <div class="flex flex-col items-end gap-2">
                          <div class="text-[12px] font-black text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-sm">
                            {{ mob.qty }} <span class="text-[9px] uppercase text-slate-400 font-bold">{{ activePartDetails.unit || 'szt.' }}</span>
                          </div>
                          <!-- ZMIANA PRZYCISKÓW W PRAWYM PANELU -->
                          <div class="flex gap-1.5 mt-1">
                             <button @click.stop="openMovementModal((activePartDetails.id_sku || activePartDetails.sku), 'PRZESUNIĘCIE', mob.techId, 'ZG')" class="text-[9px] font-extrabold border border-[#58b347]/30 bg-white text-[#499b3a] px-2.5 py-1.5 rounded-lg hover:bg-[#58b347]/10 shadow-sm uppercase tracking-widest flex items-center gap-1 transition-colors">
                                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M17 3v18"/><path d="m21 7-4-4-4 4"/><path d="M7 21V3"/><path d="m3 17 4 4 4-4"/></svg> ZWRÓĆ
                             </button>
                             <button @click.stop="openMovementModal((activePartDetails.id_sku || activePartDetails.sku), 'ZUŻYCIE', mob.techId, null)" class="text-[9px] font-extrabold border border-[#58b347]/30 bg-white text-[#499b3a] px-2.5 py-1.5 rounded-lg hover:bg-[#58b347]/10 shadow-sm uppercase tracking-widest flex items-center gap-1 transition-colors">
                                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> ZUŻYCIE
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </template>
          </div>
        </div>
      </template>

    </div>

    <!-- POWIADOMIENIE TOAST -->
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

    <!-- MODAL TWORZENIA / EDYCJI (ASORTYMENT/FLOTA) -->
    <StorageFormModal 
      :show="showAddPartModal"
      :isEditing="!!partToEditData"
      :initialData="partToEditData"
      @close="closeAddPartModal"
      @save="handleSavePart"
    />

    <!-- MODAL RUCHÓW MAGAZYNOWYCH -->
    <StorageMovementModal 
      :show="showMovementModal"
      :initialPartSku="movementInitialSku"
      :initialType="movementInitialType"
      :initialSource="movementInitialSource"
      :initialDest="movementInitialDest"
      :openTickets="store.openTickets || []"
      @close="showMovementModal = false"
      @save="handleSaveMovement"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStorageStore } from '../../stores/useStorageStore'
import { useSearchFilters } from '../../composables/useSearchFilters'
import { useSmartKpiFilters } from '../../composables/useSmartKpiFilters'

import UniversalKpi from '../../common/UniversalKpi.vue'
import UniversalSearch from '../../common/UniversalSearch.vue'
import StorageList from './StorageList.vue'
import UniversalTabModal from '../../common/UniversalTabModal.vue'
import ConfirmModal from '../../common/ConfirmModal.vue'
import StorageMovementModal from '../../modals/StorageMovementModal.vue'
import StorageFormModal from '../../modals/StorageFormModal.vue'

const store = useStorageStore()

const toast = ref({ show: false, msg: '' })
const showTabModal = ref(false)
const editingTabId = ref(null)
const modalForm = ref({ name: "", color: "#58b347", iconPreviewBase64: "", selectedIconName: "" })
const searchQueriesModal = ref([{ id: 'd_' + Date.now(), logic: 'AND', text: '' }])
const confirmModal = ref({ show: false, message: "", onConfirm: null })

// --- ZARZĄDZANIE MODALAMI ---
const showAddPartModal = ref(false)
const partToEditData = ref(null)

const showMovementModal = ref(false)
const movementInitialSku = ref('')

const openAddPartModal = (part = null) => {
  partToEditData.value = part ? JSON.parse(JSON.stringify(part)) : null
  showAddPartModal.value = true
}

const closeAddPartModal = () => {
  showAddPartModal.value = false
  partToEditData.value = null
}

// --- ZARZĄDZANIE MODALEM RUCHÓW MAGAZYNOWYCH ---
const movementInitialType = ref('PRZESUNIĘCIE')
const movementInitialSource = ref('')
const movementInitialDest = ref('')

const openMovementModal = (sku = '', defaultType = 'PRZESUNIĘCIE', from = '', to = '') => {
  movementInitialSku.value = sku;
  movementInitialType.value = defaultType;
  movementInitialSource.value = from;
  movementInitialDest.value = to;
  showMovementModal.value = true;
}

// --- POMOCNICZE FUNKCJE DLA WIDOKU HISTORII (LOGÓW) ---
const getPartName = (sku) => {
  if (!sku) return 'Nieznany asortyment';
  const part = store.parts.find(p => (p.id_sku || p.sku) === sku);
  return part ? part.name : 'Usunięta część (brak w katalogu)';
}

const getPartUnit = (sku) => {
  const part = store.parts.find(p => (p.id_sku || p.sku) === sku);
  return part && part.unit ? part.unit : 'szt.';
}

const formatLocation = (locId) => {
  if (!locId) return 'Nieznana lokalizacja';
  if (locId === 'ZG') return 'Magazyn Centralny (ZG)';
  if (locId === 'WA') return 'Filia (Warszawa)';
  
  if (locId.includes('->')) {
    const parts = locId.split('->').map(s => s.trim());
    const from = formatLocation(parts[0]);
    const to = formatLocation(parts[1]);
    return `${from} ➔ ${to}`;
  }

  const tech = store.techs.find(t => t.id === locId);
  return tech ? `Auto: ${tech.name}` : locId;
}

// --- FUNKCJE ZAPISU DO BACKENDU ---
const handleSavePart = (payload) => {
  store.isLoading = true 
  google.script.run
    .withSuccessHandler((res) => {
      closeAddPartModal()
      toast.value = { show: true, msg: 'Asortyment zapisany pomyślnie!' }
      setTimeout(() => { toast.value.show = false }, 3000)
      loadAllStorageData(true)
    })
    .withFailureHandler((err) => {
      store.isLoading = false
      alert('Błąd podczas zapisywania: ' + err)
    })
    .savePartToBase(payload)
}

const handleSaveMovement = (payload) => {
  store.isLoading = true
  google.script.run
    .withSuccessHandler(() => {
      showMovementModal.value = false
      toast.value = { show: true, msg: 'Operacja zapisana i przeliczona pomyślnie!' }
      setTimeout(() => { toast.value.show = false }, 3000)
      loadAllStorageData(true)
    })
    .withFailureHandler((err) => {
      store.isLoading = false
      alert('Błąd operacji: ' + err.message)
    })
    .saveStorageOperation(payload)
}

const checkStorageSearch = (item, queryText) => {
  const q = String(queryText).toLowerCase().trim()
  if (!q) return true
  const superString = [
      item.name, item.id_sku, item.sku, item.category, item.serial_number, item.operation_type, item.source, item.technician_id, item.destination
  ].filter(Boolean).join(' | ').toLowerCase()
  return superString.includes(q)
}

store.getBaseList = () => store.activeModule === 'logs' ? store.logs : store.parts
store.duplicateIds = []
const { evaluateQueries } = useSmartKpiFilters(store, checkStorageSearch)

// --- DYNAMICZNIE WIDOCZNE ZAKŁADKI (Ukrywanie Niski Stan w Logach) ---
const visibleKpiTabs = computed(() => {
  if (!store.kpiTabs) return [];
  if (store.activeModule === 'logs') {
    return store.kpiTabs.filter(t => t.id !== 'LOW_STOCK');
  }
  return store.kpiTabs;
})

const evaluateStorageTab = (item, tab) => {
  if (tab.filter === 'ALL') return true
  
  if (tab.filter === 'LOW_STOCK') {
    const threshold = store.lowStockThreshold !== undefined ? Number(store.lowStockThreshold) : 3;
    
    // Jeśli jesteśmy w widoku terenowym, sprawdzamy zsumowany zapas w autach
    if (store.activeModule === 'mobile') {
      const techNames = store.techs.map(t => t.name);
      const totalInField = techNames.reduce((sum, tn) => sum + (parseInt(item[tn]) || 0), 0);
      // Musi być > 0 (żeby nie alarmowało o częściach, których w terenie w ogóle nie ma) i <= limit
      return totalInField > 0 && totalInField <= threshold;
    } else {
      // W widoku Centralnym sprawdzamy tylko ZG
      return (parseInt(item.zg_stock) || 0) <= threshold;
    }
  }
  
  if (tab.filter === 'CUSTOM' && tab.customQueries) {
    const validSearch = tab.customQueries.filter(q => q.text.trim() !== '')
    if (validSearch.length === 0) return true
    
    let match = checkStorageSearch(item, validSearch[0].text)
    if (validSearch[0].logic === 'NOT') match = !match
    for (let i = 1; i < validSearch.length; i++) {
      const cMet = checkStorageSearch(item, validSearch[i].text)
      if (validSearch[i].logic === 'AND') match = match && cMet
      else if (validSearch[i].logic === 'OR') match = match || cMet
      else if (validSearch[i].logic === 'NOT') match = match && !cMet
    }
    return match
  }
  return true
}

const tabCounts = computed(() => {
  const counts = {}
  if (!store.kpiTabs) return counts
  
  const baseData = store.activeModule === 'logs' ? store.logs : store.parts
  
  let searchFilteredBase = baseData
  const validSearch = store.searchQueriesMain.filter(q => q.text.trim() !== '')
  
  if (validSearch.length > 0) {
    searchFilteredBase = searchFilteredBase.filter(item => evaluateQueries(item, store.searchQueriesMain))
  }

  store.kpiTabs.forEach(tab => {
    // SPECJALNA LOGIKA DLA "NISKI STAN" ZALEŻNA OD WIDOKU
    if (tab.id === 'LOW_STOCK') {
      if (store.activeModule === 'logs') return; // Nie liczymy w ogóle dla logów
      
      const threshold = store.lowStockThreshold !== undefined ? Number(store.lowStockThreshold) : 3;
      let partsToCount = store.parts;
      
      if (validSearch.length > 0 && store.activeModule !== 'logs') {
        partsToCount = partsToCount.filter(item => evaluateQueries(item, store.searchQueriesMain));
      }
      
      if (store.activeModule === 'mobile') {
        const techNames = store.techs.map(t => t.name);
        counts[tab.id] = partsToCount.filter(p => {
          const sum = techNames.reduce((acc, tn) => acc + (parseInt(p[tn]) || 0), 0);
          return sum > 0 && sum <= threshold;
        }).length;
      } else {
        counts[tab.id] = partsToCount.filter(p => (parseInt(p.zg_stock) || 0) <= threshold).length;
      }
      return;
    }

    // LOGIKA DLA POZOSTAŁYCH FILTRÓW (np. ALL)
    const activeTabsIds = store.activeTabs || ['ALL']
    const activeTabObjs = activeTabsIds.filter(id => id !== 'ALL' && id !== 'LOW_STOCK').map(id => store.kpiTabs.find(t => t.id === id)).filter(Boolean)
    
    let simulatedGroup = [...activeTabObjs, tab]
    simulatedGroup = simulatedGroup.filter((value, index, self) => index === self.findIndex((t) => t.id === value.id))

    const filtered = searchFilteredBase.filter(item => {
      return simulatedGroup.every(t => evaluateStorageTab(item, t))
    })

    if (store.activeModule === 'mobile') {
      const techNames = store.techs.map(t => t.name)
      const itemsInField = filtered.filter(p => techNames.some(tn => (parseInt(p[tn]) || 0) > 0))
      counts[tab.id] = itemsInField.length
    } else {
      counts[tab.id] = filtered.length
    }
  })
  
  return counts
})

const getBaseFilteredItems = (isLogs = false) => {
  let base = isLogs ? store.logs : store.parts
  const activeTabsIds = store.activeTabs || ['ALL']
  
  if (!activeTabsIds.includes('ALL')) {
      const activeTabObjs = activeTabsIds.map(id => store.kpiTabs.find(t => t.id === id)).filter(Boolean)
      
      base = base.filter(item => {
          return activeTabObjs.every(tab => evaluateStorageTab(item, tab))
      })
  }

  const validSearch = store.searchQueriesMain.filter(q => q.text.trim() !== '')
  if (validSearch.length > 0) {
    base = base.filter(item => evaluateQueries(item, store.searchQueriesMain))
  }

  return base
}

const filteredParts = computed(() => {
  if (store.activeModule === 'logs') return []
  return getBaseFilteredItems(false)
})

const filteredLogs = computed(() => {
  if (store.activeModule !== 'logs') return []
  return getBaseFilteredItems(true)
})

const visibleCount = computed(() => {
  if (store.activeModule === 'logs') return filteredLogs.value.length
  if (store.activeModule === 'mobile') {
     let techNames = store.techs.map(t => t.name)
     return filteredParts.value.reduce((sum, p) => sum + techNames.reduce((tSum, tn) => tSum + (parseInt(p[tn]) || 0), 0), 0)
  }
  return filteredParts.value.length
})

const groupedParts = computed(() => {
  if (store.activeModule === 'logs') return []
  const isCatalog = store.activeModule === 'zg_central'

  let groups = []

  if (isCatalog) {
    const categoriesRaw = [...new Set(filteredParts.value.map(p => {
      return p.category && p.category.trim() !== '' ? p.category.trim() : 'Inne'
    }))].sort()

    categoriesRaw.forEach(cat => {
      const itemsInCat = filteredParts.value.filter(p => {
        const pCat = p.category && p.category.trim() !== '' ? p.category.trim() : 'Inne';
        return pCat === cat;
      });
      groups.push({ id: cat, name: cat, items: itemsInCat, color: null })
    })
  } else {
    let allMobileItemsMap = new Map()
    store.techs.forEach(tech => {
      let techItems = filteredParts.value.filter(p => (parseInt(p[tech.name]) || 0) > 0)
      techItems.forEach(p => {
        if (!allMobileItemsMap.has(p.id)) {
          allMobileItemsMap.set(p.id, { ...p, stockOverride: parseInt(p[tech.name]) || 0 })
        } else {
          let existing = allMobileItemsMap.get(p.id)
          existing.stockOverride += parseInt(p[tech.name]) || 0
        }
      })
    })
    
    let allMobileItems = Array.from(allMobileItemsMap.values())
    groups.push({ 
      id: 'WIDOK OGÓLNY (WSZYSTKIE CZĘŚCI)', 
      name: 'Wszystkie Części W Terenie', 
      items: allMobileItems, 
      color: null 
    })

    store.techs.forEach(tech => {
      let items = filteredParts.value.filter(p => (parseInt(p[tech.name]) || 0) > 0).map(p => ({ ...p, stockOverride: parseInt(p[tech.name]) || 0 }))
      
      groups.push({ 
        id: tech.id, 
        name: tech.name, 
        color: tech.zone_color || tech.color || '#94a3b8', 
        items: items,
        isTechGroup: true 
      })
    })
  }

  return groups.filter(g => g.items.length > 0 || g.isTechGroup)
})

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const toggleCategory = (id) => {
  let targetArr = store.activeModule === 'zg_central' ? store.expandedCategoriesZG : store.expandedCategoriesMobile
  if (targetArr) {
    if (targetArr.includes(id)) {
      targetArr.splice(targetArr.indexOf(id), 1)
    } else {
      targetArr.push(id)
    }
    localStorage.setItem(`EKOEN_EXPANDED_${store.activeModule}`, JSON.stringify(targetArr))
  }
}

const hoverPart = (id) => {
  if (!store.lockedPartId) store.hoveredPartId = id
}
const lockPart = (id) => {
  if (store.lockedPartId === id) store.lockedPartId = null
  else store.lockedPartId = id
}

const activePartDetails = computed(() => {
  const targetId = store.lockedPartId || store.hoveredPartId
  if (!targetId) return null
  return store.parts.find(x => String(x.id_sku) === String(targetId) || String(x.id) === String(targetId) || String(x.sku) === String(targetId))
})

const mobileBreakdown = computed(() => {
  if (!activePartDetails.value) return []
  let breakdown = []
  store.techs.forEach(tech => {
    const qty = parseInt(activePartDetails.value[tech.name]) || 0
    if (qty > 0) {
      const nameParts = tech.name.trim().split(/\s+/)
      breakdown.push({
        techId: tech.id,
        techName: tech.name,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        color: tech.zone_color || tech.color || '#58b347',
        qty: qty
      })
    }
  })
  return breakdown
})

const totalMobileStock = computed(() => mobileBreakdown.value.reduce((sum, item) => sum + item.qty, 0))

const switchModule = (mod) => {
  store.activeModule = mod
  store.activeTabs = ['ALL']
  store.hoveredPartId = null
  store.lockedPartId = null
  loadAllStorageData(true)
}

const closeAllDropdowns = () => {}

const setActiveTab = (filterId) => {
  let current = Array.isArray(store.activeTabs) ? [...store.activeTabs] : ['ALL']

  if (filterId === 'ALL') {
    current = ['ALL']
  } else {
    current = current.filter(id => id !== 'ALL')

    const index = current.indexOf(filterId)
    if (index !== -1) {
      current.splice(index, 1)
      if (current.length === 0) {
        current = ['ALL']
      }
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
  if (tab.filter === 'ALL' || tab.filter === 'LOW_STOCK') return
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

let refreshInterval = null;

const loadAllStorageData = (silent = false) => {
  if (!silent) store.isLoading = true;

  google.script.run
    .withSuccessHandler((response) => {
      try {
        const res = typeof response === 'string' ? JSON.parse(response) : response;
        if (res && res.success) {
          store.parts = res.parts || [];
          store.techs = res.techs || [];
          store.logs = res.logs || [];
          store.openTickets = res.open_tickets || [];
        }
      } catch(e) {
        console.warn("Błąd parsowania bazy magazynu:", e);
      } finally {
        store.isLoading = false;
      }
    })
    .withFailureHandler((err) => {
      store.isLoading = false;
      console.error("Błąd pobierania danych magazynu:", err);
    })
    .getStorageData();
};

const performSilentRefresh = () => {
  // Blokada podczas otwartego formularza
  if (showAddPartModal.value || showMovementModal.value || showTabModal.value || confirmModal.value.show) {
    return;
  }
  loadAllStorageData(true);
};

onMounted(() => {
  // 1. Twarda gwarancja inicjalizacji zakładek KPI
  if (!store.kpiTabs || store.kpiTabs.length === 0) {
    store.kpiTabs = [
      { 
        id: 'ALL', 
        name: 'Katalog Magazynu', 
        filter: 'ALL', 
        color: '#58b347', 
        icon: `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>` 
      },
      { 
        id: 'LOW_STOCK', 
        name: 'Niski Stan', 
        filter: 'LOW_STOCK', 
        color: '#ef4444', 
        icon: `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.29 3.86-1.82 3.16L3.6 8.53a1.97 1.97 0 0 0-1 3.07l3.6 4.14-.94 4.88a1.97 1.97 0 0 0 2.8 2.03L12 20.6l3.94 2.05a1.97 1.97 0 0 0 2.8-2.03l-.94-4.88 3.6-4.14a1.97 1.97 0 0 0-1-3.07l-4.87-1.51-1.82-3.16a1.97 1.97 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` 
      }
    ];
  } else {
    // Aktualizacja ikony dla istniejącego filtra ALL
    const allTab = store.kpiTabs.find(t => t.id === 'ALL');
    if (allTab && !allTab.icon) {
      allTab.icon = `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`;
    }
  }

  // 2. Gwarancja zaznaczenia głównego filtra na starcie
  if (!store.activeTabs || store.activeTabs.length === 0) {
    store.activeTabs = ['ALL'];
  }

  // Natychmiastowe pobranie kompletu danych (w tym zleceń)
  loadAllStorageData(false);

  // Cichy interwał w tle
  refreshInterval = setInterval(() => {
    performSilentRefresh();
  }, 60000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.8); }
</style>