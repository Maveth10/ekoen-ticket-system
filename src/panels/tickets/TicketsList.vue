<template>
  <!-- SKELETON LOADER -->
  <div v-if="isLoading" class="px-8 pt-6 pb-8 flex-1 flex flex-col gap-3 w-full">
    <SkeletonCard v-for="n in 6" :key="n" />
  </div>

  <!-- TABELA ZGŁOSZEŃ -->
  <div v-else class="px-8 pt-4 pb-16 flex-1 flex flex-col relative shrink-0 min-h-0">
    <div class="bg-white border border-slate-200/80 rounded-2xl shadow-sm relative z-10 w-max min-w-full pb-8">
      
      <table class="w-max min-w-full text-left border-collapse table-fixed select-none relative z-10">
        <thead class="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky top-0 z-[100] shadow-sm">
          <tr>
            <th v-for="(col, idx) in visibleColumns" :key="col.id" 
                :draggable="!col.locked"
                @dragstart="$emit('drag-start', idx)"
                @dragover.prevent
                @drop="$emit('drop-col', idx)"
                :style="`width: ${col.width}`" 
                class="py-4 px-4 border-r border-slate-100 last:border-none cursor-pointer hover:bg-slate-100 transition-colors" 
                @click="col.sortable ? $emit('sort', col.id) : null">
              
              <div class="flex items-center justify-between w-full pointer-events-none">
                <div v-if="col.id === 'actions'" class="flex items-center gap-3 pointer-events-auto">
                  <div @click.stop="$emit('toggle-select-all')" class="w-1.5 h-5 rounded-full cursor-pointer transition-all" :class="isAllSelected ? 'bg-[#58b347] shadow-[0_0_8px_rgba(88,179,71,0.6)] scale-y-110' : 'bg-slate-300 hover:bg-slate-400'"></div>
                </div>
                <span v-else>{{ col.label }}</span>
                
                <svg v-if="col.sortable && currentSort.col === col.id" class="w-3.5 h-3.5 text-[#58b347] inline ml-1 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <path v-if="currentSort.dir === 'asc'" d="m6 9 6 6 6-6"/>
                  <path v-else d="m18 15-6-6-6 6"/>
                </svg>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="text-xs divide-y divide-slate-200 bg-white">
          <tr v-if="tickets.length === 0">
            <td :colspan="visibleColumns.length" class="p-8 text-center text-slate-400 font-bold">Brak zgłoszeń pasujących do filtrów.</td>
          </tr>
          
          <tr
            v-for="(t, idx) in tickets"
            :key="t.id"
            class="transition-colors border-b border-slate-200/90 hover:bg-[#eaf5e9]/65"
            :class="selectedIds.includes(t.id) ? 'bg-[#f0f7f1]' : (idx % 2 === 0 ? 'bg-white' : 'bg-slate-100/90')"
          >
            <td v-for="col in visibleColumns" :key="col.id" class="py-3 px-4 border-r border-slate-200/70 last:border-r-0 align-top">
              
              <!-- AKCJE -->
              <div v-if="col.id === 'actions'" class="flex items-center justify-center h-[48px]">
                <div @click.stop="$emit('toggle-select', t.id)" class="w-1.5 h-6 rounded-full cursor-pointer transition-all" :class="selectedIds.includes(t.id) ? 'bg-[#58b347] shadow-[0_0_8px_rgba(88,179,71,0.6)] scale-y-110' : 'bg-slate-200 group-hover:bg-slate-300'"></div>
              </div>

              <!-- ID I STATUS -->
              <div v-else-if="col.id === 'code'" class="h-[148px] overflow-hidden flex flex-col pt-1">
                <!-- GÓRNA LINIA: ID + POWIĄZANE ZGŁOSZENIE EKOEN (W ZAKŁADCE AXON) -->
                <div class="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <span @click.stop="$emit('copy', getTicketIdDisplay(t, idx))" class="font-black tracking-wider text-[13px] cursor-pointer hover:opacity-70 transition-opacity text-slate-800" title="Kliknij, aby skopiować ID">{{ getTicketIdDisplay(t, idx) }}</span>
                  <span
                    v-if="t.linked_ekoen_id && store.activeModule !== 'ekoen'"
                    @click.stop="$emit('copy', t.linked_ekoen_id)"
                    class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase bg-cyan-50 text-slate-900 border border-cyan-300 hover:bg-cyan-100 cursor-pointer transition-colors"
                    :title="`Powiązane zgłoszenie Ekoen: ${t.linked_ekoen_id} (kliknij, aby skopiować)`"
                  >
                    {{ t.linked_ekoen_id }}
                  </span>
                </div>

                <div v-if="store.activeModule !== 'ekoen'" @click.stop="$emit('copy', t.status)" class="text-[10px] font-bold text-slate-500 tracking-wider text-left mb-0.5 uppercase cursor-pointer hover:text-slate-800 transition-colors w-fit" title="Kopiuj status">{{ t.status || 'BRAK STATUSU' }}</div>
                <div @click.stop="$emit('copy', t.category || t.priority)" class="text-[10px] font-bold text-blue-600 tracking-wider text-left uppercase cursor-pointer hover:text-blue-800 transition-colors w-fit" title="Kopiuj kategorię">{{ t.category || t.priority || 'INNE' }}</div>

                <!-- LINK AXON CONNECT (W ZAKŁADCE AXON / HISTORIA) -->
                <a 
                  v-if="getAxonUrl(t)" 
                  :href="getAxonUrl(t)" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  @click.stop
                  class="mt-auto mb-1 inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-800 text-slate-600 hover:text-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-800 transition-all active:scale-95 w-fit group"
                  title="Otwórz zlecenie w Axon Connect"
                >
                  <span class="text-[9px] font-black tracking-[0.14em] uppercase leading-none">AXON</span>
                  <svg class="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </a>

                <!-- PRZEKAZANIE DO AXON CONNECT (TYLKO W ZAKŁADCE EKOEN) -->
                <div v-else-if="store.activeModule === 'ekoen'" class="mt-auto mb-1 w-full">
                  <!-- STAN 1: Pole do wpisania ID z Axona (po kliknięciu przekaż lub podczas edycji) -->
                  <div v-if="editingAxonLinkId === t.id || (isForwardedToAxon(t) && !t.axon_ticket_id)" class="flex flex-col gap-1 w-full" @click.stop>
                    <div class="flex items-center justify-between">
                      <span class="text-[8px] font-black uppercase tracking-wider text-amber-700">Wpisz ID z Axon</span>
                      <button type="button" @click.stop="cancelAxonForward(t, idx)" class="text-[10px] font-black text-slate-400 hover:text-red-500 leading-none px-1" title="Anuluj przekazanie do Axon">✕</button>
                    </div>
                    <div class="flex items-center gap-1">
                      <input
                        type="text"
                        :value="getDraftAxonId(t)"
                        @input="setDraftAxonId(t.id, $event.target.value)"
                        @keydown.enter.prevent="saveAxonIdForEkoen(t, idx)"
                        placeholder="ID np. 584"
                        class="w-full min-w-0 text-[10px] font-mono font-bold text-slate-900 bg-amber-50/70 border border-amber-300 rounded-lg px-2 py-1 outline-none focus:border-[#58b347] focus:bg-white"
                      />
                      <button
                        type="button"
                        @click.stop="saveAxonIdForEkoen(t, idx)"
                        class="px-2 py-1 rounded-lg bg-[#58b347] hover:bg-[#499b3a] text-white text-[10px] font-black shrink-0 shadow-sm cursor-pointer"
                        title="Zapisz powiązane ID Axon"
                      >
                        ✓
                      </button>
                    </div>
                  </div>

                  <!-- STAN 2: Uzupełnione ID z Axona (link + edycja) -->
                  <div v-else-if="t.axon_ticket_id" class="flex items-center gap-1">
                    <a
                      :href="`https://axon-connect.ekoenergetyka.com.pl/admin/service-jobs/${encodeURIComponent(t.axon_ticket_id)}`"
                      target="_blank"
                      rel="noopener noreferrer"
                      @click.stop
                      class="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-800 text-slate-800 hover:text-white px-2 py-1 rounded-lg border border-slate-200 hover:border-slate-800 transition-all text-[9px] font-black tracking-wider uppercase truncate"
                      :title="`Otwórz powiązane zlecenie Axon #${t.axon_ticket_id}`"
                    >
                      <span>AC #{{ t.axon_ticket_id }}</span>
                      <svg class="w-2.5 h-2.5 shrink-0 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                    </a>
                    <button
                      type="button"
                      @click.stop="startEditAxonId(t)"
                      class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                      title="Zmień lub usuń ID Axon"
                    >
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                  </div>

                  <!-- STAN 3: Domyślny przycisk przekazania -->
                  <button
                    v-else
                    type="button"
                    @click.stop="initiateAxonForward(t, idx)"
                    class="inline-flex items-center gap-1 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-indigo-300 transition-all active:scale-95 text-[9px] font-black tracking-wider uppercase w-fit cursor-pointer"
                    title="Przekaż zgłoszenie do Axon Connect"
                  >
                    <span>Przekaż do AC</span>
                    <svg class="w-2.5 h-2.5 shrink-0 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                </div>
              </div>

              <!-- STACJA -->
              <div v-else-if="col.id === 'station'" class="h-[148px] overflow-hidden flex flex-col pt-1">
                <div @click.stop="$emit('open-analytics', t.qp_id || t.station_id)" class="font-black text-[13px] text-slate-800 cursor-pointer hover:text-[#58b347] transition-colors mb-1.5" :title="`Otwórz analitykę stacji: ${t.qp_id_full || t.station_id || t.qp_id || '-'}`">
                  {{ getShortQp(t.qp_id || t.station_id) }}
                </div>
                <div @click.stop="$emit('copy', t.product || t.manufacturer)" class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 cursor-pointer hover:text-blue-600 transition-colors w-fit">{{ t.product || t.manufacturer || 'Brak produktu' }}</div>
                <div @click.stop="$emit('copy', [t.city, t.postcode, t.address].filter(Boolean).join(', '))" class="text-[10px] text-slate-400 whitespace-normal leading-tight line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors w-fit">{{ [t.city, t.postcode, t.address].filter(Boolean).join(', ') || 'Brak adresu' }}</div>

                <!-- LINK EOS -->
                <a 
                  v-if="getEosUrl(t)" 
                  :href="getEosUrl(t)" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  @click.stop
                  class="mt-auto mb-1 inline-flex items-center gap-1.5 bg-slate-50 hover:bg-[#f0f7f1] text-slate-600 hover:text-[#2c6623] px-2.5 py-1 rounded-lg border border-slate-200 hover:border-[#58b347]/50 transition-all active:scale-95 w-fit group"
                  title="Otwórz stację w systemie EOS"
                >
                  <span class="text-[10px] font-black tracking-wider leading-none">
                    E<span class="font-mono font-bold text-slate-400">{</span><span class="font-mono font-bold text-[#58b347]">}</span>S
                  </span>
                  <svg class="w-2.5 h-2.5 opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </a>
              </div>

              <!-- KLIENT -->
              <div v-else-if="col.id === 'client_contact'" class="h-[148px] overflow-hidden flex flex-col pt-1">
                <div @click.stop="$emit('copy', t.client)" class="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1 cursor-pointer hover:text-blue-600 transition-colors w-fit">{{ t.client || 'Brak klienta' }}</div>
                <div class="text-[10px] text-slate-500 font-medium mt-1.5 leading-relaxed">
                  <span v-if="t.contact_person" @click.stop="$emit('copy', t.contact_person)" class="block cursor-pointer hover:text-blue-600 w-fit"><span class="font-bold">Osoba:</span> {{ t.contact_person }}</span>
                  <span v-if="t.contact_phone" @click.stop="$emit('copy', t.contact_phone)" class="block cursor-pointer hover:text-blue-600 w-fit"><span class="font-bold">Tel:</span> {{ t.contact_phone }}</span>
                  <span v-if="t.contact_email" @click.stop="$emit('copy', t.contact_email)" class="block cursor-pointer hover:text-blue-600 w-fit"><span class="font-bold">Email:</span> {{ t.contact_email }}</span>
                </div>
              </div>

              <!-- OPIS ZGŁOSZENIA -->
              <div v-else-if="col.id === 'description'" class="h-[148px] overflow-y-auto ticket-custom-scrollbar pr-1 flex flex-col pt-1">
                <div @click.stop="$emit('copy', (t.title || t.subject || '') + '\n' + (t.description || '-'))" class="cursor-pointer hover:text-blue-600 transition-colors">
                  <span v-if="t.title || t.subject" class="block font-black text-[11px] text-slate-800 mb-1.5 uppercase tracking-wider pointer-events-none">{{ t.title || t.subject }}</span>
                  <div class="text-[11px] text-slate-600 font-medium whitespace-pre-wrap break-words leading-relaxed pointer-events-none">{{ t.description || '-' }}</div>
                </div>
              </div>

              <!-- TECHNIK I STATUS WEW. -->
              <div v-else-if="col.id === 'tech_parts'" class="h-[148px] overflow-visible flex flex-col items-start gap-1 relative pt-1">
                <!-- PIGUŁKA TECHNIKA (CZARNY TEKST + WYBÓR Z LISTY) -->
                <div class="relative w-36">
                  <button
                    type="button"
                    @click.stop="toggleTechDrop(t.id)"
                    class="w-full px-2.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-center shadow-sm truncate border transition-all cursor-pointer block hover:brightness-95"
                    :style="getTechPillStyle(t.technician_id)"
                    :title="getTechDisplayName(t.technician_id) ? `Technik: ${getTechDisplayName(t.technician_id)} (kliknij, aby zmienić)` : 'Kliknij, aby przypisać technika'"
                  >
                    {{ getTechDisplayName(t.technician_id) || 'Brak technika' }}
                  </button>

                  <div
                    v-if="activeTechDropId === t.id"
                    @click.stop
                    class="absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto ticket-custom-scrollbar bg-white border border-slate-200 rounded-xl shadow-2xl z-[225] flex flex-col animate-fadeIn"
                  >
                    <div
                      @click="selectTechnician(t, '')"
                      class="px-3 py-2 text-[9px] font-black uppercase text-slate-400 hover:bg-slate-50 cursor-pointer border-b border-slate-100 text-center"
                    >
                      Wyczyść technika
                    </div>
                    <div
                      v-for="tech in availableScheduleTechs"
                      :key="tech.id || tech.name || tech"
                      @click="selectTechnician(t, tech.name || tech)"
                      class="px-3 py-2 text-[10px] font-extrabold uppercase text-slate-900 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-none flex items-center gap-2"
                    >
                      <span
                        class="w-2.5 h-2.5 rounded-full shrink-0 border border-black/15"
                        :style="{ backgroundColor: tech.zone_color || tech.color || '#cbd5e1' }"
                      ></span>
                      <span class="truncate">{{ tech.name || tech }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="relative w-36 mt-1">
                  <button type="button" @click.stop="closeLocalPopovers(); $emit('toggle-drop', t.id)" :class="getStatusColorClass(t.ticket_status)" class="border rounded-xl px-2 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-center shadow-sm cursor-pointer transition-colors w-full truncate block">
                    {{ t.ticket_status || 'BRAK STATUSU' }}
                  </button>
                  <div v-if="activeDropId === t.id" @click.stop class="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-2xl z-[200] overflow-hidden flex flex-col animate-fadeIn">
                    <div @click="$emit('change-status', t, '')" class="px-2 py-2.5 text-[9px] font-black uppercase text-slate-400 hover:bg-slate-50 cursor-pointer text-center border-b border-slate-100">Wyczyść status</div>
                    <div @click="$emit('change-status', t, 'Nowe')" class="px-2 py-2.5 text-[9px] font-black uppercase text-pink-600 hover:bg-pink-50 cursor-pointer text-center border-b border-slate-100">Nowe</div>
                    <div @click="$emit('change-status', t, 'Oczekuje na części')" class="px-2 py-2.5 text-[9px] font-black uppercase text-purple-600 hover:bg-purple-50 cursor-pointer text-center border-b border-slate-100">Oczekuje na części</div>
                    <div @click="$emit('change-status', t, 'Oczekuje na realizację')" class="px-2 py-2.5 text-[9px] font-black uppercase text-blue-600 hover:bg-blue-50 cursor-pointer text-center border-b border-slate-100">Oczekuje na realizację</div>
                    <div @click="$emit('change-status', t, 'Wykonano')" class="px-2 py-2.5 text-[9px] font-black uppercase text-[#58b347] hover:bg-[#eaf5e9] cursor-pointer text-center border-b border-slate-100">Wykonano</div>
                    <div @click="$emit('change-status', t, 'Wstępnie rozliczone')" class="px-2 py-2.5 text-[9px] font-black uppercase text-orange-600 hover:bg-orange-50 cursor-pointer text-center border-b border-slate-100">Wstępnie rozliczone</div>
                    <div @click="$emit('change-status', t, 'Rozliczone')" class="px-2 py-2.5 text-[9px] font-black uppercase text-green-700 hover:bg-green-50 cursor-pointer text-center">Rozliczone</div>
                  </div>
                </div>

                <!-- TERMIN W HARMONOGRAMIE + SZYBKIE PLANOWANIE -->
                <div class="relative w-36 mt-0.5 flex flex-col items-center">
                  <button
                    type="button"
                    @click.stop="openQuickSchedule(t)"
                    class="w-full rounded-xl px-2 py-1.5 text-[9px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 border transition-colors cursor-pointer truncate"
                    :class="getTicketScheduleEvent(t)
                      ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                      : 'bg-white text-slate-400 border-dashed border-slate-300 hover:border-[#58b347] hover:text-[#58b347]'"
                    :title="getTicketScheduleEvent(t) ? 'Kliknij, aby dodać kolejną wizytę lub zmienić termin' : 'Kliknij, aby zaplanować w harmonogramie'"
                  >
                    <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span class="truncate">{{ getTicketScheduleEvent(t) ? formatScheduleDate(getTicketScheduleEvent(t).start_time) : 'Zaplanuj' }}</span>
                  </button>

                  <!-- NAPIS "POPRZEDNIE WIZYTY" + TOOLTIP ZE WSZYSTKIMI WIZYTAMI -->
                  <div
                    v-if="getTicketScheduleEvents(t).length > 1"
                    class="relative group/visits w-full text-center mt-1"
                    @click.stop
                  >
                    <span class="inline-block text-[8.5px] leading-none font-extrabold uppercase tracking-wider text-slate-400 group-hover/visits:text-sky-600 border-b border-dashed border-slate-300 group-hover/visits:border-sky-400 pb-0.5 cursor-help transition-colors">
                      Poprzednie wizyty ({{ getTicketScheduleEvents(t).length - 1 }})
                    </span>

                    <!-- Dymek (Tooltip) ze wszystkimi wizytami -->
                    <div class="hidden group-hover/visits:flex flex-col gap-1.5 absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-60 bg-slate-900 text-white rounded-xl p-3 shadow-2xl z-[240] text-left pointer-events-none">
                      <div class="text-[8px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-700/80 pb-1 flex justify-between">
                        <span>Wszystkie wizyty</span>
                        <span>{{ getTicketScheduleEvents(t).length }}</span>
                      </div>
                      <div
                        v-for="(ev, evIdx) in getTicketScheduleEvents(t)"
                        :key="ev.id || evIdx"
                        class="flex items-center justify-between gap-2 text-[10px]"
                      >
                        <div class="flex items-center gap-1.5 shrink-0">
                          <span class="w-1.5 h-1.5 rounded-full" :class="evIdx === 0 ? 'bg-emerald-400' : 'bg-slate-500'"></span>
                          <span class="font-bold font-mono" :class="evIdx === 0 ? 'text-emerald-300' : 'text-slate-200'">
                            {{ formatScheduleDateFull(ev.start_time) }}
                          </span>
                        </div>
                        <span class="text-[9px] font-semibold text-slate-300 truncate">
                          {{ getEventTechName(ev) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- POPOVER KALENDARZA -->
                  <div
                    v-if="activeScheduleTicketId === t.id"
                    @click.stop
                    class="absolute top-full left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[235] p-3 flex flex-col gap-2.5 animate-fadeIn text-left"
                  >
                    <div class="text-[9px] font-black uppercase tracking-widest text-slate-400">Termin w harmonogramie</div>

                    <!-- Przełącznik: Nowa wizyta vs Edycja obecnej (gdy zlecenie ma już historię wizyt) -->
                    <div v-if="getTicketScheduleEvent(t)" class="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        @click="switchScheduleMode(t, 'NEW')"
                        class="py-1 px-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        :class="scheduleForm.mode === 'NEW' ? 'bg-white text-[#58b347] shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                      >
                        + Nowa wizyta
                      </button>
                      <button
                        type="button"
                        @click="switchScheduleMode(t, 'EDIT')"
                        class="py-1 px-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer truncate"
                        :class="scheduleForm.mode === 'EDIT' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                      >
                        Zmień ({{ formatScheduleDate(getTicketScheduleEvent(t).start_time) }})
                      </button>
                    </div>

                    <input
                      type="date"
                      v-model="scheduleForm.date"
                      class="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-[#58b347]"
                    />

                    <select
                      v-model="scheduleForm.tech"
                      class="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-[#58b347]"
                    >
                      <option value="">-- Wybierz technika --</option>
                      <option v-for="tech in availableScheduleTechs" :key="tech.id || tech.name || tech" :value="tech.id || tech.name || tech">
                        {{ tech.name || tech }}
                      </option>
                    </select>

                    <div class="flex gap-1.5 pt-1">
                      <button
                        type="button"
                        @click="activeScheduleTicketId = null"
                        class="flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Anuluj
                      </button>
                      <button
                        type="button"
                        @click="saveQuickSchedule(t)"
                        class="flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white bg-[#58b347] hover:bg-[#499b3a] transition-colors shadow-sm cursor-pointer"
                      >
                        {{ (scheduleForm.mode === 'EDIT' && getTicketScheduleEvent(t)) ? 'Zmień' : 'Dodaj' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ZAPOTRZEBOWANIE I ZUŻYTE CZĘŚCI -->
              <div v-else-if="col.id === 'used_parts'" class="h-[148px] overflow-y-auto ticket-custom-scrollbar pr-1 flex flex-col gap-2 pt-1 cursor-pointer hover:bg-slate-50 transition-colors" @click.stop="$emit('open-diagnose', t.id || t.ticket_code || t.ticket_number)" title="Kliknij, aby otworzyć Diagnozę i Części">
                 <div v-if="t.parts_str" class="bg-[#f0f7f1] border border-[#58b347]/30 p-2.5 rounded-xl shadow-sm pointer-events-none">
                   <span class="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-[#58b347] text-white mb-1.5">Zużyte z magazynu</span>
                   <div class="text-[10px] font-bold text-slate-700 whitespace-pre-wrap leading-relaxed">{{ t.parts_str }}</div>
                 </div>
                 <div v-if="t.raw_info || t.req_status" class="pointer-events-none" v-html="getPartsHtml(t.raw_info, t.req_status)"></div>
                 <span v-else-if="!t.parts_str" class="text-slate-400 italic text-[10px] pointer-events-none">Brak części (kliknij, aby dodać)</span>
              </div>

              <!-- DIAGNOZA -->
              <div v-else-if="col.id === 'diagnoza'" class="h-[148px] overflow-y-auto ticket-custom-scrollbar pr-1 flex flex-col pt-1 cursor-pointer hover:bg-blue-50 transition-colors" @click.stop="$emit('open-diagnose', t.id || t.ticket_code || t.ticket_number)">
                <div class="text-[10px] text-slate-600 font-medium whitespace-pre-wrap leading-relaxed mb-2 pointer-events-none">
                  <span class="font-bold text-slate-800 uppercase tracking-widest text-[9px]">Diagnoza:</span><br>{{ t.raw_diagnoza || '-' }}
                </div>
                <div class="text-[10px] text-slate-500 font-medium whitespace-pre-wrap leading-relaxed border-t border-slate-100 pt-1.5 mt-auto shrink-0 pointer-events-none">
                  <span class="font-bold text-slate-800 uppercase tracking-widest text-[9px]">Notatki:</span><br>{{ t.notes || '-' }}
                </div>
              </div>

              <!-- RAPORT / ROZLICZENIE / WYMAGA UWAGI -->
              <div v-else-if="col.id === 'audit'" class="h-[148px] overflow-visible flex flex-col justify-between py-0.5 relative">
                
                <!-- 1. RAPORT + SKRÓT DO TECZKI -->
                <div class="flex items-center gap-1 w-full">
                  <a
                    :href="getReportInfo(t).url"
                    target="_blank"
                    rel="noopener noreferrer"
                    @click.stop
                    class="flex-1 min-w-0 rounded-xl px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider border flex items-center justify-between gap-1 transition-all"
                    :class="getReportInfo(t).badgeClass"
                    :title="getReportInfo(t).title"
                  >
                    <span class="truncate">{{ getReportInfo(t).label }}</span>
                    <svg class="w-2.5 h-2.5 shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                  </a>
                  <button
                    type="button"
                    @click.stop="$emit('open-attachments', t)"
                    class="px-2 py-1 rounded-xl border transition-colors shrink-0 cursor-pointer"
                    :class="(t.report_url || t.attachments_url || (t.attachments && t.attachments.length > 0))
                      ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700'"
                    title="Otwórz Teczkę Sprawy (raporty, zdjęcia, oferty)"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  </button>
                </div>

                <!-- 2. OFERTA (ZALEŻNA OD ROLI) -->
                <div class="relative w-full">
                  <!-- Gdy oferta jest aktywna (Prośba / W toku / Wysłana / Zaakceptowana / Odrzucona) -->
                  <button
                    v-if="getOfferState(t)"
                    type="button"
                    @click.stop="openOfferPopover(t)"
                    class="w-full rounded-xl px-2.5 py-1 text-left border transition-all cursor-pointer flex flex-col"
                    :class="getOfferBadgeInfo(t).badgeClass"
                    :title="t.offer_note ? `${getOfferBadgeInfo(t).label} — ${t.offer_note}` : getOfferBadgeInfo(t).label"
                  >
                    <div class="flex items-center justify-between gap-1 text-[9px] font-black uppercase tracking-wider w-full">
                      <span class="flex items-center gap-1.5 truncate">
                        <span v-if="getOfferState(t) === 'REQUESTED'" class="w-1.5 h-1.5 rounded-full bg-violet-600 animate-ping shrink-0"></span>
                        <span class="truncate">{{ getOfferBadgeInfo(t).label }}</span>
                      </span>
                    </div>
                  </button>

                  <!-- Gdy BRAK oferty: rola powyżej Technika -> Przygotuj ofertę -->
                  <button
                    v-else-if="canPrepareOffer"
                    type="button"
                    @click.stop="openOfferPopover(t)"
                    class="w-full rounded-xl px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest border border-dashed border-slate-300 text-slate-400 bg-white/70 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors cursor-pointer text-center truncate"
                  >
                    + Przygotuj ofertę
                  </button>

                  <!-- Gdy BRAK oferty: Technik i niżej -> Poproś o ofertę -->
                  <button
                    v-else
                    type="button"
                    @click.stop="openOfferPopover(t)"
                    class="w-full rounded-xl px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest border border-dashed border-slate-300 text-slate-500 bg-white/70 hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50/50 transition-colors cursor-pointer text-center truncate"
                  >
                    + Poproś o ofertę
                  </button>

                  <!-- POPOVER OFERTY -->
                  <div
                    v-if="activeOfferTicketId === t.id"
                    @click.stop
                    class="absolute right-0 top-full mt-1.5 w-68 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[235] p-3.5 flex flex-col gap-2.5 animate-fadeIn text-left"
                  >
                    <!-- WIDOK A: KONTA POWYŻEJ TECHNIKA (Przygotowanie / edycja oferty) -->
                    <template v-if="canPrepareOffer">
                      <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span class="text-[9px] font-black uppercase tracking-widest text-indigo-700">Oferta handlowa (OES)</span>
                        <button type="button" @click="activeOfferTicketId = null" class="text-slate-400 hover:text-slate-600 text-xs font-black cursor-pointer">✕</button>
                      </div>

                      <div v-if="getOfferState(t) === 'REQUESTED' && t.offer_by" class="text-[9px] font-bold text-violet-700 bg-violet-50 border border-violet-200 rounded-lg px-2 py-1">
                        Prośba od: {{ t.offer_by }}
                      </div>

                      <div>
                        <label class="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Status oferty</label>
                        <select
                          v-model="offerForm.status"
                          class="w-full text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500"
                        >
                          <option value="REQUESTED">Do wyceny (Prośba)</option>
                          <option value="IN_PROGRESS">W przygotowaniu</option>
                          <option value="SENT">Wysłana do klienta</option>
                          <option value="ACCEPTED">Zaakceptowana</option>
                          <option value="REJECTED">Odrzucona</option>
                        </select>
                      </div>

                      <div>
                        <label class="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Numer oferty</label>
                        <input
                          type="text"
                          v-model="offerForm.number"
                          placeholder="np. OES/045/2026"
                          class="w-full text-[11px] font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label class="block text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">Zakres / notatka</label>
                        <textarea
                          v-model="offerForm.note"
                          rows="2"
                          placeholder="Co obejmuje wycena..."
                          class="w-full text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none focus:border-indigo-500 resize-none"
                        ></textarea>
                      </div>

                      <button
                        type="button"
                        @click="activeOfferTicketId = null; $emit('open-attachments', t)"
                        class="w-full py-1.5 px-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors text-center cursor-pointer"
                      >
                        Wgraj plik oferty w Teczce ↗
                      </button>

                      <div class="flex gap-1.5 pt-0.5">
                        <button
                          v-if="getOfferState(t)"
                          type="button"
                          @click="clearOfferData(t)"
                          class="px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          Usuń
                        </button>
                        <button
                          type="button"
                          @click="activeOfferTicketId = null"
                          class="px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors ml-auto cursor-pointer"
                        >
                          Anuluj
                        </button>
                        <button
                          type="button"
                          @click="savePreparedOffer(t)"
                          class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                        >
                          Zapisz
                        </button>
                      </div>
                    </template>

                    <!-- WIDOK B: TECHNIK I NIŻEJ (Prośba o ofertę lub podgląd gotowej oferty) -->
                    <template v-else>
                      <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span class="text-[9px] font-black uppercase tracking-widest text-violet-700">
                          {{ (!getOfferState(t) || getOfferState(t) === 'REQUESTED') ? 'Poproś o ofertę' : 'Szczegóły oferty' }}
                        </span>
                        <button type="button" @click="activeOfferTicketId = null" class="text-slate-400 hover:text-slate-600 text-xs font-black cursor-pointer">✕</button>
                      </div>

                      <!-- Formularz prośby, gdy oferty jeszcze nie wystawiono -->
                      <template v-if="!getOfferState(t) || getOfferState(t) === 'REQUESTED'">
                        <div class="flex flex-wrap gap-1">
                          <button
                            v-for="tag in quickOfferReasons"
                            :key="tag"
                            type="button"
                            @click="offerForm.note = tag"
                            class="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-slate-600 transition-colors cursor-pointer"
                          >
                            {{ tag }}
                          </button>
                        </div>

                        <textarea
                          v-model="offerForm.note"
                          rows="3"
                          placeholder="Opisz zakres do wyceny (części, uszkodzenie mechaniczne itp.)..."
                          class="w-full text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none focus:border-violet-400 resize-none"
                        ></textarea>

                        <div class="flex gap-1.5 pt-0.5">
                          <button
                            v-if="getOfferState(t) === 'REQUESTED'"
                            type="button"
                            @click="clearOfferData(t)"
                            class="px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            Wycofaj
                          </button>
                          <button
                            type="button"
                            @click="activeOfferTicketId = null"
                            class="px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors ml-auto cursor-pointer"
                          >
                            Anuluj
                          </button>
                          <button
                            type="button"
                            @click="submitOfferRequest(t)"
                            class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-white bg-violet-600 hover:bg-violet-700 transition-colors shadow-sm cursor-pointer"
                          >
                            Wyślij prośbę
                          </button>
                        </div>
                      </template>

                      <!-- Podgląd dla technika, gdy biuro przygotowało już ofertę -->
                      <template v-else>
                        <div class="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col gap-1 text-[11px]">
                          <div class="font-black text-slate-800">{{ getOfferBadgeInfo(t).label }}</div>
                          <div v-if="t.offer_note" class="text-slate-600 whitespace-pre-wrap">{{ t.offer_note }}</div>
                        </div>
                        <button
                          type="button"
                          @click="activeOfferTicketId = null; $emit('open-attachments', t)"
                          class="w-full py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
                        >
                          Otwórz Teczkę Sprawy
                        </button>
                      </template>
                    </template>
                  </div>
                </div>

                <!-- 3. ROZLICZENIE -->
                <div
                  class="w-full rounded-xl px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider border text-center truncate"
                  :class="getSettlementInfo(t).badgeClass"
                >
                  {{ getSettlementInfo(t).label }}
                </div>

                <!-- 3. WYMAGA UWAGI (zależne od roli) -->
                <div class="relative w-full">
                  <!-- Gdy jest AKTYWNA lub ODŁOŻONA uwaga (widzą wszyscy) -->
                  <button
                    v-if="getAttentionState(t) === 'ACTIVE' || getAttentionState(t) === 'LATER'"
                    type="button"
                    @click.stop="openAttentionPopover(t)"
                    class="w-full rounded-xl px-2.5 py-1.5 text-left border transition-all cursor-pointer flex flex-col"
                    :class="getAttentionState(t) === 'ACTIVE'
                      ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100 shadow-sm'
                      : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'"
                  >
                    <div class="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider">
                      <span v-if="getAttentionState(t) === 'ACTIVE'" class="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping shrink-0"></span>
                      <span class="truncate">{{ getAttentionState(t) === 'ACTIVE' ? 'Wymaga uwagi!' : 'Na później' }}</span>
                    </div>
                    <span v-if="t.attention_note" class="text-[9px] font-semibold opacity-85 truncate w-full mt-0.5">
                      {{ t.attention_note }}
                    </span>
                  </button>

                  <!-- Gdy uwaga została WYKONANA przez rolę niższą -->
                  <button
                    v-else-if="getAttentionState(t) === 'DONE'"
                    type="button"
                    @click.stop="canManageAttention ? openAttentionPopover(t) : null"
                    class="w-full rounded-xl px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200 text-center truncate"
                    :class="canManageAttention ? 'cursor-pointer hover:bg-emerald-100' : 'cursor-default'"
                  >
                    ✓ Uwaga wykonana
                  </button>

                  <!-- Gdy BRAK uwagi: przycisk dodawania tylko dla kont powyżej Dispatchera -->
                  <button
                    v-else-if="canManageAttention"
                    type="button"
                    @click.stop="openAttentionPopover(t)"
                    class="w-full rounded-xl px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest border border-dashed border-slate-300 text-slate-400 hover:border-red-400 hover:text-red-600 hover:bg-red-50/40 transition-colors cursor-pointer text-center truncate"
                  >
                    + Wymaga uwagi
                  </button>

                  <!-- Gdy BRAK uwagi: widok dla ról niższych -->
                  <div
                    v-else
                    class="w-full rounded-xl px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-slate-300 border border-slate-100 text-center truncate"
                  >
                    Brak uwag
                  </div>

                  <!-- POPOVER: WYMAGA UWAGI -->
                  <div
                    v-if="activeAttentionTicketId === t.id"
                    @click.stop
                    class="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[230] p-3.5 flex flex-col gap-2.5 animate-fadeIn"
                  >
                    <!-- WIDOK 1: ROLA POWYŻEJ DISPATCHERA (Dodawanie / Edycja / Usuwanie) -->
                    <template v-if="canManageAttention">
                      <div class="flex items-center justify-between">
                        <span class="text-[9px] font-black uppercase tracking-widest text-red-600">Flaga: Wymaga uwagi</span>
                        <span v-if="getAttentionState(t) === 'LATER'" class="text-[8px] font-black uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Odłożone</span>
                        <span v-else-if="getAttentionState(t) === 'DONE'" class="text-[8px] font-black uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Wykonane</span>
                      </div>

                      <!-- Szybkie powody -->
                      <div class="flex flex-wrap gap-1">
                        <button
                          v-for="reason in quickAttentionReasons"
                          :key="reason"
                          type="button"
                          @click="attentionForm.note = reason"
                          class="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 transition-colors"
                        >
                          {{ reason }}
                        </button>
                      </div>

                      <textarea
                        v-model="attentionForm.note"
                        rows="2"
                        placeholder="Wpisz dlaczego wymaga uwagi..."
                        class="w-full text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2 outline-none focus:border-red-400 resize-none"
                      ></textarea>

                      <div class="flex gap-1.5 pt-0.5">
                        <button
                          v-if="getAttentionState(t)"
                          type="button"
                          @click="clearAttentionFlag(t)"
                          class="px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          Usuń
                        </button>
                        <button
                          type="button"
                          @click="activeAttentionTicketId = null"
                          class="px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors ml-auto"
                        >
                          Anuluj
                        </button>
                        <button
                          type="button"
                          @click="saveAttentionFlag(t)"
                          class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                        >
                          Zapisz
                        </button>
                      </div>
                    </template>

                    <!-- WIDOK 2: KONTA PONIŻEJ (Odczyt notatki + Wykonaj / Wykonaj później) -->
                    <template v-else>
                      <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <span class="text-[9px] font-black uppercase tracking-widest text-red-600">Zadanie / Wymaga uwagi</span>
                        <button type="button" @click="activeAttentionTicketId = null" class="text-slate-400 hover:text-slate-600 text-xs font-black">✕</button>
                      </div>

                      <div class="bg-red-50/70 border border-red-100 rounded-xl p-2.5 text-[11px] font-semibold text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {{ t.attention_note || 'Prośba o weryfikację zgłoszenia.' }}
                        <div v-if="t.attention_by" class="text-[9px] font-bold text-slate-400 mt-1">Dodał: {{ t.attention_by }}</div>
                      </div>

                      <div class="flex gap-1.5 pt-0.5">
                        <button
                          type="button"
                          @click="handleUserAttentionAction(t, 'LATER')"
                          class="flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors"
                        >
                          Wykonaj później
                        </button>
                        <button
                          type="button"
                          @click="handleUserAttentionAction(t, 'DONE')"
                          class="flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-white bg-[#58b347] hover:bg-[#499b3a] transition-colors shadow-sm"
                        >
                          Wykonaj
                        </button>
                      </div>
                    </template>
                  </div>
                </div>

              </div>

            </td>
          </tr>
        </tbody>
      </table>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTicketsStore } from '../../stores/useTicketsStore'
import { useScheduleStore } from '../../stores/useScheduleStore'
import { useAuthStore } from '../../stores/useAuthStore'
import SkeletonCard from '../../common/SkeletonCard.vue'

const props = defineProps({
  tickets: Array,
  isLoading: Boolean,
  visibleColumns: Array,
  selectedIds: Array,
  currentSort: Object,
  activeDropId: [String, Number]
})

const emit = defineEmits([
  'sort', 'toggle-select-all', 'toggle-select', 'copy', 
  'open-attachments', 'open-diagnose', 'open-analytics', 
  'toggle-drop', 'change-status', 'drag-start', 'drop-col',
  'update-attention', 'change-tech', 'update-axon-transfer', 'update-offer'
])

const store = useTicketsStore()

const scheduleStore = useScheduleStore()

const authStore = useAuthStore()

// Role powyżej Dispatchera mogące nadawać i usuwać flagę "Wymaga uwagi"
const ELEVATED_ROLES = ['ADMIN', 'SUPERADMIN', 'ZARZAD', 'MANAGER', 'KOORDYNATOR', '*']
const canManageAttention = computed(() => {
  const role = String(authStore.user?.role || '').toUpperCase().trim()
  return ELEVATED_ROLES.includes(role)
})

// Role powyżej Technika (widzą "Przygotuj ofertę"; Technik i niżej widzą "Poproś o ofertę")
const OFFER_CREATOR_ROLES = ['ADMIN', 'SUPERADMIN', 'ZARZAD', 'MANAGER', 'KOORDYNATOR', 'DISPATCHER', 'HANDLOWIEC', '*']
const canPrepareOffer = computed(() => {
  const role = String(authStore.user?.role || '').toUpperCase().trim()
  return OFFER_CREATOR_ROLES.includes(role)
})

const activeOfferTicketId = ref(null)
const offerForm = ref({ status: 'IN_PROGRESS', number: '', note: '' })
const quickOfferReasons = ['Uszkodzenie mech.', 'Kabel / wtyczka', 'Pogwarancyjne', 'Modernizacja']

const getOfferState = (t) => {
  const st = String(t.offer_status || '').toUpperCase().trim()
  if (['REQUESTED', 'IN_PROGRESS', 'SENT', 'ACCEPTED', 'REJECTED'].includes(st)) return st
  if (t.offer_number && String(t.offer_number).trim()) return 'SENT'
  return ''
}

const getOfferBadgeInfo = (t) => {
  const st = getOfferState(t)
  const num = String(t.offer_number || '').trim()

  if (st === 'REQUESTED') {
    return {
      label: 'Prośba o ofertę!',
      badgeClass: 'bg-violet-50 text-violet-800 border-violet-300 hover:bg-violet-100 shadow-sm'
    }
  }
  if (st === 'ACCEPTED') {
    return {
      label: num ? `✓ ${num}` : 'Oferta zaakcept.',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
    }
  }
  if (st === 'SENT') {
    return {
      label: num ? `Oferta: ${num}` : 'Oferta wysłana',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100'
    }
  }
  if (st === 'REJECTED') {
    return {
      label: num ? `✕ ${num}` : 'Oferta odrzucona',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
    }
  }
  return {
    label: num ? `Wycena: ${num}` : 'Oferta w toku',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100'
  }
}

const openOfferPopover = (t) => {
  activeScheduleTicketId.value = null
  activeAttentionTicketId.value = null
  activeTechDropId.value = null
  emit('toggle-drop', null)

  if (activeOfferTicketId.value === t.id) {
    activeOfferTicketId.value = null
    return
  }

  const curState = getOfferState(t)
  offerForm.value = {
    status: curState || (canPrepareOffer.value ? 'IN_PROGRESS' : 'REQUESTED'),
    number: t.offer_number || '',
    note: t.offer_note || ''
  }
  activeOfferTicketId.value = t.id
}

const persistOffer = (t, status, number, note) => {
  t.offer_status = status
  t.offer_number = number
  t.offer_note = note
  if (status === 'REQUESTED' || (!t.offer_by && status)) {
    t.offer_by = authStore.user?.username || ''
  }
  if (!status) t.offer_by = ''

  const payload = {
    ticketId: t.id || t.ticket_code || t.ticket_number,
    offer_status: status,
    offer_number: number,
    offer_note: note,
    offer_by: t.offer_by || '',
    module: store.activeModule
  }

  if (typeof store.updateTicketOffer === 'function') {
    store.updateTicketOffer(payload)
  }
  emit('update-offer', payload)
  activeOfferTicketId.value = null
}

const submitOfferRequest = (t) => {
  const cleanNote = offerForm.value.note.trim() || 'Prośba o przygotowanie oferty'
  persistOffer(t, 'REQUESTED', '', cleanNote)
}

const savePreparedOffer = (t) => {
  const cleanNum = offerForm.value.number.trim()
  let nextStatus = offerForm.value.status || 'IN_PROGRESS'
  if (nextStatus === 'REQUESTED' && cleanNum) {
    nextStatus = 'IN_PROGRESS'
  }
  persistOffer(t, nextStatus, cleanNum, offerForm.value.note.trim())
}

const clearOfferData = (t) => {
  persistOffer(t, '', '', '')
}

const RAPORT_GENERATOR_URL = 'https://script.google.com/a/macros/ekoen.pl/s/AKfycbyutQBrnhgc86izuiNHx1OSJqJMevrPrDd-IVs36IRZ_PsIMnuxggiAcsVvdi09Rv8/exec'

const getReportInfo = (t) => {
  const shortQp = getShortQp(t.qp_id || t.station_id)
  const tId = t.ticket_code || t.ticket_number || t.id || ''
  const genUrl = `${RAPORT_GENERATOR_URL}?qp=${encodeURIComponent(shortQp !== '-' ? shortQp : '')}&ticketId=${encodeURIComponent(tId)}${t.technician_id ? '&tech=' + encodeURIComponent(t.technician_id) : ''}`

  const directUrl = t.report_url || t.raport_url || ''
  const sysStatus = String(t.status || '').toUpperCase()
  const workStatus = String(t.ticket_status || '').toLowerCase()
  const isWorkDone = workStatus.includes('wykonano') || workStatus.includes('rozlicz')

  if (directUrl) {
    return { label: 'Raport PDF', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', url: directUrl, title: 'Otwórz zapisany raport' }
  }
  if (sysStatus.includes('REPORT') || sysStatus.includes('CLOSED')) {
    return { label: 'Raport w AC', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', url: getAxonUrl(t) || genUrl, title: 'Raport złożony w Axon Connect' }
  }
  if (isWorkDone) {
    return { label: 'Brak raportu!', badgeClass: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100', url: genUrl, title: 'Zlecenie wykonane bez raportu — kliknij, aby wygenerować PDF' }
  }
  return { label: 'Generuj raport', badgeClass: 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700', url: genUrl, title: 'Otwórz generator raportu PDF' }
}

const getSettlementInfo = (t) => {
  const sett = String(t.settlement_status || '').trim()
  const workStatus = String(t.ticket_status || '').toLowerCase()

  if (sett) {
    return { label: sett, badgeClass: 'bg-green-50 text-green-700 border-green-300' }
  }
  if (workStatus.includes('rozliczone') && !workStatus.includes('wstępnie') && !workStatus.includes('wstepnie')) {
    return { label: 'Rozliczone', badgeClass: 'bg-green-50 text-green-700 border-green-300' }
  }
  if (workStatus.includes('wstępnie rozlicz') || workStatus.includes('wstepnie rozlicz')) {
    return { label: 'Wstępnie rozlicz.', badgeClass: 'bg-orange-50 text-orange-600 border-orange-200' }
  }
  if (workStatus.includes('wykonano')) {
    return { label: 'Do rozliczenia', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' }
  }
  return { label: 'Nierozliczone', badgeClass: 'bg-slate-50 text-slate-400 border-slate-200' }
}

// --- LOGIKA: WYMAGA UWAGI ---
const activeAttentionTicketId = ref(null)
const attentionForm = ref({ note: '' })
const quickAttentionReasons = ['Brak raportu!', 'Brak rozliczenia!', 'Brak zdjęć / logów', 'Pilny kontakt!']

const getAttentionState = (t) => {
  const st = String(t.attention_status || '').toUpperCase().trim()
  if (st === 'ACTIVE' || st === 'LATER' || st === 'DONE') return st
  if (t.requires_attention === true || t.requires_attention === 'TAK') return 'ACTIVE'
  return ''
}

const openAttentionPopover = (t) => {
  activeOfferTicketId.value = null
  activeTechDropId.value = null
  activeScheduleTicketId.value = null
  if (activeAttentionTicketId.value === t.id) {
    activeAttentionTicketId.value = null
    return
  }
  attentionForm.value = { note: t.attention_note || '' }
  activeAttentionTicketId.value = t.id
}

const persistAttention = (t, status, note) => {
  t.attention_status = status
  t.attention_note = note
  if (status === 'ACTIVE') {
    t.attention_by = authStore.user?.username || ''
  }

  const payload = {
    ticketId: t.id || t.ticket_code || t.ticket_number,
    attention_status: status,
    attention_note: note,
    attention_by: t.attention_by || ''
  }

  if (typeof store.updateTicketAttention === 'function') {
    store.updateTicketAttention(payload)
  }
  emit('update-attention', payload)
  activeAttentionTicketId.value = null
}

const saveAttentionFlag = (t) => {
  const cleanNote = attentionForm.value.note.trim() || 'Wymaga weryfikacji'
  persistAttention(t, 'ACTIVE', cleanNote)
}

const clearAttentionFlag = (t) => {
  persistAttention(t, '', '')
}

const handleUserAttentionAction = (t, newStatus) => {
  persistAttention(t, newStatus, t.attention_note || '')
}

const activeScheduleTicketId = ref(null)
const scheduleForm = ref({ date: '', tech: '', mode: 'NEW' })

const availableScheduleTechs = computed(() => {
  return scheduleStore.techList.length > 0 ? scheduleStore.techList : (store.techList || [])
})

const parseScheduleTimestamp = (raw) => {
  if (!raw) return 0
  const str = String(raw).trim()
  const direct = new Date(str).getTime()
  if (!isNaN(direct)) return direct

  const plMatch = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (plMatch) {
    return new Date(Number(plMatch[3]), Number(plMatch[2]) - 1, Number(plMatch[1])).getTime()
  }
  return 0
}

// Wszystkie wizyty danego zgłoszenia posortowane od najnowszej do najstarszej
const getTicketScheduleEvents = (t) => {
  if (!scheduleStore.events || scheduleStore.events.length === 0) return []
  const ids = [t.id, t.ticket_code, t.ticket_number, t.ekoen_code]
    .filter(Boolean)
    .map(v => String(v).toLowerCase().trim())

  return scheduleStore.events
    .filter(ev => {
      const evTid = String(ev.ticket_id || '').toLowerCase().trim()
      return evTid && ids.includes(evTid)
    })
    .sort((a, b) => {
      const diff = parseScheduleTimestamp(b.start_time) - parseScheduleTimestamp(a.start_time)
      if (diff !== 0) return diff
      return parseScheduleTimestamp(b.created_at) - parseScheduleTimestamp(a.created_at)
    })
}

// Najnowsza wizyta wyświetlana na głównej pigułce
const getTicketScheduleEvent = (t) => {
  const all = getTicketScheduleEvents(t)
  return all.length > 0 ? all[0] : null
}

const formatScheduleDate = (startTime) => {
  const ts = parseScheduleTimestamp(startTime)
  if (!ts) return String(startTime || '').split('T')[0]
  return new Date(ts).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })
}

const formatScheduleDateFull = (startTime) => {
  const ts = parseScheduleTimestamp(startTime)
  if (!ts) return String(startTime || '').split('T')[0] || '-'
  return new Date(ts).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const getEventTechName = (ev) => {
  if (ev?.extendedProps?.technicianName && ev.extendedProps.technicianName !== 'BRAK') {
    return ev.extendedProps.technicianName
  }
  return getTechDisplayName(ev?.technician_id) || 'Brak technika'
}

const toInputDateStr = (rawDate) => {
  const ts = parseScheduleTimestamp(rawDate)
  const d = ts ? new Date(ts) : new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const resolveTechValue = (techRaw) => {
  if (!techRaw) return ''
  const matched = availableScheduleTechs.value.find(
    x => String(x.id || '') === String(techRaw) || String(x.name || x).toLowerCase().trim() === String(techRaw).toLowerCase().trim()
  )
  return matched ? (matched.id || matched.name || matched) : techRaw
}

const switchScheduleMode = (t, mode) => {
  const latest = getTicketScheduleEvent(t)
  if (mode === 'EDIT' && latest) {
    scheduleForm.value = {
      mode: 'EDIT',
      date: toInputDateStr(latest.start_time),
      tech: resolveTechValue(latest.technician_id || t.technician_id || '')
    }
  } else {
    scheduleForm.value = {
      mode: 'NEW',
      date: toInputDateStr(new Date()),
      tech: resolveTechValue(t.technician_id || latest?.technician_id || '')
    }
  }
}

const openQuickSchedule = (t) => {
  activeOfferTicketId.value = null
  activeAttentionTicketId.value = null
  activeTechDropId.value = null
  emit('toggle-drop', null)

  if (activeScheduleTicketId.value === t.id) {
    activeScheduleTicketId.value = null
    return
  }

  const latest = getTicketScheduleEvent(t)
  if (!latest) {
    switchScheduleMode(t, 'NEW')
  } else {
    // Jeśli ostatnia wizyta była w przeszłości -> domyślnie dodajemy kolejną wizytę; jeśli dziś/w przyszłości -> edytujemy obecną
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const isPastVisit = parseScheduleTimestamp(latest.start_time) < todayStart.getTime()
    switchScheduleMode(t, isPastVisit ? 'NEW' : 'EDIT')
  }

  activeScheduleTicketId.value = t.id
}

const saveQuickSchedule = (t) => {
  if (!scheduleForm.value.date) return

  const latest = getTicketScheduleEvent(t)
  const isEdit = scheduleForm.value.mode === 'EDIT' && latest
  const shortQp = getShortQp(t.qp_id || t.station_id)
  const titleParts = [shortQp !== '-' ? shortQp : '', t.city || '', t.title || t.subject || ''].filter(Boolean)

  scheduleStore.saveEventToCloud({
    id: isEdit ? latest.id : 'temp_' + Date.now(),
    ticket_id: String(t.id || t.ticket_code || t.ticket_number || ''),
    technician_id: scheduleForm.value.tech,
    title: isEdit ? latest.title : (titleParts.join(' • ') || 'Wizyta serwisowa'),
    description: isEdit ? latest.description : (t.description || ''),
    start_time: `${scheduleForm.value.date}T08:00:00`,
    end_time: `${scheduleForm.value.date}T16:00:00`,
    event_type: isEdit ? latest.event_type : 'service',
    event_subtype: isEdit ? latest.event_subtype : (t.category || 'Awaria'),
    all_day: 'NIE'
  })

  activeScheduleTicketId.value = null
}

const activeTechDropId = ref(null)

const closeLocalPopovers = () => {
  activeOfferTicketId.value = null
  activeOfferTicketId.value = null
  activeScheduleTicketId.value = null
  activeAttentionTicketId.value = null
  activeTechDropId.value = null
}

onMounted(() => {
  if (scheduleStore.events.length === 0) {
    scheduleStore.fetchScheduleData()
  }
  window.addEventListener('click', closeLocalPopovers)
})

onUnmounted(() => {
  window.removeEventListener('click', closeLocalPopovers)
})

const isAllSelected = computed(() => props.tickets.length > 0 && props.selectedIds.length === props.tickets.length)

const getShortQp = (rawQp) => {
  if (!rawQp) return '-'
  const str = String(rawQp).trim()
  const firstDash = str.indexOf('-')
  if (firstDash === -1) return str
  const secondDash = str.indexOf('-', firstDash + 1)
  if (secondDash !== -1) return str.substring(0, secondDash)
  return str
}

const getTicketIdDisplay = (t, idx) => {
  if (t.ekoen_code) return t.ekoen_code
  let isEkoenTicket = (store.activeModule === 'ekoen') || (store.activeModule === 'historia' && (String(t.ticket_number || '').includes('EKOEN') || String(t.ticket_number || '').startsWith('EE_') || !t.ticket_code))
  if (isEkoenTicket) {
    if (t.ticket_number && String(t.ticket_number).startsWith('EE_')) return t.ticket_number
    return `EE_${String(idx + 1).padStart(3, '0')}`
  }
  return t.ticket_code || t.ticket_number || t.id || 'BRAK ID'
}

const getAxonUrl = (t) => {
  if (store.activeModule === 'ekoen') return null
  const num = String(t.ticket_code || t.ticket_number || t.id || '').trim()
  if (!num || num.toUpperCase().includes('EKOEN') || num.startsWith('EE_')) return null
  return `https://axon-connect.ekoenergetyka.com.pl/admin/service-jobs/${encodeURIComponent(num)}`
}

const getEosUrl = (t) => {
  const shortQp = getShortQp(t.qp_id || t.station_id)
  if (!shortQp || shortQp === '-') return null
  return `https://sm-eos.ocpps.ekoenergetyka.com.pl/management/chargepoint?chargePointId=${encodeURIComponent(shortQp)}`
}

// --- TECHNIK: CZARNE LITERY + ZMIANA INLINE ---
const hexToRgba = (hex, alpha) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(148, 163, 184, ${alpha})`
  let c = hex.substring(1).trim()
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  if (c.length !== 6) return `rgba(148, 163, 184, ${alpha})`
  const num = parseInt(c, 16)
  if (isNaN(num)) return `rgba(148, 163, 184, ${alpha})`
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`
}

const findTechObj = (techId) => {
  if (!techId || !String(techId).trim()) return null
  const needle = String(techId).toLowerCase().trim()
  return availableScheduleTechs.value.find(t =>
    String(t.name || t).toLowerCase().trim() === needle ||
    String(t.id || '').toLowerCase().trim() === needle
  ) || null
}

const getTechDisplayName = (techId) => {
  if (!techId || !String(techId).trim()) return ''
  const obj = findTechObj(techId)
  return obj ? (obj.name || obj) : String(techId).trim()
}

const getTechPillStyle = (techId) => {
  if (!techId || !String(techId).trim()) {
    return { backgroundColor: '#ffffff', color: '#64748b', borderColor: '#e2e8f0' }
  }
  const obj = findTechObj(techId)
  const techColor = obj?.zone_color || obj?.color || '#94a3b8'
  return {
    backgroundColor: hexToRgba(techColor, 0.25),
    color: '#0f172a', // Czarne litery dla pełnej czytelności na jasnych kolorach
    borderColor: hexToRgba(techColor, 0.55)
  }
}

const toggleTechDrop = (ticketId) => {
  activeOfferTicketId.value = null
  activeScheduleTicketId.value = null
  activeAttentionTicketId.value = null
  emit('toggle-drop', null)
  activeTechDropId.value = activeTechDropId.value === ticketId ? null : ticketId
}

const selectTechnician = (t, techName) => {
  activeTechDropId.value = null
  emit('change-tech', t, techName)
}

// --- PRZEKAZANIE DO AXON CONNECT (ZAKŁADKA EKOEN) ---
const editingAxonLinkId = ref(null)
const axonIdDrafts = ref({})

const isForwardedToAxon = (t) => {
  return t.forwarded_to_axon === true || String(t.forwarded_to_axon || '').toUpperCase() === 'TAK' || Boolean(t.axon_ticket_id)
}

const getDraftAxonId = (t) => {
  if (axonIdDrafts.value[t.id] !== undefined) return axonIdDrafts.value[t.id]
  return t.axon_ticket_id || ''
}

const setDraftAxonId = (ticketId, val) => {
  axonIdDrafts.value[ticketId] = val
}

const extractCleanAxonId = (raw) => {
  const str = String(raw || '').trim()
  if (!str) return ''
  const urlMatch = str.match(/service-jobs\/([A-Za-z0-9_-]+)/i)
  if (urlMatch && urlMatch[1]) return urlMatch[1]
  return str.replace(/^#/, '').trim()
}

const initiateAxonForward = (t, idx) => {
  t.forwarded_to_axon = 'TAK'
  axonIdDrafts.value[t.id] = t.axon_ticket_id || ''
  editingAxonLinkId.value = t.id

  const payload = {
    ticketId: t.id,
    ekoenCode: getTicketIdDisplay(t, idx),
    forwarded_to_axon: 'TAK',
    axon_ticket_id: t.axon_ticket_id || ''
  }
  store.updateEkoenAxonTransfer(payload)
  emit('update-axon-transfer', payload)
}

const startEditAxonId = (t) => {
  axonIdDrafts.value[t.id] = t.axon_ticket_id || ''
  editingAxonLinkId.value = t.id
}

const saveAxonIdForEkoen = (t, idx) => {
  const cleanId = extractCleanAxonId(getDraftAxonId(t))
  t.forwarded_to_axon = 'TAK'
  t.axon_ticket_id = cleanId
  if (cleanId) editingAxonLinkId.value = null

  const payload = {
    ticketId: t.id,
    ekoenCode: getTicketIdDisplay(t, idx),
    forwarded_to_axon: 'TAK',
    axon_ticket_id: cleanId
  }
  store.updateEkoenAxonTransfer(payload)
  emit('update-axon-transfer', payload)
}

const cancelAxonForward = (t, idx) => {
  t.forwarded_to_axon = ''
  t.axon_ticket_id = ''
  delete axonIdDrafts.value[t.id]
  editingAxonLinkId.value = null

  const payload = {
    ticketId: t.id,
    ekoenCode: getTicketIdDisplay(t, idx),
    forwarded_to_axon: '',
    axon_ticket_id: ''
  }
  store.updateEkoenAxonTransfer(payload)
  emit('update-axon-transfer', payload)
}

const getStatusColorClass = (statusVal) => {
  let sValLow = String(statusVal || '').toLowerCase()
  if (sValLow.includes('części') || sValLow.includes('czesci')) return 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
  if (sValLow.includes('realizacj')) return 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
  if (sValLow.includes('wykonano')) return 'bg-[#f0f7f1] text-[#58b347] border-[#58b347]/30 hover:bg-[#eaf5e9]'
  if (sValLow.includes('wstępnie rozlicz') || sValLow.includes('wstepnie rozlicz')) return 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
  if (sValLow.includes('rozliczone')) return 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
  return 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
}

const getPartsHtml = (rawInfo, reqStatus) => {
  if (!rawInfo && !reqStatus) return '<span class="text-slate-400 italic text-[10px]">Brak danych</span>'
  let infoBlocks = rawInfo ? String(rawInfo).split(/(?=Indeks:)/i) : []
  if(infoBlocks.length === 0 && rawInfo) infoBlocks = [String(rawInfo)]
  infoBlocks = infoBlocks.map(b => b.trim()).filter(Boolean)
  let statusBlocks = reqStatus ? String(reqStatus).split(/\n/).map(s => s.trim()).filter(Boolean) : []
  
  let html = '<div class="flex flex-col gap-3">'
  let maxLen = Math.max(infoBlocks.length, statusBlocks.length)
  for (let i = 0; i < maxLen; i++) {
    let cleanStat = (statusBlocks[i] || '').toUpperCase()
    let statPill = ''
    if (cleanStat) {
      let color = 'bg-slate-100 text-slate-600 border-slate-200'
      if (cleanStat.includes('WYDA') || cleanStat.includes('WYSŁA')) color = 'bg-blue-50 text-blue-700 border-blue-200'
      else if (cleanStat.includes('ODBIORU') || cleanStat.includes('ZIELONA')) color = 'bg-green-50 text-green-700 border-green-200'
      else if (cleanStat.includes('KOMPLETACJA') || cleanStat.includes('WSTRZYMANE')) color = 'bg-purple-50 text-purple-700 border-purple-200'
      else if (cleanStat.includes('BRAK')) color = 'bg-red-50 text-red-700 border-red-200'
      statPill = `<div class="mb-2.5"><span class="inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shadow-sm ${color}">${statusBlocks[i]}</span></div>`
    }
    let formattedInfo = (infoBlocks[i] || '').split('\n').map(line => {
      if(line.toLowerCase().includes('indeks:')) return `<div class="text-[11px] leading-tight text-slate-800 font-bold mb-1.5">${line}</div>`
      return `<div class="text-[10px] leading-relaxed text-slate-500 font-medium">${line}</div>`
    }).join('')
    html += `<div class="bg-white border border-slate-200 p-3 rounded-xl shadow-sm flex flex-col w-full">${statPill}<div class="flex flex-col">${formattedInfo}</div></div>`
  }
  return html + '</div>'
}
</script>