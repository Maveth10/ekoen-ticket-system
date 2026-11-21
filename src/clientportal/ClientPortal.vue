<template>
  <div class="fixed inset-0 bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
    
    <!-- GÓRNY PASEK APLIKACJI -->
    <header class="bg-white px-5 py-4 flex items-center justify-between shadow-sm z-20">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-xl">
          E
        </div>
        <div>
          <h1 class="font-black text-slate-800 text-lg leading-none tracking-tight">EKOEN</h1>
          <p class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Wsparcie Techniczne</p>
        </div>
      </div>
      <button class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
      </button>
    </header>

    <!-- OBSZAR GŁÓWNY (SCROLLOWANY) -->
    <main class="flex-1 overflow-y-auto pb-20 relative">
      
      <!-- ZAKŁADKA 1: NOWE ZGŁOSZENIE -->
      <div v-if="activeTab === 'NEW'" class="p-5 animate-fadeIn">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h2 class="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
            <span>🚨</span> Zgłoś usterkę stacji
          </h2>
          
          <form @submit.prevent="submitTicket" class="flex flex-col gap-4">
            
            <!-- Numer Stacji -->
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Numer Stacji (QP)</label>
              <div class="relative">
                <input type="text" v-model="formData.qp" 
                       class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                       placeholder="np. QP-10288" required>
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                </button>
              </div>
            </div>

            <!-- Kategoria usterki -->
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Czego dotyczy problem?</label>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" @click="formData.category = 'APP'" class="p-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1" :class="formData.category === 'APP' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'">
                  <span class="text-lg">📱</span> Aplikacja / Płatność
                </button>
                <button type="button" @click="formData.category = 'CABLE'" class="p-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1" :class="formData.category === 'CABLE' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'">
                  <span class="text-lg">🔌</span> Kabel / Wtyczka
                </button>
                <button type="button" @click="formData.category = 'SCREEN'" class="p-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1" :class="formData.category === 'SCREEN' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'">
                  <span class="text-lg">📺</span> Ekran stacji
                </button>
                <button type="button" @click="formData.category = 'OTHER'" class="p-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col gap-1" :class="formData.category === 'OTHER' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'">
                  <span class="text-lg">⚠️</span> Inne uszkodzenie
                </button>
              </div>
            </div>

            <!-- Opis -->
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Opis sytuacji</label>
              <textarea v-model="formData.description" rows="3" 
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                        placeholder="Opisz krótko co się wydarzyło..." required></textarea>
            </div>

            <!-- Zdjęcia / Wideo -->
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Załącz zdjęcie lub wideo (opcjonalnie)</label>
              <div class="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors" @click="$refs.fileInput.click()">
                <div class="text-2xl mb-1">📷</div>
                <div class="text-xs font-bold text-emerald-600">Zrób zdjęcie aparatem</div>
                <div class="text-[10px] text-slate-400">lub wybierz z galerii</div>
                <input type="file" ref="fileInput" class="hidden" accept="image/*,video/*" capture="environment" @change="handleFileUpload">
              </div>
              <!-- Miniaturki -->
              <div v-if="formData.files.length > 0" class="flex gap-2 mt-3 overflow-x-auto">
                <div v-for="(file, idx) in formData.files" :key="idx" class="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                  <img :src="file.preview" class="w-full h-full object-cover">
                  <button @click.prevent="removeFile(idx)" class="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-bl-lg text-xs font-bold">×</button>
                </div>
              </div>
            </div>

            <!-- Przycisk Wyślij -->
            <button type="submit" class="mt-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2">
              <span>Wyślij Zgłoszenie</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </button>
          </form>
        </div>
      </div>

      <!-- ZAKŁADKA 2: MOJE ZGŁOSZENIA (HISTORIA) -->
      <div v-if="activeTab === 'HISTORY'" class="p-5 animate-fadeIn">
        <h2 class="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Twoje Zgłoszenia</h2>
        
        <div class="flex flex-col gap-3">
          <!-- Karta Zgłoszenia -->
          <div v-for="ticket in mockHistory" :key="ticket.id" 
               @click="openTicketChat(ticket)"
               class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer">
            <div class="flex justify-between items-start mb-2">
              <span class="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">{{ ticket.qp }}</span>
              <!-- Statusy -->
              <span v-if="ticket.status === 'NEW'" class="bg-blue-50 text-blue-600 border border-blue-200 text-[9px] font-black px-2 py-0.5 rounded uppercase">Przyjęte</span>
              <span v-else-if="ticket.status === 'IN_PROGRESS'" class="bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-black px-2 py-0.5 rounded uppercase">W naprawie</span>
              <span v-else-if="ticket.status === 'RESOLVED'" class="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[9px] font-black px-2 py-0.5 rounded uppercase">Naprawione</span>
            </div>
            <div class="text-sm font-bold text-slate-800 mb-1 leading-tight">{{ ticket.title }}</div>
            <div class="flex justify-between items-center mt-3">
              <span class="text-[10px] font-bold text-slate-400">{{ ticket.date }}</span>
              <span class="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                Zobacz czat/szczegóły 
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- WIDOK 3: CZAT / SZCZEGÓŁY ZGŁOSZENIA (Nakładka) -->
      <div v-if="activeTicketChat" class="absolute inset-0 bg-slate-50 z-30 flex flex-col animate-slideUp">
        <header class="bg-white px-4 py-3 flex items-center gap-3 border-b border-slate-200">
          <button @click="activeTicketChat = null" class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zgłoszenie #{{ activeTicketChat.id }}</div>
            <div class="text-sm font-bold text-slate-800">{{ activeTicketChat.qp }}</div>
          </div>
        </header>

        <!-- Obszar wiadomości (Czat) -->
        <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          
          <!-- Wiadomość Systemowa -->
          <div class="flex justify-center">
            <span class="bg-slate-200 text-slate-600 text-[9px] font-bold px-3 py-1 rounded-full uppercase">Zgłoszenie przyjęte: {{ activeTicketChat.date }}</span>
          </div>

          <!-- Wiadomość Klienta (Opis z formularza) -->
          <div class="flex justify-end">
            <div class="bg-emerald-500 text-white rounded-2xl rounded-tr-sm p-3 max-w-[85%] shadow-sm">
              <div class="text-[10px] font-bold text-emerald-100 mb-1">Ty</div>
              <p class="text-sm font-medium">{{ activeTicketChat.title }}</p>
            </div>
          </div>

          <!-- Wiadomość od Technika / Dyspozytora -->
          <div class="flex justify-start" v-if="activeTicketChat.status !== 'NEW'">
            <div class="flex gap-2 items-end max-w-[85%]">
              <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black shrink-0">E</div>
              <div class="bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm p-3 shadow-sm">
                <div class="text-[10px] font-bold text-blue-600 mb-1">Serwis EKOEN</div>
                <p class="text-sm font-medium">Technik przyjął zgłoszenie. Jesteśmy w drodze na stację.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pole wpisywania nowej wiadomości -->
        <div class="bg-white p-3 border-t border-slate-200 pb-safe">
          <div class="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1">
            <button class="w-10 h-10 shrink-0 text-slate-400 hover:text-emerald-500 flex items-center justify-center transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
            </button>
            <textarea rows="1" class="flex-1 bg-transparent py-2.5 text-sm font-medium text-slate-700 focus:outline-none resize-none" placeholder="Dodaj komentarz..."></textarea>
            <button class="w-10 h-10 shrink-0 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md">
              <svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      </div>

    </main>

    <!-- DOLNY PASEK NAWIGACJI (Tylko gdy nie ma włączonego czatu) -->
    <nav v-show="!activeTicketChat" class="bg-white border-t border-slate-100 flex items-center justify-around pb-safe pt-2 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-20">
      <button @click="activeTab = 'NEW'" class="flex flex-col items-center gap-1 p-2 w-20 transition-colors" :class="activeTab === 'NEW' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'">
        <svg class="w-6 h-6" :fill="activeTab === 'NEW' ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <span class="text-[9px] font-black uppercase tracking-wider">Zgłoś</span>
      </button>
      
      <button @click="activeTab = 'HISTORY'" class="flex flex-col items-center gap-1 p-2 w-20 transition-colors" :class="activeTab === 'HISTORY' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'">
        <div class="relative">
          <svg class="w-6 h-6" :fill="activeTab === 'HISTORY' ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          <span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-black border-2 border-white">2</span>
        </div>
        <span class="text-[9px] font-black uppercase tracking-wider">Moje</span>
      </button>
      
      <button class="flex flex-col items-center gap-1 p-2 w-20 text-slate-400 hover:text-slate-600 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        <span class="text-[9px] font-black uppercase tracking-wider">Konto</span>
      </button>
    </nav>
    
  </div>

  <button @click="emit('logout')" class="flex flex-col items-center gap-1 p-2 w-20 text-slate-400 hover:text-red-500 transition-colors">
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
  <span class="text-[9px] font-black uppercase tracking-wider">Wyloguj</span>
</button>

</template>

<script setup>
import { ref, onMounted } from 'vue'

const activeTab = ref('NEW') // 'NEW', 'HISTORY'
const activeTicketChat = ref(null)

const formData = ref({
  qp: '',
  category: '',
  description: '',
  files: []
})

// MOCK: Historia zgłoszeń klienta
const mockHistory = ref([
  { id: '4092', qp: 'QP-10288', title: 'Wyrwany kabel przy lewym złączu CCS', status: 'IN_PROGRESS', date: 'Dziś, 14:30' },
  { id: '3911', qp: 'QP-10294', title: 'Aplikacja nie autoryzuje płatności', status: 'RESOLVED', date: 'Wczoraj, 09:15' }
])

onMounted(() => {
  // Symulacja skanowania kodu QR z linku np. ?qp=QP-10288
  const urlParams = new URLSearchParams(window.location.search)
  const qpParam = urlParams.get('qp')
  if (qpParam) {
    formData.value.qp = qpParam
  }
})

// Podgląd wybranych plików
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.files.push({
        file: file,
        preview: e.target.result // Base64 do wyświetlenia miniaturki
      })
    }
    reader.readAsDataURL(file)
  }
}

const removeFile = (idx) => {
  formData.value.files.splice(idx, 1)
}

const submitTicket = () => {
  // Tutaj kod do wysyłki (google.script.run)
  alert(`Wysłano zgłoszenie dla ${formData.value.qp}!`)
  
  // Reset formularza i przejście do historii
  formData.value.description = ''
  formData.value.files = []
  activeTab.value = 'HISTORY'
}

const openTicketChat = (ticket) => {
  activeTicketChat.value = ticket
}

const emit = defineEmits(['logout'])

</script>

<style scoped>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
.animate-slideUp {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>