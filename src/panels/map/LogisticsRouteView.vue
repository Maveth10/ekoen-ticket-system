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

      <!-- PASEK BACKLOGU ZGŁOSZEŃ NA MAPIE (pod górnym paskiem nawigacji) -->
      <div v-if="!isMapLoading" class="absolute top-[76px] left-6 z-20 flex items-center gap-2 flex-wrap max-w-[calc(100%-3rem)]">
        <button
          type="button"
          @click="toggleBacklogLayer"
          class="h-9 px-3.5 rounded-xl border shadow-md backdrop-blur-md text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          :class="showBacklogPins
            ? 'bg-slate-900/95 text-white border-slate-800'
            : 'bg-white/95 text-slate-600 border-slate-200 hover:bg-white'"
        >
          <span class="w-2.5 h-2.5 rounded-full" :class="showBacklogPins ? 'bg-red-500 animate-pulse' : 'bg-slate-300'"></span>
          <span>Backlog na mapie ({{ filteredBacklogItems.length }})</span>
        </button>

        <button
          v-if="showBacklogPins && selectedTechId"
          type="button"
          @click="backlogOnlySelectedTech = !backlogOnlySelectedTech"
          class="h-9 px-3 rounded-xl border shadow-md backdrop-blur-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
          :class="backlogOnlySelectedTech
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white/95 text-slate-600 border-slate-200 hover:bg-white'"
          title="Pokaż tylko zgłoszenia przypisane do wybranego technika"
        >
          {{ backlogOnlySelectedTech ? 'Tylko wybrany technik' : 'Wszyscy technicy' }}
        </button>

        <!-- Szybka wyszukiwarka Backlogu (obsługuje również stacje mobilne bez stałego GPS) -->
        <div v-if="showBacklogPins" class="relative" @click.stop>
          <input
            v-model="backlogSearchQuery"
            @focus="showBacklogDropdown = true"
            @input="showBacklogDropdown = true"
            type="text"
            placeholder="Szukaj w backlogu (QP / miasto / mobilne)..."
            class="h-9 w-64 px-3 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-md text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
          <button
            v-if="backlogSearchQuery"
            type="button"
            @click="backlogSearchQuery = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-black cursor-pointer"
          >✕</button>

          <div
            v-if="showBacklogDropdown && searchedBacklogDropdown.length > 0"
            class="absolute left-0 top-full mt-1.5 w-80 max-h-64 overflow-y-auto route-custom-scrollbar bg-white border border-slate-200 rounded-2xl shadow-2xl z-30 divide-y divide-slate-100"
          >
            <div
              v-for="bItem in searchedBacklogDropdown"
              :key="bItem.stopKey"
              @click="selectBacklogFromSearch(bItem)"
              class="p-2.5 hover:bg-blue-50/60 cursor-pointer flex items-start justify-between gap-2"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[11px] font-black font-mono text-slate-800">{{ bItem.qpLabel }}</span>
                  <span v-if="bItem.ticketCodeLabel" class="text-[10px] font-mono font-bold text-slate-400">#{{ bItem.ticketCodeLabel }}</span>
                  <span
                    v-if="bItem.lat === null"
                    class="text-[8.5px] font-black uppercase px-1.5 py-0.2 rounded bg-violet-50 text-violet-700 border border-violet-200"
                  >
                    Adres zlecenia
                  </span>
                </div>
                <div class="text-[10.5px] font-semibold text-slate-500 truncate mt-0.5">{{ bItem.displayAddress }}</div>
              </div>
              <span
                class="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                :style="{ backgroundColor: bItem.pinColor }"
              ></span>
            </div>
          </div>
        </div>
      </div>

      <!-- KARTA WYBRANEGO ZGŁOSZENIA Z BACKLOGU -->
      <div
        v-if="selectedBacklogItem"
        class="absolute top-[124px] left-6 z-30 w-84 bg-white/98 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3 animate-fadeIn"
        @click.stop
      >
        <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-xs font-black font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {{ selectedBacklogItem.qpLabel }}
              </span>
              <span v-if="selectedBacklogItem.ticketCodeLabel" class="text-[11px] font-mono font-bold text-slate-500">
                #{{ selectedBacklogItem.ticketCodeLabel }}
              </span>
              <span
                class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full text-white"
                :style="{ backgroundColor: selectedBacklogItem.pinColor }"
              >
                {{ selectedBacklogItem.statusBadge }}
              </span>
            </div>
            <div class="text-[11px] font-bold text-slate-700 mt-1 leading-snug">
              {{ selectedBacklogItem.displayAddress }}
            </div>
          </div>
          <button
            type="button"
            @click="selectedBacklogItem = null"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
          >✕</button>
        </div>

        <div class="text-[10.5px] text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 max-h-24 overflow-y-auto route-custom-scrollbar leading-relaxed">
          {{ selectedBacklogItem.issueDescription }}
        </div>

        <div class="flex items-center justify-between gap-2 text-[10px] font-bold text-slate-500">
          <span>Dzień trasy:</span>
          <input
            type="date"
            v-model="adHocTargetDate"
            class="h-7 px-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div class="flex gap-2 pt-0.5">
          <button
            type="button"
            @click="addBacklogItemToRoute(selectedBacklogItem, false)"
            class="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
          >
            + Dorzuć do trasy
          </button>
          <button
            v-if="selectedTechId"
            type="button"
            @click="addBacklogItemToRoute(selectedBacklogItem, true)"
            class="py-2 px-3 rounded-xl bg-[#58b347] hover:bg-[#499b3a] text-white text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            title="Dodaj do trasy i od razu zapisz wizytę w Harmonogramie"
          >
            + Do grafiku
          </button>
        </div>
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

        <!-- OPCJE TRASY: NOCLEGI ORAZ POWRÓT DO BAZY -->
        <div class="pt-3 border-t border-slate-200/70 flex flex-col gap-2">
          <div v-if="plannerMode === 'WEEK'" class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Opcje noclegowe:
            </span>
            <div class="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300">
              <button 
                type="button"
                @click="setAccommodationPolicy('SMART_HOTEL')"
                class="px-2.5 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer"
                :class="accommodationPolicy === 'SMART_HOTEL' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                title="Pozwalaj na hotel, gdy kolejny dzień jest w tym samym rejonie"
              >
                Smart Hotel
              </button>
              <button 
                type="button"
                @click="setAccommodationPolicy('HOME_ONLY')"
                class="px-2.5 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer"
                :class="accommodationPolicy === 'HOME_ONLY' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                title="Każdy dzień startuje z bazy domowej"
              >
                Baza domowa
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              Powrót do bazy:
            </span>
            <div class="flex bg-slate-200/80 p-0.5 rounded-lg border border-slate-300">
              <button
                type="button"
                @click="setReturnToBase(true)"
                class="px-2.5 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer"
                :class="includeReturnToBase ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                title="Wlicz powrót do bazy domowej (chyba że wypadnie nocleg w trasie)"
              >
                Wlicz powrót
              </button>
              <button
                type="button"
                @click="setReturnToBase(false)"
                class="px-2.5 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer"
                :class="!includeReturnToBase ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'"
                title="Zakończ kalkulację na ostatniej stacji"
              >
                Tylko dojazd
              </button>
            </div>
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

      <!-- PASEK POMINIĘTYCH WIZYT / SYMULACJI -->
      <div
        v-if="excludedStopKeys.length > 0 || adHocStops.length > 0"
        class="px-5 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 text-[10px] font-bold shrink-0"
      >
        <div class="text-slate-600 flex items-center gap-2 flex-wrap">
          <span v-if="adHocStops.length > 0" class="text-emerald-700 font-black">
            +{{ adHocStops.length }} z Backlogu
          </span>
          <span v-if="excludedStopKeys.length > 0" class="text-rose-600 font-black">
            Pominięto: {{ excludedStopKeys.length }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="excludedStopKeys.length > 0"
            type="button"
            @click="restoreExcludedStops"
            class="px-2 py-0.5 rounded bg-white border border-slate-300 hover:border-blue-400 text-slate-700 font-black uppercase cursor-pointer"
          >
            Przywróć pominięte
          </button>
          <button
            v-if="adHocStops.length > 0"
            type="button"
            @click="clearAdHocStops"
            class="px-2 py-0.5 rounded bg-white border border-slate-300 hover:border-rose-400 text-rose-600 font-black uppercase cursor-pointer"
          >
            Wyczyść symulację
          </button>
        </div>
      </div>

      <!-- Lista Kroków i Wskazówek -->
      <div class="flex-1 overflow-y-auto route-custom-scrollbar p-5 bg-slate-50 relative">
        
        <div v-if="weekSchedule.length === 0 && !isCalculating" class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-60">
          <svg class="w-12 h-12 text-slate-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Brak aktywnej trasy</p>
          <p class="text-[10px] font-medium text-slate-400 mt-1">
            Wybierz technika i kliknij „Wyznacz Trasę” lub kliknij dowolne zgłoszenie z Backlogu na mapie (+ Dorzuć do trasy).
          </p>
        </div>

        <div v-else-if="isCalculating" class="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">Optymalizacja i analiza trasy...</p>
        </div>

        <!-- LISTA ETAPÓW -->
        <div v-else class="flex flex-col gap-6">
          <div v-for="(daySection, sIdx) in displayedDaySections" :key="sIdx" class="flex flex-col gap-3 relative">
            
            <!-- Nagłówek Dnia + Tryb Kolejności -->
            <div class="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: daySection.color }"></span>
                <span class="text-xs font-black text-slate-800 uppercase tracking-wider">{{ daySection.dateName }} ({{ daySection.date }})</span>
                <button
                  v-if="daySection.isManualOrder"
                  type="button"
                  @click="resetDayManualOrder(daySection.date)"
                  class="px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[9px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                  title="Przywróć automatyczną optymalizację kolejności Google"
                >
                  Ręczna • Włącz Auto ↻
                </button>
              </div>
              <span class="text-[10px] font-bold text-slate-500">{{ daySection.dayStatsText }}</span>
            </div>

            <!-- Krok po kroku -->
            <div class="relative flex flex-col gap-3">
              <div class="absolute left-3.5 top-5 bottom-5 w-0.5 bg-blue-200 z-0"></div>

              <div v-for="(step, idx) in daySection.steps" :key="idx" class="relative z-10 flex gap-3.5 items-start group">
                
                <!-- Marker zgodny z numeracją pinezek na mapie -->
                <button
                  type="button"
                  @click="focusStep(step)"
                  class="w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-black text-[11px] shadow-sm border-2 transition-transform active:scale-90 cursor-pointer"
                  :class="step.isStartPoint
                    ? (step.isHotelStart ? 'bg-amber-500 border-amber-600 text-white' : 'bg-emerald-500 border-emerald-600 text-white')
                    : (step.isReturnPoint ? 'bg-slate-800 border-slate-900 text-white' : (step.isAdHoc ? 'bg-emerald-50 border-emerald-600 text-emerald-800' : 'bg-white border-blue-600 text-blue-700'))"
                >
                  {{ step.isStartPoint ? 'S' : (step.isReturnPoint ? 'B' : step.stopNumber) }}
                </button>

                <!-- Karta Kroku -->
                <div
                  class="flex-1 bg-white border rounded-xl p-3 shadow-sm hover:border-blue-400 transition-all cursor-pointer"
                  :class="step.isAdHoc ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-slate-200'"
                  @click="focusStep(step)"
                >
                  <!-- 1. Punkt Startowy -->
                  <template v-if="step.isStartPoint">
                    <div class="flex items-center justify-between mb-1">
                      <span
                        class="text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider"
                        :class="step.isHotelStart ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'"
                      >
                        {{ step.isHotelStart ? 'Wyjazd po noclegu' : 'Start trasy' }}
                      </span>
                    </div>
                    <div class="text-xs font-bold text-slate-800">{{ step.label }}</div>
                  </template>

                  <!-- 2. Punkt Powrotu do Bazy -->
                  <template v-else-if="step.isReturnPoint">
                    <div class="flex items-center justify-between mb-1 gap-2">
                      <span class="text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider bg-slate-100 text-slate-700 border-slate-300">
                        Powrót do bazy
                      </span>
                      <span class="text-[9px] font-black px-1.5 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200">
                        {{ step.legDistanceText }} • {{ step.legDuration }}
                      </span>
                    </div>
                    <div class="text-xs font-bold text-slate-800">{{ step.label }}</div>
                    <div v-if="step.googleMapsUrl" class="mt-1.5 flex justify-end" @click.stop>
                      <a :href="step.googleMapsUrl" target="_blank" rel="noopener noreferrer" class="text-[9px] font-bold text-blue-600 hover:text-blue-800">
                        Nawiguj powrót ↗
                      </a>
                    </div>
                  </template>

                  <!-- 3. Stacja / Zgłoszenie Serwisowe -->
                  <template v-else>
                    <div class="flex justify-between items-start mb-1.5 gap-2">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-[11px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-mono">
                          {{ step.qpLabel }}
                        </span>
                        <span v-if="step.ticketCodeLabel" class="text-[10px] font-bold text-slate-400 font-mono">
                          #{{ step.ticketCodeLabel }}
                        </span>
                        <span
                          v-if="step.isAdHoc && !step.savedInHarm"
                          class="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
                        >
                          Symulacja
                        </span>
                        <span
                          v-else-if="step.savedInHarm"
                          class="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white"
                        >
                          ✓ W grafiku
                        </span>
                        <span
                          v-if="step.usedTicketAddress"
                          class="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200"
                          title="Lokalizacja pobrana priorytetowo ze zgłoszenia (obsługa stacji mobilnych)"
                        >
                          Adres ze zgłoszenia
                        </span>
                      </div>

                      <!-- Przyciski sterowania przystankiem: ↑ ↓ ✕ -->
                      <div class="flex items-center gap-0.5 shrink-0" @click.stop>
                        <button
                          v-if="step.totalDayStops > 1"
                          type="button"
                          :disabled="step.stopNumber <= 1"
                          @click="moveStopOrder(daySection, step.stopNumber - 1, -1)"
                          class="w-5 h-5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-25 text-[11px] font-black flex items-center justify-center cursor-pointer disabled:cursor-default"
                          title="Przesuń przystanek wcześniej"
                        >↑</button>
                        <button
                          v-if="step.totalDayStops > 1"
                          type="button"
                          :disabled="step.stopNumber >= step.totalDayStops"
                          @click="moveStopOrder(daySection, step.stopNumber - 1, 1)"
                          class="w-5 h-5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-25 text-[11px] font-black flex items-center justify-center cursor-pointer disabled:cursor-default"
                          title="Przesuń przystanek później"
                        >↓</button>
                        <button
                          type="button"
                          @click="excludeOrRemoveStop(step)"
                          class="w-5 h-5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 text-[11px] font-black flex items-center justify-center cursor-pointer"
                          :title="step.isAdHoc ? 'Usuń z symulacji trasy' : 'Pomiń tymczasowo w kalkulacji trasy'"
                        >✕</button>
                      </div>
                    </div>

                    <div class="flex items-center justify-between gap-2 mb-2">
                      <div class="text-[10.5px] font-bold text-slate-600 leading-tight">
                        {{ step.displayAddress }}
                      </div>
                      <span
                        v-if="step.legDuration"
                        class="text-[9px] font-black px-1.5 py-0.5 rounded border shrink-0"
                        :class="step.isSameLocation ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-100'"
                      >
                        {{ step.legDistanceText ? `${step.legDistanceText} • ` : '' }}{{ step.legDuration }}
                      </span>
                    </div>

                    <!-- Treść awarii -->
                    <div class="bg-red-50/60 border border-red-100 rounded-lg p-2.5 text-[10px] text-slate-700 mb-2">
                      <div class="font-black text-red-600 mb-0.5">Zakres / Usterka:</div>
                      <div class="font-medium text-slate-600 leading-relaxed max-h-20 overflow-y-auto">
                        {{ step.issueDescription }}
                      </div>
                    </div>

                    <!-- Rekomendacja noclegu -->
                    <div v-if="step.isSuggestedHotelAfter" class="p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-bold text-amber-800 mb-2">
                      Rekomendowany nocleg w rejonie (kolejny dzień w tej okolicy)
                    </div>

                    <!-- Nawigacja manewrów -->
                    <div v-if="step.navigationSteps && step.navigationSteps.length > 0" class="mt-2 pt-2 border-t border-slate-100" @click.stop>
                      <button
                        type="button"
                        @click="step.showNav = !step.showNav"
                        class="w-full flex items-center justify-between px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200 cursor-pointer"
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

                    <!-- Dolne akcje karty: Zapis do Harmonogramu + Nawigacja odcinka -->
                    <div class="mt-2 flex items-center justify-between gap-2" @click.stop>
                      <button
                        v-if="step.isAdHoc && !step.savedInHarm"
                        type="button"
                        @click="saveAdHocStopToSchedule(step)"
                        class="px-2.5 py-1 rounded-lg bg-[#58b347] hover:bg-[#499b3a] text-white text-[9.5px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        + Zapisz w grafiku ({{ step.dayDate }})
                      </button>
                      <span v-else></span>

                      <a
                        v-if="step.googleMapsUrl"
                        :href="step.googleMapsUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-[9px] font-bold text-blue-600 hover:text-blue-800 ml-auto"
                      >
                        Nawiguj ten odcinek ↗
                      </a>
                    </div>
                  </template>
                </div>

              </div>
            </div>

            <!-- ZBIORCZY PRZYCISK GOOGLE MAPS NA CAŁY DZIEŃ (wielopunktowa trasa) -->
            <div v-if="daySection.fullDayMapsUrls && daySection.fullDayMapsUrls.length > 0" class="pt-1 flex flex-col gap-1.5">
              <a
                v-for="(gLink, gIdx) in daySection.fullDayMapsUrls"
                :key="gIdx"
                :href="gLink.url"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full py-2.5 px-4 rounded-xl bg-[#58b347] hover:bg-[#499b3a] text-white text-[11px] font-black uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{{ gLink.label }}</span>
              </a>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, markRaw, onMounted, onBeforeUnmount } from 'vue'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { useScheduleStore } from '../../stores/useScheduleStore'

const API_KEY = "AIzaSyBuRqG1t0PWyhlBFPy8Ik5caKiVZ900u3c"

setOptions({
  apiKey: API_KEY,
  version: "weekly"
})

const props = defineProps({
  techs: { type: Array, required: true },
  stations: { type: Array, required: true },
  tickets: { type: Array, required: true },
  calendarEvents: { type: Array, default: () => [] },
  selectedTechId: { type: String, default: '' },
  selectedDate: { type: String, default: 'ALL' },
  startType: { type: String, default: 'ZG' },
  customStartAddress: { type: String, default: '' }
})

const scheduleStore = useScheduleStore()

const googleMapRef = ref(null)
const isMapLoading = ref(true)
const isCalculating = ref(false)
const errorMessage = ref('')

const plannerMode = ref('WEEK')
const accommodationPolicy = ref('SMART_HOTEL')
const includeReturnToBase = ref(true)

const activeDayTab = ref('ALL')
const weekSchedule = ref([])
const totalHotelsSuggested = ref(0)
const estimatedKmSaved = ref(0)

// --- STAN TRYBU DYSPOZYTORSKIEGO (ETAP 2: BACKLOG + SYMULACJA + KOLEJNOŚĆ RĘCZNA) ---
const todayIsoStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const showBacklogPins = ref(true)
const backlogOnlySelectedTech = ref(false)
const backlogSearchQuery = ref('')
const showBacklogDropdown = ref(false)
const selectedBacklogItem = ref(null)
const adHocTargetDate = ref(todayIsoStr())

const adHocStops = ref([]) // [{ stopKey, date, pointData, savedInHarm }]
const excludedStopKeys = ref([]) // [stopKey]
const manualOrderByDate = ref({}) // { [date]: [stopKey, ...] }

const DAY_COLORS = ['#2563eb', '#9333ea', '#ea580c', '#059669', '#e11d48', '#0891b2']

let mapInstance = null
let globalBounds = null
let globalMarkers = []
let globalInfoWindows = []
let globalPolylines = []
let dayMapObjects = []
let backlogMarkers = []

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

// Aktualizacja domyślnej daty dla dorzucanych przystanków z Backlogu
watch(
  () => [props.selectedDate, activeDayTab.value, weekSchedule.value.length],
  () => {
    if (activeDayTab.value !== 'ALL' && weekSchedule.value[activeDayTab.value]?.date) {
      adHocTargetDate.value = weekSchedule.value[activeDayTab.value].date
    } else if (props.selectedDate && props.selectedDate !== 'ALL') {
      adHocTargetDate.value = props.selectedDate
    } else if (weekSchedule.value[0]?.date) {
      adHocTargetDate.value = weekSchedule.value[0].date
    }
  }
)

const setPlannerMode = (mode) => {
  plannerMode.value = mode
  if (weekSchedule.value.length > 0 || adHocStops.value.length > 0) calculateOptimalRoute()
}

const setAccommodationPolicy = (policy) => {
  accommodationPolicy.value = policy
  if (weekSchedule.value.length > 0 || adHocStops.value.length > 0) calculateOptimalRoute()
}

const setReturnToBase = (val) => {
  if (includeReturnToBase.value === val) return
  includeReturnToBase.value = val
  if (weekSchedule.value.length > 0 || adHocStops.value.length > 0) calculateOptimalRoute()
}

const setActiveDayTab = (tab) => {
  activeDayTab.value = tab
  updateMapVisibility()
}

const updateMapVisibility = () => {
  if (!mapInstance || dayMapObjects.length === 0) return
  globalInfoWindows.forEach(iw => iw.close())

  if (activeDayTab.value === 'ALL') {
    dayMapObjects.forEach(dayObj => {
      if (dayObj.polyline) dayObj.polyline.setVisible(true)
      dayObj.markers.forEach(m => m.setVisible(true))
    })
    if (globalBounds && !globalBounds.isEmpty()) {
      mapInstance.fitBounds(globalBounds)
    }
  } else {
    const targetIdx = Number(activeDayTab.value)
    dayMapObjects.forEach((dayObj, idx) => {
      const isTarget = (idx === targetIdx)
      if (dayObj.polyline) dayObj.polyline.setVisible(isTarget)
      dayObj.markers.forEach(m => m.setVisible(isTarget))
    })
    const current = dayMapObjects[targetIdx]
    if (current && current.bounds && !current.bounds.isEmpty()) {
      mapInstance.fitBounds(current.bounds)
    }
  }
}

const clearAllMapObjects = () => {
  globalMarkers.forEach(m => m.setMap(null))
  globalInfoWindows.forEach(iw => iw.close())
  globalPolylines.forEach(p => p.setMap(null))
  globalMarkers = []
  globalInfoWindows = []
  globalPolylines = []
  dayMapObjects = []
  weekSchedule.value = []
}

const clearBacklogMarkers = () => {
  backlogMarkers.forEach(m => m.setMap(null))
  backlogMarkers = []
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

const createBacklogPinSvg = (symbol, color) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="32" viewBox="0 0 28 34">
      <path d="M14 1C6.82 1 1 6.82 1 14c0 9.6 13 19 13 19s13-9.4 13-19C27 6.82 21.18 1 14 1z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <text x="14" y="18" font-size="12" font-family="-apple-system, sans-serif" font-weight="900" fill="#ffffff" text-anchor="middle">${symbol}</text>
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

const cleanPlaceValue = (val) => {
  const s = String(val || '').trim()
  if (!s) return ''
  const low = s.toLowerCase()
  if (['-', 'brak', 'brak adresu', 'brak danych', 'nieznane miasto', 'null', 'undefined'].includes(low)) return ''
  return s
}

const getShortQpCode = (rawQp) => {
  const s = cleanPlaceValue(rawQp)
  if (!s) return ''
  const parts = s.split('-')
  return parts.length >= 2 ? `${parts[0]}-${parts[1]}`.toUpperCase() : s.toUpperCase()
}

const buildSearchAddress = (street, city, countryHint = '') => {
  const sClean = cleanPlaceValue(street)
  const cClean = cleanPlaceValue(city)
  const parts = []
  if (sClean) parts.push(sClean)
  if (cClean && (!sClean || !sClean.toLowerCase().includes(cClean.toLowerCase()))) {
    parts.push(cClean)
  }
  if (parts.length === 0) return ''
  const joined = parts.join(', ')
  const upper = `${joined} ${countryHint}`.toUpperCase()
  if (upper.includes('POLSK') || upper.includes('SLOVAK') || upper.includes('SLOVENSK') || upper.includes('CZECH') || upper.includes('ČESK') || upper.includes('CESK')) {
    return joined
  }
  return `${joined}, Polska`
}

// Wspólny ekstraktor danych lokalizacyjnych ze zgłoszenia i stacji (Priorytet #1: adres ze zgłoszenia)
const buildRoutePointFromTicket = (ticket, stationFallback = null, fallbackTitle = '') => {
  const rawQp = ticket?.qp_id || ticket?.station_id || ticket?.t_qp || ''
  const shortQp = getShortQpCode(rawQp)

  const station = stationFallback || (shortQp
    ? props.stations.find(s =>
        getShortQpCode(s.public_id || s.name || '') === shortQp ||
        String(s.id).toLowerCase() === shortQp.toLowerCase()
      )
    : null)

  if (!ticket && !station) return null

  const ticketCode = ticket
    ? (ticket.ekoen_code || ticket.ticket_code || ticket.ticket_number || ticket.t_code || ticket.id || ticket.t_id || '')
    : ''

  let stationApproxLat = null, stationApproxLng = null
  const rawLat = ticket?.gps_lat || station?.gps_lat
  const rawLng = ticket?.gps_lng || station?.gps_lng
  if (rawLat && rawLng) {
    const pLat = parseFloat(String(rawLat).replace(',', '.'))
    const pLng = parseFloat(String(rawLng).replace(',', '.'))
    if (!isNaN(pLat) && !isNaN(pLng) && pLat !== 0 && pLng !== 0) {
      stationApproxLat = pLat
      stationApproxLng = pLng
    }
  }

  const tCity = cleanPlaceValue(ticket?.city || ticket?.miasto || '')
  const tStreet = cleanPlaceValue(ticket?.address || ticket?.street || ticket?.ulica || ticket?.adres || ticket?.t_address || '')
  const tCountry = cleanPlaceValue(ticket?.country || station?.country || '')

  let lat = null, lng = null, addressStr = '', usedTicketAddress = false

  // PRIORYTET #1: Adres ze zgłoszenia (obsługa stacji mobilnych)
  if (tCity || tStreet) {
    addressStr = buildSearchAddress(tStreet, tCity, tCountry)
    usedTicketAddress = true
  }
  // PRIORYTET #2: GPS z bazy stacji
  else if (stationApproxLat !== null && stationApproxLng !== null) {
    lat = stationApproxLat
    lng = stationApproxLng
  }
  // PRIORYTET #3: Adres z bazy stacji
  else if (station && (station.city || station.street || station.street_number)) {
    addressStr = buildSearchAddress(station.street_number || station.street, station.city, tCountry)
  }

  if (lat === null && !addressStr) return null

  const stopKey = usedTicketAddress
    ? `${shortQp || ticketCode}|${addressStr.toLowerCase()}`
    : (shortQp || `T_${ticketCode}`)

  const displayAddress = usedTicketAddress
    ? [tCity, tStreet].filter(Boolean).join(', ')
    : (station?.city ? `${station.city}${station.street_number || station.street ? ', ' + (station.street_number || station.street) : ''}` : (addressStr || 'Współrzędne GPS'))

  const issueDescription = cleanPlaceValue(
    ticket?.description || ticket?.opis || ticket?.t_desc || ticket?.title || ticket?.subject || ticket?.t_title || fallbackTitle
  ) || 'Zgłoszenie serwisowe.'

  return {
    stopKey,
    ticket: ticket || {},
    station: station || {},
    qpLabel: shortQp || 'ZLECENIE',
    ticketCodeLabel: String(ticketCode).replace(/^#/, ''),
    displayAddress,
    issueDescription,
    usedTicketAddress,
    lat,
    lng,
    approxLat: lat ?? stationApproxLat,
    approxLng: lng ?? stationApproxLng,
    queryAddress: addressStr,
    city: tCity || cleanPlaceValue(station?.city || '')
  }
}

// =========================================================
// WARSTWA BACKLOGU ZGŁOSZEŃ NA MAPIE LOGISTYCZNEJ
// =========================================================
const isTicketClosedOrDone = (t) => {
  const st = String(t.status || t.t_status || '').toLowerCase()
  const intSt = String(t.ticket_status || '').toLowerCase()
  if (
    st.includes('zamknięt') || st.includes('zakończ') || st.includes('closed') ||
    st.includes('cancel') || st.includes('anulowan') || st.includes('zrealizowano')
  ) return true
  if (
    intSt.includes('wykonano') ||
    (intSt.includes('rozliczone') && !intSt.includes('nierozliczone'))
  ) return true
  return false
}

const scheduledFutureTicketRefs = computed(() => {
  const today = todayIsoStr()
  const set = new Set()
  ;(props.calendarEvents || []).forEach(ev => {
    const evType = String(ev.event_type || ev.extendedProps?.event_type || '').toLowerCase()
    if (evType === 'absence') return
    const dStr = String(ev.start_time || '').substring(0, 10)
    if (dStr && dStr >= today && ev.ticket_id) {
      set.add(String(ev.ticket_id).replace(/^#/, '').trim().toLowerCase())
    }
  })
  return set
})

const activeRouteStopKeys = computed(() => {
  const set = new Set()
  adHocStops.value.forEach(s => set.add(s.stopKey))
  weekSchedule.value.forEach(day => {
    ;(day.stopKeysOrder || []).forEach(k => set.add(k))
  })
  return set
})

const filteredBacklogItems = computed(() => {
  const scheduledSet = scheduledFutureTicketRefs.value
  const inRouteSet = activeRouteStopKeys.value
  const seenKeys = new Set()

  const selTechObj = props.selectedTechId
    ? props.techs.find(t => String(t.id) === String(props.selectedTechId))
    : null
  const selTechIdLow = String(props.selectedTechId || '').toLowerCase().trim()
  const selTechNameLow = String(selTechObj?.name || '').toLowerCase().trim()

  const result = []

  ;(props.tickets || []).forEach(t => {
    if (isTicketClosedOrDone(t)) return

    const refs = [t.id, t.ticket_code, t.ticket_number, t.ekoen_code, t.t_id, t.t_code]
      .filter(Boolean)
      .map(x => String(x).replace(/^#/, '').trim().toLowerCase())

    if (refs.some(r => scheduledSet.has(r))) return

    if (backlogOnlySelectedTech.value && selTechIdLow) {
      const tTech = String(t.technician_id || t.techName || '').toLowerCase().trim()
      const matchesTech = (tTech === selTechIdLow) || (selTechNameLow && tTech.includes(selTechNameLow))
      if (!matchesTech) return
    }

    const pt = buildRoutePointFromTicket(t)
    if (!pt || inRouteSet.has(pt.stopKey) || seenKeys.has(pt.stopKey)) return
    seenKeys.add(pt.stopKey)

    const intStLow = String(t.ticket_status || t.status || '').toLowerCase()
    let pinColor = '#dc2626'
    let pinSymbol = '!'
    let statusBadge = 'Do realizacji'

    if (intStLow.includes('części') || intStLow.includes('czesci')) {
      pinColor = '#d97706'
      pinSymbol = 'C'
      statusBadge = 'Czeka na części'
    } else if (String(t.category || '').toLowerCase().includes('przegl')) {
      pinColor = '#0284c7'
      pinSymbol = 'P'
      statusBadge = 'Przegląd'
    }

    result.push({
      ...pt,
      mapLat: pt.approxLat,
      mapLng: pt.approxLng,
      pinColor,
      pinSymbol,
      statusBadge
    })
  })

  return result
})

const searchedBacklogDropdown = computed(() => {
  const q = backlogSearchQuery.value.toLowerCase().trim()
  const list = filteredBacklogItems.value
  if (!q) return list.slice(0, 12)
  return list
    .filter(b => `${b.qpLabel} ${b.ticketCodeLabel} ${b.displayAddress} ${b.issueDescription}`.toLowerCase().includes(q))
    .slice(0, 15)
})

const renderBacklogMarkers = () => {
  clearBacklogMarkers()
  if (!mapInstance || !showBacklogPins.value || !window.google?.maps) return

  filteredBacklogItems.value.forEach(item => {
    if (item.mapLat === null || item.mapLng === null) return

    const marker = new window.google.maps.Marker({
      position: { lat: item.mapLat, lng: item.mapLng },
      map: mapInstance,
      icon: {
        url: createBacklogPinSvg(item.pinSymbol, item.pinColor),
        scaledSize: new window.google.maps.Size(26, 32),
        anchor: new window.google.maps.Point(13, 32)
      },
      title: `[BACKLOG] ${item.qpLabel} — ${item.displayAddress}`,
      zIndex: 500
    })

    marker.addListener('click', () => {
      globalInfoWindows.forEach(iw => iw.close())
      selectedBacklogItem.value = item
      showBacklogDropdown.value = false
    })

    backlogMarkers.push(marker)
  })
}

watch(
  () => [showBacklogPins.value, filteredBacklogItems.value.length, backlogOnlySelectedTech.value],
  () => renderBacklogMarkers()
)

const toggleBacklogLayer = () => {
  showBacklogPins.value = !showBacklogPins.value
  if (!showBacklogPins.value) selectedBacklogItem.value = null
  renderBacklogMarkers()
}

const selectBacklogFromSearch = (bItem) => {
  selectedBacklogItem.value = bItem
  showBacklogDropdown.value = false
  if (mapInstance && bItem.mapLat !== null && bItem.mapLng !== null) {
    mapInstance.panTo({ lat: bItem.mapLat, lng: bItem.mapLng })
    mapInstance.setZoom(12)
  }
}

const addBacklogItemToRoute = async (bItem, alsoSaveInHarmonogram = false) => {
  if (!bItem) return
  const targetDate = adHocTargetDate.value || todayIsoStr()

  if (!adHocStops.value.some(s => s.stopKey === bItem.stopKey && s.date === targetDate)) {
    adHocStops.value.push({
      stopKey: bItem.stopKey,
      date: targetDate,
      pointData: { ...bItem, isAdHoc: true, savedInHarm: false },
      savedInHarm: false
    })
  }

  selectedBacklogItem.value = null

  if (alsoSaveInHarmonogram) {
    await persistStopInHarmonogram(bItem, targetDate, adHocStops.value.length)
    const added = adHocStops.value.find(s => s.stopKey === bItem.stopKey && s.date === targetDate)
    if (added) added.savedInHarm = true
  }

  await calculateOptimalRoute()
}

const persistStopInHarmonogram = async (pt, dateStr, seqIndex = 1) => {
  const activeTechId = props.selectedTechId || document.getElementById('route-tech-select')?.value || ''
  if (!activeTechId) {
    alert('Wybierz najpierw technika z paska u góry, aby zapisać wizytę w Harmonogramie.')
    return false
  }

  const startHour = Math.min(18, 6 + (Math.max(1, seqIndex) * 2))
  const endHour = Math.min(20, startHour + 2)
  const pad = n => String(n).padStart(2, '0')
  const t = pt.ticket || {}

  await scheduleStore.saveEventToCloud({
    id: 'temp_' + Date.now(),
    ticket_id: String(t.ticket_code || t.ekoen_code || t.ticket_number || t.id || ''),
    technician_id: activeTechId,
    title: [pt.qpLabel !== 'ZLECENIE' ? pt.qpLabel : '', pt.city, t.title || t.subject || ''].filter(Boolean).join(' • ') || 'Wizyta serwisowa',
    description: pt.issueDescription || '',
    start_time: `${dateStr}T${pad(startHour)}:00:00`,
    end_time: `${dateStr}T${pad(endHour)}:00:00`,
    event_type: 'service',
    event_subtype: t.category || 'Awaria',
    all_day: 'NIE'
  })

  return true
}

const saveAdHocStopToSchedule = async (step) => {
  const ok = await persistStopInHarmonogram(step, step.dayDate, step.stopNumber || 1)
  if (!ok) return
  step.savedInHarm = true
  const adHocEntry = adHocStops.value.find(s => s.stopKey === step.stopKey && s.date === step.dayDate)
  if (adHocEntry) adHocEntry.savedInHarm = true
}

// =========================================================
// RĘCZNA KOLEJNOŚĆ PRZYSTANKÓW (↑ / ↓) ORAZ POMIJANIE (✕)
// =========================================================
const moveStopOrder = (daySection, currentIdx, dir) => {
  const targetIdx = currentIdx + dir
  const keys = [...(daySection.stopKeysOrder || [])]
  if (targetIdx < 0 || targetIdx >= keys.length) return

  const temp = keys[currentIdx]
  keys[currentIdx] = keys[targetIdx]
  keys[targetIdx] = temp

  manualOrderByDate.value = {
    ...manualOrderByDate.value,
    [daySection.date]: keys
  }
  calculateOptimalRoute()
}

const resetDayManualOrder = (dateStr) => {
  const next = { ...manualOrderByDate.value }
  delete next[dateStr]
  manualOrderByDate.value = next
  calculateOptimalRoute()
}

const excludeOrRemoveStop = (step) => {
  if (step.isAdHoc) {
    adHocStops.value = adHocStops.value.filter(s => !(s.stopKey === step.stopKey && s.date === step.dayDate))
  } else if (!excludedStopKeys.value.includes(step.stopKey)) {
    excludedStopKeys.value.push(step.stopKey)
  }
  calculateOptimalRoute()
}

const restoreExcludedStops = () => {
  excludedStopKeys.value = []
  calculateOptimalRoute()
}

const clearAdHocStops = () => {
  adHocStops.value = []
  calculateOptimalRoute()
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
    mapInstance.addListener('click', () => {
      globalInfoWindows.forEach(iw => iw.close())
      selectedBacklogItem.value = null
      showBacklogDropdown.value = false
    })
    isMapLoading.value = false
    renderBacklogMarkers()
  } catch (e) {
    errorMessage.value = 'Błąd inicjalizacji mapy Google.'
    isMapLoading.value = false
  }
}

const getDistanceBetweenCoords = (lat1, lng1, lat2, lng2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

const getCurrentGpsPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Twoja przeglądarka nie obsługuje geolokalizacji GPS.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('Brak dostępu do GPS. Zezwól na lokalizację w przeglądarce.')),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  })
}

const buildFullDayGoogleMapsUrls = (orderedCoords, dateLabel) => {
  if (!Array.isArray(orderedCoords) || orderedCoords.length < 2) return []
  const urls = []
  const maxLegsPerUrl = 10

  for (let startIdx = 0; startIdx < orderedCoords.length - 1; startIdx += maxLegsPerUrl) {
    const slice = orderedCoords.slice(startIdx, startIdx + maxLegsPerUrl + 1)
    if (slice.length < 2) break
    const origin = `${slice[0].lat},${slice[0].lng}`
    const dest = `${slice[slice.length - 1].lat},${slice[slice.length - 1].lng}`
    const middle = slice.slice(1, -1).map(c => `${c.lat},${c.lng}`)

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
    if (middle.length > 0) {
      url += `&waypoints=${encodeURIComponent(middle.join('|'))}`
    }
    urls.push(url)
  }

  return urls.map((url, idx) => ({
    url,
    label: urls.length > 1
      ? `Otwórz trasę w Google Maps (${dateLabel} • cz. ${idx + 1}/${urls.length})`
      : `Otwórz całą trasę dnia w Google Maps (${dateLabel})`
  }))
}

const toRouteWaypoint = (pt) => {
  if (pt.lat !== null && pt.lng !== null) {
    return { location: { latLng: { latitude: pt.lat, longitude: pt.lng } } }
  }
  return { address: pt.queryAddress }
}

const requestGoogleRoute = async (originWaypoint, destinationWaypoint, intermediateWaypoints, allowOptimize = true) => {
  const reqBody = {
    origin: originWaypoint,
    destination: destinationWaypoint,
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_UNAWARE',
    languageCode: 'pl',
    units: 'METRIC'
  }

  if (intermediateWaypoints.length > 0) {
    reqBody.intermediates = intermediateWaypoints
    if (allowOptimize && intermediateWaypoints.length > 1 && intermediateWaypoints.length <= 25) {
      reqBody.optimizeWaypointOrder = true
    }
  }

  const resp = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.duration,routes.legs.distanceMeters,routes.legs.startLocation,routes.legs.endLocation,routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters,routes.optimizedIntermediateWaypointIndex'
    },
    body: JSON.stringify(reqBody)
  })

  return await resp.json()
}

const calculateOptimalRoute = async () => {
  errorMessage.value = ''
  totalHotelsSuggested.value = 0
  estimatedKmSaved.value = 0
  activeDayTab.value = 'ALL'

  if (!mapInstance) return
  isCalculating.value = true
  clearAllMapObjects()

  const activeTechId = props.selectedTechId || document.getElementById('route-tech-select')?.value || ''
  const activeDate = props.selectedDate || document.getElementById('route-date-select')?.value || 'ALL'
  const activeStartType = props.startType || document.getElementById('route-start-select')?.value || 'ZG'
  const activeCustomAddr = (props.customStartAddress || document.getElementById('route-custom-address')?.value || '').trim()

  if (!activeTechId && adHocStops.value.length === 0) {
    errorMessage.value = 'Wybierz technika z listy u góry lub dodaj zgłoszenia z Backlogu na mapie (+ Dorzuć do trasy).'
    isCalculating.value = false
    renderBacklogMarkers()
    return
  }

  let technicianEvents = []
  if (activeTechId) {
    const techObj = props.techs.find(t =>
      String(t.id) === String(activeTechId) ||
      String(t.name || '').toLowerCase().trim() === String(activeTechId).toLowerCase().trim()
    )
    const techIdNorm = String(techObj?.id || activeTechId).toLowerCase().trim()
    const techNameNorm = String(techObj?.name || activeTechId).toLowerCase().trim()

    technicianEvents = props.calendarEvents.filter(ev => {
      const evType = String(ev.event_type || ev.extendedProps?.event_type || '').toLowerCase()
      if (evType === 'absence') return false
      const evTech = String(ev.technician_id || '').toLowerCase().trim()
      const evTechExt = String(ev.extendedProps?.technicianName || '').toLowerCase().trim()
      return (techIdNorm && evTech === techIdNorm) || (techNameNorm && (evTech === techNameNorm || evTechExt === techNameNorm))
    })
  }

  const groupedByDate = {}
  technicianEvents.forEach(ev => {
    if (!ev.start_time) return
    const d = new Date(String(ev.start_time).replace(' ', 'T'))
    if (isNaN(d.getTime())) return
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (activeDate !== 'ALL' && dStr !== activeDate) return
    if (!groupedByDate[dStr]) groupedByDate[dStr] = []
    groupedByDate[dStr].push(ev)
  })

  // Dołączenie dat z dorzuconych ręcznie przystanków Backlogu
  adHocStops.value.forEach(ad => {
    if (activeDate !== 'ALL' && ad.date !== activeDate && adHocStops.value.length === 0) return
    if (!groupedByDate[ad.date]) groupedByDate[ad.date] = []
  })

  const allSortedDates = Object.keys(groupedByDate).sort()
  if (allSortedDates.length === 0) {
    errorMessage.value = 'Brak wizyt w wybranym terminie — możesz dorzucić zgłoszenia z Backlogu na mapie.'
    isCalculating.value = false
    renderBacklogMarkers()
    return
  }

  const sortedDates = plannerMode.value === 'DAY' ? [allSortedDates[0]] : allSortedDates
  const daysData = []

  sortedDates.forEach(date => {
    const events = groupedByDate[date] || []
    const routePoints = []
    const seenStopKeys = new Set()

    // 1. Przystanki zaplanowane w Harmonogramie
    events.forEach(ev => {
      const cleanTid = String(ev.ticket_id || '').replace(/^#/, '').trim().toLowerCase()
      const ticket = cleanTid
        ? props.tickets.find(t => {
            const cands = [t.id, t.ticket_code, t.ticket_number, t.ekoen_code, t.t_id, t.t_code]
              .filter(Boolean)
              .map(x => String(x).replace(/^#/, '').trim().toLowerCase())
            return cands.includes(cleanTid)
          })
        : null

      const qpFromTitle = ((String(ev.title || '').match(/QP-\d+/i)) || [])[0] || ''
      const stationFallback = (!ticket && qpFromTitle)
        ? props.stations.find(s => getShortQpCode(s.public_id || s.name || '') === qpFromTitle.toUpperCase())
        : null

      const pt = buildRoutePointFromTicket(ticket || (qpFromTitle ? { qp_id: qpFromTitle } : null), stationFallback, ev.description || ev.title)
      if (!pt) return
      if (excludedStopKeys.value.includes(pt.stopKey) || seenStopKeys.has(pt.stopKey)) return

      seenStopKeys.add(pt.stopKey)
      routePoints.push({ ...pt, isAdHoc: false, savedInHarm: true })
    })

    // 2. Przystanki dorzucone symulacyjnie z Backlogu
    adHocStops.value
      .filter(ad => ad.date === date)
      .forEach(ad => {
        if (seenStopKeys.has(ad.stopKey)) return
        seenStopKeys.add(ad.stopKey)
        routePoints.push({
          ...ad.pointData,
          isAdHoc: true,
          savedInHarm: Boolean(ad.savedInHarm)
        })
      })

    if (routePoints.length > 0) {
      daysData.push({ date, routePoints })
    }
  })

  if (daysData.length === 0) {
    errorMessage.value = excludedStopKeys.value.length > 0
      ? 'Wszystkie wizyty tego dnia zostały tymczasowo pominięte.'
      : 'Wizyty nie posiadają przypisanego adresu ani współrzędnych stacji.'
    isCalculating.value = false
    renderBacklogMarkers()
    return
  }

  let userGpsCoords = null
  if (activeStartType === 'GPS') {
    try {
      userGpsCoords = await getCurrentGpsPosition()
    } catch (gpsErr) {
      errorMessage.value = gpsErr.message
      isCalculating.value = false
      renderBacklogMarkers()
      return
    }
  }

  let homeBaseCoords = { lat: 51.9356, lng: 15.5062 }
  let homeOriginWaypoint = { address: 'Rozwojowa 9, Nowy Kisielin, Zielona Góra, Polska' }
  let homeBaseLabel = 'Biuro EKOEN Zielona Góra'

  if (activeStartType === 'WAW') {
    homeBaseCoords = { lat: 52.1815, lng: 20.9961 }
    homeOriginWaypoint = { address: 'Postępu 13, Warszawa, Polska' }
    homeBaseLabel = 'Biuro EKOEN Warszawa'
  } else if (activeStartType === 'GPS' && userGpsCoords) {
    homeBaseCoords = { lat: userGpsCoords.lat, lng: userGpsCoords.lng }
    homeOriginWaypoint = { location: { latLng: { latitude: userGpsCoords.lat, longitude: userGpsCoords.lng } } }
    homeBaseLabel = `Twoja lokalizacja GPS (${userGpsCoords.lat.toFixed(4)}, ${userGpsCoords.lng.toFixed(4)})`
  } else if (activeStartType === 'CUSTOM' && activeCustomAddr) {
    homeOriginWaypoint = { address: activeCustomAddr }
    homeBaseLabel = activeCustomAddr
  }

  globalBounds = new window.google.maps.LatLngBounds()
  let carriedOverOrigin = null
  let carriedOverCity = ''

  for (let dIdx = 0; dIdx < daysData.length; dIdx++) {
    const dayEntry = daysData[dIdx]
    const currentDate = dayEntry.date
    const dayColor = DAY_COLORS[dIdx % DAY_COLORS.length]

    // Uwzględnienie ręcznej kolejności przystanków (jeśli ustawiona dla tego dnia)
    const manualKeys = manualOrderByDate.value[currentDate]
    const isManualOrder = Array.isArray(manualKeys) && manualKeys.length > 0
    const routePoints = isManualOrder
      ? [...dayEntry.routePoints].sort((a, b) => {
          const ia = manualKeys.indexOf(a.stopKey)
          const ib = manualKeys.indexOf(b.stopKey)
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
        })
      : dayEntry.routePoints

    let dayOriginWaypoint = homeOriginWaypoint
    let dayOriginLabel = homeBaseLabel
    let isHotelStart = false

    if (accommodationPolicy.value === 'SMART_HOTEL' && carriedOverOrigin) {
      dayOriginWaypoint = carriedOverOrigin
      dayOriginLabel = `Nocleg: ${carriedOverCity}`
      isHotelStart = true
      carriedOverOrigin = null
    }

    let farthestIdx = routePoints.length - 1
    if (!isManualOrder) {
      let maxDist = -1
      routePoints.forEach((pt, idx) => {
        if (pt.approxLat !== null && pt.approxLng !== null) {
          const d = getDistanceBetweenCoords(homeBaseCoords.lat, homeBaseCoords.lng, pt.approxLat, pt.approxLng)
          if (d > maxDist) {
            maxDist = d
            farthestIdx = idx
          }
        } else if (maxDist < 0) {
          farthestIdx = idx
        }
      })
    }

    const nextDayEntry = daysData[dIdx + 1]
    const canConsiderHotelTonight = (
      plannerMode.value === 'WEEK' &&
      accommodationPolicy.value === 'SMART_HOTEL' &&
      Boolean(nextDayEntry)
    )

    let isRoundTripToHome = includeReturnToBase.value && !canConsiderHotelTonight
    let route = null
    let hotelTriggeredTonight = false
    let stationStopsOrder = []

    try {
      if (!isRoundTripToHome) {
        const destPt = routePoints[farthestIdx]
        const interData = routePoints.filter((_, idx) => idx !== farthestIdx)
        const data = await requestGoogleRoute(
          dayOriginWaypoint,
          toRouteWaypoint(destPt),
          interData.map(toRouteWaypoint),
          !isManualOrder
        )

        if (data.error) {
          errorMessage.value = `Błąd Google Routes (${currentDate}): ${data.error.message || 'Nie udało się wyznaczyć trasy.'}`
          continue
        }
        if (!data.routes || data.routes.length === 0) continue

        route = data.routes[0]
        const optIndices = !isManualOrder ? route.optimizedIntermediateWaypointIndex : null
        stationStopsOrder = interData.map((_, i) => interData[optIndices ? optIndices[i] : i])
        stationStopsOrder.push(destPt)

        if (!isHotelStart && activeStartType === 'CUSTOM' && route.legs?.[0]?.startLocation?.latLng) {
          homeBaseCoords = {
            lat: route.legs[0].startLocation.latLng.latitude,
            lng: route.legs[0].startLocation.latLng.longitude
          }
        }

        if (canConsiderHotelTonight && route.legs?.length > 0) {
          const lastLegEnd = route.legs[route.legs.length - 1].endLocation.latLng
          const currentEndCity = (destPt.city || '').toLowerCase().trim()
          const distToBase = getDistanceBetweenCoords(lastLegEnd.latitude, lastLegEnd.longitude, homeBaseCoords.lat, homeBaseCoords.lng)

          const isNextNear = nextDayEntry.routePoints.some(nPt => {
            const nCity = (nPt.city || '').toLowerCase().trim()
            if (currentEndCity && nCity && (currentEndCity.includes(nCity) || nCity.includes(currentEndCity))) return true
            if (nPt.approxLat !== null && nPt.approxLng !== null) {
              return getDistanceBetweenCoords(lastLegEnd.latitude, lastLegEnd.longitude, nPt.approxLat, nPt.approxLng) < 120
            }
            return distToBase > 150
          })

          if (distToBase > 120 && isNextNear) {
            hotelTriggeredTonight = true
            totalHotelsSuggested.value++
            estimatedKmSaved.value += Math.round(distToBase * 1.8)
            carriedOverOrigin = { location: { latLng: { latitude: lastLegEnd.latitude, longitude: lastLegEnd.longitude } } }
            carriedOverCity = destPt.city || destPt.qpLabel || 'Hotel w trasie'
          } else if (includeReturnToBase.value) {
            isRoundTripToHome = true
          }
        }
      }

      if (isRoundTripToHome) {
        const data = await requestGoogleRoute(
          dayOriginWaypoint,
          homeOriginWaypoint,
          routePoints.map(toRouteWaypoint),
          !isManualOrder
        )
        if (data.error) {
          errorMessage.value = `Błąd Google Routes (${currentDate}): ${data.error.message || 'Nie udało się wyznaczyć pętli powrotnej.'}`
          continue
        }
        if (!data.routes || data.routes.length === 0) continue

        route = data.routes[0]
        const optIndices = !isManualOrder ? route.optimizedIntermediateWaypointIndex : null
        stationStopsOrder = routePoints.map((_, i) => routePoints[optIndices ? optIndices[i] : i])
      }

      if (!route || !route.legs || route.legs.length === 0) continue

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
      globalPolylines.push(poly)

      const dayMarkers = []
      const dayInfoWindows = []
      const daySteps = []
      const orderedDayCoords = []

      const startLoc = {
        lat: route.legs[0].startLocation.latLng.latitude,
        lng: route.legs[0].startLocation.latLng.longitude
      }
      orderedDayCoords.push(startLoc)

      if (!isHotelStart && activeStartType === 'CUSTOM') {
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
      globalMarkers.push(startMarker)

      daySteps.push({
        isStartPoint: true,
        isHotelStart,
        label: dayOriginLabel,
        marker: markRaw(startMarker)
      })

      route.legs.forEach((leg, lIdx) => {
        const isReturnLeg = isRoundTripToHome && (lIdx === route.legs.length - 1)
        const legSec = parseInt(String(leg.duration).replace('s', ''), 10) || 0
        const legMeters = leg.distanceMeters || 0
        const legDistTxt = legMeters >= 1000 ? `${(legMeters / 1000).toFixed(1)} km` : `${legMeters} m`
        const isSame = legMeters < 50
        const endPos = {
          lat: leg.endLocation.latLng.latitude,
          lng: leg.endLocation.latLng.longitude
        }
        orderedDayCoords.push(endPos)

        const prevLoc = lIdx === 0
          ? startLoc
          : { lat: route.legs[lIdx - 1].endLocation.latLng.latitude, lng: route.legs[lIdx - 1].endLocation.latLng.longitude }
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${prevLoc.lat},${prevLoc.lng}&destination=${endPos.lat},${endPos.lng}&travelmode=driving`

        if (isReturnLeg) {
          daySteps.push({
            isReturnPoint: true,
            label: homeBaseLabel,
            legDuration: formatDuration(legSec),
            legDistanceText: legDistTxt,
            googleMapsUrl,
            marker: markRaw(startMarker)
          })
          return
        }

        const stepData = stationStopsOrder[lIdx]
        const stopNumber = lIdx + 1
        const pinColor = stepData.isAdHoc && !stepData.savedInHarm ? '#059669' : dayColor

        const marker = new window.google.maps.Marker({
          position: endPos,
          map: mapInstance,
          icon: {
            url: createCustomPinSvg(String(stopNumber), pinColor),
            scaledSize: new window.google.maps.Size(34, 42),
            anchor: new window.google.maps.Point(17, 42)
          },
          title: `${stepData.qpLabel}${stepData.ticketCodeLabel ? ' (#' + stepData.ticketCodeLabel + ')' : ''}`,
          zIndex: 1001 + lIdx
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="font-family: inherit; padding: 4px; min-width: 210px;">
              <div style="font-weight: 800; color: ${pinColor}; margin-bottom: 2px;">${stopNumber}. ${stepData.qpLabel} | ${currentDate}</div>
              <div style="font-size: 11px; font-weight: 700; color: #334155;">${stepData.displayAddress}</div>
              <div style="font-size: 10px; color: #dc2626; margin-top: 4px; background: #fef2f2; padding: 4px; border-radius: 4px;">
                ${stepData.issueDescription}
              </div>
            </div>
          `
        })

        marker.addListener('click', () => {
          globalInfoWindows.forEach(iw => iw.close())
          infoWindow.open({ anchor: marker, map: mapInstance })
        })
        dayMarkers.push(marker)
        dayInfoWindows.push(infoWindow)
        globalMarkers.push(marker)
        globalInfoWindows.push(infoWindow)

        const navSteps = (leg.steps || []).map(s => ({
          instruction: s.navigationInstruction?.instructions || 'Jedź trasą',
          maneuver: s.navigationInstruction?.maneuver || '',
          distanceText: (s.distanceMeters >= 1000) ? `${(s.distanceMeters / 1000).toFixed(1)} km` : `${s.distanceMeters} m`
        }))

        daySteps.push({
          ...stepData,
          stopNumber,
          totalDayStops: stationStopsOrder.length,
          dayDate: currentDate,
          legDuration: isSame ? 'Na miejscu' : formatDuration(legSec),
          legDistanceText: isSame ? '' : legDistTxt,
          isSameLocation: isSame,
          isSuggestedHotelAfter: false,
          navigationSteps: navSteps,
          showNav: false,
          googleMapsUrl,
          marker: markRaw(marker),
          infoWindow: markRaw(infoWindow)
        })
      })

      if (hotelTriggeredTonight && daySteps.length > 1) {
        daySteps[daySteps.length - 1].isSuggestedHotelAfter = true
      }

      const totalDaySec = parseInt(String(route.duration).replace('s', ''), 10) || 0
      const totalDayMeters = route.distanceMeters || 0
      const formattedDayName = new Date(`${currentDate}T12:00:00`).toLocaleDateString('pl-PL', {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric'
      })

      dayMapObjects.push({
        polyline: poly,
        markers: dayMarkers,
        infoWindows: dayInfoWindows,
        bounds: dayBounds
      })

      weekSchedule.value.push({
        date: currentDate,
        dateName: formattedDayName,
        color: dayColor,
        isManualOrder,
        stopKeysOrder: stationStopsOrder.map(s => s.stopKey),
        polyline: markRaw(poly),
        markers: dayMarkers.map(m => markRaw(m)),
        infoWindows: dayInfoWindows.map(iw => markRaw(iw)),
        steps: daySteps,
        bounds: markRaw(dayBounds),
        taskCount: stationStopsOrder.length,
        distanceMeters: totalDayMeters,
        durationSec: totalDaySec,
        dayStatsText: `${(totalDayMeters / 1000).toFixed(1)} km | ${formatDuration(totalDaySec)}`,
        fullDayMapsUrls: buildFullDayGoogleMapsUrls(orderedDayCoords, formattedDayName)
      })
    } catch (e) {
      console.error(`Błąd trasy dla dnia ${currentDate}:`, e)
      errorMessage.value = `Błąd wyznaczania trasy (${currentDate}): ${e.message || e}`
    }
  }

  if (weekSchedule.value.length > 0) {
    updateMapVisibility()
  }

  isCalculating.value = false
  renderBacklogMarkers()
}

const focusStep = (step) => {
  if (step && step.marker && mapInstance) {
    globalInfoWindows.forEach(iw => iw.close())
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

defineExpose({
  calculateOptimalRoute
})

onMounted(() => {
  setTimeout(initGoogleMaps, 250)
})

onBeforeUnmount(() => {
  clearAllMapObjects()
  clearBacklogMarkers()
})
</script>

<style scoped>
.route-custom-scrollbar::-webkit-scrollbar { width: 5px; }
.route-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.route-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
.route-custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.8); }
</style>