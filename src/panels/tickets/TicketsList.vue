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
        <tbody class="text-xs divide-y divide-slate-100 bg-white">
          <tr v-if="tickets.length === 0">
            <td :colspan="visibleColumns.length" class="p-8 text-center text-slate-400 font-bold">Brak zgłoszeń pasujących do filtrów.</td>
          </tr>
          
          <tr v-for="(t, idx) in tickets" :key="t.id" class="transition-colors border-b border-slate-100/60 hover:bg-slate-50/80" :class="idx % 2 === 0 ? 'bg-white' : 'bg-[#fafbfc]'">
            <td v-for="col in visibleColumns" :key="col.id" class="py-3 px-4 border-r border-slate-50 align-top">
              
              <!-- AKCJE -->
              <div v-if="col.id === 'actions'" class="flex items-center justify-center h-[130px]">
                <div @click.stop="$emit('toggle-select', t.id)" class="w-1.5 h-6 rounded-full cursor-pointer transition-all" :class="selectedIds.includes(t.id) ? 'bg-[#58b347] shadow-[0_0_8px_rgba(88,179,71,0.6)] scale-y-110' : 'bg-slate-200 group-hover:bg-slate-300'"></div>
              </div>

              <!-- ID I STATUS -->
              <div v-else-if="col.id === 'code'" class="h-[130px] overflow-hidden flex flex-col pt-1">
                <span @click.stop="$emit('copy', getTicketIdDisplay(t, idx))" class="font-black tracking-wider text-[13px] block mb-1.5 cursor-pointer hover:opacity-70 transition-opacity w-fit text-slate-800" title="Kliknij, aby skopiować ID">{{ getTicketIdDisplay(t, idx) }}</span>
                <div v-if="store.activeModule !== 'ekoen'" @click.stop="$emit('copy', t.status)" class="text-[10px] font-bold text-slate-500 tracking-wider text-left mb-0.5 uppercase cursor-pointer hover:text-slate-800 transition-colors w-fit" title="Kopiuj status">{{ t.status || 'BRAK STATUSU' }}</div>
                <div @click.stop="$emit('copy', t.category || t.priority)" class="text-[10px] font-bold text-blue-600 tracking-wider text-left uppercase cursor-pointer hover:text-blue-800 transition-colors w-fit" title="Kopiuj kategorię">{{ t.category || t.priority || 'INNE' }}</div>

                <!-- LINK AXON CONNECT -->
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
              </div>

              <!-- STACJA -->
              <div v-else-if="col.id === 'station'" class="h-[130px] overflow-hidden flex flex-col pt-1">
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
              <div v-else-if="col.id === 'client_contact'" class="h-[130px] overflow-hidden flex flex-col pt-1">
                <div @click.stop="$emit('copy', t.client)" class="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1 cursor-pointer hover:text-blue-600 transition-colors w-fit">{{ t.client || 'Brak klienta' }}</div>
                <div class="text-[10px] text-slate-500 font-medium mt-1.5 leading-relaxed">
                  <span v-if="t.contact_person" @click.stop="$emit('copy', t.contact_person)" class="block cursor-pointer hover:text-blue-600 w-fit"><span class="font-bold">Osoba:</span> {{ t.contact_person }}</span>
                  <span v-if="t.contact_phone" @click.stop="$emit('copy', t.contact_phone)" class="block cursor-pointer hover:text-blue-600 w-fit"><span class="font-bold">Tel:</span> {{ t.contact_phone }}</span>
                  <span v-if="t.contact_email" @click.stop="$emit('copy', t.contact_email)" class="block cursor-pointer hover:text-blue-600 w-fit"><span class="font-bold">Email:</span> {{ t.contact_email }}</span>
                </div>
              </div>

              <!-- OPIS I ZAŁĄCZNIKI -->
              <div v-else-if="col.id === 'description'" class="h-[130px] overflow-y-auto ticket-custom-scrollbar pr-1 flex flex-col pt-1">
                <div @click.stop="$emit('copy', (t.title || t.subject || '') + '\n' + (t.description || '-'))" class="cursor-pointer hover:text-blue-600 transition-colors">
                  <span v-if="t.title || t.subject" class="block font-black text-[11px] text-slate-800 mb-1.5 uppercase tracking-wider pointer-events-none">{{ t.title || t.subject }}</span>
                  <div class="text-[11px] text-slate-600 font-medium whitespace-pre-wrap break-words leading-relaxed pointer-events-none">{{ t.description || '-' }}</div>
                </div>
                <button v-if="t.attachments_url || (t.attachments && t.attachments.length > 0)" @click.stop="$emit('open-attachments', t.attachments_url || t.attachments)" class="mt-2.5 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-green-500 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors border border-green-200 w-max shadow-sm shrink-0">
                  <svg class="w-3.5 h-3.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> 
                  <span class="pointer-events-none">Załączniki</span>
                </button>
              </div>

              <!-- TECHNIK I STATUS WEW. -->
              <div v-else-if="col.id === 'tech_parts'" class="h-[130px] overflow-visible flex flex-col items-start gap-1 relative pt-1">
                <div v-html="getTechPillHtml(t.technician_id)"></div>
                
                <div class="relative w-36 mt-2">
                  <button type="button" @click.stop="$emit('toggle-drop', t.id)" :class="getStatusColorClass(t.ticket_status)" class="border rounded-xl px-2 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-center shadow-sm cursor-pointer transition-colors w-full truncate block">
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
                <div class="relative w-36 mt-1">
                  <button
                    type="button"
                    @click.stop="openQuickSchedule(t)"
                    class="w-full rounded-xl px-2 py-1.5 text-[9px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 border transition-colors cursor-pointer truncate"
                    :class="getTicketScheduleEvent(t)
                      ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100'
                      : 'bg-white text-slate-400 border-dashed border-slate-300 hover:border-[#58b347] hover:text-[#58b347]'"
                    :title="getTicketScheduleEvent(t) ? 'Kliknij, aby zmienić termin wizyty' : 'Kliknij, aby zaplanować w harmonogramie'"
                  >
                    <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span class="truncate">{{ getTicketScheduleEvent(t) ? formatScheduleDate(getTicketScheduleEvent(t).start_time) : 'Zaplanuj' }}</span>
                  </button>

                  <!-- POPOVER KALENDARZA -->
                  <div
                    v-if="activeScheduleTicketId === t.id"
                    @click.stop
                    class="absolute top-full left-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[220] p-3 flex flex-col gap-2.5 animate-fadeIn"
                  >
                    <div class="text-[9px] font-black uppercase tracking-widest text-slate-400">Termin w harmonogramie</div>

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
                      <option v-for="tech in availableScheduleTechs" :key="tech.id || tech.name" :value="tech.id || tech.name">
                        {{ tech.name }}
                      </option>
                    </select>

                    <div class="flex gap-1.5 pt-1">
                      <button
                        type="button"
                        @click="activeScheduleTicketId = null"
                        class="flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        Anuluj
                      </button>
                      <button
                        type="button"
                        @click="saveQuickSchedule(t)"
                        class="flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white bg-[#58b347] hover:bg-[#499b3a] transition-colors shadow-sm"
                      >
                        Zapisz
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ZAPOTRZEBOWANIE NA CZĘŚCI -->
              <div v-else-if="col.id === 'used_parts'" class="h-[130px] overflow-y-auto ticket-custom-scrollbar pr-1 flex flex-col pt-1 cursor-pointer hover:bg-slate-50 transition-colors" @click.stop="$emit('copy', (t.raw_info || '') + '\n' + (t.req_status || ''))">
                 <div class="pointer-events-none" v-html="getPartsHtml(t.raw_info, t.req_status)"></div>
              </div>

              <!-- DIAGNOZA -->
              <div v-else-if="col.id === 'diagnoza'" class="h-[130px] overflow-y-auto ticket-custom-scrollbar pr-1 flex flex-col pt-1 cursor-pointer hover:bg-blue-50 transition-colors" @click.stop="$emit('open-diagnose', t.id || t.ticket_code || t.ticket_number)">
                <div class="text-[10px] text-slate-600 font-medium whitespace-pre-wrap leading-relaxed mb-2 pointer-events-none">
                  <span class="font-bold text-slate-800 uppercase tracking-widest text-[9px]">Diagnoza:</span><br>{{ t.raw_diagnoza || '-' }}
                </div>
                <div class="text-[10px] text-slate-500 font-medium whitespace-pre-wrap leading-relaxed border-t border-slate-100 pt-1.5 mt-auto shrink-0 pointer-events-none">
                  <span class="font-bold text-slate-800 uppercase tracking-widest text-[9px]">Notatki:</span><br>{{ t.notes || '-' }}
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
import { ref, computed, onMounted } from 'vue'
import { useTicketsStore } from '../../stores/useTicketsStore'
import { useScheduleStore } from '../../stores/useScheduleStore'
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
  'toggle-drop', 'change-status', 'drag-start', 'drop-col'
])

const store = useTicketsStore()

const scheduleStore = useScheduleStore()

const activeScheduleTicketId = ref(null)
const scheduleForm = ref({ date: '', tech: '' })

const availableScheduleTechs = computed(() => {
  return scheduleStore.techList.length > 0 ? scheduleStore.techList : (store.techList || [])
})

const getTicketScheduleEvent = (t) => {
  if (!scheduleStore.events || scheduleStore.events.length === 0) return null
  const ids = [t.id, t.ticket_code, t.ticket_number]
    .filter(Boolean)
    .map(v => String(v).toLowerCase().trim())

  return scheduleStore.events.find(ev => {
    const evTid = String(ev.ticket_id || '').toLowerCase().trim()
    return evTid && ids.includes(evTid)
  }) || null
}

const formatScheduleDate = (startTime) => {
  if (!startTime) return ''
  const d = new Date(startTime)
  if (isNaN(d.getTime())) return String(startTime).split('T')[0]
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })
}

const openQuickSchedule = (t) => {
  if (activeScheduleTicketId.value === t.id) {
    activeScheduleTicketId.value = null
    return
  }

  const existing = getTicketScheduleEvent(t)
  let defaultDate = new Date().toISOString().split('T')[0]
  if (existing && existing.start_time) {
    const d = new Date(existing.start_time)
    if (!isNaN(d.getTime())) {
      defaultDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
  }

  const techRaw = existing?.technician_id || t.technician_id || ''
  const matchedTech = availableScheduleTechs.value.find(
    x => String(x.id) === String(techRaw) || String(x.name).toLowerCase() === String(techRaw).toLowerCase().trim()
  )

  scheduleForm.value = {
    date: defaultDate,
    tech: matchedTech ? (matchedTech.id || matchedTech.name) : techRaw
  }
  activeScheduleTicketId.value = t.id
}

const saveQuickSchedule = (t) => {
  if (!scheduleForm.value.date) return

  const existing = getTicketScheduleEvent(t)
  const shortQp = getShortQp(t.qp_id || t.station_id)
  const titleParts = [shortQp !== '-' ? shortQp : '', t.city || '', t.title || t.subject || ''].filter(Boolean)

  scheduleStore.saveEventToCloud({
    id: existing ? existing.id : 'temp_' + Date.now(),
    ticket_id: String(t.id || t.ticket_code || t.ticket_number || ''),
    technician_id: scheduleForm.value.tech,
    title: existing?.title || titleParts.join(' • ') || 'Wizyta serwisowa',
    description: existing?.description || t.description || '',
    start_time: `${scheduleForm.value.date}T08:00:00`,
    end_time: `${scheduleForm.value.date}T16:00:00`,
    event_type: existing?.event_type || 'service',
    event_subtype: existing?.event_subtype || t.category || 'Awaria',
    all_day: 'NIE'
  })

  activeScheduleTicketId.value = null
}

onMounted(() => {
  if (scheduleStore.events.length === 0) {
    scheduleStore.fetchScheduleData()
  }
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
  let isEkoenTicket = (store.activeModule === 'ekoen') || (store.activeModule === 'historia' && (String(t.ticket_number || '').includes('EKOEN') || !t.ticket_code))
  if (isEkoenTicket) return `EE_${String(idx + 1).padStart(3, '0')}`
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

const getTechPillHtml = (techId) => {
  if(!techId || String(techId).trim() === '') return '<span class="inline-block px-2 py-1.5 rounded-full text-[10px] font-extrabold bg-white text-slate-500 border border-slate-200 uppercase tracking-widest w-36 text-center shadow-sm truncate pointer-events-none">Brak technika</span>'
  let techColor = '#64748b'
  if (store.techList && store.techList.length > 0) {
    let foundObj = store.techList.find(t => String(t.name).toLowerCase() === String(techId).toLowerCase().trim())
    if (foundObj && foundObj.zone_color) techColor = foundObj.zone_color
  }
  const hexToRgba = (hex, alpha) => {
    let c = hex.substring(1)
    if(c.length === 3) c = c.split('').map(x => x+x).join('')
    let num = parseInt(c, 16)
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`
  }
  return `<span class="inline-block px-2 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest w-36 text-center shadow-sm truncate border pointer-events-none" style="background-color: ${hexToRgba(techColor, 0.15)}; color: ${techColor}; border-color: ${hexToRgba(techColor, 0.4)};">${techId}</span>`
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