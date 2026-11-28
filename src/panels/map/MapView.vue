<template>
  <div class="absolute inset-0 bg-slate-50 z-10 flex flex-col font-sans overflow-hidden">
    
    <!-- EKRAN ŁADOWANIA INICJALNEGO -->
    <div v-if="store.isLoading || isSavingZone" class="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-all duration-500">
      <div v-if="isSavingZone" class="relative flex items-center justify-center mb-4">
        <div class="absolute inset-0 bg-[#58b347] rounded-full blur-md opacity-40 animate-pulse"></div>
        <div class="bg-white border-[3px] border-[#58b347] rounded-full w-20 h-20 shadow-xl relative flex items-center justify-center">
          <div class="bg-[#58b347] rounded-full w-14 h-14 flex items-center justify-center">
             <svg class="w-8 h-8 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
               <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
               <circle cx="12" cy="12" r="10" stroke-dasharray="20 10" class="animate-spin-stable"/>
             </svg>
          </div>
        </div>
      </div>
      <svg v-else viewBox="0 0 200 200" class="w-32 h-32 mb-6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 10C149.706 10 190 50.2944 190 100C190 149.706 149.706 190 100 190C50.2944 190 10 149.706 10 100C10 50.2944 50.2944 10 100 10Z" stroke="#58b347" stroke-width="12" />
        <g class="animate-spin-stable">
          <circle cx="100" cy="100" r="70" fill="#58b347" />
          <path d="M85 70H135V85H85V70ZM65 92.5H115V107.5H65V92.5ZM85 115H135V130H85V115Z" fill="white" />
        </g>
      </svg>
      <h2 class="text-xl font-bold text-slate-800 animate-pulse tracking-widest uppercase">
        {{ isSavingZone ? 'ZAPISYWANIE ZMIAN W CHMURZE...' : 'EKOEN SYSTEM' }}
      </h2>
      <p class="text-slate-400 text-sm mt-2">
        {{ isSavingZone ? 'Przetwarzanie kształtów stref...' : 'Inicjalizacja modułów przestrzennych...' }}
      </p>
    </div>

    <!-- KONTENER MAPY -->
    <div ref="mapContainer" class="absolute inset-0 w-full h-full"></div>

    <!-- NAKŁADKI UI: TOP LEFT (Zależne od mapMode) -->
    <div v-if="!store.isLoading" class="absolute top-6 left-6 z-[60] flex flex-row items-center gap-2 flex-nowrap w-max" :class="isSidebarExpanded ? 'translate-x-[184px]' : 'translate-x-0'" style="transition: transform 0.3s ease-out;">
      
      <!-- STAN 1: TRYB TERYTORIÓW -->
      <template v-if="mapMode === 'territory'">
        <button @click="openAddStation" class="shrink-0 box-border bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg px-4 rounded-xl text-slate-700 font-bold hover:bg-white hover:text-[#58b347] transition-all flex items-center gap-2 text-[13px] h-[42px] whitespace-nowrap">
          <svg class="w-4 h-4 text-[#58b347]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Dodaj stację
        </button>

        <button @click="openSectorEditorFromUI" class="shrink-0 box-border bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg px-4 rounded-xl text-slate-700 font-bold hover:bg-white hover:text-blue-500 transition-all flex items-center gap-2 text-[13px] h-[42px] whitespace-nowrap" :class="isSectorEditorOpen ? '!border-blue-500 text-blue-500 bg-blue-50' : ''">
          <svg class="w-4 h-4" :class="isSectorEditorOpen ? 'text-blue-500' : 'text-slate-400'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
          Edytor Terytoriów
        </button>

        <button @click="toggleSectors" class="shrink-0 box-border bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg px-4 rounded-xl text-slate-700 font-bold hover:bg-white transition-all flex items-center gap-2 text-[13px] h-[42px] whitespace-nowrap">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 17 22 12"/></svg>
          {{ showSectors ? 'Ukryj strefy' : 'Pokaż strefy' }}
        </button>

        <!-- FILTRY MAPY + WIDOCZNOŚĆ ETYKIET QP -->
        <div class="relative flex items-center shrink-0 box-border h-[42px]">
          <button @click="toggleMenu('filter')" class="bg-white/90 backdrop-blur-xl border shadow-lg px-4 rounded-xl font-bold transition-all flex items-center gap-2 text-[13px] h-[42px] whitespace-nowrap cursor-pointer shrink-0 box-border" :class="filterStatus !== '' || filterTech !== '' ? 'border-red-200 text-red-600 bg-red-50' : 'border-slate-200/80 text-slate-700 hover:bg-slate-50'">
            <svg class="w-4 h-4" :class="filterStatus !== '' || filterTech !== '' ? 'text-red-500' : 'text-slate-400'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> 
            <span>{{ filterStatus !== '' ? getStatusLabel(filterStatus) : filterTech !== '' ? 'Wybrany Technik' : 'Filtry mapy' }}</span>
            <span class="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-black font-mono">{{ visibleStationsCount }}</span>
          </button>
          
          <div v-show="activeMenu === 'filter'" class="absolute top-[48px] left-0 w-84 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-200 p-5 z-[100] flex flex-col gap-4 animate-fadeIn">
            <div class="border-b border-slate-100/60 pb-2 flex justify-between items-center">
              <h3 class="font-bold text-slate-800 text-sm">Filtruj stacje i zgłoszenia</h3>
              <button v-if="filterStatus !== '' || filterTech !== ''" @click="setFilterStatus(''); setFilterTech('')" class="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-widest cursor-pointer">Wyczyść</button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5">Typ / Status / Harmonogram</label>
                <div class="relative">
                    <div @click="toggleDropdown('status')" :class="activeDropdown === 'status' ? 'border-[#58b347] ring-2 ring-[#58b347]/20' : 'border-slate-200'" class="bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 flex justify-between items-center cursor-pointer hover:border-[#58b347]/50 transition-colors shadow-inner">
                      <span :class="filterStatus === '' ? 'text-slate-400' : 'text-slate-800'">{{ getStatusLabel(filterStatus) }}</span>
                      <svg class="w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <ul v-show="activeDropdown === 'status'" class="absolute left-0 right-0 top-full mt-1 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 custom-scrollbar max-h-64 overflow-y-auto">
                      <li @click="setFilterStatus('')" class="px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">Wszystkie stacje</li>
                      <li @click="setFilterStatus('HAS_TICKET')" class="px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">Aktywne zgłoszenia</li>
                      <li @click="setFilterStatus('SCHED_PLANNED')" class="px-3 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors">Zaplanowane w Harmonogramie</li>
                      <li @click="setFilterStatus('SCHED_UNPLANNED')" class="px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors">Zgłoszenia bez wizyty w grafiku</li>
                      <div class="px-3 py-1.5 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status stacji w bazie</div>
                      <li @click="setFilterStatus('CAT_REPAIR')" class="px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors">Naprawa</li>
                      <li @click="setFilterStatus('CAT_INSPECTION')" class="px-3 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">Przegląd</li>
                      <li @click="setFilterStatus('CAT_COMMISSIONING')" class="px-3 py-2 text-sm font-bold text-yellow-600 hover:bg-yellow-50 rounded-lg cursor-pointer transition-colors">Uruchomienie</li>
                      <div class="px-3 py-1.5 mt-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Zgłoszenia operacyjne</div>
                      <li @click="setFilterStatus('TICK_OCZEKUJE_CZESCI')" class="px-3 py-2 text-sm font-bold text-orange-500 hover:bg-orange-50 rounded-lg cursor-pointer transition-colors">Oczekuje na Części</li>
                      <li @click="setFilterStatus('TICK_OCZEKUJE_REALIZACJA')" class="px-3 py-2 text-sm font-bold text-indigo-500 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors">Oczekuje na Realizację</li>
                      <li @click="setFilterStatus('TICK_WYKONANO')" class="px-3 py-2 text-sm font-bold text-emerald-500 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors">Wykonano</li>
                    </ul>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1.5">Przypisany Technik</label>
                 <div class="relative">
                    <div @click="toggleDropdown('tech')" :class="activeDropdown === 'tech' ? 'border-[#58b347] ring-2 ring-[#58b347]/20' : 'border-slate-200'" class="bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 flex justify-between items-center cursor-pointer hover:border-[#58b347]/50 transition-colors shadow-inner">
                      <span :class="filterTech === '' ? 'text-slate-400' : 'text-slate-800'">{{ filterTech === '' ? 'Wszyscy technicy' : getTechLabel(filterTech) }}</span>
                      <svg class="w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                    <ul v-show="activeDropdown === 'tech'" class="absolute left-0 right-0 top-full mt-1 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 custom-scrollbar max-h-48 overflow-y-auto">
                      <li @click="setFilterTech('')" class="px-3 py-2 text-sm font-bold text-slate-700 hover:bg-[#58b347]/10 hover:text-[#58b347] rounded-lg cursor-pointer transition-colors">Wszyscy technicy</li>
                      <li v-for="t in uniqueTechNames" :key="t" @click="setFilterTech(t)" class="px-3 py-2 text-sm font-bold text-slate-700 hover:bg-[#58b347]/10 hover:text-[#58b347] rounded-lg cursor-pointer transition-colors">{{ t }}</li>
                    </ul>
                </div>
              </div>

              <!-- Przełącznik widoczności etykiet QP -->
              <div class="pt-2 border-t border-slate-100">
                <label class="block text-xs font-bold text-slate-500 mb-1.5">Etykiety QP na mapie</label>
                <div class="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    @click="setLabelMode('AUTO')"
                    class="py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer"
                    :class="labelVisibilityMode === 'AUTO' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
                  >
                    Od zoomu
                  </button>
                  <button
                    type="button"
                    @click="setLabelMode('TICKETS')"
                    class="py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer"
                    :class="labelVisibilityMode === 'TICKETS' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
                    title="Pokazuj numery QP wszystkich aktywnych zgłoszeń nawet przy oddalonej mapie"
                  >
                    Zgłoszenia
                  </button>
                  <button
                    type="button"
                    @click="setLabelMode('NONE')"
                    class="py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer"
                    :class="labelVisibilityMode === 'NONE' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
                  >
                    Ukryte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- WYSZUKIWARKA STACJI QP / MIASTA / ZGŁOSZEŃ Z NALOTEM FLY-TO -->
        <div class="relative flex items-center shrink-0 h-[42px]" @click.stop>
          <div class="relative flex items-center h-[42px] bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-lg rounded-xl px-3 w-56 focus-within:border-[#58b347] focus-within:bg-white transition-all">
            <svg class="w-4 h-4 text-slate-400 shrink-0 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              v-model="mapSearchQuery"
              @focus="isSearchDropdownOpen = true; activeMenu = null"
              @input="onMapSearchInput"
              @keydown.enter.prevent="onMapSearchEnter"
              @keydown.esc="isSearchDropdownOpen = false"
              type="text"
              placeholder="Szukaj QP, miasta..."
              class="w-full bg-transparent text-[12.5px] font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              v-if="mapSearchQuery"
              type="button"
              @click="clearMapSearch"
              class="ml-1 text-slate-400 hover:text-slate-700 text-xs font-black cursor-pointer"
              title="Wyczyść wyszukiwanie"
            >✕</button>
          </div>

          <!-- Lista podpowiedzi Fly-To -->
          <div
            v-show="isSearchDropdownOpen && searchSuggestions.length > 0"
            class="absolute top-[48px] left-0 w-84 max-h-80 overflow-y-auto custom-scrollbar bg-white/98 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-2xl z-[110] divide-y divide-slate-100 animate-fadeIn"
          >
            <div class="px-3.5 py-2 bg-slate-50/80 text-[9.5px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
              <span>{{ mapSearchQuery ? 'Wyniki wyszukiwania' : 'Aktywne zgłoszenia na mapie' }}</span>
              <span>Kliknij = Leć do stacji</span>
            </div>
            <div
              v-for="item in searchSuggestions"
              :key="item.id"
              @click="flyToStation(item)"
              class="px-3.5 py-2.5 hover:bg-[#f0f7f1] cursor-pointer transition-colors flex items-start justify-between gap-2"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-xs font-black font-mono text-slate-800">{{ item.shortQp }}</span>
                  <span
                    v-if="item.hasOpenTicket"
                    class="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase text-white"
                    :style="{ backgroundColor: item.pinColor }"
                  >
                    {{ item.ticketCode ? `#${item.ticketCode}` : 'Zgłoszenie' }}
                  </span>
                  <span
                    v-if="item.isScheduled"
                    class="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[8.5px] font-black uppercase"
                  >
                    Grafik {{ item.visitDateShort }}
                  </span>
                </div>
                <div class="text-[11px] font-semibold text-slate-500 truncate mt-0.5">
                  {{ item.city }}{{ item.address && item.address !== 'Brak adresu' ? `, ${item.address}` : '' }}
                </div>
              </div>
              <svg class="w-4 h-4 text-slate-300 shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          </div>
        </div>

        <!-- Przycisk przejścia do tras logistycznych -->
        <button @click="mapMode = 'logistics'" class="shrink-0 box-border bg-white/90 backdrop-blur-xl border border-blue-200 shadow-lg px-4 rounded-xl text-blue-600 font-bold hover:bg-blue-50 transition-all flex items-center gap-2 text-[13px] h-[42px] whitespace-nowrap ml-1 cursor-pointer">
          <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg> Trasy logistyczne
        </button>
      </template>

      <!-- STAN 2: TRYB TRAS LOGISTYCZNYCH (LOGISTICS) -->
      <template v-else-if="mapMode === 'logistics'">
        
        <button @click="mapMode = 'territory'" class="shrink-0 box-border bg-white/90 backdrop-blur-xl border shadow-lg px-4 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2 text-[13px] h-[42px] whitespace-nowrap z-[100] relative border-slate-200">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg> Wróć do Terytoriów
        </button>

        <!-- Pływający formularz wyboru dla logistyki -->
        <div class="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-lg rounded-xl flex items-center p-1.5 gap-2 z-[100] relative flex-wrap max-w-full">
           
           <select id="route-tech-select" v-model="routeTech" class="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none hover:border-blue-400 focus:bg-white w-40">
              <option value="">-- Technik --</option>
              <option v-for="tech in store.techs" :key="tech.id" :value="tech.id">{{ tech.name }}</option>
           </select>
           
           <select id="route-date-select" v-model="routeDate" class="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none hover:border-blue-400 focus:bg-white w-32">
              <option value="ALL">Wszystkie dni</option>
              <option v-for="date in availableRouteDates" :key="date" :value="date">{{ date }}</option>
           </select>

           <!-- Pionowa kreska rozdzielająca -->
           <div class="w-px h-6 bg-slate-200 mx-1"></div>

           <!-- Wybór Punktu Startowego -->
           <select id="route-start-select" v-model="routeStartType" class="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1.5 outline-none hover:border-blue-400 focus:bg-white w-40">
              <option value="ZG">📍 Start: Zielona Góra</option>
              <option value="WAW">📍 Start: Warszawa</option>
              <option value="GPS">🛰️ Start: GPS (Lokalizacja)</option>
              <option value="CUSTOM">✏️ Start: Własny adres</option>
           </select>

           <!-- Ukryte pole na własny adres -->
           <input
             id="route-custom-address"
             v-show="routeStartType === 'CUSTOM'"
             v-model="routeCustomAddress"
             @keydown.enter.prevent="triggerRouteCalculation"
             type="text"
             placeholder="Wpisz np. Poznań, Główna 1"
             class="text-xs font-bold text-slate-700 bg-white border border-blue-300 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-48 shadow-inner transition-all"
           />

           <!-- Przycisk Oblicz spięty bezpośrednio przez Vue ref -->
           <button
             id="route-calc-btn"
             type="button"
             @click="triggerRouteCalculation"
             class="bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-sm hover:bg-blue-700 whitespace-nowrap ml-1 cursor-pointer"
           >
             Wyznacz Trasę
           </button>
        </div>
      </template>

    </div>

    <!-- ZEWNĘTRZNY EDYTOR STREF ZINTEGROWANY JAKO PLUGIN -->
    <SectorEditor 
      ref="sectorEditorRef"
      v-if="!store.isLoading && mapMode === 'territory'"
      :class="isSidebarExpanded ? 'translate-x-[184px]' : 'translate-x-0'"
      class="transition-transform duration-300 ease-out"
      :isOpen="isSectorEditorOpen"
      :initialTab="sectorEditorTab"
      :sectors="store.techs"
      :regions="store.areas"
      :stations="store.stations"
      :hiddenTechs="store.hiddenTechs"
      :hiddenAreas="store.hiddenAreas"
      :mapInstance="map" 
      :drawInstance="draw"
      :cachedRegionsFeatures="cachedRegionsFeatures"
      :countryPolygons="countryPolygons"
      @close="closeSectorEditor"
      @deleteSector="clearSectorGeom"
      @hardDeleteEntity="deleteEntityCompletely"
      @toggleVisibility="handleToggleVisibility"
      @createNewAreaVue="createNewAreaVue"
      @refreshData="refreshMapVue"
      @savingStateChanged="(val) => isSavingZone = val"
    />

    <!-- MENU KONTEKSTOWE NA MAPIE (Prawy Przycisk Myszy) -->
    <div v-show="contextMenu.show" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" class="absolute z-[999999] bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl p-2 w-64 animate-fadeIn">
       <div class="px-3 py-2 border-b border-slate-100 mb-1 flex items-center gap-2">
           <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
           <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">Opcje Mapy</span>
       </div>
       <div @click="handleContextMenuAction('add_station')" class="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-[#58b347]/10 hover:text-[#58b347] rounded-lg cursor-pointer transition-colors">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Dodaj stację w tym miejscu
       </div>
       <div @click="handleContextMenuAction('edit_techs')" class="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg cursor-pointer transition-colors">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" x2="9" y1="3" y2="18"></line><line x1="15" x2="15" y1="6" y2="21"></line></svg>
          Zarządzaj strefami techników
       </div>
       <div @click="handleContextMenuAction('edit_areas')" class="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-green-50 hover:text-green-600 rounded-lg cursor-pointer transition-colors">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          Zarządzaj obszarami analitycznymi
       </div>
       <div class="border-t border-slate-100 mt-1 pt-1">
         <div @click="handleContextMenuAction('copy_coords')" class="flex items-center justify-between gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
           <span>Kopiuj GPS punktu</span>
           <span v-if="contextMenu.lat" class="font-mono text-[10px] text-slate-400">{{ contextMenu.lat.toFixed(5) }}, {{ contextMenu.lng.toFixed(5) }}</span>
         </div>
         <div @click="handleContextMenuAction('open_gmaps')" class="flex items-center justify-between gap-2 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">
           <span>Podgląd w Google Maps / Satelita</span>
           <span>↗</span>
         </div>
       </div>
    </div>

  <!-- MODE 1: INFO STACJI (TERRITORY) -->
  <StationInfoPanel 
      v-if="mapMode === 'territory'"
      ref="stationInfoPanelRef" 
      @editStation="(data) => stationFormModalRef.open(true, data.gps_lat, data.gps_lng, data)"
      @openTicket="handleOpenTicket" 
  />

  <!-- MODE 2: PANEL TRASY (LOGISTICS) -->
  <LogisticsRouteView 
      v-if="mapMode === 'logistics'"
      ref="logisticsRouteRef"
      class="absolute inset-0 z-10"
      :techs="store.techs"
      :stations="store.stations"
      :tickets="mergedMapTickets"
      :calendar-events="scheduleStore.events"
      :selected-tech-id="routeTech"
      :selected-date="routeDate"
      :start-type="routeStartType"
      :custom-start-address="routeCustomAddress"
  />
    
    <StationFormModal 
      ref="stationFormModalRef" 
    />

<TicketsFormModal 
      :show="showAddTicketModal" 
      :prefilledQp="prefilledQp"
      @close="showAddTicketModal = false" 
      @save="saveNewTicket"
    />

  </div>
</template>

<script setup>
import { ref, computed, shallowRef, onMounted, onBeforeUnmount, watch } from 'vue'
import { useMapStore } from '../../stores/useMapStore'
import SectorEditor from '../../composables/SectorEditor.vue'

// Importujesz swoje nowe komponenty modalne/panelowe
import StationFormModal from '../../modals/StationFormModal.vue'
import StationInfoPanel from '../../components/StationInfoPanel.vue'
import TicketsFormModal from '../../modals/TicketsFormModal.vue'
import { useTicketsStore } from '../../stores/useTicketsStore'
import { useScheduleStore } from '../../stores/useScheduleStore'
import LogisticsRouteView from './LogisticsRouteView.vue'

import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import * as turf from '@turf/turf'

const props = defineProps({ isSidebarExpanded: Boolean })
const store = useMapStore()
const ticketsStore = useTicketsStore()
const scheduleStore = useScheduleStore()

const mapContainer = ref(null)
const map = shallowRef(null)
const draw = shallowRef(null)
const sectorEditorRef = ref(null) 

// 1. REF-y DO KOMPONENTÓW
const stationFormModalRef = ref(null)
const stationInfoPanelRef = ref(null)
const logisticsRouteRef = ref(null)

const isSavingZone = ref(false)
const showSectors = ref(true)
const isSectorEditorOpen = ref(false)
const sectorEditorTab = ref('technicians')

const mapMode = ref('territory')
const routeStartType = ref('ZG')
const routeCustomAddress = ref('')

const activeMenu = ref(null)
const activeDropdown = ref(null)

const cachedRegionsFeatures = ref([])
const countryPolygons = ref([])
const hoveredBoundaryIds = ref([])
const hoveredStateId = ref(null)

const filterStatus = ref('')
const filterTech = ref('')
const routeTech = ref('')
const routeDate = ref('ALL')
const isRoutingInProgress = ref(false)
const isRoutingActive = ref(false)

// Połączona pula zgłoszeń (Axon Connect + Ekoen EE_XXX z Harmonogramu)
const mergedMapTickets = computed(() => {
  const primary = ticketsStore.tickets || []
  const secondary = scheduleStore.tickets || []
  if (secondary.length === 0) return primary

  const mapByKey = new Map()
  const getKey = (t) => String(t.ticket_code || t.ekoen_code || t.ticket_number || t.t_code || t.id || t.t_id || '').trim().toLowerCase()

  secondary.forEach(t => {
    const k = getKey(t)
    if (k) mapByKey.set(k, t)
  })
  primary.forEach(t => {
    const k = getKey(t)
    if (k) mapByKey.set(k, { ...(mapByKey.get(k) || {}), ...t })
  })

  return Array.from(mapByKey.values())
})

// --- DYNAMICZNE DATY DO TRAS LOGISTYCZNYCH (bez urlopów, dopasowane do wybranego technika) ---
const availableRouteDates = computed(() => {
  if (!scheduleStore.events || scheduleStore.events.length === 0) return []

  const selectedObj = store.techs.find(t => String(t.id) === String(routeTech.value))
  const selIdLow = String(routeTech.value || '').toLowerCase().trim()
  const selNameLow = String(selectedObj?.name || '').toLowerCase().trim()

  const dates = new Set()
  scheduleStore.events.forEach(ev => {
    if (!ev.start_time) return
    const evType = String(ev.event_type || ev.extendedProps?.event_type || '').toLowerCase()
    if (evType === 'absence') return

    if (selIdLow) {
      const evTech = String(ev.technician_id || '').toLowerCase().trim()
      const evTechExt = String(ev.extendedProps?.technicianName || '').toLowerCase().trim()
      const matchesTech = (evTech === selIdLow) || (selNameLow && (evTech === selNameLow || evTechExt === selNameLow))
      if (!matchesTech) return
    }

    const d = new Date(String(ev.start_time).replace(' ', 'T'))
    if (!isNaN(d.getTime())) {
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      dates.add(dStr)
    }
  })

  return Array.from(dates).sort()
})

watch(availableRouteDates, (validDates) => {
  if (routeDate.value !== 'ALL' && !validDates.includes(routeDate.value)) {
    routeDate.value = 'ALL'
  }
})

function triggerRouteCalculation() {
  if (logisticsRouteRef.value && typeof logisticsRouteRef.value.calculateOptimalRoute === 'function') {
    logisticsRouteRef.value.calculateOptimalRoute()
  }
}

const contextMenu = ref({ show: false, x: 0, y: 0, lat: null, lng: null })

let autoRefreshInterval = null;

function startAutoRefresh() {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
  autoRefreshInterval = setInterval(() => {
    const isDrawing = sectorEditorRef.value && sectorEditorRef.value.isDrawing();
    if (!isDrawing && !isSavingZone.value) {
      store.fetchMapData(true); 
    }
  }, 60000);
}

function toggleMenu(menu) { 
  activeMenu.value = activeMenu.value === menu ? null : menu;
  activeDropdown.value = null; 
}

function toggleDropdown(name) {
  activeDropdown.value = activeDropdown.value === name ? null : name;
}

function toggleSectors() {
  showSectors.value = !showSectors.value
  if (map.value && map.value.getLayer('saved-sectors-layer')) {
    const visibility = showSectors.value ? 'visible' : 'none'
    map.value.setLayoutProperty('saved-sectors-layer', 'visibility', visibility)
    map.value.setLayoutProperty('saved-sectors-outline', 'visibility', visibility)
    if (map.value.getLayer('saved-regions-layer')) {
        map.value.setLayoutProperty('saved-regions-layer', 'visibility', visibility)
        map.value.setLayoutProperty('saved-regions-outline', 'visibility', visibility)
    }
  }
}

function openSectorEditorFromUI() {
  sectorEditorTab.value = 'technicians'
  isSectorEditorOpen.value = true
  if (!showSectors.value) toggleSectors()
}

function closeSectorEditor() {
  isSectorEditorOpen.value = false
  if (sectorEditorRef.value && sectorEditorRef.value.isDrawing()) {
      sectorEditorRef.value.cancelDrawing();
  }
}

function handleContextMenuAction(action) {
  const { lat, lng } = contextMenu.value
  contextMenu.value.show = false
  if (action === 'add_station') openAddStation(lat, lng)
  else if (action === 'edit_techs') { sectorEditorTab.value = 'technicians'; isSectorEditorOpen.value = true; if (!showSectors.value) toggleSectors() }
  else if (action === 'edit_areas') { sectorEditorTab.value = 'regions'; isSectorEditorOpen.value = true; if (!showSectors.value) toggleSectors() }
  else if (action === 'copy_coords' && lat != null && lng != null) {
    navigator.clipboard?.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
  } else if (action === 'open_gmaps' && lat != null && lng != null) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat.toFixed(6)},${lng.toFixed(6)}`, '_blank')
  }
}

// 2. NOWA FUNKCJA OTWIERAJĄCA FORMULARZ
function openAddStation(lat = null, lng = null) {
  let finalLat = typeof lat === 'number' ? lat : (contextMenu.value.lat || null);
  let finalLng = typeof lng === 'number' ? lng : (contextMenu.value.lng || null);
  // Odwołuje się do komponentu StationFormModal
  if (stationFormModalRef.value) {
    stationFormModalRef.value.open(false, finalLat, finalLng);
  }
}

// 3. NOWA FUNKCJA OTWIERAJĄCA PANEL INFO
function openStationInfoPanel(stationId) {
  if (stationInfoPanelRef.value) {
    stationInfoPanelRef.value.open(stationId);
  }
}

// ==== LOGIKA DODAWANIA ZGŁOSZEŃ Z MAPY ====
const showAddTicketModal = ref(false)
const prefilledQp = ref('')

function handleOpenTicket(stationId) {
  // Szukamy stacji, żeby wyciągnąć jej numer QP
  const s = store.stations.find(st => String(st.id) === String(stationId));
  if (s) {
    const rawId = s.public_id || s.name || s.id || '';
    // Formatujemy krótki kod (np. QP-17424)
    prefilledQp.value = rawId.includes('-') ? rawId.split('-').slice(0, 2).join('-') : rawId;
  } else {
    prefilledQp.value = '';
  }
  
  // Zamykamy panel boczny i otwieramy modal
  if (stationInfoPanelRef.value) stationInfoPanelRef.value.close();
  showAddTicketModal.value = true;
}

function saveNewTicket(ticketPayload) {
  ticketsStore.saveTicketToBase(ticketPayload);
  showAddTicketModal.value = false;
  // Opcjonalnie: odświeżenie danych mapy po dodaniu zgłoszenia
  setTimeout(() => store.fetchMapData(true), 2000); 
}
// ==========================================

function refreshMapVue() {
  store.fetchMapData(true);
}

function isEntityHidden(collection, id) {
  if (!collection) return false;
  if (typeof collection.has === 'function') return collection.has(id);
  if (Array.isArray(collection)) return collection.includes(id);
  return false;
}

function handleToggleVisibility(id, type) {
  if (type === 'technician') {
    store.toggleTechVisibility(id);
    setTimeout(() => localStorage.setItem('ekoen_hidden_techs', JSON.stringify(Array.from(store.hiddenTechs))), 50);
  } else {
    store.toggleAreaVisibility(id);
    setTimeout(() => localStorage.setItem('ekoen_hidden_areas', JSON.stringify(Array.from(store.hiddenAreas))), 50);
  }
}

function clearSectorGeom(id, type) {
  if(!confirm(`Czy na pewno chcesz całkowicie wyczyścić obrys z mapy? To nie usunie rekordu z bazy.`)) return;
  if (typeof google !== 'undefined' && google.script) {
      google.script.run
          .withSuccessHandler(() => store.fetchMapData(true))
          [type === 'technician' ? 'updateTechnicianGeometry' : 'updateAreaGeometry'](id, "");
  }
}

function deleteEntityCompletely(id, type) {
  if(!confirm(`UWAGA! Czy trwale i bezpowrotnie USUNĄĆ ten element z bazy danych?`)) return;
  if (type === 'area') {
      store.deleteAreaFromCloud(id, () => alert("Obszar usunięty."));
  }
}

function createNewAreaVue(name) {
  let newId = 'area_' + Date.now();
  if (typeof google !== 'undefined' && google.script) {
      store.isLoading = true;
      google.script.run
        .withSuccessHandler((res) => {
           store.fetchMapData(true);
           store.isLoading = false;
        })
        .withFailureHandler((err) => { store.isLoading = false; alert("Błąd: " + err.message); })
        .createNewAreaRecord(newId, name, '#3b82f6');
  }
}

const uniqueTechNames = computed(() => {
  const names = new Set();
  store.techs.forEach(t => { if (t.name) names.add(t.name.trim()) });
  store.stations.forEach(s => {
    const techVal = s.ticket_technician || s.technician_name || s.technician || '';
    if (techVal) techVal.split(',').forEach(x => { if(x.trim()) names.add(x.trim()) });
  });
  return Array.from(names).sort();
});

const mapSearchQuery = ref('')
const isSearchDropdownOpen = ref(false)
const labelVisibilityMode = ref('AUTO') // 'AUTO' | 'TICKETS' | 'NONE'
const visibleStationsCount = ref(0)

function getStatusLabel(val) {
  if (val === 'HAS_TICKET') return 'Aktywne zgłoszenia'
  if (val === 'SCHED_PLANNED') return 'W Harmonogramie'
  if (val === 'SCHED_UNPLANNED') return 'Bez wizyty w grafiku'
  if (val === 'CAT_REPAIR') return 'Naprawa'
  if (val === 'CAT_INSPECTION') return 'Przegląd'
  if (val === 'CAT_COMMISSIONING') return 'Uruchomienie'
  if (val === 'TICK_OCZEKUJE_CZESCI') return 'Oczekuje na Części'
  if (val === 'TICK_OCZEKUJE_REALIZACJA') return 'Do Realizacji'
  if (val === 'TICK_WYKONANO') return 'Wykonano'
  return 'Wszystkie stacje'
}
function getTechLabel(val) { return val ? (uniqueTechNames.value.find(t => t.toLowerCase() === val.toLowerCase()) || val) : 'Wszyscy technicy' }
function getRouteTechLabel(id) { const t = store.techs.find(x => x.id === id); return t ? t.name : 'Wybierz...' }

function setFilterStatus(val) { filterStatus.value = val; activeDropdown.value = null; applyFilters() }
function setFilterTech(val) { filterTech.value = val.toLowerCase(); activeDropdown.value = null; applyFilters() }
function setRouteTech(id) { routeTech.value = id; activeDropdown.value = null }

const getShortQpMap = (raw) => {
  const str = String(raw || '').trim()
  if (!str) return ''
  const parts = str.split('-')
  return parts.length >= 2 ? `${parts[0]}-${parts[1]}`.toUpperCase() : str.toUpperCase()
}

const isTicketClosedMap = (t) => {
  const st = String(t?.status || t?.t_status || '').toLowerCase()
  const intSt = String(t?.ticket_status || '').toLowerCase()
  if (st.includes('zamknięt') || st.includes('zakończ') || st.includes('closed') || st.includes('anulowan') || st.includes('zrealizowano')) return true
  if (intSt.includes('wykonano') || (intSt.includes('rozliczone') && !intSt.includes('nierozliczone'))) return true
  return false
}

// Zintegrowany indeks stacji z żywymi zgłoszeniami (Axon + Ekoen) oraz wizytami z Harmonogramu
const enrichedStationsIndex = computed(() => {
  const todayStr = new Date().toISOString().substring(0, 10)
  const tickets = mergedMapTickets.value || []
  const events = scheduleStore.events || []

  const ticketsById = new Map()
  const openTicketsByQp = new Map()

  tickets.forEach(t => {
    const keys = [t.id, t.ticket_code, t.ekoen_code, t.ticket_number, t.t_code, t.t_id]
      .filter(Boolean)
      .map(k => String(k).replace(/^#/, '').trim().toLowerCase())
    keys.forEach(k => ticketsById.set(k, t))

    if (!isTicketClosedMap(t)) {
      const q = getShortQpMap(t.qp_id || t.station_id || t.t_qp)
      if (q && !openTicketsByQp.has(q)) openTicketsByQp.set(q, t)
    }
  })

  const visitByRef = new Map()
  events.forEach(ev => {
    const evType = String(ev.event_type || ev.extendedProps?.event_type || '').toLowerCase()
    if (evType === 'absence') return
    const dStr = String(ev.start_time || '').substring(0, 10)
    if (!dStr || dStr < todayStr) return

    const tid = String(ev.ticket_id || '').replace(/^#/, '').trim().toLowerCase()
    if (tid && (!visitByRef.has(tid) || dStr < visitByRef.get(tid))) {
      visitByRef.set(tid, dStr)
    }
    const qpMatch = (String(ev.title || '').match(/QP-\d+/i) || [])[0]
    if (qpMatch) {
      const qKey = qpMatch.toUpperCase()
      if (!visitByRef.has(qKey) || dStr < visitByRef.get(qKey)) {
        visitByRef.set(qKey, dStr)
      }
    }
  })

  const list = []
  ;(store.stations || []).forEach(s => {
    if (!s.gps_lat || !s.gps_lng) return
    const lat = parseFloat(String(s.gps_lat).replace(',', '.'))
    const lng = parseFloat(String(s.gps_lng).replace(',', '.'))
    if (isNaN(lat) || isNaN(lng)) return

    const shortQp = getShortQpMap(s.public_id || s.name || s.id)
    const rawTid = String(s.active_ticket_id || '').replace(/^#/, '').trim().toLowerCase()

    let matchedTicket = rawTid ? (ticketsById.get(rawTid) || null) : null
    if ((!matchedTicket || isTicketClosedMap(matchedTicket)) && openTicketsByQp.has(shortQp)) {
      matchedTicket = openTicketsByQp.get(shortQp)
    }

    const hasOpenTicket = matchedTicket
      ? !isTicketClosedMap(matchedTicket)
      : Boolean(rawTid && !String(s.ticket_status || '').toLowerCase().includes('wykonano'))

    const realTicketStatus = String(
      matchedTicket?.ticket_status || matchedTicket?.status || s.ticket_status || ''
    )
    const statusLower = realTicketStatus.toLowerCase()
    const ticketCode = matchedTicket
      ? String(matchedTicket.ekoen_code || matchedTicket.ticket_code || matchedTicket.ticket_number || matchedTicket.id || '')
      : String(s.active_ticket_id || '')

    const visitIso =
      (ticketCode && visitByRef.get(ticketCode.toLowerCase())) ||
      (rawTid && visitByRef.get(rawTid)) ||
      visitByRef.get(shortQp) ||
      ''
    const isScheduled = Boolean(visitIso)
    const visitDateShort = visitIso ? `${visitIso.slice(8, 10)}.${visitIso.slice(5, 7)}` : ''

    let address = s.street_number || s.street || 'Brak adresu'
    let city = s.city || 'Nieznane miasto'
    let postcode = ''
    if (matchedTicket) {
      if (matchedTicket.address && String(matchedTicket.address).trim()) address = matchedTicket.address
      if (matchedTicket.city && String(matchedTicket.city).trim()) city = matchedTicket.city
      if (matchedTicket.postcode && String(matchedTicket.postcode).trim()) postcode = matchedTicket.postcode
    }

    let pinColor = '#64748b'
    if (hasOpenTicket) {
      if (statusLower.includes('części') || statusLower.includes('czesci')) pinColor = '#f59e0b'
      else if (String(s.ticket_category || matchedTicket?.category || '').toUpperCase().includes('INSPECT') || statusLower.includes('przegl')) pinColor = '#0284c7'
      else pinColor = '#ef4444'
    }

    const cityShort = city !== 'Nieznane miasto' ? city : ''
    const baseLabel = cityShort ? `${shortQp} • ${cityShort}` : shortQp
    const labelText = isScheduled ? `${baseLabel} [${visitDateShort}]` : baseLabel

    const searchBlob = [
      shortQp,
      s.public_id,
      city,
      address,
      s.client_name || matchedTicket?.client || '',
      ticketCode,
      s.ticket_technician || matchedTicket?.technician_id || ''
    ].join(' ').toLowerCase()

    list.push({
      raw: s,
      id: s.id,
      shortQp: shortQp || String(s.public_id || s.id),
      lat,
      lng,
      city,
      address,
      postcode,
      ticketCat: s.ticket_category || '',
      statusLower,
      hasOpenTicket,
      ticketCode,
      isScheduled,
      visitDateShort,
      pinColor,
      labelText,
      searchBlob,
      rawJsonLower: JSON.stringify(s).toLowerCase() + ' ' + String(matchedTicket?.technician_id || '').toLowerCase()
    })
  })

  return list
})

const searchSuggestions = computed(() => {
  const q = mapSearchQuery.value.toLowerCase().trim()
  const all = enrichedStationsIndex.value
  if (!q) {
    return all
      .filter(it => it.hasOpenTicket)
      .sort((a, b) => Number(b.isScheduled) - Number(a.isScheduled))
      .slice(0, 10)
  }

  return all
    .filter(it => it.searchBlob.includes(q))
    .sort((a, b) => {
      const aStarts = a.shortQp.toLowerCase().includes(q) ? 1 : 0
      const bStarts = b.shortQp.toLowerCase().includes(q) ? 1 : 0
      if (aStarts !== bStarts) return bStarts - aStarts
      return Number(b.hasOpenTicket) - Number(a.hasOpenTicket)
    })
    .slice(0, 14)
})

function onMapSearchInput() {
  isSearchDropdownOpen.value = true
  applyFilters()
}

function clearMapSearch() {
  mapSearchQuery.value = ''
  isSearchDropdownOpen.value = false
  applyFilters()
}

function flyToStation(item) {
  if (!item || !map.value) return
  isSearchDropdownOpen.value = false
  activeMenu.value = null
  if (mapSearchQuery.value) {
    mapSearchQuery.value = ''
    applyFilters()
  }
  map.value.flyTo({
    center: [item.lng, item.lat],
    zoom: Math.max(map.value.getZoom(), 14.5),
    speed: 1.5,
    essential: true
  })
  openStationInfoPanel(item.id)
}

function onMapSearchEnter() {
  if (searchSuggestions.value.length > 0) {
    flyToStation(searchSuggestions.value[0])
  }
}

function syncLabelLayerStyle() {
  if (!map.value || !map.value.getLayer('unclustered-point-label')) return
  const mode = labelVisibilityMode.value

  if (mode === 'NONE') {
    map.value.setLayoutProperty('unclustered-point-label', 'visibility', 'none')
    return
  }

  map.value.setLayoutProperty('unclustered-point-label', 'visibility', 'visible')
  if (mode === 'TICKETS') {
    map.value.setLayerZoomRange('unclustered-point-label', 6, 24)
    map.value.setFilter('unclustered-point-label', [
      'all',
      ['!', ['has', 'point_count']],
      ['==', ['get', 'has_ticket_count'], 1]
    ])
  } else {
    map.value.setLayerZoomRange('unclustered-point-label', 9.5, 24)
    map.value.setFilter('unclustered-point-label', ['!', ['has', 'point_count']])
  }
}

function setLabelMode(mode) {
  labelVisibilityMode.value = mode
  syncLabelLayerStyle()
}

function applyFilters() {
  if (!map.value || !map.value.getSource('stations-data')) return
  const fStatus = filterStatus.value
  const fTech = filterTech.value
  const q = mapSearchQuery.value.toLowerCase().trim()

  const filterColors = {
    '': '#58b347',
    'HAS_TICKET': '#ef4444',
    'SCHED_PLANNED': '#10b981',
    'SCHED_UNPLANNED': '#e11d48',
    'CAT_REPAIR': '#dc2626',
    'CAT_INSPECTION': '#3b82f6',
    'CAT_COMMISSIONING': '#f59e0b',
    'TICK_OCZEKUJE_CZESCI': '#f97316',
    'TICK_OCZEKUJE_REALIZACJA': '#6366f1',
    'TICK_WYKONANO': '#10b981'
  }

  const activeClusterColor = fStatus !== '' ? (filterColors[fStatus] || '#94a3b8') : '#58b347'
  if (map.value.getLayer('clusters') && fStatus !== '') {
    map.value.setPaintProperty('clusters', 'circle-color', activeClusterColor)
  }

  const filtered = enrichedStationsIndex.value.filter(it => {
    let mStatus = true
    if (fStatus === 'HAS_TICKET') mStatus = it.hasOpenTicket
    else if (fStatus === 'SCHED_PLANNED') mStatus = it.isScheduled
    else if (fStatus === 'SCHED_UNPLANNED') mStatus = it.hasOpenTicket && !it.isScheduled
    else if (fStatus === 'CAT_REPAIR') mStatus = it.ticketCat === 'REPAIR'
    else if (fStatus === 'CAT_INSPECTION') mStatus = it.ticketCat === 'INSPECTION'
    else if (fStatus === 'CAT_COMMISSIONING') mStatus = it.ticketCat === 'COMMISSIONING'
    else if (fStatus === 'TICK_OCZEKUJE_CZESCI') mStatus = it.statusLower.includes('części') || it.statusLower.includes('czesci')
    else if (fStatus === 'TICK_OCZEKUJE_REALIZACJA') mStatus = it.statusLower.includes('realizacj')
    else if (fStatus === 'TICK_WYKONANO') mStatus = it.statusLower.includes('wykonano')

    const mTech = fTech === '' || it.rawJsonLower.includes(fTech)
    const mSearch = q === '' || it.searchBlob.includes(q)

    return mStatus && mTech && mSearch
  })

  visibleStationsCount.value = filtered.length

  const features = filtered.map(it => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [it.lng, it.lat]
    },
    properties: {
      id: it.id,
      name: it.raw.public_id,
      status: it.raw.status,
      has_ticket_count: it.hasOpenTicket ? 1 : 0,
      is_scheduled: it.isScheduled ? 1 : 0,
      pin_color: it.pinColor,
      pin_radius: it.hasOpenTicket ? 8.5 : 6.5,
      stroke_color: it.isScheduled ? '#10b981' : '#ffffff',
      stroke_width: it.isScheduled ? 3.5 : 2,
      label_text: it.labelText,
      dynamic_address: it.address,
      dynamic_city: it.city,
      dynamic_postcode: it.postcode
    }
  }))

  map.value.getSource('stations-data').setData({ type: 'FeatureCollection', features })
}



function clearRoute() {
  map.value.getSource('optimized-route').setData({ type: 'FeatureCollection', features: [] });
  isRoutingActive.value = false;
  activeMenu.value = null;
}

function updateSectorMap() {
  if(!map.value || !map.value.getSource('saved-sectors')) return
  
  let featuresToRenderTechs = []
  let featuresToRenderAreas = []
  
  const processGeomForRender = (geomData, id, color, array) => {
    let geom = null
    if (typeof geomData === 'string' && geomData !== '') {
      try { geom = JSON.parse(geomData) } catch(e) {}
    } else if (typeof geomData === 'object') geom = geomData
    
    if (geom) {
       if (geom.type === 'FeatureCollection') {
         geom.features.forEach(f => array.push({ type: 'Feature', geometry: f.geometry, properties: { id: id, color: color } }))
       } else {
         array.push({ type: 'Feature', geometry: geom.geometry || geom, properties: { id: id, color: color } })
       }
    }
  }

  store.techs.forEach(t => {
     if (isEntityHidden(store.hiddenTechs, t.id)) return;
     processGeomForRender(t.zone_geometry, t.id, t.zone_color || t.color || '#58b347', featuresToRenderTechs)
  })

  store.areas.forEach(a => {
     if (isEntityHidden(store.hiddenAreas, a.id)) return; 
     processGeomForRender(a.zone_geometry, a.id, a.color || '#3b82f6', featuresToRenderAreas)
  })
  
  map.value.getSource('saved-sectors').setData({ type: 'FeatureCollection', features: featuresToRenderTechs })
  if (map.value.getSource('saved-regions')) {
      map.value.getSource('saved-regions').setData({ type: 'FeatureCollection', features: featuresToRenderAreas })
  }
}

function initMap() {
  if (!mapContainer.value) return

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center: [19.14, 51.91],
    zoom: 5.5,
    pitch: 0, dragRotate: false, doubleClickZoom: false
  })

  if (typeof MapboxDraw !== 'undefined') {
    let customTheme = MapboxDraw.lib.theme.map(s => {
      let style = JSON.parse(JSON.stringify(s))
      if (style.paint && style.paint['line-dasharray']) style.paint['line-dasharray'] = [2, 2]
      return style
    })

    draw.value = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: false, trash: false },
      defaultMode: 'simple_select',
      styles: customTheme
    })
    map.value.addControl(draw.value)
  }

  map.value.on('load', async () => {
    map.value.addSource('optimized-route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    map.value.addSource('saved-sectors', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map.value.addSource('saved-regions', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map.value.addSource('active-base-zone', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    
    map.value.addSource('stations-data', { 
        type: 'geojson', data: { type: 'FeatureCollection', features: [] }, cluster: true, clusterRadius: 50,
        clusterProperties: { 
            'awaria_count': ['+', ['case', ['==', ['get', 'status'], 'Awaria'], 1, 0]], 
            'rework_count': ['+', ['case', ['==', ['get', 'status'], 'Rework'], 1, 0]],
            'uruchomienie_count': ['+', ['case', ['==', ['get', 'status'], 'Uruchomienie'], 1, 0]],
            'przeglad_count': ['+', ['case', ['==', ['get', 'status'], 'Przegląd'], 1, 0]]
        }
    });

    map.value.addLayer({ id: 'active-base-zone-fill', type: 'fill', source: 'active-base-zone', paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.3 } })
    map.value.addLayer({ id: 'active-base-zone-line', type: 'line', source: 'active-base-zone', paint: { 'line-color': '#1d4ed8', 'line-width': 2, 'line-dasharray': [4, 4] } })

    map.value.addLayer({ id: 'saved-sectors-layer', type: 'fill', source: 'saved-sectors', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.25 } })
    map.value.addLayer({ id: 'saved-sectors-outline', type: 'line', source: 'saved-sectors', paint: { 'line-color': ['get', 'color'], 'line-width': 2 } })
    
    map.value.addLayer({ id: 'saved-regions-layer', type: 'fill', source: 'saved-regions', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.15 } })
    map.value.addLayer({ id: 'saved-regions-outline', type: 'line', source: 'saved-regions', paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-dasharray': [2, 2] } })

    map.value.addLayer({ id: 'optimized-route-line-glow', type: 'line', source: 'optimized-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#3b82f6', 'line-width': 10, 'line-opacity': 0.3 } })
    map.value.addLayer({ id: 'optimized-route-line', type: 'line', source: 'optimized-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#2563eb', 'line-width': 4, 'line-dasharray': [2, 2] } })

    map.value.addLayer({ 
        id: 'clusters', type: 'circle', source: 'stations-data', filter: ['has', 'point_count'], 
        paint: { 
            'circle-color': [
                'case',
                ['==', ['get', 'awaria_count'], ['get', 'point_count']], '#ef4444',
                ['==', ['get', 'rework_count'], ['get', 'point_count']], '#8b5cf6',
                ['==', ['get', 'uruchomienie_count'], ['get', 'point_count']], '#f59e0b',
                ['==', ['get', 'przeglad_count'], ['get', 'point_count']], '#3b82f6',
                ['==', ['+', ['get', 'awaria_count'], ['get', 'rework_count'], ['get', 'uruchomienie_count'], ['get', 'przeglad_count']], 0], '#58b347', 
                '#ffffff'
            ],
            'circle-opacity': 0.95, 
            'circle-radius': ['step', ['get', 'point_count'], 18, 10, 22, 50, 28], 
            'circle-stroke-width': 3, 
            'circle-stroke-color': [
                'case',
                ['==', ['get', 'awaria_count'], ['get', 'point_count']], 'rgba(255, 255, 255, 0.8)',
                ['==', ['get', 'rework_count'], ['get', 'point_count']], 'rgba(255, 255, 255, 0.8)',
                ['==', ['get', 'uruchomienie_count'], ['get', 'point_count']], 'rgba(255, 255, 255, 0.8)',
                ['==', ['get', 'przeglad_count'], ['get', 'point_count']], 'rgba(255, 255, 255, 0.8)',
                ['==', ['+', ['get', 'awaria_count'], ['get', 'rework_count'], ['get', 'uruchomienie_count'], ['get', 'przeglad_count']], 0], 'rgba(255, 255, 255, 0.8)',
                '#0f172a'
            ] 
        } 
    });

    map.value.addLayer({ 
        id: 'clusters-bg', type: 'circle', source: 'stations-data', filter: ['has', 'point_count'], 
        paint: { 
            'circle-color': '#94a3b8', 'circle-opacity': 0.0, 
            'circle-radius': ['step', ['get', 'point_count'], 18, 10, 22, 50, 28], 
            'circle-stroke-width': 3, 'circle-stroke-color': 'rgba(255, 255, 255, 0.8)'
        } 
    });

    map.value.addLayer({ id: 'cluster-count', type: 'symbol', source: 'stations-data', filter: ['has', 'point_count'], layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'], 'text-size': 14 }, paint: { 'text-color': '#ffffff' } });
    map.value.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'stations-data',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': ['get', 'pin_radius'],
        'circle-stroke-width': ['get', 'stroke_width'],
        'circle-stroke-color': ['get', 'stroke_color'],
        'circle-color': ['get', 'pin_color']
      }
    });

    map.value.addLayer({
      id: 'unclustered-point-label',
      type: 'symbol',
      source: 'stations-data',
      minzoom: 9.5,
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': ['get', 'label_text'],
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-size': 11,
        'text-offset': [0, 1.25],
        'text-anchor': 'top',
        'text-max-width': 16,
        'symbol-sort-key': ['-', 0, ['get', 'has_ticket_count']]
      },
      paint: {
        'text-color': [
          'case',
          ['==', ['get', 'is_scheduled'], 1], '#065f46',
          ['==', ['get', 'has_ticket_count'], 1], '#991b1b',
          '#1e293b'
        ],
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    });

    map.value.on('click', 'clusters', (e) => {
        const clusterId = map.value.queryRenderedFeatures(e.point, { layers: ['clusters'] })[0].properties.cluster_id;
        map.value.getSource('stations-data').getClusterExpansionZoom(clusterId).then(zoom => map.value.easeTo({ center: e.lngLat, zoom: zoom }));
    });
    ['clusters', 'unclustered-point', 'unclustered-point-label'].forEach(layerId => {
      map.value.on('mouseenter', layerId, () => { map.value.getCanvas().style.cursor = 'pointer' });
      map.value.on('mouseleave', layerId, () => { map.value.getCanvas().style.cursor = '' });
    });

    map.value.on('click', 'unclustered-point', (e) => {
        openStationInfoPanel(e.features[0].properties.id);
    });
    map.value.on('click', 'unclustered-point-label', (e) => {
        openStationInfoPanel(e.features[0].properties.id);
    });

    map.value.on('contextmenu', (e) => {
        if (e.originalEvent) e.originalEvent.preventDefault();
        contextMenu.value = { show: true, x: e.originalEvent.clientX, y: e.originalEvent.clientY, lat: e.lngLat.lat, lng: e.lngLat.lng };
    });
    map.value.on('click', () => {
        contextMenu.value.show = false;
        isSearchDropdownOpen.value = false;
    });

    syncLabelLayerStyle();

    loadGeoJsonBoundaries();
    updateSectorMap();
    applyFilters();
  })
}

async function loadGeoJsonBoundaries() {
    const fetchGeoJSONHybrid = (src) => {
        return new Promise((resolve) => {
            if (typeof google !== 'undefined' && google.script) {
                google.script.run
                    .withSuccessHandler((data) => {
                        let parsed = null;
                        try { parsed = typeof data === 'string' ? JSON.parse(data) : data } catch(e) {}
                        resolve({ code: src.code, data: parsed });
                    })
                    .withFailureHandler((err) => {
                        console.warn(`[GeoJSON] Błąd pobierania z Drive dla ${src.code}:`, err);
                        // ZAMIAST REJECT: Zwracamy null, żeby nie zawiesić mapy!
                        resolve({ code: src.code, data: null });
                    })
                    .fetchGeoJSONFromDrive(src.url)
            } else {
                resolve({ code: src.code, data: null })
            }
        })
    };

    const COUNTRY_SOURCES = [
      { code: 'PL', url: 'https://drive.google.com/uc?export=download&id=1SmsYh3Z3QB7HGQes3SNg5HsjPwf90352' },
      { code: 'SK', url: 'https://drive.google.com/uc?export=download&id=13vAhZFnkhnnPcwnzYeLRGJc2lEpjB31Q' }
    ]

    try {
      const responses = await Promise.all(COUNTRY_SOURCES.map(fetchGeoJSONHybrid));
      let combinedFeatures = [], globalId = 1;

      responses.forEach(({ code, data }) => {
        if (data && data.features) {
          data.features.forEach(f => {
            combinedFeatures.push({
                ...f,
                id: globalId,
                properties: { ...f.properties, customId: globalId, countryCode: code }
            });
            globalId++;
          })
        }
      })

      cachedRegionsFeatures.value = combinedFeatures;
      if (!map.value) return;

      // 1. Ładujemy wszystkie obszary do JEDNEGO źródła danych
      map.value.addSource('regions-data', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: combinedFeatures },
          promoteId: 'customId'
      });

      // 2. Warstwa wypełnienia (zielony środek)
      map.value.addLayer({
          id: 'regions-fill',
          type: 'fill',
          source: 'regions-data',
          paint: {
              'fill-color': '#58b347',
              'fill-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.6, ['boolean', ['feature-state', 'hover'], false], 0.3, 0.0]
          }
      });

      // 3. Warstwa HITBOX (grube, niewidoczne krawędzie). Maplibre sama konwertuje poligon na linię dla type='line'!
      map.value.addLayer({
          id: 'boundaries-hitbox',
          type: 'line',
          source: 'regions-data',
          paint: {
              'line-width': 30,
              'line-color': 'transparent'
          }
      });

      // 4. Warstwa GLOW (świecące krawędzie po najechaniu myszką)
      map.value.addLayer({
          id: 'boundaries-glow',
          type: 'line',
          source: 'regions-data',
          paint: {
              'line-width': 4,
              'line-color': '#58b347',
              'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.0]
          }
      });
      
      map.value.on('mousemove', 'regions-fill', (e) => {
        if (!sectorEditorRef.value || !sectorEditorRef.value.isDrawing() || sectorEditorRef.value.getDrawMethod() !== 'click' || e.features.length === 0) return
        map.value.getCanvas().style.cursor = 'pointer'
        const fId = e.features[0].properties.customId
        if (hoveredStateId.value !== null && hoveredStateId.value !== fId) map.value.setFeatureState({ source: 'regions-data', id: hoveredStateId.value }, { hover: false })
        hoveredStateId.value = fId
        map.value.setFeatureState({ source: 'regions-data', id: fId }, { hover: true })
      })

      map.value.on('mouseleave', 'regions-fill', () => {
        if (hoveredStateId.value !== null) { map.value.setFeatureState({ source: 'regions-data', id: hoveredStateId.value }, { hover: false }); hoveredStateId.value = null }
        if(sectorEditorRef.value && sectorEditorRef.value.getDrawMethod() === 'click') map.value.getCanvas().style.cursor = ''
      })

      map.value.on('click', 'regions-fill', (e) => {
        if (!sectorEditorRef.value || !sectorEditorRef.value.isDrawing() || sectorEditorRef.value.getDrawMethod() !== 'click') return
        if (e.features && e.features.length > 0) {
          const id = e.features[0].properties.customId
          sectorEditorRef.value.toggleRegionSelection(id);
        }
      })

      map.value.on('mousemove', 'boundaries-hitbox', (e) => {
          if (!sectorEditorRef.value || !sectorEditorRef.value.isDrawing() || sectorEditorRef.value.getDrawMethod() !== 'click' || e.features.length === 0) return;
          map.value.getCanvas().style.cursor = 'pointer';
          const currentIds = Array.from(new Set(e.features.map(f => f.properties.customId)));
          hoveredBoundaryIds.value.forEach(id => { if (!currentIds.includes(id)) map.value.setFeatureState({ source: 'regions-data', id: id }, { hover: false }); });
          currentIds.forEach(id => { map.value.setFeatureState({ source: 'regions-data', id: id }, { hover: true }); });
          hoveredBoundaryIds.value = currentIds;
      });

      map.value.on('mouseleave', 'boundaries-hitbox', () => { 
          hoveredBoundaryIds.value.forEach(id => { map.value.setFeatureState({ source: 'regions-data', id: id }, { hover: false }); });
          hoveredBoundaryIds.value = [];
          if(sectorEditorRef.value && sectorEditorRef.value.getDrawMethod() === 'click') map.value.getCanvas().style.cursor = '';
      });

      map.value.on('dblclick', 'boundaries-hitbox', (e) => {
          if (!sectorEditorRef.value || !sectorEditorRef.value.isDrawing() || sectorEditorRef.value.getDrawMethod() !== 'click') return;
          e.preventDefault(); 
          if (e.features && e.features.length > 0) {
            const clickedCountryCode = e.features[0].properties.countryCode;
            cachedRegionsFeatures.value.forEach((f) => {
              if (f.properties.countryCode === clickedCountryCode) {
                if (sectorEditorRef.value && typeof sectorEditorRef.value.toggleRegionSelection === 'function') {
                    sectorEditorRef.value.toggleRegionSelection(f.properties.customId, true);
                }
              }
            });
          }
      });
    } catch (err) {
        console.error("Błąd podczas ładowania GeoJSON granic:", err);
    }
}

onMounted(() => { 
  try {
    const savedTechs = JSON.parse(localStorage.getItem('ekoen_hidden_techs') || '[]');
    const savedAreas = JSON.parse(localStorage.getItem('ekoen_hidden_areas') || '[]');
    
    savedTechs.forEach(id => {
      if (!store.hiddenTechs.has(id)) store.toggleTechVisibility(id);
    });
    savedAreas.forEach(id => {
      if (!store.hiddenAreas.has(id)) store.toggleAreaVisibility(id);
    });
  } catch(e) {}

  store.fetchMapData(); 
  ticketsStore.fetchTicketsData();
  
  // NOWE: Pobieramy dane do kalendarza! 
  // (Upewnij się, że nazwa funkcji 'fetchEvents' lub 'fetchScheduleData' zgadza się z tą w Twoim useScheduleStore.js)
  if (scheduleStore.fetchScheduleData) {
      scheduleStore.fetchScheduleData();
  } else if (scheduleStore.fetchEvents) {
      scheduleStore.fetchEvents();
  } else if (scheduleStore.fetchData) {
      scheduleStore.fetchData();
  }

  setTimeout(() => { initMap() }, 300);
  startAutoRefresh();
})

onBeforeUnmount(() => { 
  if (map.value) map.value.remove(); 
  if (autoRefreshInterval) clearInterval(autoRefreshInterval); 
})

// Obserwujemy zmiany obrysów (lekka operacja, można głęboko)
watch(() => [store.techs, store.areas, store.hiddenTechs, store.hiddenAreas], () => { 
  updateSectorMap(); 
}, { deep: true })

// Obserwujemy zmiany stacji, połączonych zgłoszeń (Axon + Ekoen) oraz wizyt Harmonogramu
watch(() => [store.stations, mergedMapTickets.value, scheduleStore.events], () => {
  applyFilters()
})

</script>

<style scoped>
@keyframes spin-stable { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin-stable { animation: spin-stable 2s linear infinite; transform-origin: 100px 100px; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(241, 245, 249, 0.2); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(88, 179, 71, 0.4); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.8); }
</style>