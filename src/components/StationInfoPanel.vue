<template>
  <div class="fixed top-0 right-0 bottom-0 z-[450] w-full max-w-md bg-white/95 backdrop-blur-xl border-l border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col font-sans select-none"
       :class="isOpen ? 'translate-x-0' : 'translate-x-full'">
    
    <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 shrink-0">
      <div class="flex items-center gap-2.5 cursor-pointer group" @click="$emit('openAnalytics', station?.id)" title="Otwórz analitykę">
        <h3 class="text-xl font-black text-slate-800 uppercase tracking-tight group-hover:text-[#58b347] transition-colors">{{ shortId }}</h3>
        <svg class="w-5 h-5 text-slate-300 group-hover:text-[#58b347] opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
      </div>
      <button @click="close" class="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-slate-100 font-bold transition-colors">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="px-6 py-4 border-b border-slate-100 bg-white grid grid-cols-2 gap-3 shrink-0">
      <button @click="openNav" class="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-[#58b347] hover:bg-[#f0f7f1] text-[#58b347] transition-all group shadow-sm">
        <svg class="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span class="text-[11px] font-black uppercase tracking-widest">Nawiguj</span>
      </button>
      <button @click="$emit('openTicket', station?.id)" class="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#58b347] hover:bg-[#499b3a] text-white shadow-md shadow-[#58b347]/30 transition-all group">
        <svg class="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span class="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">Zgłoszenie</span>
      </button>
    </div>

    <div class="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-[#f4f6f8]">
      
      <!-- Ticket Alert -->
      <div v-if="hasActiveTicket" class="bg-white border-2 border-amber-300 rounded-2xl p-5 shadow-lg shadow-amber-500/10 relative overflow-hidden">
        <div class="absolute -top-4 -right-4 p-3 opacity-5 pointer-events-none">
          <svg class="w-32 h-32 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div class="relative z-10 flex flex-col gap-2">
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
              <span class="text-[10px] font-black text-amber-600 uppercase tracking-widest">Aktywne Zgłoszenie</span>
            </div>
            
            <!-- Skeleton dla statusu -->
            <div v-if="ticketsStore.isLoading" class="h-6 w-24 bg-slate-200 rounded-md animate-pulse"></div>
            <!-- Rzeczywisty status -->
            <span v-else class="text-[9px] font-black uppercase tracking-widest border px-2 py-1 rounded-md" :class="ticketStatusColor">
              Status: {{ displayTicketStatus }}
            </span>
          </div>
          
          <div class="mt-1">
            <h4 class="text-sm font-black text-slate-800 tracking-wider">{{ station.active_ticket_id || 'TKT-XXXX' }}</h4>
            
            <!-- Skeleton dla tytułu -->
            <div v-if="ticketsStore.isLoading" class="h-4 w-3/4 bg-slate-200 rounded animate-pulse mt-1.5 mb-2"></div>
            <!-- Rzeczywisty tytuł -->
            <div v-else class="text-[11px] text-slate-800 font-bold leading-tight mt-1 mb-2">{{ displayTicketTitle }}</div>
          </div>
          
          <!-- Pole z opisem zgłoszenia -->
          <div class="text-[11px] text-slate-600 font-medium leading-relaxed bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 max-h-32 overflow-y-auto custom-scrollbar shadow-inner mt-1 mb-2">
            <!-- Skeletons dla opisu -->
            <div v-if="ticketsStore.isLoading" class="space-y-1.5">
              <div class="h-3 w-full bg-amber-100 rounded animate-pulse"></div>
              <div class="h-3 w-5/6 bg-amber-100 rounded animate-pulse"></div>
              <div class="h-3 w-4/6 bg-amber-100 rounded animate-pulse"></div>
            </div>
            <!-- Rzeczywisty opis -->
            <span v-else>{{ displayTicketDesc }}</span>
          </div>
        </div>
      </div>
      
      <!-- Parametry -->
      <div>
        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Parametry Techniczne</h4>
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-slate-400 uppercase tracking-wider">Klient / Partner:</span>
            <span class="font-black text-slate-700">{{ station?.client_id || station?.client || '-' }}</span>
          </div>
          <div class="flex justify-between items-center text-xs border-t border-slate-100 pt-2.5">
            <span class="font-bold text-slate-400 uppercase tracking-wider">Model Ładowarki:</span>
            <span class="font-black text-slate-700">{{ station?.model || '-' }}</span>
          </div>
          <div class="flex justify-between items-center text-xs border-t border-slate-100 pt-2.5">
            <span class="font-bold text-slate-400 uppercase tracking-wider">Przegląd UDT:</span>
            <span class="font-black text-slate-700">{{ station?.inspection_date || '-' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Podgląd złączy (EVSE) -->
      <div>
        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
          Złącza (EVSE) <span class="text-[#58b347]">Online</span>
        </h4>
        <div class="grid grid-cols-3 gap-2">
          <div class="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 shadow-sm">
            <div class="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-[#58b347]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span class="text-[10px] font-black text-slate-600 tracking-wider">CCS 1</span>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 shadow-sm">
            <div class="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-[#58b347]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span class="text-[10px] font-black text-slate-600 tracking-wider">CCS 2</span>
          </div>
          <div class="bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 shadow-sm">
            <div class="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
               <span class="block w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
            </div>
            <span class="text-[10px] font-black text-slate-400 tracking-wider">AC</span>
          </div>
        </div>
      </div>

      <!-- Lokalizacja -->
      <div>
        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Lokalizacja & Dojazd</h4>
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
          <div class="text-xs">
            <div class="font-black text-slate-800 text-sm">{{ displayCity }}, {{ displayCountry }}</div>
            <div class="font-semibold text-slate-500 mt-0.5">{{ displayAddress }}</div>
          </div>
          <div class="flex items-center gap-2 border-t border-slate-100 pt-2.5">
            <svg class="w-4 h-4 text-[#58b347]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span class="text-[10px] font-bold font-mono text-slate-500 tracking-wider">GPS: {{ displayGps }}</span>
          </div>
          
          <div v-if="station?.additional_info || station?.logistics_info || station?.notes" class="mt-2 p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl">
            <div class="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1 flex items-center gap-1.5">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Info Logistyczne
            </div>
            <div class="text-[11px] text-slate-700 font-medium leading-relaxed">{{ station.logistics_info || station.additional_info || station.notes }}</div>
          </div>
        </div>
      </div>
      
      <!-- Opieka Serwisowa -->
      <div>
        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Opieka Serwisowa</h4>
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
          <div class="flex justify-between items-center">
            <span class="font-bold text-slate-400 uppercase tracking-wider">Technicy:</span>
            <span class="font-black text-slate-700">{{ station?.technician_id || station?.technician || '-' }}</span>
          </div>
          <div class="flex justify-between items-center border-t border-slate-100 pt-2.5">
            <span class="font-bold text-slate-400 uppercase tracking-wider">Region:</span>
            <span class="font-black text-slate-700">{{ station?.geo_region || station?.region || '-' }}</span>
          </div>
        </div>
      </div>
      
    </div>

    <!-- Stopka z akcjami -->
    <div class="p-5 border-t border-slate-100 bg-white flex gap-3 shrink-0 rounded-bl-[24px]">
      <button @click="$emit('editStation', station)" class="flex-1 bg-slate-50 border border-slate-200 hover:border-[#58b347] hover:bg-[#f0f7f1] hover:text-[#58b347] text-slate-600 font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg> Szybka Edycja
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMapStore } from '../stores/useMapStore'
import { useTicketsStore } from '../stores/useTicketsStore'

const store = useMapStore()
const ticketsStore = useTicketsStore()
const isOpen = ref(false)
const station = ref(null)

// ==== DEBUGGER: TABELA Z DANYMI ZGŁOSZEŃ W KONSOLI ====
watch(() => ticketsStore.tickets, (newTickets) => {
  if (newTickets && newTickets.length > 0) {
    console.log("=== DANE ZGŁOSZEŃ (WIDOK MAPY / PANEL) ===");
    console.table(newTickets[0]);
    window.DEBUG_MAP_TICKETS = newTickets;
  } else if (!ticketsStore.isLoading) {
    console.log("=== UWAGA: POBRANO PUSTĄ LISTĘ ZGŁOSZEŃ ===");
  }
}, { deep: true })

// Zabezpieczenie przed nieskończonym ładowaniem (awaryjny timeout)
watch(() => ticketsStore.isLoading, (loading) => {
  if (loading) {
    setTimeout(() => {
      if (ticketsStore.isLoading) {
        console.warn("AWARYJNE PRZERWANIE ŁADOWANIA - Backend nie odpowiedział w 10 sekund.");
        ticketsStore.isLoading = false; 
      }
    }, 10000);
  }
})
// ========================================================

const shortId = computed(() => {
  if (!station.value) return 'QP-0000'
  const rawId = station.value.public_id || station.value.name || station.value.id || ''
  return rawId.includes('-') ? rawId.split('-').slice(0, 2).join('-') : rawId
})

const hasActiveTicket = computed(() => !!(station.value && station.value.active_ticket_id))

// ==== KULOODPORNA LOGIKA WYSZUKUJĄCA (ID + QP FALLBACK) ====
const activeTicketDetails = computed(() => {
  if (!station.value) return null
  const tickets = ticketsStore.tickets || []

  // 1. Szukamy po konkretnym przypisanym ID
  if (station.value.active_ticket_id) {
    const exactId = String(station.value.active_ticket_id).toLowerCase().trim()
    const matchById = tickets.find(t => 
      String(t.id).toLowerCase().trim() === exactId || 
      String(t.ticket_code || t.ticket_number || '').toLowerCase().trim() === exactId
    )
    if (matchById) return matchById
  }

  // 2. Szukamy po numerze QP jako fallback
  const sId = shortId.value.toUpperCase().trim()
  const matchByQp = tickets.find(t => {
    const tQp = String(t.qp_id || t.qp_id_full || t.station_id || '').toUpperCase().trim()
    const status = String(t.status || t.ticket_status || '').toLowerCase()
    const isClosed = status.includes('zakończ') || status.includes('close') || 
                     status.includes('zamknięt') || status.includes('anulowan') || 
                     status.includes('wykonano') || status.includes('rozliczone')

    return tQp && (tQp.includes(sId) || sId.includes(tQp)) && !isClosed
  })

  return matchByQp || null
})

// Obliczanie wartości tekstowych na podstawie pobranego zgłoszenia (lub fallback)
const displayTicketStatus = computed(() => {
  if (activeTicketDetails.value) {
    // Odczytujemy status ze znalezionego zgłoszenia
    return activeTicketDetails.value.ticket_status || activeTicketDetails.value.status || station.value.ticket_status || 'Brak statusu'
  }
  return station.value?.ticket_status || 'Brak statusu'
})

const displayTicketTitle = computed(() => {
  if (activeTicketDetails.value) {
    return activeTicketDetails.value.title || station.value.ticket_category || 'Brak tytułu'
  }
  return station.value?.ticket_category || 'Brak aktywnego zgłoszenia'
})

const displayTicketDesc = computed(() => {
  if (activeTicketDetails.value) {
    return activeTicketDetails.value.description || 'To zgłoszenie nie posiada szczegółowego opisu.'
  }
  return 'Brak przypisanego zgłoszenia lub zostało zarchiwizowane.'
})
// ============================================================

const ticketStatusColor = computed(() => {
  const status = displayTicketStatus.value.toLowerCase()
  if (status.includes('części')) return 'bg-purple-50 border-purple-200 text-purple-600'
  if (status.includes('realizację')) return 'bg-blue-50 border-blue-200 text-blue-600'
  if (status.includes('wykonano')) return 'bg-[#f0f7f1] border-[#58b347]/30 text-[#58b347]'
  if (status.includes('rozliczone')) return 'bg-amber-50 border-amber-200 text-amber-600'
  if (status.includes('brak statusu')) return 'bg-slate-50 border-slate-300 text-slate-400'
  return 'bg-sky-50 border-sky-200 text-sky-600'
})

// Computed properties to handle fallback values for location data as seen in the original script
const displayCity = computed(() => station.value?.city || 'Nieznane miasto')
const displayCountry = computed(() => station.value?.country || 'Polska')
const displayAddress = computed(() => station.value?.street_number || station.value?.street || 'Brak adresu')
const displayGps = computed(() => {
  if (station.value?.gps_lat && station.value?.gps_lng) {
    return `${station.value.gps_lat}, ${station.value.gps_lng}`
  }
  return 'Brak koordynatów'
})

function open(stationId) {
  const found = store.stations.find(s => String(s.id) === String(stationId))
  if (found) {
    station.value = found
    isOpen.value = true

    // Jeśli sklep zgłoszeń jest pusty i aktualnie nie pobiera, wymuszamy pobranie
    if (ticketsStore.tickets.length === 0 && !ticketsStore.isLoading) {
      ticketsStore.fetchTicketsData()
    }
  }
}

function close() {
  isOpen.value = false
}

function openNav() {
  if (station.value && station.value.gps_lat && station.value.gps_lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.value.gps_lat},${station.value.gps_lng}`, '_blank')
  } else {
    alert("Brak koordynatów GPS dla tej stacji.")
  }
}

defineExpose({ open, close })
defineEmits(['openAnalytics', 'openTicket', 'editStation'])
</script>