<template>
  <div v-if="isOpen" class="fixed inset-0 z-[10000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans select-none cursor-pointer" @click="close">
    <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/60 flex flex-col max-h-[90vh] animate-fadeIn cursor-default" @click.stop>
      
      <div class="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
        <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-800">
          {{ isEdit ? 'Edycja parametrów stacji' : 'Rejestracja nowego punktu w sieci' }}
        </h3>
        <button @click="close" class="text-slate-400 hover:text-slate-600 transition-colors font-bold text-base">✕</button>
      </div>

      <div class="overflow-y-auto p-6 flex-1 custom-scrollbar">
        <form id="mas-station-form" @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2 sm:col-span-1">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Identyfikator stacji *</label>
              <input required v-model="form.public_id" type="text" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 outline-none transition-all shadow-sm" placeholder="np. PL-0043" />
            </div>
            <div class="col-span-2 sm:col-span-1">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Klient / Partner</label>
              <input v-model="form.client_id" type="text" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 outline-none transition-all shadow-sm" placeholder="np. InPost" />
            </div>
            <div class="col-span-2 sm:col-span-1">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Model ładowarki</label>
              <input v-model="form.model" type="text" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 outline-none transition-all shadow-sm" placeholder="np. Alpitronic HYC300" />
            </div>
            <div class="col-span-2 sm:col-span-1">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Data przeglądu UDT</label>
              <input v-model="form.inspection_date" type="date" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 outline-none transition-all shadow-sm text-slate-700" />
            </div>
          </div>

          <hr class="border-slate-100" />

          <div>
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">Geolokalizacja</h4>
            <div class="grid grid-cols-6 gap-4">
              <div class="col-span-6 sm:col-span-3">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Szerokość geogr. (LAT)</label>
                <input v-model="form.gps_lat" type="text" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#58b347] outline-none shadow-sm text-slate-800" placeholder="np. 52.2296756" />
              </div>
              <div class="col-span-6 sm:col-span-3">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Długość geogr. (LNG)</label>
                <input v-model="form.gps_lng" type="text" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#58b347] outline-none shadow-sm text-slate-800" placeholder="np. 21.0122287" />
              </div>
              
              <div class="col-span-6 sm:col-span-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Kraj</label>
                <input v-model="form.country" type="text" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#58b347] outline-none shadow-sm" />
              </div>
              <div class="col-span-6 sm:col-span-4">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Miasto *</label>
                <input required v-model="form.city" type="text" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#58b347] outline-none shadow-sm" placeholder="np. Warszawa" />
              </div>
              
              <div class="col-span-6 sm:col-span-4">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Ulica</label>
                <input v-model="form.street" type="text" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#58b347] outline-none shadow-sm" placeholder="np. Towarowa" />
              </div>
              <div class="col-span-6 sm:col-span-2">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Numer</label>
                <input v-model="form.street_number" type="text" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#58b347] outline-none shadow-sm" placeholder="np. 22A" />
              </div>
              <div class="col-span-6">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Dodatkowe info logistyczne</label>
                <input v-model="form.additional_info" type="text" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:border-[#58b347] outline-none shadow-sm" placeholder="np. wjazd od tyłu, szlaban kod 123" />
              </div>
            </div>
          </div>

          <hr class="border-slate-100" />

          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2 sm:col-span-1 relative" v-click-outside="() => activeDropdown = null">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Opiekunowie / Technicy</label>
              <div @click="activeDropdown = activeDropdown === 'tech' ? null : 'tech'" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold flex items-center justify-between cursor-pointer bg-white shadow-sm min-h-[42px]">
                <span :class="form.selectedTechs.length ? 'text-slate-800' : 'text-slate-400'" class="truncate">{{ form.selectedTechs.length ? form.selectedTechs.join(', ') : 'Wybierz opiekunów...' }}</span>
                <svg class="w-4 h-4 text-slate-500 shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div v-show="activeDropdown === 'tech'" class="absolute left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl z-50 p-2 max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                <div v-for="tech in store.techs" :key="tech.id" @click="toggleSelection('selectedTechs', tech.name)" class="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <div class="w-4 h-4 rounded border flex items-center justify-center" :class="form.selectedTechs.includes(tech.name) ? 'bg-[#58b347] border-[#58b347]' : 'border-slate-300 bg-white'">
                    <svg v-if="form.selectedTechs.includes(tech.name)" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span class="text-xs font-bold text-slate-700">{{ tech.name }}</span>
                </div>
              </div>
            </div>

            <div class="col-span-2 sm:col-span-1 relative" v-click-outside="() => activeDropdown = null">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Strefy / Regiony</label>
              <div @click="activeDropdown = activeDropdown === 'region' ? null : 'region'" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold flex items-center justify-between cursor-pointer bg-white shadow-sm min-h-[42px]">
                <span :class="form.selectedRegions.length ? 'text-slate-800' : 'text-slate-400'" class="truncate">{{ form.selectedRegions.length ? form.selectedRegions.join(', ') : 'Wybierz regiony...' }}</span>
                <svg class="w-4 h-4 text-slate-500 shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div v-show="activeDropdown === 'region'" class="absolute left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl z-50 p-2 max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                <div v-for="reg in availableRegions" :key="reg" @click="toggleSelection('selectedRegions', reg)" class="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                  <div class="w-4 h-4 rounded border flex items-center justify-center" :class="form.selectedRegions.includes(reg) ? 'bg-[#58b347] border-[#58b347]' : 'border-slate-300 bg-white'">
                    <svg v-if="form.selectedRegions.includes(reg)" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span class="text-xs font-bold text-slate-700">{{ reg }}</span>
                </div>
              </div>
            </div>

            <div class="col-span-2 sm:col-span-1">
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Zadanie / Status *</label>
              <select v-model="form.status" class="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:border-[#58b347] outline-none shadow-sm cursor-pointer text-slate-800 bg-white">
                <option value="Działa">Działa (OK)</option>
                <option value="Uruchomienie">Uruchomienie</option>
                <option value="Przegląd">Przegląd</option>
                <option value="Awaria">Awaria</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      <div class="p-6 border-t border-slate-200 bg-slate-50/80 shrink-0 flex items-center justify-between gap-3">
        <button type="submit" form="mas-station-form" :disabled="isSubmitting" class="flex-1 bg-[#58b347] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#499b3a] transition-all disabled:bg-slate-300 shadow-sm uppercase tracking-wider">
          {{ isSubmitting ? 'Zapisywanie...' : (isEdit ? 'Zatwierdź modyfikacje' : 'Zarejestruj stację') }}
        </button>
        
        <button v-if="isEdit" type="button" @click="handleDelete" :disabled="isSubmitting" class="bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-12 h-[44px] rounded-xl flex items-center justify-center shrink-0 shadow-sm group relative">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useMapStore } from '../stores/useMapStore' // Dopasuj ścieżkę

const store = useMapStore()
const isOpen = ref(false)
const isEdit = ref(false)
const isSubmitting = ref(false)
const activeDropdown = ref(null)

const availableRegions = ["POLSKA", "MAŁOPOLSKA", "MAZOWIECKIE", "ŚLĄSKIE", "WIELKOPOLSKIE", "DOLNOŚLĄSKIE", "POMORSKIE", "SŁOWACJA"]

const form = reactive({
  id: '', public_id: '', client_id: '', model: '', inspection_date: '',
  gps_lat: '', gps_lng: '', country: 'Polska', city: '', street: '',
  street_number: '', additional_info: '', status: 'Działa',
  selectedTechs: [], selectedRegions: []
})

function open(editMode = false, lat = '', lng = '', stationData = null) {
  isEdit.value = editMode
  Object.keys(form).forEach(k => form[k] = '') // Reset
  form.country = 'Polska'
  form.status = 'Działa'
  form.selectedTechs = []
  form.selectedRegions = []

  if (lat && lng) { form.gps_lat = lat; form.gps_lng = lng; }

  if (editMode && stationData) {
    form.id = stationData.id || ''
    form.public_id = stationData.public_id || stationData.name || ''
    form.client_id = stationData.client_id || stationData.client || ''
    form.model = stationData.model || ''
    form.inspection_date = stationData.inspection_date || ''
    form.country = stationData.country || 'Polska'
    form.city = stationData.city || ''
    form.street = stationData.street || ''
    form.street_number = stationData.street_number || ''
    form.additional_info = stationData.additional_info || stationData.logistics_info || ''
    form.status = stationData.status || 'Działa'
    form.gps_lat = stationData.gps_lat || lat || ''
    form.gps_lng = stationData.gps_lng || lng || ''
    
    if (stationData.technician_id) form.selectedTechs = stationData.technician_id.split(',').map(s => s.trim()).filter(Boolean)
    if (stationData.geo_region) form.selectedRegions = stationData.geo_region.split(',').map(s => s.trim()).filter(Boolean)
  }
  
  isOpen.value = true
}

function close() {
  isOpen.value = false
  activeDropdown.value = null
}

function toggleSelection(listName, val) {
  const list = form[listName]
  const idx = list.indexOf(val)
  if (idx > -1) list.splice(idx, 1)
  else list.push(val)
}

async function handleSubmit() {
  isSubmitting.value = true
  
  if ((!form.gps_lat || !form.gps_lng) && form.city) {
    try {
      const q = [form.street, form.street_number, form.city, form.country].filter(Boolean).join(', ')
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (data && data.length > 0) {
        form.gps_lat = data[0].lat
        form.gps_lng = data[0].lon
      } else {
        alert("Nie udało się odnaleźć współrzędnych GPS dla podanego adresu.")
        isSubmitting.value = false
        return
      }
    } catch (err) { console.warn("Błąd geokodowania", err) }
  }

  const payload = {
    ...form,
    id: form.id || `STAT-${Date.now()}`,
    technician_id: form.selectedTechs.join(', '),
    geo_region: form.selectedRegions.join(', ')
  }

  if (typeof google !== 'undefined' && google.script) {
    google.script.run
      .withSuccessHandler(() => {
        store.fetchMapData(true)
        close()
        isSubmitting.value = false
      })
      .withFailureHandler((err) => { alert("Błąd: " + err.message); isSubmitting.value = false })
      .saveStationToBase(payload)
  }
}

function handleDelete() {
  if (!confirm("Czy na pewno chcesz usunąć stację?")) return
  isSubmitting.value = true
  if (typeof google !== 'undefined' && google.script) {
    google.script.run
      .withSuccessHandler(() => {
        store.fetchMapData(true)
        close()
        isSubmitting.value = false
      })
      .withFailureHandler((err) => { alert("Błąd usuwania: " + err.message); isSubmitting.value = false })
      .deleteStationsBulk([form.id])
  }
}

defineExpose({ open, close })
</script>