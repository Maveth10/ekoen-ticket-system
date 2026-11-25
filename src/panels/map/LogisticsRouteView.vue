<template>
  <div class="absolute inset-0 flex bg-slate-50 z-0 overflow-hidden animate-fadeIn">
    
    <!-- LEWA STRONA: MAPA GOOGLE -->
    <div class="flex-1 h-full relative bg-slate-200">
      <div ref="googleMapRef" class="absolute inset-0 w-full h-full"></div>
      
      <!-- Ekran ładowania mapy -->
      <div v-if="isMapLoading" class="absolute inset-0 z-10 bg-slate-100 flex flex-col items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
        <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Inicjalizacja Google Maps API...</p>
      </div>

      <!-- DOLNY PRZEŁĄCZNIK WIDOKU DNI NA MAPIE -->
      <div v-if="plannerMode === 'WEEK' && weekSchedule.length > 0" 
           class="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-2xl flex items-center gap-1.5 flex-wrap max-w-xl">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Widok trasy:</span>
        
        <!-- Pokaż wszystko -->
        <button 
          @click="setActiveDayTab('ALL')"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border"
          :class="activeDayTab === 'ALL' ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'"
        >
          Pokaż wszystko
        </button>

        <!-- Poszczególne dni -->
        <button 
          v-for="(day, dIdx) in weekSchedule" 
          :key="dIdx"
          @click="setActiveDayTab(dIdx)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border"
          :class="activeDayTab === dIdx ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'"
        >
          <span class="w-2.5 h-2.5 rounded-full shadow-sm" :style="{ backgroundColor: day.color }"></span>
          {{ day.dateName }}
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-black"
                :class="activeDayTab === dIdx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'">
            {{ day.taskCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- PRAWA STRONA: INTELIGENTNY PANEL PLANERA -->
    <div class="w-[450px] h-full bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-l border-slate-200 flex flex-col z-20 shrink-0">
      
      <!-- Nagłówek Panelu + Tryby -->
      <div class="p-5 border-b border-slate-100 bg-slate-50/70">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/><circle cx="6" cy="19" r="3"/></svg>
            </div>
            <div>
              <h2 class="text-sm font-black text-slate-800 uppercase tracking-widest">Planer Tras</h2>
              <p class="text-[10px] font-bold text-slate-400">Optymalizacja Google Routes API</p>
            </div>
          </div>

          <!-- Przełącznik 1 Dzień / Smart Tydzień -->
          <div class="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300">
            <button 
              @click="setPlannerMode('DAY')"
              class="px-2.5 py-1 rounded-md text-[10px] font-black transition-all"
              :class="plannerMode === 'DAY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            >
              1 Dzień
            </button>
            <button 
              @click="setPlannerMode('WEEK')"
              class="px-2.5 py-1 rounded-md text-[10px] font-black transition-all"
              :class="plannerMode === 'WEEK' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'"
            >
              Smart Tydzień
            </button>
          </div>
        </div>

        <!-- PRZEŁĄCZNIK POLITYKI NOCLEGÓW -->
        <div v-if="plannerMode === 'WEEK'" class="pt-3 border-t border-slate-200/70 flex items-center justify-between">
          <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider">
            Opcje noclegowe:
          </span>
          <div class="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300">
            <button 
              @click="setAccommodationPolicy('SMART_HOTEL')"
              class="px-2.5 py-1 rounded-md text-[10px] font-black transition-all"
              :class="accommodationPolicy === 'SMART_HOTEL' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
              title="Pozwalaj na hotel, gdy kolejny dzień jest w tym samym rejonie"
            >
              Smart Hotel
            </button>
            <button 
              @click="setAccommodationPolicy('HOME_ONLY')"
              class="px-2.5 py-1 rounded-md text-[10px] font-black transition-all"
              :class="accommodationPolicy === 'HOME_ONLY' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
              title="Każdy dzień startuje z bazy domowej"
            >
              Baza domowa
            </button>
          </div>
        </div>

        <!-- Błędy -->
        <div v-if="errorMessage" class="mt-3 p-3 border border-red-200 bg-red-50 rounded-lg flex gap-2 items-start text-[11px] font-bold text-red-700">
          <svg class="w-4 h-4 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Informacja o oszczędnościach z noclegu -->
        <div v-if="plannerMode === 'WEEK' && accommodationPolicy === 'SMART_HOTEL' && totalHotelsSuggested > 0" 
             class="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div class="text-[10px] font-bold text-amber-900">
            Wykryto <span class="font-black text-amber-700">{{ totalHotelsSuggested }} nocleg w trasie</span>.
            <div class="text-[9px] text-amber-700 font-semibold">Zaoszczędzono ~{{ estimatedKmSaved }} km pustych powrotów do bazy.</div>
          </div>
        </div>
      </div>

      <!-- Statystyki Podsumowania (Dynamiczne: dla całości lub dla wybranego dnia) -->
      <div v-if="currentStats.distance" class="px-6 py-3 border-b border-slate-100 bg-blue-50/50 flex justify-between items-center">
        <div>
          <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {{ activeDayTab === 'ALL' ? 'Dystans Tygodniowy' : `Dystans (${currentActiveDayName})` }}
          </div>
          <div class="text-lg font-black text-blue-700">{{ currentStats.distance }}</div>
        </div>
        <div class="text-right">
          <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {{ activeDayTab === 'ALL' ? 'Czas Jazdy (Suma)' : 'Czas Jazdy' }}
          </div>
          <div class="text-lg font-black text-blue-700">{{ currentStats.duration }}</div>
        </div>
      </div>

      <!-- Zakładki Dni w Prawym Panelu -->
      <div v-if="plannerMode === 'WEEK' && weekSchedule.length > 0" class="flex border-b border-slate-200 bg-white px-3 overflow-x-auto">
        <button 
          @click="setActiveDayTab('ALL')"
          class="px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors"
          :class="activeDayTab === 'ALL' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          Wszystkie dni
        </button>
        <button 
          v-for="(day, dIdx) in weekSchedule" 
          :key="dIdx"
          @click="setActiveDayTab(dIdx)"
          class="px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5"
          :class="activeDayTab === dIdx ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: day.color }"></span>
          {{ day.dateName }}
          <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-black">{{ day.taskCount }}</span>
        </button>
      </div>

      <!-- Lista Kroków i Wskazówek -->
      <div class="flex-1 overflow-y-auto route-custom-scrollbar p-5 bg-slate-50 relative">
        
        <div v-if="weekSchedule.length === 0 && !isCalculating" class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-60">
          <svg class="w-12 h-12 text-slate-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Brak aktywnej trasy</p>
          <p class="text-[10px] font-medium text-slate-400 mt-1">Wybierz technika i kliknij "Wyznacz Trasę".</p>
        </div>

        <div v-else-if="isCalculating" class="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Optymalizacja i analiza trasy...</p>
        </div>

        <!-- LISTA ETAPÓW -->
        <div v-else class="flex flex-col gap-6">
          <div v-for="(daySection, sIdx) in displayedDaySections" :key="sIdx" class="flex flex-col gap-3 relative">
            
            <!-- Nagłówek Dnia (gdy widok wszystkich dni) -->
            <div v-if="activeDayTab === 'ALL'" class="flex items-center gap-2 pb-1 border-b border-slate-200">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: daySection.color }"></span>
              <span class="text-xs font-black text-slate-800 uppercase tracking-wider">{{ daySection.dateName }} ({{ daySection.date }})</span>
              <span class="text-[10px] font-bold text-slate-400 ml-auto">{{ daySection.dayStatsText }}</span>
            </div>

            <!-- Krok po kroku -->
            <div class="relative flex flex-col gap-3">
              <div class="absolute left-3.5 top-5 bottom-5 w-0.5 bg-blue-200 z-0"></div>

              <div v-for="(step, idx) in daySection.steps" :key="idx" class="relative z-10 flex gap-3.5 items-start group">
                
                <!-- Marker -->
                <button @click="focusStep(step)" 
                        class="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-black text-[11px] shadow-sm border-2 transition-transform active:scale-90"
                        :class="step.isStartPoint ? 'bg-emerald-500 border-emerald-600 text-white' : (idx === daySection.steps.length - 1 ? 'bg-red-500 border-red-600 text-white' : 'bg-white border-blue-500 text-blue-600')">
                  {{ step.isStartPoint ? 'S' : (idx === daySection.steps.length - 1 ? 'K' : idx) }}
                </button>

                <!-- Karta Zgłoszenia -->
                <div class="flex-1 bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-blue-400 transition-all cursor-pointer"
                     @click="focusStep(step)">
                  
                  <!-- Punkt Startowy -->
                  <template v-if="step.isStartPoint">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider"
                            :class="step.isHotelStart ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'">
                        {{ step.isHotelStart ? 'Wyjazd po noclegu' : 'Start z bazy' }}
                      </span>
                    </div>
                    <div class="text-xs font-bold text-slate-800">{{ step.label }}</div>
                  </template>

                  <!-- Zgłoszenie / Naprawa -->
                  <template v-else>
                    <div class="flex justify-between items-start mb-1.5">
                      <div class="flex items-center gap-1.5">
                        <span class="text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {{ step.station?.qp_id || step.station?.public_id || step.ticket?.qp_id || 'QP-?' }}
                        </span>
                        <span class="text-[10px] font-bold text-slate-400">#{{ step.ticket?.ticket_code || step.ticket?.id }}</span>
                      </div>
                      <span v-if="step.legDuration" class="text-[9px] font-black px-1.5 py-0.5 rounded border"
                            :class="step.isSameLocation ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-100'">
                        {{ step.legDuration }}
                      </span>
                    </div>

                    <div class="text-[10px] font-bold text-slate-500 leading-tight mb-2">
                      {{ step.station?.city ? `${step.station.city}, ${step.station.street_number || step.station.street || ''}` : (step.queryAddress || 'Brak adresu') }}
                    </div>

                    <!-- Treść awarii -->
                    <div class="bg-red-50/60 border border-red-100 rounded-lg p-2.5 text-[10px] text-slate-700 mb-2">
                      <div class="font-black text-red-600 mb-0.5">Usterka ze zlecenia:</div>
                      <div class="font-medium text-slate-600 leading-relaxed max-h-20 overflow-y-auto">
                        {{ step.ticket?.description || step.ticket?.opis || step.ticket?.title || step.ticket?.subject || 'Awaria zgłoszona w systemie.' }}
                      </div>
                    </div>

                    <!-- Rekomendacja noclegu -->
                    <div v-if="step.isSuggestedHotelAfter" class="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-800 mb-2">
                      Rekomendowany nocleg w rejonie (kolejny dzień w tej okolicy)
                    </div>

                    <!-- Nawigacja manewrów -->
                    <div v-if="step.navigationSteps && step.navigationSteps.length > 0" class="mt-2 pt-2 border-t border-slate-100" @click.stop>
                      <button 
                        @click="step.showNav = !step.showNav"
                        class="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200"
                      >
                        <span>Wskazówki dojazdu ({{ step.navigationSteps.length }} manewrów)</span>
                        <span>{{ step.showNav ? '▲' : '▼' }}</span>
                      </button>

                      <div v-show="step.showNav" class="mt-1.5 flex flex-col gap-1 max-h-48 overflow-y-auto route-custom-scrollbar p-1.5 bg-slate-50 rounded border">
                        <div v-for="(nav, nIdx) in step.navigationSteps" :key="nIdx" class="flex items-start gap-1.5 text-[10px] py-1 border-b last:border-0 border-slate-200">
                          <span class="text-[11px]">{{ getManeuverIcon(nav.maneuver) }}</span>
                          <span class="flex-1 text-slate-700">{{ nav.instruction }}</span>
                          <span class="text-[9px] font-bold text-slate-400">{{ nav.distanceText }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Link zewnętrzny -->
                    <div class="mt-2 flex justify-end" @click.stop>
                      <a v-if="step.googleMapsUrl" :href="step.googleMapsUrl" target="_blank"
                         class="text-[9px] font-bold text-blue-600 hover:text-blue-800">
                        Otwórz nawigację w telefonie ↗
                      </a>
                    </div>
                  </template>

                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, markRaw, onMounted, onBeforeUnmount } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

const API_KEY = "AIzaSyBuRqG1t0PWyhlBFPy8Ik5caKiVZ900u3c"

setOptions({
  apiKey: API_KEY,
  version: "weekly"
})

const props = defineProps({
  techs: { type: Array, required: true },
  stations: { type: Array, required: true },
  tickets: { type: Array, required: true },
  calendarEvents: { type: Array, default: () => [] }
})

const googleMapRef = ref(null)
const isMapLoading = ref(true)
const isCalculating = ref(false)
const errorMessage = ref('')

const plannerMode = ref('WEEK') 
const accommodationPolicy = ref('SMART_HOTEL') 

const selectedTech = ref('')
const selectedDate = ref('ALL')
const selectedStartType = ref('ZG')
const customStartAddress = ref('')

const activeDayTab = ref('ALL') 
const weekSchedule = ref([])
const totalHotelsSuggested = ref(0)
const estimatedKmSaved = ref(0)

const DAY_COLORS = ['#2563eb', '#9333ea', '#ea580c', '#059669', '#e11d48', '#0891b2']

let mapInstance = null
let globalBounds = null

// Twarde, globalne tablice do całkowitego czyszczenia mapy
let globalMarkers = []
let globalInfoWindows = []
let globalPolylines = []

// Synchronizacja wartości z głównych rozwijanych list HTML do zmiennych Vue
const syncFormValues = () => {
  const techEl = document.getElementById('route-tech-select')
  const dateEl = document.getElementById('route-date-select')
  const startEl = document.getElementById('route-start-select')
  const customEl = document.getElementById('route-custom-address')

  if (techEl) selectedTech.value = techEl.value
  if (dateEl) selectedDate.value = dateEl.value
  if (startEl) selectedStartType.value = startEl.value
  if (customEl) customStartAddress.value = customEl.value
}

// Podział wyświetlanych kroków w prawym panelu
const displayedDaySections = computed(() => {
  if (weekSchedule.value.length === 0) return []
  if (activeDayTab.value === 'ALL') return weekSchedule.value
  const single = weekSchedule.value[activeDayTab.value]
  return single ? [single] : []
})

const currentActiveDayName = computed(() => {
  if (activeDayTab.value === 'ALL') return 'Wszystkie dni'
  return weekSchedule.value[activeDayTab.value]?.dateName || ''
})

const currentStats = computed(() => {
  if (weekSchedule.value.length === 0) return { distance: '', duration: '' }
  if (activeDayTab.value === 'ALL') {
    const totalM = weekSchedule.value.reduce((acc, d) => acc + (d.distanceMeters || 0), 0)
    const totalS = weekSchedule.value.reduce((acc, d) => acc + (d.durationSec || 0), 0)
    return {
      distance: (totalM / 1000).toFixed(1) + ' km',
      duration: formatDuration(totalS)
    }
  }
  const day = weekSchedule.value[activeDayTab.value]
  if (!day) return { distance: '', duration: '' }
  return {
    distance: ((day.distanceMeters || 0) / 1000).toFixed(1) + ' km',
    duration: formatDuration(day.durationSec || 0)
  }
})

const setPlannerMode = (mode) => {
  plannerMode.value = mode
  syncFormValues()
  calculateOptimalRoute()
}

const setAccommodationPolicy = (policy) => {
  accommodationPolicy.value = policy
  syncFormValues()
  calculateOptimalRoute()
}

const setActiveDayTab = (tab) => {
  activeDayTab.value = tab
  updateMapVisibility()
}

const updateMapVisibility = () => {
  if (!mapInstance || weekSchedule.value.length === 0) return

  if (activeDayTab.value === 'ALL') {
    weekSchedule.value.forEach(day => {
      if (day.polyline) day.polyline.setMap(mapInstance)
      day.markers.forEach(m => m.setMap(mapInstance))
    })
    if (globalBounds && !globalBounds.isEmpty()) {
      mapInstance.fitBounds(globalBounds)
    }
  } else {
    const targetIdx = Number(activeDayTab.value)
    weekSchedule.value.forEach((day, idx) => {
      const isTarget = (idx === targetIdx)
      if (day.polyline) day.polyline.setMap(isTarget ? mapInstance : null)
      day.markers.forEach(m => m.setMap(isTarget ? mapInstance : null))
      if (!isTarget) {
        day.infoWindows.forEach(iw => iw.close())
      }
    })
    const current = weekSchedule.value[targetIdx]
    if (current && current.bounds && !current.bounds.isEmpty()) {
      mapInstance.fitBounds(current.bounds)
    }
  }
}

// 100% pewne czyszczenie mapy z poprzednich kalkulacji
const clearAllMapObjects = () => {
  globalMarkers.forEach(m => m.setMap(null))
  globalInfoWindows.forEach(iw => iw.close())
  globalPolylines.forEach(p => p.setMap(null))
  globalMarkers = []
  globalInfoWindows = []
  globalPolylines = []
  weekSchedule.value = []
}

const getManeuverIcon = (maneuver) => {
  if (!maneuver) return '➔'
  const m = String(maneuver).toUpperCase()
  if (m.includes('LEFT')) return '↰'
  if (m.includes('RIGHT')) return '↱'
  if (m.includes('UTURN') || m.includes('ROUNDABOUT')) return '↻'
  return '➔'
}

const createCustomPinSvg = (label, color) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 36 44">
      <defs>
        <filter id="sh" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.25"/>
        </filter>
      </defs>
      <path filter="url(#sh)" d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26c0-9.94-8.06-18-18-18z" fill="${color}"/>
      <circle cx="18" cy="16" r="11" fill="#ffffff"/>
      <text x="18" y="20.5" font-size="11" font-family="-apple-system, sans-serif" font-weight="900" fill="${color}" text-anchor="middle">${label}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const decodePolyline = (encoded) => {
  const points = []
  let index = 0, len = encoded.length
  let lat = 0, lng = 0
  while (index < len) {
    let b, shift = 0, result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lat += ((result & 1) ? ~(result >> 1) : (result >> 1))

    shift = 0
    result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lng += ((result & 1) ? ~(result >> 1) : (result >> 1))

    points.push({ lat: lat / 1e5, lng: lng / 1e5 })
  }
  return points
}

const initGoogleMaps = async () => {
  try {
    const { Map } = await importLibrary('maps')
    mapInstance = new Map(googleMapRef.value, {
      center: { lat: 52.0, lng: 19.0 },
      zoom: 6,
      mapTypeId: 'roadmap',
      disableDefaultUI: true,
      zoomControl: true,
      styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }]
    })
    isMapLoading.value = false
  } catch (e) {
    errorMessage.value = 'Błąd inicjalizacji mapy Google.'
    isMapLoading.value = false
  }
}

const getDistanceBetweenCoords = (lat1, lng1, lat2, lng2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))
}

const getCurrentGpsPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Twoja przeglądarka nie obsługuje geolokalizacji GPS.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error('Brak dostępu do GPS. Zezwól na lokalizację w przeglądarce.')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  })
}

const calculateOptimalRoute = async () => {
  errorMessage.value = ''
  totalHotelsSuggested.value = 0
  estimatedKmSaved.value = 0
  activeDayTab.value = 'ALL'

  if (!mapInstance) return
  isCalculating.value = true
  
  // Ważne: Wyczyszczenie wszystkich starych znaczników
  clearAllMapObjects()

  if (!selectedTech.value) {
    errorMessage.value = 'Proszę najpierw wybrać technika z listy u góry.'
    isCalculating.value = false
    return
  }

  const technicianEvents = props.calendarEvents.filter(ev => String(ev.technician_id) === String(selectedTech.value))

  if (technicianEvents.length === 0) {
    errorMessage.value = 'Wybrany technik nie ma zaplanowanych zadań w harmonogramie.'
    isCalculating.value = false
    return
  }

  const groupedByDate = {}
  technicianEvents.forEach(ev => {
    if (!ev.start_time) return
    
    // NAPRAWA STREFY CZASOWEJ (Rozwiązuje problem cofniętych dni)
    const d = new Date(ev.start_time);
    const dStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    
    // Twarde wymuszenie filtrowania po wybranym dniu z górnego menu
    if (selectedDate.value !== 'ALL' && dStr !== selectedDate.value) return
    
    if (!groupedByDate[dStr]) groupedByDate[dStr] = []
    groupedByDate[dStr].push(ev)
  })

  const allSortedDates = Object.keys(groupedByDate).sort()
  if (allSortedDates.length === 0) {
    errorMessage.value = 'Brak zgłoszeń serwisowych w wybranym terminie.'
    isCalculating.value = false
    return
  }

  // W trybie "1 Dzień" bierzemy tylko wybrany dzień (lub pierwszy najbliższy, jeśli ustawiono "Wszystkie dni")
  const sortedDates = plannerMode.value === 'DAY' ? [allSortedDates[0]] : allSortedDates

  const daysData = []
  sortedDates.forEach(date => {
    const events = groupedByDate[date]
    const routePoints = []
    const seenStationIds = new Set()

    events.forEach(ev => {
      if (!ev.ticket_id) return
      const ticket = props.tickets.find(t => String(t.id) === String(ev.ticket_id) || String(t.ticket_code) === String(ev.ticket_id))
      if (!ticket) return

      const statId = ticket.qp_id || ticket.station_id || 'T_' + ticket.id
      if (seenStationIds.has(statId)) return

      const station = props.stations.find(s => String(s.id) === String(statId) || s.public_id === statId || s.name === statId)
      let lat = null, lng = null, addressStr = ''

      const buildAddress = (street, city, countryHint = '') => {
        const parts = [street, city].map(s => String(s || '').trim()).filter(Boolean)
        if (parts.length === 0) return ''
        const joined = parts.join(', ')
        const upper = (joined + ' ' + countryHint).toUpperCase()
        // Jeśli adres już zawiera kraj albo słowa kluczowe SK/CZ, nie doklejamy "Polska"
        if (upper.includes('POLSK') || upper.includes('SLOVAK') || upper.includes('SLOVENSK') || upper.includes('CZECH') || upper.includes('ČESK') || upper.includes('CESK')) {
          return joined
        }
        return `${joined}, Polska`
      }

      const tCity = ticket?.city || ticket?.miasto || ''
      const tStreet = ticket?.address || ticket?.street || ticket?.ulica || ticket?.adres || ''
      const tCountry = ticket?.country || station?.country || ''

      if (tCity || tStreet) {
        // 1. PRIORYTET: Aktualny adres ze zgłoszenia (geokodowany w locie przez Google)
        addressStr = buildAddress(tStreet, tCity, tCountry)
      } else if (station && station.gps_lat && station.gps_lng) {
        // 2. FALLBACK: GPS z bazy stacji
        const parsedLat = parseFloat(String(station.gps_lat).replace(',', '.'))
        const parsedLng = parseFloat(String(station.gps_lng).replace(',', '.'))
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          lat = parsedLat
          lng = parsedLng
        }
      }

      if (lat === null && addressStr === '' && station && (station.city || station.street || station.street_number)) {
        // 3. FALLBACK: Adres z bazy stacji
        addressStr = buildAddress(station.street_number || station.street, station.city, tCountry)
      }

      if (lat !== null || addressStr !== '') {
        seenStationIds.add(statId)
        routePoints.push({
          ticket,
          station: station || {},
          lat,
          lng,
          queryAddress: addressStr,
          city: tCity || station?.city || ''
        })
      }
    })

    if (routePoints.length > 0) {
      daysData.push({ date, routePoints })
    }
  })

  if (daysData.length === 0) {
    errorMessage.value = 'Żadne ze zgłoszeń nie posiada adresu ani współrzędnych.'
    isCalculating.value = false
    return
  }

  let userGpsCoords = null
  if (selectedStartType.value === 'GPS') {
    try {
      userGpsCoords = await getCurrentGpsPosition()
    } catch (gpsErr) {
      errorMessage.value = gpsErr.message
      isCalculating.value = false
      return
    }
  }

  // Dynamiczna baza do obliczania najdalszego punktu i opłacalności noclegu
  let homeBaseCoords = { lat: 51.9356, lng: 15.5062 } // domyślnie Zielona Góra
  if (selectedStartType.value === 'WAW') {
    homeBaseCoords = { lat: 52.1815, lng: 20.9961 } // Warszawa (Postępu 13)
  } else if (selectedStartType.value === 'GPS' && userGpsCoords) {
    homeBaseCoords = { lat: userGpsCoords.lat, lng: userGpsCoords.lng }
  }

  globalBounds = new window.google.maps.LatLngBounds()
  let carriedOverOrigin = null
  let carriedOverCity = ''

  for (let dIdx = 0; dIdx < daysData.length; dIdx++) {
    const dayEntry = daysData[dIdx]
    const currentDate = dayEntry.date
    const routePoints = dayEntry.routePoints
    const dayColor = DAY_COLORS[dIdx % DAY_COLORS.length]

    let dayOriginWaypoint = null
    let dayOriginLabel = ''
    let isHotelStart = false

    if (accommodationPolicy.value === 'SMART_HOTEL' && carriedOverOrigin) {
      dayOriginWaypoint = carriedOverOrigin
      dayOriginLabel = `Nocleg: ${carriedOverCity}`
      isHotelStart = true
      carriedOverOrigin = null 
    } else {
      if (selectedStartType.value === 'GPS' && userGpsCoords) {
        dayOriginWaypoint = { location: { latLng: { latitude: userGpsCoords.lat, longitude: userGpsCoords.lng } } }
        dayOriginLabel = `Twoja lokalizacja GPS (${userGpsCoords.lat.toFixed(4)}, ${userGpsCoords.lng.toFixed(4)})`
      } else if (selectedStartType.value === 'WAW') {
        dayOriginWaypoint = { address: 'Postępu 13, Warszawa, Polska' }
        dayOriginLabel = 'Biuro EKOEN Warszawa'
      } else if (selectedStartType.value === 'CUSTOM' && customStartAddress.value) {
        dayOriginWaypoint = { address: customStartAddress.value }
        dayOriginLabel = customStartAddress.value
      } else {
        dayOriginWaypoint = { address: 'Rozwojowa 9, Nowy Kisielin, Zielona Góra, Polska' }
        dayOriginLabel = 'Biuro EKOEN Zielona Góra'
      }
    }

    const baseLat = homeBaseCoords.lat
    const baseLng = homeBaseCoords.lng
    let farthestIdx = 0
    let maxDist = -1

    routePoints.forEach((pt, idx) => {
      const pLat = pt.lat || 52.2
      const pLng = pt.lng || 21.0
      const d = Math.hypot(pLat - baseLat, pLng - baseLng)
      if (d > maxDist) {
        maxDist = d
        farthestIdx = idx
      }
    })

    const destinationPoint = routePoints[farthestIdx]
    const destinationWaypoint = destinationPoint.lat !== null
      ? { location: { latLng: { latitude: destinationPoint.lat, longitude: destinationPoint.lng } } }
      : { address: destinationPoint.queryAddress }

    const intermediateWaypoints = []
    const intermediateData = []

    routePoints.forEach((pt, idx) => {
      if (idx !== farthestIdx) {
        intermediateData.push(pt)
        intermediateWaypoints.push(pt.lat !== null
          ? { location: { latLng: { latitude: pt.lat, longitude: pt.lng } } }
          : { address: pt.queryAddress }
        )
      }
    })

    const reqBody = {
      origin: dayOriginWaypoint,
      destination: destinationWaypoint,
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_UNAWARE',
      languageCode: 'pl',
      units: 'METRIC'
    }

    if (intermediateWaypoints.length > 0) {
      reqBody.intermediates = intermediateWaypoints
      reqBody.optimizeWaypointOrder = true
    }

    try {
      const resp = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.duration,routes.legs.distanceMeters,routes.legs.startLocation,routes.legs.endLocation,routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters,routes.optimizedIntermediateWaypointIndex'
        },
        body: JSON.stringify(reqBody)
      })

      const data = await resp.json()
      if (!data.routes || data.routes.length === 0) continue

      const route = data.routes[0]
      const decodedCoords = decodePolyline(route.polyline.encodedPolyline)
      const dayBounds = new window.google.maps.LatLngBounds()

      decodedCoords.forEach(c => {
        dayBounds.extend(c)
        globalBounds.extend(c)
      })

      const poly = new window.google.maps.Polyline({
        path: decodedCoords,
        geodesic: true,
        strokeColor: dayColor,
        strokeOpacity: 0.9,
        strokeWeight: 6,
        map: mapInstance
      })
      globalPolylines.push(poly) // Tracking do pełnego czyszczenia

      const dayMarkers = []
      const dayInfoWindows = []
      const daySteps = []

      const startLoc = { lat: route.legs[0].startLocation.latLng.latitude, lng: route.legs[0].startLocation.latLng.longitude }
      if (!isHotelStart && selectedStartType.value === 'CUSTOM') {
        homeBaseCoords = startLoc
      }

      const startMarker = new window.google.maps.Marker({
        position: startLoc,
        map: mapInstance,
        icon: {
          url: createCustomPinSvg('S', isHotelStart ? '#d97706' : '#16a34a'),
          scaledSize: new window.google.maps.Size(34, 42),
          anchor: new window.google.maps.Point(17, 42)
        },
        title: dayOriginLabel,
        zIndex: 1000
      })
      dayMarkers.push(startMarker)
      globalMarkers.push(startMarker) // Tracking do pełnego czyszczenia

      daySteps.push({
        isStartPoint: true,
        isHotelStart: isHotelStart,
        label: dayOriginLabel,
        marker: markRaw(startMarker)
      })

      route.legs.forEach((leg, lIdx) => {
        let stepData = (lIdx < route.legs.length - 1)
          ? intermediateData[route.optimizedIntermediateWaypointIndex ? route.optimizedIntermediateWaypointIndex[lIdx] : lIdx]
          : destinationPoint

        const legSec = parseInt(String(leg.duration).replace('s', ''), 10) || 0
        const isSame = (leg.distanceMeters || 0) < 50
        const endPos = { lat: leg.endLocation.latLng.latitude, lng: leg.endLocation.latLng.longitude }

        const qp = stepData.station?.qp_id || stepData.station?.public_id || stepData.ticket?.qp_id || 'QP'
        const marker = new window.google.maps.Marker({
          position: endPos,
          map: mapInstance,
          icon: {
            url: createCustomPinSvg(String(lIdx + 1), dayColor),
            scaledSize: new window.google.maps.Size(34, 42),
            anchor: new window.google.maps.Point(17, 42)
          },
          title: `${qp} (#${stepData.ticket?.ticket_code || stepData.ticket?.id})`,
          zIndex: 1001 + lIdx
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="font-family: inherit; padding: 4px; min-width: 200px;">
              <div style="font-weight: 800; color: ${dayColor}; margin-bottom: 2px;">${qp} | ${currentDate}</div>
              <div style="font-size: 11px; font-weight: 700; color: #334155;">${stepData.station?.city || stepData.city || ''}</div>
              <div style="font-size: 10px; color: #dc2626; margin-top: 4px; background: #fef2f2; padding: 4px; border-radius: 4px;">
                ${stepData.ticket?.description || 'Awaria'}
              </div>
            </div>
          `
        })

        marker.addListener('click', () => infoWindow.open({ anchor: marker, map: mapInstance }))
        dayMarkers.push(marker)
        dayInfoWindows.push(infoWindow)
        
        globalMarkers.push(marker)
        globalInfoWindows.push(infoWindow)

        const navSteps = (leg.steps || []).map(s => ({
          instruction: s.navigationInstruction?.instructions || 'Jedź trasą',
          maneuver: s.navigationInstruction?.maneuver || '',
          distanceText: (s.distanceMeters >= 1000) ? `${(s.distanceMeters / 1000).toFixed(1)} km` : `${s.distanceMeters} m`
        }))

        const prevLoc = lIdx === 0 ? startLoc : { lat: route.legs[lIdx-1].endLocation.latLng.latitude, lng: route.legs[lIdx-1].endLocation.latLng.longitude }
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${prevLoc.lat},${prevLoc.lng}&destination=${endPos.lat},${endPos.lng}&travelmode=driving`

        daySteps.push({
          ...stepData,
          legDuration: isSame ? 'Na miejscu' : formatDuration(legSec),
          isSameLocation: isSame,
          navigationSteps: navSteps,
          showNav: false,
          googleMapsUrl: googleMapsUrl,
          marker: markRaw(marker),
          infoWindow: markRaw(infoWindow)
        })
      })

      const lastLegEnd = route.legs[route.legs.length - 1].endLocation.latLng
      const nextDayEntry = daysData[dIdx + 1]

      if (nextDayEntry && accommodationPolicy.value === 'SMART_HOTEL') {
        const nextFirstPt = nextDayEntry.routePoints[0]
        const currentEndCity = (destinationPoint.city || destinationPoint.station?.city || '').toLowerCase().trim()
        const nextCity = (nextFirstPt.city || nextFirstPt.station?.city || '').toLowerCase().trim()

        const distToBase = getDistanceBetweenCoords(lastLegEnd.latitude, lastLegEnd.longitude, homeBaseCoords.lat, homeBaseCoords.lng)
        let isNextNear = false

        if (currentEndCity && nextCity && (currentEndCity.includes(nextCity) || nextCity.includes(currentEndCity))) {
          isNextNear = true
        } else if (nextFirstPt.lat && nextFirstPt.lng) {
          const distToNext = getDistanceBetweenCoords(lastLegEnd.latitude, lastLegEnd.longitude, nextFirstPt.lat, nextFirstPt.lng)
          if (distToNext < 120) isNextNear = true
        } else {
          if (distToBase > 150) isNextNear = true
        }

        if (distToBase > 120 && isNextNear) {
          daySteps[daySteps.length - 1].isSuggestedHotelAfter = true
          totalHotelsSuggested.value++
          estimatedKmSaved.value += Math.round(distToBase * 1.8)

          carriedOverOrigin = { location: { latLng: { latitude: lastLegEnd.latitude, longitude: lastLegEnd.longitude } } }
          carriedOverCity = destinationPoint.city || destinationPoint.station?.city || 'Hotel w trasie'
        }
      }

      const totalDaySec = parseInt(String(route.duration).replace('s', ''), 10) || 0
      const totalDayMeters = route.distanceMeters || 0

      weekSchedule.value.push({
        date: currentDate,
        dateName: new Date(currentDate).toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'numeric' }),
        color: dayColor,
        polyline: markRaw(poly),
        markers: dayMarkers.map(m => markRaw(m)),
        infoWindows: dayInfoWindows.map(iw => markRaw(iw)),
        steps: daySteps,
        bounds: markRaw(dayBounds),
        taskCount: daySteps.length - 1,
        distanceMeters: totalDayMeters,
        durationSec: totalDaySec,
        dayStatsText: `${(totalDayMeters / 1000).toFixed(1)} km | ${formatDuration(totalDaySec)}`
      })

    } catch (e) {
      console.error(`Błąd trasy dla dnia ${currentDate}:`, e)
    }
  }

  if (weekSchedule.value.length > 0) {
    updateMapVisibility()
  }

  isCalculating.value = false
}

const focusStep = (step) => {
  if (step && step.marker) {
    mapInstance.panTo(step.marker.getPosition())
    mapInstance.setZoom(13)
    if (step.infoWindow) step.infoWindow.open({ anchor: step.marker, map: mapInstance })
  }
}

const formatDuration = (sec) => {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

onMounted(() => {
  setTimeout(initGoogleMaps, 300)
  setTimeout(() => {
    const calcBtn = document.getElementById('route-calc-btn')
    
    // Obowiązkowe powiązanie przycisku głównego "Wyznacz Trasę"
    if (calcBtn) {
      calcBtn.addEventListener('click', () => {
        syncFormValues()
        calculateOptimalRoute()
      })
    }
  }, 400)
})

onBeforeUnmount(() => {
  clearAllMapObjects()
})
</script>

<style scoped>
.route-custom-scrollbar::-webkit-scrollbar { width: 5px; }
.route-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.route-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
.route-custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.8); }
</style>