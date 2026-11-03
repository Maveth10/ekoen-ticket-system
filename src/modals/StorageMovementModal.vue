<template>
  <div v-if="show" class="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn" @click.self="closeModal">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-visible border border-slate-200 animate-slideUp">
      
      <!-- NAGŁÓWEK Z ZAKŁADKAMI -->
      <div class="bg-white px-6 pt-5 border-b border-slate-100 flex flex-col gap-4 rounded-t-2xl">
        <div class="flex justify-between items-center">
          <h3 class="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            Rejestracja operacji magazynowej
          </h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-700 transition-colors p-1">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- PRZEŁĄCZNIK TYPU OPERACJI -->
        <div class="flex bg-slate-100/80 p-1 rounded-t-xl gap-1">
          <button 
            type="button" 
            @click="form.type = 'PRZESUNIĘCIE'" 
            class="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
            :class="form.type === 'PRZESUNIĘCIE' ? 'bg-white text-[#58b347] shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'"
          >Przesunięcie</button>
          <button 
            type="button" 
            @click="form.type = 'DOSTAWA'" 
            class="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
            :class="form.type === 'DOSTAWA' ? 'bg-white text-[#58b347] shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'"
          >Dostawa</button>
          <button 
            type="button" 
            @click="form.type = 'ZUŻYCIE'" 
            class="flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
            :class="form.type === 'ZUŻYCIE' ? 'bg-white text-[#58b347] shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'"
          >Zużycie</button>
        </div>
      </div>

      <!-- CIAŁO FORMULARZA -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 bg-slate-50/30 rounded-b-2xl">
        
        <!-- WSPÓLNE: ASORTYMENT I ILOŚĆ -->
        <div class="grid grid-cols-12 gap-5 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div class="col-span-12 sm:col-span-8">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Co operujesz? (Część / Pojazd) *</label>
            <select v-model="form.part_sku" required class="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-xs font-bold focus:outline-none focus:border-[#58b347] cursor-pointer">
              <option value="" disabled>-- Wybierz z bazy --</option>
              <option v-for="part in store.parts" :key="part.id_sku || part.sku" :value="part.id_sku || part.sku">
                [{{ part.id_sku || part.sku }}] {{ part.name }}
              </option>
            </select>
          </div>
          <div class="col-span-12 sm:col-span-4">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Ilość *</label>
            <input type="number" v-model.number="form.quantity" required min="1" class="w-full px-3 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-sm font-bold text-center focus:outline-none focus:border-[#58b347]" />
          </div>
        </div>

        <!-- ZAKŁADKA: PRZESUNIĘCIE -->
        <div v-show="form.type === 'PRZESUNIĘCIE'" class="grid grid-cols-12 gap-5 animate-fadeIn">
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Skąd pobrać? *</label>
            <select v-model="form.from" :required="form.type === 'PRZESUNIĘCIE'" class="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold focus:outline-none focus:border-[#58b347]">
              <option v-for="loc in availableLocations" :key="loc.id" :value="loc.id" :disabled="loc.id === form.to">{{ loc.name }}</option>
            </select>
          </div>
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Dokąd wysłać? *</label>
            <select v-model="form.to" :required="form.type === 'PRZESUNIĘCIE'" class="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold focus:outline-none focus:border-[#58b347]">
              <option v-for="loc in availableLocations" :key="loc.id" :value="loc.id" :disabled="loc.id === form.from">{{ loc.name }}</option>
            </select>
          </div>
          
          <div class="col-span-12 sm:col-span-5">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Logistyka</label>
            <select v-model="form.shipping_type" class="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold focus:outline-none focus:border-[#58b347]">
              <option value="Odbiór osobisty">Odbiór osobisty</option>
              <option value="Wysyłka">Wysyłka (Kurier/Paczkomat)</option>
            </select>
          </div>
          <div v-if="form.shipping_type === 'Wysyłka'" class="col-span-12 sm:col-span-7">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Numer Przesyłki *</label>
            <input type="text" v-model="form.tracking_number" :required="form.shipping_type === 'Wysyłka' && form.type === 'PRZESUNIĘCIE'" placeholder="Np. InPost / DPD..." class="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold focus:outline-none focus:border-[#58b347]" />
          </div>
        </div>

        <!-- ZAKŁADKA: DOSTAWA -->
        <div v-show="form.type === 'DOSTAWA'" class="grid grid-cols-12 gap-5 animate-fadeIn">
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Źródło / Dostawca</label>
            <input type="text" v-model="form.source_supplier" placeholder="Np. Hurtownia elektryczna..." class="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold focus:outline-none focus:border-[#58b347]" />
          </div>
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Numer Faktury / WZ</label>
            <input type="text" v-model="form.invoice" placeholder="Opcjonalnie..." class="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold focus:outline-none focus:border-[#58b347]" />
          </div>
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Stan asortymentu</label>
            <select v-model="form.item_condition" class="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold focus:outline-none focus:border-[#58b347]">
              <option value="Nowe">Nowe / Fabryczne</option>
              <option value="Używane / Regenerowane">Używane / Regenerowane</option>
            </select>
          </div>
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Magazyn Docelowy *</label>
            <select v-model="form.to" :required="form.type === 'DOSTAWA'" class="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold focus:outline-none focus:border-[#58b347]">
              <option value="ZG">Centrala (Zielona Góra)</option>
              <option value="WA">Filia (Warszawa)</option>
            </select>
          </div>
        </div>

        <!-- ZAKŁADKA: ZUŻYCIE -->
        <div v-show="form.type === 'ZUŻYCIE'" class="grid grid-cols-12 gap-5 animate-fadeIn">
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Który technik melduje zużycie? *</label>
            <select v-model="form.technician_id" :required="form.type === 'ZUŻYCIE'" class="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold focus:outline-none focus:border-[#58b347]">
              <option value="" disabled>-- Wybierz --</option>
              <option v-for="t in store.techs" :key="t.id" :value="t.id">{{ t.name }}</option>
            </select>
          </div>
          <div class="col-span-12 sm:col-span-6">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Z jakiego zasobu pobrano? *</label>
            <select v-model="form.from" :required="form.type === 'ZUŻYCIE'" class="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold focus:outline-none focus:border-[#58b347]">
              <option v-for="loc in availableLocations" :key="loc.id" :value="loc.id">{{ loc.name }}</option>
            </select>
          </div>

          <!-- ELEGANCKA WYSZUKIWARKA ZLECEŃ -->
          <div class="col-span-12 sm:col-span-12 relative" ref="ticketDropdownRef">
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Powiązane zlecenie i wizyta *</label>
              <span v-if="allSuggestionsCount > 0" class="text-[9px] font-bold text-[#58b347]">
                Dostępnych zleceń: {{ allSuggestionsCount }}
              </span>
            </div>
            
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-slate-400 group-focus-within:text-[#58b347] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              
              <input 
                type="text" 
                v-model="form.ticket_number" 
                @focus="isDropdownOpen = true"
                @input="isDropdownOpen = true"
                :required="form.type === 'ZUŻYCIE'" 
                placeholder="Szukaj po nr zlecenia, QP lub kliencie..." 
                class="w-full pl-9 pr-10 py-3 border border-slate-200 bg-white rounded-xl text-sm font-bold focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/20 uppercase transition-all shadow-sm" 
              />
              
              <button 
                type="button" 
                @click.stop="isDropdownOpen = !isDropdownOpen" 
                class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#58b347] bg-slate-50 hover:bg-[#58b347]/10 p-1.5 rounded-lg transition-colors border border-slate-200/50"
              >
                <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': isDropdownOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>

            <!-- ROZWIJANA LISTA PODPOWIEDZI -->
            <div 
              v-show="isDropdownOpen" 
              class="absolute z-[3000] left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-2xl divide-y divide-slate-100 custom-scrollbar"
            >
              <template v-if="filteredSuggestions.length > 0">
                <div 
                  v-for="item in filteredSuggestions" 
                  :key="item.key"
                  @mousedown.prevent="selectTicket(item.value)"
                  class="p-3 hover:bg-[#58b347]/5 cursor-pointer flex items-center justify-between transition-colors group"
                >
                  <div class="flex flex-col">
                    <div class="flex items-center gap-2.5">
                      <span class="text-sm font-black text-slate-800 group-hover:text-[#499b3a]">{{ item.ticket_id }}</span>
                      <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#58b347]/10 text-[#499b3a] border border-[#58b347]/20 shadow-sm">
                        {{ item.visit_title }}
                      </span>
                      <span v-if="item.isAssignedTech" class="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded text-emerald-600 bg-white border border-emerald-200 shadow-sm">
                        Twój rejon
                      </span>
                    </div>
                    <div class="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                      <span v-if="item.qp" class="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">{{ item.qp }}</span>
                      <span v-if="item.qp && item.client" class="text-slate-300">•</span>
                      <span v-if="item.client" class="truncate max-w-[200px]">{{ item.client }}</span>
                      <span v-if="item.tech && !item.isAssignedTech" class="text-slate-300">•</span>
                      <span v-if="item.tech && !item.isAssignedTech" class="text-slate-400 italic">{{ item.tech }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- STAN PUSTY / BRAK WYNIKÓW -->
              <div v-else class="p-6 flex flex-col items-center justify-center text-center">
                <div class="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 mb-2">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <span class="text-xs font-bold text-slate-500">{{ allSuggestionsCount === 0 ? 'Brak otwartych zleceń w bazie.' : 'Nie znaleziono zlecenia.' }}</span>
                <span class="text-[10px] text-slate-400 mt-1">Możesz wpisać numer ręcznie w polu powyżej.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- WSPÓLNE: NOTATKA -->
        <div class="w-full pt-2">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Dodatkowe Notatki</label>
          <textarea v-model="form.notes" rows="2" placeholder="Opcjonalny komentarz do operacji..." class="w-full px-3 py-2 border border-slate-200 bg-white rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#58b347] resize-none"></textarea>
        </div>

        <!-- STOPKA Z PRZYCISKAMI -->
        <div class="flex gap-4 pt-3 border-t border-slate-200 mt-4">
          <button type="button" @click="closeModal" class="flex-1 border border-slate-200 bg-white text-slate-700 font-bold py-3.5 rounded-xl text-xs hover:bg-slate-50 transition-colors shadow-sm">
            Anuluj
          </button>
          <button type="submit" class="flex-1 text-white font-bold py-3.5 rounded-xl text-xs transition-colors shadow-sm bg-[#58b347] hover:bg-[#499b3a] shadow-[#58b347]/20">
            Zatwierdź operację
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useStorageStore } from '../stores/useStorageStore'

const props = defineProps({
  show: { type: Boolean, default: false },
  initialPartSku: { type: String, default: '' },
  initialType: { type: String, default: 'PRZESUNIĘCIE' },
  initialSource: { type: String, default: '' },
  initialDest: { type: String, default: '' },
  openTickets: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'save'])
const store = useStorageStore()

const defaultForm = () => ({
  type: props.initialType || 'PRZESUNIĘCIE',
  part_sku: props.initialPartSku || '',
  quantity: 1,
  from: props.initialSource || 'ZG',
  to: props.initialDest || 'WA',
  shipping_type: 'Odbiór osobisty',
  tracking_number: '',
  source_supplier: '',
  item_condition: 'Nowe',
  invoice: '',
  technician_id: '',
  ticket_number: '',
  notes: ''
})

const form = ref(defaultForm())
const isDropdownOpen = ref(false)
const ticketDropdownRef = ref(null)

const availableLocations = computed(() => {
  let locs = [
    { id: 'ZG', name: 'Magazyn Centralny (Zielona Góra)' },
    { id: 'WA', name: 'Filia (Warszawa)' }
  ];
  if (store.techs) {
    store.techs.forEach(t => {
      locs.push({ id: t.id, name: `Auto serwisowe: ${t.name}` })
    })
  }
  return locs;
})

// Przetwarzanie otwartych zleceń na podpowiedzi z numerami wizyt
const ticketSuggestions = computed(() => {
  const source = (props.openTickets && props.openTickets.length) ? props.openTickets : (store.openTickets || []);
  let list = [];

  const selectedTechObj = store.techs ? store.techs.find(t => t.id === form.value.technician_id) : null;
  const selectedTechName = selectedTechObj ? selectedTechObj.name.toLowerCase() : '';

  source.forEach(t => {
    const isAssigned = selectedTechName && t.tech && t.tech.toLowerCase().includes(selectedTechName);

    if (t.visits && t.visits.length > 0) {
      t.visits.forEach(v => {
        list.push({
          key: `${t.id}_V${v.visit_number}`,
          ticket_id: t.id,
          visit_title: `Wizyta ${v.visit_number}`,
          qp: t.qp,
          client: t.client,
          tech: v.tech || t.tech,
          date: v.date,
          isAssignedTech: isAssigned,
          value: `${t.id} (Wizyta ${v.visit_number})`
        });
      });

      const nextNum = t.visits.length + 1;
      list.push({
        key: `${t.id}_V${nextNum}_NEW`,
        ticket_id: t.id,
        visit_title: `Wizyta ${nextNum} (Nowa)`,
        qp: t.qp,
        client: t.client,
        tech: t.tech,
        date: '',
        isAssignedTech: isAssigned,
        value: `${t.id} (Wizyta ${nextNum})`
      });
    } else {
      list.push({
        key: `${t.id}_V1`,
        ticket_id: t.id,
        visit_title: 'Wizyta 1',
        qp: t.qp,
        client: t.client,
        tech: t.tech,
        date: '',
        isAssignedTech: isAssigned,
        value: `${t.id} (Wizyta 1)`
      });
    }
  });

  list.sort((a, b) => {
    if (a.isAssignedTech && !b.isAssignedTech) return -1;
    if (!a.isAssignedTech && b.isAssignedTech) return 1;
    return a.ticket_id.localeCompare(b.ticket_id);
  });

  return list;
})

const allSuggestionsCount = computed(() => ticketSuggestions.value.length)

const filteredSuggestions = computed(() => {
  const query = String(form.value.ticket_number || '').trim().toLowerCase();
  if (!query) return ticketSuggestions.value;
  return ticketSuggestions.value.filter(s => {
    return s.value.toLowerCase().includes(query) ||
           (s.qp && s.qp.toLowerCase().includes(query)) ||
           (s.client && s.client.toLowerCase().includes(query)) ||
           (s.tech && s.tech.toLowerCase().includes(query));
  });
})

const selectTicket = (val) => {
  form.value.ticket_number = val;
  isDropdownOpen.value = false;
}

const handleClickOutside = (e) => {
  if (ticketDropdownRef.value && !ticketDropdownRef.value.contains(e.target)) {
    isDropdownOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    form.value = defaultForm();
    isDropdownOpen.value = false;
    
    if (form.value.type === 'ZUŻYCIE' && form.value.from && form.value.from !== 'ZG' && form.value.from !== 'WA') {
      form.value.technician_id = form.value.from;
    }
  }
})

watch(() => form.value.technician_id, (newTech) => {
  if (form.value.type === 'ZUŻYCIE' && newTech) {
    form.value.from = newTech;
  }
})

const closeModal = () => {
  emit('close');
}

const handleSubmit = () => {
  emit('save', { ...form.value });
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.8); }
</style>