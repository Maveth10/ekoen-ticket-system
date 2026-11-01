<template>
  <div v-if="show" class="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn" @click.self="closeModal">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-visible border border-slate-200 animate-slideUp">
      
      <!-- NAGŁÓWEK -->
      <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
        <h3 class="text-sm font-extrabold text-slate-800 uppercase tracking-widest">
          {{ isEditing ? 'Edycja kartoteki' : 'Nowy asortyment / Pojazd' }}
        </h3>
        <button @click="closeModal" class="text-slate-400 hover:text-slate-700 transition-colors p-1">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- CIAŁO FORMULARZA -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 bg-slate-50/30 max-h-[75vh] overflow-y-auto custom-scrollbar rounded-b-2xl">
        
        <div class="grid grid-cols-12 gap-5">
          <!-- Wiersz 1: Kategoria, SKU, Nazwa -->
          
          <!-- CUSTOM DROPDOWN: KATEGORIA -->
          <div class="col-span-12 sm:col-span-4 flex flex-col justify-end relative" ref="categoryDropdownRef">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Kategoria asortymentu</label>
            <div 
              @click="isCategoryDropdownOpen = !isCategoryDropdownOpen"
              class="w-full px-4 py-2.5 border bg-white rounded-xl text-[13px] font-bold text-[#58b347] transition-all shadow-sm cursor-pointer flex justify-between items-center select-none"
              :class="isCategoryDropdownOpen ? 'border-[#58b347] ring-1 ring-[#58b347]/30' : 'border-slate-200 hover:border-slate-300'"
            >
              <span>{{ form.category }}</span>
              <svg class="w-4 h-4 text-[#58b347] transition-transform duration-200" :class="{ 'rotate-180': isCategoryDropdownOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            
            <div 
              v-show="isCategoryDropdownOpen" 
              class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100"
            >
              <div 
                v-for="cat in ['Części zamienne', 'Pojazdy', 'Materiały eksploatacyjne', 'Narzędzia', 'Materiały biurowe', 'Inne']" 
                :key="cat"
                @click="selectCategory(cat)"
                class="px-4 py-3 text-[13px] font-bold cursor-pointer transition-colors"
                :class="form.category === cat ? 'bg-[#58b347]/10 text-[#58b347]' : 'text-slate-600 hover:bg-slate-50'"
              >
                {{ cat }}
              </div>
            </div>
          </div>

          <!-- SKU / INDEX -->
          <div class="col-span-12 sm:col-span-3 flex flex-col justify-end">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">SKU / Index *</label>
            <input 
              v-model="form.sku" 
              required 
              @input="form.sku = form.sku.toUpperCase()"
              class="w-full h-[42px] px-4 border border-slate-200 bg-white rounded-xl text-[13px] font-mono font-bold uppercase focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm" 
            />
          </div>
          
          <!-- NAZWA / MODEL -->
          <div class="col-span-12 sm:col-span-5 flex flex-col justify-end">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Nazwa / Model *</label>
            <input 
              v-model="form.name" 
              required 
              class="w-full h-[42px] px-4 border border-slate-200 bg-white rounded-xl text-[13px] font-bold text-slate-800 focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm" 
            />
          </div>

          <!-- Wiersz 2 (Opcjonalny - Pojazdy / Narzędzia) -->
          <div v-if="form.category === 'Pojazdy' || form.category === 'Narzędzia'" class="col-span-12 grid grid-cols-12 gap-5 p-5 bg-slate-50 border border-slate-100 rounded-xl shadow-inner animate-fadeIn mt-2">
            
            <div :class="form.category === 'Pojazdy' ? 'col-span-12 sm:col-span-3' : 'col-span-12 sm:col-span-4'">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                {{ form.category === 'Pojazdy' ? 'Nr Rejestracyjny' : 'Nr seryjny (S/N)' }}
              </label>
              <input 
                v-model="dynamicIdentifier" 
                @input="dynamicIdentifier = $event.target.value.toUpperCase()"
                placeholder="OPCJONALNIE..." 
                class="w-full h-[42px] px-4 border border-slate-200 bg-white rounded-xl text-[13px] font-mono font-bold uppercase focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm placeholder-slate-300" 
              />
            </div>

            <div v-if="form.category === 'Pojazdy'" class="col-span-12 sm:col-span-3 relative" ref="vehicleDropdownRef">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Typ nadwozia</label>
              <div 
                @click="isVehicleDropdownOpen = !isVehicleDropdownOpen"
                class="w-full h-[42px] px-4 border border-slate-200 bg-white rounded-xl text-[13px] font-bold text-slate-800 transition-all shadow-sm cursor-pointer flex justify-between items-center select-none hover:border-slate-300"
              >
                <span>{{ form.vehicle_type }}</span>
                <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div v-show="isVehicleDropdownOpen" class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                <div v-for="vt in ['Van / Bus', 'Osobowy', 'Kombi', 'Podnośnik koszowy', 'Inne']" :key="vt" @click="selectVehicleType(vt)" class="px-4 py-3 text-[13px] font-bold cursor-pointer text-slate-600 hover:bg-slate-50">
                  {{ vt }}
                </div>
              </div>
            </div>

            <div :class="form.category === 'Pojazdy' ? 'col-span-12 sm:col-span-2' : 'col-span-12 sm:col-span-4'">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Status</label>
              <select v-model="form.service_status" class="w-full h-[42px] px-3 border border-slate-200 bg-white rounded-xl text-[13px] font-bold text-slate-800 focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm cursor-pointer">
                <option value="Sprawny">Sprawny</option>
                <option value="W serwisie">W serwisie</option>
                <option value="Uszkodzony">Uszkodzony</option>
              </select>
            </div>

            <div :class="form.category === 'Pojazdy' ? 'col-span-12 sm:col-span-2' : 'col-span-12 sm:col-span-4'">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                {{ form.category === 'Pojazdy' ? 'Data Przeglądu' : 'Kalibracja' }}
              </label>
              <input type="date" v-model="form.inspection_date" class="w-full h-[42px] px-3 border border-slate-200 bg-white rounded-xl text-[11px] font-bold text-slate-800 focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm" />
            </div>

            <div v-if="form.category === 'Pojazdy'" class="col-span-12 sm:col-span-2">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Polisa OC/AC</label>
              <input type="date" v-model="form.insurance_date" class="w-full h-[42px] px-3 border border-slate-200 bg-white rounded-xl text-[11px] font-bold text-slate-800 focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm" />
            </div>

          </div>

          <!-- Wiersz 3: J.M, Magazyn, Uwagi -->
          
          <!-- CUSTOM DROPDOWN: J.M. -->
          <div class="col-span-12 sm:col-span-2 flex flex-col justify-end relative" ref="unitDropdownRef">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">J.M.</label>
            <div 
              @click="!isVehicleCategory ? isUnitDropdownOpen = !isUnitDropdownOpen : null"
              class="w-full h-[42px] px-4 border bg-white rounded-xl text-[13px] font-bold transition-all shadow-sm flex justify-between items-center select-none"
              :class="[
                isUnitDropdownOpen ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200',
                isVehicleCategory ? 'bg-slate-50 text-slate-400 opacity-70 cursor-not-allowed' : 'text-slate-800 cursor-pointer hover:border-slate-300'
              ]"
            >
              <span>{{ form.unit }}</span>
              <svg v-if="!isVehicleCategory" class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            
            <div 
              v-show="isUnitDropdownOpen && !isVehicleCategory" 
              class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100"
            >
              <div 
                v-for="u in ['szt.', 'mb', 'kpl.']" 
                :key="u"
                @click="selectUnit(u)"
                class="px-4 py-3 text-[13px] font-bold cursor-pointer transition-colors"
                :class="form.unit === u ? 'bg-slate-100 text-slate-800' : 'text-slate-600 hover:bg-slate-50'"
              >
                {{ u }}
              </div>
            </div>
          </div>

          <!-- MAGAZYN ZG / WA -->
          <div class="col-span-12 sm:col-span-3 flex flex-col justify-end">
            <div class="flex justify-between items-center mb-1.5 pr-1">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Magazyn</label>
              <!-- Zoptymalizowany, wyrównany przełącznik -->
              <div class="flex bg-slate-100 rounded p-0.5 border border-slate-200/80 shadow-inner">
                <button 
                  type="button" 
                  @click="activeWarehouse = 'ZG'" 
                  :class="activeWarehouse === 'ZG' ? 'bg-white shadow-sm text-[#58b347]' : 'text-slate-400 hover:text-slate-600'" 
                  class="px-2 py-0.5 rounded-sm text-[9px] font-extrabold transition-all"
                >ZG</button>
                <button 
                  type="button" 
                  @click="activeWarehouse = 'WA'" 
                  :class="activeWarehouse === 'WA' ? 'bg-white shadow-sm text-[#58b347]' : 'text-slate-400 hover:text-slate-600'" 
                  class="px-2 py-0.5 rounded-sm text-[9px] font-extrabold transition-all"
                >WA</button>
              </div>
            </div>
            
            <div class="relative">
              <input 
                v-if="activeWarehouse === 'ZG'"
                type="number" 
                v-model.number="form.zg_stock"
                :disabled="isUniqueItem"
                :min="isUniqueItem ? 1 : 0"
                :max="isUniqueItem ? 1 : null"
                required
                class="w-full h-[42px] px-4 border border-slate-200 bg-white rounded-xl text-[14px] font-black focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm text-center"
                :class="isUniqueItem ? 'text-slate-400 opacity-60 cursor-not-allowed bg-slate-50' : 'text-slate-900'"
              />
              <input 
                v-else
                type="number" 
                v-model.number="form.warsaw_stock"
                :disabled="isUniqueItem"
                :min="isUniqueItem ? 1 : 0"
                :max="isUniqueItem ? 1 : null"
                required
                class="w-full h-[42px] px-4 border border-slate-200 bg-white rounded-xl text-[14px] font-black focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm text-center"
                :class="isUniqueItem ? 'text-slate-400 opacity-60 cursor-not-allowed bg-slate-50' : 'text-slate-900'"
              />
              <div v-if="isUniqueItem" class="absolute top-1/2 left-3 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-400 animate-pulse" title="Blokada na 1 szt. ze względu na unikalny numer"></div>
            </div>
          </div>

          <!-- UWAGI / NOTATKI -->
          <div class="col-span-12 sm:col-span-7 flex flex-col justify-end">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Uwagi / Notatki</label>
            <input 
              type="text"
              v-model="form.notes"
              placeholder="Opcjonalne informacje o sprzęcie..."
              class="w-full h-[42px] px-4 border border-slate-200 bg-white rounded-xl text-[13px] font-medium text-slate-700 focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm" 
            />
          </div>

        </div>
        
        <!-- STOPKA Z PRZYCISKAMI -->
        <div class="flex gap-4 pt-4 border-t border-slate-200 mt-5">
          <button type="button" @click="closeModal" class="flex-1 border border-slate-200 bg-white text-slate-700 font-bold py-3.5 rounded-xl text-[13px] hover:bg-slate-50 transition-colors shadow-sm">
            Anuluj
          </button>
          <button type="submit" class="flex-1 bg-[#58b347] text-white font-bold py-3.5 rounded-xl text-[13px] hover:bg-[#499b3a] transition-colors shadow-sm shadow-[#58b347]/20">
            Zapisz pozycję
          </button>
        </div>
        
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  isEditing: { type: Boolean, default: false },
  initialData: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])

const activeWarehouse = ref('ZG')

const defaultForm = () => ({
  sku: '',
  name: '',
  category: 'Części zamienne',
  unit: 'szt.',
  zg_stock: 0,
  warsaw_stock: 0,
  min_stock: 3,
  serial_number: '',
  vehicle_plate: '',
  vehicle_type: 'Osobowy',
  service_status: 'Sprawny',
  inspection_date: '',
  insurance_date: '',
  notes: '',
  is_muted: false,
  mobile_muted: false
})

const form = ref(defaultForm())

// Custom Dropdowns State
const isCategoryDropdownOpen = ref(false)
const categoryDropdownRef = ref(null)

const isUnitDropdownOpen = ref(false)
const unitDropdownRef = ref(null)

const isVehicleDropdownOpen = ref(false)
const vehicleDropdownRef = ref(null)

// Computed helpers
const isVehicleCategory = computed(() => form.value.category === 'Pojazdy')

const dynamicIdentifier = computed({
  get() {
    return form.value.category === 'Pojazdy' ? form.value.vehicle_plate : form.value.serial_number;
  },
  set(val) {
    if (form.value.category === 'Pojazdy') {
      form.value.vehicle_plate = val;
      form.value.serial_number = '';
    } else {
      form.value.serial_number = val;
      form.value.vehicle_plate = '';
    }
  }
})

const isUniqueItem = computed(() => {
  const cat = form.value.category;
  const val = dynamicIdentifier.value;
  return (cat === 'Pojazdy' || cat === 'Narzędzia') && val && String(val).trim().length > 0;
})

// Methods for custom dropdowns
const selectCategory = (cat) => {
  form.value.category = cat;
  isCategoryDropdownOpen.value = false;
}

const selectUnit = (u) => {
  form.value.unit = u;
  isUnitDropdownOpen.value = false;
}

const selectVehicleType = (vt) => {
  form.value.vehicle_type = vt;
  isVehicleDropdownOpen.value = false;
}

// Click outside logic
const handleClickOutside = (e) => {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(e.target)) {
    isCategoryDropdownOpen.value = false;
  }
  if (unitDropdownRef.value && !unitDropdownRef.value.contains(e.target)) {
    isUnitDropdownOpen.value = false;
  }
  if (vehicleDropdownRef.value && !vehicleDropdownRef.value.contains(e.target)) {
    isVehicleDropdownOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
})

// Watchers
watch(isUniqueItem, (newVal) => {
  if (newVal) {
    if (activeWarehouse.value === 'ZG') {
      form.value.zg_stock = 1;
      form.value.warsaw_stock = 0;
    } else {
      form.value.warsaw_stock = 1;
      form.value.zg_stock = 0;
    }
  }
})

watch(activeWarehouse, (newVal) => {
  if (isUniqueItem.value) {
    if (newVal === 'ZG') {
      form.value.zg_stock = 1;
      form.value.warsaw_stock = 0;
    } else {
      form.value.warsaw_stock = 1;
      form.value.zg_stock = 0;
    }
  }
})

watch(() => form.value.category, (newCat) => {
  if (newCat === 'Pojazdy') {
    form.value.unit = 'szt.';
    if (!form.value.service_status) form.value.service_status = 'Sprawny';
  } else if (newCat === 'Narzędzia') {
    if (!form.value.service_status) form.value.service_status = 'Sprawny';
  }
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    isCategoryDropdownOpen.value = false;
    isUnitDropdownOpen.value = false;
    isVehicleDropdownOpen.value = false;
    
    if (props.isEditing && props.initialData) {
      form.value = { ...defaultForm(), ...props.initialData }
      if (form.value.warsaw_stock > 0 && form.value.zg_stock === 0) {
        activeWarehouse.value = 'WA'
      } else {
        activeWarehouse.value = 'ZG'
      }
    } else {
      form.value = defaultForm()
      activeWarehouse.value = 'ZG'
    }
  }
})

const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  const payload = { ...form.value }
  
  if (!['Pojazdy', 'Narzędzia'].includes(payload.category)) {
    payload.inspection_date = '';
    payload.insurance_date = '';
    payload.service_status = '';
    payload.vehicle_type = '';
    payload.vehicle_plate = '';
    payload.serial_number = '';
  } else if (payload.category === 'Narzędzia') {
    payload.insurance_date = '';
    payload.vehicle_type = '';
    payload.vehicle_plate = '';
  } else if (payload.category === 'Pojazdy') {
    payload.serial_number = '';
    payload.unit = 'szt.';
  }

  if ((payload.category === 'Pojazdy' && payload.vehicle_plate) || (payload.category === 'Narzędzia' && payload.serial_number)) {
    if (activeWarehouse.value === 'ZG') {
      payload.zg_stock = 1;
      payload.warsaw_stock = 0;
    } else {
      payload.warsaw_stock = 1;
      payload.zg_stock = 0;
    }
  }

  if (!payload.id_sku && payload.sku) payload.id_sku = payload.sku;

  emit('save', payload)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.8); }
</style>