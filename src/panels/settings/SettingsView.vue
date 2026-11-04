<template>
  <div class="w-full h-full bg-[#f4f6f8] overflow-hidden flex flex-col">
    <!-- NAGŁÓWEK EKRANU (Taki jak w innych modułach, tylko mniejszy) -->
    <div class="px-8 py-6 shrink-0 border-b border-slate-200/60 bg-[#f4f6f8]">
      <h1 class="text-2xl font-black text-slate-800 tracking-tight">Ustawienia Systemu</h1>
      <p class="text-sm font-bold text-slate-500 mt-1">Personalizacja, powiadomienia i preferencje konta.</p>
    </div>

    <!-- GŁÓWNY KONTENER (Z podziałem na Sidebar i Zawartość) -->
    <div class="flex flex-1 overflow-hidden px-8 py-6 gap-8 max-w-7xl">
      
      <!-- LEWE MENU (Kategorie ustawień) -->
      <div class="w-64 shrink-0 flex flex-col gap-2">
        <button 
          v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-3 px-4 py-3.5 rounded-xl font-extrabold text-[12px] uppercase tracking-widest transition-all duration-200"
          :class="activeTab === tab.id ? 'bg-white text-[#58b347] shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-700 border border-transparent'"
        >
          <span v-html="tab.icon" class="w-5 h-5 shrink-0" :class="activeTab === tab.id ? 'text-[#58b347]' : 'text-slate-400'"></span>
          {{ tab.name }}
        </button>
      </div>

      <!-- PRAWA STRONA (Zawartość wybranej zakładki) -->
      <div class="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-y-auto custom-scrollbar relative">
        
        <!-- ============================================== -->
        <!-- ZAKŁADKA 1: WYGLĄD I UKŁAD -->
        <!-- ============================================== -->
        <div v-if="activeTab === 'appearance'" class="p-8 animate-fadeIn">
          <h2 class="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
            Motyw i Interfejs
          </h2>
          
          <div class="space-y-8 max-w-3xl">
            
            <!-- SEKCJA: MOTYW I KOLORY -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Motyw (Jasny/Ciemny) -->
              <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Główny Motyw</label>
                <div class="flex flex-col gap-2">
                  <label class="cursor-pointer">
                    <input type="radio" v-model="store.theme" value="auto" class="peer sr-only" @change="save" />
                    <div class="px-4 py-3 border-2 border-slate-200 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-50 text-sm font-bold text-slate-600 peer-checked:text-blue-700 transition-all flex items-center gap-3"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> Automatyczny (Systemowy)</div>
                  </label>
                  <label class="cursor-pointer">
                    <input type="radio" v-model="store.theme" value="light" class="peer sr-only" @change="save" />
                    <div class="px-4 py-3 border-2 border-slate-200 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-50 text-sm font-bold text-slate-600 peer-checked:text-blue-700 transition-all flex items-center gap-3"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> Jasny (Domyślny)</div>
                  </label>
                  <label class="cursor-pointer">
                    <input type="radio" v-model="store.theme" value="dark" class="peer sr-only" @change="save" />
                    <div class="px-4 py-3 border-2 border-slate-200 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-50 text-sm font-bold text-slate-600 peer-checked:text-blue-700 transition-all flex items-center gap-3"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> Ciemny</div>
                  </label>
                </div>
              </div>

              <!-- Kolor i Efekty -->
              <div class="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col gap-4">
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Kolor Wiodący (Akcent)</label>
                  <div class="flex items-center gap-3">
                    <input type="color" v-model="store.mainColor" @change="save" class="w-12 h-12 rounded cursor-pointer border-0 bg-transparent p-0" />
                    <div class="text-sm font-bold text-slate-600 uppercase">{{ store.mainColor }}</div>
                  </div>
                </div>
                <hr class="border-slate-200">
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Efekt Akcentu</label>
                  <select v-model="store.colorEffect" @change="save" class="w-full h-10 px-3 rounded-lg border border-slate-300 font-bold text-slate-700 bg-white outline-none focus:border-blue-500">
                    <option value="none">Brak (Statyczny)</option>
                    <option value="pulse">Pulsowanie</option>
                    <option value="breathe">Oddychanie (Smooth)</option>
                    <option value="rgb">Tęcza (RGB Gaming)</option>
                  </select>
                </div>
              </div>
            </div>

            <hr class="border-slate-100">

            <!-- SEKCJA: UKŁADY MODUŁÓW -->
            <div>
              <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Wersje widoków modułów</h3>
              
              <!-- Magazyn -->
              <div class="mb-5">
                <label class="block text-sm font-bold text-slate-700 mb-2">Moduł: Magazyn i Flota</label>
                <div class="flex gap-4">
                  <label class="cursor-pointer flex-1">
                    <input type="radio" v-model="store.warehouseViewMode" value="v1" class="peer sr-only" @change="save" />
                    <div class="p-4 border-2 border-slate-200 rounded-xl peer-checked:border-[#58b347] peer-checked:bg-[#58b347]/5 transition-all text-center">
                      <div class="font-black text-slate-700 peer-checked:text-[#499b3a]">Wersja 1 (Aktualna)</div>
                      <div class="text-xs text-slate-500 mt-1 font-medium">Klasyczna tabela i logi operacji</div>
                    </div>
                  </label>
                  <label class="cursor-pointer flex-1">
                    <input type="radio" v-model="store.warehouseViewMode" value="v2" class="peer sr-only" @change="save" />
                    <div class="p-4 border-2 border-slate-200 rounded-xl peer-checked:border-[#58b347] peer-checked:bg-[#58b347]/5 transition-all text-center">
                      <div class="font-black text-slate-700 peer-checked:text-[#499b3a]">Wersja 2 (Alternatywna)</div>
                      <div class="text-xs text-slate-500 mt-1 font-medium">Widok kafelkowy i zaawansowane analizy</div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Centrum Zgłoszeń -->
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Moduł: Centrum Zgłoszeń (Axon Connect)</label>
                <div class="flex gap-4">
                  <label class="cursor-pointer flex-1">
                    <input type="radio" v-model="store.ticketsViewMode" value="v1" class="peer sr-only" @change="save" />
                    <div class="p-4 border-2 border-slate-200 rounded-xl peer-checked:border-[#58b347] peer-checked:bg-[#58b347]/5 transition-all text-center">
                      <div class="font-black text-slate-700 peer-checked:text-[#499b3a]">Wersja 1 (Aktualna)</div>
                      <div class="text-xs text-slate-500 mt-1 font-medium">Kompaktowa lista i szybkie filtry</div>
                    </div>
                  </label>
                  <label class="cursor-pointer flex-1">
                    <input type="radio" v-model="store.ticketsViewMode" value="v2" class="peer sr-only" @change="save" />
                    <div class="p-4 border-2 border-slate-200 rounded-xl peer-checked:border-[#58b347] peer-checked:bg-[#58b347]/5 transition-all text-center">
                      <div class="font-black text-slate-700 peer-checked:text-[#499b3a]">Wersja 2 (Alternatywna)</div>
                      <div class="text-xs text-slate-500 mt-1 font-medium">Tablica Kanban i rozbudowane karty</div>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- ZAKŁADKA 2: NAWIGACJA (Sidebar) -->
        <!-- ============================================== -->
        <div v-else-if="activeTab === 'navigation'" class="p-8 animate-fadeIn">
          <h2 class="text-lg font-black text-slate-800 mb-6">Nawigacja i Menu główne</h2>
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p class="text-sm font-bold text-slate-600 mb-4">Ustaw stronę startową po zalogowaniu:</p>
            <select v-model="store.defaultPage" @change="save" class="w-full max-w-sm h-[42px] px-4 rounded-lg border border-slate-300 font-bold text-slate-700">
              <option value="dashboard">Dashboard (Statystyki)</option>
              <option value="schedule">Kalendarz / Harmonogram</option>
              <option value="tickets">Centrum Zgłoszeń</option>
            </select>
          </div>
          <!-- Tutaj w przyszłości dodasz drag&drop do układania sidebaru -->
        </div>

        <!-- ============================================== -->
        <!-- ZAKŁADKA 3: POWIADOMIENIA -->
        <!-- ============================================== -->
        <div v-else-if="activeTab === 'notifications'" class="p-8 animate-fadeIn">
          <h2 class="text-lg font-black text-slate-800 mb-6">Powiadomienia i Dźwięki</h2>
          <div class="space-y-4">
            <label class="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              <div>
                <div class="font-bold text-slate-800">Dźwięk nowego zgłoszenia</div>
                <div class="text-xs text-slate-500 mt-1">Odtwarzaj krótki sygnał dźwiękowy (Ping), gdy wpadnie nowe zgłoszenie z Axon Connect.</div>
              </div>
              <div class="relative inline-flex items-center">
                <input type="checkbox" v-model="store.soundEnabled" @change="save" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#58b347]"></div>
              </div>
            </label>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- ZAKŁADKA 4: KONTO I BEZPIECZEŃSTWO -->
        <!-- ============================================== -->
        <div v-else-if="activeTab === 'account'" class="p-8 animate-fadeIn">
          <h2 class="text-lg font-black text-slate-800 mb-6">Konto i Bezpieczeństwo</h2>
          <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200 max-w-md">
            <h3 class="font-extrabold text-slate-700 mb-4 uppercase tracking-widest text-[11px]">Zmiana hasła</h3>
            <div class="space-y-3">
              <input type="password" placeholder="Obecne hasło" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 outline-none" />
              <input type="password" placeholder="Nowe hasło" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 outline-none" />
              <input type="password" placeholder="Powtórz nowe hasło" class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 outline-none" />
              <button class="w-full bg-blue-500 text-white font-bold py-2.5 rounded-lg mt-2 hover:bg-blue-600 transition-colors">Zmień hasło</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '../../stores/useSettingsStore'

const store = useSettingsStore()

// Automatyczny zapis ustawień przy każdej zmianie
const save = () => {
  store.saveSettings()
}

onMounted(() => {
  store.loadSettings()
})

// Zakładki pionowego menu
const activeTab = ref('appearance')

const tabs = [
  { 
    id: 'appearance', 
    name: 'Wygląd i Układ', 
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>' 
  },
  { 
    id: 'navigation', 
    name: 'Nawigacja', 
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' 
  },
  { 
    id: 'notifications', 
    name: 'Powiadomienia', 
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' 
  },
  { 
    id: 'account', 
    name: 'Bezpieczeństwo', 
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' 
  }
]
</script>

<style scoped>
.animate-fadeIn { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.6); }
</style>