<template>
  <div id="app-root" class="bg-[#f4f6f8] text-slate-800 font-sans h-screen w-screen overflow-hidden flex flex-row relative">
    
    <!-- ========================================== -->
    <!-- EKRAN WYBORU DOSTĘPU                     -->
    <!-- ========================================== -->
    <div v-if="!isAuthenticated" class="fixed inset-0 z-[999999] bg-slate-50 flex flex-col items-center justify-center font-sans p-4">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#58b347]/20 to-transparent blur-3xl opacity-50"></div>
        <div class="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-blue-500/10 to-transparent blur-3xl opacity-50"></div>
      </div>

      <div class="bg-white w-full max-w-md p-8 md:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 relative z-10 animate-fadeIn">
        <div class="flex justify-center mb-8">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 shrink-0 rounded-full flex items-center justify-center bg-[#58b347]/10">
              <svg viewBox="0 0 200 200" class="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 10C149.706 10 190 50.2944 190 100C190 149.706 149.706 190 100 190C50.2944 190 10 149.706 10 100C10 50.2944 50.2944 10 100 10Z" stroke="#58b347" stroke-width="12" />
                <g><circle cx="100" cy="100" r="70" fill="#58b347" /><path d="M85 70H135V85H85V70ZM65 92.5H115V107.5H65V92.5ZM85 115H135V130H85V115Z" fill="white" /></g>
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="font-black text-slate-800 tracking-tighter text-2xl leading-none">EKO<span class="text-[#58b347]">EN</span></span>
              <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">Field Service</span>
            </div>
          </div>
        </div>

        <div class="text-center mb-8">
          <h2 class="text-xl font-black text-slate-800 tracking-tight">Witaj w systemie</h2>
          <p class="text-xs text-slate-500 font-medium mt-1.5">Zaloguj się, aby uzyskać dostęp do panelu</p>
        </div>

        <form @submit.prevent="handleFormLogin" class="flex flex-col gap-5">
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Adres E-mail / Login</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <input type="text" v-model="formEmail" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#58b347]" placeholder="nazwa@firma.pl" required>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Hasło</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <input :type="showPassword ? 'text' : 'password'" v-model="formPassword" class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#58b347]" placeholder="••••••••" required>
              <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
              </button>
            </div>
          </div>

          <div v-if="authError" class="bg-red-50 text-red-500 text-[11px] font-bold p-3 rounded-lg border border-red-100 flex items-center gap-2">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {{ authError }}
          </div>

          <button type="submit" :disabled="isLoading" class="mt-2 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#58b347] hover:bg-[#499b3a] text-white text-[13px] font-black uppercase tracking-widest shadow-lg shadow-[#58b347]/20 transition-all active:scale-[0.98] disabled:opacity-70">
            <span v-if="!isLoading">Zaloguj się</span>
            <span v-else class="flex items-center gap-2">Weryfikacja...</span>
          </button>
        </form>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- GŁÓWNA APLIKACJA                           -->
    <!-- ========================================== -->
    <template v-if="isAuthenticated">
      
      <!-- WIDOK A: PANEL WEWNĘTRZNY (PRACOWNICY EKOEN) -->
      <template v-if="['ADMIN', 'MANAGER', 'DISPATCHER', 'TECHNICIAN', 'HOTLINE', 'AUDITOR', 'SUBCONTRACTOR', 'EMPLOYEE'].includes(userRole)">
        <div class="flex h-full w-full relative">
          
          <!-- TRYB KLASYCZNY: Zawsze widoczny Sidebar z lewej -->
          <template v-if="uiMode === 'classic'">
            <div class="h-full shrink-0 border-r border-slate-200 bg-white z-30 transition-all duration-300 ease-in-out" :class="isSidebarHovered ? 'w-[260px]' : 'w-[72px]'"></div>
            <div class="absolute top-0 left-0 h-full z-40" @mouseenter="isSidebarHovered = true" @mouseleave="isSidebarHovered = false">
              <Sidebar :currentView="currentActiveView" @switch-view="changeView" @logout="handleLogout" />
            </div>
          </template>

          <!-- TRYB MODERN: Wysuwane Menu po wciśnięciu Hamburgera -->
          <template v-if="uiMode === 'modern'">
            <!-- Przyciemnienie tła -->
            <div v-if="isMobileMenuOpen" class="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="isMobileMenuOpen = false"></div>
            <!-- Fizyczny Sidebar wsuwany z boku -->
            <div class="fixed top-0 left-0 h-full z-[110] transition-transform duration-300 ease-in-out" :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'">
              <!-- Przekazujemy mu 'changeView', który zamknie też menu przy kliknięciu w moduł -->
              <Sidebar :currentView="currentActiveView" @switch-view="changeView" @logout="handleLogout" />
            </div>
          </template>

          <!-- OBSZAR GŁÓWNY (Panele lub Kokpit) -->
          <main class="flex-1 relative h-full overflow-hidden z-10 flex flex-col bg-[#f4f6f8]" id="main-content-area">
            
            <!-- Pasek roboczy dla trybu Modern - Pojawia się TYLKO jak wejdziesz w Moduł -->
            <div v-if="uiMode === 'modern' && currentActiveView !== 'dashboard'" class="h-16 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between px-4 z-20 shadow-sm relative">
              <div class="flex items-center gap-3">
                <button @click="isMobileMenuOpen = true" class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                  <!-- Ikona Menu (Hamburger) -->
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
                <div class="flex flex-col">
                  <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight">Otwarte</span>
                  <span class="text-[14px] font-black tracking-tight text-slate-800 leading-tight">Panel Narzędzi</span>
                </div>
              </div>
              <button @click="currentActiveView = 'dashboard'" class="px-4 py-2 bg-[#f0f7f1] text-[#58b347] border border-[#58b347]/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#e1efe3] transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline stroke-width="2.5" points="9 22 9 12 15 12 15 22"/></svg>
                Pulpit
              </button>
            </div>

            <!-- RENDEROWANIE ZAWARTOŚCI -->
            <div class="flex-1 overflow-hidden relative">
              <!-- Sam Kokpit Modern (Bento Box) -->
              <CompactView v-if="uiMode === 'modern' && currentActiveView === 'dashboard'" 
                :userRole="userRole" 
                :userEmail="userEmail" 
                @switch-view="changeView" 
                @toggle-ui="setUiMode('classic')" 
                @logout="handleLogout" 
              />
              
              <!-- Klasyczne Moduły -->
              <TicketsView v-else-if="currentActiveView === 'tickets'" />
              <ClientsView v-else-if="currentActiveView === 'clients'" />
              <ScheduleView v-else-if="currentActiveView === 'schedule'" />
              <BillingsView v-else-if="currentActiveView === 'billings'" />
              <StorageView v-else-if="currentActiveView === 'storage'" />
              <TechniciansView v-else-if="currentActiveView === 'technicians'" />
              <StationsView v-else-if="currentActiveView === 'stations'" />
              <MapView v-else-if="currentActiveView === 'map'" />
              <OffersView v-else-if="currentActiveView === 'offers'" />
              <!-- Settings View z przekazywaniem toggle-ui -->
              <SettingsView v-else-if="currentActiveView === 'settings'" @toggle-ui="setUiMode('modern')" />
              
              <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
                <svg class="w-16 h-16 mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <h2 class="text-xl font-black uppercase tracking-widest text-slate-300">Moduł w budowie</h2>
              </div>
            </div>

          </main>
        </div>
      </template>

      <!-- WIDOK B: PORTAL KLIENTA (Dla ról typu Klient) -->
      <template v-else-if="['CLIENT', 'CLIENT VIP', 'CLIENT REGULAR'].includes(userRole)">
        <ClientPortal class="w-full h-full" :userEmail="userEmail" :isGuest="isGuest" @logout="handleLogout" />
      </template>
    </template>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Importy komponentów pracownika
import Sidebar from './components/sidebar/Sidebar.vue'
import CompactView from './components/sidebar/CompactView.vue' // <--- Zwróć uwagę, tutaj zaimportowany zgodnie ze strukturą
import StorageView from './panels/storage/StorageView.vue'
import TechniciansView from './panels/technicians/TechniciansView.vue'
import ClientsView from './panels/clients/ClientsView.vue'
import ScheduleView from './panels/schedule/ScheduleView.vue' 
import TicketsView from './panels/tickets/TicketsView.vue'
import BillingsView from './panels/billings/BillingsView.vue'
import StationsView from './panels/stations/StationsView.vue'
import MapView from './panels/map/MapView.vue'
import OffersView from './panels/offers/OffersView.vue' 
import SettingsView from './panels/settings/SettingsView.vue'

// Import portalu klienta
import ClientPortal from './clientportal/ClientPortal.vue'

// --- STANY UI (Klasyczny vs Modern) ---
const uiMode = ref(localStorage.getItem('ekoen_ui_mode') || 'classic')
const isMobileMenuOpen = ref(false)

const setUiMode = (mode) => {
  uiMode.value = mode
  localStorage.setItem('ekoen_ui_mode', mode)
  if (mode === 'modern') {
    currentActiveView.value = 'dashboard'
  }
}

// --- STANY NAWIGACJI ---
const isSidebarHovered = ref(false)
const currentActiveView = ref(uiMode.value === 'modern' ? 'dashboard' : 'map')

const changeView = (viewName) => {
  currentActiveView.value = viewName
  isMobileMenuOpen.value = false // Gdy klikniesz panel z menu wysuwanego, ono z automatu się schowa
}

// --- STANY AUTORYZACJI ---
const isAuthenticated = ref(false)
const userRole = ref('')
const userEmail = ref('')
const isGuest = ref(false)

const isLoading = ref(false)
const authError = ref('')

// Zmienne nowego formularza
const formEmail = ref('')
const formPassword = ref('')
const showPassword = ref(false)

onMounted(() => {
  const savedSession = localStorage.getItem('ekoen_user_session')
  if (savedSession) {
    try {
      const userData = JSON.parse(savedSession)
      grantAccess(userData)
    } catch (e) {
      localStorage.removeItem('ekoen_user_session')
    }
  }
})

// --- LOGOWANIE FORMULARZEM ---
function handleFormLogin() {
  isLoading.value = true
  authError.value = ''

  if (typeof google !== 'undefined' && google.script) {
    google.script.run
      .withSuccessHandler((res) => {
        isLoading.value = false
        if (res.success) {
          grantAccess(res)
        } else {
          authError.value = res.message || 'Nieprawidłowy adres e-mail lub hasło.'
        }
      })
      .withFailureHandler((err) => {
        isLoading.value = false
        authError.value = 'Błąd połączenia z bazą danych.'
      })
      .verifySystemLogin(formEmail.value, formPassword.value)
  } else {
    setTimeout(() => {
      isLoading.value = false
      if (formEmail.value === 'test' && formPassword.value === 'test') {
        grantAccess({ email: 'test@ekoen.pl', role: 'Admin', panels: '*', success: true })
      } else {
        authError.value = 'W trybie testowym użyj: test / test'
      }
    }, 800)
  }
}

function grantAccess(userData) {
  userRole.value = (userData.role || 'EMPLOYEE').toUpperCase()
  userEmail.value = userData.email || userData.username || ''
  isGuest.value = false

  localStorage.setItem('ekoen_user_session', JSON.stringify(userData))
  sessionStorage.setItem('user_panels', userData.panels || '*')
  
  isAuthenticated.value = true
}

function handleLogout() {
  localStorage.removeItem('ekoen_user_session')
  sessionStorage.removeItem('user_panels')
  
  userRole.value = ''
  userEmail.value = ''
  isGuest.value = false
  isAuthenticated.value = false
  formPassword.value = ''
  
  // Wylogowanie cofa do domyślnych ekranów
  if(uiMode.value === 'modern') currentActiveView.value = 'dashboard'
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>