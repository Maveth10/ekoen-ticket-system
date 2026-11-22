<template>
  <div class="fixed inset-0 bg-[#f8fafc] overflow-y-auto flex justify-center font-sans text-slate-800 antialiased relative z-0">
    <!-- Ambient blur background -->
    <div class="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-[#58b347]/20 blur-[120px] rounded-full pointer-events-none"></div>
    <div class="absolute bottom-[-15%] right-[-10%] w-[40%] h-[50%] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none"></div>

    <div class="w-full max-w-[1200px] px-4 md:px-8 py-6 md:py-10 relative z-10 flex flex-col min-h-screen">
      
      <!-- NAGŁÓWEK -->
      <header class="flex items-center justify-between mb-8 md:mb-12 animate-fadeIn shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#58b347] border border-slate-100">
            <svg class="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.4a1 1 0 0 0 1.4 0l3.7-3.7a1 1 0 0 0 0-1.4l-1.6-1.4a1 1 0 0 0-1.4 0z"/><path d="M11.6 11.6 14.7 6.3"/><path d="M15.8 4.2 11.6 11.6"/><path d="M11.6 11.6 5 21a2 2 0 0 1-2.8-2.8l9.4-6.6"/>
            </svg>
          </div>
          <div>
            <h1 class="font-black text-slate-900 text-2xl md:text-3xl tracking-tight">Witaj w EKOEN</h1>
            <p class="text-xs md:text-sm font-bold text-slate-500 mt-0.5">Globalne Centrum Wsparcia i Obsługi</p>
          </div>
        </div>
        <button @click="emit('logout')" class="w-12 h-12 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white hover:shadow-md transition-all border border-slate-200/50 group">
          <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>
      </header>

      <!-- SIATKA BENTO -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 flex-1 content-start animate-slideUp">
        
        <!-- HERO -->
        <div class="md:col-span-8 lg:col-span-8 bg-gradient-to-br from-[#58b347] to-[#408f31] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-[0_20px_50px_-15px_rgba(88,179,71,0.4)] text-white flex flex-col justify-between relative overflow-hidden group">
          <svg class="absolute -bottom-16 -right-16 w-80 h-80 text-white opacity-10 rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 pointer-events-none" fill="currentColor" viewBox="0 0 24 24"><path d="M11.6 11.6 5 21a2 2 0 0 1-2.8-2.8l9.4-6.6"/></svg>
          
          <div class="relative z-10 mb-8 md:mb-12">
            <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest mb-4 border border-white/20 shadow-sm">
              <span class="w-2.5 h-2.5 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_10px_rgba(110,231,183,0.8)]"></span> Stacja zlokalizowana
            </div>
            <h2 class="text-4xl md:text-5xl font-black tracking-tight mb-3 drop-shadow-sm">{{ detectedQp || 'Gotowi do działania' }}</h2>
            <p class="text-emerald-50 text-sm md:text-base font-medium max-w-lg leading-relaxed">System zidentyfikował Twoją lokalizację. Wybierz rodzaj zgłoszenia, a my natychmiast przekażemy sprawę do odpowiedniego działu.</p>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 relative z-10">
            <button v-for="cat in categories" :key="cat.id" @click="openModal('FORM', cat.id)" 
                    class="bg-white/10 hover:bg-white/25 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-left transition-all hover:scale-105 active:scale-95 flex flex-col h-full shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
              
              <!-- Profesjonalna ikona SVG wstrzykiwana przez v-html -->
              <div class="mb-3 bg-white/20 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-inner p-2.5 md:p-3" v-html="cat.icon"></div>
              
              <div class="mt-auto">
                <div class="text-[11px] font-bold text-emerald-100 uppercase tracking-wider mb-0.5">{{ cat.sub }}</div>
                <div class="text-[13px] md:text-[14px] font-black tracking-wide">{{ cat.label }}</div>
              </div>
            </button>
          </div>
        </div>

        <!-- SZYBKI CZAT -->
        <button @click="openModal('CHAT')" class="md:col-span-4 lg:col-span-4 bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-xl hover:border-emerald-200 transition-all group active:scale-[0.98] relative overflow-hidden">
          <div class="w-20 h-20 bg-[#f0f7f1] text-[#58b347] rounded-3xl flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:shadow-emerald-200/50 transition-all duration-300 relative z-10">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <div class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm">1</div>
          </div>
          <h3 class="text-xl md:text-2xl font-black text-slate-800 tracking-tight mb-2 relative z-10">Wsparcie Online</h3>
          <p class="text-sm font-medium text-slate-500 relative z-10">Krótkie pytanie? Konsultant jest na czacie. Odpowiadamy średnio w <strong class="text-[#58b347]">2 minuty</strong>.</p>
        </button>

        <!-- AKTYWNA INTERWENCJA -->
        <div v-if="activeTicket" @click="openModal('TICKET_DETAILS', activeTicket)" class="md:col-span-5 lg:col-span-5 bg-slate-900 text-white rounded-[2rem] p-6 md:p-8 shadow-xl hover:shadow-2xl cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-center relative overflow-hidden group">
          <div class="absolute right-0 top-0 w-48 h-full bg-gradient-to-l from-emerald-500/20 to-transparent pointer-events-none group-hover:from-emerald-500/30 transition-colors"></div>
          <div class="flex items-center gap-3 mb-4 relative z-10">
            <div class="relative flex items-center justify-center">
              <span class="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute"></span>
              <span class="w-3 h-3 bg-emerald-400 rounded-full relative z-10"></span>
            </div>
            <span class="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-400">Interwencja w toku</span>
          </div>
          <h3 class="text-xl md:text-2xl font-black truncate mb-2 relative z-10">{{ activeTicket.title }}</h3>
          <p class="text-sm font-medium text-slate-400 mb-6 relative z-10 line-clamp-2">{{ activeTicket.description }}</p>
          <div class="mt-auto flex items-center justify-between relative z-10">
            <span class="bg-white/10 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase backdrop-blur-sm">{{ activeTicket.qp }}</span>
            <span class="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">Szczegóły <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg></span>
          </div>
        </div>

        <!-- HISTORIA ZGŁOSZEŃ -->
        <div class="md:col-span-7 lg:col-span-7 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col h-[280px] overflow-hidden" :class="!activeTicket ? 'md:col-span-12 lg:col-span-12' : ''">
          <div class="flex justify-between items-center mb-6 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
              <h3 class="text-sm md:text-base font-black uppercase tracking-widest text-slate-800">Historia Zgłoszeń</h3>
            </div>
          </div>
          
          <div class="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 pb-2">
            <div v-for="ticket in historyList" :key="ticket.id" @click="openModal('TICKET_DETAILS', ticket)" class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#58b347]/30 hover:shadow-sm transition-all cursor-pointer group">
              <div class="flex-1 min-w-0 pr-4">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{{ ticket.id }}</span>
                  <span class="text-[10px] font-bold text-slate-500">•</span>
                  <span class="text-[10px] font-black text-slate-500">{{ ticket.qp }}</span>
                </div>
                <div class="text-sm font-bold text-slate-800 truncate group-hover:text-[#58b347] transition-colors">{{ ticket.title }}</div>
              </div>
              <div class="shrink-0 flex items-center gap-4">
                <span class="text-[10px] font-bold text-slate-400 hidden sm:block">{{ ticket.date }}</span>
                <span v-if="ticket.status === 'RESOLVED'" class="text-[10px] font-black text-slate-500 uppercase tracking-wider bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">Zamknięte</span>
                <span v-else-if="ticket.status === 'NEW'" class="text-[10px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm">Zgłoszone</span>
                <span v-else-if="ticket.status === 'IN_PROGRESS'" class="text-[10px] font-black text-amber-600 uppercase tracking-wider bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 shadow-sm">W Trakcie</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ========================================== -->
    <!-- SUPER PŁYNNE MODALE (Transition) -->
    <!-- ========================================== -->
    <Transition name="modal">
      <div v-if="activeModal" class="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
        
        <!-- Tło zamykające -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm modal-bg" @click="closeModal"></div>
        
        <!-- Wspólny kontener dla animacji -->
        <div class="bg-white w-full rounded-t-[2rem] md:rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col overflow-hidden modal-content"
             :class="activeModal === 'FORM' ? 'max-w-[900px] h-[95vh] md:h-auto md:max-h-[92vh]' : 'max-w-[600px] h-[85vh] md:h-[75vh]'">
          
          <!-- PASEK GÓRNY MODALA -->
          <div class="px-6 md:px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
            <div>
              <h3 class="text-base md:text-lg font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
                <div v-if="activeModal === 'FORM'" class="w-6 h-6 md:w-7 md:h-7 text-[#58b347]" v-html="selectedCategoryData?.icon"></div>
                <div v-if="activeModal === 'CHAT'" class="w-10 h-10 bg-[#f0f7f1] rounded-xl flex items-center justify-center text-[#58b347]"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
                <div v-if="activeModal === 'TICKET_DETAILS'" class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg></div>
                {{ modalTitle }}
              </h3>
              <p v-if="activeModal === 'FORM'" class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Kategoria: <span class="text-[#58b347]">{{ selectedCategoryData?.label }}</span></p>
              <p v-if="activeModal === 'CHAT'" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Dyspozytor Online</p>
            </div>
            <button @click="closeModal" class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors border border-slate-200">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- ZAWARTOŚĆ: FORMULARZ -->
          <div v-if="activeModal === 'FORM'" class="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50">
            <form @submit.prevent="submitTicket" class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div class="space-y-6">
                 <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-4">Stacja</h4>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-[11px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Numer Stacji (QP) *</label>
                        <input type="text" v-model="form.qp" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold font-mono text-slate-800 focus:outline-none focus:border-[#58b347] transition-colors" required>
                      </div>
                      <div>
                        <label class="block text-[11px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Złącze / Element (Opcjonalnie)</label>
                        <select v-model="form.evse" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#58b347] transition-colors">
                          <option value="ALL">Cała Stacja / Nie dotyczy</option>
                          <option value="CCS1">Złącze 1 (CCS)</option>
                          <option value="CCS2">Złącze 2 (CCS)</option>
                          <option value="AC">Złącze AC / CHAdeMO</option>
                        </select>
                      </div>
                    </div>
                 </div>
                 
                 <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-4">Twoje Dane</h4>
                    <div class="space-y-4">
                      <div>
                        <label class="block text-[11px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Imię i Nazwisko *</label>
                        <input type="text" v-model="form.contact_name" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold transition-colors focus:border-[#58b347] focus:outline-none" required>
                      </div>
                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <label class="block text-[11px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Telefon *</label>
                          <input type="tel" v-model="form.contact_phone" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold transition-colors focus:border-[#58b347] focus:outline-none" required>
                        </div>
                        <div>
                          <label class="block text-[11px] font-black uppercase tracking-widest text-slate-600 mb-1.5">E-mail *</label>
                          <input type="email" v-model="form.contact_email" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold transition-colors focus:border-[#58b347] focus:outline-none" required>
                        </div>
                      </div>
                    </div>
                 </div>
              </div>

              <div class="space-y-6 flex flex-col">
                 <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex-1 flex flex-col">
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-4">Szczegóły zgłoszenia</h4>
                    <div class="mb-4">
                      <label class="block text-[11px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Krótki Tytuł *</label>
                      <input type="text" v-model="form.title" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#58b347] transition-colors" placeholder="np. Brak autoryzacji karty" required>
                    </div>
                    <div class="flex-1 flex flex-col mb-4">
                      <label class="block text-[11px] font-black uppercase tracking-widest text-slate-600 mb-1.5">Opis sytuacji *</label>
                      <textarea v-model="form.description" class="w-full flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium resize-none custom-scrollbar focus:outline-none focus:border-[#58b347] min-h-[120px]" placeholder="Opisz dokładnie problem..." required></textarea>
                    </div>
                    <div class="border-t border-slate-100 pt-4">
                      <label class="flex justify-center w-full h-16 px-4 transition bg-slate-50 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer hover:border-[#58b347] hover:bg-[#f0f7f1] items-center gap-3">
                        <svg class="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Załącz Zdjęcie</span>
                        <input type="file" @change="handleFileUpload" class="hidden" accept="image/*">
                      </label>
                      <div v-if="form.files.length > 0" class="flex gap-2 mt-3 overflow-x-auto custom-scrollbar pb-2">
                        <div v-for="(file, idx) in form.files" :key="idx" class="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                          <img :src="file.preview" class="w-full h-full object-cover">
                          <button @click.prevent="removeFile(idx)" class="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                 </div>
                 <button type="submit" class="w-full flex items-center justify-center gap-2 px-6 py-5 rounded-2xl bg-[#58b347] hover:bg-[#499b3a] text-white text-[13px] font-black uppercase tracking-widest shadow-xl shadow-[#58b347]/20 transition-all active:scale-[0.98]">
                    WYŚLIJ ZGŁOSZENIE
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                 </button>
              </div>
            </form>
          </div>

          <!-- ZAWARTOŚĆ: SZYBKI CZAT -->
          <div v-if="activeModal === 'CHAT'" class="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden">
             <div ref="chatContainer" class="flex-1 overflow-y-auto p-5 md:p-8 flex flex-col gap-5 custom-scrollbar">
                <template v-for="msg in generalChatMessages" :key="msg.id">
                  <div v-if="msg.sender === 'TECH'" class="flex gap-3 max-w-[85%] self-start">
                    <div class="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#58b347] font-black text-[11px] shrink-0">E</div>
                    <div class="bg-white border border-slate-200/60 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                      <div class="text-[10px] font-black text-[#58b347] mb-1.5 uppercase tracking-wider">Konsultant EKOEN</div>
                      <p class="text-[13px] font-medium text-slate-700 leading-relaxed">{{ msg.text }}</p>
                      <div class="text-[10px] font-bold text-slate-400 mt-2">{{ msg.time }}</div>
                    </div>
                  </div>
                  <div v-else class="max-w-[85%] self-end">
                    <div class="bg-slate-800 text-white rounded-2xl rounded-tr-sm p-4 shadow-md">
                      <p class="text-[13px] font-medium leading-relaxed">{{ msg.text }}</p>
                      <div class="text-[10px] font-bold text-slate-400 mt-2 text-right">{{ msg.time }}</div>
                    </div>
                  </div>
                </template>
             </div>
             
             <div class="p-4 bg-white border-t border-slate-100 shrink-0 pb-safe">
               <div class="flex gap-2 items-end bg-slate-50 border border-slate-200 p-1.5 rounded-2xl focus-within:border-[#58b347] transition-colors">
                 <textarea v-model="newGeneralMessage" @keydown.enter.prevent="sendGeneralMessage" rows="1" class="flex-1 bg-transparent px-3 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none resize-none max-h-24 custom-scrollbar" placeholder="Wpisz swoje pytanie..."></textarea>
                 <button @click="sendGeneralMessage" :disabled="!newGeneralMessage.trim()" class="w-10 h-10 shrink-0 bg-[#58b347] text-white rounded-xl flex items-center justify-center hover:bg-[#499b3a] shadow-sm disabled:opacity-50 transition-all">
                    <svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                 </button>
               </div>
             </div>
          </div>

          <!-- ZAWARTOŚĆ: SZCZEGÓŁY ZGŁOSZENIA -->
          <div v-if="activeModal === 'TICKET_DETAILS' && selectedTicket" class="flex-1 flex flex-col bg-slate-50 overflow-hidden">
            <div class="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar space-y-6">
              
              <!-- Info Header -->
              <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status Zgłoszenia</div>
                  <div class="inline-flex px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border"
                       :class="selectedTicket.status === 'RESOLVED' ? 'bg-slate-50 text-slate-500 border-slate-200' : (selectedTicket.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200')">
                    {{ selectedTicket.status === 'RESOLVED' ? 'Zamknięte' : (selectedTicket.status === 'IN_PROGRESS' ? 'W trakcie realizacji (Technik w drodze)' : 'Przyjęte / Oczekujące') }}
                  </div>
                </div>
                <div class="sm:text-right">
                  <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Zgłoszone dnia</div>
                  <div class="text-sm font-bold text-slate-700">{{ selectedTicket.date }}</div>
                </div>
              </div>

              <!-- Problem -->
              <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-3">Zgłoszony Problem</h4>
                <div class="text-base font-black text-slate-800 mb-2">{{ selectedTicket.title }}</div>
                <div class="text-[13px] font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{{ selectedTicket.description }}</div>
              </div>

              <!-- Timeline / Updates -->
              <div class="px-2">
                <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Historia Aktualizacji</h4>
                <div class="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  
                  <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div class="flex items-center justify-center w-4 h-4 rounded-full border-4 border-white bg-slate-200 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm shrink-0"></div>
                    <div class="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-[10px] font-black text-slate-800 uppercase tracking-widest">Utworzono</span>
                        <span class="text-[9px] font-bold text-slate-400">{{ selectedTicket.date }}</span>
                      </div>
                      <p class="text-xs text-slate-500 font-medium">Zgłoszenie pomyślnie zarejestrowane w systemie.</p>
                    </div>
                  </div>

                  <div v-if="selectedTicket.status === 'IN_PROGRESS' || selectedTicket.status === 'RESOLVED'" class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div class="flex items-center justify-center w-4 h-4 rounded-full border-4 border-white bg-amber-400 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm shrink-0"></div>
                    <div class="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-[10px] font-black text-amber-600 uppercase tracking-widest">W realizacji</span>
                      </div>
                      <p class="text-xs text-slate-500 font-medium">Technik przyjął zadanie. Jest w drodze na stację.</p>
                    </div>
                  </div>

                  <div v-if="selectedTicket.status === 'RESOLVED'" class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div class="flex items-center justify-center w-4 h-4 rounded-full border-4 border-white bg-[#58b347] md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm shrink-0"></div>
                    <div class="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-[10px] font-black text-[#58b347] uppercase tracking-widest">Zakończono</span>
                      </div>
                      <p class="text-xs text-slate-500 font-medium">Usterka usunięta, stacja przywrócona do działania.</p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

const emit = defineEmits(['logout'])

const detectedQp = ref('')
const activeModal = ref(null) // null, 'FORM', 'CHAT', 'TICKET_DETAILS'

// --- KATEGORIE I IKONY SVG ---
const categories = [
  { 
    id: 'AWARIA', 
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`, 
    label: 'Awaria', sub: 'Zgłoś usterkę' 
  },
  { 
    id: 'URUCHOMIENIE', 
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>`, 
    label: 'Start', sub: 'Uruchomienie' 
  },
  { 
    id: 'PRZEGLAD', 
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>`, 
    label: 'Przegląd', sub: 'Okresowy' 
  },
  { 
    id: 'JAKOSC', 
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>`, 
    label: 'Jakość', sub: 'Uwagi' 
  },
  { 
    id: 'OFERTA', 
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`, 
    label: 'Oferta', sub: 'Zapytanie' 
  }
]

const form = ref({ category: '', qp: '', evse: 'ALL', contact_name: '', contact_phone: '', contact_email: '', title: '', description: '', files: [] })
const selectedCategoryData = computed(() => categories.find(c => c.id === form.value.category))

// Rozbudowane mock-dane historii
const historyList = ref([
  { id: '4120', qp: 'QP-10288', title: 'Wyrwany kabel przy lewym złączu', description: 'Zgłaszam uszkodzenie wtyczki, przewody są na wierzchu. Złącze CCS numer 1.', status: 'IN_PROGRESS', date: 'Dziś, 14:30' },
  { id: '3911', qp: 'QP-10294', title: 'Brak autoryzacji karty flotowej', description: 'Stacja wyświetla komunikat o błędzie odczytu RFID. Restart nie pomógł.', status: 'RESOLVED', date: '12 Paź 2026' },
  { id: '3805', qp: 'QP-11200', title: 'Pęknięty ekran', description: 'Ekran stacji jest rozbity i nie da się niczego odczytać w słońcu.', status: 'NEW', date: '05 Paź 2026' },
  { id: '3499', qp: 'QP-09921', title: 'Przerwanie ładowania po 5 min', description: 'Auto ładuje się poprawnie przez kilka minut, po czym stacja zrzuca zasilanie i kończy sesję.', status: 'RESOLVED', date: '18 Wrz 2026' }
])

const activeTicket = computed(() => historyList.value.find(t => t.status === 'IN_PROGRESS'))
const selectedTicket = ref(null)

const modalTitle = computed(() => {
  if (activeModal.value === 'FORM') return 'Utwórz Zgłoszenie'
  if (activeModal.value === 'CHAT') return 'Centrum Wsparcia'
  if (activeModal.value === 'TICKET_DETAILS') return 'Szczegóły'
  return ''
})

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const qpParam = urlParams.get('qp')
  if (qpParam) {
    detectedQp.value = qpParam.toUpperCase()
    form.value.qp = detectedQp.value
  }
})

// --- LOGIKA MODALI ---
const openModal = (type, data = null) => {
  if (type === 'FORM' && data) form.value.category = data
  if (type === 'TICKET_DETAILS' && data) selectedTicket.value = data
  activeModal.value = type
  
  if (type === 'CHAT') setTimeout(scrollToBottomChat, 100)
}

const closeModal = () => {
  activeModal.value = null
  setTimeout(() => {
    selectedTicket.value = null
  }, 400) // Czyścimy po zakończeniu animacji wyjścia (Vue Transition załatwia resztę)
}

// --- LOGIKA FORMULARZA ---
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => form.value.files.push({ file: file, preview: e.target.result })
    reader.readAsDataURL(file)
  }
  event.target.value = ''
}

const removeFile = (idx) => form.value.files.splice(idx, 1)

const submitTicket = () => {
  alert('Wysłano profesjonalne zgłoszenie do centrali EKOEN!')
  form.value.title = ''
  form.value.description = ''
  form.value.files = []
  closeModal()
}

// --- LOGIKA SZYBKIEGO CZATU ---
const generalChatMessages = ref([
  { id: 1, sender: 'USER', text: 'Dzień dobry, czy stacja na MOP Sosnowiec jest już czynna?', time: '08:15' },
  { id: 2, sender: 'TECH', text: 'Dzień dobry! Sprawdzam w systemie... Tak, oba złącza CCS są w pełni operacyjne od wczoraj od 18:00.', time: '08:17' },
  { id: 3, sender: 'USER', text: 'Super, dziękuję za informację.', time: '08:18' }
])
const newGeneralMessage = ref('')
const chatContainer = ref(null)

const scrollToBottomChat = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendGeneralMessage = async () => {
  if (!newGeneralMessage.value.trim()) return
  
  const now = new Date()
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')

  generalChatMessages.value.push({ id: Date.now(), sender: 'USER', text: newGeneralMessage.value.trim(), time: timeStr })
  newGeneralMessage.value = ''
  
  await nextTick()
  scrollToBottomChat()
  
  setTimeout(async () => {
    generalChatMessages.value.push({ id: Date.now() + 1, sender: 'TECH', text: 'Zrozumiałem. Dyspozytor zaraz udzieli pełnej odpowiedzi.', time: timeStr })
    await nextTick()
    scrollToBottomChat()
  }, 1200)
}
</script>

<style scoped>
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 16px); }

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.5); }

/* Bazowe animacje strony głównej */
.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
.animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

/* ==================================================== */
/* ZAAWANSOWANE ANIMACJE MODALI (Vue Transition)        */
/* ==================================================== */

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-bg,
.modal-leave-active .modal-bg {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-bg,
.modal-leave-to .modal-bg {
  opacity: 0;
}

.modal-enter-from .modal-content {
  transform: translateY(40px) scale(0.97);
  opacity: 0;
}

.modal-leave-to .modal-content {
  transform: translateY(20px) scale(0.98);
  opacity: 0;
}
</style>