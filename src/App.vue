<template>
  <div id="app-root" class="bg-[#f4f6f8] text-slate-800 font-sans h-screen w-screen overflow-hidden flex flex-row relative">
    
    <!-- ========================================== -->
    <!-- EKRAN LOGOWANIA I USTAWIANIA HASŁA -->
    <!-- (Pokrywa całą aplikację, gdy nie jesteśmy zalogowani) -->
    <!-- ========================================== -->
    <div v-if="!isAuthenticated" class="fixed inset-0 z-[999999] bg-slate-50 flex flex-col items-center justify-center font-sans">
      
      <!-- Tło dekoracyjne -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#58b347]/20 to-transparent blur-3xl opacity-50"></div>
        <div class="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-blue-500/10 to-transparent blur-3xl opacity-50"></div>
      </div>

      <!-- BOX GŁÓWNY -->
      <div class="bg-white w-full max-w-md p-8 md:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 relative z-10">
        
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

        <!-- KROK 1: STANDARDOWE LOGOWANIE -->
        <div v-if="!requirePasswordSetup" class="animate-fadeIn">
          <div class="text-center mb-8">
            <h2 class="text-xl font-black text-slate-800 tracking-tight">Witaj w systemie</h2>
            <p class="text-xs text-slate-500 font-medium mt-1.5">Zaloguj się na konto pracownicze</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Nazwa użytkownika</label>
              <div class="relative flex items-center">
                <svg class="w-4 h-4 text-slate-400 absolute left-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input v-model="loginData.username" @keyup.enter="handleLogin" type="text" placeholder="np. jan.kowalski" class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#58b347] focus:ring-2 focus:ring-[#58b347]/20 transition-all">
              </div>
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Hasło</label>
              <div class="relative flex items-center">
                <svg class="w-4 h-4 text-slate-400 absolute left-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input v-model="loginData.password" @keyup.enter="handleLogin" type="password" placeholder="••••••••" class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 focus:outline-none focus:bg-white focus:border-[#58b347] focus:ring-2 focus:ring-[#58b347]/20 transition-all">
              </div>
            </div>

            <div v-if="authError" class="text-center text-xs font-bold text-red-500 pt-1 animate-pulse">
              {{ authError }}
            </div>

            <button @click="handleLogin" :disabled="isLoading" class="w-full bg-[#58b347] text-white font-black py-3.5 px-4 rounded-xl text-[13px] uppercase tracking-widest hover:bg-[#499b3a] transition-all shadow-[0_5px_15px_rgba(88,179,71,0.3)] mt-2 flex items-center justify-center gap-2 disabled:bg-slate-400">
              <span>{{ isLoading ? 'Weryfikacja...' : 'Zaloguj się' }}</span>
              <svg v-if="isLoading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </button>
          </div>
        </div>

        <!-- KROK 2: USTAWIANIE HASŁA -->
        <div v-else class="animate-fadeIn">
          <div class="text-center mb-6">
            <h2 class="text-xl font-black text-slate-800 tracking-tight">Nowe Konto</h2>
            <p class="text-xs text-slate-500 font-medium mt-1.5">Zabezpiecz swoje konto nowym hasłem.</p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Nowe hasło</label>
              <input v-model="setupData.pass1" type="password" placeholder="Minimum 4 znaki" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 focus:outline-none focus:border-[#58b347] transition-all">
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Powtórz hasło</label>
              <input v-model="setupData.pass2" @keyup.enter="handleSetupPassword" type="password" placeholder="Potwierdź nowe hasło" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 focus:outline-none focus:border-[#58b347] transition-all">
            </div>

            <div v-if="setupError" class="text-center text-xs font-bold text-red-500 pt-1">
              {{ setupError }}
            </div>

            <button @click="handleSetupPassword" :disabled="isLoading" class="w-full bg-[#58b347] text-white font-black py-3.5 px-4 rounded-xl text-[13px] uppercase tracking-widest hover:bg-[#499b3a] transition-all shadow-[0_5px_15px_rgba(88,179,71,0.3)] mt-2 flex items-center justify-center gap-2 disabled:bg-slate-400">
              <span>{{ isLoading ? 'Zapisywanie...' : 'Zapisz i Wejdź' }}</span>
            </button>
          </div>
        </div>
        
      </div>
    </div>

    <!-- ========================================== -->
    <!-- GŁÓWNA APLIKACJA (Pokazuje się po zalogowaniu) -->
    <!-- ========================================== -->
    
    <!-- Animowany pasek trzymający przestrzeń (efekt kinowy) -->
    <div v-show="isAuthenticated"
      class="h-full shrink-0 border-r border-slate-200 bg-white z-30 transition-all duration-300 ease-in-out"
      :class="isSidebarHovered ? 'w-[260px]' : 'w-[72px]'"
    ></div>
    
    <!-- MENU BOCZNE -->
    <div v-show="isAuthenticated"
      class="absolute top-0 left-0 h-full z-40"
      @mouseenter="isSidebarHovered = true" 
      @mouseleave="isSidebarHovered = false"
    >
      <Sidebar 
        :currentView="currentActiveView" 
        @switch-view="changeView"
        @logout="handleLogout"
      />
    </div>
    
    <!-- GŁÓWNA PRZESTRZEŃ (PANELE) -->
    <main v-if="isAuthenticated" class="flex-1 relative h-full overflow-hidden z-10" id="main-content-area">
      <!-- Dynamiczne przełączanie widoków -->
      <TicketsView v-if="currentActiveView === 'tickets'" />
      <ClientsView v-else-if="currentActiveView === 'clients'" />
      <ScheduleView v-else-if="currentActiveView === 'schedule'" />
      <BillingsView v-else-if="currentActiveView === 'billings'" />
      <StorageView v-else-if="currentActiveView === 'storage'" />
      <TechniciansView v-else-if="currentActiveView == 'technicians'" />
      <StationsView v-else-if="currentActiveView == 'stations'" />
      <MapView v-else-if="currentActiveView == 'map'" />
      <OffersView v-else-if="currentActiveView === 'offers'" />
      
      <!-- Zaślepka dla pozostałych, jeszcze niezbudowanych zakładek -->
      <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
        <svg class="w-16 h-16 mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <h2 class="text-xl font-black uppercase tracking-widest text-slate-300">Moduł w budowie</h2>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// Importy komponentów bazowych i paneli
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

// --- STANY APLIKACJI I NAWIGACJI ---
const isSidebarHovered = ref(false)
const currentActiveView = ref('map')

const changeView = (viewName) => {
  currentActiveView.value = viewName
}

// --- STANY LOGOWANIA ---
const isAuthenticated = ref(false)
const requirePasswordSetup = ref(false)
const isLoading = ref(false)
const authError = ref('')
const setupError = ref('')

const loginData = reactive({ username: '', password: '' })
const setupData = reactive({ pass1: '', pass2: '' })

// Sprawdzamy sesję przy starcie
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

// --- GŁÓWNA FUNKCJA LOGOWANIA ---
function handleLogin() {
  if (!loginData.username.trim()) {
    authError.value = "Podaj nazwę użytkownika."
    return
  }

  authError.value = ""
  isLoading.value = true

  if (typeof google !== 'undefined') {
    google.script.run
      .withSuccessHandler((res) => {
        isLoading.value = false
        if (res.success) {
          if (res.requirePasswordSetup) {
            requirePasswordSetup.value = true
          } else {
            grantAccess(res)
          }
        } else {
          authError.value = res.message || "Nieprawidłowe dane."
        }
      })
      .withFailureHandler(() => {
        isLoading.value = false
        authError.value = "Błąd połączenia z serwerem."
      })
      .verifySystemLogin(loginData.username, loginData.password)
  } else {
    // MOCK
    setTimeout(() => {
      isLoading.value = false
      if (loginData.username === 'admin' && loginData.password === 'admin') {
        grantAccess({ username: 'admin', panels: '*', success: true })
      } else if (loginData.username === 'nowy' && !loginData.password) {
        requirePasswordSetup.value = true
      } else {
        authError.value = "Błędne dane (mock)."
      }
    }, 1000)
  }
}

// --- FUNKCJA ZAPISU NOWEGO HASŁA ---
function handleSetupPassword() {
  setupError.value = ""
  
  if (setupData.pass1.length < 4) {
    setupError.value = "Hasło musi mieć min. 4 znaki."
    return
  }
  if (setupData.pass1 !== setupData.pass2) {
    setupError.value = "Hasła nie są identyczne."
    return
  }

  isLoading.value = true

  if (typeof google !== 'undefined') {
    google.script.run
      .withSuccessHandler((res) => {
        isLoading.value = false
        if (res.success) {
          grantAccess(res)
        } else {
          setupError.value = res.message || "Błąd zapisu."
        }
      })
      .withFailureHandler(() => {
        isLoading.value = false
        setupError.value = "Błąd połączenia z serwerem."
      })
      .setNewUserPassword(loginData.username, setupData.pass1)
  } else {
    setTimeout(() => {
      isLoading.value = false
      grantAccess({ username: loginData.username, panels: '*', success: true })
    }, 1000)
  }
}

// --- FUNKCJA WPUSZCZAJĄCA DO APLIKACJI ---
function grantAccess(userData) {
  localStorage.setItem('ekoen_user_session', JSON.stringify(userData))
  sessionStorage.setItem('user_panels', userData.panels || "")
  
  requirePasswordSetup.value = false
  isAuthenticated.value = true
}

// --- IDEALNIE DZIAŁAJĄCY LOGOUT ---
function handleLogout() {
  localStorage.removeItem('ekoen_user_session')
  sessionStorage.removeItem('user_panels')
  
  loginData.username = ''
  loginData.password = ''
  setupData.pass1 = ''
  setupData.pass2 = ''
  
  isAuthenticated.value = false
}
</script>