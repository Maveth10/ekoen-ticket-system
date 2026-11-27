<template>
  <div class="flex flex-col h-full bg-[#f4f6f8] relative z-10 overflow-y-auto text-slate-800" @click="handleGlobalClick" @dragover.prevent @drop="onGlobalDrop">

    <UniversalKpi 
      title="Harmonogram Serwisowy"
      subtitle="Zarządzanie widokiem, filtrami oraz przypisywanie zgłoszeń do techników."
      :views="[
        { label: 'Miesiąc', value: 'month' },
        { label: 'Tydzień', value: 'week' },
        { label: 'Dzień', value: 'day' }
      ]"
      :activeView="store.currentView"
      @switch-view="v => { store.currentView = v; focusToday() }"
      :activeTabs="store.activeTabs"
      :tabs="store.kpiTabs"
      :tabCounts="tabCounts"
      @select-tab="setActiveTab"
      @open-modal="openNewTabModal"
      @edit-tab="editTab"
      @delete-tab="confirmDeleteTab"
      @reorder-tabs="handleReorderTabs"
      @save-settings="store.saveTabsConfiguration()"
    />

    <div
      ref="searchContainerRef"
      class="relative z-[90]"
      @focusin="isSearchDropdownDismissed = false"
      @click="onSearchContainerClick"
    >
      <UniversalSearch 
        :queries="store.searchQueriesMain"
        placeholder="Szukaj w backlogu i wizytach (np. QP-20536, WROCŁAW, nazwa firmy)..."
        @add-row="store.searchQueriesMain.push({ id: 'm_' + Date.now(), logic: 'AND', text: '' })"
        @remove-row="(id) => store.searchQueriesMain = store.searchQueriesMain.filter(q => q.id !== id)"
      >
        <template #actions>
          <div class="flex items-center gap-2">
            
            <!-- DROPDOWN TECHNIKA -->
            <div ref="techDropdownRef" class="relative w-[240px] shrink-0" @click.self="isTechDropdownOpen = false">
              <button @click.stop="isTechDropdownOpen = !isTechDropdownOpen" class="w-full bg-white border border-slate-200 text-slate-700 font-extrabold px-5 py-2.5 rounded-xl text-[12px] hover:border-[#58b347] transition-all flex items-center justify-between gap-2 h-[42px] shadow-sm">
                <div class="flex items-center gap-2 truncate">
                  <span class="w-2 h-2 rounded-full shrink-0" :style="`background-color: ${currentTechColor};`"></span>
                  <span class="truncate uppercase tracking-widest text-[11px]">{{ currentTechName }}</span>
                </div>
                <svg class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="isTechDropdownOpen ? 'rotate-180 text-[#58b347]' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              
              <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
                <div v-show="isTechDropdownOpen" class="absolute top-full right-0 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-[100] overflow-hidden flex flex-col max-h-64 overflow-y-auto schedule-custom-scrollbar">
                  <div @click="selectTech('ALL')" class="px-5 py-3 text-[11px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 border-b border-slate-100" :class="store.selectedTechId === 'ALL' ? 'text-[#58b347] bg-[#f2fcf2]' : 'text-slate-600'">CAŁA FLOTA (WSZYSCY)</div>
                  <div v-for="tech in store.techList" :key="tech.id" @click="selectTech(tech.id)" class="px-5 py-3 text-[11px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2" :class="store.selectedTechId === tech.id ? 'text-[#58b347] bg-[#f2fcf2]' : 'text-slate-600'">
                    <span class="w-2 h-2 rounded-full shrink-0" :style="`background-color: ${tech.zone_color || tech.color || '#cbd5e1'};`"></span> {{ tech.name }}
                  </div>
                </div>
              </transition>
            </div>

            <!-- PRZYCISK DODAWANIA EVENTU -->
            <button @click.stop="openEventModalFromView" class="bg-[#58b347] text-white font-extrabold px-6 py-2.5 rounded-xl text-[12px] uppercase tracking-widest hover:bg-[#499b3a] shadow-md shadow-[#58b347]/20 transition-all flex items-center justify-center gap-2 h-[42px] shrink-0">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> ZAPLANUJ
            </button>

          </div>
        </template> 
      </UniversalSearch>

      <!-- ROZWIJANA LISTA WYNIKÓW POD SEARCHBAREM -->
      <div
        v-if="hasActiveSearchQuery && !isSearchDropdownDismissed"
        @click.stop
        class="mx-8 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3.5 absolute left-0 right-0 top-full z-[120] animate-fadeIn"
      >
        <div class="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-600">
              Wyniki ({{ combinedSearchResults.length }})
            </span>
            <span class="text-[10px] font-bold text-slate-400">
              • Backlog i zamknięte: {{ searchTicketMatches.length }} • Zaplanowane wizyty: {{ searchEventMatches.length }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="clearSearchQueries"
              class="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Wyczyść
            </button>
            <button
              type="button"
              @click="isSearchDropdownDismissed = true"
              class="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              Zwiń ✕
            </button>
          </div>
        </div>

        <div v-if="combinedSearchResults.length === 0" class="py-3 text-center text-xs font-bold text-slate-400">
          Brak pasujących zgłoszeń ani wizyt.
        </div>

        <div v-else class="flex flex-col gap-1 max-h-64 overflow-y-auto schedule-custom-scrollbar pr-1">
          <div
            v-for="item in combinedSearchResults"
            :key="item.key"
            @click="jumpToSearchResult(item)"
            class="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-slate-100 hover:border-[#58b347]/50 hover:bg-[#f0f7f1]/60 transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-2 min-w-0 flex-wrap">
              <span
                class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0"
                :class="item.kind === 'event'
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : (item.isClosed ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-800 border-amber-200')"
              >
                {{ item.statusLabel }}
              </span>

              <span v-if="item.qp" class="text-[11px] font-black text-slate-800 font-mono shrink-0">
                {{ item.qp }}
              </span>

              <span v-if="item.code" class="text-[10px] font-bold text-slate-500 font-mono shrink-0">
                #{{ item.code }}
              </span>

              <span class="text-xs font-bold text-slate-700 truncate">
                {{ item.title }}
              </span>

              <span v-if="item.techName" class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                {{ item.techName }}
              </span>
            </div>

            <div class="flex items-center gap-2.5 shrink-0">
              <span class="text-[11px] font-black font-mono text-slate-600">
                {{ item.dateDisplay || 'Brak daty' }}
              </span>
              <button
                type="button"
                @click.stop="jumpToSearchResult(item)"
                class="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#58b347] text-slate-600 group-hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                :title="`Skocz do daty ${item.dateDisplay || ''}`"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ZEWNĘTRZNY KOMPONENT WIDOKU HARMONOGRAMU -->
    <ScheduleList 
      ref="scheduleListRef"
      :filteredTickets="filteredTickets"
      :totalBacklogCount="totalBacklogCount"
      @rotate-view="rotateView"
      @confirm-delete-event="confirmDeleteEvent"
    />

    <!-- MODALE -->
    <UniversalTabModal 
      :show="showTabModal" :isEditing="!!editingTabId" :form="modalForm" :searchQueries="searchQueriesModal"
      @close="showTabModal = false" @save="saveTab"
    />

    <ConfirmModal 
      :show="confirmModal.show" :message="confirmModal.message"
      @cancel="confirmModal.show = false" @confirm="executeConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useScheduleStore } from '../../stores/useScheduleStore'
import { useSearchFilters } from '../../composables/useSearchFilters'
import { useSmartKpiFilters } from '../../composables/useSmartKpiFilters'

import UniversalKpi from '../../common/UniversalKpi.vue'
import UniversalSearch from '../../common/UniversalSearch.vue'
import UniversalTabModal from '../../common/UniversalTabModal.vue'
import ConfirmModal from '../../common/ConfirmModal.vue'
import ScheduleList from './ScheduleList.vue'

const store = useScheduleStore()
const { checkTicketSearch } = useSearchFilters()

const scheduleListRef = ref(null)
const searchContainerRef = ref(null)
const techDropdownRef = ref(null)
const confirmModal = ref({ show: false, message: "", onConfirm: null })

const isTechDropdownOpen = ref(false)
const isSearchDropdownDismissed = ref(false)

const handleGlobalClick = () => {
  isTechDropdownOpen.value = false
  isSearchDropdownDismissed.value = true
}

const onSearchContainerClick = (e) => {
  if (e.target && e.target.tagName === 'INPUT') {
    isSearchDropdownDismissed.value = false
  }
}

const handleOutsidePointerDown = (e) => {
  if (techDropdownRef.value && techDropdownRef.value.contains(e.target)) {
    isSearchDropdownDismissed.value = true
    return
  }
  if (searchContainerRef.value && !searchContainerRef.value.contains(e.target)) {
    isSearchDropdownDismissed.value = true
  }
  if (techDropdownRef.value && !techDropdownRef.value.contains(e.target)) {
    isTechDropdownOpen.value = false
  }
}

const handleGlobalKeydown = (e) => {
  if (e.key === 'Escape') {
    isSearchDropdownDismissed.value = true
    isTechDropdownOpen.value = false
    if (document.activeElement && searchContainerRef.value?.contains(document.activeElement)) {
      document.activeElement.blur()
    }
  }
}

watch(
  () => JSON.stringify(store.searchQueriesMain),
  () => { isSearchDropdownDismissed.value = false }
)

const focusToday = () => {
  if (scheduleListRef.value) scheduleListRef.value.focusToday()
}
const onGlobalDrop = () => {
  if (scheduleListRef.value) scheduleListRef.value.onGlobalDragEnd()
}
const openEventModalFromView = () => {
  if (scheduleListRef.value) scheduleListRef.value.openManualEventModal()
}

const rotateView = () => {
  if (store.currentView === 'month') store.currentView = 'week'
  else if (store.currentView === 'week') store.currentView = 'day'
  else store.currentView = 'month'
  focusToday()
}

// LOGIKA MODALU FILTRÓW
const showTabModal = ref(false)
const editingTabId = ref(null)
const modalForm = ref({ name: "", color: "#58b347", iconPreviewBase64: "", selectedIconName: "" })
const searchQueriesModal = ref([{ id: 'd_' + Date.now(), logic: 'AND', text: '' }])

const openNewTabModal = () => {
  editingTabId.value = null
  modalForm.value = { name: "", color: "#58b347", iconPreviewBase64: "PHN2ZyBjbGFzcz0idy02IGgtNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGxpbmUgeDE9IjgiIHkxPSI2IiB4Mj0iMjEiIHkyPSI2Ii8+PGxpbmUgeDE9IjgiIHkxPSIxMiIgeDI9IjIxIiB5Mj0iMTIiLz48bGluZSB4MT0iOCIgeTE9IjE4IiB4Mj0iMjEiIHkyPSIxOCIvPjxsaW5lIHgxPSIzIiB5MT0iNiIgeDI9IjMuMDEiIHkyPSI2Ii8+PGxpbmUgeDE9IjMiIHkxPSIxMiIgeDI9IjMuMDEiIHkyPSIxMiIvPjxsaW5lIHgxPSIzIiB5MT0iMTgiIHgyPSIzLjAxIiB5Mj0iMTgiLz48L3N2Zz4=", selectedIconName: "" }
  searchQueriesModal.value = [{ id: 'd_' + Date.now(), logic: 'AND', text: '' }]
  showTabModal.value = true
}

const editTab = (tab) => {
  if (tab.filter !== 'CUSTOM') return
  editingTabId.value = tab.id
  modalForm.value = { name: tab.name, color: tab.color, iconPreviewBase64: tab.icon, selectedIconName: "" }
  searchQueriesModal.value = tab.customQueries && tab.customQueries.length ? JSON.parse(JSON.stringify(tab.customQueries)) : [{ id: 'd_' + Date.now(), logic: 'AND', text: '' }]
  showTabModal.value = true
}

const confirmDeleteTab = (id) => {
  confirmModal.value = {
    show: true, message: "Usunąć ten filtr (zakładkę)?",
    onConfirm: () => {
      store.kpiTabs = store.kpiTabs.filter(t => t.id !== id)
      if (store.activeTabs && store.activeTabs.includes(id)) {
        store.activeTabs = store.activeTabs.filter(tabId => tabId !== id)
        if (store.activeTabs.length === 0) store.activeTabs = ['ALL']
      }
      store.saveTabsConfiguration()
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
  store.saveTabsConfiguration()
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
    store.saveTabsConfiguration()
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
  store.saveTabsConfiguration()
}

// LOGIKA WYBORU TECHNIKA
const currentTechName = computed(() => {
  if (store.selectedTechId === 'ALL') return 'CAŁA FLOTA (WSZYSCY)'
  const tech = store.techList.find(t => t.id === store.selectedTechId)
  return tech ? tech.name : 'CAŁA FLOTA (WSZYSCY)'
})

const currentTechColor = computed(() => {
  if (store.selectedTechId === 'ALL') return '#cbd5e1'
  const tech = store.techList.find(t => t.id === store.selectedTechId)
  return tech ? (tech.zone_color || tech.color) : '#cbd5e1'
})

const selectTech = (id) => {
  store.selectedTechId = id
  isTechDropdownOpen.value = false
}

// === OBSŁUGA PONOWNYCH WIZYT (WIZYTA I, II, III...) ===
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
const toRomanVisit = (num) => ROMAN_NUMERALS[num - 1] || String(num)

const normalizeTicketKey = (val) => {
  if (val === null || val === undefined) return ''
  return String(val).trim().toLowerCase().replace(/^#/, '').replace(/\.0$/, '')
}

const parseSafeScheduleDate = (rawDate) => {
  if (!rawDate) return null
  const str = String(rawDate).trim()
  if (!str || str.startsWith('1899-12-30')) return null

  const normalized = str.replace(/^(\d{4}-\d{2}-\d{2})\s+/, '$1T')
  const d = new Date(normalized)
  if (!isNaN(d.getTime()) && d.getFullYear() >= 2000) return d

  const euMatch = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/)
  if (euMatch) {
    return new Date(
      Number(euMatch[3]),
      Number(euMatch[2]) - 1,
      Number(euMatch[1]),
      euMatch[4] ? Number(euMatch[4]) : 0,
      euMatch[5] ? Number(euMatch[5]) : 0
    )
  }
  return null
}

const getTodayStartMs = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

const getEventCompareMs = (ev) => {
  const sMs = parseSafeScheduleDate(ev?.start_time)?.getTime() || 0
  const eMs = parseSafeScheduleDate(ev?.end_time)?.getTime() || 0
  return Math.max(sMs, eMs)
}

// Dokładne rozróżnienie zleceń otwartych (np. "WYKONANIE" / "OCZEKUJE NA RAPORT" + "Nowe") od faktycznie wykonanych/zamkniętych
const isTicketCompletedOrClosed = (d) => {
  if (!d) return true
  const sysSt = String(d.status || '').toLowerCase().trim()
  const intSt = String(d.ticket_status || '').toLowerCase().trim()

  // 1. Twarde zamknięcie lub anulowanie w systemie źródłowym
  if (
    sysSt.includes('ticket_closed') ||
    sysSt.includes('closed') ||
    sysSt.includes('zamknięt') ||
    sysSt.includes('zamkniet') ||
    sysSt.includes('zakończ') ||
    sysSt.includes('zakoncz') ||
    sysSt.includes('cancelled') ||
    sysSt.includes('cancel') ||
    sysSt.includes('anulow')
  ) {
    return true
  }

  // 2. Jeśli ustawiono wewnętrzny status operacyjny (np. "Nowe", "Oczekuje na części", "Oczekuje na realizację", "Wykonano")
  if (intSt && intSt !== 'brak statusu' && intSt !== 'brak statusu zlecenia') {
    if (
      intSt.includes('wykonano') ||
      intSt.includes('wykonane') ||
      intSt.includes('rozlicz') ||
      intSt.includes('zamknięt') ||
      intSt.includes('zakończ') ||
      intSt.includes('anulow')
    ) {
      return true
    }
    return false
  }

  // 3. Gdy brak wewnętrznego statusu — zamykamy tylko gdy raport jest już złożony / fakturowany
  if (
    sysSt.includes('report_for_approval') ||
    sysSt.includes('raport do zatwierdzenia') ||
    sysSt.includes('report_approved') ||
    sysSt.includes('raport zatwierdzony') ||
    sysSt.includes('invoicing') ||
    sysSt.includes('fakturowan') ||
    sysSt.includes('wykonano') ||
    sysSt.includes('wykonane') ||
    sysSt.includes('rozlicz')
  ) {
    return true
  }

  return false
}

const ticketVisitsIndex = computed(() => {
  const aliasToCanonical = new Map()
  ;(store.tickets || []).forEach(t => {
    const canonical = normalizeTicketKey(t.t_id || t.t_code || t.id)
    if (!canonical) return
    ;[t.t_id, t.t_code, t.id, t.ticket_code, t.ticket_number].forEach(alias => {
      const k = normalizeTicketKey(alias)
      if (k) aliasToCanonical.set(k, canonical)
    })
  })

  const groupedByTicket = new Map()
  ;(store.events || []).forEach(ev => {
    const evType = ev.event_type || ev.extendedProps?.event_type
    if (evType === 'absence') return
    const rawTid = normalizeTicketKey(ev.ticket_id)
    if (!rawTid || rawTid === 'null' || rawTid === 'undefined') return

    const canonical = aliasToCanonical.get(rawTid) || rawTid
    if (!groupedByTicket.has(canonical)) groupedByTicket.set(canonical, [])
    groupedByTicket.get(canonical).push(ev)
  })

  const todayStart = getTodayStartMs()
  const byTicket = new Map()
  const byEventId = new Map()

  groupedByTicket.forEach((evList, canonical) => {
    const sorted = [...evList].sort((a, b) => {
      const aMs = parseSafeScheduleDate(a.start_time)?.getTime() || 0
      const bMs = parseSafeScheduleDate(b.start_time)?.getTime() || 0
      return aMs - bMs
    })

    sorted.forEach((ev, idx) => {
      byEventId.set(String(ev.id), {
        visitNum: idx + 1,
        visitRoman: toRomanVisit(idx + 1),
        totalVisits: sorted.length
      })
    })

    const upcomingVisits = []
    const pastVisits = []
    sorted.forEach(ev => {
      const refMs = getEventCompareMs(ev)
      if (refMs >= todayStart) upcomingVisits.push(ev)
      else pastVisits.push(ev)
    })

    byTicket.set(canonical, {
      allVisits: sorted,
      upcomingVisits,
      pastVisitsNewestFirst: [...pastVisits].reverse()
    })
  })

  return { byTicket, byEventId }
})

const getTicketVisitSummary = (d) => {
  if (!d) return null
  const key = normalizeTicketKey(d.t_id || d.t_code || d.id)
  return ticketVisitsIndex.value.byTicket.get(key) || null
}

// Reaktywna baza Backlogu: nowe zgłoszenia + niezamknięte zgłoszenia po minionych wizytach (Wizyta II+)
const enrichedBacklogBase = computed(() => {
  return (store.tickets || [])
    .filter(d => {
      if (isTicketCompletedOrClosed(d)) return false
      const summary = getTicketVisitSummary(d)
      if (summary && summary.upcomingVisits.length > 0) return false
      return true
    })
    .map(d => {
      const summary = getTicketVisitSummary(d)
      const pastVisits = summary ? summary.pastVisitsNewestFirst : []
      const nextNum = pastVisits.length + 1
      const lastEv = pastVisits[0] || null
      const fallbackTechRaw = d.actualTechId || d.technician_id || lastEv?.technician_id || ''
      const fallbackTechObj = fallbackTechRaw
        ? (store.techList || []).find(t => t.id === fallbackTechRaw || t.name === fallbackTechRaw)
        : null

      return {
        ...d,
        actualTechId: d.actualTechId || (fallbackTechObj ? fallbackTechObj.id : fallbackTechRaw),
        techName: (d.techName && d.techName !== 'BRAK PRZYPISANIA')
          ? d.techName
          : (fallbackTechObj ? fallbackTechObj.name : (lastEv?.extendedProps?.technicianName || d.techName)),
        techColor: (d.techColor && d.techColor !== '#cbd5e1')
          ? d.techColor
          : (fallbackTechObj ? (fallbackTechObj.zone_color || fallbackTechObj.color || '#cbd5e1') : d.techColor),
        is_repeat_visit: pastVisits.length > 0,
        next_visit_num: nextNum,
        next_visit_roman: toRomanVisit(nextNum),
        past_visits: pastVisits
      }
    })
})

store.getBaseList = () => enrichedBacklogBase.value
store.duplicateIds = []

const totalBacklogCount = computed(() => enrichedBacklogBase.value.length)

const { filteredBaseList, evaluateQueries } = useSmartKpiFilters(store, checkTicketSearch)

const tabCounts = computed(() => {
  const counts = {}
  if (!store.kpiTabs) return counts
  
  let searchFilteredBase = enrichedBacklogBase.value
  if (store.searchQueriesMain.some(q => q.text.trim() !== '')) {
    searchFilteredBase = searchFilteredBase.filter(item => evaluateQueries(item, store.searchQueriesMain))
  }

  const getSimulatedCount = (tab) => {
    let isTechTab = tab.id.startsWith('TECH_')
    let isStatusTab = tab.filter === 'SYSTEM' || tab.filter === 'CUSTOM'
    
    const activeIds = store.activeTabs || ['ALL']
    const activeObjs = activeIds.filter(id => id !== 'ALL').map(id => store.kpiTabs.find(c => c.id === id)).filter(Boolean)
    
    let activeTechs = activeObjs.filter(t => t.id.startsWith('TECH_'))
    let activeStatuses = activeObjs.filter(t => t.filter === 'SYSTEM' || t.filter === 'CUSTOM')
    
    let techGroup = isTechTab ? [tab] : activeTechs
    let statusGroup = isStatusTab ? [tab] : activeStatuses
    
    return searchFilteredBase.filter(item => {
      let passTech = techGroup.length === 0 || techGroup.some(t => evaluateQueries(item, t.customQueries))
      let passStatus = statusGroup.length === 0 || statusGroup.some(t => {
        if (t.id === 'URGENT') return item.slaLeft < 24
        return evaluateQueries(item, t.customQueries)
      })
      return passTech && passStatus
    }).length
  }

  store.kpiTabs.forEach(tab => {
    if (tab.isHidden) return
    
    if (tab.filter === 'ALL') {
      counts[tab.id] = searchFilteredBase.length
    } else if (tab.filter === 'URGENT') {
      counts[tab.id] = searchFilteredBase.filter(d => d.slaLeft < 24).length
    } else if (tab.filter === 'TODAY') {
      const todayStr = new Date().toISOString().split('T')[0]
      counts[tab.id] = store.events.filter(x => x.start_time && x.start_time.startsWith(todayStr)).length
    } else if (tab.customQueries) {
      counts[tab.id] = getSimulatedCount(tab)
    } else {
      counts[tab.id] = 0
    }
  })
  return counts
})

// Zlecenia wymagające kolejnej wizyty (Wizyta II+) lądują na samej górze Backlogu
const filteredTickets = computed(() => {
  void enrichedBacklogBase.value
  let base = [...filteredBaseList.value]
  const activeTabs = store.activeTabs || ['ALL']
  
  if (activeTabs.includes('URGENT')) {
    base = base.filter(d => d.slaLeft < 24)
  }
  if (activeTabs.includes('TODAY')) {
    base = []
  }

  return base.sort((a, b) => {
    if (Boolean(a.is_repeat_visit) !== Boolean(b.is_repeat_visit)) {
      return a.is_repeat_visit ? -1 : 1
    }
    return a.slaLeft - b.slaLeft
  })
})

const hasActiveSearchQuery = computed(() =>
  (store.searchQueriesMain || []).some(q => String(q.text || '').trim() !== '')
)

const clearSearchQueries = () => {
  store.searchQueriesMain = [{ id: 'm_' + Date.now(), logic: 'AND', text: '' }]
}

const matchesMainSearch = (haystack) => {
  const active = (store.searchQueriesMain || []).filter(q => String(q.text || '').trim() !== '')
  if (active.length === 0) return true
  const textLow = String(haystack || '').toLowerCase()

  return active.reduce((acc, q, idx) => {
    const cond = textLow.includes(String(q.text).toLowerCase().trim())
    if (idx === 0) return cond
    return String(q.logic || 'AND').toUpperCase() === 'OR' ? (acc || cond) : (acc && cond)
  }, true)
}

const formatResultDate = (rawDate) => {
  const d = parseSafeScheduleDate(rawDate)
  if (!d) return ''
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const searchTicketMatches = computed(() => {
  if (!hasActiveSearchQuery.value) return []
  return (store.tickets || [])
    .filter(t => {
      if (store.selectedTechId && store.selectedTechId !== 'ALL') {
        const sel = String(store.selectedTechId).toLowerCase()
        const matchTech = String(t.actualTechId || '').toLowerCase() === sel ||
          String(t.techName || '').toLowerCase() === sel ||
          String(t.technician_id || '').toLowerCase() === sel
        if (!matchTech) return false
      }
      const hay = [t.t_qp, t.t_code, t.t_id, t.t_title, t.t_desc, t.t_address, t.t_client, t.techName, t.t_status].join(' ')
      return matchesMainSearch(hay)
    })
    .slice(0, 25)
    .map(t => {
      const closed = isTicketCompletedOrClosed(t)
      const summary = getTicketVisitSummary(t)
      const rawSt = String(t.t_status || '').trim()
      const baseSt = rawSt && rawSt !== 'BRAK STATUSU ZLECENIA' ? rawSt : 'Backlog'

      let statusLabel = baseSt
      if (closed) {
        statusLabel = 'Zamknięte'
      } else if (summary && summary.pastVisitsNewestFirst.length > 0 && summary.upcomingVisits.length === 0) {
        statusLabel = `Wizyta ${toRomanVisit(summary.pastVisitsNewestFirst.length + 1)} • ${baseSt}`
      }

      const dateRaw = t.t_created || ''
      return {
        key: 'tck_' + (t.t_id || t.t_code),
        kind: 'ticket',
        isClosed: closed,
        statusLabel,
        qp: t.t_qp || '',
        code: t.t_code || t.t_id || '',
        title: t.t_title || t.t_address || 'Zgłoszenie',
        techName: t.techName && t.techName !== 'BRAK PRZYPISANIA' ? t.techName : '',
        dateRaw,
        dateDisplay: formatResultDate(dateRaw)
      }
    })
})

const searchEventMatches = computed(() => {
  if (!hasActiveSearchQuery.value) return []
  const todayStart = getTodayStartMs()

  return (store.events || [])
    .filter(ev => {
      if (ev.extendedProps?.event_type === 'absence') return false
      if (store.selectedTechId && store.selectedTechId !== 'ALL') {
        const sel = String(store.selectedTechId).toLowerCase()
        const techObj = (store.techList || []).find(x => String(x.id).toLowerCase() === sel || String(x.name || '').toLowerCase() === sel)
        const matchTech = String(ev.technician_id || '').toLowerCase() === sel ||
          (techObj && String(ev.technician_id || '').toLowerCase() === String(techObj.id).toLowerCase()) ||
          String(ev.extendedProps?.technicianName || '').toLowerCase() === sel
        if (!matchTech) return false
      }
      const hay = [ev.title, ev.description, ev.ticket_id, ev.event_subtype, ev.extendedProps?.technicianName, ev.extendedProps?.qpCode].join(' ')
      return matchesMainSearch(hay)
    })
    .sort((a, b) => (parseSafeScheduleDate(b.start_time)?.getTime() || 0) - (parseSafeScheduleDate(a.start_time)?.getTime() || 0))
    .slice(0, 25)
    .map(ev => {
      const qpFromTitle = (String(ev.title || '').match(/QP-\d+/i) || [])[0] || ev.extendedProps?.qpCode || ''
      const tName = ev.extendedProps?.technicianName && ev.extendedProps.technicianName !== 'BRAK'
        ? ev.extendedProps.technicianName
        : ''
      const refMs = getEventCompareMs(ev)
      const isPast = refMs > 0 && refMs < todayStart
      const vMeta = ticketVisitsIndex.value.byEventId.get(String(ev.id))
      const visitPrefix = vMeta && vMeta.totalVisits > 1 ? `Wizyta ${vMeta.visitRoman} • ` : ''

      return {
        key: 'ev_' + ev.id,
        kind: 'event',
        isClosed: isPast,
        statusLabel: visitPrefix + (isPast ? 'Odbyta' : 'Zaplanowane'),
        qp: qpFromTitle.toUpperCase(),
        code: ev.ticket_id || '',
        title: ev.title || ev.description || 'Wizyta w grafiku',
        techName: tName,
        dateRaw: ev.start_time || '',
        dateDisplay: formatResultDate(ev.start_time)
      }
    })
})

const combinedSearchResults = computed(() => {
  return [...searchEventMatches.value, ...searchTicketMatches.value]
})

const jumpToSearchResult = (item) => {
  if (!item || !scheduleListRef.value) return
  isSearchDropdownDismissed.value = true
  const parsed = parseSafeScheduleDate(item.dateRaw) || new Date()
  scheduleListRef.value.jumpToDate(parsed.toISOString(), 'day')
}

const confirmDeleteEvent = (id) => {
  confirmModal.value = {
    show: true, message: "Czy na pewno chcesz usunąć tę wizytę z kalendarza? Zgłoszenie wróci do Backlogu.",
    onConfirm: () => { store.deleteEventFromCloud(id) }
  }
}

const executeConfirm = () => {
  if (confirmModal.value.onConfirm) confirmModal.value.onConfirm()
  confirmModal.value.show = false
}

onMounted(() => {
  if (store.kpiTabs && store.kpiTabs.length > 0) {
    let changed = false
    
    const urgentTab = store.kpiTabs.find(t => t.id === 'URGENT')
    const newAlertIcon = `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
    
    if (urgentTab && urgentTab.icon !== newAlertIcon) {
      urgentTab.icon = newAlertIcon
      changed = true
    }

    const allTab = store.kpiTabs.find(t => t.id === 'ALL')
    const newCalendarIcon = `<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
    
    if (allTab && allTab.icon !== newCalendarIcon) {
      allTab.icon = newCalendarIcon
      changed = true
    }
    
    const todayTab = store.kpiTabs.find(t => t.id === 'TODAY')
    if (todayTab && todayTab.icon !== newCalendarIcon) {
      todayTab.icon = newCalendarIcon
      changed = true
    }

    if (changed) {
      store.saveTabsConfiguration()
    }
  }

  window.addEventListener('mousedown', handleOutsidePointerDown, true)
  window.addEventListener('keydown', handleGlobalKeydown)

  store.fetchScheduleData()
  setTimeout(focusToday, 300)
})

onUnmounted(() => {
  window.removeEventListener('mousedown', handleOutsidePointerDown, true)
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.schedule-custom-scrollbar::-webkit-scrollbar { width: 6px; }
.schedule-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.schedule-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
.schedule-custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.8); }
</style>