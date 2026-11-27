<template>
  <div class="flex-1 flex w-full relative px-8 py-6 gap-6 z-30 min-h-[1000px]">
    
    <!-- BACKLOG -->
    <div class="w-[340px] bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm flex flex-col shrink-0 h-full overflow-hidden">
      <div class="p-4 border-b border-slate-200 bg-white flex justify-between items-center gap-2 z-10 shrink-0">
        <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 truncate">
          <svg class="w-4 h-4 text-[#58b347] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span class="truncate">Backlog Zgłoszeń</span>
        </h3>
        <div class="flex items-center gap-1.5 shrink-0">
          <button
            v-if="repeatBacklogCount > 0"
            type="button"
            @click="showOnlyRepeatVisits = !showOnlyRepeatVisits"
            class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all cursor-pointer"
            :class="showOnlyRepeatVisits
              ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
              : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'"
            title="Pokaż tylko zlecenia wymagające kolejnej wizyty (Wizyta II+)"
          >
            Wizyta II+: {{ repeatBacklogCount }}
          </button>
          <span v-if="displayedBacklogTickets.length !== totalBacklogCount" class="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
            {{ displayedBacklogTickets.length }} / {{ totalBacklogCount }}
          </span>
          <span v-else class="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
            {{ totalBacklogCount }}
          </span>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto schedule-custom-scrollbar p-4 bg-slate-100/30 flex flex-col">
        <div v-if="store.isLoading" class="text-center text-xs font-bold text-slate-400 py-10 animate-pulse">Ładowanie...</div>
        <div v-else-if="displayedBacklogTickets.length === 0" class="text-center text-xs font-bold text-slate-400 py-10">Brak zgłoszeń.</div>
        
        <div v-for="ticket in displayedBacklogTickets" :key="ticket.t_id"
             draggable="true" @dragstart="onDragStartBacklog($event, ticket)" @dragend="onGlobalDragEnd"
             class="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-all cursor-grab mb-4 flex flex-col group shrink-0"
             :class="[
               ticket.is_repeat_visit ? 'border-violet-200 ring-1 ring-violet-100' : 'border-slate-200',
               {'opacity-40': isDragging && dragPayload?.data?.t_id === ticket.t_id}
             ]"
             :style="`border-left: 6px solid ${ticket.techColor && ticket.techColor !== '#cbd5e1' ? ticket.techColor : '#fcd34d'}`">
          
          <div class="flex justify-between items-start mb-2 pointer-events-none gap-2">
            <div class="flex flex-wrap items-center gap-1.5">
              <span v-if="ticket.t_code" class="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{{ ticket.t_code }}</span>
              <span v-if="ticket.t_qp" class="text-[10px] font-black text-[#58b347] bg-[#58b347]/10 px-2 py-0.5 rounded border border-[#58b347]/20">{{ ticket.t_qp }}</span>
              <span v-if="ticket.is_repeat_visit" class="text-[9px] font-black uppercase tracking-wider text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                Wizyta {{ ticket.next_visit_roman }}
              </span>
            </div>
            <span class="text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest shrink-0" :class="ticket.slaLeft < 24 ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'">SLA: {{ ticket.slaLeft }}H</span>
          </div>
          
          <h4 class="font-bold text-slate-800 text-[12px] leading-tight mb-2 pointer-events-none">{{ ticket.t_title }}</h4>
          <div class="mb-2 pointer-events-none">
            <span class="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded inline-block">{{ ticket.t_category || ticket.t_type || 'Zgłoszenie' }}</span>
          </div>
          <p class="text-[10px] text-slate-500 pointer-events-none flex items-start gap-1.5">
            <svg class="w-3.5 h-3.5 shrink-0 text-slate-400 mt-[1px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span class="truncate leading-tight">{{ ticket.t_address }}</span>
          </p>
          <p v-if="ticket.t_desc" class="text-[10px] text-slate-500 italic mt-2 leading-relaxed line-clamp-2 pointer-events-none">
            {{ ticket.t_desc }}
          </p>

          <!-- PASEK HISTORII POPRZEDNICH WIZYT -->
          <div
            v-if="ticket.is_repeat_visit && ticket.past_visits && ticket.past_visits.length > 0"
            @click.stop="jumpToDate(ticket.past_visits[0].start_time, 'day')"
            class="mt-2.5 px-2.5 py-1.5 rounded-lg bg-violet-50/70 hover:bg-violet-100/80 border border-violet-200/80 flex items-center justify-between gap-2 cursor-pointer transition-colors"
            :title="formatAllPastVisitsTooltip(ticket.past_visits)"
          >
            <div class="flex items-center gap-1.5 min-w-0 text-[9.5px] font-bold text-violet-800 truncate">
              <span class="uppercase font-black text-[8.5px] tracking-wider text-violet-600 shrink-0">Poprz.:</span>
              <span class="font-mono font-black shrink-0">{{ formatPastVisitShort(ticket.past_visits[0].start_time) }}</span>
              <span class="truncate">• {{ getPastVisitTechName(ticket.past_visits[0]) }}</span>
              <span v-if="ticket.past_visits.length > 1" class="px-1 py-0.2 rounded bg-violet-200/70 text-violet-900 text-[8px] font-black shrink-0">
                +{{ ticket.past_visits.length - 1 }}
              </span>
            </div>
            <svg class="w-3 h-3 text-violet-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </div>

          <div class="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 pointer-events-none">
            <span class="text-[11px] font-black uppercase tracking-widest text-slate-700 truncate mr-2">{{ ticket.techName || 'BRAK PRZYPISANIA' }}</span>
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">{{ ticket.t_status || 'NOWE' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- KALENDARZ -->
    <div class="flex-1 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col relative min-w-0 overflow-hidden h-full">
      
      <!-- Nagłówek Kalendarza -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0 z-40 relative" @wheel.prevent="onHeaderScroll">
        <div class="flex items-center gap-2 relative z-10">
          <button @click="cal.navigateCalendar(-1)" class="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
          <button @click="cal.navigateCalendar(1)" class="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
          <button @click="cal.navigateToday(); focusToday()" class="px-4 py-1.5 rounded-lg border border-slate-200 text-[11px] font-black text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest cursor-pointer">Dzisiaj</button>
        </div>

        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span class="text-[12px] font-black text-slate-700 tracking-widest uppercase">
            {{ cal.calendarTitleDisplay.value }}
          </span>
        </div>

        </div>

      <!-- Nagłówek dni dla widoków podstawowych: Miesiąc, Tydzień, Dzień -->
      <div v-if="!isMatrixLayout" class="flex border-b border-slate-200 bg-slate-50 shrink-0" :class="{ 'pr-[6px]': store.currentView !== 'month' }">
        <div class="w-16 shrink-0 border-r border-slate-200" v-if="store.currentView === 'day'"></div>
        <div class="flex-1 grid" :class="store.currentView === 'day' ? 'grid-cols-1' : 'grid-cols-7'">
          <div v-for="day in (store.currentView === 'month' ? ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'] : cal.activeDaysArray.value)" :key="day.YYYY_MM_DD || day" 
               @click="store.currentView === 'week' ? goToDay(day.date) : null"
               class="text-center py-3 border-r border-slate-200 last:border-r-0 font-black text-[10px] uppercase tracking-widest text-slate-400 transition-colors"
               :class="{'cursor-pointer hover:bg-slate-100 hover:text-slate-600': store.currentView === 'week'}">
            <template v-if="store.currentView !== 'month'">
              {{ day.dayName }} <span class="text-lg ml-1 transition-colors" :class="day.isToday ? 'text-[#58b347]' : 'text-slate-800'">{{ day.DD }}</span>
            </template>
            <template v-else>
              {{ day }}
            </template>
          </div>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- WIDOK 1: MIESIĄC                                          -->
      <!-- ========================================================= -->
      <div v-if="!isMatrixLayout && store.currentView === 'month'" class="flex-1 bg-white flex flex-col" @contextmenu.prevent="$emit('rotate-view')" @dblclick="resetToFleet">
        <div class="grid grid-cols-7 flex-1" style="grid-auto-rows: minmax(0, 1fr);">
          <div v-for="day in cal.activeMonthArray.value" :key="day.YYYY_MM_DD" 
               @dragover.prevent="onDragOverColumn($event, day.YYYY_MM_DD)" 
               @drop.stop="onDropDayColumn($event, day.YYYY_MM_DD)"
               @dragleave="onDragLeaveColumn"
               @click="goToDay(day.date)"
               class="border-r border-b border-slate-200 last:border-r-0 relative hover:bg-slate-50 transition-colors cursor-pointer"
               :class="!day.isCurrentMonth ? 'bg-slate-50/50' : ''"
               :style="cal.absencesByDate.value[day.YYYY_MM_DD] && cal.absencesByDate.value[day.YYYY_MM_DD].length ? 'background-image: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 10px, #f1f5f9 10px, #f1f5f9 20px);' : ''">
            
            <div v-if="dragHoverSlot.active && dragHoverSlot.dateStr === day.YYYY_MM_DD" 
                 class="absolute inset-0 bg-[#58b347]/10 border-2 border-dashed border-[#58b347] z-[150] pointer-events-none transition-all duration-75">
            </div>

            <div class="text-right p-2 shrink-0 flex justify-end items-start h-8 relative z-10">
              <span class="text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm" :class="day.isToday ? 'text-white bg-[#58b347]' : 'text-slate-600 bg-slate-200/50'">{{ day.DD }}</span>
            </div>
            
            <div class="absolute top-8 left-1 right-1 bottom-1 flex flex-col gap-1 overflow-y-auto schedule-custom-scrollbar pr-0.5">
              <div v-for="ev in cal.eventsByDate.value[day.YYYY_MM_DD] || []" :key="ev.id"
                   draggable="true" @dragstart="onDragStartEvent($event, ev)" @dragend="onGlobalDragEnd"
                   class="border rounded px-1.5 py-1.5 text-[9px] font-bold cursor-pointer transition-all shrink-0 flex flex-col group/monthcard relative z-10"
                   :class="[
                     ev.extendedProps.event_type === 'absence' ? 'bg-red-50/90 border-red-200 text-red-700' :
                     ev.extendedProps.event_type === 'task' ? 'bg-[#58b347]/10 border-[#58b347]/30 text-slate-700' :
                     'bg-white border-slate-200 text-slate-700',
                     isDragging && dragPayload?.data?.id === ev.id ? 'opacity-40' : 'hover:shadow-md'
                   ]"
                   :style="ev.computedStyle" @contextmenu.stop @click.stop="openEditEventModal(ev)" title="Kliknij, aby edytować wizytę">
                 
                <div class="flex justify-between items-start gap-1 w-full">
                  <span class="text-[8px] uppercase tracking-widest truncate mt-0.5" :style="`color: ${ev.extendedProps.techColor}`">{{ ev.extendedProps.technicianName }}</span>
                  
                  <div class="flex items-center gap-0.5 shrink-0 z-50">
                    <svg v-if="hasAbsenceConflict(ev, day.YYYY_MM_DD)" class="w-3.5 h-3.5 text-red-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" title="Uwaga: Technik jest w tym dniu na urlopie!"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    
                    <button
                      v-if="ev.extendedProps.event_type !== 'absence'"
                      type="button"
                      @click.stop="duplicateEventToNextDay(ev)"
                      class="opacity-0 group-hover/monthcard:opacity-100 text-slate-400 hover:text-sky-600 transition-all p-0.5 -mt-1 bg-white/80 rounded cursor-pointer"
                      title="Duplikuj wizytę na następny dzień"
                    >
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>

                    <button type="button" @click.stop="$emit('confirm-delete-event', ev.id)" class="opacity-0 group-hover/monthcard:opacity-100 text-slate-300 hover:text-red-500 transition-all p-0.5 -mt-1 -mr-1 bg-white/80 rounded cursor-pointer" title="Usuń wizytę"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                  </div>
                </div>
                 
                <div class="flex flex-wrap items-center gap-1 mb-0.5 w-full mt-0.5 pointer-events-none">
                  <template v-if="ev.extendedProps.event_type === 'service'">
                    <span class="text-slate-500 bg-slate-100 rounded px-1 text-[8px] border border-slate-200 truncate">{{ ev.extendedProps.ticketCode }}</span>
                    <span v-if="ev.extendedProps.qpCode" class="text-[#58b347] bg-[#58b347]/10 rounded px-1 text-[8px] border border-[#58b347]/20 truncate">{{ ev.extendedProps.qpCode }}</span>
                    <span v-if="getEventVisitBadge(ev)" class="text-violet-700 bg-violet-50 rounded px-1 text-[8px] border border-violet-200 font-black truncate">{{ getEventVisitBadge(ev) }}</span>
                  </template>
                  <template v-else>
                    <span class="rounded px-1 text-[8px] border font-black uppercase tracking-widest truncate"
                          :class="ev.extendedProps.event_type === 'absence' ? 'bg-red-100 text-red-600 border-red-200' : 'bg-[#58b347]/20 text-[#499b3a] border-[#58b347]/30'">
                      {{ ev.extendedProps.event_subtype }}
                    </span>
                  </template>
                </div>
                <span class="truncate w-full block pointer-events-none" :class="ev.extendedProps.event_type === 'absence' ? 'text-red-800' : ''">{{ ev.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- WIDOK 2: MATRYCA (Technicy w wierszach × Dni w kolumnach) -->
      <!-- ========================================================= -->
      <div
      v-else-if="isMatrixLayout"
      class="flex-1 overflow-auto schedule-custom-scrollbar bg-slate-100/60 flex flex-col relative"
    >
        <div :class="matrixShowWeekend ? 'min-w-[1120px]' : 'min-w-[880px]'" class="flex flex-col flex-1">
          
          <!-- Ciemny przyklejony nagłówek Matrycy -->
          <div class="sticky top-0 z-30 flex bg-[#0f172a] text-white border-b border-slate-800 shadow-sm shrink-0">
            <div
              @dblclick="resetToFleet"
              class="w-[152px] shrink-0 px-3 py-3 border-r border-slate-700/80 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-300 select-none"
              title="Dwuklik resetuje filtr do całej floty"
            >
              TECHNIK
            </div>
            <div class="flex-1 grid" :class="matrixShowWeekend ? 'grid-cols-7' : 'grid-cols-5'">
              <div
                v-for="day in matrixDaysArray"
                :key="'mh_' + day.YYYY_MM_DD"
                class="px-2 py-2.5 text-center border-r border-slate-700/80 last:border-r-0 transition-colors relative select-none"
                :class="day.isToday ? 'bg-[#58b347]/20' : ''"
              >
                <div class="text-[10px] font-bold font-mono" :class="day.isToday ? 'text-[#7ce368]' : 'text-slate-300'">
                  {{ day.DD }}.{{ day.MM }}.{{ day.YYYY }}
                </div>
                <div class="text-[10px] font-black uppercase tracking-widest mt-0.5" :class="day.isToday ? 'text-white' : 'text-slate-100'">
                  {{ day.dayNameFull }}
                </div>
                <div v-if="day.isToday" class="absolute bottom-0 inset-x-0 h-[3px] bg-[#58b347]"></div>
              </div>
            </div>
          </div>

          <!-- Wiersze Techników -->
          <div
            v-for="(tech, techIdx) in matrixTechRows"
            :key="'mrow_' + tech.id"
            class="bg-white border-b-2 border-slate-200/90 flex flex-col"
          >
            <div class="flex flex-1">
              <!-- Kolumna Technika -->
              <div
                @dblclick="resetToFleet"
                class="w-[152px] shrink-0 border-r border-slate-200 px-3 py-4 flex flex-col items-center justify-center text-center bg-white relative select-none"
              >
                <div class="absolute left-0 top-0 bottom-0 w-1.5" :style="{ backgroundColor: tech.color }"></div>
                <span class="text-[12px] font-extrabold text-slate-800 leading-snug break-words">
                  {{ tech.name }}
                </span>
                <span
                  class="mt-1.5 text-[9px] font-black px-2 py-0.5 rounded-full border"
                  :class="getMatrixTechWeekCount(tech) > 0
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-400 border-slate-200'"
                >
                  {{ getMatrixTechWeekCount(tech) }} wiz.
                </span>
              </div>

              <!-- Komórki Dni dla Technika -->
              <div class="flex-1 grid" :class="matrixShowWeekend ? 'grid-cols-7' : 'grid-cols-5'">
                <div
                  v-for="day in matrixDaysArray"
                  :key="tech.id + '_' + day.YYYY_MM_DD"
                  @dragover.prevent="onDragOverMatrixCell($event, tech, day.YYYY_MM_DD)"
                  @dragleave="onDragLeaveMatrixCell(tech.id, day.YYYY_MM_DD)"
                  @drop.stop="onDropMatrixCell($event, tech, day.YYYY_MM_DD)"
                  class="border-r border-slate-200/80 last:border-r-0 p-2 flex flex-col gap-2 relative transition-colors min-w-0"
                  :class="day.isToday ? 'bg-[#58b347]/[0.03]' : ''"
                >
                  <!-- Podświetlenie Drag & Drop na komórce matrycy -->
                  <div
                    v-if="matrixDragHover.active && matrixDragHover.techId === tech.id && matrixDragHover.dateStr === day.YYYY_MM_DD"
                    class="absolute inset-1 rounded-xl border-2 border-dashed z-40 pointer-events-none flex items-center justify-center"
                    :class="matrixDragHover.blocked
                      ? 'border-red-400 bg-red-50/80'
                      : 'border-[#58b347] bg-[#58b347]/10'"
                  >
                    <span
                      class="text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/95 shadow-sm"
                      :class="matrixDragHover.blocked ? 'text-red-600' : 'text-[#58b347]'"
                    >
                      {{ matrixDragHover.blocked ? 'Urlop — zablokowane' : `Przypisz: ${tech.name}` }}
                    </span>
                  </div>

                  <!-- Karty zdarzeń w danej komórce -->
                  <div
                    v-for="ev in getMatrixCellEvents(tech, day.YYYY_MM_DD)"
                    :key="'mev_' + ev.id + '_' + day.YYYY_MM_DD"
                    :draggable="ev.extendedProps.event_type !== 'absence'"
                    @dragstart="onDragStartEvent($event, ev)"
                    @dragend="onGlobalDragEnd"
                    @click.stop="openEditEventModal(ev)"
                    class="rounded-xl border-2 p-2.5 flex flex-col items-center text-center relative group/mcard shadow-sm hover:shadow-md transition-all cursor-pointer min-h-[78px]"
                    :class="[
                      getMatrixCardMeta(ev).cardClass,
                      isDragging && dragPayload?.data?.id === ev.id ? 'opacity-40' : ''
                    ]"
                    title="Kliknij, aby edytować zdarzenie"
                  >
                    <!-- Pasek nagłówkowy karty: kategoria + ciemna pigułka strzałek (← ↑ ↓ → ⧉ ✕) -->
                    <div class="w-full flex items-center justify-between gap-1 mb-1">
                      <div class="flex items-center gap-1 flex-wrap min-w-0">
                        <span class="text-[9.5px] font-black uppercase tracking-wider" :class="getMatrixCardMeta(ev).headerTextClass">
                          {{ getMatrixCardMeta(ev).badge }}
                        </span>
                        <span
                          v-if="getEventVisitBadge(ev)"
                          class="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-white/80 text-violet-700 border border-violet-300"
                        >
                          {{ getEventVisitBadge(ev) }}
                        </span>
                      </div>

                      <!-- Ciemny pasek szybkiego przesuwania ze starego grafiku -->
                      <div
                        @click.stop
                        class="bg-slate-800/95 text-white rounded-md px-1.5 py-0.5 flex items-center gap-1 text-[10px] font-black shadow-sm shrink-0 opacity-85 group-hover/mcard:opacity-100 transition-opacity"
                      >
                        <template v-if="ev.extendedProps.event_type !== 'absence'">
                          <button type="button" @click.stop="moveMatrixEventDay(ev, -1)" class="hover:text-[#7ce368] px-0.5 cursor-pointer" title="Przesuń na poprzedni dzień">←</button>
                          <button
                            type="button"
                            :disabled="techIdx === 0 || tech.isUnassigned"
                            @click.stop="moveMatrixEventTech(ev, techIdx, -1, day.YYYY_MM_DD)"
                            class="hover:text-[#7ce368] disabled:opacity-30 px-0.5 cursor-pointer disabled:cursor-default"
                            title="Przenieś do technika wyżej"
                          >↑</button>
                          <button
                            type="button"
                            :disabled="techIdx >= matrixRealTechCount - 1 || tech.isUnassigned"
                            @click.stop="moveMatrixEventTech(ev, techIdx, 1, day.YYYY_MM_DD)"
                            class="hover:text-[#7ce368] disabled:opacity-30 px-0.5 cursor-pointer disabled:cursor-default"
                            title="Przenieś do technika niżej"
                          >↓</button>
                          <button type="button" @click.stop="moveMatrixEventDay(ev, 1)" class="hover:text-[#7ce368] px-0.5 cursor-pointer" title="Przesuń na następny dzień">→</button>
                          <button type="button" @click.stop="duplicateMatrixEventNextDay(ev)" class="hover:text-sky-300 px-0.5 cursor-pointer" title="Duplikuj na kolejny dzień">⧉</button>
                        </template>
                        <button type="button" @click.stop="$emit('confirm-delete-event', ev.id)" class="hover:text-red-400 px-0.5 cursor-pointer" title="Usuń wpis">✕</button>
                      </div>
                    </div>

                    <!-- Linia QP + numer zlecenia -->
                    <div
                      v-if="getMatrixCardMeta(ev).subHeader"
                      class="text-[10.5px] font-black leading-tight mb-0.5"
                      :class="getMatrixCardMeta(ev).headerTextClass"
                    >
                      {{ getMatrixCardMeta(ev).subHeader }}
                    </div>

                    <!-- Oczyszczony tytuł / lokalizacja / opis -->
                    <div class="text-[11px] font-bold leading-snug break-words w-full line-clamp-3">
                      {{ getMatrixCardMeta(ev).cleanTitle }}
                    </div>

                    <!-- Godzina (jeśli nie całodniowe) -->
                    <div
                      v-if="getMatrixCardMeta(ev).timeLabel"
                      class="mt-1 text-[9px] font-extrabold opacity-75 font-mono"
                    >
                      {{ getMatrixCardMeta(ev).timeLabel }}
                    </div>

                    <!-- Klikalna ciemna pigułka QP (otwiera historię tej stacji w szukajce) -->
                    <button
                      v-if="getMatrixCardMeta(ev).qp"
                      type="button"
                      @click.stop="$emit('quick-search-qp', getMatrixCardMeta(ev).qp)"
                      class="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-900 hover:bg-[#58b347] text-white text-[9.5px] font-black font-mono transition-colors shadow-sm cursor-pointer"
                      :title="`Pokaż wszystkie wizyty i zgłoszenia dla ${getMatrixCardMeta(ev).qp}`"
                    >
                      <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      <span>{{ getMatrixCardMeta(ev).qp }}</span>
                    </button>
                  </div>

                  <!-- Puste sloty "+ Dodaj" wzorem starego kodu -->
                  <button
                    v-for="slotIdx in getEmptyMatrixSlotCount(tech, day.YYYY_MM_DD)"
                    :key="'mslot_' + tech.id + '_' + day.YYYY_MM_DD + '_' + slotIdx"
                    type="button"
                    @click.stop="openMatrixSlotModal(tech, day.YYYY_MM_DD)"
                    class="min-h-[54px] w-full rounded-xl border border-dashed border-slate-200/90 hover:border-[#58b347] bg-slate-50/30 hover:bg-[#58b347]/5 text-slate-300 hover:text-[#58b347] text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer select-none"
                  >
                    + Dodaj
                  </button>
                </div>
              </div>
            </div>

            <!-- Pasek dodawania kolejnego wiersza dla danego technika -->
            <div v-if="!tech.isUnassigned" class="bg-slate-50/90 border-t border-slate-100 py-1.5 px-4 flex items-center justify-center gap-2">
              <button
                type="button"
                @click.stop="addExtraRowForTech(tech.id)"
                class="px-3 py-0.5 rounded-md border border-slate-300 bg-white hover:border-[#58b347] hover:text-[#58b347] text-slate-600 text-[10px] font-bold transition-colors shadow-2xs cursor-pointer"
              >
                + Dodaj wiersz dla: {{ tech.name }}
              </button>
              <button
                v-if="(extraRowsByTech[tech.id] || 0) > 0"
                type="button"
                @click.stop="removeExtraRowForTech(tech.id)"
                class="px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:border-red-300 hover:text-red-500 text-slate-400 text-[10px] font-bold transition-colors cursor-pointer"
                title="Ukryj dodatkowy pusty wiersz"
              >
                −
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- WIDOK 3: TYDZIEŃ ORAZ DZIEŃ (Oś czasu od 06:00)           -->
      <!-- ========================================================= -->
      <div v-else class="flex-1 overflow-y-auto schedule-custom-scrollbar flex relative bg-white pb-12" ref="dayViewScrollContainer" @contextmenu.prevent="$emit('rotate-view')" @dragleave="onDragLeaveColumn">
        
        <div v-if="store.currentView === 'day'" class="absolute left-16 right-0 border-t-2 border-red-500 z-50 pointer-events-none" :style="cal.currentTimeLineStyle.value">
          <div class="absolute -left-2 -top-1.5 w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
        </div>

        <div class="w-16 shrink-0 border-r border-slate-200 bg-white z-10 relative" v-if="store.currentView === 'day'">
          <div v-for="hour in cal.calendarHours" :key="hour" class="h-[120px] border-b border-slate-100 flex justify-center items-start pt-1.5 text-[10px] font-black text-slate-400 relative">
            {{ hour }}:00
            <div class="absolute top-[60px] w-2 border-t border-slate-300 right-0"></div>
          </div>
        </div>

        <div class="flex-1 grid relative bg-white h-max" :class="store.currentView === 'week' ? 'grid-cols-7' : 'grid-cols-1'">
          <div v-for="day in cal.activeDaysArray.value" :key="day.YYYY_MM_DD" class="border-r border-slate-200 last:border-r-0 relative group/day hover:bg-slate-50/30 transition-colors"
               @dragover.prevent="onDragOverColumn($event, day.YYYY_MM_DD)"
               @drop.stop="onDropDayColumn($event, day.YYYY_MM_DD)">
            
            <!-- KLIKALNA WARSTWA POD EVENTAMI (Uwzględnia start od 06:00) -->
            <div class="absolute inset-0 z-0 pointer-events-auto"
                 @contextmenu.prevent.stop="$emit('rotate-view')"
                 @click.self="(e) => onEmptySlotClick(day.YYYY_MM_DD, cal.GRID_START_HOUR + (e.offsetY / 120))" 
                 @dragover.prevent="onDragOverColumn($event, day.YYYY_MM_DD)" 
                 @drop.stop="onDropDayColumn($event, day.YYYY_MM_DD)"
                 @dragleave="onDragLeaveColumn">
            </div>

            <!-- TŁO DLA NIEOBECNOŚCI -->
            <div v-if="cal.absencesByDate.value[day.YYYY_MM_DD] && cal.absencesByDate.value[day.YYYY_MM_DD].length" 
                 class="absence-background">
              <div class="absence-sticky-container">
                <div v-for="abs in cal.absencesByDate.value[day.YYYY_MM_DD]" :key="'abs_'+abs.id"
                     class="absence-label shadow-sm cursor-pointer"
                     @click.stop="openEditEventModal(abs)"
                     title="Kliknij, aby edytować nieobecność">
                  <div class="flex flex-col">
                    <span class="text-[9px] font-black uppercase tracking-widest text-slate-500 leading-none mb-0.5">{{ abs.extendedProps.event_subtype || 'Urlop' }}</span>
                    <span class="text-[10px] font-bold text-slate-700 leading-none truncate" :style="`color: ${abs.extendedProps.techColor}`">{{ abs.extendedProps.technicianName }}</span>
                  </div>
                  <button @click.stop="$emit('confirm-delete-event', abs.id)" class="text-slate-400 hover:text-red-500 p-1 rounded transition-colors ml-1 border border-transparent hover:border-red-200 cursor-pointer">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <div v-for="hour in cal.calendarHours" :key="'bg'+hour" class="h-[120px] border-b border-slate-100/60 w-full relative pointer-events-none z-0">
              <div class="absolute inset-x-0 top-[60px] border-t border-dashed border-slate-100"></div>
            </div>

            <div v-if="dragHoverSlot.active && dragHoverSlot.dateStr === day.YYYY_MM_DD"
                 class="absolute left-1 right-1 rounded-lg border-2 border-dashed border-[#58b347] bg-[#58b347]/10 z-[200] pointer-events-none transition-all duration-75 flex items-center justify-center shadow-inner"
                 :style="`top: ${dragHoverSlot.top}px; height: ${dragHoverSlot.height}px;`">
              <span class="text-[#58b347] font-black text-[10px] uppercase tracking-widest bg-white/90 px-3 py-1 rounded shadow-sm">{{ dragHoverSlot.text }}</span>
            </div>

            <div v-for="ev in cal.eventsByDate.value[day.YYYY_MM_DD] || []" :key="ev.id"
                 draggable="true" @dragstart="onDragStartEvent($event, ev)" @dragend="onGlobalDragEnd"
                 class="absolute rounded-lg pt-1.5 px-2 pb-2 border text-xs cursor-pointer transition-all duration-200 flex flex-col group/card origin-top-left"
                 :class="[
                   ev.extendedProps.event_type === 'absence' ? 'bg-red-50 border-red-200 text-red-800 opacity-90' :
                   ev.extendedProps.event_type === 'task' ? 'bg-[#58b347]/10 border-[#58b347]/40 text-slate-800 shadow-sm' :
                   'bg-white border-slate-200 text-slate-800 shadow-sm',
                   isDragging && dragPayload?.data?.id === ev.id ? 'opacity-40' : 'hover:!z-[1000] hover:scale-[1.02] hover:shadow-2xl'
                 ]"
                 :style="[
                   ev.computedStyle, 
                   ev.extendedProps.event_type === 'absence' ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(239,68,68,0.06) 10px, rgba(239,68,68,0.06) 20px)' } : {}
                 ]"
                 @contextmenu.stop @click.stop="openEditEventModal(ev)" title="Kliknij, aby edytować wizytę"> 
              
              <div class="flex justify-between items-start mb-1 border-b border-slate-900/5 pb-1 shrink-0 gap-1">
                <span class="font-black text-[9px] uppercase tracking-wider truncate" :style="`color: ${ev.extendedProps.techColor}`">{{ ev.extendedProps.technicianName }}</span>
                <div class="flex items-center gap-0.5 shrink-0 z-50 -mt-0.5 -mr-0.5">
                  <button
                    v-if="ev.extendedProps.event_type !== 'absence'"
                    type="button"
                    @click.stop="duplicateEventToNextDay(ev)"
                    class="opacity-0 group-hover/card:opacity-100 text-slate-400 hover:text-sky-600 hover:bg-sky-50 p-0.5 rounded pointer-events-auto transition-all bg-white/70 backdrop-blur cursor-pointer"
                    title="Duplikuj wizytę na następny dzień (+1d)"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                  <button type="button" @click.stop="$emit('confirm-delete-event', ev.id)" class="text-slate-400 hover:text-red-500 hover:bg-red-50 p-0.5 rounded pointer-events-auto transition-colors bg-white/50 backdrop-blur cursor-pointer" title="Usuń wizytę"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                </div>
              </div>
              
              <div class="flex flex-wrap items-center gap-1 mb-1 shrink-0 pointer-events-none">
                <template v-if="ev.extendedProps.event_type === 'service'">
                  <span class="font-black text-[9px] truncate bg-white px-1.5 py-0.5 rounded text-slate-600 border border-slate-200 shadow-sm">{{ ev.extendedProps.ticketCode }}</span>
                  <span v-if="ev.extendedProps.qpCode" class="font-black text-[9px] truncate bg-[#58b347]/10 px-1.5 py-0.5 rounded text-[#58b347] border border-[#58b347]/20">{{ ev.extendedProps.qpCode }}</span>
                  <span v-if="getEventVisitBadge(ev)" class="font-black text-[9px] truncate bg-violet-50 px-1.5 py-0.5 rounded text-violet-700 border border-violet-200">{{ getEventVisitBadge(ev) }}</span>
                </template>
                <template v-else>
                  <span class="font-black text-[9px] uppercase tracking-widest truncate px-1.5 py-0.5 rounded border bg-white"
                        :class="ev.extendedProps.event_type === 'absence' ? 'text-red-600 border-red-200' : 'text-[#499b3a] border-[#58b347]/30'">
                    {{ ev.extendedProps.event_subtype }}
                  </span>
                  <span v-if="ev.extendedProps.all_day" class="font-black text-[8px] uppercase tracking-widest truncate px-1.5 py-0.5 rounded border bg-white/50 text-slate-500 border-slate-200">
                    CAŁY DZIEŃ
                  </span>
                </template>
              </div>
              
              <!-- WIDOK TYGODNIA -->
              <template v-if="store.currentView === 'week'">
                <div class="font-bold text-[11px] break-words leading-tight w-full text-slate-800 shrink-0 pointer-events-none">{{ ev.title }}</div>
                
                <div v-if="hasAbsenceConflict(ev, day.YYYY_MM_DD)" class="mt-1.5 flex-1 relative flex items-center justify-center bg-red-50/90 rounded border border-red-200/60 overflow-hidden pointer-events-auto">
                  <svg class="w-7 h-7 text-red-500 animate-pulse group-hover/card:opacity-0 transition-opacity duration-300 absolute" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <p class="text-[10px] text-slate-700 leading-snug line-clamp-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 relative z-10 p-1.5">{{ ev.extendedProps.description }}</p>
                </div>
                <p v-else class="text-[10px] text-slate-600 leading-snug line-clamp-3 overflow-hidden pointer-events-none mt-1.5">{{ ev.extendedProps.description }}</p>
              </template>

              <!-- WIDOK DNIA -->
              <template v-else>
                <div class="flex items-start justify-between w-full gap-2 shrink-0 pointer-events-none mb-1.5">
                  <div class="font-bold text-[11px] break-words leading-tight text-slate-800 flex-1">{{ ev.title }}</div>
                  <span class="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded shrink-0">{{ ev.extendedProps.category || 'Zgłoszenie' }}</span>
                </div>
                
                <div v-if="hasAbsenceConflict(ev, day.YYYY_MM_DD)" class="mt-1 flex-1 relative flex items-center justify-center bg-red-50/90 rounded border border-red-200/60 overflow-hidden pointer-events-auto">
                  <svg class="w-8 h-8 text-red-500 animate-pulse group-hover/card:opacity-0 transition-opacity duration-300 absolute" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <p class="text-[10px] text-slate-700 leading-relaxed opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 relative z-10 p-2">{{ ev.extendedProps.description }}</p>
                </div>
                <p v-else class="text-[10px] text-slate-600 leading-relaxed flex-1 overflow-hidden pointer-events-none mt-1">{{ ev.extendedProps.description }}</p>
              </template>

              <div v-if="!ev.extendedProps.all_day && ev.extendedProps.event_type !== 'absence'" 
                   class="mt-auto pt-1.5 flex justify-between items-center shrink-0 pointer-events-none w-full gap-2 border-t border-slate-100/80">
                <span class="text-[9px] font-black bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded shadow-sm">{{ formatEventTimeRange(ev) }}</span>
                <span v-if="ev.extendedProps.t_status" class="text-[8px] font-black uppercase tracking-widest text-slate-500 truncate text-right">{{ ev.extendedProps.t_status }}</span>
              </div>

              <div v-if="ev.extendedProps.event_type !== 'absence' && !ev.extendedProps.all_day"
                   class="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-slate-200/80 to-transparent cursor-ns-resize opacity-0 group-hover/card:opacity-100 transition-opacity z-[100]"
                   @mousedown.stop="cal.startResize($event, ev)">
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- MODAL DO TWORZENIA / EDYCJI EVENTÓW -->
      <Teleport to="body">
        <ScheduleFormModal 
           :show="showEventModal" :initialData="editingEventData"
           @close="showEventModal = false" @save="saveManualEvent"
        />
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useScheduleStore } from '../../stores/useScheduleStore'
import { useCalendar } from '../../composables/useCalendar'
import ScheduleFormModal from '../../modals/ScheduleFormModal.vue'

const props = defineProps({
  filteredTickets: Array,
  totalBacklogCount: Number,
  isMatrixLayout: { type: Boolean, default: false },
  matrixShowWeekend: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm-delete-event', 'rotate-view', 'quick-search-qp'])

const store = useScheduleStore()
const cal = useCalendar()

// --- FILTR PONOWNYCH WIZYT W BACKLOGU ---
const showOnlyRepeatVisits = ref(false)
const repeatBacklogCount = computed(() => (props.filteredTickets || []).filter(t => t.is_repeat_visit).length)
const displayedBacklogTickets = computed(() => {
  const list = props.filteredTickets || []
  return showOnlyRepeatVisits.value ? list.filter(t => t.is_repeat_visit) : list
})

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
const toRomanVisit = (num) => ROMAN_NUMERALS[num - 1] || String(num)

const parseSafeDate = (raw) => {
  if (!raw) return null
  const str = String(raw).trim()
  const d = new Date(str.replace(/^(\d{4}-\d{2}-\d{2})\s+/, '$1T'))
  if (!isNaN(d.getTime())) return d
  const pl = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/)
  if (pl) return new Date(Number(pl[3]), Number(pl[2]) - 1, Number(pl[1]))
  return null
}

const formatEventTimeRange = (ev) => {
  const s = parseSafeDate(ev?.start_time)
  if (!s) return ''
  const pad = n => String(n).padStart(2, '0')
  const startTxt = `${s.getHours()}:${pad(s.getMinutes())}`
  const e = parseSafeDate(ev?.end_time)
  if (!e) return startTxt
  return `${startTxt} - ${e.getHours()}:${pad(e.getMinutes())}`
}

const eventVisitBadgeMap = computed(() => {
  const aliasMap = new Map()
  ;(store.tickets || []).forEach(t => {
    const canonical = String(t.t_id || t.t_code || '').toLowerCase().trim()
    if (!canonical) return
    if (t.t_id) aliasMap.set(String(t.t_id).toLowerCase().trim(), canonical)
    if (t.t_code) aliasMap.set(String(t.t_code).toLowerCase().trim(), canonical)
  })

  const groups = new Map()
  ;(store.events || []).forEach(ev => {
    const evType = ev.event_type || ev.extendedProps?.event_type
    if (evType === 'absence') return
    const rawTid = String(ev.ticket_id || '').toLowerCase().trim()
    if (!rawTid || rawTid === 'null' || rawTid === 'undefined') return
    const canonical = aliasMap.get(rawTid) || rawTid
    if (!groups.has(canonical)) groups.set(canonical, [])
    groups.get(canonical).push(ev)
  })

  const badgeById = new Map()
  groups.forEach(list => {
    if (list.length < 2) return
    const sorted = [...list].sort((a, b) => (parseSafeDate(a.start_time)?.getTime() || 0) - (parseSafeDate(b.start_time)?.getTime() || 0))
    sorted.forEach((ev, idx) => {
      badgeById.set(String(ev.id), `WIZYTA ${toRomanVisit(idx + 1)}`)
    })
  })
  return badgeById
})

const getEventVisitBadge = (ev) => {
  if (!ev || !ev.id) return ''
  return eventVisitBadgeMap.value.get(String(ev.id)) || ''
}

const formatPastVisitShort = (rawDate) => {
  const d = parseSafeDate(rawDate)
  if (!d) return '-'
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })
}

const getPastVisitTechName = (ev) => {
  if (ev?.extendedProps?.technicianName && ev.extendedProps.technicianName !== 'BRAK') {
    return ev.extendedProps.technicianName
  }
  const tech = (store.techList || []).find(t => t.id === ev?.technician_id || t.name === ev?.technician_id)
  return tech ? tech.name : (ev?.technician_id || 'Brak technika')
}

const formatAllPastVisitsTooltip = (pastVisits) => {
  if (!Array.isArray(pastVisits) || pastVisits.length === 0) return ''
  const lines = pastVisits.map((ev, idx) => {
    const visitNo = pastVisits.length - idx
    const d = parseSafeDate(ev.start_time)
    const dStr = d ? d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'
    return `Wizyta ${toRomanVisit(visitNo)}: ${dStr} — ${getPastVisitTechName(ev)}`
  })
  return `Historia odbytych wizyt (kliknij, aby przejść do ostatniej):\n${lines.join('\n')}`
}

const hasAbsenceConflict = (ev, dateStr) => {
  if (ev.extendedProps.event_type === 'absence') return false
  const absences = cal.absencesByDate.value[dateStr] || []
  return absences.some(a => a.extendedProps.technicianName === ev.extendedProps.technicianName)
}

const dayViewScrollContainer = ref(null)

// W widoku Dnia leci do aktualnej godziny i czerwonej linii; w Tygodniu startuje od samej góry (06:00)
const focusToday = () => {
  nextTick(() => {
    if (!dayViewScrollContainer.value) return
    if (store.currentView === 'day') {
      const now = new Date()
      const exactHour = now.getHours() + (now.getMinutes() / 60)
      const targetTop = Math.max(0, ((exactHour - cal.GRID_START_HOUR) * 120) - 120)
      dayViewScrollContainer.value.scrollTo({ top: targetTop, behavior: 'smooth' })
    } else if (store.currentView === 'week') {
      dayViewScrollContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  })
}

// --- NAWIGACJA ---
let scrollTimeout = null
const onHeaderScroll = (e) => {
  if (Math.abs(e.deltaY) < 10) return
  if (scrollTimeout) return
  scrollTimeout = setTimeout(() => { scrollTimeout = null }, 150)
  if (e.deltaY > 0) cal.navigateCalendar(1)
  else cal.navigateCalendar(-1)
}

const parseDateForNav = (input) => {
  if (!input) return null
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input
  const raw = input?.date || input?.YYYY_MM_DD || input
  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw
  return parseSafeDate(raw)
}

const goToDay = (dateObj) => {
  const parsed = parseDateForNav(dateObj)
  if (!parsed) return
  cal.currentDate.value = new Date(parsed)
  store.currentView = 'day'
  focusToday()
}

const jumpToDate = (dateInput, viewMode = 'day') => {
  const parsed = parseDateForNav(dateInput)
  if (!parsed) return
  cal.currentDate.value = new Date(parsed)
  if (viewMode && !props.isMatrixLayout) store.currentView = viewMode
  focusToday()
}

const resetToFleet = () => {
  store.selectedTechId = 'ALL'
}

// --- CZYSTY PAYLOAD DO ZAPISU W CHMURZE (bez pól pomocniczych UI) ---
const buildCleanCloudEvent = (ev, overrides = {}) => {
  const rawOrig = (store.events || []).find(x => String(x.id) === String(ev.id)) || ev
  const merged = { ...rawOrig, ...overrides }
  delete merged.extendedProps
  delete merged.computedStyle
  return merged
}

// =========================================================
// LOGIKA WIDOKU MATRYCOWEGO (Technicy × Dni)
// =========================================================
const extraRowsByTech = ref({})
const matrixDragHover = ref({ active: false, techId: '', dateStr: '', blocked: false })

const matrixDaysArray = computed(() => {
  const all = cal.activeDaysArray.value || []
  if (props.matrixShowWeekend) return all
  return all.slice(0, 5) // Pon–Pt
})

const weekendEventsCount = computed(() => {
  const all = cal.activeDaysArray.value || []
  if (all.length < 7) return 0
  const sat = all[5]?.YYYY_MM_DD
  const sun = all[6]?.YYYY_MM_DD
  const satCount = (cal.eventsByDate.value[sat] || []).filter(e => e.extendedProps?.event_type !== 'absence').length
  const sunCount = (cal.eventsByDate.value[sun] || []).filter(e => e.extendedProps?.event_type !== 'absence').length
  return satCount + sunCount
})

const doesEventBelongToTech = (ev, tech) => {
  if (!ev || !tech) return false
  const evTechId = String(ev.technician_id || ev.extendedProps?.technicianId || '').trim().toLowerCase()
  const evTechName = String(ev.extendedProps?.technicianName || '').trim().toLowerCase()
  const tId = String(tech.id || '').trim().toLowerCase()
  const tName = String(tech.name || '').trim().toLowerCase()
  return (tId && evTechId === tId) || (tName && (evTechId === tName || evTechName === tName))
}

const matrixRealTechList = computed(() => {
  const base = (store.techList || []).map(t => ({
    id: t.id,
    name: t.name,
    color: t.zone_color || t.color || '#cbd5e1',
    isUnassigned: false
  }))
  if (store.selectedTechId && store.selectedTechId !== 'ALL') {
    return base.filter(t => t.id === store.selectedTechId || t.name === store.selectedTechId)
  }
  return base
})

const matrixRealTechCount = computed(() => matrixRealTechList.value.length)

const matrixTechRows = computed(() => {
  const rows = [...matrixRealTechList.value]
  if (store.selectedTechId === 'ALL') {
    const hasUnassignedInWeek = (cal.activeDaysArray.value || []).some(d => {
      const dayEvs = cal.eventsByDate.value[d.YYYY_MM_DD] || []
      return dayEvs.some(ev => !rows.some(t => doesEventBelongToTech(ev, t)))
    })
    if (hasUnassignedInWeek) {
      rows.push({
        id: '__UNASSIGNED__',
        name: 'Nieprzypisane',
        color: '#94a3b8',
        isUnassigned: true
      })
    }
  }
  return rows
})

const getMatrixCellEvents = (tech, dateStr) => {
  if (tech.isUnassigned) {
    const realTechs = matrixRealTechList.value
    return (cal.eventsByDate.value[dateStr] || []).filter(ev => !realTechs.some(t => doesEventBelongToTech(ev, t)))
  }

  // Zwykłe wizyty/zadania + wielodniowe urlopy z absencesByDate
  const regular = (cal.eventsByDate.value[dateStr] || []).filter(
    ev => ev.extendedProps?.event_type !== 'absence' && doesEventBelongToTech(ev, tech)
  )
  const absences = (cal.absencesByDate.value[dateStr] || []).filter(
    abs => doesEventBelongToTech(abs, tech)
  )
  return [...absences, ...regular]
}

const getMatrixTechWeekCount = (tech) => {
  return (cal.activeDaysArray.value || []).reduce((sum, d) => {
    const evs = getMatrixCellEvents(tech, d.YYYY_MM_DD).filter(e => e.extendedProps?.event_type !== 'absence')
    return sum + evs.length
  }, 0)
}

const getEmptyMatrixSlotCount = (tech, dateStr) => {
  if (tech.isUnassigned) return 0
  const maxInAnyDay = matrixDaysArray.value.reduce((maxVal, d) => {
    const count = getMatrixCellEvents(tech, d.YYYY_MM_DD).length
    return Math.max(maxVal, count)
  }, 0)
  const targetRows = Math.max(2, maxInAnyDay) + (extraRowsByTech.value[tech.id] || 0)
  const currentCellCount = getMatrixCellEvents(tech, dateStr).length
  return Math.max(0, targetRows - currentCellCount)
}

const addExtraRowForTech = (techId) => {
  extraRowsByTech.value = {
    ...extraRowsByTech.value,
    [techId]: (extraRowsByTech.value[techId] || 0) + 1
  }
}

const removeExtraRowForTech = (techId) => {
  const cur = extraRowsByTech.value[techId] || 0
  if (cur <= 0) return
  extraRowsByTech.value = {
    ...extraRowsByTech.value,
    [techId]: cur - 1
  }
}

const getMatrixCardMeta = (ev) => {
  const propsExt = ev.extendedProps || {}
  const evType = propsExt.event_type || ev.event_type || 'service'
  const qp = propsExt.qpCode || ''
  const ticketCode = propsExt.ticketCode || ''

  // Formatowanie godziny (pomijamy dla całodniowych)
  let timeLabel = ''
  if (!propsExt.all_day && evType !== 'absence') {
    timeLabel = formatEventTimeRange(ev)
  }

  // Oczyszczenie surowego tytułu z Axona (np. "83340_QP-7843_PL_EKOEN_Nadarzyn" -> "EKOEN • Nadarzyn")
  let cleanTitle = String(ev.title || '').trim()
  const axonMatch = cleanTitle.match(/^\d+_QP-\d+_[A-Z]{2}_(.+)$/i)
  if (axonMatch && axonMatch[1]) {
    cleanTitle = axonMatch[1].replace(/_+/g, ' • ').trim()
  }

  if (evType === 'absence') {
    return {
      badge: (propsExt.event_subtype || 'URLOP').toUpperCase(),
      subHeader: '',
      cleanTitle: cleanTitle || propsExt.event_subtype || 'Nieobecność',
      timeLabel: '',
      qp: '',
      cardClass: 'bg-rose-50/90 border-rose-300 text-rose-900',
      headerTextClass: 'text-rose-700'
    }
  }

  if (evType === 'task') {
    return {
      badge: (propsExt.event_subtype || 'ZADANIE').toUpperCase(),
      subHeader: '',
      cleanTitle: cleanTitle || propsExt.description || 'Zadanie operacyjne',
      timeLabel,
      qp,
      cardClass: 'bg-amber-50/95 border-amber-300 text-amber-950',
      headerTextClass: 'text-amber-800'
    }
  }

  // Wizyta serwisowa: rozróżnienie EEP (fioletowy) vs EKOEN (błękitny) wzorem starego kodu
  const isEkoen = propsExt.sourceBrand === 'EKOEN'
  let subHeader = ''
  if (qp && ticketCode) subHeader = `${qp} (Zlec. ${ticketCode})`
  else if (qp) subHeader = qp
  else if (ticketCode) subHeader = `Zlec. ${ticketCode}`

  return {
    badge: isEkoen ? 'EKOEN' : 'EEP',
    subHeader,
    cleanTitle: cleanTitle || propsExt.t_address || 'Wizyta serwisowa',
    timeLabel,
    qp,
    cardClass: isEkoen
      ? 'bg-cyan-50/90 border-cyan-300 text-cyan-950'
      : 'bg-[#f5f0ff] border-purple-300 text-purple-950',
    headerTextClass: isEkoen ? 'text-cyan-800' : 'text-purple-800'
  }
}

const checkTechHasAbsenceOnDate = (tech, dateStr) => {
  return (cal.absencesByDate.value[dateStr] || []).some(abs => doesEventBelongToTech(abs, tech))
}

// Szybkie przesuwanie strzałkami w Matrycy (← → ↑ ↓)
const moveMatrixEventDay = (ev, dir) => {
  const s = parseSafeDate(ev.start_time)
  if (!s) return
  let delta = dir
  if (!props.matrixShowWeekend) {
    if (dir === 1 && s.getDay() === 5) delta = 3   // Piątek -> Poniedziałek
    if (dir === -1 && s.getDay() === 1) delta = -3 // Poniedziałek -> Piątek
  }

  const nextStartObj = new Date(s)
  nextStartObj.setDate(nextStartObj.getDate() + delta)
  const pad = n => String(n).padStart(2, '0')
  const targetDateStr = `${nextStartObj.getFullYear()}-${pad(nextStartObj.getMonth() + 1)}-${pad(nextStartObj.getDate())}`

  const techObj = (store.techList || []).find(t => doesEventBelongToTech(ev, t))
  if (techObj && checkTechHasAbsenceOnDate(techObj, targetDateStr)) {
    alert(`Pracownik ${techObj.name} ma w dniu ${targetDateStr} urlop.`)
    return
  }

  const nextStart = shiftIsoDateTimeByDays(ev.start_time, delta)
  const nextEnd = ev.end_time ? shiftIsoDateTimeByDays(ev.end_time, delta) : nextStart

  store.saveEventToCloud(buildCleanCloudEvent(ev, { start_time: nextStart, end_time: nextEnd }))
}

const moveMatrixEventTech = (ev, currentIdx, dir, dateStr) => {
  const targetTech = matrixRealTechList.value[currentIdx + dir]
  if (!targetTech) return
  if (checkTechHasAbsenceOnDate(targetTech, dateStr)) {
    alert(`Pracownik ${targetTech.name} ma w tym dniu urlop.`)
    return
  }
  store.saveEventToCloud(buildCleanCloudEvent(ev, { technician_id: targetTech.id }))
}

const duplicateMatrixEventNextDay = (ev) => {
  const s = parseSafeDate(ev.start_time)
  let delta = 1
  if (s && !props.matrixShowWeekend && s.getDay() === 5) delta = 3 // Piątek -> Poniedziałek
  duplicateEventByDays(ev, delta)
}

const openMatrixSlotModal = (tech, dateStr) => {
  if (checkTechHasAbsenceOnDate(tech, dateStr)) {
    alert(`Pracownik ${tech.name} ma w tym dniu urlop.`)
    return
  }
  const slot = cal.findNextAvailableSlot(tech.id, dateStr, null, 8, 2)
  editingEventData.value = {
    id: 'temp_' + Date.now(),
    ticket_id: null,
    technician_id: tech.id,
    title: '',
    description: '',
    start_time: slot.start,
    end_time: slot.end,
    event_type: 'service',
    event_subtype: 'Awaria'
  }
  showEventModal.value = true
}

const onDragOverMatrixCell = (e, tech, dateStr) => {
  if (!dragPayload.value || tech.isUnassigned) return
  const blocked = checkTechHasAbsenceOnDate(tech, dateStr)
  matrixDragHover.value = { active: true, techId: tech.id, dateStr, blocked }
}

const onDragLeaveMatrixCell = (techId, dateStr) => {
  if (matrixDragHover.value.techId === techId && matrixDragHover.value.dateStr === dateStr) {
    matrixDragHover.value.active = false
  }
}

const onDropMatrixCell = (e, tech, dateStr) => {
  isDragging.value = false
  matrixDragHover.value = { active: false, techId: '', dateStr: '', blocked: false }
  if (!dragPayload.value || tech.isUnassigned) return

  if (checkTechHasAbsenceOnDate(tech, dateStr)) {
    alert(`Pracownik ${tech.name} ma w tym dniu urlop. Zgłoszenie nie może zostać zaplanowane.`)
    dragPayload.value = null
    return
  }

  const p = dragPayload.value
  const durHours = (p.durationMs || 2 * 3600000) / 3600000
  const excludeId = p.type === 'event' ? p.data.id : null
  const slot = cal.findNextAvailableSlot(tech.id, dateStr, excludeId, 8, durHours)

  if (p.type === 'backlog') {
    store.saveEventToCloud({
      id: 'EV_' + Date.now(),
      ticket_id: p.data.ticket_code || p.data.id || p.data.t_code || p.data.t_id || '',
      technician_id: tech.id,
      title: p.data.title || p.data.subject || p.data.t_title || 'Awaria z backlogu',
      description: p.data.description || p.data.t_desc || '',
      start_time: slot.start,
      end_time: slot.end,
      event_type: 'service',
      event_subtype: 'Awaria',
      all_day: 'NIE'
    })
  } else {
    store.saveEventToCloud(buildCleanCloudEvent(p.data, {
      technician_id: tech.id,
      start_time: slot.start,
      end_time: slot.end
    }))
  }

  dragPayload.value = null
}

// =========================================================
// DRAG & DROP DLA WIDOKÓW: MIESIĄC / TYDZIEŃ / DZIEŃ
// =========================================================
const isDragging = ref(false)
const dragPayload = ref(null)
const dragHoverSlot = ref({ active: false, top: 0, height: 80, dateStr: '', text: '' })

const onDragStartBacklog = (e, ticket) => {
  isDragging.value = true
  const rect = e.target.getBoundingClientRect()
  dragPayload.value = { type: 'backlog', data: ticket, durationMs: 2 * 3600000, offsetY: e.clientY - rect.top }
  if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ticket.t_id) }
}

const onDragStartEvent = (e, ev) => {
  e.stopPropagation()
  isDragging.value = true
  const rect = e.target.getBoundingClientRect()
  const s = parseSafeDate(ev.start_time)?.getTime() || Date.now()
  const eT = parseSafeDate(ev.end_time)?.getTime() || (s + 2 * 3600000)
  dragPayload.value = { type: 'event', data: ev, durationMs: Math.max(1800000, eT - s), offsetY: e.clientY - rect.top }
  if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ev.id) }
}

const resolveDragTargetTech = (p) => {
  if (!p || !p.data) return ''
  let tech = store.selectedTechId
  if (!tech || tech === 'ALL') {
    tech = p.data.technician_id || p.data.actualTechId || p.data.past_visits?.[0]?.technician_id || ''
  }
  return tech === 'ALL' ? '' : tech
}

const calculateDropPosition = (clientY, columnRect, dateStr) => {
  const p = dragPayload.value
  const targetTech = resolveDragTargetTech(p)
  if (!targetTech) return null

  const techObj = store.techList.find(t => t.id === targetTech || t.name === targetTech)
  const finalTechId = techObj ? techObj.id : targetTech
  const techName = techObj ? techObj.name : targetTech

  let y = clientY - columnRect.top - (p.offsetY || 0)
  if (y < 0) y = 0

  // Oś czasu startuje od cal.GRID_START_HOUR (06:00)
  let hoursFloat = cal.GRID_START_HOUR + (Math.round((y / 120) * 2) / 2)
  if (hoursFloat > 23.5) hoursFloat = 23.5
  let startMs = new Date(`${dateStr}T00:00:00`).getTime() + hoursFloat * 3600000
  const durationMs = p.durationMs
  let endMs = startMs + durationMs

  const excludeId = p.type === 'event' ? p.data.id : null

  const techEventsDay = store.events.filter(x => {
    const isAbsence = x.event_type === 'absence' || (x.extendedProps && x.extendedProps.event_type === 'absence')
    if (isAbsence) return false

    const isSameTech = (x.technician_id === finalTechId || x.technician_id === techName || (x.extendedProps && x.extendedProps.technicianName === techName))
    const evDateStr = String(x.start_time).includes('T') ? String(x.start_time).split('T')[0] : String(x.start_time).split(' ')[0]
    return isSameTech && evDateStr === dateStr && x.id !== excludeId
  })

  const snapThreshold = 900000
  for (const ev of techEventsDay) {
    const evS = new Date(String(ev.start_time).replace(' ', 'T')).getTime()
    const evE = ev.end_time ? new Date(String(ev.end_time).replace(' ', 'T')).getTime() : evS + 2 * 3600000

    if (Math.abs(startMs - evE) <= snapThreshold) { startMs = evE; endMs = startMs + durationMs; break }
    if (Math.abs(endMs - evS) <= snapThreshold) { endMs = evS; startMs = endMs - durationMs; break }
  }

  const hasCollision = techEventsDay.some(ev => {
    const evS = new Date(String(ev.start_time).replace(' ', 'T')).getTime()
    const evE = ev.end_time ? new Date(String(ev.end_time).replace(' ', 'T')).getTime() : evS + 2 * 3600000
    return startMs < evE && endMs > evS
  })

  const minAllowedStartMs = new Date(`${dateStr}T00:00:00`).getTime() + cal.GRID_START_HOUR * 3600000

  if (hasCollision) {
    const candidates = [new Date(`${dateStr}T07:00:00`).getTime()]
    techEventsDay.forEach(ev => {
      const evS = new Date(String(ev.start_time).replace(' ', 'T')).getTime()
      const evE = ev.end_time ? new Date(String(ev.end_time).replace(' ', 'T')).getTime() : evS + 2 * 3600000
      candidates.push(evE)
      candidates.push(evS - durationMs)
    })

    let bestCandidate = null
    let minDiff = Infinity

    for (const cand of candidates) {
      if (cand < minAllowedStartMs) continue

      const candEnd = cand + durationMs
      const collides = techEventsDay.some(ev => {
        const evS = new Date(String(ev.start_time).replace(' ', 'T')).getTime()
        const evE = ev.end_time ? new Date(String(ev.end_time).replace(' ', 'T')).getTime() : evS + 2 * 3600000
        return cand < evE && candEnd > evS
      })

      if (!collides) {
        const diff = Math.abs(cand - startMs)
        if (diff < minDiff) {
          minDiff = diff
          bestCandidate = cand
        }
      }
    }

    if (bestCandidate !== null) {
      startMs = bestCandidate
      endMs = startMs + durationMs
    }
  }

  return { startMs, endMs, targetTech }
}

const onDragOverColumn = (e, dateStr) => {
  if (!dragPayload.value) return

  const p = dragPayload.value
  const targetTech = resolveDragTargetTech(p)
  if (!targetTech) return

  const techObj = store.techList.find(t => t.id === targetTech || t.name === targetTech)
  const techName = techObj ? techObj.name : targetTech
  const hasAbsence = (cal.absencesByDate.value[dateStr] || []).some(a =>
    a.extendedProps.technicianName === techName || a.technician_id === targetTech
  )
  if (hasAbsence) {
    dragHoverSlot.value.active = false
    return
  }

  if (store.currentView === 'month') {
    dragHoverSlot.value = { active: true, dateStr }
    return
  }

  const durHours = p.durationMs / 3600000
  const gridStartMs = new Date(`${dateStr}T00:00:00`).getTime() + cal.GRID_START_HOUR * 3600000

  if (store.currentView === 'day') {
    const res = calculateDropPosition(e.clientY, e.currentTarget.getBoundingClientRect(), dateStr)
    if (res) {
      dragHoverSlot.value = {
        active: true,
        dateStr,
        top: Math.max(0, ((res.startMs - gridStartMs) / 3600000) * 120),
        height: durHours * 120,
        text: 'ZAPISZ TUTAJ'
      }
    }
  } else {
    const excludeId = p.type === 'event' ? p.data.id : null
    const slot = cal.findNextAvailableSlot(targetTech, dateStr, excludeId, 7, durHours)
    const startMs = new Date(slot.start).getTime()

    dragHoverSlot.value = {
      active: true,
      dateStr,
      top: Math.max(0, ((startMs - gridStartMs) / 3600000) * 120),
      height: durHours * 120,
      text: `${new Date(startMs).getHours()}:${String(new Date(startMs).getMinutes()).padStart(2, '0')} - AUTO`
    }
  }
}

const onDragLeaveColumn = () => { dragHoverSlot.value.active = false }

const onDropDayColumn = (e, dateStr) => {
  isDragging.value = false
  dragHoverSlot.value.active = false
  if (!dragPayload.value) return

  const p = dragPayload.value
  const targetTech = resolveDragTargetTech(p)
  if (!targetTech) {
    alert('Wybierz technika przed upuszczeniem (lub przełącz na widok Matryca)!')
    dragPayload.value = null
    return
  }

  const techObj = store.techList.find(t => t.id === targetTech || t.name === targetTech)
  const techName = techObj ? techObj.name : targetTech
  const hasAbsence = (cal.absencesByDate.value[dateStr] || []).some(a =>
    a.extendedProps.technicianName === techName || a.technician_id === targetTech
  )
  if (hasAbsence) {
    alert(`Pracownik ${techName} ma w tym dniu urlop. Zgłoszenie nie może zostać zaplanowane.`)
    dragPayload.value = null
    return
  }

  let sTime, eTime

  if (store.currentView === 'day') {
    const res = calculateDropPosition(e.clientY, e.currentTarget.getBoundingClientRect(), dateStr)
    if (!res) { dragPayload.value = null; return }
    sTime = cal.formatISO(new Date(res.startMs))
    eTime = cal.formatISO(new Date(res.endMs))
  } else {
    const durHours = p.durationMs / 3600000
    const slot = cal.findNextAvailableSlot(targetTech, dateStr, p.type === 'event' ? p.data.id : null, 7, durHours)
    sTime = slot.start
    eTime = slot.end
  }

  if (p.type === 'backlog') {
    store.saveEventToCloud({
      id: 'EV_' + Date.now(),
      ticket_id: p.data.ticket_code || p.data.id || p.data.t_code || p.data.t_id || '',
      technician_id: targetTech,
      title: p.data.title || p.data.subject || p.data.t_title || 'Awaria z backlogu',
      description: p.data.description || p.data.t_desc || '',
      start_time: sTime,
      end_time: eTime,
      event_type: 'service',
      event_subtype: 'Awaria',
      all_day: 'NIE'
    })
  } else {
    store.saveEventToCloud(buildCleanCloudEvent(p.data, {
      start_time: sTime,
      end_time: eTime,
      technician_id: targetTech
    }))
  }
  dragPayload.value = null
}

const onGlobalDragEnd = () => {
  isDragging.value = false
  dragHoverSlot.value.active = false
  matrixDragHover.value = { active: false, techId: '', dateStr: '', blocked: false }
  dragPayload.value = null
}

// --- MODALE TWORZENIA I EDYCJI ---
const showEventModal = ref(false)
const editingEventData = ref({})

const openManualEventModal = () => {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  const todayStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const payload = cal.handleEmptySlotClick(todayStr)

  editingEventData.value = {
    id: 'EV_' + Date.now(),
    ticket_id: null,
    technician_id: payload.techId || '',
    title: '',
    start_time: payload.startDate,
    end_time: '',
    event_type: 'task'
  }
  showEventModal.value = true
}

const onEmptySlotClick = (dateStr, hour) => {
  const payload = cal.handleEmptySlotClick(dateStr, hour)

  editingEventData.value = {
    id: 'EV_' + Date.now(),
    ticket_id: null,
    technician_id: payload.techId || '',
    title: '',
    start_time: payload.startDate,
    end_time: '',
    event_type: 'task'
  }
  showEventModal.value = true
}

const openEditEventModal = (ev) => {
  if (!ev) return
  editingEventData.value = {
    ...ev,
    isEditing: true,
    id: ev.id,
    ticket_id: ev.ticket_id || '',
    technician_id: ev.technician_id || '',
    title: ev.title || '',
    description: ev.description || ev.extendedProps?.description || '',
    start_time: ev.start_time || '',
    end_time: ev.end_time || '',
    event_type: ev.event_type || ev.extendedProps?.event_type || 'service',
    event_subtype: ev.event_subtype || ev.extendedProps?.event_subtype || 'Awaria',
    all_day: ev.all_day || (ev.extendedProps?.all_day ? 'TAK' : 'NIE'),
    is_all_day: ev.all_day === 'TAK' || Boolean(ev.extendedProps?.all_day)
  }
  showEventModal.value = true
}

const shiftIsoDateTimeByDays = (rawIso, daysDelta) => {
  if (!rawIso) return ''
  const d = parseSafeDate(rawIso)
  if (!d) return String(rawIso)
  d.setDate(d.getDate() + daysDelta)
  return cal.formatISO(d)
}

const duplicateEventByDays = (ev, daysDelta = 1) => {
  if (!ev) return
  const nextStart = shiftIsoDateTimeByDays(ev.start_time, daysDelta)
  const nextEnd = ev.end_time ? shiftIsoDateTimeByDays(ev.end_time, daysDelta) : nextStart
  if (!nextStart) return

  store.saveEventToCloud({
    id: 'temp_' + Date.now() + '_' + Math.floor(Math.random() * 100),
    ticket_id: ev.ticket_id || '',
    technician_id: ev.technician_id || '',
    title: ev.title || '',
    description: ev.description || ev.extendedProps?.description || '',
    start_time: nextStart,
    end_time: nextEnd,
    event_type: ev.event_type || ev.extendedProps?.event_type || 'service',
    event_subtype: ev.event_subtype || ev.extendedProps?.event_subtype || 'Awaria',
    all_day: ev.all_day || (ev.extendedProps?.all_day ? 'TAK' : 'NIE')
  })
}

const duplicateEventToNextDay = (ev) => duplicateEventByDays(ev, 1)

const saveManualEvent = (payload) => {
  store.saveEventToCloud(payload)
  showEventModal.value = false
}

defineExpose({
  focusToday,
  onGlobalDragEnd,
  openManualEventModal,
  jumpToDate,
  currentDate: cal.currentDate
})
</script>

<style scoped>
.schedule-custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.schedule-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.schedule-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
.schedule-custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.8); }

.absence-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(45deg, #f8fafc, #f8fafc 15px, #f1f5f9 15px, #f1f5f9 30px);
  z-index: 5;
  padding: 0 4px;
  pointer-events: none;
}

.absence-sticky-container {
  position: sticky;
  top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 8px;
}

.absence-label {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(2px);
  border: 1px solid #cbd5e1;
  border-left: 4px solid #94a3b8;
  border-radius: 6px;
  padding: 6px 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 10;
  pointer-events: auto;
}
</style>