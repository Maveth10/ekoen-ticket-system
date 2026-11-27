<template>
  <div v-if="show" class="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn" @click.self="closeModal">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-slideUp flex flex-col max-h-[92vh]">
      
      <!-- NAGŁÓWEK -->
      <div class="px-7 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 gap-3">
        <div class="flex items-center gap-2.5 min-w-0 flex-wrap">
          <svg class="w-5 h-5 text-[#58b347] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <h3 class="text-sm font-extrabold text-slate-800 uppercase tracking-widest">
            {{ isEditingMode ? 'Edycja Zdarzenia' : 'Kreator Zdarzenia' }}
          </h3>
          <span
            v-if="activeData.ticket_id"
            class="text-[10px] font-black font-mono px-2 py-0.5 rounded-md border transition-all"
            :class="isFieldHighlighted('ticket_id')
              ? 'bg-sky-100 text-sky-800 border-sky-400 ring-2 ring-sky-300'
              : 'bg-[#f0f7f1] text-[#58b347] border-[#58b347]/30'"
          >
            #{{ activeData.ticket_id }}
          </span>
          <span
            v-if="isHoveringPaste && pastePreviewState"
            class="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-sky-500 text-white shadow-sm animate-pulse"
          >
            Podgląd schowka
          </span>
        </div>
        <button type="button" @click="closeModal" class="text-slate-400 hover:text-slate-700 transition-colors p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- CIAŁO FORMULARZA -->
      <form @submit.prevent="handleSubmit" class="p-7 space-y-5 bg-slate-50/50 overflow-y-auto schedule-custom-scrollbar flex-1">
        
        <!-- WYBÓR TYPU ZDARZENIA -->
        <div
          class="grid grid-cols-3 gap-3 rounded-2xl transition-all duration-150"
          :class="isFieldHighlighted('event_type') ? 'ring-2 ring-sky-400 ring-offset-2 bg-sky-50/40' : ''"
        >
          <label class="cursor-pointer">
            <input
              type="radio"
              name="schedule_event_type"
              value="service"
              :checked="activeData.event_type === 'service'"
              @change="handleEventTypeChange('service')"
              class="peer sr-only"
            />
            <div class="py-3 px-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 peer-checked:border-sky-500 peer-checked:bg-sky-50/70 peer-checked:text-sky-700 border-slate-200 bg-white text-slate-400 hover:border-slate-300 shadow-sm">
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              <span class="text-[10px] font-black uppercase tracking-wider truncate">Wizyta Serwisowa</span>
            </div>
          </label>

          <label class="cursor-pointer">
            <input
              type="radio"
              name="schedule_event_type"
              value="task"
              :checked="activeData.event_type === 'task'"
              @change="handleEventTypeChange('task')"
              class="peer sr-only"
            />
            <div class="py-3 px-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 peer-checked:border-[#58b347] peer-checked:bg-[#58b347]/5 peer-checked:text-[#58b347] border-slate-200 bg-white text-slate-400 hover:border-slate-300 shadow-sm">
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>
              <span class="text-[10px] font-black uppercase tracking-wider truncate">Zadanie Operacyjne</span>
            </div>
          </label>

          <label class="cursor-pointer">
            <input
              type="radio"
              name="schedule_event_type"
              value="absence"
              :checked="activeData.event_type === 'absence'"
              @change="handleEventTypeChange('absence')"
              class="peer sr-only"
            />
            <div class="py-3 px-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 peer-checked:border-red-400 peer-checked:bg-red-50 peer-checked:text-red-500 border-slate-200 bg-white text-slate-400 hover:border-slate-300 shadow-sm">
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="2" y1="2" x2="22" y2="22" stroke-width="2.5"/></svg>
              <span class="text-[10px] font-black uppercase tracking-wider truncate">Nieobecność</span>
            </div>
          </label>
        </div>

        <!-- AUTOUZUPEŁNIANIE PO QP / ID ZLECENIA -->
        <div v-if="activeData.event_type !== 'absence'" class="relative">
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Powiąż ze zgłoszeniem lub stacją (Autouzupełnianie QP / ID)
            </label>
            <button
              v-if="activeData.ticket_id"
              type="button"
              @click="unlinkTicket"
              class="text-[9px] font-black uppercase tracking-wider text-red-500 hover:text-red-700 cursor-pointer"
            >
              Odepnij #{{ activeData.ticket_id }} ✕
            </button>
          </div>

          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input
              type="text"
              v-model="qpSearchQuery"
              @focus="isQpDropdownOpen = true"
              placeholder="Wpisz numer QP, ID zlecenia, miasto lub klienta (np. QP-20536, 584, Gdańsk)..."
              class="w-full h-[42px] pl-10 pr-8 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm"
            />
            <button
              v-if="qpSearchQuery"
              type="button"
              @click="qpSearchQuery = ''; isQpDropdownOpen = false"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-black"
            >
              ✕
            </button>
          </div>

          <div v-if="isQpDropdownOpen && qpAutocompleteResults.length > 0" class="fixed inset-0 z-[2010]" @click="isQpDropdownOpen = false"></div>

          <div
            v-if="isQpDropdownOpen && qpAutocompleteResults.length > 0"
            class="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[2025] max-h-60 overflow-y-auto schedule-custom-scrollbar divide-y divide-slate-100"
          >
            <div
              v-for="item in qpAutocompleteResults"
              :key="item.key"
              @click="applyAutocompleteItem(item, !item.isClosed)"
              class="px-3.5 py-2.5 hover:bg-[#f0f7f1]/70 cursor-pointer flex items-center justify-between gap-3 transition-colors"
            >
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span v-if="item.qp" class="text-[11px] font-black font-mono text-[#58b347]">{{ item.qp }}</span>
                  <span v-if="item.code" class="text-[10px] font-bold font-mono text-slate-500">#{{ item.code }}</span>
                  <span
                    class="text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded border"
                    :class="item.isClosed ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-800 border-amber-200'"
                  >
                    {{ item.isClosed ? 'Archiwalne' : item.status }}
                  </span>
                </div>
                <span class="text-xs font-bold text-slate-800 truncate mt-0.5">{{ item.title }}</span>
                <span v-if="item.address" class="text-[10px] text-slate-400 truncate">{{ item.address }}</span>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  v-if="item.isClosed"
                  type="button"
                  @click.stop="applyAutocompleteItem(item, false)"
                  class="px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 cursor-pointer"
                  title="Wypełnij tylko dane stacji QP bez podpinania zamkniętego zgłoszenia"
                >
                  Tylko stacja
                </button>
                <button
                  type="button"
                  @click.stop="applyAutocompleteItem(item, true)"
                  class="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-[#58b347] hover:bg-[#499b3a] text-white cursor-pointer"
                >
                  Podepnij
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-5">
          <!-- PRZYPISANIE DO TECHNIKA -->
          <div class="flex flex-col col-span-2 sm:col-span-1 relative">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Przypisz do Technika</label>
            
            <div class="relative w-full">
              <div 
                @click="isTechDropdownOpen = !isTechDropdownOpen"
                class="w-full h-[46px] px-4 rounded-xl text-[13px] font-bold flex items-center justify-between cursor-pointer transition-all shadow-sm border"
                :class="[
                  isFieldHighlighted('technician_id')
                    ? 'border-sky-400 bg-sky-50/70 text-sky-900 ring-2 ring-sky-300'
                    : isTechDropdownOpen
                      ? 'bg-white border-[#58b347] text-[#58b347]'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                ]"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span v-if="selectedTechColor" class="w-2.5 h-2.5 rounded-full shrink-0" :style="`background-color: ${selectedTechColor};`"></span>
                  <span class="truncate">{{ selectedTechName }}</span>
                </div>
                <svg class="w-4 h-4 shrink-0 transition-transform duration-200" :class="isTechDropdownOpen ? 'rotate-180 text-[#58b347]' : 'text-slate-400'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
              </div>

              <div v-if="isTechDropdownOpen" class="fixed inset-0 z-[2010]" @click="isTechDropdownOpen = false"></div>

              <transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
                <div v-if="isTechDropdownOpen" class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-[2020] overflow-hidden max-h-[240px] overflow-y-auto schedule-custom-scrollbar">
                  <div 
                    v-for="tech in store.techList" 
                    :key="tech.id"
                    @click="selectTech(tech)"
                    class="px-3.5 py-2.5 text-[12px] font-bold border-b border-slate-100 last:border-b-0 transition-colors flex items-center justify-between gap-2"
                    :class="[
                      isTechAbsent(tech.id, tech.name) && form.event_type !== 'absence'
                        ? 'text-slate-400 bg-slate-50 italic cursor-not-allowed' 
                        : form.technician_id === tech.id 
                          ? 'bg-[#f2fcf2] text-[#58b347] cursor-pointer' 
                          : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                    ]"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="`background-color: ${tech.zone_color || tech.color || '#cbd5e1'};`"></span>
                      <span class="truncate">{{ tech.name }}</span>
                    </div>
                    <span
                      class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 not-italic"
                      :class="getTechDayBadge(tech).cls"
                    >
                      {{ getTechDayBadge(tech).label }}
                    </span>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- PODKATEGORIA -->
          <div class="flex flex-col col-span-2 sm:col-span-1">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Kategoria</label>
            <select
              :value="activeData.event_subtype"
              @change="form.event_subtype = $event.target.value"
              required
              class="w-full h-[46px] px-4 border rounded-xl text-[13px] font-bold focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm cursor-pointer"
              :class="isFieldHighlighted('event_subtype')
                ? 'border-sky-400 bg-sky-50/70 text-sky-900 ring-2 ring-sky-300'
                : 'border-slate-200 bg-white text-slate-800'"
            >
              <template v-if="activeData.event_type === 'service'">
                <option value="Awaria">Awaria / Naprawa</option>
                <option value="Przegląd">Przegląd okresowy</option>
                <option value="Diagnostyka">Diagnostyka / Testy</option>
                <option value="Modernizacja">Modernizacja / Retrofit</option>
                <option value="Uruchomienie">Uruchomienie</option>
                <option value="Inne">Inna wizyta serwisowa</option>
                <option v-if="isCustomSubtype" :value="activeData.event_subtype">{{ activeData.event_subtype }}</option>
              </template>
              <template v-else-if="activeData.event_type === 'task'">
                <option value="Szkolenie">Szkolenie / Uprawnienia</option>
                <option value="Delegacja">Delegacja długa</option>
                <option value="Warsztat">Prace warsztatowe / Magazyn</option>
                <option value="Auto">Wymiana opon / Serwis Auta</option>
                <option value="Biuro">Praca biurowa</option>
                <option value="Inne">Inne zadanie</option>
                <option v-if="isCustomSubtype" :value="activeData.event_subtype">{{ activeData.event_subtype }}</option>
              </template>
              <template v-else-if="activeData.event_type === 'absence'">
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
          <input
            :value="activeData.title"
            @input="form.title = $event.target.value"
            required
            placeholder="Np. QP-20536 • Gdańsk • Wymiana kabla CCS..."
            class="w-full h-[46px] px-4 border rounded-xl text-[14px] font-bold focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm"
            :class="isFieldHighlighted('title')
              ? 'border-sky-400 bg-sky-50/70 text-sky-900 ring-2 ring-sky-300'
              : 'border-slate-200 bg-white text-slate-800'"
          />
        </div>

        <div class="flex flex-col">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Dodatkowe Notatki / Adres (Opcjonalnie)</label>
          <textarea
            :value="activeData.description"
            @input="form.description = $event.target.value"
            rows="2"
            placeholder="Adres stacji, zakres prac lub uwagi dla serwisanta..."
            class="w-full p-3.5 border rounded-xl text-[13px] font-medium focus:outline-none focus:border-[#58b347] focus:ring-1 focus:ring-[#58b347]/30 transition-all shadow-sm resize-none schedule-custom-scrollbar"
            :class="isFieldHighlighted('description')
              ? 'border-sky-400 bg-sky-50/70 text-sky-900 ring-2 ring-sky-300'
              : 'border-slate-200 bg-white text-slate-600'"
          ></textarea>
        </div>

        <!-- CZAS TRWANIA + SZYBKIE PRZESUWANIE DATY -->
        <div
          ref="timeSectionRef"
          class="bg-white border rounded-2xl p-5 shadow-sm space-y-4 transition-all duration-200"
          :class="showSameTimeWarning
            ? 'border-amber-400 ring-2 ring-amber-300/70 bg-amber-50/20'
            : 'border-slate-200'"
        >
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">Ramy Czasowe</span>
            <label class="flex items-center gap-2 cursor-pointer group">
              <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-700 transition-colors">Całodniowe / Wiele dni</span>
              <div class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  :checked="activeData.is_all_day"
                  @change="handleAllDayChange($event.target.checked)"
                  class="sr-only peer"
                >
                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#58b347]"></div>
              </div>
            </label>
          </div>

          <!-- Ostrzeżenie o tym samym czasie przy próbie zapisu kopii -->
          <div
            v-if="showSameTimeWarning && isSameTimeAsOriginal"
            class="px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center justify-between gap-3 animate-fadeIn"
          >
            <span>Wybierz inny dzień lub godzinę rozpoczęcia niż oryginał (np. kliknij <strong>+1d →</strong>), aby zapisać kopię bez przykrywania wpisu — albo użyj <strong>Do schowka</strong>.</span>
            <button type="button" @click="showSameTimeWarning = false" class="text-amber-500 hover:text-amber-800 font-black cursor-pointer shrink-0">✕</button>
          </div>

          <!-- Pasek szybkiego przesuwania terminu i czasu trwania -->
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <div class="flex items-center gap-1">
              <button type="button" @click="shiftDates(-7)" class="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer" title="Cofnij o tydzień">-1 tydz.</button>
              <button type="button" @click="shiftDates(-1)" class="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer" title="Cofnij o 1 dzień">← -1d</button>
              <button type="button" @click="moveToToday" class="px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#f0f7f1] hover:bg-[#dceddb] text-[#499b3a] border border-[#58b347]/20 transition-colors cursor-pointer">Dziś</button>
              <button type="button" @click="shiftDates(1)" class="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer" title="Przesuń o 1 dzień">+1d →</button>
              <button type="button" @click="shiftDates(7)" class="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer" title="Przesuń o tydzień">+1 tydz.</button>
            </div>

            <div v-if="!activeData.is_all_day" class="flex items-center gap-1">
              <span class="text-[9px] font-black uppercase tracking-wider text-slate-400 mr-0.5">Czas:</span>
              <button type="button" @click="applyDurationHours(1)" class="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer">1h</button>
              <button type="button" @click="applyDurationHours(2)" class="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer">2h</button>
              <button type="button" @click="applyDurationHours(4)" class="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer">4h</button>
              <button type="button" @click="applyFullShiftHours" class="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer" title="Ustaw godziny 08:00 - 16:00">08–16</button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="flex flex-col">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Początek</label>
              <input
                :type="activeData.is_all_day ? 'date' : 'datetime-local'"
                :value="activeData.start_time"
                @input="onStartTimeInput($event.target.value)"
                required
                class="w-full h-[42px] px-3 border-b-2 text-[12px] font-bold focus:outline-none focus:border-[#58b347] transition-all rounded-t-lg"
                :class="isFieldHighlighted('start_time')
                  ? 'border-sky-400 bg-sky-50 text-sky-900 ring-2 ring-sky-300'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'"
              />
            </div>
            <div class="flex flex-col">
              <label class="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Zakończenie</label>
              <input
                :type="activeData.is_all_day ? 'date' : 'datetime-local'"
                :value="activeData.end_time"
                @input="form.end_time = $event.target.value"
                class="w-full h-[42px] px-3 border-b-2 text-[12px] font-bold focus:outline-none focus:border-[#58b347] transition-all rounded-t-lg"
                :class="isFieldHighlighted('end_time')
                  ? 'border-sky-400 bg-sky-50 text-sky-900 ring-2 ring-sky-300'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'"
              />
            </div>
          </div>
        </div>

      </form>
      
      <!-- STOPKA -->
      <div class="px-7 py-5 border-t border-slate-100 bg-white flex items-center gap-2.5 shrink-0 rounded-b-3xl">
        <button type="button" @click="closeModal" class="px-5 border border-slate-200 bg-white text-slate-700 font-bold py-3.5 rounded-xl text-[12px] hover:bg-slate-50 transition-colors shadow-sm cursor-pointer shrink-0">
          Anuluj
        </button>

        <!-- ŚRODKOWY SLOT W TRYBIE EDYCJI: Schowek + Zapisz kopię (wymaga innego czasu) -->
        <template v-if="isEditingMode">
          <button
            type="button"
            @click="handleCopyToClipboard"
            class="px-3.5 py-3.5 rounded-xl text-[12px] font-extrabold border transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            :class="copiedFeedback
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 text-slate-700 hover:text-sky-700'"
            title="Skopiuj dane zdarzenia do schowka, zamknij okno i wklej w nowym terminie"
          >
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
            <span>{{ copiedFeedback ? 'Skopiowano ✓' : 'Do schowka' }}</span>
          </button>

          <button
            type="button"
            @click="handleSaveAsCopy"
            class="flex-1 py-3.5 px-3 rounded-xl text-[12px] font-extrabold border transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            :class="isSameTimeAsOriginal
              ? 'border-slate-200 bg-slate-100 text-slate-400 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700'
              : 'border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100'"
            :title="isSameTimeAsOriginal
              ? 'Najpierw wybierz inną datę lub godzinę rozpoczęcia niż oryginał (np. +1d)'
              : 'Utwórz nową wizytę w wybranym wyżej terminie bez nadpisywania oryginału'"
          >
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span class="truncate">Zapisz kopię</span>
          </button>
        </template>

        <!-- ŚRODKOWY SLOT W KREATORZE NOWEGO WPISU: Wklej ze schowka (z podglądem na hover!) -->
        <div
          v-else-if="clipboardEvent"
          class="flex-1 flex items-stretch gap-1 min-w-0"
        >
          <button
            type="button"
            @mouseenter="isHoveringPaste = true"
            @mouseleave="isHoveringPaste = false"
            @click="handlePasteFromClipboard"
            class="flex-1 py-3.5 px-3 rounded-xl text-[12px] font-extrabold border transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer min-w-0"
            :class="pastedFeedback
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-700 hover:border-sky-400'"
            title="Najedź kursorem, aby podejrzeć dane • Kliknij, aby wkleić do formularza"
          >
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
            <span class="truncate">
              {{ pastedFeedback ? 'Wklejono ✓' : `Wklej: ${clipboardShortLabel}` }}
            </span>
          </button>
          <button
            type="button"
            @click="clearClipboard"
            class="px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-500 text-xs font-black transition-colors cursor-pointer shrink-0"
            title="Wyczyść schowek"
          >
            ✕
          </button>
        </div>

        <button type="button" @click="handleSubmit" class="flex-1 bg-[#58b347] text-white font-bold py-3.5 px-4 rounded-xl text-[12px] hover:bg-[#499b3a] transition-colors shadow-sm shadow-[#58b347]/20 flex items-center justify-center gap-2 cursor-pointer">
          <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
          <span class="truncate">{{ isEditingMode ? 'Zapisz zmiany' : 'Zapisz Zdarzenie' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useScheduleStore } from '../stores/useScheduleStore'

// Współdzielony schowek wizyt (przetrwa zamknięcie modala i zmianę zakładek w sesji)
const CLIPBOARD_STORAGE_KEY = 'ekoen_schedule_event_clipboard_v1'
const loadStoredClipboard = () => {
  try {
    const raw = sessionStorage.getItem(CLIPBOARD_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_) {
    return null
  }
}
const sharedClipboardEvent = ref(loadStoredClipboard())

const props = defineProps({
  show: { type: Boolean, default: false },
  initialData: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['close', 'save'])
const store = useScheduleStore()

const SERVICE_SUBTYPES = ['Awaria', 'Przegląd', 'Diagnostyka', 'Modernizacja', 'Uruchomienie', 'Inne']
const TASK_SUBTYPES = ['Szkolenie', 'Delegacja', 'Warsztat', 'Auto', 'Biuro', 'Inne']
const ABSENCE_SUBTYPES = ['L4', 'Urlop', 'Na zadanie', 'Opieka', 'Bezpłatny']

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

const originalStartNormalized = ref('')
const showSameTimeWarning = ref(false)
const timeSectionRef = ref(null)

const isHoveringPaste = ref(false)
const copiedFeedback = ref(false)
const pastedFeedback = ref(false)

const qpSearchQuery = ref('')
const isQpDropdownOpen = ref(false)
const isTechDropdownOpen = ref(false)

const clipboardEvent = computed(() => sharedClipboardEvent.value)

const clipboardShortLabel = computed(() => {
  const c = clipboardEvent.value
  if (!c) return ''
  const qpMatch = String(c.title || '').match(/QP-\d+/i)
  if (qpMatch) return qpMatch[0].toUpperCase()
  if (c.ticket_id) return `#${c.ticket_id}`
  return String(c.title || c.event_subtype || 'Wpis').substring(0, 18)
})

const isEditingMode = computed(() => {
  if (props.initialData?.isEditing) return true
  const rawId = props.initialData?.id
  if (!rawId) return false
  return (store.events || []).some(e => String(e.id) === String(rawId))
})

const handleKeydown = (e) => {
  if (props.show && e.key === 'Escape') closeModal()
}
onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

// --- BEZPIECZNE FORMATOWANIE DAT LOKALNYCH ---
const parseLocalDate = (raw) => {
  if (!raw) return null
  const str = String(raw).trim().replace(/^(\d{4}-\d{2}-\d{2})\s+/, '$1T')
  const d = new Date(str)
  if (!isNaN(d.getTime())) return d
  const pl = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/)
  if (pl) return new Date(Number(pl[3]), Number(pl[2]) - 1, Number(pl[1]), 8, 0, 0)
  return null
}

const formatLocalInput = (d, isAllDay) => {
  if (!d || isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  if (isAllDay) return `${yyyy}-${mm}-${dd}`
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

const toInputFormat = (isoString, isAllDay) => {
  const d = parseLocalDate(isoString)
  return d ? formatLocalInput(d, isAllDay) : ''
}

const fromInputFormat = (inputString, isAllDay, isEnd = false) => {
  if (!inputString) return ''
  const clean = String(inputString).trim().replace(' ', 'T')
  if (isAllDay) {
    const dayPart = clean.substring(0, 10)
    return isEnd ? `${dayPart}T23:59:59` : `${dayPart}T00:00:00`
  }
  if (clean.length === 16) return clean + ':00'
  return clean
}

const currentStartNormalized = computed(() =>
  fromInputFormat(form.value.start_time, form.value.is_all_day, false)
)

const isSameTimeAsOriginal = computed(() =>
  isEditingMode.value &&
  Boolean(originalStartNormalized.value) &&
  currentStartNormalized.value === originalStartNormalized.value
)

watch(currentStartNormalized, (nowStr) => {
  if (nowStr !== originalStartNormalized.value) {
    showSameTimeWarning.value = false
  }
})

// --- SPRAWDZANIE NIEOBECNOŚCI NA WSKAZANY DZIEŃ ---
const checkTechAbsentOnDay = (techId, techName, targetDateStr) => {
  if (!targetDateStr) return false
  return (store.events || []).some(ev => {
    if (isEditingMode.value && String(ev.id) === String(form.value.id)) return false
    const isAbsence = ev.event_type === 'absence' || ev.extendedProps?.event_type === 'absence'
    if (!isAbsence) return false

    const startStr = String(ev.start_time || '').replace(' ', 'T').substring(0, 10)
    const endStr = ev.end_time ? String(ev.end_time).replace(' ', 'T').substring(0, 10) : startStr
    if (targetDateStr < startStr || targetDateStr > endStr) return false

    const absTech = ev.technician_id || ev.extendedProps?.technicianName || ''
    return (techId && absTech === techId) || (techName && absTech === techName)
  })
}

// --- SCHOWEK I PODGLĄD WKLEJANIA NA HOVER ---
const pastePreviewState = computed(() => {
  const clip = clipboardEvent.value
  if (!clip || isEditingMode.value) return null

  const baseStart = parseLocalDate(form.value.start_time) || new Date()
  const targetDayStr = formatLocalInput(baseStart, true)

  let previewStart = ''
  let previewEnd = ''

  if (clip.is_all_day) {
    previewStart = targetDayStr
    const endObj = new Date(
      baseStart.getFullYear(),
      baseStart.getMonth(),
      baseStart.getDate() + (clip.allDaySpanDays || 0)
    )
    previewEnd = formatLocalInput(endObj, true)
  } else {
    // Jeśli obecny formularz był w trybie samej daty (bez godziny), użyj godziny z oryginału
    const hasTimeInForm = String(form.value.start_time || '').includes('T')
    const startObj = hasTimeInForm
      ? baseStart
      : new Date(
          baseStart.getFullYear(),
          baseStart.getMonth(),
          baseStart.getDate(),
          clip.originHour ?? 8,
          clip.originMinute ?? 0
        )
    const durMs = clip.durationMs || 2 * 3600000
    previewStart = formatLocalInput(startObj, false)
    previewEnd = formatLocalInput(new Date(startObj.getTime() + durMs), false)
  }

  // Zachowaj wybranego technika z widoku (jeśli już ustawiony i obecny), w przeciwnym razie weź technika ze schowka
  let targetTechId = form.value.technician_id || clip.technician_id || ''
  if (targetTechId && clip.event_type !== 'absence') {
    const techObj = (store.techList || []).find(t => t.id === targetTechId || t.name === targetTechId)
    if (techObj && checkTechAbsentOnDay(techObj.id, techObj.name, targetDayStr)) {
      targetTechId = ''
    }
  }

  return {
    ...form.value,
    ticket_id: clip.ticket_id || null,
    technician_id: targetTechId,
    title: clip.title || '',
    description: clip.description || '',
    event_type: clip.event_type || 'service',
    event_subtype: clip.event_subtype || 'Awaria',
    is_all_day: Boolean(clip.is_all_day),
    start_time: previewStart,
    end_time: previewEnd
  }
})

// Aktywne dane pokazywane w polach (podgląd schowka podczas hovera lub faktyczny formularz)
const activeData = computed(() => {
  if (isHoveringPaste.value && pastePreviewState.value) {
    return pastePreviewState.value
  }
  return form.value
})

const isFieldHighlighted = (field) => {
  if (!isHoveringPaste.value || !pastePreviewState.value) return false
  const previewVal = String(pastePreviewState.value[field] ?? '')
  const currentVal = String(form.value[field] ?? '')
  if (['title', 'description', 'ticket_id', 'technician_id'].includes(field)) {
    return Boolean(previewVal) && (previewVal !== currentVal || field === 'title')
  }
  return previewVal !== currentVal
}

const isCustomSubtype = computed(() => {
  const cur = activeData.value.event_subtype
  if (!cur) return false
  if (activeData.value.event_type === 'service') return !SERVICE_SUBTYPES.includes(cur)
  if (activeData.value.event_type === 'task') return !TASK_SUBTYPES.includes(cur)
  return false
})

const handleCopyToClipboard = () => {
  const s = parseLocalDate(form.value.start_time)
  const e = parseLocalDate(form.value.end_time)

  let durationMs = 2 * 3600000
  let allDaySpanDays = 0

  if (form.value.is_all_day && s && e && e.getTime() >= s.getTime()) {
    allDaySpanDays = Math.round((e.getTime() - s.getTime()) / 86400000)
  } else if (!form.value.is_all_day && s && e && e.getTime() > s.getTime()) {
    durationMs = e.getTime() - s.getTime()
  }

  const clipPayload = {
    ticket_id: form.value.ticket_id || null,
    technician_id: form.value.technician_id || '',
    title: form.value.title || '',
    description: form.value.description || '',
    event_type: form.value.event_type || 'service',
    event_subtype: form.value.event_subtype || 'Awaria',
    is_all_day: Boolean(form.value.is_all_day),
    durationMs,
    allDaySpanDays,
    originHour: s ? s.getHours() : 8,
    originMinute: s ? s.getMinutes() : 0
  }

  sharedClipboardEvent.value = clipPayload
  try {
    sessionStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(clipPayload))
  } catch (_) {}

  copiedFeedback.value = true
  setTimeout(() => {
    copiedFeedback.value = false
    closeModal()
  }, 260)
}

const handlePasteFromClipboard = () => {
  if (!pastePreviewState.value) return
  form.value = { ...pastePreviewState.value }
  isHoveringPaste.value = false
  pastedFeedback.value = true
  setTimeout(() => {
    pastedFeedback.value = false
  }, 1400)
}

const clearClipboard = () => {
  isHoveringPaste.value = false
  sharedClipboardEvent.value = null
  try {
    sessionStorage.removeItem(CLIPBOARD_STORAGE_KEY)
  } catch (_) {}
}

// --- ZMIANA TYPU ZDARZENIA I TRYBU CAŁODNIOWEGO ---
const handleEventTypeChange = (newType) => {
  form.value.event_type = newType
  if (newType === 'absence') {
    if (!ABSENCE_SUBTYPES.includes(form.value.event_subtype)) {
      form.value.event_subtype = 'Urlop'
    }
    form.value.ticket_id = null
    handleAllDayChange(true)
  } else if (newType === 'task') {
    if (ABSENCE_SUBTYPES.includes(form.value.event_subtype) || SERVICE_SUBTYPES.includes(form.value.event_subtype)) {
      if (form.value.event_subtype !== 'Inne') form.value.event_subtype = 'Warsztat'
    }
  } else if (newType === 'service') {
    if (ABSENCE_SUBTYPES.includes(form.value.event_subtype) || TASK_SUBTYPES.includes(form.value.event_subtype)) {
      if (form.value.event_subtype !== 'Inne') form.value.event_subtype = 'Awaria'
    }
  }
}

const handleAllDayChange = (isAllDayNow) => {
  form.value.is_all_day = isAllDayNow
  if (form.value.start_time) {
    const s = parseLocalDate(form.value.start_time)
    if (s && !isAllDayNow && !String(form.value.start_time).includes('T')) {
      s.setHours(8, 0, 0, 0)
    }
    form.value.start_time = s ? formatLocalInput(s, isAllDayNow) : ''
  }
  if (form.value.end_time) {
    const e = parseLocalDate(form.value.end_time)
    if (e && !isAllDayNow && !String(form.value.end_time).includes('T')) {
      e.setHours(10, 0, 0, 0)
    }
    form.value.end_time = e ? formatLocalInput(e, isAllDayNow) : ''
  }
}

const onStartTimeInput = (newStartStr) => {
  const prevStart = parseLocalDate(form.value.start_time)
  const prevEnd = parseLocalDate(form.value.end_time)
  const nextStart = parseLocalDate(newStartStr)

  form.value.start_time = newStartStr

  // Zachowaj długość wizyty przy ręcznej zmianie daty/godziny rozpoczęcia
  if (prevStart && prevEnd && nextStart && prevEnd.getTime() >= prevStart.getTime()) {
    const diffMs = prevEnd.getTime() - prevStart.getTime()
    form.value.end_time = formatLocalInput(new Date(nextStart.getTime() + diffMs), form.value.is_all_day)
  }
}

// --- SZYBKIE PRZESUWANIE TERMINU I CZASU TRWANIA ---
const shiftDates = (daysDelta) => {
  const s = parseLocalDate(form.value.start_time) || new Date()
  const e = parseLocalDate(form.value.end_time)
  s.setDate(s.getDate() + daysDelta)
  form.value.start_time = formatLocalInput(s, form.value.is_all_day)
  if (e) {
    e.setDate(e.getDate() + daysDelta)
    form.value.end_time = formatLocalInput(e, form.value.is_all_day)
  }
}

const moveToToday = () => {
  const now = new Date()
  const s = parseLocalDate(form.value.start_time) || new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0)
  const e = parseLocalDate(form.value.end_time)
  const durationMs = (e && e.getTime() >= s.getTime()) ? (e.getTime() - s.getTime()) : (2 * 3600000)

  const nextStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), s.getHours(), s.getMinutes())
  const nextEnd = new Date(nextStart.getTime() + durationMs)

  form.value.start_time = formatLocalInput(nextStart, form.value.is_all_day)
  form.value.end_time = formatLocalInput(nextEnd, form.value.is_all_day)
}

const applyDurationHours = (hours) => {
  const s = parseLocalDate(form.value.start_time) || new Date()
  if (!form.value.start_time) form.value.start_time = formatLocalInput(s, false)
  const nextEnd = new Date(s.getTime() + hours * 3600000)
  form.value.end_time = formatLocalInput(nextEnd, false)
}

const applyFullShiftHours = () => {
  const base = parseLocalDate(form.value.start_time) || new Date()
  const s = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 8, 0)
  const e = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 16, 0)
  form.value.start_time = formatLocalInput(s, false)
  form.value.end_time = formatLocalInput(e, false)
}

// --- AUTOUZUPEŁNIANIE PO QP / ID ZGŁOSZENIA ---
const qpAutocompleteResults = computed(() => {
  const q = qpSearchQuery.value.toLowerCase().trim()
  if (!q) return []

  const matches = (store.tickets || []).filter(t => {
    const hay = `${t.t_qp || ''} ${t.t_code || ''} ${t.t_id || ''} ${t.t_title || ''} ${t.t_address || ''} ${t.t_client || ''}`.toLowerCase()
    return hay.includes(q)
  })

  matches.sort((a, b) => Number(Boolean(a.t_is_closed)) - Number(Boolean(b.t_is_closed)))

  return matches.slice(0, 15).map(t => ({
    key: String(t.t_id || t.t_code),
    qp: t.t_qp || '',
    code: t.ticket_code || t.t_code || t.t_id || '',
    title: t.t_title || 'Zgłoszenie',
    desc: t.t_desc || '',
    address: t.t_address && t.t_address !== 'Brak lokalizacji' ? t.t_address : '',
    category: t.t_category || '',
    status: t.t_status && t.t_status !== 'BRAK STATUSU ZLECENIA' ? t.t_status : 'Otwarte',
    isClosed: Boolean(t.t_is_closed),
    techId: t.actualTechId || t.technician_id || ''
  }))
})

const applyAutocompleteItem = (item, linkTicket = true) => {
  form.value.event_type = 'service'
  form.value.ticket_id = linkTicket && item.code ? String(item.code) : null

  const catLow = String(item.category || '').toLowerCase()
  if (catLow.includes('przegl') || catLow.includes('mainten')) form.value.event_subtype = 'Przegląd'
  else if (catLow.includes('modern') || catLow.includes('retro')) form.value.event_subtype = 'Modernizacja'
  else if (catLow.includes('diagn')) form.value.event_subtype = 'Diagnostyka'
  else form.value.event_subtype = 'Awaria'

  if (linkTicket) {
    const hasQpInTitle = item.qp && String(item.title || '').toUpperCase().includes(item.qp.toUpperCase())
    form.value.title = hasQpInTitle ? item.title : [item.qp, item.title].filter(Boolean).join(' • ')
    form.value.description = [item.address, item.desc].filter(Boolean).join('\n')
  } else {
    form.value.title = [item.qp, item.address || item.title].filter(Boolean).join(' • ')
    form.value.description = item.address || ''
  }

  if (!form.value.technician_id && item.techId) {
    const techObj = (store.techList || []).find(
      x => x.id === item.techId || String(x.name || '').toLowerCase() === String(item.techId).toLowerCase()
    )
    if (techObj && !isTechAbsent(techObj.id, techObj.name)) {
      form.value.technician_id = techObj.id
    }
  }

  qpSearchQuery.value = ''
  isQpDropdownOpen.value = false
}

const unlinkTicket = () => {
  form.value.ticket_id = null
}

// --- NIEOBECNOŚCI I OBŁOŻENIE TECHNIKÓW W WYBRANYM DNIU ---
const selectedDayStr = computed(() => {
  if (!activeData.value.start_time) return ''
  return String(activeData.value.start_time).replace(' ', 'T').substring(0, 10)
})

const isTechAbsent = (techId, techName) => {
  return checkTechAbsentOnDay(techId, techName, selectedDayStr.value)
}

const getTechDayBadge = (tech) => {
  if (isTechAbsent(tech.id, tech.name)) {
    return { label: 'Urlop / L4', cls: 'bg-red-50 text-red-600 border-red-200' }
  }
  const dayStr = selectedDayStr.value
  if (!dayStr) return { label: 'Wolny', cls: 'bg-slate-50 text-slate-400 border-slate-200' }

  const dayEvents = (store.events || []).filter(ev => {
    if (isEditingMode.value && String(ev.id) === String(form.value.id)) return false
    const evType = ev.event_type || ev.extendedProps?.event_type
    if (evType === 'absence') return false
    const evDay = String(ev.start_time || '').replace(' ', 'T').substring(0, 10)
    if (evDay !== dayStr) return false
    return ev.technician_id === tech.id || ev.technician_id === tech.name || ev.extendedProps?.technicianName === tech.name
  })

  if (dayEvents.length === 0) {
    return { label: 'Wolny', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  }
  return {
    label: `${dayEvents.length} wiz. w tym dniu`,
    cls: dayEvents.length >= 2 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-sky-50 text-sky-700 border-sky-200'
  }
}

const selectedTechObj = computed(() => {
  const curTech = activeData.value.technician_id
  if (!curTech) return null
  const raw = String(curTech).toLowerCase().trim()
  return (store.techList || []).find(
    t => String(t.id || '').toLowerCase().trim() === raw || String(t.name || '').toLowerCase().trim() === raw
  ) || null
})

const selectedTechName = computed(() => {
  const curTech = activeData.value.technician_id
  if (!curTech) return '-- Wybierz technika --'
  return selectedTechObj.value ? selectedTechObj.value.name : String(curTech)
})

const selectedTechColor = computed(() => {
  return selectedTechObj.value ? (selectedTechObj.value.zone_color || selectedTechObj.value.color || '#cbd5e1') : ''
})

const selectTech = (tech) => {
  if (form.value.event_type !== 'absence' && isTechAbsent(tech.id, tech.name)) return
  form.value.technician_id = tech.id
  isTechDropdownOpen.value = false
}

// --- INICJALIZACJA DANYCH PRZY OTWARCIU MODALA ---
watch(() => props.show, (newVal) => {
  if (newVal && props.initialData) {
    qpSearchQuery.value = ''
    isQpDropdownOpen.value = false
    isTechDropdownOpen.value = false
    isHoveringPaste.value = false
    copiedFeedback.value = false
    pastedFeedback.value = false
    showSameTimeWarning.value = false

    const isAllDayVal = props.initialData.is_all_day === true || props.initialData.all_day === 'TAK'
    const rawType = props.initialData.event_type
    const evType = ['service', 'task', 'absence'].includes(rawType)
      ? rawType
      : (props.initialData.ticket_id ? 'service' : 'task')

    let defaultSub = 'Warsztat'
    if (evType === 'service') defaultSub = 'Awaria'
    else if (evType === 'absence') defaultSub = 'L4'

    const rawTech = String(props.initialData.technician_id || '').trim()
    const matchedTech = rawTech
      ? (store.techList || []).find(t => t.id === rawTech || String(t.name || '').toLowerCase() === rawTech.toLowerCase())
      : null

    const startFormatted = toInputFormat(props.initialData.start_time, isAllDayVal)
    let endFormatted = toInputFormat(props.initialData.end_time, isAllDayVal)

    if (!endFormatted && startFormatted) {
      if (isAllDayVal) {
        endFormatted = startFormatted
      } else {
        const sDate = parseLocalDate(startFormatted)
        if (sDate) endFormatted = formatLocalInput(new Date(sDate.getTime() + 2 * 3600000), false)
      }
    }

    form.value = {
      id: props.initialData.id || `temp_${Date.now()}`,
      ticket_id: props.initialData.ticket_id || null,
      technician_id: matchedTech ? matchedTech.id : rawTech,
      title: props.initialData.title || '',
      description: props.initialData.description || '',
      event_type: evType,
      event_subtype: props.initialData.event_subtype || defaultSub,
      is_all_day: isAllDayVal,
      start_time: startFormatted,
      end_time: endFormatted
    }

    originalStartNormalized.value = fromInputFormat(startFormatted, isAllDayVal, false)
  } else if (!newVal) {
    isHoveringPaste.value = false
  }
})

const closeModal = () => {
  isHoveringPaste.value = false
  emit('close')
}

const buildSavePayload = (forceNewId = false) => {
  const startIso = fromInputFormat(form.value.start_time, form.value.is_all_day, false)
  const endIso = form.value.end_time
    ? fromInputFormat(form.value.end_time, form.value.is_all_day, true)
    : startIso

  return {
    ...form.value,
    id: forceNewId ? `temp_${Date.now()}_${Math.floor(Math.random() * 100)}` : form.value.id,
    title: form.value.title.trim() || (form.value.event_type === 'absence' ? form.value.event_subtype : 'Wizyta serwisowa'),
    start_time: startIso,
    end_time: endIso,
    all_day: form.value.is_all_day ? 'TAK' : 'NIE'
  }
}

const handleSubmit = () => {
  if (!form.value.start_time) {
    alert('Proszę podać przynajmniej datę/czas rozpoczęcia.')
    return
  }
  if (!form.value.technician_id) {
    alert('Proszę wybrać technika.')
    return
  }
  emit('save', buildSavePayload(false))
}

const handleSaveAsCopy = () => {
  if (!form.value.start_time) {
    alert('Proszę podać przynajmniej datę/czas rozpoczęcia.')
    return
  }
  if (!form.value.technician_id) {
    alert('Proszę wybrać technika.')
    return
  }
  // Blokada tworzenia kopii dokładnie w tym samym terminie co oryginał
  if (isSameTimeAsOriginal.value) {
    showSameTimeWarning.value = true
    timeSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  emit('save', buildSavePayload(true))
}
</script>

<style scoped>
.schedule-custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.schedule-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.schedule-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }
.schedule-custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.8); }
</style>