<template>
  <Teleport to="body">
    <div
      v-if="show"
      @click.self="emit('close')"
      class="fixed inset-0 z-[2150] bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-2 md:p-4"
    >
      <div class="bg-[#f4f6f8] rounded-3xl shadow-2xl border border-slate-200 w-full h-full max-w-[1640px] max-h-[96vh] flex flex-col overflow-hidden">

        <!-- NAGŁÓWEK MODALA -->
        <div class="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
              :class="form.docType === 'INTERNAL' ? 'bg-[#58b347]' : 'bg-blue-600'"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-black uppercase tracking-widest truncate">
                  Generator Raportów i Protokołów PDF
                </h3>
                <span
                  class="px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider border"
                  :class="module === 'ekoen'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'"
                >
                  {{ module === 'ekoen' ? 'Zlecenie własne EKOEN' : 'Zlecenie producenta / Axon EEP' }}
                </span>
                <span v-if="form.ekoId" class="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                  Teczka: {{ form.ekoId }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 font-semibold truncate mt-0.5">
                Stacja: <span class="text-[#7ce368] font-mono font-bold">{{ form.qpNumber || '-' }}</span>
                • Zlecenie: <span class="text-white font-mono font-bold">{{ activeOrderRef || '-' }}</span>
                <span v-if="actionsEurSummary.totalEur > 0 && form.docType !== 'INTERNAL'" class="ml-2 text-amber-300">
                  • Czynności z cennika: <span class="font-mono font-black">{{ actionsEurSummary.totalEur.toFixed(2) }} €</span>
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >✕</button>
        </div>

        <!-- CIAŁO 2-KOLUMNOWE -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden min-h-0">

          <!-- LEWA KOLUMNA: FORMULARZ KREATORA + ROZLICZENIE -->
          <div class="lg:col-span-7 overflow-y-auto report-scrollbar space-y-4 pr-1" @click="closeAllAutocompletes">

            <!-- PRZEŁĄCZNIK KROKÓW: 1. DOKUMENT PDF vs 2. ROZLICZENIE WIZYTY -->
            <div class="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-2xs grid grid-cols-2 gap-1.5 sticky top-0 z-30">
              <button
                type="button"
                @click="activeCreatorStep = 'REPORT'"
                class="py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                :class="activeCreatorStep === 'REPORT' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'"
              >
                <span>1. Dokument / Raport PDF</span>
              </button>
              <button
                type="button"
                @click="activeCreatorStep = 'SETTLEMENT'"
                class="py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                :class="activeCreatorStep === 'SETTLEMENT' ? 'bg-[#58b347] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f0f7f1] hover:text-[#499b3a]'"
              >
                <span>2. Rozliczenie Zlecenia</span>
                <span
                  class="px-2 py-0.5 rounded-md text-[10px] font-mono font-black"
                  :class="activeCreatorStep === 'SETTLEMENT' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
                >
                  {{ settlementSavedDone ? '✓ Zapisano' : settlementPreviewBadge }}
                </span>
              </button>
            </div>

            <template v-if="activeCreatorStep === 'REPORT'">
            <!-- WYBÓR RODZAJU DOKUMENTU (6 SZABLONÓW DOCS) -->
            <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">Rodzaj dokumentu</span>
                <div class="flex items-center gap-1.5">
                  <input
                    v-model="orderSearchInput"
                    @keydown.enter.prevent="handleFetchOrder"
                    type="text"
                    placeholder="Nr zlecenia AC / EE_XXX / QP..."
                    class="h-8 w-52 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    :disabled="store.isFetchingOrder"
                    @click="handleFetchOrder"
                    class="h-8 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {{ store.isFetchingOrder ? 'Pobieranie...' : 'Pobierz z bazy' }}
                  </button>
                </div>
              </div>

              <div v-if="fetchStatusMsg" class="text-[11px] font-bold px-3 py-1.5 rounded-xl" :class="fetchStatusOk ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
                {{ fetchStatusMsg }}
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">
                <button
                  v-for="dt in DOC_TYPES"
                  :key="dt.id"
                  type="button"
                  @click="selectDocMode(dt.id)"
                  class="p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between"
                  :class="form.docType === dt.id
                    ? (dt.id === 'INTERNAL' ? 'border-[#58b347] bg-[#f0f7f1] shadow-xs' : 'border-blue-600 bg-blue-50/70 shadow-xs')
                    : 'border-slate-200 bg-white hover:border-slate-300'"
                >
                  <span class="text-[9.5px] font-black uppercase tracking-wider" :class="form.docType === dt.id ? (dt.id === 'INTERNAL' ? 'text-[#499b3a]' : 'text-blue-700') : 'text-slate-400'">
                    {{ dt.badge }}
                  </span>
                  <div class="text-xs font-black text-slate-800 leading-tight mt-1">{{ dt.title }}</div>
                  <div class="text-[10px] font-semibold text-slate-500 leading-tight mt-0.5">{{ dt.sub }}</div>
                </button>
              </div>
            </div>

            <!-- 1. DANE ZLECENIA, STACJI I PIN TECHNIKA -->
            <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div class="text-[11px] font-black uppercase tracking-widest text-slate-700 border-b border-slate-100 pb-2">
                1. Dane zlecenia, stacji i autoryzacja podpisu
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div v-if="form.docType === 'INTERNAL'" class="sm:col-span-4">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-[#499b3a] mb-1">Nr oferty OES / Zlecenia EKOEN *</label>
                  <input v-model="form.manualOrderId" type="text" placeholder="np. OES/045/2026 lub EE_012" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-black font-mono text-slate-800 focus:outline-none focus:border-[#58b347]" />
                </div>
                <div v-else class="sm:col-span-4">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Numer zlecenia (AC / EEP) *</label>
                  <input v-model="form.orderId" type="text" placeholder="np. 83420" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-black font-mono text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>

                <div class="sm:col-span-4">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Numer QP (seryjny) *</label>
                  <input v-model="form.qpNumber" type="text" placeholder="QP-..." class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-black font-mono text-[#499b3a] focus:outline-none focus:border-[#58b347]" />
                </div>

                <div class="sm:col-span-4">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Model stacji ładowania</label>
                  <input
                    v-model="form.stationModel"
                    @change="onStationModelChange"
                    type="text"
                    placeholder="np. Axon Easy 1.3"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div class="sm:col-span-4">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Klient</label>
                  <input v-model="form.client" type="text" placeholder="np. LIDL / EKOEN" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>
                <div class="sm:col-span-4">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Operator punktu</label>
                  <input v-model="form.operator" type="text" placeholder="np. EKOEN" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500" />
                </div>
                <div class="sm:col-span-4">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Lokalizacja stacji</label>
                  <input v-model="form.location" type="text" placeholder="Miasto, ulica" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <!-- Dodatkowe parametry protokołów 5.1 / 5.2 / 5.3 / 5.4 -->
              <div v-if="!isServiceMode" class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-sky-50/50 border border-sky-200/80">
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-sky-800 mb-1">Moc wyjściowa</label>
                  <input v-model="form.power" type="text" placeholder="np. 150 kW" class="w-full h-8 px-2.5 rounded-lg border border-sky-200 bg-white text-xs font-bold text-slate-800 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-sky-800 mb-1">Rok produkcji</label>
                  <input v-model="form.prodYear" type="text" placeholder="np. 2024" class="w-full h-8 px-2.5 rounded-lg border border-sky-200 bg-white text-xs font-bold text-slate-800 focus:outline-none" />
                </div>
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-sky-800 mb-1">Typ i liczba złączy</label>
                  <input v-model="form.connectors" type="text" placeholder="np. 2x CCS Combo 2" class="w-full h-8 px-2.5 rounded-lg border border-sky-200 bg-white text-xs font-bold text-slate-800 focus:outline-none" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div class="sm:col-span-5">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Technik w raporcie *</label>
                  <select
                    v-model="form.technician"
                    @change="onTechnicianChange"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Wybierz serwisanta --</option>
                    <option v-for="tName in mergedTechniciansList" :key="tName" :value="tName">{{ tName }}</option>
                  </select>
                </div>

                <div class="sm:col-span-3">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Data wizyty</label>
                  <input
                    v-model="form.date"
                    @change="syncDateToWorkTimes"
                    type="date"
                    class="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div v-if="isServiceMode" class="sm:col-span-4">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Typ wizyty</label>
                  <select v-model="form.visitType" class="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500">
                    <option value="Pierwsza wizyta">Pierwsza wizyta</option>
                    <option value="Dodatkowa planowana wizyta">Dodatkowa planowana wizyta</option>
                    <option value="Dodatkowa nieplanowana wizyta">Dodatkowa nieplanowana wizyta</option>
                  </select>
                </div>
                <div v-else class="sm:col-span-4">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Nr Certyfikatu AIST</label>
                  <input v-model="form.certNumber" type="text" readonly placeholder="Po wpisaniu PIN" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-600" />
                </div>
              </div>

              <!-- PASEK AUTORYZACJI PIN I UPRAWNIEŃ SEP / AIST -->
              <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 grid grid-cols-2 sm:grid-cols-12 gap-2.5 items-end">
                <div class="col-span-1 sm:col-span-3">
                  <label class="block text-[9.5px] font-black uppercase tracking-wider text-rose-600 mb-1">PIN technika (4 cyfry)</label>
                  <input
                    v-model="form.techPin"
                    @input="onPinInput"
                    type="password"
                    maxlength="4"
                    placeholder="••••"
                    class="w-full h-9 px-3 rounded-xl border border-slate-300 bg-white text-center font-black tracking-widest text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div class="col-span-1 sm:col-span-3">
                  <label class="block text-[9.5px] font-black uppercase tracking-wider text-slate-400 mb-1">SEP E (Eksploatacja)</label>
                  <input v-model="form.uprE" type="text" readonly placeholder="-" class="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-[11px] font-mono font-bold text-slate-700" />
                </div>
                <div class="col-span-1 sm:col-span-3">
                  <label class="block text-[9.5px] font-black uppercase tracking-wider text-slate-400 mb-1">SEP D (Dozór)</label>
                  <input v-model="form.uprD" type="text" readonly placeholder="-" class="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-[11px] font-mono font-bold text-slate-700" />
                </div>
                <div class="col-span-1 sm:col-span-3">
                  <div
                    class="h-9 px-2.5 rounded-xl border flex items-center justify-center text-[10.5px] font-black uppercase tracking-wider text-center"
                    :class="pinStatus === 'VALID'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : (pinStatus === 'INVALID' ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-white text-slate-400 border-slate-200')"
                  >
                    {{ pinStatusLabel }}
                  </div>
                </div>
              </div>

              <!-- Opis usterki + dane dla trybu INTERNAL -->
              <div v-if="isServiceMode" class="space-y-2.5">
                <div v-if="form.docType === 'INTERNAL'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Czas przyjęcia zgłoszenia</label>
                    <input v-model="form.reportTime" type="text" placeholder="RRRR-MM-DD GG:MM" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-700" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Dane autoryzacji wykonawcy</label>
                    <input v-model="form.contractorAuth" type="text" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700" />
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Opis usterki ze zlecenia</label>
                  <textarea v-model="form.description" rows="2" class="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 resize-none"></textarea>
                </div>

                <div v-if="form.docType === 'INTERNAL'">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-[#499b3a] mb-1">2. Diagnoza i wykonane czynności (Raport Wewnętrzny EKOEN)</label>
                  <textarea v-model="form.diagnosis" rows="3" placeholder="Szczegółowy opis diagnozy i prac serwisowych..." class="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/20 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#58b347] resize-none"></textarea>
                </div>
              </div>
            </div>

            <!-- ========================================================== -->
            <!-- WARIANT A: SEKCJE RAPORTU SERWISOWEGO (STANDARD / INTERNAL)-->
            <!-- ========================================================== -->
            <template v-if="isServiceMode">

              <!-- CZĘŚCI ZAMIENNE -->
              <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
                <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">Części zamienne</span>
                  <button type="button" @click="addPartRow()" class="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider cursor-pointer">
                    + Dodaj część
                  </button>
                </div>

                <div class="space-y-2">
                  <div v-for="(part, pIdx) in form.parts" :key="part.uid" class="grid grid-cols-12 gap-2 items-center relative" @click.stop>
                    <div :class="form.docType === 'INTERNAL' ? 'col-span-7' : 'col-span-5'" class="relative">
                      <input
                        v-model="part.name"
                        @focus="activePartUid = part.uid"
                        @input="activePartUid = part.uid"
                        type="text"
                        placeholder="Szukaj części z magazynu lub katalogu..."
                        class="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <div
                        v-if="activePartUid === part.uid && getPartSuggestions(part.name).length > 0"
                        class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 max-h-52 overflow-y-auto report-scrollbar divide-y divide-slate-100"
                      >
                        <div
                          v-for="(cand, cIdx) in getPartSuggestions(part.name)"
                          :key="cIdx"
                          @mousedown.prevent="applyPartSuggestion(part, cand)"
                          class="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center justify-between gap-2 text-xs"
                        >
                          <div class="min-w-0">
                            <div class="font-bold text-slate-800 truncate">{{ cand.name }}</div>
                            <div class="text-[10px] font-mono text-slate-500">Indeks: {{ cand.index || '-' }}</div>
                          </div>
                          <span
                            class="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase shrink-0 border"
                            :class="cand.source === 'MAGAZYN' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'"
                          >
                            {{ cand.source }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="col-span-2">
                      <input v-model="part.qty" type="number" min="1" step="any" placeholder="Ilość" class="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-black text-center text-slate-800" />
                    </div>

                    <div class="col-span-2">
                      <input v-model="part.index" type="text" placeholder="Indeks SKU" class="w-full h-8 px-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-[11px] font-mono font-bold text-slate-700" />
                    </div>

                    <div v-if="form.docType !== 'INTERNAL'" class="col-span-2">
                      <select v-model="part.type" class="w-full h-8 px-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-black text-slate-700">
                        <option value="MK1">MK1</option>
                        <option value="MD2">MD2</option>
                        <option value="MW3">MW3</option>
                        <option value="MP4">MP4</option>
                      </select>
                    </div>

                    <div class="col-span-1 text-right">
                      <button type="button" @click="removePartRow(pIdx)" class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black text-xs cursor-pointer">✕</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- WYKONANE DZIAŁANIA (CENNIKI EEP LUB WPIS RĘCZNY) -->
              <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
                <div class="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                  <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">3. Wykonane działania (do Raportu PDF)</span>
                  <div class="flex items-center gap-1.5">
                    <button
                      v-if="rawTicketDiagnosis && form.docType === 'STANDARD'"
                      type="button"
                      @click="importActionsFromDiagnosis"
                      class="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black uppercase cursor-pointer"
                    >
                      + Wstaw z diagnozy
                    </button>
                    <button type="button" @click="addActionRow()" class="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer">
                      + Dodaj działanie
                    </button>
                  </div>
                </div>

                <div class="space-y-2">
                  <div v-for="(act, aIdx) in form.actionRows" :key="act.uid" class="grid grid-cols-12 gap-2 items-center relative" @click.stop>
                    <div class="col-span-4">
                      <select
                        v-model="act.listKey"
                        @change="onActionListKeyChange(act)"
                        class="w-full h-8 px-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700"
                      >
                        <option v-for="plKey in availablePriceListKeys" :key="plKey" :value="plKey">{{ plKey }}</option>
                        <option value="MANUAL">Wpis ręczny</option>
                      </select>
                    </div>

                    <div class="col-span-6 relative">
                      <input
                        v-model="act.displayText"
                        @focus="act.listKey !== 'MANUAL' ? (activeActionUid = act.uid) : null"
                        @input="onActionTextInput(act)"
                        type="text"
                        :placeholder="act.listKey === 'MANUAL' ? 'Wpisz wykonaną czynność...' : 'Wybierz z cennika lub szukaj...'"
                        class="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <div
                        v-if="activeActionUid === act.uid && act.listKey !== 'MANUAL' && getActionSuggestions(act).length > 0"
                        class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 max-h-56 overflow-y-auto report-scrollbar divide-y divide-slate-100"
                      >
                        <div
                          v-for="(it, iIdx) in getActionSuggestions(act)"
                          :key="iIdx"
                          @mousedown.prevent="applyActionSuggestion(act, it)"
                          class="px-3 py-2 hover:bg-blue-50 cursor-pointer text-xs"
                        >
                          <div class="flex items-center justify-between gap-2">
                            <span class="font-mono font-black text-blue-700">{{ it.num }}.</span>
                            <span class="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-black text-[10px]">{{ it.price }} €</span>
                          </div>
                          <div class="font-semibold text-slate-800 mt-0.5">{{ it.name }}</div>
                        </div>
                      </div>
                    </div>

                    <div class="col-span-1">
                      <input v-model.number="act.qty" type="number" min="1" class="w-full h-8 px-1 rounded-lg border border-slate-200 bg-white text-xs font-black text-center text-slate-800" title="Ilość" />
                    </div>

                    <div class="col-span-1 text-right">
                      <button type="button" @click="removeActionRow(aIdx)" class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black text-xs cursor-pointer">✕</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CZAS PRACY ORAZ WNIOSKI KOŃCOWE -->
              <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">4. Czas pracy i status końcowy stacji</span>
                  <button type="button" @click="addWorkRow()" class="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider cursor-pointer">
                    + Dodaj czas pracy
                  </button>
                </div>

                <div class="space-y-1.5">
                  <div v-for="(wt, wIdx) in form.workTimes" :key="wt.uid" class="grid grid-cols-12 gap-2 items-center">
                    <input v-model="wt.name" type="text" placeholder="Serwisant" class="col-span-5 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800" />
                    <input v-model="wt.date" type="date" class="col-span-3 h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700" />
                    <input v-model="wt.start" type="time" class="col-span-2 h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center text-slate-800" />
                    <input v-model="wt.end" type="time" class="col-span-1 h-8 px-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center text-slate-800" />
                    <div class="col-span-1 text-right">
                      <button type="button" @click="removeWorkRow(wIdx)" class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black text-xs cursor-pointer">✕</button>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
                  <div class="sm:col-span-8">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Komentarze / Wnioski w PDF</label>
                    <textarea v-model="form.comments" rows="2" placeholder="Wnioski końcowe, zalecenia..." class="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 resize-none"></textarea>
                  </div>

                  <div v-if="form.docType !== 'INTERNAL'" class="sm:col-span-4">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Stacja przywrócona</label>
                    <div class="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        @click="form.restored = 'TAK'"
                        class="h-10 rounded-xl border font-black text-xs cursor-pointer transition-all"
                        :class="form.restored === 'TAK' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-slate-500 border-slate-200'"
                      >TAK</button>
                      <button
                        type="button"
                        @click="form.restored = 'NIE'"
                        class="h-10 rounded-xl border font-black text-xs cursor-pointer transition-all"
                        :class="form.restored === 'NIE' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-white text-slate-500 border-slate-200'"
                      >NIE</button>
                    </div>
                  </div>
                  <div v-else class="sm:col-span-4">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Przedstawiciel klienta</label>
                    <input v-model="form.clientSign" type="text" placeholder="Opcjonalnie imię i nazwisko" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700" />
                  </div>
                </div>
              </div>
            </template>

            <!-- ========================================================== -->
            <!-- WARIANT B: PROTOKÓŁ POMIAROWY ZAŁ. 5.3 (PE / RISO / RCD / SWZ)-->
            <!-- ========================================================== -->
            <ReportMeasurementsSection
              v-else-if="form.docType === 'POMIARY'"
              :measurements="measurements"
              @reset-defaults="resetMeasurementsToStandard"
            />

            <!-- ========================================================== -->
            <!-- WARIANT C: CHECKLISTY PROTOKOŁÓW 5.1, 5.2, 5.4             -->
            <!-- ========================================================== -->
            <div v-else-if="isChecklistMode" class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                <span class="text-[11px] font-black uppercase tracking-widest text-teal-800">
                  Lista kontrolna protokołu ({{ form.docType }})
                </span>
                <button
                  type="button"
                  @click="setAllChecklistValues('Pozytywny')"
                  class="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase cursor-pointer"
                >
                  ✓ Ustaw wszystkie: Pozytywny
                </button>
              </div>

              <div v-if="form.docType === 'PRZEGLAD'" class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Data poprzedniej inspekcji</label>
                  <input v-model="form.poDataPoprz" type="text" placeholder="np. 12.11.2025" class="w-full h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800" />
                </div>
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Liczba poprzednich inspekcji</label>
                  <input v-model="form.poLiczbaPoprz" type="text" placeholder="np. 1" class="w-full h-8 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800" />
                </div>
              </div>

              <div v-for="(sec, sIdx) in activeChecklistSections" :key="sIdx" class="space-y-2">
                <div class="px-3 py-1.5 rounded-lg bg-teal-50/80 border-l-4 border-teal-600 text-[11px] font-black text-teal-900 uppercase tracking-wide">
                  {{ sec.title }}
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div
                    v-for="item in sec.items"
                    :key="item.id"
                    class="p-2 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2"
                  >
                    <span class="text-[11px] font-semibold text-slate-700 leading-snug">{{ item.text }}</span>
                    <select
                      v-model="form.checklist[item.id]"
                      class="h-7 px-2 rounded-lg border border-slate-200 bg-white text-[10.5px] font-black shrink-0"
                      :class="form.checklist[item.id] === 'Negatywny' ? 'text-rose-600' : (form.checklist[item.id] === 'N/D' ? 'text-slate-400' : 'text-emerald-700')"
                    >
                      <option value="Pozytywny">Pozytywny</option>
                      <option value="Negatywny">Negatywny</option>
                      <option value="N/D">Nie dotyczy</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Uwagi do protokołu</label>
                <textarea v-model="form.comments" rows="2" placeholder="Brak uwag." class="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 resize-none"></textarea>
              </div>
            </div>

            <!-- DOKUMENTACJA FOTOGRAFICZNA (APARAT / GALERIA) -->
            <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div class="text-[11px] font-black uppercase tracking-widest text-slate-700 border-b border-slate-100 pb-2">
                Dokumentacja fotograficzna ({{ photos.length }})
              </div>

              <div class="grid grid-cols-2 gap-3">
                <label class="p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/40 text-center cursor-pointer transition-colors">
                  <span class="block text-xs font-black text-blue-700">Zrób zdjęcie aparatem</span>
                  <span class="block text-[10px] font-semibold text-slate-400 mt-0.5">Bezpośrednio ze smartfona</span>
                  <input type="file" class="hidden" accept="image/*" capture="environment" @change="onPhotosSelected" />
                </label>

                <label class="p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#58b347] bg-slate-50/60 hover:bg-[#f0f7f1]/50 text-center cursor-pointer transition-colors">
                  <span class="block text-xs font-black text-[#499b3a]">Wybierz z galerii / dysku</span>
                  <span class="block text-[10px] font-semibold text-slate-400 mt-0.5">Możesz zaznaczyć wiele zdjęć</span>
                  <input type="file" class="hidden" accept="image/*" multiple @change="onPhotosSelected" />
                </label>
              </div>

              <div v-if="photos.length > 0" class="space-y-2">
                <div v-for="(ph, phIdx) in photos" :key="ph.id" class="p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                  <img :src="ph.dataUrl" alt="" class="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0" />
                  <input
                    v-model="ph.caption"
                    type="text"
                    :placeholder="`Podpis pod zdjęciem ${phIdx + 1} (opcjonalnie)...`"
                    class="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                  <button type="button" @click="photos.splice(phIdx, 1)" class="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-black cursor-pointer">
                    Usuń
                  </button>
                </div>
              </div>
            </div>
            </template>

            <!-- ========================================================== -->
            <!-- KROK 2: ROZLICZENIE ZLECENIA DO sys_billings (EEP / EKOEN) -->
            <!-- ========================================================== -->
            <div v-else class="space-y-4">

              <!-- Przełącznik trybu EEP (EUR) vs EKOEN (PLN) + Historia rozliczeń -->
              <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div class="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
                  <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">Tryb rozliczenia w sys_billings</span>
                  <div class="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      @click="settlement.mode = 'EEP'"
                      class="px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      :class="settlement.mode === 'EEP' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'"
                    >
                      EEP / Producent (EUR)
                    </button>
                    <button
                      type="button"
                      @click="settlement.mode = 'EKOEN'"
                      class="px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      :class="settlement.mode === 'EKOEN' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'"
                    >
                      Własne EKOEN (PLN)
                    </button>
                  </div>
                </div>

                <!-- Historia wcześniejszych wizyt z sys_billings -->
                <div
                  v-if="orderSettlementHistory && orderSettlementHistory.found"
                  class="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1"
                >
                  <div class="flex items-center justify-between font-black text-amber-900">
                    <span>Wcześniejsze rozliczenie w bazie ({{ orderSettlementHistory.status }})</span>
                    <span v-if="orderSettlementHistory.totalEur > 0" class="font-mono text-emerald-700">{{ orderSettlementHistory.totalEur.toFixed(2) }} €</span>
                  </div>
                  <div class="text-[11px] text-amber-800 font-semibold">
                    Ostatnia wizyta: {{ orderSettlementHistory.lastDate }} • {{ orderSettlementHistory.technician }}
                  </div>
                  <div class="text-[10.5px] text-slate-600 whitespace-pre-line">{{ orderSettlementHistory.positions }}</div>
                  <div class="text-[10px] font-black uppercase text-amber-700 pt-0.5">
                    ✓ Nowy zapis dopisze się jako kolejna zakładka wizyty (bez nadpisywania poprzednich).
                  </div>
                </div>

                <!-- Wspólne pola: Data, Serwisant, Poziom zatwierdzenia -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Data realizacji</label>
                    <input v-model="form.date" type="date" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Serwisant realizujący</label>
                    <select v-model="form.technician" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-800">
                      <option value="">-- Wybierz serwisanta --</option>
                      <option v-for="tName in mergedTechniciansList" :key="tName" :value="tName">{{ tName }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Status bilingu</label>
                    <select
                      v-model="settlement.markAsFinalSettled"
                      :disabled="!canApproveBillingDirectly"
                      class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-800 disabled:opacity-75"
                    >
                      <option :value="false">Wstępnie rozliczone (Do weryfikacji)</option>
                      <option v-if="canApproveBillingDirectly" :value="true">Rozliczone (Zatwierdzone)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- WARIANT 1: ROZLICZENIE EEP (EUR) -->
              <div v-if="settlement.mode === 'EEP'" class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
                <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span class="text-[11px] font-black uppercase tracking-widest text-emerald-700">Kalkulator EEP (EUR) — Czynności, Dojazd i RBH</span>
                  <button
                    type="button"
                    @click="addActionRow()"
                    class="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase cursor-pointer"
                  >
                    + Dodaj czynność z cennika
                  </button>
                </div>

                <!-- Lista czynności cennikowych (współdzielona z raportem, dostępna także dla protokołów 5.1–5.4) -->
                <div class="space-y-2">
                  <div v-for="(act, aIdx) in form.actionRows" :key="act.uid" class="grid grid-cols-12 gap-2 items-center relative" @click.stop>
                    <div class="col-span-4">
                      <select v-model="act.listKey" @change="onActionListKeyChange(act)" class="w-full h-8 px-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700">
                        <option v-for="plKey in availablePriceListKeys" :key="plKey" :value="plKey">{{ plKey }}</option>
                        <option value="MANUAL">Wpis ręczny (0 €)</option>
                      </select>
                    </div>
                    <div class="col-span-5 relative">
                      <input
                        v-model="act.displayText"
                        @focus="act.listKey !== 'MANUAL' ? (activeActionUid = act.uid) : null"
                        @input="onActionTextInput(act)"
                        type="text"
                        placeholder="Wybierz pozycję cennikową..."
                        class="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800"
                      />
                      <div
                        v-if="activeActionUid === act.uid && act.listKey !== 'MANUAL' && getActionSuggestions(act).length > 0"
                        class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 max-h-52 overflow-y-auto report-scrollbar divide-y divide-slate-100"
                      >
                        <div
                          v-for="(it, iIdx) in getActionSuggestions(act)"
                          :key="iIdx"
                          @mousedown.prevent="applyActionSuggestion(act, it)"
                          class="px-3 py-2 hover:bg-emerald-50 cursor-pointer text-xs"
                        >
                          <div class="flex justify-between font-black">
                            <span class="font-mono text-blue-700">{{ it.num }}.</span>
                            <span class="font-mono text-emerald-700">{{ it.price }} €</span>
                          </div>
                          <div class="text-slate-700 font-semibold mt-0.5">{{ it.name }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-span-1">
                      <input v-model.number="act.qty" type="number" min="1" class="w-full h-8 px-1 rounded-lg border border-slate-200 bg-white text-xs font-black text-center" />
                    </div>
                    <div class="col-span-1 text-right font-mono font-black text-[11px] text-emerald-700">
                      {{ ((Number(act.itemPrice) || 0) * (Math.max(1, Number(act.qty) || 1))).toFixed(0) }}€
                    </div>
                    <div class="col-span-1 text-right">
                      <button type="button" @click="removeActionRow(aIdx)" class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black text-xs cursor-pointer">✕</button>
                    </div>
                  </div>
                </div>

                <!-- Dojazd + RBH + Dodatkowy koszt -->
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
                  <div class="sm:col-span-5">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Dojazd serwisowy</label>
                    <select v-model="settlement.travelType" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800">
                      <option value="FIXED_EEP">Ryczałt EEP (120 €)</option>
                      <option value="NONE">Brak dojazdu (0 €)</option>
                      <option value="MANUAL">Własna stawka ryczałtowa (€)</option>
                      <option value="KM">Kilometrówka (km × €/km)</option>
                    </select>
                  </div>

                  <div v-if="settlement.travelType === 'MANUAL'" class="sm:col-span-3">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Kwota dojazdu (€)</label>
                    <input v-model.number="settlement.manualTravelEur" type="number" step="1" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-black text-slate-800" />
                  </div>

                  <template v-else-if="settlement.travelType === 'KM'">
                    <div class="sm:col-span-2">
                      <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Kilometry</label>
                      <input v-model.number="settlement.travelKm" type="number" min="0" class="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-black text-slate-800" />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Stawka €/km</label>
                      <input v-model.number="settlement.travelRate" type="number" step="0.05" class="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-black text-slate-800" />
                    </div>
                  </template>

                  <div class="sm:col-span-2">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-blue-700 mb-1">Dodatkowe RBH</label>
                    <input v-model.number="settlement.rbhHours" type="number" min="0" step="0.5" class="w-full h-9 px-2.5 rounded-xl border border-blue-200 bg-blue-50/40 text-xs font-mono font-black text-slate-800" />
                  </div>

                  <div class="sm:col-span-2">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Stawka €/h</label>
                    <input v-model.number="settlement.rbhRate" type="number" min="0" step="5" class="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-700" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div class="sm:col-span-4">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-rose-600 mb-1">Dodatkowy koszt zlecenia (€)</label>
                    <input v-model.number="settlement.orderCostEur" type="number" min="0" step="0.01" placeholder="np. materiały" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800" />
                  </div>
                  <div class="sm:col-span-4">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Sprawność stacji</label>
                    <select v-model="settlement.stationStatus" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-800">
                      <option value="TAK">TAK — Naprawiona</option>
                      <option value="NIE">NIE — Niesprawna</option>
                      <option value="PRZEGLĄD">PRZEGLĄD</option>
                    </select>
                  </div>
                  <div class="sm:col-span-4 flex items-end pb-2">
                    <label class="flex items-center gap-2 text-xs font-black text-amber-700 cursor-pointer select-none">
                      <input type="checkbox" v-model="settlement.statusRevisit" class="rounded accent-amber-500" />
                      <span>Wymagana ponowna wizyta</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Komentarz / Zakres prac w rozliczeniu</label>
                  <textarea v-model="settlement.comment" rows="2" placeholder="Notatka do weryfikacji bilingowej..." class="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 resize-none"></textarea>
                </div>

                <!-- Podsumowanie EUR -->
                <div class="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between flex-wrap gap-2">
                  <div class="text-[11px] font-semibold text-slate-300 truncate max-w-md">
                    Pozycje: <span class="font-mono font-bold text-white">{{ eepPositionsSummaryText }}</span>
                  </div>
                  <div class="text-base font-black font-mono text-[#7ce368]">
                    RAZEM: {{ calculatedEepTotalEur.toFixed(2) }} €
                  </div>
                </div>
              </div>

              <!-- WARIANT 2: ROZLICZENIE WŁASNE EKOEN (PLN) -->
              <div v-else class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
                <div class="text-[11px] font-black uppercase tracking-widest text-sky-700 border-b border-slate-100 pb-2">
                  Rozliczenie własne EKOEN (PLN) — Oferta OES, Koszty i Logistyka
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div class="sm:col-span-5">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Numer oferty OES / Zlecenia *</label>
                    <input v-model="settlement.offerNumber" type="text" placeholder="np. OES/045/2026 lub EE_014" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-black font-mono text-slate-800" />
                  </div>
                  <div class="sm:col-span-4">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-1">Kwota do FV netto (PLN)</label>
                    <input v-model.number="settlement.totalPln" type="number" step="0.01" placeholder="0.00" class="w-full h-9 px-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-xs font-mono font-black text-emerald-800" />
                  </div>
                  <div class="sm:col-span-3">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Wystawiono FV</label>
                    <select v-model="settlement.invoiceIssued" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-800">
                      <option value="NIE">NIE</option>
                      <option value="TAK">TAK</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Zlecenie wew. bez FV (PLN)</label>
                    <input v-model.number="settlement.internalCostPln" type="number" step="0.01" placeholder="0.00" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-black uppercase tracking-wider text-rose-600 mb-1">Koszt roboczy zlecenia (PLN)</label>
                    <input v-model.number="settlement.laborCostPln" type="number" step="0.01" placeholder="0.00" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div class="sm:col-span-6">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Trasa przejazdu</label>
                    <input v-model="settlement.route" type="text" placeholder="np. Zielona Góra - Wrocław - ZG" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800" />
                  </div>
                  <div class="sm:col-span-3">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Liczba km</label>
                    <input v-model.number="settlement.km" type="number" min="0" placeholder="0" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800" />
                  </div>
                  <div class="sm:col-span-3">
                    <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Nocleg</label>
                    <select v-model="settlement.lodging" class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-800">
                      <option value="NIE">NIE</option>
                      <option value="TAK">TAK</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Komentarz rozliczeniowy EKOEN</label>
                  <textarea v-model="settlement.comment" rows="2" placeholder="Uwagi dla księgowości i koordynatora..." class="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 resize-none"></textarea>
                </div>
              </div>

              <!-- Samodzielny zapis samego rozliczenia -->
              <div class="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200">
                <div class="text-xs font-bold" :class="settlementStatusOk ? 'text-emerald-700' : 'text-rose-600'">
                  {{ settlementStatusMsg || 'Możesz zapisać samo rozliczenie tutaj lub jednym kliknięciem razem z PDF na dole.' }}
                </div>
                <button
                  type="button"
                  :disabled="store.isSavingSettlement"
                  @click="handleStandaloneSaveSettlement"
                  class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-wider shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {{ store.isSavingSettlement ? 'Zapisywanie...' : 'Zapisz samo rozliczenie' }}
                </button>
              </div>

            </div>

          </div>

          <!-- PRAWA KOLUMNA: PODGLĄD PDF NA ŻYWO -->
          <div class="lg:col-span-5 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden min-h-[380px]">
            <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50/70 shrink-0">
              <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">
                Weryfikacja dokumentu PDF
              </span>
              <button
                type="button"
                :disabled="store.isGeneratingPreview"
                @click="handleGeneratePreview"
                class="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {{ store.isGeneratingPreview ? 'Renderowanie Docs...' : 'Generuj podgląd PDF' }}
              </button>
            </div>

            <div class="flex-1 bg-slate-100/80 relative flex items-center justify-center overflow-hidden">
              <div v-if="store.isGeneratingPreview" class="text-center px-6 space-y-2 animate-pulse">
                <div class="text-xs font-black text-slate-600 uppercase tracking-wider">Wypełnianie szablonu Google Docs...</div>
                <div class="text-[11px] font-semibold text-slate-400">Wstawianie tabel, zdjęć i faksymili podpisu technika</div>
              </div>

              <iframe
                v-else-if="previewBase64"
                :src="`data:application/pdf;base64,${previewBase64}`"
                class="w-full h-full border-0"
              ></iframe>

              <div v-else-if="isDevPreviewReady" class="p-6 text-center space-y-2 max-w-sm">
                <div class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase inline-block">Tryb lokalny DEV</div>
                <p class="text-xs font-bold text-slate-700">Payload raportu ({{ form.docType }}) jest poprawny.</p>
                <p class="text-[11px] text-slate-500">Po wdrożeniu do Google Apps Script w tym oknie wyrenderuje się oficjalny PDF z szablonu Google Docs.</p>
              </div>

              <div v-else class="text-center px-8 py-6 max-w-sm space-y-2">
                <svg class="w-12 h-12 text-slate-300 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <div class="text-xs font-extrabold text-slate-500">Kliknij „Generuj podgląd PDF”</div>
                <p class="text-[11px] text-slate-400 leading-relaxed">
                  Podgląd powstaje bezpiecznie w pamięci bez zaśmiecania Teczki Sprawy. Dopiero zatwierdzenie odkłada oficjalny plik na Dysku Google i pobiera kopię.
                </p>
                <p v-if="previewError" class="text-[11px] font-bold text-rose-600 pt-1">{{ previewError }}</p>
              </div>
            </div>
          </div>

        </div>

        <!-- STOPKA AKCJI -->
        <div class="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <label class="flex items-center gap-2.5 text-xs font-extrabold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="alsoSaveSettlementOnCommit"
              :disabled="settlementSavedDone"
              class="w-4 h-4 rounded accent-[#58b347]"
            />
            <span>
              Zapisz jednocześnie rozliczenie wizyty w <span class="font-mono text-[#499b3a]">sys_billings</span>
              <span class="ml-1 px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-800">{{ settlementPreviewBadge }}</span>
            </span>
          </label>

          <div class="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              @click="emit('close')"
              class="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold cursor-pointer"
            >
              Anuluj
            </button>

            <button
              type="button"
              :disabled="store.isGeneratingPreview || store.isCommitting"
              @click="handleGeneratePreview"
              class="px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {{ previewBase64 ? 'Odśwież podgląd PDF' : '1. Generuj podgląd PDF' }}
            </button>

            <button
              type="button"
              :disabled="store.isCommitting || store.isGeneratingPreview || store.isSavingSettlement"
              @click="handleCommitAndSave"
              class="px-6 py-2.5 rounded-xl bg-[#58b347] hover:bg-[#499b3a] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-[#58b347]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6 9 17l-5-5"/></svg>
              <span>
                {{ store.isCommitting
                  ? 'Zapisywanie...'
                  : (alsoSaveSettlementOnCommit && !settlementSavedDone ? 'Zatwierdź PDF + Zapisz Rozliczenie' : 'Zatwierdź sam Raport PDF') }}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useReportsStore } from '../stores/useReportsStore'
import { useAuthStore } from '../stores/useAuthStore'
import ReportMeasurementsSection from './ReportMeasurementsSection.vue'

const DOC_TYPES = [
  { id: 'STANDARD', badge: 'EEP / Axon', title: 'Raport Serwisowy', sub: 'Gwarancyjny / Producent' },
  { id: 'INTERNAL', badge: 'Własny PLN', title: 'Wewn. EKOEN', sub: 'Komercyjny / Oferta OES' },
  { id: 'INSTALACJA', badge: 'Zał. 5.1', title: 'Instalacja', sub: 'Protokół montażu' },
  { id: 'URUCHOMIENIE', badge: 'Zał. 5.2', title: 'Uruchomienie', sub: 'Odbiór i testy DC' },
  { id: 'POMIARY', badge: 'Zał. 5.3', title: 'Pomiary', sub: 'PE / RISO / RCD / SWZ' },
  { id: 'PRZEGLAD', badge: 'Zał. 5.4', title: 'Przegląd', sub: 'Okresowy roczny' }
]

const CHECKLIST_DEFS = {
  PRZEGLAD: [
    {
      title: '1. Przygotowanie do badań kontrolnych i odbiorczych',
      items: [
        { id: 'PO_1_1', text: '1.1. Montaż urządzenia do podstawy (stacja stabilna)' },
        { id: 'PO_1_2', text: '1.2. Stan obudowy (brak pęknięć, korozji, zanieczyszczeń)' },
        { id: 'PO_1_3', text: '1.3. Zamki i uszczelki drzwi rewizyjnych' },
        { id: 'PO_1_4', text: '1.4. Tabliczki znamionowe (czytelność i kompletność)' },
        { id: 'PO_1_5', text: '1.5. Otwory wentylacyjne i czystość filtrów' },
        { id: 'PO_1_6', text: '1.6. Funkcjonalność komponentów mechanicznych i kabli' },
        { id: 'PO_1_7', text: '1.7. Sprawdzenie złączy ładowania i stanu pinów' }
      ]
    },
    {
      title: '2. Inspekcja instalacji elektrycznej urządzenia',
      items: [
        { id: 'PO_2_1', text: '2.1. Podłączenie do sieci (status, wartość)' },
        { id: 'PO_2_2', text: '2.2. Przewody ochronne PE (ciągłość i jakość)' },
        { id: 'PO_2_3', text: '2.3. Kable zasilające (stan izolacji, połączenia)' },
        { id: 'PO_2_4', text: '2.4. Urządzenia zabezpieczające i bezpieczniki' },
        { id: 'PO_2_5', text: '2.5. Obwód bezpieczeństwa (wyłącznik STOP, krańcówki)' },
        { id: 'PO_2_6', text: '2.6. Pomiary elektryczne instalacji' },
        { id: 'PO_2_7', text: '2.7. Dodatkowe pomiary magistrali CAN (60 Ω)' },
        { id: 'PO_2_8', text: '2.8. Pomiary przewodów ładowania (CCS, CHAdeMO, AC)' },
        { id: 'PO_2_9', text: '2.9. Pomiary termograficzne obwodów pod obciążeniem' },
        { id: 'PO_2_10', text: '2.10. Dostęp do Internetu (LAN / SIM / Wi-Fi)' }
      ]
    },
    {
      title: '3. Czynności konserwacyjne',
      items: [
        { id: 'PO_3_1', text: '3.1. System monitorowania (analiza błędów EOS z ostatniego m-ca)' },
        { id: 'PO_3_2', text: '3.2. Wersja oprogramowania / Aktualizacja firmware' },
        { id: 'PO_3_3', text: '3.3. Wymiana mat filtrów powietrza (wlot / wylot)' },
        { id: 'PO_3_4', text: '3.4. Wymiana / kontrola karty SD kontrolera CLC' },
        { id: 'PO_3_5', text: '3.5. Czyszczenie stacji (wewnątrz i na zewnątrz)' },
        { id: 'PO_3_6', text: '3.6. Wymiana komponentów eksploatacyjnych wg planu' }
      ]
    },
    {
      title: '4. Test operacyjny',
      items: [
        { id: 'PO_4_1', text: '4.1. Sprawdzenie procesu ładowania pojazdem EV / testerem' },
        { id: 'PO_4_2', text: '4.2. Wentylatory modułów mocy pod obciążeniem' },
        { id: 'PO_4_3', text: '4.3. Poprawność sygnalizacji świetlnej LED' },
        { id: 'PO_4_4', text: '4.4. Weryfikacja prawidłowego zakończenia ładowania (przycisk STOP)' }
      ]
    }
  ],
  URUCHOMIENIE: [
    {
      title: '1. Przygotowanie do kontroli i testów odbiorowych',
      items: [
        { id: 'URUCH_1_1', text: '1.1. Montaż urządzenia do podłoża (stabilność)' },
        { id: 'URUCH_1_2', text: '1.2. Stan obudowy (brak uszkodzeń)' },
        { id: 'URUCH_1_3', text: '1.3. Zamki i uszczelki drzwi rewizyjnych' },
        { id: 'URUCH_1_4', text: '1.4. Tabliczki znamionowe i zasilanie' },
        { id: 'URUCH_1_5', text: '1.5. Drożność otworów wentylacyjnych i filtry' },
        { id: 'URUCH_1_6', text: '1.6. Funkcjonalność komponentów mechanicznych' },
        { id: 'URUCH_1_7', text: '1.7. Sprawdzenie złączy i pinów ładowania' }
      ]
    },
    {
      title: '2. Inspekcja instalacji elektrycznej urządzenia',
      items: [
        { id: 'URUCH_2_1', text: '2.1. Podłączenie do sieci (stałe/tymczasowe, licznik OSD)' },
        { id: 'URUCH_2_2', text: '2.2. Przewody ochronne PE (ciągłość, przekrój)' },
        { id: 'URUCH_2_3', text: '2.3. Kable zasilające i jakość połączeń' },
        { id: 'URUCH_2_4', text: '2.4. Urządzenia zabezpieczające w stacji i w źródle' },
        { id: 'URUCH_2_5', text: '2.5. Obwód bezpieczeństwa i wyłącznik STOP' },
        { id: 'URUCH_2_6', text: '2.6. Pomiary elektryczne odbiorcze' },
        { id: 'URUCH_2_7', text: '2.7. Dostawa Internetu (LAN / SIM / Wi-Fi)' }
      ]
    },
    {
      title: '3. Test operacyjny',
      items: [
        { id: 'URUCH_3_1', text: '3.1. Test procesu ładowania z pojazdem EV / testerem DC' },
        { id: 'URUCH_3_2', text: '3.2. Praca modułów mocy i wentylatorów' },
        { id: 'URUCH_3_3', text: '3.3. Prawidłowe zatrzymanie procesu ładowania' }
      ]
    },
    {
      title: '4. Testy łączności i konfiguracji',
      items: [
        { id: 'URUCH_4_1', text: '4.1. Widoczność stacji online w systemie EOS / Backendzie' },
        { id: 'URUCH_4_2', text: '4.2. Wersja oprogramowania / Aktualizacja firmware' },
        { id: 'URUCH_4_3', text: '4.3. Konfiguracja routera LAN / GSM' },
        { id: 'URUCH_4_4', text: '4.4. Test i konfiguracja terminala płatniczego' },
        { id: 'URUCH_4_5', text: '4.5. Inicjacja ładowania (RFID / App / Karta)' },
        { id: 'URUCH_4_6', text: '4.6. Specjalne ustawienia i limit mocy klienta' }
      ]
    }
  ],
  INSTALACJA: [
    {
      title: '1. Przygotowanie do kontroli i testów odbiorowych',
      items: [
        { id: 'INST_1_1', text: '1.1. Montaż urządzenia do podstawy stabilny' },
        { id: 'INST_1_2', text: '1.2. Stan obudowy (brak pęknięć, korozji, zanieczyszczeń)' },
        { id: 'INST_1_3', text: '1.3. Funkcjonalne zamki i uszczelki drzwi' },
        { id: 'INST_1_4', text: '1.4. Tabliczki znamionowe i parametry' },
        { id: 'INST_1_5', text: '1.5. Otwory wentylacyjne i czyste filtry' },
        { id: 'INST_1_6', text: '1.6. Komponenty mechaniczne (klamki, śruby, stan kabli)' },
        { id: 'INST_1_7', text: '1.7. Sprawdzenie złączy ładowania i stanu pinów' }
      ]
    },
    {
      title: '2. Kontrola instalacji elektrycznej urządzenia',
      items: [
        { id: 'INST_2_1', text: '2.1. Podłączenie do sieci (stan, licznik OSD)' },
        { id: 'INST_2_2', text: '2.2. Przewody ochronne PE (ciągłość, przekrój)' },
        { id: 'INST_2_3', text: '2.3. Kable zasilające (stan izolacji, połączenia)' },
        { id: 'INST_2_4', text: '2.4. Urządzenia zabezpieczające w stacji i źródle' },
        { id: 'INST_2_5', text: '2.5. Obwód bezpieczeństwa (wyłącznik STOP, krańcówki)' },
        { id: 'INST_2_6', text: '2.6. Pomiary elektryczne odbiorcze' },
        { id: 'INST_2_7', text: '2.7. Połączenie internetowe (LAN / SIM / Wi-Fi)' }
      ]
    },
    {
      title: '3. Test działania',
      items: [
        { id: 'INST_3_1', text: '3.1. Sprawdzenie procesu ładowania EV / testerem' },
        { id: 'INST_3_2', text: '3.2. Praca modułów mocy i wentylatorów' },
        { id: 'INST_3_3', text: '3.3. Prawidłowe zakończenie procesu ładowania' }
      ]
    }
  ]
}

const buildDefaultMeasurements = () => ({
  gridSystem: 'TN-C-S',
  gridVoltage: '230/400 V',
  meterName: '',
  meterSerial: '',
  meterCert: '',
  meterName2: '',
  meterSerial2: '',
  meterCert2: '',
  notesPE: 'Brak uwag. Wynik pozytywny.',
  notesRISO: 'Brak uwag. Wynik pozytywny.',
  notesRCD: 'Brak uwag. Wynik pozytywny.',
  notesSWZ: 'Brak uwag. Wynik pozytywny.',
  peRows: [
    { p1: 'Główna szyna PE', p2: 'PE złącze DC1 (CCS A)', val: '<1Ω Nieprzerwany' },
    { p1: 'Główna szyna PE', p2: 'PE złącze DC2 (CCS B)', val: '<1Ω Nieprzerwany' },
    { p1: 'Główna szyna PE', p2: 'PE gniazdo TYPE 2 / AC', val: '<1Ω Nieprzerwany' },
    { p1: 'Główna szyna PE', p2: 'Elementy metalowe konstrukcyjne', val: '<1Ω Nieprzerwany' },
    { p1: 'Główna szyna PE', p2: 'Drzwi obudowy stacji', val: '<1Ω Nieprzerwany' }
  ],
  riso: {
    RISO_NAZWA_1: 'Wejściowy',
    RISO_NAPIECIE_1: '500 V',
    RISO_NAZWA_WYJ: 'Wyjściowy',
    RISO_L1_L2: '>2 GΩ',
    RISO_L1_L3: '>2 GΩ',
    RISO_L2_L3: '>2 GΩ',
    RISO_L1_N: '>2 GΩ',
    RISO_L2_N: '>2 GΩ',
    RISO_L3_N: '>2 GΩ',
    RISO_L1_PE: '>2 GΩ',
    RISO_L2_PE: '>2 GΩ',
    RISO_L3_PE: '>2 GΩ',
    RISO_N_PE: '>2 GΩ',
    outputs: [
      { name: 'Wyjście: CCS Combo A', voltage: '1000 V', dcdc: '>3 GΩ', pedcp: '>3 GΩ', pedcm: '>3 GΩ' },
      { name: 'Wyjście: CCS Combo B', voltage: '1000 V', dcdc: '>3 GΩ', pedcp: '>3 GΩ', pedcm: '>3 GΩ' }
    ]
  },
  rcdRows: [
    { name: 'RCD zasilający elektronikę 101Q11', din: '0.03', prad: '18.0', czas: '9', ub: '0.007', re: '0.39', test: 'TAK', ocena: 'TAK' },
    { name: 'RCD gniazda serwisowego 101Q4', din: '0.03', prad: '20.2', czas: '7', ub: '0.008', re: '0.39', test: 'TAK', ocena: 'TAK' },
    { name: 'RCD modułów mocy 101T13', din: '0.30', prad: '25.8', czas: '59', ub: '0.010', re: '0.39', test: 'TAK', ocena: 'TAK' },
    { name: 'RCD gniazda TYPE 2 450T3', din: '0.03', prad: '25.2', czas: '111', ub: '0.010', re: '0.39', test: 'TAK', ocena: 'TAK' }
  ],
  swzRows: [
    { obiekt: 'Zasilanie z SP L1-PE', typ: 'gG', inVal: '125', ta: '5.0', ia: '625', zpom: '0.086', ik: '2674', zdop: '0.37', ocena: 'TAK' },
    { obiekt: 'Zasilanie z SP L2-PE', typ: 'gG', inVal: '125', ta: '5.0', ia: '625', zpom: '0.087', ik: '2644', zdop: '0.37', ocena: 'TAK' },
    { obiekt: 'Zasilanie z SP L3-PE', typ: 'gG', inVal: '125', ta: '5.0', ia: '625', zpom: '0.083', ik: '2771', zdop: '0.37', ocena: 'TAK' },
    { obiekt: 'Gniazdo serwisowe 101Q4', typ: 'B', inVal: '16', ta: '0.4', ia: '80', zpom: '0.060', ik: '3833', zdop: '2.88', ocena: 'TAK' },
    { obiekt: 'Gniazdo TYPE 2 450Q2', typ: 'B', inVal: '32', ta: '0.4', ia: '160', zpom: '0.100', ik: '2300', zdop: '1.44', ocena: 'TAK' }
  ]
})

const props = defineProps({
  show: { type: Boolean, default: false },
  ticket: { type: Object, default: null },
  module: { type: String, default: 'axon' }, // 'axon' (producent EEP) | 'ekoen' (własne EKOEN)
  displayCode: { type: String, default: '' }
})

const emit = defineEmits(['close', 'saved'])

const store = useReportsStore()
const auth = useAuthStore()

let uidSeq = 1
const nextUid = () => `rep_${Date.now()}_${uidSeq++}`

const orderSearchInput = ref('')
const fetchStatusMsg = ref('')
const fetchStatusOk = ref(true)

const activePartUid = ref('')
const activeActionUid = ref('')
const matchedPricelistKey = ref('')

const pinStatus = ref('NONE') // 'NONE' | 'CHECKING' | 'VALID' | 'INVALID'
const pinErrorMsg = ref('')

const previewBase64 = ref('')
const previewFileName = ref('')
const isDevPreviewReady = ref(false)
const previewError = ref('')
const rawTicketDiagnosis = ref('')

const photos = ref([])
const measurements = ref(buildDefaultMeasurements())

const activeCreatorStep = ref('REPORT') // 'REPORT' | 'SETTLEMENT'
const alsoSaveSettlementOnCommit = ref(true)
const settlementSavedDone = ref(false)
const settlementStatusMsg = ref('')
const settlementStatusOk = ref(true)
const orderSettlementHistory = ref({ found: false })

const settlement = ref({
  mode: 'EEP', // 'EEP' | 'EKOEN'
  markAsFinalSettled: false,
  travelType: 'FIXED_EEP', // 'FIXED_EEP' | 'NONE' | 'MANUAL' | 'KM'
  manualTravelEur: 0,
  travelKm: 0,
  travelRate: 0.60,
  rbhHours: 0,
  rbhRate: 60,
  orderCostEur: 0,
  stationStatus: 'TAK',
  statusRevisit: false,
  offerNumber: '',
  totalPln: 0,
  internalCostPln: 0,
  laborCostPln: 0,
  invoiceIssued: 'NIE',
  route: '',
  km: 0,
  lodging: 'NIE',
  comment: ''
})

const canApproveBillingDirectly = computed(() => {
  const role = String(auth.user?.role || '').toUpperCase().trim()
  return ['ADMIN', 'SUPERADMIN', 'ZARZAD', 'MANAGER', 'DISPATCHER', 'KOORDYNATOR'].includes(role)
})

const calculatedEepTotalEur = computed(() => {
  let travel = 0
  if (settlement.value.travelType === 'FIXED_EEP') travel = 120
  else if (settlement.value.travelType === 'MANUAL') travel = Number(settlement.value.manualTravelEur) || 0
  else if (settlement.value.travelType === 'KM') {
    travel = (Number(settlement.value.travelKm) || 0) * (Number(settlement.value.travelRate) || 0)
  }
  const rbh = (Number(settlement.value.rbhHours) || 0) * (Number(settlement.value.rbhRate) || 0)
  return actionsEurSummary.value.totalEur + travel + rbh
})

const eepPositionsSummaryText = computed(() => {
  const parts = []
  const grp = actionsEurSummary.value.grouped || {}
  Object.keys(grp).forEach(k => parts.push(`${k}: ${grp[k].join(', ')}`))
  if ((Number(settlement.value.rbhHours) || 0) > 0) parts.push(`+${settlement.value.rbhHours} RBH`)
  if (parts.length === 0) return settlement.value.travelType !== 'NONE' ? 'Sam dojazd serwisowy' : '-'
  return parts.join(' | ')
})

const settlementPreviewBadge = computed(() => {
  if (settlement.value.mode === 'EKOEN') {
    const pln = Number(settlement.value.totalPln) || Number(settlement.value.internalCostPln) || 0
    return `EKOEN: ${pln.toFixed(2)} PLN`
  }
  return `EEP: ${calculatedEepTotalEur.value.toFixed(2)} €`
})

const form = ref({
  docType: 'STANDARD',
  internalTicketId: '',
  ekoId: '',
  orderId: '',
  manualOrderId: '',
  offerNettoPln: 0,
  qpNumber: '',
  client: '',
  operator: 'EKOEN',
  contractorAuth: 'EKOEN Sp. z o.o.\nul. Żelazna 51/53\n00-841 Warszawa',
  reportTime: '',
  stationModel: '',
  power: '',
  prodYear: '',
  connectors: '',
  location: '',
  technician: '',
  techPin: '',
  certNumber: '',
  uprE: '',
  uprD: '',
  date: '',
  visitType: 'Pierwsza wizyta',
  description: '',
  diagnosis: '',
  parts: [],
  actionRows: [],
  workTimes: [],
  comments: '',
  restored: 'TAK',
  clientSign: '',
  poDataPoprz: '',
  poLiczbaPoprz: '',
  checklist: {}
})

const isServiceMode = computed(() => form.value.docType === 'STANDARD' || form.value.docType === 'INTERNAL')
const isChecklistMode = computed(() => ['INSTALACJA', 'URUCHOMIENIE', 'PRZEGLAD'].includes(form.value.docType))
const activeChecklistSections = computed(() => CHECKLIST_DEFS[form.value.docType] || [])

const activeOrderRef = computed(() =>
  form.value.docType === 'INTERNAL'
    ? (form.value.manualOrderId || form.value.ekoId || form.value.orderId)
    : (form.value.orderId || form.value.ekoId)
)

const availablePriceListKeys = computed(() => Object.keys(store.priceLists || {}))

const mergedTechniciansList = computed(() => {
  const list = [...(store.technicians || [])]
  if (form.value.technician && !list.includes(form.value.technician)) {
    list.unshift(form.value.technician)
  }
  return list
})

const pinStatusLabel = computed(() => {
  if (pinStatus.value === 'CHECKING') return 'Weryfikacja PIN...'
  if (pinStatus.value === 'VALID') return '✓ Podpis aktywny'
  if (pinStatus.value === 'INVALID') return pinErrorMsg.value || 'Błędny PIN'
  return 'Brak PIN'
})

const actionsEurSummary = computed(() => {
  let totalEur = 0
  const grouped = {}
  ;(form.value.actionRows || []).forEach(r => {
    const qty = Math.max(1, Number(r.qty) || 1)
    if (r.listKey && r.listKey !== 'MANUAL' && r.itemNum) {
      totalEur += (Number(r.itemPrice) || 0) * qty
      const shortList = r.listKey.replace('Cennik ', '').replace('Axon Easy', 'AXE').replace('Axon Side', 'AXS')
      if (!grouped[shortList]) grouped[shortList] = []
      grouped[shortList].push(qty > 1 ? `${r.itemNum} (x${qty})` : r.itemNum)
    }
  })
  return { totalEur, grouped }
})

const invalidatePreview = () => {
  previewBase64.value = ''
  isDevPreviewReady.value = false
}

const resetMeasurementsToStandard = () => {
  const savedMetersAndGrid = {
    gridSystem: measurements.value.gridSystem,
    gridVoltage: measurements.value.gridVoltage,
    meterName: measurements.value.meterName,
    meterSerial: measurements.value.meterSerial,
    meterCert: measurements.value.meterCert,
    meterName2: measurements.value.meterName2,
    meterSerial2: measurements.value.meterSerial2,
    meterCert2: measurements.value.meterCert2
  }
  measurements.value = {
    ...buildDefaultMeasurements(),
    ...savedMetersAndGrid
  }
  invalidatePreview()
}

// Każda zmiana w formularzu, pomiarach lub zdjęciach wymusza świeży wydruk PDF przy zatwierdzeniu
watch([form, measurements, photos], () => {
  if (previewBase64.value || isDevPreviewReady.value) {
    invalidatePreview()
  }
}, { deep: true })

const initChecklistDefaults = (mode) => {
  const sections = CHECKLIST_DEFS[mode] || []
  sections.forEach(sec => {
    sec.items.forEach(it => {
      if (!form.value.checklist[it.id]) {
        form.value.checklist[it.id] = 'Pozytywny'
      }
    })
  })
}

const setAllChecklistValues = (val) => {
  activeChecklistSections.value.forEach(sec => {
    sec.items.forEach(it => {
      form.value.checklist[it.id] = val
    })
  })
  invalidatePreview()
}

const selectDocMode = (mode) => {
  form.value.docType = mode
  if (CHECKLIST_DEFS[mode]) initChecklistDefaults(mode)
  if (mode === 'INTERNAL') {
    if (!form.value.manualOrderId) {
      form.value.manualOrderId = form.value.ekoId || form.value.orderId || ''
    }
    settlement.value.mode = 'EKOEN'
    if (!settlement.value.offerNumber) settlement.value.offerNumber = form.value.manualOrderId
  } else if (mode === 'STANDARD' && props.module !== 'ekoen') {
    settlement.value.mode = 'EEP'
  }
  invalidatePreview()
}

const closeAllAutocompletes = () => {
  activePartUid.value = ''
  activeActionUid.value = ''
}

// --- CZĘŚCI ZAMIENNE ---
const addPartRow = (defaults = null) => {
  form.value.parts.push({
    uid: nextUid(),
    name: defaults?.name || '',
    qty: defaults?.qty || 1,
    index: defaults?.index || '',
    type: defaults?.type || 'MK1'
  })
}

const removePartRow = (idx) => {
  form.value.parts.splice(idx, 1)
  if (form.value.parts.length === 0) addPartRow()
  invalidatePreview()
}

const getPartSuggestions = (query) => {
  const catalog = store.partsCatalog || []
  const q = String(query || '').trim().toLowerCase()
  if (!q) return catalog.slice(0, 18)
  const words = q.split(/\s+/).filter(Boolean)
  const out = []
  for (let i = 0; i < catalog.length; i++) {
    const c = catalog[i]
    const hay = `${c.index || ''} ${c.name || ''}`.toLowerCase()
    if (words.every(w => hay.includes(w))) {
      out.push(c)
      if (out.length >= 20) break
    }
  }
  return out
}

const applyPartSuggestion = (part, cand) => {
  part.name = cand.name || ''
  part.index = cand.index || ''
  activePartUid.value = ''
  invalidatePreview()
}

// --- WYKONANE DZIAŁANIA Z CENNIKÓW EEP ---
const resolveDefaultListKey = () => {
  if (matchedPricelistKey.value && availablePriceListKeys.value.includes(matchedPricelistKey.value)) {
    return matchedPricelistKey.value
  }
  if (form.value.docType === 'INTERNAL' || availablePriceListKeys.value.length === 0) {
    return 'MANUAL'
  }
  return availablePriceListKeys.value[0]
}

const addActionRow = (defaults = null) => {
  form.value.actionRows.push({
    uid: nextUid(),
    listKey: defaults?.listKey || resolveDefaultListKey(),
    displayText: defaults?.displayText || '',
    cleanText: defaults?.cleanText || '',
    itemNum: defaults?.itemNum || '',
    itemPrice: defaults?.itemPrice || 0,
    qty: defaults?.qty || 1
  })
}

const removeActionRow = (idx) => {
  form.value.actionRows.splice(idx, 1)
  if (form.value.actionRows.length === 0) addActionRow()
  invalidatePreview()
}

const onActionListKeyChange = (act) => {
  if (act.listKey === 'MANUAL') {
    act.itemNum = ''
    act.itemPrice = 0
    act.cleanText = act.displayText
  } else {
    act.displayText = ''
    act.cleanText = ''
    act.itemNum = ''
    act.itemPrice = 0
  }
}

const onActionTextInput = (act) => {
  if (act.listKey === 'MANUAL') {
    act.cleanText = act.displayText
  } else {
    activeActionUid.value = act.uid
    act.cleanText = act.displayText
  }
}

const getActionSuggestions = (act) => {
  const items = (store.priceLists || {})[act.listKey] || []
  const q = String(act.displayText || '').trim().toLowerCase()
  if (!q) return items.slice(0, 25)
  return items.filter(it => `${it.num} ${it.name}`.toLowerCase().includes(q)).slice(0, 25)
}

const applyActionSuggestion = (act, it) => {
  act.displayText = `${it.num}. ${it.name}`
  act.cleanText = it.name
  act.itemNum = it.num
  act.itemPrice = Number(it.price) || 0
  activeActionUid.value = ''
  invalidatePreview()
}

const importActionsFromDiagnosis = () => {
  if (!rawTicketDiagnosis.value) return
  const lines = rawTicketDiagnosis.value
    .split(/\r?\n/)
    .map(l => l.replace(/^---\s*WIZYTA.+---$/i, '').trim())
    .filter(Boolean)
  if (lines.length === 0) return

  if (form.value.actionRows.length === 1 && !form.value.actionRows[0].cleanText) {
    form.value.actionRows = []
  }
  lines.forEach(line => {
    addActionRow({ listKey: 'MANUAL', displayText: line, cleanText: line })
  })
}

const onStationModelChange = () => {
  const m = String(form.value.stationModel || '').toUpperCase()
  const keys = availablePriceListKeys.value
  if (!m || keys.length === 0) return

  let found = ''
  if (m.includes('1.3')) found = keys.find(k => k.includes('1.3')) || ''
  else if (m.includes('1.2')) found = keys.find(k => k.includes('1.2')) || ''
  else if (m.includes('1.0')) found = keys.find(k => k.includes('1.0')) || ''
  else if (m.includes('DLBS') || m.includes('SIDE')) found = keys.find(k => k.includes('DLBS') || k.toUpperCase().includes('SIDE')) || ''

  if (found) {
    matchedPricelistKey.value = found
    form.value.actionRows.forEach(act => {
      if (!act.cleanText && act.listKey !== 'MANUAL') act.listKey = found
    })
  }
}

// --- CZAS PRACY I TECHNIK / PIN ---
const addWorkRow = (defaults = null) => {
  form.value.workTimes.push({
    uid: nextUid(),
    name: defaults?.name || form.value.technician || '',
    date: defaults?.date || form.value.date || store.today,
    start: defaults?.start || '08:00',
    end: defaults?.end || '16:00'
  })
}

const removeWorkRow = (idx) => {
  form.value.workTimes.splice(idx, 1)
  if (form.value.workTimes.length === 0) addWorkRow()
}

const syncDateToWorkTimes = () => {
  form.value.workTimes.forEach(w => { w.date = form.value.date })
  invalidatePreview()
}

const onTechnicianChange = () => {
  form.value.techPin = ''
  form.value.certNumber = ''
  form.value.uprE = ''
  form.value.uprD = ''
  pinStatus.value = 'NONE'
  if (form.value.workTimes.length > 0 && !form.value.workTimes[0].name) {
    form.value.workTimes[0].name = form.value.technician
  }
  invalidatePreview()
}

const onPinInput = async () => {
  const pin = String(form.value.techPin || '').trim()
  if (pin.length < 4) {
    pinStatus.value = 'NONE'
    return
  }
  if (!form.value.technician) {
    pinStatus.value = 'INVALID'
    pinErrorMsg.value = 'Wybierz technika!'
    return
  }

  pinStatus.value = 'CHECKING'
  const res = await store.verifyTechPin(form.value.technician, pin)
  if (res && res.success) {
    pinStatus.value = 'VALID'
    form.value.certNumber = res.certNumber || ''
    form.value.uprE = res.uprE || ''
    form.value.uprD = res.uprD || ''
    invalidatePreview()
  } else {
    pinStatus.value = 'INVALID'
    pinErrorMsg.value = res?.message || 'Błędny PIN'
  }
}

// --- KOMPRESJA ZDJĘĆ ZE SMARTFONA ---
const compressPhotoFile = (file, maxWidth = 1200) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let w = img.width
        let h = img.height
        if (w > maxWidth) {
          h = Math.round((h * maxWidth) / w)
          w = maxWidth
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  })
}

const onPhotosSelected = async (e) => {
  const files = Array.from(e.target.files || [])
  for (const file of files) {
    const dataUrl = await compressPhotoFile(file, 1200)
    photos.value.push({ id: nextUid(), dataUrl, caption: '' })
  }
  e.target.value = ''
  invalidatePreview()
}

// --- INICJALIZACJA Z WIERSZA ZGŁOSZENIA ORAZ DOPYTANIE KONTEKSTU Z BAZY ---
const applyBackendOrderContext = (ctx) => {
  if (!ctx || !ctx.success) return

  if (ctx.internalTicketId) form.value.internalTicketId = ctx.internalTicketId
  if (ctx.ekoId) form.value.ekoId = ctx.ekoId
  if (ctx.orderId) form.value.orderId = ctx.orderId
  if (ctx.offerNumber || ctx.ekoId) {
    form.value.manualOrderId = ctx.offerNumber || ctx.ekoId || form.value.manualOrderId
  }
  form.value.offerNettoPln = Number(ctx.offerNettoPln) || 0

  if (ctx.qpNumber) form.value.qpNumber = ctx.qpNumber
  if (ctx.client) form.value.client = ctx.client
  if (ctx.operator) form.value.operator = ctx.operator
  if (ctx.location) form.value.location = ctx.location
  if (ctx.stationModel) {
    form.value.stationModel = ctx.stationModel
    onStationModelChange()
  }
  if (ctx.power) form.value.power = ctx.power
  if (ctx.prodYear) form.value.prodYear = ctx.prodYear
  if (ctx.connectors) form.value.connectors = ctx.connectors
  if (ctx.description) form.value.description = ctx.description
  if (ctx.reportTime) form.value.reportTime = ctx.reportTime
  if (ctx.visitType) form.value.visitType = ctx.visitType
  if (ctx.visitDate) form.value.date = ctx.visitDate

  if (ctx.diagnosis) {
    rawTicketDiagnosis.value = ctx.diagnosis
    if (!form.value.diagnosis) form.value.diagnosis = ctx.diagnosis
  }

  if (ctx.assignedTech && !form.value.technician) {
    form.value.technician = ctx.assignedTech
  }

  if (ctx.defaultWorkTime) {
    form.value.workTimes = [{
      uid: nextUid(),
      name: ctx.defaultWorkTime.name || form.value.technician || '',
      date: ctx.defaultWorkTime.date || form.value.date,
      start: ctx.defaultWorkTime.start || '08:00',
      end: ctx.defaultWorkTime.end || '16:00'
    }]
  }

  if (Array.isArray(ctx.prefilledParts) && ctx.prefilledParts.length > 0) {
    form.value.parts = ctx.prefilledParts.map(p => ({
      uid: nextUid(),
      name: p.name || '',
      qty: p.qty || 1,
      index: p.index || '',
      type: p.type || 'MK1'
    }))
  }

  orderSettlementHistory.value = ctx.settlementHistory || { found: false }
  if (ctx.offerNumber) settlement.value.offerNumber = ctx.offerNumber
  else if (!settlement.value.offerNumber) settlement.value.offerNumber = ctx.ekoId || ctx.orderId || ''
  if (Number(ctx.offerNettoPln) > 0 && !settlement.value.totalPln) {
    settlement.value.totalPln = Number(ctx.offerNettoPln)
  }
  if (ctx.isEkoenOrder) {
    settlement.value.mode = 'EKOEN'
  }
}

const handleFetchOrder = async () => {
  const q = orderSearchInput.value.trim()
  if (!q) return
  fetchStatusMsg.value = ''
  const res = await store.fetchOrderContext({ query: q })
  if (res && res.success) {
    // Jeśli pobrano własne zlecenie EKOEN bez numeru AC -> przełącz na INTERNAL
    if (res.isEkoenOrder) selectDocMode('INTERNAL')
    applyBackendOrderContext(res)
    fetchStatusOk.value = true
    fetchStatusMsg.value = `✓ Pobrano dane zlecenia ${res.orderId || res.ekoId} (${res.qpNumber || '-'})`
  } else {
    fetchStatusOk.value = false
    fetchStatusMsg.value = res?.message || 'Nie znaleziono zlecenia w bazie.'
  }
}

const initFromTicketProp = async () => {
  previewBase64.value = ''
  previewFileName.value = ''
  isDevPreviewReady.value = false
  previewError.value = ''
  fetchStatusMsg.value = ''
  pinStatus.value = 'NONE'
  photos.value = []
  measurements.value = buildDefaultMeasurements()
  activeCreatorStep.value = 'REPORT'
  settlementSavedDone.value = false
  settlementStatusMsg.value = ''
  alsoSaveSettlementOnCommit.value = true
  orderSettlementHistory.value = { found: false }
  settlement.value = {
    mode: (props.module === 'ekoen' && !props.ticket?.axon_ticket_id) ? 'EKOEN' : 'EEP',
    markAsFinalSettled: false,
    travelType: 'FIXED_EEP',
    manualTravelEur: 0,
    travelKm: 0,
    travelRate: 0.60,
    rbhHours: 0,
    rbhRate: 60,
    orderCostEur: 0,
    stationStatus: 'TAK',
    statusRevisit: false,
    offerNumber: String(props.displayCode || props.ticket?.ticket_number || ''),
    totalPln: 0,
    internalCostPln: 0,
    laborCostPln: 0,
    invoiceIssued: 'NIE',
    route: '',
    km: 0,
    lodging: 'NIE',
    comment: ''
  }

  await store.ensureInitialized()

  const t = props.ticket
  const isOwnEkoen = props.module === 'ekoen' && !t?.axon_ticket_id
  const catUp = String(t?.category || '').toUpperCase()

  let initialDocType = isOwnEkoen ? 'INTERNAL' : 'STANDARD'
  if (catUp.includes('PRZEGL')) initialDocType = 'PRZEGLAD'
  else if (catUp.includes('URUCHOM')) initialDocType = 'URUCHOMIENIE'
  else if (catUp.includes('INSTAL')) initialDocType = 'INSTALACJA'

  const shortQp = t?.qp_id || t?.station_id
    ? String(t.qp_id || t.station_id).split('-').slice(0, 2).join('-').toUpperCase()
    : ''

  const codeStr = String(props.displayCode || t?.ticket_code || t?.ticket_number || t?.id || '').trim()
  const locStr = t ? [t.city, t.address || t.street].filter(Boolean).join(', ') : ''
  const defaultTech = t?.technician_id && !String(t.technician_id).startsWith('tech_')
    ? String(t.technician_id)
    : (store.technicians.includes(auth.user?.username) ? auth.user.username : '')

  rawTicketDiagnosis.value = t?.raw_diagnoza || ''

  form.value = {
    docType: initialDocType,
    internalTicketId: t?.id ? String(t.id) : '',
    ekoId: props.module === 'ekoen' ? codeStr : (t?.linked_ekoen_id || ''),
    orderId: props.module === 'axon' ? codeStr : (t?.axon_ticket_id || codeStr),
    manualOrderId: props.module === 'ekoen' ? codeStr : '',
    offerNettoPln: 0,
    qpNumber: shortQp,
    client: t?.client || (props.module === 'ekoen' ? 'EKOEN' : ''),
    operator: t?.client || 'EKOEN',
    contractorAuth: 'EKOEN Sp. z o.o.\nul. Żelazna 51/53\n00-841 Warszawa',
    reportTime: String(t?.created_at || '').substring(0, 16).replace('T', ' '),
    stationModel: t?.product || '',
    power: '',
    prodYear: '',
    connectors: '',
    location: locStr,
    technician: defaultTech,
    techPin: '',
    certNumber: '',
    uprE: '',
    uprD: '',
    date: store.today,
    visitType: 'Pierwsza wizyta',
    description: t?.description || '',
    diagnosis: t?.raw_diagnoza || '',
    parts: [{ uid: nextUid(), name: '', qty: 1, index: '', type: 'MK1' }],
    actionRows: [],
    workTimes: [{ uid: nextUid(), name: defaultTech, date: store.today, start: '08:00', end: '16:00' }],
    comments: '',
    restored: 'TAK',
    clientSign: '',
    poDataPoprz: '',
    poLiczbaPoprz: '',
    checklist: {}
  }

  onStationModelChange()
  addActionRow()
  if (CHECKLIST_DEFS[initialDocType]) initChecklistDefaults(initialDocType)

  if (codeStr || shortQp) {
    orderSearchInput.value = codeStr || shortQp
    const fullCtx = await store.fetchOrderContext({
      query: codeStr || shortQp,
      ticketId: t?.id || codeStr,
      qpId: shortQp
    })
    if (fullCtx && fullCtx.success) {
      applyBackendOrderContext(fullCtx)
    }
  }
}

watch(() => props.show, (visible) => {
  if (visible) initFromTicketProp()
})

// --- BUDOWA PAYLOADU POD SILNIK DOCS W Code.gs ---
const buildReportPayload = () => {
  const visitD = new Date(form.value.date || new Date())
  const nextYearD = new Date(visitD)
  nextYearD.setFullYear(visitD.getFullYear() + 1)

  const cleanParts = form.value.parts
    .filter(p => String(p.name || '').trim())
    .map(p => ({
      name: String(p.name).trim(),
      qty: p.qty || 1,
      index: String(p.index || '').trim(),
      type: form.value.docType === 'INTERNAL' ? '' : (p.type || 'MK1')
    }))

  const cleanActions = form.value.actionRows
    .map(a => String(a.cleanText || a.displayText || '').trim())
    .filter(Boolean)

  const cleanWorkTimes = form.value.workTimes
    .filter(w => String(w.name || '').trim())
    .map(w => ({
      name: String(w.name).trim(),
      date: w.date || form.value.date,
      start: w.start || '08:00',
      end: w.end || '16:00'
    }))

  const checklistCopy = { ...form.value.checklist }
  if (form.value.docType === 'PRZEGLAD') {
    checklistCopy.PO_DATA_POPRZ = form.value.poDataPoprz.trim() || '....................'
    checklistCopy.PO_LICZBA_POPRZ = form.value.poLiczbaPoprz.trim() || '....................'
  }

  const m = measurements.value

  return {
    docType: form.value.docType,
    internalTicketId: form.value.internalTicketId,
    ekoId: form.value.ekoId,
    orderId: form.value.docType === 'INTERNAL'
      ? (form.value.manualOrderId.trim() || form.value.ekoId || form.value.orderId.trim())
      : form.value.orderId.trim(),
    qpNumber: form.value.qpNumber.trim(),
    client: form.value.client.trim() || 'EKOEN',
    operator: form.value.operator.trim() || form.value.client.trim() || 'EKOEN',
    contractorAuth: form.value.contractorAuth.trim(),
    reportTime: form.value.reportTime.trim(),
    location: form.value.location.trim(),
    stationModel: form.value.stationModel.trim(),
    power: form.value.power.trim(),
    prodYear: form.value.prodYear.trim(),
    connectors: form.value.connectors.trim(),
    description: form.value.description.trim(),
    diagnosis: form.value.diagnosis.trim(),
    technician: form.value.technician,
    techPin: form.value.techPin.trim(),
    certNumber: form.value.certNumber.trim(),
    uprE: form.value.uprE.trim(),
    uprD: form.value.uprD.trim(),
    approvedBy: form.value.uprD ? form.value.technician : '',
    date: form.value.date,
    nextDate: nextYearD.toISOString().split('T')[0],
    visitType: form.value.visitType,
    restored: form.value.restored,
    clientSign: form.value.clientSign.trim(),
    comments: form.value.comments.trim(),
    parts: cleanParts,
    actions: cleanActions,
    workTimes: cleanWorkTimes,
    checklist: checklistCopy,
    photos: photos.value.map(p => ({ dataUrl: p.dataUrl, caption: p.caption })),

    // Dane pomiarowe Zał. 5.3 (rozwijane wizualnie w Etapie 4)
    gridSystem: m.gridSystem,
    gridVoltage: m.gridVoltage,
    meterName: m.meterName,
    meterSerial: m.meterSerial,
    meterCert: m.meterCert,
    meterName2: m.meterName2,
    meterSerial2: m.meterSerial2,
    meterCert2: m.meterCert2,
    notesPE: m.notesPE,
    notesRISO: m.notesRISO,
    notesRCD: m.notesRCD,
    notesSWZ: m.notesSWZ,
    peRows: m.peRows,
    peValues: m.peRows.map(r => r.val),
    riso: m.riso,
    rcdRows: m.rcdRows,
    swzRows: m.swzRows
  }
}

const validateForm = () => {
  if (!form.value.qpNumber.trim()) {
    alert('Wpisz numer QP stacji!')
    return false
  }
  if (!form.value.technician) {
    alert('Wybierz serwisanta w raporcie!')
    return false
  }
  return true
}

const handleGeneratePreview = async () => {
  if (!validateForm()) return
  previewError.value = ''
  const payload = buildReportPayload()
  const res = await store.previewReportPdf(payload)

  if (res && res.success && res.base64) {
    previewBase64.value = res.base64
    previewFileName.value = res.fileName || 'Raport.pdf'
  } else if (res && res.isDevLocal) {
    isDevPreviewReady.value = true
    previewFileName.value = res.fileName
  } else {
    previewError.value = res?.message || 'Nie udało się wygenerować podglądu PDF.'
  }
}

const triggerBrowserDownload = (base64Str, fileName) => {
  if (!base64Str) return
  const link = document.createElement('a')
  link.href = `data:application/pdf;base64,${base64Str}`
  link.download = fileName || 'Raport_EKOEN.pdf'
  link.click()
}

const buildSettlementPayload = (committedPdfUrl = '') => {
  const s = settlement.value
  const effectiveOrderId = s.mode === 'EKOEN'
    ? (s.offerNumber.trim() || form.value.manualOrderId.trim() || form.value.ekoId || form.value.orderId.trim())
    : (form.value.orderId.trim() || form.value.ekoId)

  return {
    settlementMode: s.mode,
    markAsFinalSettled: Boolean(s.markAsFinalSettled && canApproveBillingDirectly.value),
    internalTicketId: form.value.internalTicketId,
    ekoId: form.value.ekoId,
    orderId: effectiveOrderId,
    offerNumber: s.offerNumber.trim() || form.value.manualOrderId.trim(),
    client: form.value.client.trim() || 'EKOEN',
    qpNumber: form.value.qpNumber.trim(),
    stationModel: form.value.stationModel.trim(),
    date: form.value.date,
    technician: form.value.technician,
    visitType: form.value.visitType,
    selectedActions: form.value.actionRows
      .filter(a => a.listKey !== 'MANUAL' && a.itemNum)
      .map(a => ({
        listKey: a.listKey,
        itemNum: a.itemNum,
        itemPrice: Number(a.itemPrice) || 0,
        qty: Math.max(1, Number(a.qty) || 1),
        cleanText: a.cleanText || a.displayText
      })),
    travelType: s.travelType,
    manualTravelEur: Number(s.manualTravelEur) || 0,
    travelKm: Number(s.travelKm) || 0,
    travelRate: Number(s.travelRate) || 0.60,
    rbhHours: Number(s.rbhHours) || 0,
    rbhRate: Number(s.rbhRate) || 60,
    orderCostEur: Number(s.orderCostEur) || 0,
    stationStatus: s.stationStatus || (form.value.restored === 'NIE' ? 'NIE' : 'TAK'),
    statusRevisit: Boolean(s.statusRevisit),
    totalPln: Number(s.totalPln) || 0,
    internalCostPln: Number(s.internalCostPln) || 0,
    laborCostPln: Number(s.laborCostPln) || 0,
    invoiceIssued: s.invoiceIssued || 'NIE',
    route: s.route.trim(),
    km: Number(s.km) || 0,
    lodging: s.lodging || 'NIE',
    settlementComment: s.comment.trim() || form.value.comments.trim(),
    reportUrl: committedPdfUrl
  }
}

const handleStandaloneSaveSettlement = async () => {
  if (!form.value.technician) {
    alert('Wybierz serwisanta realizującego!')
    return
  }
  settlementStatusMsg.value = ''
  const res = await store.saveReportSettlement(buildSettlementPayload(''))
  if (res && res.success) {
    settlementSavedDone.value = true
    settlementStatusOk.value = true
    settlementStatusMsg.value = `✓ ${res.message}`
    emit('saved', {
      settlementSaved: true,
      ticket_status: res.ticket_status,
      billing_state: res.billing_state,
      amountLabel: res.amountLabel,
      settlementMode: settlement.value.mode
    })
  } else {
    settlementStatusOk.value = false
    settlementStatusMsg.value = res?.message || 'Błąd zapisu rozliczenia.'
  }
}

const handleCommitAndSave = async () => {
  if (!validateForm()) return
  const payload = buildReportPayload()

  if (previewBase64.value) {
    payload.preGeneratedBase64 = previewBase64.value
  } else {
    const prev = await store.previewReportPdf(payload)
    if (prev && prev.success && prev.base64) {
      previewBase64.value = prev.base64
      payload.preGeneratedBase64 = prev.base64
    } else if (!prev?.isDevLocal) {
      alert(prev?.message || 'Błąd podczas generowania pliku PDF.')
      return
    }
  }

  const commitRes = await store.commitReportPdf(payload)
  if (commitRes && commitRes.success) {
    if (previewBase64.value) {
      triggerBrowserDownload(previewBase64.value, commitRes.fileName)
    }

    let settlementRes = null
    if (alsoSaveSettlementOnCommit.value && !settlementSavedDone.value) {
      settlementRes = await store.saveReportSettlement(buildSettlementPayload(commitRes.pdfUrl || ''))
      if (settlementRes?.success) settlementSavedDone.value = true
    }

    emit('saved', {
      ...commitRes,
      docType: form.value.docType,
      settlementSaved: Boolean(settlementRes?.success),
      ticket_status: settlementRes?.ticket_status || '',
      billing_state: settlementRes?.billing_state || '',
      amountLabel: settlementRes?.amountLabel || ''
    })
    emit('close')
  } else {
    alert(commitRes?.message || 'Nie udało się zapisać raportu w Teczce Sprawy.')
  }
}

const onKeydown = (e) => {
  if (props.show && e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.report-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.report-scrollbar::-webkit-scrollbar-track { background: transparent; }
.report-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4); border-radius: 10px; }
.report-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(37, 99, 235, 0.75); }
</style>