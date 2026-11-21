<template>
  <div id="app-root" class="bg-[#f4f6f8] text-slate-800 font-sans h-screen w-screen overflow-hidden flex flex-row relative">
    
    <!-- ========================================== -->
    <!-- EKRAN WYBORU DOSTĘPU (Google / Bez logowania) -->
    <!-- ========================================== -->
    <div v-if="!isAuthenticated" class="fixed inset-0 z-[999999] bg-slate-50 flex flex-col items-center justify-center font-sans p-4">
      
      <!-- Tło dekoracyjne -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#58b347]/20 to-transparent blur-3xl opacity-50"></div>
        <div class="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-blue-500/10 to-transparent blur-3xl opacity-50"></div>
      </div>

      <!-- BOX GŁÓWNY -->
      <div class="bg-white w-full max-w-md p-8 md:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 relative z-10 animate-fadeIn">
        
        <!-- LOGO -->
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
          <p class="text-xs text-slate-500 font-medium mt-1.5">Zaloguj się kontem Google lub zgłoś usterkę jako gość</p>
        </div>

        <div v-if="authError" class="text-center text-xs font-bold text-red-500 pb-4 animate-pulse">
          {{ authError }}
        </div>

        <div class="space-y-4">
          <!-- OPCJA 1: LOGOWANIE PRZYCISKIEM GOOGLE -->
          <button
            @click="loginWithGoogle"
            :disabled="isLoading"
            type="button"
            class="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-xl text-[13px] border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg v-if="!isLoading" class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"/>
              <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"/>
            </svg>
            <svg v-else class="w-4 h-4 animate-spin text-[#58b347]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span>{{ isLoading ? 'Autoryzacja Google...' : 'Kontynuuj z Google' }}</span>
          </button>

          <!-- SEPARATOR -->
          <div class="flex items-center gap-3 py-1">
            <div class="flex-1 h-px bg-slate-200"></div>
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">LUB</span>
            <div class="flex-1 h-px bg-slate-200"></div>
          </div>

          <!-- OPCJA 2: BEZ LOGOWANIA (GOŚĆ / KIEROWCA) -->
          <button
            @click="enterAsGuest"
            :disabled="isLoading"
            type="button"
            class="w-full bg-[#58b347] hover:bg-[#499b3a] text-white font-black py-3.5 px-4 rounded-xl text-[12px] uppercase tracking-widest transition-all shadow-[0_5px_15px_rgba(88,179,71,0.3)] flex items-center justify-center gap-2 disabled:bg-slate-400"
          >
            <span>🚨 Zgłoś usterkę bez logowania</span>
          </button>
        </div>
        
      </div>
    </div>

    <!-- ========================================== -->
    <!-- GŁÓWNA APLIKACJA (Zależnie od Roli)        -->
    <!-- ========================================== -->
    <template v-if="isAuthenticated">
      
      <!-- WIDOK A: PANEL PRACOWNIKA (EKOEN) -->
      <template v-if="userRole === 'EMPLOYEE'">
        <div class="h-full shrink-0 border-r border-slate-200 bg-white z-30 transition-all duration-300 ease-in-out" :class="isSidebarHovered ? 'w-[260px]' : 'w-[72px]'"></div>
        
        <div class="absolute top-0 left-0 h-full z-40" @mouseenter="isSidebarHovered = true" @mouseleave="isSidebarHovered = false">
          <Sidebar :currentView="currentActiveView" @switch-view="changeView" @logout="handleLogout" />
        </div>
        
        <main class="flex-1 relative h-full overflow-hidden z-10" id="main-content-area">
          <TicketsView v-if="currentActiveView === 'tickets'" />
          <ClientsView v-else-if="currentActiveView === 'clients'" />
          <ScheduleView v-else-if="currentActiveView === 'schedule'" />
          <BillingsView v-else-if="currentActiveView === 'billings'" />
          <StorageView v-else-if="currentActiveView === 'storage'" />
          <TechniciansView v-else-if="currentActiveView == 'technicians'" />
          <StationsView v-else-if="currentActiveView == 'stations'" />
          <MapView v-else-if="currentActiveView == 'map'" />
          <OffersView v-else-if="currentActiveView === 'offers'" />
          <SettingsView v-else-if="currentActiveView === 'settings'"/>
          
          <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
            <svg class="w-16 h-16 mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <h2 class="text-xl font-black uppercase tracking-widest text-slate-300">Moduł w budowie</h2>
          </div>
        </main>
      </template>

      <!-- WIDOK B: PORTAL KLIENTA (Zalogowany z historią LUB Gość bez logowania) -->
      <template v-else-if="userRole === 'CLIENT'">
        <ClientPortal 
          class="w-full h-full" 
          :userEmail="userEmail" 
          :isGuest="isGuest" 
          @logout="handleLogout" 
        />
      </template>

    </template>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Importy komponentów pracownika
import Sidebar from './components/sidebar/Sidebar.vue'
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

// Import portalu klienta (dopasuj ścieżkę jeśli folder jest w src/clientportal/)
import ClientPortal from './clientportal/ClientPortal.vue'

// --- KONFIGURACJA GOOGLE OAUTH REDIRECT ---
const GOOGLE_CLIENT_ID = '398779552235-ssklkk7togd0ie05ati1pt1nbm5g158u.apps.googleusercontent.com'
const GAS_EXEC_URL = 'https://script.google.com/macros/s/AKfycbyMqe87OuhNHgqI4OScTPc4RSJ3fDF3QhhC1S3-OFTC6ho7mphyS_Q8nE0gvDluybU8ww/exec'

const getRedirectUri = () => {
  return window.location.hostname === 'localhost' ? 'http://localhost:5173' : GAS_EXEC_URL
}

// --- STANY NAWIGACJI ---
const isSidebarHovered = ref(false)
const currentActiveView = ref('map')
const changeView = (viewName) => { currentActiveView.value = viewName }

// --- STANY AUTORYZACJI ---
const isAuthenticated = ref(false)
const userRole = ref('') // 'EMPLOYEE' | 'CLIENT'
const userEmail = ref('')
const isGuest = ref(false)

const isLoading = ref(false)
const authError = ref('')

onMounted(() => {
  // 1. Obsługa powrotu z logowania Google (?code=...)
  const urlCode = new URLSearchParams(window.location.search).get('code')
  const gasCode = window.__GAS_OAUTH_CODE__ || urlCode || ''

  if (gasCode) {
    window.__GAS_OAUTH_CODE__ = ''
    if (window.location.hostname === 'localhost') {
      window.history.replaceState({}, document.title, '/')
    }
    completeGoogleOAuth(gasCode)
    return
  }

  // 2. Wejście z kodu QR (#/client) -> otwiera od razu w trybie gościa
  if (window.location.hash.includes('/client')) {
    enterAsGuest()
    return
  }

  // 3. Sprawdzenie zapisanej sesji w LocalStorage
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

// --- PRZEKIEROWANIE DO GOOGLE ---
function loginWithGoogle() {
  isLoading.value = true
  authError.value = ''

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account'
  })

  window.top.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// --- WYMIANA KODU Z GOOGLE NA SESJĘ ---
function completeGoogleOAuth(code) {
  isLoading.value = true
  authError.value = ''

  if (typeof google !== 'undefined' && google.script) {
    google.script.run
      .withSuccessHandler((res) => {
        isLoading.value = false
        if (res.success) {
          grantAccess(res)
        } else {
          authError.value = res.message || 'Błąd weryfikacji konta Google.'
        }
      })
      .withFailureHandler(() => {
        isLoading.value = false
        authError.value = 'Błąd połączenia z serwerem Google.'
      })
      .exchangeGoogleCode(code, getRedirectUri())
  } else {
    setTimeout(() => {
      isLoading.value = false
      grantAccess({ email: 'dev@ekoen.pl', role: 'EMPLOYEE', panels: '*', success: true })
    }, 500)
  }
}

// --- WEJŚCIE BEZ LOGOWANIA (GOŚĆ) ---
function enterAsGuest() {
  userRole.value = 'CLIENT'
  userEmail.value = ''
  isGuest.value = true
  isAuthenticated.value = true
}

// --- WPUSZCZENIE ZALOGOWANEGO UŻYTKOWNIKA ---
function grantAccess(userData) {
  userRole.value = userData.role || 'CLIENT'
  userEmail.value = userData.email || userData.username || ''
  isGuest.value = false

  localStorage.setItem('ekoen_user_session', JSON.stringify(userData))
  sessionStorage.setItem('user_panels', userData.panels || '*')
  
  isAuthenticated.value = true
}

// --- WYLOGOWANIE ---
function handleLogout() {
  localStorage.removeItem('ekoen_user_session')
  sessionStorage.removeItem('user_panels')
  
  userRole.value = ''
  userEmail.value = ''
  isGuest.value = false
  isAuthenticated.value = false
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