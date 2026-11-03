<template>
  <div class="flex-1 flex w-full relative px-8 py-6 gap-6 z-30 overflow-hidden">
    
    <!-- BACKLOG -->
    <div class="w-[340px] bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm flex flex-col shrink-0 h-full overflow-hidden">
      <div class="p-4 border-b border-slate-200 bg-white flex justify-between items-center z-10 shrink-0">
        <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <svg class="w-4 h-4 text-[#58b347]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Backlog Zgłoszeń
        </h3>
        <span v-if="filteredTickets.length !== totalBacklogCount" class="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
          {{ filteredTickets.length }} / {{ totalBacklogCount }}
        </span>
        <span v-else class="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
          {{ totalBacklogCount }}
        </span>
      </div>
      
      <div class="flex-1 overflow-y-auto schedule-custom-scrollbar p-4 bg-slate-100/30 flex flex-col">
        <div v-if="store.isLoading" class="text-center text-xs font-bold text-slate-400 py-10 animate-pulse">Ładowanie...</div>
        <div v-else-if="filteredTickets.length === 0" class="text-center text-xs font-bold text-slate-400 py-10">Brak zgłoszeń.</div>
        
        <div v-for="ticket in filteredTickets" :key="ticket.t_id"
             draggable="true" @dragstart="onDragStartBacklog($event, ticket)" @dragend="onGlobalDragEnd"
             class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-grab mb-4 flex flex-col group shrink-0"
             :class="{'opacity-40': isDragging && dragPayload?.data?.t_id === ticket.t_id}"
             :style="`border-left: 6px solid ${ticket.techColor && ticket.techColor !== '#cbd5e1' ? ticket.techColor : '#fcd34d'}`">
          
          <div class="flex justify-between items-start mb-2 pointer-events-none gap-2">
            <div class="flex flex-wrap items-center gap-1.5">
              <span v-if="ticket.t_code" class="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{{ ticket.t_code }}</span>
              <span v-if="ticket.t_qp" class="text-[10px] font-black text-[#58b347] bg-[#58b347]/10 px-2 py-0.5 rounded border border-[#58b347]/20">{{ ticket.t_qp }}</span>
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
          <button @click="cal.navigateCalendar(-1)" class="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>
          <button @click="cal.navigateCalendar(1)" class="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>
          <button @click="cal.navigateToday(); focusToday()" class="px-4 py-1.5 rounded-lg border border-slate-200 text-[11px] font-black text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest">Dzisiaj</button>
        </div>
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span class="text-[12px] font-black text-slate-700 tracking-widest uppercase">
            {{ cal.calendarTitleDisplay.value }}
          </span>
        </div>
      </div>

      <div class="flex border-b border-slate-200 bg-slate-50 shrink-0" :class="{ 'pr-[6px]': store.currentView !== 'month' }">
        <div class="w-16 shrink-0 border-r border-slate-200" v-if="store.currentView === 'day'"></div>
        <div class="flex-1 grid" :class="store.currentView === 'day' ? 'grid-cols-1' : 'grid-cols-7'">
          <div v-for="day in (store.currentView === 'month' ? ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'] : cal.activeDaysArray.value)" :key="day.YYYY_MM_DD || day" 
               @click="store.currentView !== 'month' && store.currentView !== 'day' ? goToDay(day.date) : null"
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

      <!-- WIDOK: MIESIĄC -->
      <div v-if="store.currentView === 'month'" class="flex-1 bg-white flex flex-col" @contextmenu.prevent="$emit('rotate-view')" @dblclick="resetToFleet">
         <div class="grid grid-cols-7 flex-1" style="grid-auto-rows: minmax(0, 1fr);">
            <div v-for="day in cal.activeMonthArray.value" :key="day.YYYY_MM_DD" 
                 @dragover.prevent="onDragOverColumn($event, day.YYYY_MM_DD)" 
                 @drop.stop="onDropDayColumn($event, day.YYYY_MM_DD)"
                 @dragleave="onDragLeaveColumn"
                 @click="goToDay(day.date)"
                 class="border-r border-b border-slate-200 last:border-r-0 relative hover:bg-slate-50 transition-colors cursor-pointer"
                 :class="!day.isCurrentMonth ? 'bg-slate-50/50' : ''">
               
               <div v-if="dragHoverSlot.active && dragHoverSlot.dateStr === day.YYYY_MM_DD" 
                    class="absolute inset-0 bg-[#58b347]/10 border-2 border-dashed border-[#58b347] z-[150] pointer-events-none transition-all duration-75">
               </div>

               <div class="text-right p-2 shrink-0 flex justify-end items-start h-8 relative z-10">
                  <span class="text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm" :class="day.isToday ? 'text-white bg-[#58b347]' : 'text-slate-600 bg-slate-200/50'">{{ day.DD }}</span>
               </div>
               
               <div class="absolute top-8 left-1 right-1 bottom-1 flex flex-col gap-1 overflow-y-auto schedule-custom-scrollbar pr-0.5">
                  <div v-for="ev in cal.eventsByDate.value[day.YYYY_MM_DD] || []" :key="ev.id"
                       draggable="true" @dragstart="onDragStartEvent($event, ev)" @dragend="onGlobalDragEnd"
                       class="border rounded px-1.5 py-1.5 text-[9px] font-bold cursor-grab transition-all shrink-0 flex flex-col group/monthcard relative z-10"
                       :class="[
                         ev.extendedProps.event_type === 'absence' ? 'bg-red-50/90 border-red-200 text-red-700' :
                         ev.extendedProps.event_type === 'task' ? 'bg-[#58b347]/10 border-[#58b347]/30 text-slate-700' :
                         'bg-white border-slate-200 text-slate-700',
                         isDragging && dragPayload?.data?.id === ev.id ? 'opacity-40' : 'hover:shadow-md'
                       ]"
                       :style="ev.computedStyle" @contextmenu.stop @click.stop>
                     
                     <div class="flex justify-between items-start gap-1 w-full">
                       <span class="text-[8px] uppercase tracking-widest truncate mt-0.5" :style="`color: ${ev.extendedProps.techColor}`">{{ ev.extendedProps.technicianName }}</span>
                       <button @click.stop="$emit('confirm-delete-event', ev.id)" class="opacity-0 group-hover/monthcard:opacity-100 text-slate-300 hover:text-red-500 transition-all p-0.5 -mt-1 -mr-1 shrink-0 bg-white/80 rounded"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                     </div>
                     
                     <div class="flex flex-wrap items-center gap-1 mb-0.5 w-full mt-0.5 pointer-events-none">
                       <template v-if="ev.extendedProps.event_type === 'service'">
                         <span class="text-slate-500 bg-slate-100 rounded px-1 text-[8px] border border-slate-200 truncate">{{ ev.extendedProps.ticketCode }}</span>
                         <span v-if="ev.extendedProps.qpCode" class="text-[#58b347] bg-[#58b347]/10 rounded px-1 text-[8px] border border-[#58b347]/20 truncate">{{ ev.extendedProps.qpCode }}</span>
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

      <!-- WIDOK: TYDZIEŃ ORAZ DZIEŃ -->
      <div v-else class="flex-1 overflow-y-auto schedule-custom-scrollbar flex relative bg-white pb-12" ref="dayViewScrollContainer" @contextmenu.prevent="$emit('rotate-view')" @dragleave="onDragLeaveColumn">
        
        <div v-if="store.currentView === 'day'" class="absolute left-16 right-0 border-t-2 border-red-500 z-50 pointer-events-none" :style="cal.currentTimeLineStyle.value">
          <div class="absolute -left-2 -top-1.5 w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
        </div>

        <div class="w-16 shrink-0 border-r border-slate-200 bg-white z-10 relative" v-if="store.currentView === 'day'">
          <div v-for="hour in cal.calendarHours" :key="hour" class="h-[80px] border-b border-slate-100 flex justify-center items-start pt-1.5 text-[10px] font-black text-slate-400 relative">
            {{ hour }}:00
            <div class="absolute top-[40px] w-2 border-t border-slate-300 right-0"></div>
          </div>
        </div>

        <div class="flex-1 grid relative bg-white h-max" :class="store.currentView === 'week' ? 'grid-cols-7' : 'grid-cols-1'">
          <div v-for="day in cal.activeDaysArray.value" :key="day.YYYY_MM_DD" class="border-r border-slate-200 last:border-r-0 relative group/day hover:bg-slate-50/30 transition-colors"
               @dragover.prevent="onDragOverColumn($event, day.YYYY_MM_DD)"
               @drop.stop="onDropDayColumn($event, day.YYYY_MM_DD)">
            
            <!-- DODANA NIEWIDZIALNA KLIKALNA WARSTWA POD EVENTAMI Z OBSŁUGĄ offset Y -->
            <div class="absolute inset-0 z-0 pointer-events-auto"
                 @contextmenu.prevent="$emit('rotate-view')"
                 @click.self="(e) => onEmptySlotClick(day.YYYY_MM_DD, e.offsetY / 80)"
                 @dragover.prevent="onDragOverColumn($event, day.YYYY_MM_DD)" 
                 @drop.stop="onDropDayColumn($event, day.YYYY_MM_DD)"
                 @dragleave="onDragLeaveColumn">
            </div>

            <div v-for="hour in cal.calendarHours" :key="'bg'+hour" class="h-[80px] border-b border-slate-100/60 w-full relative pointer-events-none">
              <div class="absolute inset-x-0 top-[40px] border-t border-dashed border-slate-100"></div>
            </div>

            <div v-if="dragHoverSlot.active && dragHoverSlot.dateStr === day.YYYY_MM_DD"
                 class="absolute left-1 right-1 rounded-lg border-2 border-dashed border-[#58b347] bg-[#58b347]/10 z-[200] pointer-events-none transition-all duration-75 flex items-center justify-center shadow-inner"
                 :style="`top: ${dragHoverSlot.top}px; height: ${dragHoverSlot.height}px;`">
                <span class="text-[#58b347] font-black text-[10px] uppercase tracking-widest bg-white/90 px-3 py-1 rounded shadow-sm">{{ dragHoverSlot.text }}</span>
            </div>

            <div v-for="ev in cal.eventsByDate.value[day.YYYY_MM_DD] || []" :key="ev.id"
                 draggable="true" @dragstart="onDragStartEvent($event, ev)" @dragend="onGlobalDragEnd"
                 class="absolute rounded-lg pt-1.5 px-2 pb-2 border text-xs cursor-grab transition-all duration-200 flex flex-col overflow-hidden group/card origin-top-left"
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
                 @contextmenu.stop @click.stop> 
              
              <div class="flex justify-between items-start mb-1 border-b border-slate-900/5 pb-1 shrink-0 gap-2">
                <span class="font-black text-[9px] uppercase tracking-wider truncate" :style="`color: ${ev.extendedProps.techColor}`">{{ ev.extendedProps.technicianName }}</span>
                <button @click.stop="$emit('confirm-delete-event', ev.id)" class="text-slate-400 hover:text-red-500 hover:bg-red-50 p-0.5 rounded pointer-events-auto shrink-0 z-50 transition-colors -mt-0.5 -mr-0.5 bg-white/50 backdrop-blur"><svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
              </div>
              
              <div class="flex flex-wrap items-center gap-1 mb-1 shrink-0 pointer-events-none">
                <template v-if="ev.extendedProps.event_type === 'service'">
                  <span class="font-black text-[9px] truncate bg-white px-1.5 py-0.5 rounded text-slate-600 border border-slate-200 shadow-sm">{{ ev.extendedProps.ticketCode }}</span>
                  <span v-if="ev.extendedProps.qpCode" class="font-black text-[9px] truncate bg-[#58b347]/10 px-1.5 py-0.5 rounded text-[#58b347] border border-[#58b347]/20">{{ ev.extendedProps.qpCode }}</span>
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
              
              <template v-if="store.currentView === 'week'">
                <div class="font-bold text-[10px] break-words leading-tight w-full text-slate-800 shrink-0 pointer-events-none">{{ ev.title }}</div>
                <p class="text-[8px] text-slate-600 leading-tight line-clamp-2 overflow-hidden pointer-events-none mt-1">{{ ev.extendedProps.description }}</p>
              </template>

              <template v-else>
                <div class="flex items-start justify-between w-full gap-2 shrink-0 pointer-events-none mb-1">
                  <div class="font-bold text-[10px] break-words leading-tight text-slate-800 flex-1">{{ ev.title }}</div>
                  <span class="text-[8px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 border border-blue-100 px-1 py-0.5 rounded shrink-0">{{ ev.extendedProps.category || 'Zgłoszenie' }}</span>
                </div>
                <p class="text-[9px] text-slate-600 leading-tight flex-1 overflow-hidden pointer-events-none">{{ ev.extendedProps.description }}</p>
              </template>

              <div v-if="!ev.extendedProps.all_day && ev.extendedProps.event_type !== 'absence'" 
                   class="mt-auto pt-1.5 flex justify-between items-center shrink-0 pointer-events-none w-full gap-2 border-t border-slate-100/80">
                <span class="text-[9px] font-black bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded shadow-sm">{{ new Date(String(ev.start_time).replace(' ', 'T')).getHours() }}:{{ String(new Date(String(ev.start_time).replace(' ', 'T')).getMinutes()).padStart(2, '0') }} - {{ ev.end_time ? new Date(String(ev.end_time).replace(' ', 'T')).getHours() + ':' + String(new Date(String(ev.end_time).replace(' ', 'T')).getMinutes()).padStart(2, '0') : '' }}</span>
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
      
      <!-- WŁAŚCIWY MODAL DO TWORZENIA EVENTÓW (Wyrzucony z hierarchii, zawsze na samym wierzchu) -->
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
import { ref, nextTick } from 'vue'
import UniversalTabModal from '../../common/UniversalTabModal.vue'
import { useScheduleStore } from '../../stores/useScheduleStore'
import { useCalendar } from '../../composables/useCalendar'
import ScheduleFormModal from '../../modals/ScheduleFormModal.vue'

const props = defineProps({
  filteredTickets: Array,
  totalBacklogCount: Number
})

const emit = defineEmits(['confirm-delete-event', 'rotate-view'])

const store = useScheduleStore()
const cal = useCalendar()

const dayViewScrollContainer = ref(null)

const focusToday = () => {
  nextTick(() => {
    if (!dayViewScrollContainer.value) return
    if (store.currentView === 'day') {
      const now = new Date()
      const exactHour = now.getHours() + (now.getMinutes() / 60)
      dayViewScrollContainer.value.scrollTo({ top: Math.max(0, (exactHour * 80) - 100), behavior: 'smooth' })
    } else if (store.currentView === 'week') {
      dayViewScrollContainer.value.scrollTo({ top: 520, behavior: 'smooth' }) 
    }
  })
}

// NAWIGACJA
let scrollTimeout = null
const onHeaderScroll = (e) => {
  if (Math.abs(e.deltaY) < 10) return
  if (scrollTimeout) return
  scrollTimeout = setTimeout(() => { scrollTimeout = null }, 150)
  if (e.deltaY > 0) cal.navigateCalendar(1)
  else cal.navigateCalendar(-1)
}

const goToDay = (dateObj) => {
  cal.currentDate.value = new Date(dateObj)
  store.currentView = 'day'
  focusToday()
}

const resetToFleet = () => {
  store.selectedTechId = 'ALL'
}

// --- LOGIKA DRAG & DROP ---
const isDragging = ref(false)
const dragPayload = ref(null)
const dragHoverSlot = ref({ active: false, top: 0, height: 80, dateStr: '', text: '' })

const onDragStartBacklog = (e, ticket) => {
  isDragging.value = true
  const rect = e.target.getBoundingClientRect()
  dragPayload.value = { type: 'backlog', data: ticket, durationMs: 2 * 3600000, offsetY: e.clientY - rect.top }
  if (e.dataTransfer) { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", ticket.t_id) }
}

const onDragStartEvent = (e, ev) => {
  e.stopPropagation()
  isDragging.value = true
  const rect = e.target.getBoundingClientRect()
  const s = new Date(ev.start_time).getTime()
  const eT = ev.end_time ? new Date(ev.end_time).getTime() : s + 2 * 3600000
  dragPayload.value = { type: 'event', data: ev, durationMs: eT - s, offsetY: e.clientY - rect.top }
  if (e.dataTransfer) { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", ev.id) }
}

const calculateDropPosition = (clientY, columnRect, dateStr) => {
  const p = dragPayload.value
  let targetTech = store.selectedTechId
  if (targetTech === 'ALL') targetTech = p.data.actualTechId || p.data.technician_id
  if (!targetTech || targetTech === 'ALL') return null

  // Gwarancja dopasowania technika niezależnie czy to UUID czy Imię
  const techObj = store.techList.find(t => t.id === targetTech || t.name === targetTech)
  const finalTechId = techObj ? techObj.id : targetTech
  const techName = techObj ? techObj.name : targetTech

  let y = clientY - columnRect.top - (p.offsetY || 0)
  if (y < 0) y = 0
  
  // Obliczanie czasu na podstawie pozycji kursora (zaokrąglone do 30 min)
  let hoursFloat = Math.round((y / 80) * 2) / 2
  let startMs = new Date(`${dateStr}T00:00:00`).getTime() + hoursFloat * 3600000
  const durationMs = p.durationMs
  let endMs = startMs + durationMs

  const excludeId = p.type === 'event' ? p.data.id : null
  
  // Pancerne filtrowanie (odporne na formaty dat ze spacją zamiast T)
  const techEventsDay = store.events.filter(x => {
    // IGNORUJEMY NIEOBECNOŚCI - nie są przeszkodą fizyczną
    const isAbsence = x.event_type === 'absence' || (x.extendedProps && x.extendedProps.event_type === 'absence');
    if (isAbsence) return false;

    const isSameTech = (x.technician_id === finalTechId || x.technician_id === techName || (x.extendedProps && x.extendedProps.technicianName === techName));
    const evDateStr = String(x.start_time).includes('T') ? String(x.start_time).split('T')[0] : String(x.start_time).split(' ')[0];
    return isSameTech && evDateStr === dateStr && x.id !== excludeId;
  })

  // Lekkie przyciąganie (magnetyzm) do krawędzi (15 minut = 900000 ms)
  const snapThreshold = 900000; 
  for (const ev of techEventsDay) {
    const evS = new Date(String(ev.start_time).replace(' ', 'T')).getTime()
    const evE = ev.end_time ? new Date(String(ev.end_time).replace(' ', 'T')).getTime() : evS + 2 * 3600000
    
    if (Math.abs(startMs - evE) <= snapThreshold) { startMs = evE; endMs = startMs + durationMs; break; }
    if (Math.abs(endMs - evS) <= snapThreshold) { endMs = evS; startMs = endMs - durationMs; break; }
  }

  // --- INTELIGENTNA RESOLUCJA KOLIZJI DLA WIDOKU DNIA ---
  let hasCollision = techEventsDay.some(ev => {
    const evS = new Date(String(ev.start_time).replace(' ', 'T')).getTime()
    const evE = ev.end_time ? new Date(String(ev.end_time).replace(' ', 'T')).getTime() : evS + 2 * 3600000
    return startMs < evE && endMs > evS
  })

  if (hasCollision) {
    // Zbieramy możliwe wolne luki (początek dnia roboczego oraz tuż po / przed każdym zdarzeniem)
    let candidates = [new Date(`${dateStr}T07:00:00`).getTime()] 
    techEventsDay.forEach(ev => {
       const evS = new Date(String(ev.start_time).replace(' ', 'T')).getTime()
       const evE = ev.end_time ? new Date(String(ev.end_time).replace(' ', 'T')).getTime() : evS + 2 * 3600000
       candidates.push(evE)             // Tuż po evencie
       candidates.push(evS - durationMs) // Tuż przed eventem
    })
    
    let bestCandidate = null
    let minDiff = Infinity

    for (let cand of candidates) {
       if (cand < new Date(`${dateStr}T00:00:00`).getTime()) continue // Zapobiega przeskoczeniu na wczoraj
       
       const candEnd = cand + durationMs
       let collides = techEventsDay.some(ev => {
          const evS = new Date(String(ev.start_time).replace(' ', 'T')).getTime()
          const evE = ev.end_time ? new Date(String(ev.end_time).replace(' ', 'T')).getTime() : evS + 2 * 3600000
          return cand < evE && candEnd > evS
       })
       
       // Wybieramy tę lukę, która jest NAJBLIŻEJ oryginalnego miejsca upuszczenia kursora
       if (!collides) {
          let diff = Math.abs(cand - startMs) 
          if (diff < minDiff) { 
             minDiff = diff; 
             bestCandidate = cand 
          }
       }
    }
    
    if (bestCandidate !== null) { 
        startMs = bestCandidate; 
        endMs = startMs + durationMs 
    }
  }

  return { startMs, endMs, targetTech }
}

const onDragOverColumn = (e, dateStr) => {
  if (!dragPayload.value) return
  
  const p = dragPayload.value
  let targetTech = store.selectedTechId
  if (targetTech === 'ALL') targetTech = p.data.technician_id || p.data.actualTechId
  if (!targetTech || targetTech === 'ALL') return

  if (store.currentView === 'month') {
     dragHoverSlot.value = { active: true, dateStr: dateStr }
     return
  }

  const durHours = p.durationMs / 3600000

  if (store.currentView === 'day') {
    const res = calculateDropPosition(e.clientY, e.currentTarget.getBoundingClientRect(), dateStr)
    if (res) {
       const d0 = new Date(`${dateStr}T00:00:00`).getTime()
       dragHoverSlot.value = {
          active: true, dateStr: dateStr,
          top: ((res.startMs - d0) / 3600000) * 80,
          height: durHours * 80,
          text: 'ZAPISZ TUTAJ'
       }
    }
  } else {
    const excludeId = p.type === 'event' ? p.data.id : null
    const slot = cal.findNextAvailableSlot(targetTech, dateStr, excludeId, 7, durHours)
    const startMs = new Date(slot.start).getTime()
    const d0 = new Date(`${dateStr}T00:00:00`).getTime()
    
    dragHoverSlot.value = {
        active: true, dateStr: dateStr,
        top: ((startMs - d0) / 3600000) * 80,
        height: durHours * 80,
        text: `${new Date(startMs).getHours()}:${String(new Date(startMs).getMinutes()).padStart(2,'0')} - AUTO`
    }
  }
}

const onDragLeaveColumn = () => { dragHoverSlot.value.active = false }

const onDropDayColumn = (e, dateStr) => {
  isDragging.value = false
  dragHoverSlot.value.active = false
  if (!dragPayload.value) return
  
  const p = dragPayload.value
  let targetTech = store.selectedTechId
  if (targetTech === 'ALL') targetTech = p.data.technician_id || p.data.actualTechId
  if (!targetTech || targetTech === 'ALL') { alert("Wybierz technika przed upuszczeniem!"); dragPayload.value = null; return }

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
      id: "EV_" + Date.now(), 
      ticket_id: p.data.ticket_code || p.data.id || p.data.t_code || p.data.t_id || '', 
      technician_id: targetTech, 
      // Zabezpieczenie przed pustym tytułem (szuka różnych wersji klucza z backendu):
      title: p.data.title || p.data.subject || p.data.t_title || 'Awaria z backlogu', 
      description: p.data.description || p.data.t_desc || '',
      start_time: sTime, 
      end_time: eTime, 
      event_type: "service",
      event_subtype: "Awaria",
      all_day: "NIE"
    })
  } else {
    store.saveEventToCloud({ 
      ...p.data, 
      start_time: sTime, 
      end_time: eTime, 
      technician_id: targetTech 
    })
  }
  dragPayload.value = null
}

const onGlobalDragEnd = () => {
  isDragging.value = false
  dragHoverSlot.value.active = false
  dragPayload.value = null
}

// --- LOGIKA MANUALNEGO DODAWANIA ZGŁOSZEŃ (LEWY KLIK W KALENDARZ) ---
const showEventModal = ref(false)
const editingEventData = ref({})

// Z głównego przycisku:
const openManualEventModal = () => {
  const todayStr = new Date().toISOString().split('T')[0]
  const payload = cal.handleEmptySlotClick(todayStr)
  
  editingEventData.value = {
    id: "EV_" + Date.now(),
    ticket_id: null,
    technician_id: payload.techId || '',
    title: '',
    start_time: payload.startDate,
    end_time: '',
    event_type: 'task' // Zmienione z 'service' na 'task'
  }
  showEventModal.value = true
}

// Z lewego kliknięcia w siatkę godzin:
const onEmptySlotClick = (dateStr, hour) => {
  const payload = cal.handleEmptySlotClick(dateStr, hour)
  
  editingEventData.value = {
    id: "EV_" + Date.now(),
    ticket_id: null,
    technician_id: payload.techId || '',
    title: '',
    start_time: payload.startDate,
    end_time: '',
    event_type: 'task' // Zmienione z 'service' na 'task'
  }
  showEventModal.value = true
}

// Po kliknięciu ZAPISZ w modalu:
const saveManualEvent = (payload) => {
  // Przekazanie do store'a (i Google Apps Script)
  store.saveEventToCloud(payload)
  showEventModal.value = false
}

// Pozwól widokowi zewnętrznemu korzystać z tych funkcji
defineExpose({ focusToday, onGlobalDragEnd, openManualEventModal })
</script>

<style scoped>
.schedule-custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.schedule-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.schedule-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
.schedule-custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.8); }
</style>