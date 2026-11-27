<template>
  <div class="flex flex-col h-full w-full bg-[#f4f6f8] text-slate-800 overflow-hidden">

    <!-- GÓRNY NAGŁÓWEK -->
    <div class="px-8 pt-6 pb-4 bg-white border-b border-slate-200/80 shrink-0">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-black text-slate-800 tracking-tight">Oferty i Wyceny (CPQ)</h1>
            <span
              v-if="!auth.offerPermissions.canEdit"
              class="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200"
            >
              Tryb podglądu
            </span>
          </div>
          <p class="text-xs font-semibold text-slate-400 mt-0.5">
            Rejestr wycen OES, prośby serwisowe, statusy realizacji i fakturowania oraz cennik usług.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            @click="store.fetchOffersData()"
            :disabled="store.isLoading"
            class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            title="Odśwież bazę ofert"
          >
            <svg class="w-3.5 h-3.5" :class="store.isLoading ? 'animate-spin' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            Odśwież
          </button>

          <button
            v-if="auth.offerPermissions.canCreate"
            type="button"
            @click="openDraftModal()"
            class="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <svg class="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Szybkie zlecenie
          </button>

          <button
            v-if="auth.offerPermissions.canGeneratePdf"
            type="button"
            @click="openCreatorModal(null, false)"
            class="px-5 py-2 rounded-xl bg-[#58b347] hover:bg-[#499b3a] text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-[#58b347]/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            Nowa Oferta PDF
          </button>
        </div>
      </div>

      <!-- KAFELKI KPI -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        <div
          @click="activeTab = 'ARCHIVE'"
          class="p-3.5 rounded-2xl border bg-white hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
          :class="activeTab === 'ARCHIVE' ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'"
        >
          <div class="text-[10px] font-black uppercase tracking-widest text-emerald-600">Rozliczone / Do FV</div>
          <div class="text-lg font-black text-emerald-700 mt-1 font-mono">{{ formatMoney(store.kpiStats.billedSum) }}</div>
        </div>

        <div
          @click="activeTab = 'ACTIVE'"
          class="p-3.5 rounded-2xl border bg-white hover:border-sky-300 transition-all cursor-pointer shadow-2xs"
          :class="activeTab === 'ACTIVE' ? 'border-sky-400 ring-2 ring-sky-100' : 'border-slate-200'"
        >
          <div class="text-[10px] font-black uppercase tracking-widest text-sky-600">Zaakceptowane (W toku)</div>
          <div class="text-lg font-black text-sky-700 mt-1 font-mono">{{ formatMoney(store.kpiStats.acceptedSum) }}</div>
        </div>

        <div
          @click="activeTab = 'READY_TO_BILL'"
          class="p-3.5 rounded-2xl border bg-white hover:border-teal-300 transition-all cursor-pointer shadow-2xs"
          :class="activeTab === 'READY_TO_BILL' ? 'border-teal-400 ring-2 ring-teal-100' : 'border-slate-200'"
        >
          <div class="text-[10px] font-black uppercase tracking-widest text-teal-600">Gotowe do FV (Raporty)</div>
          <div class="text-lg font-black text-teal-700 mt-1">{{ store.kpiStats.readyToBillCount }} <span class="text-xs font-bold text-slate-400">zlec.</span></div>
        </div>

        <div
          @click="activeTab = 'DRAFTS'"
          class="p-3.5 rounded-2xl border bg-white hover:border-amber-300 transition-all cursor-pointer shadow-2xs"
          :class="activeTab === 'DRAFTS' ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'"
        >
          <div class="text-[10px] font-black uppercase tracking-widest text-amber-600">Robocze / Do wyceny</div>
          <div class="text-lg font-black text-amber-700 mt-1">{{ store.kpiStats.draftsCount }} <span class="text-xs font-bold text-slate-400">zlec.</span></div>
        </div>

        <div
          @click="selectCollectiveTab()"
          class="p-3.5 rounded-2xl border bg-white hover:border-violet-300 transition-all cursor-pointer shadow-2xs"
          :class="activeTab === 'COLLECTIVE' ? 'border-violet-400 ring-2 ring-violet-100' : 'border-slate-200'"
        >
          <div class="text-[10px] font-black uppercase tracking-widest text-violet-600">Faktury zbiorcze</div>
          <div class="text-lg font-black text-violet-700 mt-1">{{ store.kpiStats.collectiveCount }} <span class="text-xs font-bold text-slate-400">poz.</span></div>
        </div>

        <div
          @click="activeTab = 'FLAGGED'"
          class="p-3.5 rounded-2xl border bg-white hover:border-rose-300 transition-all cursor-pointer shadow-2xs"
          :class="activeTab === 'FLAGGED' ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'"
        >
          <div class="text-[10px] font-black uppercase tracking-widest text-rose-600">Wymagają uwagi</div>
          <div class="text-lg font-black text-rose-600 mt-1">{{ store.kpiStats.flaggedCount }} <span class="text-xs font-bold text-slate-400">ofert</span></div>
        </div>
      </div>

      <!-- ZAKŁADKI WIDOKÓW ROBOCZYCH -->
      <div class="flex items-center gap-1.5 mt-4 overflow-x-auto pb-0.5 offers-scrollbar">
        <button
          v-for="tab in viewTabs"
          :key="tab.id"
          type="button"
          @click="switchTab(tab.id)"
          class="px-3.5 py-2 rounded-xl text-[11px] font-extrabold tracking-wide flex items-center gap-2 shrink-0 transition-all cursor-pointer border"
          :class="activeTab === tab.id
            ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
        >
          <span>{{ tab.label }}</span>
          <span
            class="px-1.5 py-0.2 rounded-full text-[10px] font-black"
            :class="activeTab === tab.id ? 'bg-[#58b347] text-white' : 'bg-slate-200/80 text-slate-600'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- KOMUNIKAT BŁĘDU -->
    <div v-if="store.error" class="mx-8 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex justify-between items-center">
      <span>Błąd połączenia z bazą ofert: {{ store.error }}</span>
      <button type="button" @click="store.error = ''" class="text-red-500 hover:text-red-800 font-black cursor-pointer">✕</button>
    </div>

    <!-- ========================================================== -->
    <!-- WIDOK A: REJESTR OFERT                                     -->
    <!-- ========================================================== -->
    <div v-if="activeTab !== 'CATALOG'" class="flex-1 flex flex-col overflow-hidden px-8 py-5">
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col flex-1 overflow-hidden">

        <!-- PASEK FILTRÓW -->
        <div class="px-4 py-3 border-b border-slate-100 flex items-center flex-wrap gap-2.5 bg-white shrink-0">
          <div class="relative flex-1 min-w-[220px] max-w-xs">
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Szukaj OES, QP, klienta, #zlecenia..."
              class="w-full h-9 pl-9 pr-7 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#58b347] focus:bg-white transition-all"
            />
            <button
              v-if="searchQuery"
              type="button"
              @click="searchQuery = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-black cursor-pointer"
            >✕</button>
          </div>

          <select
            v-model="filterClient"
            class="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-[#58b347] max-w-[210px] cursor-pointer"
          >
            <option value="">Wszyscy klienci ({{ uniqueClientsList.length }})</option>
            <option v-for="cl in uniqueClientsList" :key="cl" :value="cl">{{ cl }}</option>
          </select>

          <select
            v-model="filterMonth"
            class="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-[#58b347] cursor-pointer"
          >
            <option value="">Wszystkie miesiące</option>
            <option v-for="m in uniqueMonthsList" :key="m" :value="m">{{ m }}</option>
          </select>

          <select
            v-model="filterStatusOffer"
            class="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-[#58b347] cursor-pointer"
          >
            <option value="">Status oferty (wszystkie)</option>
            <option value="PRZYGOTOWANIE">PRZYGOTOWANIE</option>
            <option value="OCZEKUJE NA AKCEPTACJE">WYSŁANA / OCZEKUJE</option>
            <option value="ZAAKCEPTOWANA">ZAAKCEPTOWANA</option>
            <option value="ANULOWANE">ANULOWANE</option>
          </select>

          <label class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 cursor-pointer ml-1 select-none">
            <input type="checkbox" v-model="includeArchived" class="rounded accent-[#58b347]" />
            <span>Pokaż zamknięte</span>
          </label>

          <label class="ml-auto flex items-center gap-1.5 text-[11px] font-extrabold text-slate-700 cursor-pointer select-none">
            <input type="checkbox" v-model="groupByClient" class="rounded accent-[#58b347]" />
            <span>Grupuj po klientach</span>
          </label>
        </div>

        <!-- TABELA OFERT -->
        <div class="flex-1 overflow-auto offers-scrollbar">
          <div v-if="store.isLoading" class="py-16 text-center text-xs font-bold text-slate-400 animate-pulse">
            Ładowanie rejestru ofert z sys_offers...
          </div>

          <div v-else-if="filteredOffers.length === 0" class="py-16 text-center">
            <div class="text-sm font-black text-slate-400">Brak ofert w wybranym widoku</div>
            <p class="text-xs text-slate-400 mt-1">Zmień filtry albo dodaj nowe zlecenie przyciskiem u góry.</p>
          </div>

          <table v-else class="w-full border-collapse text-left">
            <thead class="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th class="py-3 px-2.5 text-center w-10">Uw.</th>
                <th class="py-3 px-3 w-44">Oferta / Data</th>
                <th class="py-3 px-3 w-48">Klient</th>
                <th class="py-3 px-3 w-40">Stacje QP / Lokalizacja</th>
                <th class="py-3 px-3">Zakres prac / Notatki</th>
                <th class="py-3 px-3 w-48">Zgłoszenia / Grafik</th>
                <th class="py-3 px-3 w-44">Etapy (Oferta / Prace / FV)</th>
                <th class="py-3 px-3 w-32 text-right">Kwota netto</th>
                <th class="py-3 px-3 w-28 text-center">Dokumenty</th>
                <th class="py-3 px-3 w-32 text-center">Akcje</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100 text-xs">
              <template v-for="group in groupedOfferRows" :key="group.key">
                <!-- Nagłówek grupy klienta (gdy włączone grupowanie) -->
                <tr v-if="groupByClient" class="bg-slate-100/90 border-t-2 border-slate-200">
                  <td colspan="10" class="py-2.5 px-4">
                    <div class="flex items-center justify-between flex-wrap gap-2">
                      <div class="flex items-center gap-2.5 flex-wrap">
                        <span class="font-black text-slate-800 text-sm">{{ group.clientName }}</span>
                        <span class="px-2 py-0.5 rounded-full bg-slate-800 text-white text-[10px] font-black">{{ group.items.length }} zlec.</span>
                        <span class="font-black text-emerald-700 font-mono text-xs">
                          Razem: {{ formatMoney(group.sumNetto) }} netto
                        </span>
                      </div>
                      <button
                        v-if="auth.offerPermissions.canManageBilling"
                        type="button"
                        @click="markGroupAsCollective(group.items)"
                        class="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                      >
                        Oznacz grupę jako FV zbiorcza
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Wiersze ofert -->
                <tr
                  v-for="o in group.items"
                  :key="o.id"
                  :class="[
                    getRowHighlightClass(o),
                    highlightedOfferId === o.id ? 'ring-2 ring-inset ring-[#58b347] bg-[#f0f7f1]' : ''
                  ]"
                  class="transition-colors hover:bg-slate-50/80 align-top"
                >
                  <!-- Flaga uwagi -->
                  <td class="py-3 px-2 text-center">
                    <button
                      type="button"
                      :disabled="!auth.offerPermissions.canEdit"
                      @click="store.toggleFlag(o.id)"
                      class="w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all cursor-pointer disabled:cursor-default"
                      :class="o.is_flagged ? 'bg-rose-100 text-rose-600' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'"
                      :title="o.is_flagged ? 'Zdejmij flagę uwagi' : 'Oznacz jako wymagające uwagi'"
                    >
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z"/></svg>
                    </button>
                  </td>

                  <!-- Numer oferty / Data -->
                  <td class="py-3 px-3">
                    <div class="font-black font-mono text-slate-800 break-all leading-snug">
                      {{ o.offer_number && o.offer_number !== '-' ? o.offer_number : 'SZKIC (bez nr OES)' }}
                    </div>
                    <div class="text-[11px] font-bold mt-1" :class="o.offer_date ? 'text-slate-500' : 'text-amber-600'">
                      {{ o.offer_date || 'Czeka na wycenę' }}
                    </div>
                    <div v-if="o.requested_by" class="text-[10px] text-slate-400 font-semibold mt-1 truncate">
                      Zgł.: {{ o.requested_by }}
                    </div>
                    <div v-else-if="o.author" class="text-[10px] text-slate-400 font-semibold mt-1 truncate">
                      {{ o.author }}
                    </div>
                  </td>

                  <!-- Klient (edycja inline) -->
                  <td class="py-3 px-3">
                    <input
                      v-if="auth.offerPermissions.canEdit"
                      type="text"
                      :value="o.client_name"
                      @blur="onInlineFieldBlur(o, 'client_name', $event.target.value)"
                      placeholder="Wpisz klienta..."
                      class="w-full px-1.5 py-0.5 -mx-1.5 rounded-md font-extrabold text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-[#58b347] focus:outline-none transition-all"
                    />
                    <div v-else class="font-extrabold text-slate-800 leading-snug">{{ o.client_name || 'Brak klienta' }}</div>
                    <div v-if="o.client_nip" class="text-[10px] font-mono text-slate-500 mt-0.5">NIP: {{ o.client_nip }}</div>
                    <div v-if="o.client_contact" class="text-[10px] text-slate-500 mt-0.5 break-words">{{ o.client_contact }}</div>
                  </td>

                  <!-- Stacje QP / Lokalizacja -->
                  <td class="py-3 px-3">
                    <input
                      v-if="auth.offerPermissions.canEdit && !String(o.station_qp || '').includes('\n')"
                      type="text"
                      :value="o.station_qp"
                      @blur="onInlineFieldBlur(o, 'station_qp', $event.target.value)"
                      placeholder="QP-..."
                      class="w-full px-1.5 py-0.5 -mx-1.5 rounded-md font-black font-mono text-[#499b3a] bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-[#58b347] focus:outline-none transition-all"
                    />
                    <div v-else class="font-black font-mono text-[#499b3a] whitespace-pre-line leading-snug">
                      {{ o.station_qp || '-' }}
                    </div>

                    <input
                      v-if="auth.offerPermissions.canEdit && !String(o.station_location || '').includes('\n')"
                      type="text"
                      :value="o.station_location"
                      @blur="onInlineFieldBlur(o, 'station_location', $event.target.value)"
                      placeholder="Lokalizacja..."
                      class="w-full px-1.5 py-0.5 -mx-1.5 mt-0.5 rounded-md text-[11px] text-slate-500 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-[#58b347] focus:outline-none transition-all"
                    />
                    <div v-else-if="o.station_location" class="text-[11px] text-slate-500 whitespace-pre-line mt-0.5 leading-snug">
                      {{ o.station_location }}
                    </div>

                    <span v-if="o.eep_order" class="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9.5px] font-mono font-bold text-slate-600">
                      EEP/AC: {{ o.eep_order }}
                    </span>
                  </td>

                  <!-- Zakres prac i notatki -->
                  <td class="py-3 px-3 max-w-xs">
                    <div v-if="isMergedDraft(o)" class="mb-1">
                      <span class="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[9.5px] font-black uppercase tracking-wider">
                        Scalono do OES
                      </span>
                    </div>
                    <div v-if="o.project_name" class="font-extrabold text-slate-800 leading-snug mb-0.5">
                      {{ o.project_name }}
                    </div>
                    <div class="text-[11px] text-slate-600 whitespace-pre-line line-clamp-3 leading-relaxed">
                      {{ o.description || 'Brak opisu zakresu prac...' }}
                    </div>
                    <div class="mt-1.5">
                      <input
                        v-if="auth.offerPermissions.canEdit"
                        type="text"
                        :value="o.internal_notes"
                        @blur="onInlineNoteBlur(o, $event.target.value)"
                        placeholder="+ dodaj notatkę wewnętrzną..."
                        class="w-full px-2 py-1 rounded-lg text-[11px] font-bold bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-[#58b347] focus:outline-none transition-all"
                        :class="o.internal_notes ? 'text-rose-600' : 'text-slate-400'"
                      />
                      <div v-else-if="o.internal_notes" class="text-[11px] font-bold text-rose-600">
                        {{ o.internal_notes }}
                      </div>
                    </div>
                  </td>

                  <!-- Zgłoszenia, Harmonogram, Raporty i Rozliczenia -->
                  <td class="py-3 px-3">
                    <div v-if="o.ticket_ids" class="flex flex-wrap gap-1 mb-1.5">
                      <span
                        v-for="tid in splitTokens(o.ticket_ids)"
                        :key="tid"
                        class="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-black font-mono"
                      >
                        #{{ tid }}
                      </span>
                    </div>
                    <button
                      v-else-if="auth.offerPermissions.canEdit && o.status_offer !== 'ANULOWANE'"
                      type="button"
                      :disabled="sendingTicketOfferId === o.id"
                      @click="handleSendToTickets(o)"
                      class="w-full mb-1.5 px-2 py-1 rounded-lg border border-sky-300 bg-sky-50/70 hover:bg-sky-600 text-sky-800 hover:text-white text-[9.5px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                      title="Utwórz zgłoszenie EE_XXX w Zgłoszeniach i Backlogu Harmonogramu"
                    >
                      {{ sendingTicketOfferId === o.id ? 'Tworzenie EE...' : '+ Do realizacji (EE)' }}
                    </button>

                    <div v-if="o.scheduledVisits && o.scheduledVisits.length > 0" class="flex flex-col gap-1">
                      <div
                        v-for="v in o.scheduledVisits.slice(0, 3)"
                        :key="v.id"
                        class="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold leading-tight"
                      >
                        {{ formatShortDate(v.start_time) }} • {{ v.title || 'Wizyta' }}
                      </div>
                    </div>
                    <div v-else class="px-2 py-1 rounded-lg border border-dashed border-slate-200 text-slate-400 text-[10px] font-bold">
                      Brak wizyty w grafiku
                    </div>

                    <!-- Raporty z wizyt / ostrzeżenie o braku raportu -->
                    <div v-if="o.visitReports && o.visitReports.length > 0" class="flex flex-wrap gap-1 mt-1.5">
                      <a
                        v-for="rep in o.visitReports"
                        :key="rep.url"
                        :href="rep.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[9.5px] font-black transition-colors"
                        title="Otwórz raport serwisowy"
                      >
                        <span>Raport #{{ rep.label }}</span>
                      </a>
                    </div>
                    <div
                      v-else-if="o.status_exec === 'ZREALIZOWANO' && o.status_offer !== 'ANULOWANE'"
                      class="mt-1.5 inline-block px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 text-[9.5px] font-black uppercase"
                    >
                      Brak raportu!
                    </div>

                    <!-- Znacznik rozliczeń z sys_billings -->
                    <div
                      v-if="o.settlementText"
                      class="mt-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 text-[9.5px] font-extrabold leading-tight"
                    >
                      ✓ {{ o.settlementText }}
                    </div>
                  </td>

                  <!-- 3 Etapy: Oferta / Realizacja / Fakturowanie -->
                  <td class="py-3 px-3">
                    <div class="flex flex-col gap-1">
                      <select
                        :value="o.status_offer"
                        :disabled="!auth.offerPermissions.canEdit"
                        @change="onStatusOfferChange(o, $event.target.value)"
                        class="w-full px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide cursor-pointer disabled:opacity-70 disabled:cursor-default focus:outline-none"
                        :class="getOfferStageClass(o.status_offer)"
                      >
                        <option value="PRZYGOTOWANIE">1. PRZYGOTOWANIE</option>
                        <option value="OCZEKUJE NA AKCEPTACJE">1. WYSŁANA</option>
                        <option value="ZAAKCEPTOWANA">1. ZAAKCEPTOWANA</option>
                        <option value="ANULOWANE">1. ANULOWANE</option>
                      </select>

                      <select
                        :value="o.status_exec"
                        :disabled="!auth.offerPermissions.canEdit"
                        @change="store.updateOfferField(o.id, 'status_exec', $event.target.value)"
                        class="w-full px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide cursor-pointer disabled:opacity-70 disabled:cursor-default focus:outline-none"
                        :class="getExecStageClass(o.status_exec)"
                      >
                        <option value="OCZEKUJE">2. OCZEKUJE</option>
                        <option value="OCZEKUJE NA CZĘŚCI">2. CZEKA NA CZĘŚCI</option>
                        <option value="W TOKU">2. W TOKU</option>
                        <option value="ZREALIZOWANO">2. ZREALIZOWANO</option>
                        <option value="ANULOWANE">2. ANULOWANE</option>
                      </select>

                      <select
                        :value="o.status_billing"
                        :disabled="!auth.offerPermissions.canManageBilling"
                        @change="store.updateOfferField(o.id, 'status_billing', $event.target.value)"
                        class="w-full px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide cursor-pointer disabled:opacity-70 disabled:cursor-default focus:outline-none"
                        :class="getBillStageClass(o.status_billing)"
                      >
                        <option value="NIEROZLICZONE">3. NIEROZLICZONE</option>
                        <option value="PRZEKAZANE DO FV">3. DO FAKTURY</option>
                        <option value="ROZLICZONE">3. ROZLICZONE</option>
                      </select>
                    </div>
                  </td>

                  <!-- Kwota netto (kliknij, aby zmienić) + FV zbiorcza -->
                  <td class="py-3 px-3 text-right">
                    <input
                      v-if="editingAmountId === o.id"
                      type="number"
                      step="0.01"
                      v-model="editingAmountVal"
                      @blur="commitInlineAmount(o)"
                      @keydown.enter.prevent="commitInlineAmount(o)"
                      @keydown.esc="editingAmountId = ''"
                      class="w-28 h-7 px-2 rounded-lg border border-[#58b347] bg-white text-right font-mono font-black text-xs text-slate-800 focus:outline-none"
                    />
                    <div
                      v-else
                      @click="startInlineAmount(o)"
                      class="font-black font-mono text-sm text-slate-800 whitespace-nowrap"
                      :class="auth.offerPermissions.canEdit ? 'cursor-pointer hover:text-[#499b3a]' : ''"
                      :title="auth.offerPermissions.canEdit ? 'Kliknij, aby szybko zmienić kwotę netto' : ''"
                    >
                      {{ formatMoney(o.total_netto) }}
                    </div>

                    <button
                      type="button"
                      :disabled="!auth.offerPermissions.canManageBilling"
                      @click="store.toggleCollective(o.id)"
                      class="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border transition-all cursor-pointer disabled:cursor-default"
                      :class="o.is_collective
                        ? 'bg-violet-50 text-violet-700 border-violet-300'
                        : 'bg-slate-50 text-slate-400 border-dashed border-slate-200 hover:border-violet-300 hover:text-violet-600'"
                    >
                      {{ o.is_collective ? 'FV zbiorcza' : '+ FV zbiorcza' }}
                    </button>
                  </td>

                  <!-- Dokumenty / Teczka Sprawy -->
                  <td class="py-3 px-3 text-center">
                    <div class="flex flex-col gap-1 items-center">
                      <a
                        v-if="o.pdf_url"
                        :href="o.pdf_url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="w-full px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black transition-colors"
                      >
                        PDF Oferty
                      </a>
                      <button
                        type="button"
                        @click="openCaseFolderModal(o)"
                        class="w-full px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black transition-colors cursor-pointer"
                        title="Podgląd plików i wgrywanie raportów / zdjęć na Dysk Google"
                      >
                        Teczka Sprawy
                      </button>
                    </div>
                  </td>

                  <!-- Akcje -->
                  <td class="py-3 px-3 text-center">
                    <div v-if="auth.offerPermissions.canEdit" class="flex flex-col gap-1">
                      <button
                        type="button"
                        @click="openCreatorModal(o, false)"
                        class="w-full px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        :class="o.pdf_url || o.snapshot
                          ? 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
                          : 'bg-[#58b347] hover:bg-[#499b3a] text-white shadow-xs'"
                      >
                        {{ o.pdf_url || o.snapshot ? 'Edytuj ofertę' : 'Wycena PDF' }}
                      </button>

                      <button
                        type="button"
                        @click="openCreatorModal(o, true)"
                        class="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Kopiuj nową
                      </button>

                      <button
                        v-if="(!o.offer_number || o.offer_number === '-') && o.status_offer !== 'ANULOWANE'"
                        type="button"
                        @click="openMergeModal(o)"
                        class="w-full px-2 py-1 rounded-lg border border-violet-200 bg-violet-50/70 hover:bg-violet-100 text-violet-800 text-[10px] font-extrabold transition-colors cursor-pointer"
                        title="Włącz tę prośbę / szkic do istniejącej oferty OES"
                      >
                        Włącz do OES
                      </button>
                    </div>
                    <span v-else class="text-[10px] font-bold text-slate-400">Podgląd</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================== -->
    <!-- WIDOK B: KATALOG USŁUG I CZĘŚCI + MAGAZYN sys_parts        -->
    <!-- ========================================================== -->
    <div v-else class="flex-1 flex flex-col overflow-hidden px-8 py-5">
      <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-3 flex-wrap">
            <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                @click="catalogSourceTab = 'OFFER_CATALOG'"
                class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                :class="catalogSourceTab === 'OFFER_CATALOG' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
              >
                Cennik ofert ({{ (store.catalog || []).length }})
              </button>
              <button
                type="button"
                @click="catalogSourceTab = 'WAREHOUSE'"
                class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                :class="catalogSourceTab === 'WAREHOUSE' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
              >
                Indeksy z magazynu ({{ (store.warehouseParts || []).length }})
              </button>
            </div>

            <div class="relative w-64">
              <input
                v-model="catalogSearch"
                type="text"
                placeholder="Szukaj kodu lub nazwy..."
                class="w-full h-9 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#58b347] focus:bg-white"
              />
            </div>
          </div>

          <form
            v-if="auth.offerPermissions.canEditCatalog && catalogSourceTab === 'OFFER_CATALOG'"
            @submit.prevent="submitNewCatalogItem"
            class="flex items-center gap-2 flex-wrap"
          >
            <select v-model="newCatalogItem.item_type" class="h-9 px-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <option value="SERVICE">Usługa</option>
              <option value="PART">Część</option>
            </select>
            <input v-model="newCatalogItem.code" type="text" placeholder="Kod / Indeks" class="h-9 w-28 px-3 rounded-xl border border-slate-200 text-xs font-bold font-mono" />
            <input v-model="newCatalogItem.name" type="text" required placeholder="Nazwa pozycji..." class="h-9 w-60 px-3 rounded-xl border border-slate-200 text-xs font-bold" />
            <input v-model.number="newCatalogItem.unit_price_pln" type="number" step="0.01" min="0" required placeholder="Cena netto" class="h-9 w-28 px-3 rounded-xl border border-slate-200 text-xs font-bold text-right" />
            <button
              type="submit"
              class="h-9 px-4 rounded-xl bg-[#58b347] hover:bg-[#499b3a] text-white text-[11px] font-black uppercase tracking-wider cursor-pointer"
            >
              + Dodaj pozycję
            </button>
          </form>
        </div>

        <!-- TABELA 1: CENNIK OFERTOWY (EDYCJA INLINE + USUWANIE) -->
        <div v-if="catalogSourceTab === 'OFFER_CATALOG'" class="flex-1 overflow-auto offers-scrollbar">
          <table class="w-full border-collapse text-left">
            <thead class="sticky top-0 bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th class="py-3 px-4 w-28">Typ</th>
                <th class="py-3 px-4 w-40">Kod / Indeks</th>
                <th class="py-3 px-4">Nazwa usługi / części</th>
                <th class="py-3 px-4 w-40 text-right">Cena jedn. netto</th>
                <th v-if="auth.offerPermissions.canEditCatalog" class="py-3 px-4 w-24 text-center">Akcje</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr v-for="item in filteredCatalog" :key="item.id" class="hover:bg-slate-50">
                <td class="py-2 px-4">
                  <span
                    class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase border"
                    :class="item.item_type === 'PART'
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
                  >
                    {{ item.item_type === 'PART' ? 'Część' : 'Usługa' }}
                  </span>
                </td>
                <td class="py-2 px-4">
                  <input
                    v-if="auth.offerPermissions.canEditCatalog"
                    type="text"
                    :value="item.code"
                    @blur="onUpdateCatalogRow(item, { code: $event.target.value })"
                    placeholder="-"
                    class="w-full px-2 py-1 rounded-lg font-mono font-bold text-slate-600 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-[#58b347] focus:outline-none"
                  />
                  <span v-else class="font-mono font-bold text-slate-500">{{ item.code || '-' }}</span>
                </td>
                <td class="py-2 px-4">
                  <input
                    v-if="auth.offerPermissions.canEditCatalog"
                    type="text"
                    :value="item.name"
                    @blur="onUpdateCatalogRow(item, { name: $event.target.value })"
                    class="w-full px-2 py-1 rounded-lg font-bold text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-[#58b347] focus:outline-none"
                  />
                  <span v-else class="font-bold text-slate-800">{{ item.name }}</span>
                </td>
                <td class="py-2 px-4 text-right">
                  <input
                    v-if="auth.offerPermissions.canEditCatalog"
                    type="number"
                    step="0.01"
                    :value="item.unit_price_pln"
                    @blur="onUpdateCatalogRow(item, { unit_price_pln: parseFloat($event.target.value) || 0 })"
                    class="w-32 px-2 py-1 rounded-lg text-right font-mono font-black text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-[#58b347] focus:outline-none"
                  />
                  <span v-else class="font-mono font-black text-slate-800">{{ formatMoney(item.unit_price_pln) }}</span>
                </td>
                <td v-if="auth.offerPermissions.canEditCatalog" class="py-2 px-4 text-center">
                  <button
                    type="button"
                    @click="onDeleteCatalogItem(item)"
                    class="px-2.5 py-1 rounded-lg text-[10px] font-black text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 cursor-pointer transition-colors"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TABELA 2: INDEKSY Z MAGAZYNU sys_parts -->
        <div v-else class="flex-1 overflow-auto offers-scrollbar">
          <div v-if="filteredWarehouseParts.length === 0" class="py-16 text-center text-xs font-bold text-slate-400">
            Brak części magazynowych pasujących do wyszukiwania.
          </div>
          <table v-else class="w-full border-collapse text-left">
            <thead class="sticky top-0 bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th class="py-3 px-4 w-44">Indeks SKU (sys_parts)</th>
                <th class="py-3 px-4 w-40">Kategoria</th>
                <th class="py-3 px-4">Nazwa części</th>
                <th class="py-3 px-4 w-36 text-right">Cena z magazynu</th>
                <th v-if="auth.offerPermissions.canEditCatalog" class="py-3 px-4 w-36 text-center">Cennik handlowy</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr v-for="wp in filteredWarehouseParts" :key="wp.id" class="hover:bg-slate-50">
                <td class="py-2.5 px-4 font-mono font-black text-sky-700">{{ wp.code || '-' }}</td>
                <td class="py-2.5 px-4 text-slate-500 font-bold">{{ wp.category || '-' }}</td>
                <td class="py-2.5 px-4 font-bold text-slate-800">{{ wp.name }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-black text-slate-700">{{ formatMoney(wp.unit_price_pln) }}</td>
                <td v-if="auth.offerPermissions.canEditCatalog" class="py-2.5 px-4 text-center">
                  <button
                    type="button"
                    @click="copyWarehousePartToCatalog(wp)"
                    class="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-black cursor-pointer transition-colors"
                  >
                    + Do cennika
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================== -->
    <!-- MODAL: SZYBKIE ZLECENIE ROBOCZE / SZKIC                    -->
    <!-- ========================================================== -->
    <Teleport to="body">
      <div
        v-if="showDraftModal"
        @click.self="showDraftModal = false"
        class="fixed inset-0 z-[2000] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-black uppercase tracking-widest text-slate-800">
              Szybkie zlecenie robocze (Do wyceny)
            </h3>
            <button type="button" @click="showDraftModal = false" class="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
          </div>

          <form @submit.prevent="submitDraftForm" class="p-6 space-y-4 overflow-y-auto offers-scrollbar bg-slate-50/40">
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Klient *</label>
              <input
                v-model="draftForm.client_name"
                list="offersClientsDatalist"
                required
                placeholder="Wybierz z bazy klientów lub wpisz..."
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#58b347]"
              />
              <datalist id="offersClientsDatalist">
                <option v-for="c in store.clients" :key="c.id || c.name" :value="c.name" />
              </datalist>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Stacja (QP)</label>
                <input v-model="draftForm.station_qp" type="text" placeholder="np. QP-20536" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold font-mono focus:outline-none focus:border-[#58b347]" />
              </div>
              <div>
                <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Lokalizacja</label>
                <input v-model="draftForm.station_location" type="text" placeholder="Miasto, ulica" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:border-[#58b347]" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Powiązane zgłoszenie (ID)</label>
                <input v-model="draftForm.ticket_ids" type="text" placeholder="np. 83340 lub EE_014" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold font-mono focus:outline-none focus:border-[#58b347]" />
              </div>
              <div>
                <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Zamówienie EEP / AC</label>
                <input v-model="draftForm.eep_order" type="text" placeholder="Opcjonalnie" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold font-mono focus:outline-none focus:border-[#58b347]" />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Tytuł / Przedmiot prac</label>
              <input v-model="draftForm.project_name" type="text" placeholder="np. Wymiana przewodu CCS" class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:border-[#58b347]" />
            </div>

            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Opis zakresu prac</label>
              <textarea v-model="draftForm.description" rows="2" placeholder="Opis usterki, potrzebnych części..." class="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:border-[#58b347] resize-none"></textarea>
            </div>

            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">Notatka wewnętrzna</label>
              <input v-model="draftForm.internal_notes" type="text" placeholder="Uwagi robocze..." class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:border-[#58b347]" />
            </div>

            <label class="flex items-center gap-2 text-xs font-extrabold text-violet-700 cursor-pointer">
              <input type="checkbox" v-model="draftForm.is_collective" class="rounded accent-violet-600" />
              <span>Rozliczenie w fakturze zbiorczej</span>
            </label>
          </form>

          <div class="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-2.5">
            <button type="button" @click="showDraftModal = false" class="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
              Anuluj
            </button>
            <button
              type="button"
              :disabled="store.isSaving"
              @click="submitDraftForm"
              class="px-5 py-2.5 rounded-xl bg-[#58b347] hover:bg-[#499b3a] text-white text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {{ store.isSaving ? 'Zapisywanie...' : 'Zapisz szkic' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- PEŁNY KREATOR OFERTY PDF (ETAP 3) -->
    <OfferCreatorModal
      :show="showCreatorModal"
      :initialOffer="creatorOfferObj"
      :isCopy="creatorIsCopy"
      :prefillTicket="creatorPrefillTicket"
      @close="showCreatorModal = false"
      @saved="onCreatorSaved"
    />

    <!-- MODAL: WŁĄCZENIE SZKICU ROBOCZEGO DO ISTNIEJĄCEJ OFERTY OES -->
    <Teleport to="body">
      <div
        v-if="showMergeModal"
        @click.self="showMergeModal = false"
        class="fixed inset-0 z-[2120] bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]">
          <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
            <h3 class="text-xs font-black uppercase tracking-widest">
              Włącz zlecenie robocze do istniejącej oferty OES
            </h3>
            <button type="button" @click="showMergeModal = false" class="text-slate-400 hover:text-white cursor-pointer">✕</button>
          </div>

          <div class="p-6 space-y-4 overflow-y-auto offers-scrollbar">
            <div v-if="mergeDraftOffer" class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span class="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Łączona pozycja robocza:</span>
              <span class="font-black text-slate-800">{{ mergeDraftOffer.client_name || 'Brak klienta' }}</span>
              <span v-if="mergeDraftOffer.station_qp" class="ml-2 font-mono font-black text-[#499b3a]">{{ mergeDraftOffer.station_qp }}</span>
              <span v-if="mergeDraftOffer.ticket_ids" class="ml-2 font-mono font-bold text-sky-700">#{{ mergeDraftOffer.ticket_ids }}</span>
            </div>

            <input
              v-model="mergeSearchQuery"
              type="text"
              placeholder="Filtruj oferty docelowe po numerze OES, kliencie lub QP..."
              class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#58b347]"
            />

            <div class="border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-72 overflow-y-auto offers-scrollbar">
              <div v-if="mergeCandidates.length === 0" class="py-8 text-center text-xs font-bold text-slate-400">
                Brak aktywnych ofert z nadanym numerem OES.
              </div>
              <label
                v-for="cand in mergeCandidates"
                :key="cand.id"
                class="p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                :class="selectedMergeTargetId === cand.id ? 'bg-[#f0f7f1]' : 'hover:bg-slate-50'"
              >
                <div class="flex items-start gap-2.5 min-w-0">
                  <input
                    type="radio"
                    name="mergeTargetRadio"
                    :value="cand.id"
                    v-model="selectedMergeTargetId"
                    class="mt-1 accent-[#58b347]"
                  />
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-black font-mono text-xs text-slate-800">{{ cand.offer_number }}</span>
                      <span
                        v-if="isSameMergeClient(cand)"
                        class="px-2 py-0.2 rounded-full bg-sky-100 text-sky-800 text-[9.5px] font-black uppercase"
                      >
                        Ten sam klient
                      </span>
                    </div>
                    <div class="text-[11px] text-slate-500 font-semibold truncate mt-0.5">
                      {{ cand.client_name }} • <span class="font-mono text-[#499b3a]">{{ cand.station_qp || '-' }}</span> • {{ cand.offer_date || '-' }}
                    </div>
                  </div>
                </div>
                <div class="font-mono font-black text-xs text-emerald-700 shrink-0">
                  {{ formatMoney(cand.total_netto) }}
                </div>
              </label>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2.5">
            <button type="button" @click="showMergeModal = false" class="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 cursor-pointer">
              Anuluj
            </button>
            <button
              type="button"
              :disabled="!selectedMergeTargetId || store.isSaving"
              @click="confirmMergeOffer"
              class="px-5 py-2 rounded-xl bg-[#58b347] hover:bg-[#499b3a] text-white text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {{ store.isSaving ? 'Łączenie...' : 'Połącz z wybraną ofertą' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL: TECZKA SPRAWY Z POZIOMU OFERT -->
    <Teleport to="body">
      <div
        v-if="showCaseFolderModal"
        @click.self="showCaseFolderModal = false"
        class="fixed inset-0 z-[2120] bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh]">
          <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
            <div class="min-w-0">
              <h3 class="text-xs font-black uppercase tracking-widest truncate">
                Teczka Sprawy: {{ caseFolderState.offer?.offer_number !== '-' ? caseFolderState.offer?.offer_number : (caseFolderState.offer?.client_name || 'Szkic') }}
              </h3>
              <div class="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                {{ caseFolderState.folderName || 'Ładowanie ścieżki na Dysku Google...' }}
              </div>
            </div>
            <button type="button" @click="showCaseFolderModal = false" class="text-slate-400 hover:text-white cursor-pointer shrink-0">✕</button>
          </div>

          <div class="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <input
              ref="caseFileInputRef"
              type="file"
              class="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              @change="onCaseFileSelected"
            />
            <div class="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                :disabled="caseFolderState.uploading"
                @click="triggerCaseUpload('[RAPORT]')"
                class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                + Wgraj Raport
              </button>
              <button
                type="button"
                :disabled="caseFolderState.uploading"
                @click="triggerCaseUpload('[DIAGNOZA]')"
                class="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                + Wgraj Załącznik / Zdjęcie
              </button>
            </div>

            <div class="flex items-center gap-2">
              <a
                v-if="caseFolderState.ofertyFolderUrl"
                :href="caseFolderState.ofertyFolderUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider"
              >
                Folder Ofert QP
              </a>
              <a
                v-if="caseFolderState.folderUrl"
                :href="caseFolderState.folderUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider"
              >
                Dysk Google ↗
              </a>
            </div>
          </div>

          <div class="p-6 flex-1 overflow-y-auto offers-scrollbar space-y-2">
            <div v-if="caseFolderState.loading || caseFolderState.uploading" class="py-12 text-center text-xs font-bold text-slate-400 animate-pulse">
              {{ caseFolderState.uploading ? 'Przesyłanie pliku do Teczki Sprawy na Dysku Google...' : 'Pobieranie zawartości teczki z Dysku Google...' }}
            </div>

            <div v-else-if="caseFolderState.error" class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
              {{ caseFolderState.error }}
            </div>

            <div v-else-if="caseFolderState.files.length === 0" class="py-12 text-center text-xs font-bold text-slate-400">
              Teczka sprawy jest jeszcze pusta.
            </div>

            <div
              v-else
              v-for="f in caseFolderState.files"
              :key="f.id"
              class="p-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3 min-w-0">
                <img
                  v-if="f.thumbUrl"
                  :src="f.thumbUrl"
                  alt=""
                  class="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                  :class="f.category === 'OFERTA' ? 'bg-rose-50 text-rose-700 border border-rose-200' : (f.category === 'RAPORT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600')"
                >
                  {{ f.category }}
                </div>

                <div class="min-w-0">
                  <a :href="f.url" target="_blank" rel="noopener noreferrer" class="font-extrabold text-xs text-slate-800 hover:text-[#58b347] truncate block">
                    {{ f.name }}
                  </a>
                  <div class="text-[10px] font-semibold text-slate-400 mt-0.5">
                    {{ f.category }} • {{ f.updated || '-' }}
                  </div>
                </div>
              </div>

              <a
                :href="f.url"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#58b347] text-slate-700 hover:text-[#499b3a] text-[10px] font-black uppercase shrink-0"
              >
                Otwórz
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useOffersStore } from '../../stores/useOffersStore'
import { useAuthStore } from '../../stores/useAuthStore'
import OfferCreatorModal from '../../modals/OfferCreatorModal.vue'

const store = useOffersStore()
const auth = useAuthStore()

// Filtry i zakładki
const activeTab = ref('ACTIVE')
const searchQuery = ref('')
const filterClient = ref('')
const filterMonth = ref('')
const filterStatusOffer = ref('')
const includeArchived = ref(false)
const groupByClient = ref(false)
const highlightedOfferId = ref('')

// Katalog
const catalogSearch = ref('')
const newCatalogItem = ref({
  item_type: 'SERVICE',
  code: '',
  name: '',
  unit_price_pln: 0
})

// Modal szybkiego szkicu
const showDraftModal = ref(false)
const draftForm = ref({
  client_name: '',
  station_qp: '',
  station_location: '',
  ticket_ids: '',
  eep_order: '',
  project_name: '',
  description: '',
  internal_notes: '',
  is_collective: false
})

// Stan pełnego Kreatora PDF
const showCreatorModal = ref(false)
const creatorOfferObj = ref(null)
const creatorIsCopy = ref(false)
const creatorPrefillTicket = ref(null)

const formatMoney = (val) => {
  const num = Number(val) || 0
  return num.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł'
}

const formatShortDate = (raw) => {
  if (!raw) return '-'
  const clean = String(raw).replace(' ', 'T').substring(0, 10)
  const parts = clean.split('-')
  return parts.length === 3 ? `${parts[2]}.${parts[1]}` : clean
}

const splitTokens = (raw) => {
  return String(raw || '').split(/[,;\s]+/).map(s => s.trim()).filter(Boolean)
}

const viewTabs = computed(() => {
  const all = store.offers || []
  const unscheduledCount = all.filter(o =>
    !store.isOfferArchived(o) &&
    o.status_exec !== 'ZREALIZOWANO' &&
    (!o.scheduledVisits || o.scheduledVisits.length === 0)
  ).length

  return [
    { id: 'ACTIVE', label: 'Aktywne (W toku)', count: store.kpiStats.activeCount },
    { id: 'DRAFTS', label: 'Robocze / Do wyceny', count: store.kpiStats.draftsCount },
    { id: 'UNSCHEDULED', label: 'Bez wizyty w grafiku', count: unscheduledCount },
    { id: 'READY_TO_BILL', label: 'Gotowe do FV (Są raporty)', count: store.kpiStats.readyToBillCount },
    { id: 'MISSING_REPORT', label: 'Zrealizowane bez raportu', count: store.kpiStats.missingReportCount },
    { id: 'COLLECTIVE', label: 'Faktury zbiorcze', count: store.kpiStats.collectiveCount },
    { id: 'FLAGGED', label: 'Wymagają uwagi', count: store.kpiStats.flaggedCount },
    { id: 'ARCHIVE', label: 'Zamknięte / Archiwum', count: store.kpiStats.archiveCount },
    { id: 'CATALOG', label: 'Cennik i Części', count: (store.catalog || []).length }
  ]
})

const switchTab = (tabId) => {
  activeTab.value = tabId
  if (tabId === 'COLLECTIVE') groupByClient.value = true
}

const selectCollectiveTab = () => {
  activeTab.value = 'COLLECTIVE'
  groupByClient.value = true
}

const uniqueClientsList = computed(() => {
  const set = new Set()
  ;(store.offers || []).forEach(o => {
    if (o.client_name) set.add(o.client_name.trim())
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'))
})

const uniqueMonthsList = computed(() => {
  const set = new Set()
  ;(store.offers || []).forEach(o => {
    if (o.monthKey) set.add(o.monthKey)
  })
  return Array.from(set).sort().reverse()
})

const filteredOffers = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()

  return (store.offers || []).filter(o => {
    const archived = store.isOfferArchived(o)
    const hasRep = Boolean(o.hasReport || (o.visitReports && o.visitReports.length > 0))

    if (activeTab.value === 'ARCHIVE') {
      if (!archived) return false
    } else if (activeTab.value === 'FLAGGED') {
      if (!o.is_flagged) return false
    } else if (activeTab.value === 'DRAFTS') {
      if (archived) return false
      if (o.offer_number && o.offer_number !== '-' && o.status_offer !== 'PRZYGOTOWANIE') return false
    } else if (activeTab.value === 'UNSCHEDULED') {
      if (archived || o.status_exec === 'ZREALIZOWANO') return false
      if (o.scheduledVisits && o.scheduledVisits.length > 0) return false
    } else if (activeTab.value === 'READY_TO_BILL') {
      if (o.status_offer === 'ANULOWANE' || o.status_billing !== 'NIEROZLICZONE' || !hasRep) return false
    } else if (activeTab.value === 'MISSING_REPORT') {
      if (o.status_offer === 'ANULOWANE' || o.status_exec !== 'ZREALIZOWANO' || hasRep) return false
    } else if (activeTab.value === 'COLLECTIVE') {
      if (o.status_offer === 'ANULOWANE' || !o.is_collective) return false
      if (!includeArchived.value && archived) return false
    } else {
      if (!includeArchived.value && archived) return false
    }

    if (filterClient.value && o.client_name !== filterClient.value) return false
    if (filterMonth.value && o.monthKey !== filterMonth.value) return false
    if (filterStatusOffer.value && o.status_offer !== filterStatusOffer.value) return false

    if (q) {
      const hay = [
        o.offer_number, o.client_name, o.client_nip, o.station_qp,
        o.station_location, o.ticket_ids, o.eep_order, o.project_name,
        o.description, o.internal_notes, o.author, o.requested_by
      ].join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
})

const groupedOfferRows = computed(() => {
  const list = filteredOffers.value
  if (!groupByClient.value) {
    return [{ key: 'ALL', clientName: '', sumNetto: 0, items: list }]
  }

  const map = new Map()
  list.forEach(o => {
    const name = o.client_name || 'Bez przypisanego klienta'
    if (!map.has(name)) map.set(name, [])
    map.get(name).push(o)
  })

  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'pl'))
    .map(([clientName, items]) => ({
      key: clientName,
      clientName,
      sumNetto: items.reduce((acc, x) => x.status_offer !== 'ANULOWANE' ? acc + (Number(x.total_netto) || 0) : acc, 0),
      items
    }))
})

const filteredCatalog = computed(() => {
  const q = catalogSearch.value.toLowerCase().trim()
  if (!q) return store.catalog || []
  return (store.catalog || []).filter(item =>
    `${item.code} ${item.name} ${item.item_type}`.toLowerCase().includes(q)
  )
})

// Style wierszy i etapów
const getRowHighlightClass = (o) => {
  if (o.is_flagged) return 'bg-rose-50/70'
  if (o.status_offer === 'ANULOWANE' || o.status_exec === 'ANULOWANE') return 'bg-slate-100/70 opacity-65'
  if (o.status_billing === 'ROZLICZONE' || o.status_billing === 'PRZEKAZANE DO FV') return 'bg-emerald-50/45'
  if (o.status_offer === 'PRZYGOTOWANIE' || !o.offer_number || o.offer_number === '-') return 'bg-amber-50/45'
  return 'bg-white'
}

const getOfferStageClass = (st) => {
  if (st === 'ZAAKCEPTOWANA') return 'bg-emerald-50 text-emerald-800 border-emerald-200'
  if (st === 'OCZEKUJE NA AKCEPTACJE') return 'bg-sky-50 text-sky-800 border-sky-200'
  if (st === 'ANULOWANE') return 'bg-slate-100 text-slate-500 border-slate-200'
  return 'bg-amber-50 text-amber-800 border-amber-200'
}

const getExecStageClass = (st) => {
  if (st === 'ZREALIZOWANO') return 'bg-emerald-50 text-emerald-800 border-emerald-200'
  if (st === 'W TOKU') return 'bg-sky-50 text-sky-800 border-sky-200'
  if (st === 'ANULOWANE') return 'bg-slate-100 text-slate-500 border-slate-200'
  return 'bg-amber-50 text-amber-800 border-amber-200'
}

const getBillStageClass = (st) => {
  if (st === 'ROZLICZONE' || st === 'PRZEKAZANE DO FV') return 'bg-emerald-50 text-emerald-800 border-emerald-200'
  return 'bg-amber-50 text-amber-800 border-amber-200'
}

// Akcje w tabeli
const onStatusOfferChange = async (offer, nextStatus) => {
  await store.updateOfferField(offer.id, 'status_offer', nextStatus)
  if (nextStatus === 'ANULOWANE') {
    await store.updateOfferField(offer.id, 'status_exec', 'ANULOWANE')
  }
}

const onInlineNoteBlur = (offer, nextVal) => {
  const clean = String(nextVal || '').trim()
  if (clean === String(offer.internal_notes || '').trim()) return
  store.updateOfferField(offer.id, 'internal_notes', clean)
}

const markGroupAsCollective = async (items) => {
  for (const item of items) {
    if (!item.is_collective) {
      await store.updateOfferField(item.id, 'is_collective', 'TAK')
    }
  }
}

// Modal szybkiego zlecenia roboczego
const openDraftModal = (prefill = null) => {
  draftForm.value = {
    client_name: prefill?.client_name || '',
    station_qp: prefill?.station_qp || '',
    station_location: prefill?.station_location || '',
    ticket_ids: prefill?.ticket_ids || '',
    eep_order: prefill?.eep_order || '',
    project_name: prefill?.project_name || '',
    description: prefill?.description || '',
    internal_notes: prefill?.internal_notes || '',
    is_collective: false
  }
  showDraftModal.value = true
}

const submitDraftForm = async () => {
  if (!draftForm.value.client_name.trim()) return
  const res = await store.requestOfferFromTicket(draftForm.value)
  if (res && res.success) {
    showDraftModal.value = false
    activeTab.value = 'DRAFTS'
  } else {
    alert(res?.error || 'Nie udało się zapisać szkicu.')
  }
}

const submitNewCatalogItem = async () => {
  if (!newCatalogItem.value.name.trim()) return
  const res = await store.saveCatalogItem({ ...newCatalogItem.value })
  if (res && res.success) {
    newCatalogItem.value = { item_type: 'SERVICE', code: '', name: '', unit_price_pln: 0 }
  } else {
    alert(res?.error || 'Nie udało się dodać pozycji do katalogu.')
  }
}

// --- NOWE FUNKCJE OPERACYJNE (ETAP 5B) ---
const catalogSourceTab = ref('OFFER_CATALOG')
const editingAmountId = ref('')
const editingAmountVal = ref(0)
const sendingTicketOfferId = ref('')

const filteredWarehouseParts = computed(() => {
  const q = catalogSearch.value.toLowerCase().trim()
  if (!q) return store.warehouseParts || []
  return (store.warehouseParts || []).filter(wp =>
    `${wp.code} ${wp.name} ${wp.category}`.toLowerCase().includes(q)
  )
})

const isMergedDraft = (offer) => {
  return String(offer?.internal_notes || '').toLowerCase().includes('włączono do oferty')
}

const onInlineFieldBlur = (offer, fieldName, rawVal) => {
  const clean = String(rawVal || '').trim()
  if (clean === String(offer[fieldName] || '').trim()) return
  store.updateOfferField(offer.id, fieldName, clean)
}

const startInlineAmount = (offer) => {
  if (!auth.offerPermissions.canEdit) return
  editingAmountId.value = offer.id
  editingAmountVal.value = Number(offer.total_netto) || 0
}

const commitInlineAmount = async (offer) => {
  if (editingAmountId.value !== offer.id) return
  const num = parseFloat(String(editingAmountVal.value).replace(',', '.')) || 0
  editingAmountId.value = ''
  if (num === (Number(offer.total_netto) || 0)) return
  await store.updateOfferField(offer.id, 'total_netto', num)
}

// Edycja i usuwanie w cenniku
const onUpdateCatalogRow = async (item, patch) => {
  const nextCode = patch.code !== undefined ? String(patch.code || '').trim() : item.code
  const nextName = patch.name !== undefined ? String(patch.name || '').trim() : item.name
  const nextPrice = patch.unit_price_pln !== undefined ? (Number(patch.unit_price_pln) || 0) : item.unit_price_pln

  if (!nextName) return
  if (nextCode === item.code && nextName === item.name && nextPrice === item.unit_price_pln) return

  await store.saveCatalogItem({
    ...item,
    code: nextCode,
    name: nextName,
    unit_price_pln: nextPrice
  })
}

const onDeleteCatalogItem = async (item) => {
  if (!confirm(`Usunąć pozycję "${item.name}" z cennika ofertowego?`)) return
  const res = await store.deleteCatalogItem(item.id)
  if (!res || !res.success) {
    alert(res?.error || 'Nie udało się usunąć pozycji.')
  }
}

const copyWarehousePartToCatalog = async (wp) => {
  const res = await store.saveCatalogItem({
    item_type: 'PART',
    code: wp.code || '',
    name: wp.name || '',
    unit_price_pln: Number(wp.unit_price_pln) || 0
  })
  if (res && res.success) {
    catalogSourceTab.value = 'OFFER_CATALOG'
  } else {
    alert(res?.error || 'Nie udało się skopiować części do cennika.')
  }
}

// Wysyłanie oferty do realizacji (tworzy EE_XXX w sys_tickets i Backlogu Harmonogramu)
const handleSendToTickets = async (offer) => {
  const label = offer.offer_number && offer.offer_number !== '-' ? offer.offer_number : (offer.client_name || offer.id)
  if (!confirm(`Utworzyć zgłoszenie realizacyjne (EE_XXX) w Zgłoszeniach i Backlogu Harmonogramu dla "${label}"?`)) return

  sendingTicketOfferId.value = offer.id
  try {
    const res = await store.sendOfferToTickets(offer.id)
    if (res && res.success) {
      alert(res.message || `Utworzono zgłoszenie ${res.ticketNumber}.`)
    } else {
      alert(res?.error || 'Nie udało się utworzyć zgłoszenia.')
    }
  } finally {
    sendingTicketOfferId.value = ''
  }
}

// Modal scalania szkicu do istniejącej oferty OES
const showMergeModal = ref(false)
const mergeDraftOffer = ref(null)
const mergeSearchQuery = ref('')
const selectedMergeTargetId = ref('')

const openMergeModal = (draft) => {
  mergeDraftOffer.value = draft
  mergeSearchQuery.value = ''
  selectedMergeTargetId.value = ''
  showMergeModal.value = true
}

const isSameMergeClient = (cand) => {
  const srcClient = String(mergeDraftOffer.value?.client_name || '').trim().toLowerCase()
  if (!srcClient) return false
  return String(cand.client_name || '').trim().toLowerCase() === srcClient
}

const mergeCandidates = computed(() => {
  const q = mergeSearchQuery.value.toLowerCase().trim()
  const draftId = mergeDraftOffer.value?.id

  const list = (store.offers || []).filter(x =>
    x.id !== draftId &&
    x.offer_number &&
    x.offer_number !== '-' &&
    x.status_offer !== 'ANULOWANE'
  )

  const filtered = q
    ? list.filter(x => `${x.offer_number} ${x.client_name} ${x.station_qp} ${x.offer_date}`.toLowerCase().includes(q))
    : list

  return [...filtered].sort((a, b) => (isSameMergeClient(b) ? 1 : 0) - (isSameMergeClient(a) ? 1 : 0))
})

const confirmMergeOffer = async () => {
  if (!mergeDraftOffer.value || !selectedMergeTargetId.value) return
  const res = await store.mergeOfferIntoExisting(mergeDraftOffer.value.id, selectedMergeTargetId.value)
  if (res && res.success) {
    showMergeModal.value = false
  } else {
    alert(res?.error || 'Nie udało się połączyć ofert.')
  }
}

// Modal Teczki Sprawy (podgląd plików i dogrywanie raportów / załączników)
const showCaseFolderModal = ref(false)
const caseFileInputRef = ref(null)
const pendingUploadTag = ref('[DIAGNOZA]')
const caseFolderState = ref({
  offer: null,
  loading: false,
  uploading: false,
  error: '',
  folderName: '',
  folderUrl: '',
  ofertyFolderUrl: '',
  files: []
})

const openCaseFolderModal = async (offer) => {
  caseFolderState.value = {
    offer,
    loading: true,
    uploading: false,
    error: '',
    folderName: '',
    folderUrl: '',
    ofertyFolderUrl: '',
    files: []
  }
  showCaseFolderModal.value = true

  const res = await store.fetchOfferCaseFolder(offer.id)
  if (res && res.success) {
    caseFolderState.value.loading = false
    caseFolderState.value.folderName = res.folderName || ''
    caseFolderState.value.folderUrl = res.folderUrl || ''
    caseFolderState.value.ofertyFolderUrl = res.ofertyFolderUrl || ''
    caseFolderState.value.files = res.files || []
  } else {
    caseFolderState.value.loading = false
    caseFolderState.value.error = res?.error || 'Nie udało się pobrać zawartości teczki.'
  }
}

const triggerCaseUpload = (tag) => {
  pendingUploadTag.value = tag
  if (caseFileInputRef.value) {
    caseFileInputRef.value.value = ''
    caseFileInputRef.value.click()
  }
}

const onCaseFileSelected = (e) => {
  const file = e.target.files?.[0]
  const offer = caseFolderState.value.offer
  if (!file || !offer) return

  caseFolderState.value.uploading = true
  caseFolderState.value.error = ''

  const reader = new FileReader()
  reader.onload = async (ev) => {
    const res = await store.uploadFileToOfferFolder({
      offerId: offer.id,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      base64Data: ev.target.result,
      categoryTag: pendingUploadTag.value
    })
    caseFolderState.value.uploading = false
    if (res && res.success) {
      caseFolderState.value.folderName = res.folderName || caseFolderState.value.folderName
      caseFolderState.value.folderUrl = res.folderUrl || caseFolderState.value.folderUrl
      caseFolderState.value.ofertyFolderUrl = res.ofertyFolderUrl || caseFolderState.value.ofertyFolderUrl
      caseFolderState.value.files = res.files || []
    } else {
      caseFolderState.value.error = res?.error || 'Błąd podczas zapisywania pliku na Dysku Google.'
    }
  }
  reader.readAsDataURL(file)
}

const openCreatorModal = (offerObj = null, isCopy = false, prefillTicket = null) => {
  creatorOfferObj.value = offerObj
  creatorIsCopy.value = Boolean(isCopy)
  creatorPrefillTicket.value = prefillTicket
  showCreatorModal.value = true
}

const onCreatorSaved = (res) => {
  activeTab.value = 'ACTIVE'
  if (res && res.id) {
    highlightedOfferId.value = res.id
    setTimeout(() => { highlightedOfferId.value = '' }, 4000)
  }
}

// Obsługa głębokiego przejścia ze Zgłoszeń
const consumePendingNavigation = () => {
  if (store.pendingOpenOfferId) {
    const target = (store.offers || []).find(o => o.id === store.pendingOpenOfferId)
    if (target) {
      searchQuery.value = ''
      filterClient.value = ''
      filterMonth.value = ''
      filterStatusOffer.value = ''
      activeTab.value = store.isOfferArchived(target) ? 'ARCHIVE' : 'ACTIVE'
      highlightedOfferId.value = target.id
      setTimeout(() => { highlightedOfferId.value = '' }, 5000)
    }
    store.pendingOpenOfferId = null
  }

  if (store.pendingDraftFromTicket) {
    const prefill = store.pendingDraftFromTicket
    store.pendingDraftFromTicket = null
    if (auth.offerPermissions.canGeneratePdf) {
      openCreatorModal(null, false, prefill)
    } else {
      openDraftModal(prefill)
    }
  }
}

watch(
  () => [store.pendingOpenOfferId, store.pendingDraftFromTicket],
  () => consumePendingNavigation()
)

onMounted(async () => {
  await store.fetchOffersData()
  consumePendingNavigation()
})
</script>

<style scoped>
.offers-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.offers-scrollbar::-webkit-scrollbar-track { background: transparent; }
.offers-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.35); border-radius: 10px; }
.offers-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.8); }
</style>