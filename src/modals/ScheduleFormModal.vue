<template>
  <div v-if="show" class="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn" @click.self="closeModal">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-slideUp flex flex-col max-h-[90vh]">
      
      <!-- NAGŁÓWEK -->
      <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
        <h3 class="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <svg class="w-5 h-5 text-[#58b347]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {{ isEditingMode ? 'Edycja Zdarzenia' : 'Kreator Zdarzenia' }}
        </h3>
        <button type="button" @click="closeModal" class="text-slate-400 hover:text-slate-700 transition-colors p-1 bg-slate-50 hover:bg-slate-100 rounded-lg">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- CIAŁO FORMULARZA -->
      <form @submit.prevent="handleSubmit" class="p-8 space-y-6 bg-slate-50/50 overflow-y-auto schedule-custom-scrollbar flex-1">
        
        <!-- WYBÓR TYPU ZDARZENIA (Zgrabne, poziome przyciski) -->
        <div class="grid grid-cols-2 gap-4">
          <label class="cursor-pointer">
            <input type="radio" v-model="form.event_type" value="task" class="peer sr-only" />
            <div class="py-3.5 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 peer-checked:border-[#58b347] peer-checked:bg-[#58b347]/5 peer-checked:text-[#58b347] border-slate-200 bg-white text-slate-400 hover:border-slate-300 shadow-sm">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>
              <span class="text-[11px] font-black uppercase tracking-widest mt-[1px]">Zadanie Operacyjne</span>
            </div>
          </label>
          <label class="cursor-pointer">
            <input type="radio" v-model="form.event_type" value="absence" class="peer sr-only" @change="form.is_all_day = true" />
            <div class="py-3.5 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 peer-checked:border-red-400 peer-checked:bg-red-50 peer-checked:text-red-500 border-slate-200 bg-white text-slate-400 hover:border-slate-300 shadow-sm">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="2" y1="2" x2="22" y2="22" stroke-width="2.5"/></svg>
              <span class="text-[11px] font-black uppercase tracking-widest mt-[1px]">Nieobecność</span>
            </div>
          </label>
        </div>

        <div class="grid grid-cols-2 gap-5">
          <!-- PRZYPISANIE DO TECHNIKA (Nowoczesny Dropdown) -->
          <div class="flex flex-col col-span-2 sm:col-span-1 relative">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Przypisz do Technika</label>
            
            <div class="relative w-full">
              <!-- Przycisk wyzwalający -->
              <div 
                @click="isTechDropdownOpen = !isTechDropdownOpen"
                class="w-full h-[46px] px-4 bg-white rounded-xl text-[13px] font-bold flex items-center justify-between cursor-pointer transition-all shadow-sm border"
                :class="isTechDropdownOpen ? 'border-[#58b347] text-[#58b347]' : 'border-slate-200 text-slate-800 hover:border-slate-300'"
              >
                <span>{{ selectedTechName }}</span>
                <svg class="w-4 h-4 transition-transform duration-200" :class="isTechDropdownOpen ? 'rotate-180 text-[#58b347]' : 'text-slate-400'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </div>

              <!-- Niewidzialna warstwa do zamykania kliknięciem gdziekolwiek obok (na całym ekranie) -->
              <div v-if="isTechDropdownOpen" class="fixed inset-0 z-[2010]" @click="isTechDropdownOpen = false"></div>

              <!-- Rozwijana lista opcji -->
              <transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
                <div v-if="isTechDropdownOpen" class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-[2020] overflow-hidden max-h-[220px] overflow-y-auto schedule-custom-scrollbar">
                  
                  <div 
                    v-for="tech in store.techList" 
                    :key="tech.id"
                    @click="selectTech(tech)"
                    class="px-4 py-3 text-[13px] font-bold border-b border-slate-100 last:border-b-0 transition-colors"
                    :class="[
                      isTechAbsent(tech.id, tech.name) 
                        ? 'text-slate-400 bg-slate-50 italic cursor-not-allowed' 
                        : form.technician_id === tech.id 
                          ? 'bg-[#f2fcf2] text-[#58b347] cursor-pointer' 
                          : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                    ]"
                  >
                    {{ tech.name }} {{ isTechAbsent(tech.id, tech.name) ? ' - (Nieobecny)' : '' }}
                  </div>

                </div>
              </transition>
            </div>
          </div>

          <!-- PODKATEGORIA -->
          <div class="flex flex-col col-span-2 sm:col-span-1 animate-fadeIn">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Kategoria</label>
            <select v-model="form.event_subtype" required class="w-full h-[46px] px-4 border border-slate-200 bg-white rounded-xl text-[13px] font-bold text-slate-800 focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm cursor-pointer">
              <template v-if="form.event_type === 'task'">
                <option value="Szkolenie">Szkolenie / Uprawnienia</option>
                <option value="Delegacja">Delegacja długa</option>
                <option value="Warsztat">Prace warsztatowe / Magazyn</option>
                <option value="Auto">Wymiana opon / Serwis Auta</option>
                <option value="Inne">Inne zadanie</option>
              </template>
              <template v-else-if="form.event_type === 'absence'">
                <option value="L4">L4 (Zwolnienie lekarskie)</option>
                <option value="Urlop">Urlop Wypoczynkowy</option>
                <option value="Na zadanie">Urlop na żądanie</option>
                <option value="Opieka">Opieka</option>
                <option value="Bezpłatny">Urlop bezpłatny</option>
              </template>
            </select>
          </div>
        </div>

        <!-- TYTUŁ I OPIS -->
        <div class="flex flex-col">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Tytuł / Krótki Opis</label>
          <input v-model="form.title" required placeholder="Np. Przegląd sprzętu, Choroba, itp..." class="w-full h-[46px] px-4 border border-slate-200 bg-white rounded-xl text-[14px] font-bold text-slate-800 focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm" />
        </div>

        <div class="flex flex-col">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Dodatkowe Notatki (Opcjonalnie)</label>
          <textarea v-model="form.description" rows="2" placeholder="Dodatkowe informacje..." class="w-full p-4 border border-slate-200 bg-white rounded-xl text-[13px] font-medium text-slate-600 focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm resize-none custom-scrollbar"></textarea>
        </div>

        <!-- CZAS TRWANIA -->
        <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">Ramy Czasowe</span>
            <label class="flex items-center gap-2 cursor-pointer group">
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-700 transition-colors">Wydarzenie Całodniowe / Wiele dni</span>
              <div class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.is_all_day" class="sr-only peer">
                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#58b347]"></div>
              </div>
            </label>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="flex flex-col">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Początek</label>
              <input :type="form.is_all_day ? 'date' : 'datetime-local'" v-model="form.start_time" required class="w-full h-[42px] px-3 border-b-2 border-slate-200 bg-slate-50 text-[12px] font-bold text-slate-800 focus:outline-none focus:border-[#58b347] transition-all hover:bg-slate-100 rounded-t-lg" />
            </div>
            <div class="flex flex-col">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Zakończenie</label>
              <input :type="form.is_all_day ? 'date' : 'datetime-local'" v-model="form.end_time" class="w-full h-[42px] px-3 border-b-2 border-slate-200 bg-slate-50 text-[12px] font-bold text-slate-800 focus:outline-none focus:border-[#58b347] transition-all hover:bg-slate-100 rounded-t-lg" />
            </div>
          </div>
        </div>

      </form>
      
      <!-- STOPKA -->
      <div class="px-8 py-5 border-t border-slate-100 bg-white flex gap-4 shrink-0 rounded-b-3xl">
        <button type="button" @click="closeModal" class="flex-1 border border-slate-200 bg-white text-slate-700 font-bold py-3.5 rounded-xl text-[13px] hover:bg-slate-50 transition-colors shadow-sm">
          Anuluj
        </button>
        <button type="button" @click="handleSubmit" class="flex-1 bg-[#58b347] text-white font-bold py-3.5 rounded-xl text-[13px] hover:bg-[#499b3a] transition-colors shadow-sm shadow-[#58b347]/20 flex items-center justify-center gap-2">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
          Zapisz Zdarzenie
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useScheduleStore } from '../stores/useScheduleStore'

const props = defineProps({
  show: { type: Boolean, default: false },
  initialData: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['close', 'save'])
const store = useScheduleStore()

// Domyślnie "task"
const form = ref({
  id: '',
  ticket_id: null,
  technician_id: '',
  title: '',
  description: '',
  start_time: '',
  end_time: '',
  event_type: 'task',
  event_subtype: 'Warsztat',
  is_all_day: false
})

const isEditingMode = computed(() => !!props.initialData?.id && props.initialData.id !== '')

// --- NOWY KOD: Wyszukiwanie nieobecnych techników ---
const absentTechnicians = computed(() => {
  const startTime = form.value.start_time; 
  if (!startTime) return [];

  // Wyciągamy samą datę RRRR-MM-DD z inputa (nieważne, czy to date czy datetime-local)
  const targetDateStr = String(startTime).includes('T') ? String(startTime).split('T')[0] : String(startTime).split(' ')[0];

  // Filtrujemy zdarzenia typu 'absence' z głównego store'a
  const absences = store.events.filter(ev => {
    const isAbsence = ev.event_type === 'absence' || (ev.extendedProps && ev.extendedProps.event_type === 'absence');
    if (!isAbsence) return false;

    const startStr = String(ev.start_time).includes('T') ? String(ev.start_time).split('T')[0] : String(ev.start_time).split(' ')[0];
    const endStr = ev.end_time ? (String(ev.end_time).includes('T') ? String(ev.end_time).split('T')[0] : String(ev.end_time).split(' ')[0]) : startStr;

    return targetDateStr >= startStr && targetDateStr <= endStr;
  });

  // Zwracamy unikalną listę ID (i/lub imion) techników będących na L4/Urlopie
  return [...new Set(absences.map(a => a.technician_id || (a.extendedProps ? a.extendedProps.technicianName : '')))];
});

// Pomocnicza funkcja do użycia bezpośrednio w HTML
const isTechAbsent = (techId, techName) => {
  return absentTechnicians.value.includes(techId) || absentTechnicians.value.includes(techName);
};
// ----------------------------------------------------

// --- NOWY KOD: Obsługa customowego dropdownu techników ---
const isTechDropdownOpen = ref(false);

const selectedTechName = computed(() => {
  if (!form.value.technician_id) return '-- Wybierz technika --';
  const tech = store.techList.find(t => t.id === form.value.technician_id);
  return tech ? tech.name : '-- Wybierz technika --';
});

const selectTech = (tech) => {
  // Blokada wyboru jeśli technik jest na urlopie
  if (isTechAbsent(tech.id, tech.name)) return; 
  
  form.value.technician_id = tech.id;
  isTechDropdownOpen.value = false;
};
// ---------------------------------------------------------

// Konwersja czasu na potrzeby HTML-owych inputów
const toInputFormat = (isoString, isAllDay) => {
  if (!isoString) return ''
  if (isAllDay) return String(isoString).substring(0, 10) // YYYY-MM-DD
  return String(isoString).substring(0, 16) // YYYY-MM-DDTHH:mm
}

// Przywracanie czasu do standardu ISO dla bazy
const fromInputFormat = (inputString, isAllDay, isEnd = false) => {
  if (!inputString) return ''
  if (isAllDay) {
    return isEnd ? `${inputString}T23:59:59` : `${inputString}T00:00:00`
  }
  if (inputString.length === 16) return inputString + ':00'
  return inputString
}

watch(() => props.show, (newVal) => {
  if (newVal && props.initialData) {
    const isAllDayVal = props.initialData.is_all_day === true || props.initialData.all_day === 'TAK'
    const evType = props.initialData.event_type && props.initialData.event_type !== 'service' ? props.initialData.event_type : 'task'
    
    // Nadawanie podkategorii domyślnych
    let defaultSub = ''
    if (evType === 'absence') defaultSub = 'L4'
    if (evType === 'task') defaultSub = 'Warsztat'

    form.value = {
      id: props.initialData.id || `EV_${Date.now()}`,
      ticket_id: props.initialData.ticket_id || null,
      technician_id: props.initialData.technician_id || '',
      title: props.initialData.title || (props.initialData.start_time ? '' : 'Nowe zadanie...'),
      description: props.initialData.description || '',
      event_type: evType,
      event_subtype: props.initialData.event_subtype || defaultSub,
      is_all_day: isAllDayVal,
      start_time: toInputFormat(props.initialData.start_time, isAllDayVal),
      end_time: toInputFormat(props.initialData.end_time, isAllDayVal)
    }
  }
})

// Auto-czyszczenie podkategorii, gdy zmieniamy główny typ
watch(() => form.value.event_type, (newType) => {
  if (newType === 'absence') {
    if(!form.value.event_subtype || !['L4', 'Urlop', 'Na zadanie', 'Opieka', 'Bezpłatny'].includes(form.value.event_subtype)) {
      form.value.event_subtype = 'L4'
    }
    form.value.is_all_day = true // Absencje zazwyczaj są na cały dzień
  } else if (newType === 'task') {
    if(!form.value.event_subtype || !['Szkolenie', 'Delegacja', 'Warsztat', 'Auto', 'Inne'].includes(form.value.event_subtype)) {
      form.value.event_subtype = 'Warsztat'
    }
  }
})

// Automatyczne resetowanie inputów przy zmianie all_day
watch(() => form.value.is_all_day, (isAllDayNow) => {
  if (form.value.start_time) form.value.start_time = toInputFormat(form.value.start_time, isAllDayNow)
  if (form.value.end_time) form.value.end_time = toInputFormat(form.value.end_time, isAllDayNow)
})

const closeModal = () => emit('close')

const handleSubmit = () => {
  if (!form.value.start_time) {
    alert("Proszę podać przynajmniej datę/czas rozpoczęcia."); return;
  }

  const payload = {
    ...form.value,
    start_time: fromInputFormat(form.value.start_time, form.value.is_all_day, false),
    end_time: fromInputFormat(form.value.end_time, form.value.is_all_day, true),
    all_day: form.value.is_all_day ? 'TAK' : 'NIE' 
  }
  
  emit('save', payload)
}
</script>

<style scoped>
.schedule-custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.schedule-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.schedule-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }
.schedule-custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.8); }
</style>