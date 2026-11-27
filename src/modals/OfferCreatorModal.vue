<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[2100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 md:p-4"
      @click.self="emit('close')"
    >
      <div class="bg-[#f4f6f8] rounded-3xl shadow-2xl border border-slate-200 w-full h-full max-w-[1600px] max-h-[96vh] flex flex-col overflow-hidden">

        <!-- NAGŁÓWEK -->
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-[#58b347] text-white flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <div class="min-w-0">
              <h3 class="text-sm font-black uppercase tracking-widest truncate">
                {{ modalHeading }}
              </h3>
              <div class="text-[11px] text-slate-400 font-semibold truncate">
                Numer: <span class="text-[#7ce368] font-mono font-bold">{{ form.offerNumber || '-' }}</span>
                <span v-if="form.ticketIds" class="ml-2">• Zgłoszenie: <span class="text-sky-300 font-mono">#{{ form.ticketIds }}</span></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="emit('close')"
            class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        <!-- CIAŁO 2-KOLUMNOWE -->
        <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden min-h-0">

          <!-- LEWA KOLUMNA: FORMULARZ KREATORA -->
          <div class="lg:col-span-7 overflow-y-auto creator-scrollbar space-y-4 pr-1">

            <!-- BANER TRYBU EDYCJI -->
            <div
              v-if="isEditingExisting"
              class="px-4 py-2.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between flex-wrap gap-2"
            >
              <div class="text-xs font-bold text-sky-900">
                Tryb edycji oferty <span class="font-mono font-black">{{ initialOffer?.offer_number || initialOffer?.id }}</span>.
                <span v-if="isRevisionMode" class="text-sky-700">Zaproponowano kolejną rewizję numeru.</span>
              </div>
              <button
                v-if="isRevisionMode"
                type="button"
                @click="assignFreshNumber"
                class="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
              >
                Nadaj nowy numer OES
              </button>
            </div>

            <!-- SEKCJA 1: DOKUMENT I NABYWCA -->
            <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">1. Dokument i Nabywca</span>
                <span
                  v-if="clientAutoFilled"
                  class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black"
                >
                  ✓ Uzupełniono z bazy
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="col-span-2 sm:col-span-2">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Numer oferty</label>
                  <input
                    v-model="form.offerNumber"
                    @input="manualNumberEdited = true"
                    type="text"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-black font-mono text-[#499b3a] focus:outline-none focus:border-[#58b347]"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Data wystawienia</label>
                  <input
                    v-model="form.offerDate"
                    type="date"
                    class="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#58b347]"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Ważność</label>
                  <input
                    v-model="form.validUntil"
                    type="text"
                    placeholder="14 dni"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#58b347]"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div class="sm:col-span-5">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Nazwa klienta *</label>
                  <input
                    v-model="form.clientName"
                    @input="onClientNameInput"
                    list="creatorClientsDatalist"
                    required
                    placeholder="Wybierz z bazy lub wpisz nazwę..."
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-800 focus:outline-none focus:border-[#58b347]"
                  />
                  <datalist id="creatorClientsDatalist">
                    <option v-for="c in mergedClientsSuggestions" :key="c.name" :value="c.name" />
                  </datalist>
                </div>
                <div class="sm:col-span-3">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">NIP</label>
                  <input
                    v-model="form.clientNip"
                    type="text"
                    placeholder="NIP"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-[#58b347]"
                  />
                </div>
                <div class="sm:col-span-4">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Sporządził</label>
                  <input
                    v-model="form.author"
                    type="text"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-[#58b347]"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Adres nabywcy</label>
                  <input
                    v-model="form.clientAddress"
                    type="text"
                    placeholder="Ulica, kod pocztowy, miasto"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#58b347]"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Kontakt (Osoba / Email / Tel)</label>
                  <input
                    v-model="form.clientContact"
                    type="text"
                    placeholder="jan@firma.pl, +48..."
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#58b347]"
                  />
                </div>
              </div>
            </div>

            <!-- SEKCJA 2: STACJE QP I ZAKRES PRAC -->
            <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">2. Obiekty / Stacje QP i Opis prac</span>
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    @click="showPasteStations = !showPasteStations"
                    class="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Wklej z Excela
                  </button>
                  <button
                    type="button"
                    @click="addStationRow()"
                    class="px-2.5 py-1 rounded-lg border border-[#58b347]/40 bg-[#f0f7f1] hover:bg-[#58b347] text-[#499b3a] hover:text-white text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    + Stacja
                  </button>
                </div>
              </div>

              <!-- Box wklejania stacji z Excela -->
              <div v-if="showPasteStations" class="p-3 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
                <div class="text-[10px] font-bold text-sky-800">
                  Wklej wiersze z Excela (kolumny rozdzielone tabulatorem lub średnikiem): <span class="font-mono">QP-20536 ; Gdańsk, ul. Morska 4 ; Axon Easy</span>
                </div>
                <textarea
                  v-model="pasteStationsRaw"
                  rows="3"
                  placeholder="QP-20536	Gdańsk, ul. Morska 4	Axon Easy"
                  class="w-full p-2.5 rounded-lg border border-sky-200 bg-white text-xs font-mono focus:outline-none focus:border-sky-400"
                ></textarea>
                <div class="flex justify-end gap-2">
                  <button type="button" @click="showPasteStations = false" class="px-3 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-white cursor-pointer">Anuluj</button>
                  <button type="button" @click="parsePastedStations" class="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black uppercase cursor-pointer">Załaduj stacje</button>
                </div>
              </div>

              <!-- Lista stacji -->
              <div class="space-y-1.5">
                <div
                  v-for="(st, idx) in form.stations"
                  :key="st.uid"
                  class="grid grid-cols-12 gap-2 items-center"
                >
                  <input
                    v-model="st.qp"
                    type="text"
                    placeholder="Numer QP"
                    class="col-span-3 h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-black font-mono text-[#499b3a] focus:outline-none focus:border-[#58b347]"
                  />
                  <input
                    v-model="st.location"
                    type="text"
                    placeholder="Lokalizacja stacji"
                    class="col-span-5 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#58b347]"
                  />
                  <input
                    v-model="st.model"
                    type="text"
                    placeholder="Model / Uwagi"
                    class="col-span-3 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:border-[#58b347]"
                  />
                  <div class="col-span-1 text-right">
                    <button
                      type="button"
                      @click="removeStationRow(idx)"
                      class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black text-xs cursor-pointer"
                      title="Usuń stację"
                    >✕</button>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                <div class="sm:col-span-6">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-sky-700 mb-1">Tytuł oferty / Projekt (nagłówek PDF)</label>
                  <input
                    v-model="form.projectName"
                    type="text"
                    placeholder="np. Wymiana przewodu ładowania CCS"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-800 focus:outline-none focus:border-[#58b347]"
                  />
                </div>
                <div class="sm:col-span-3">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Zamówienie EEP / AC</label>
                  <input
                    v-model="form.eepOrder"
                    type="text"
                    placeholder="np. 8145"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-[#58b347]"
                  />
                </div>
                <div class="sm:col-span-3">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">ID Zgłoszeń (sys)</label>
                  <input
                    v-model="form.ticketIds"
                    type="text"
                    placeholder="np. 83340, EE_014"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold font-mono text-slate-700 focus:outline-none focus:border-[#58b347]"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div class="sm:col-span-7">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-1">Opis dla klienta (widoczny na PDF)</label>
                  <textarea
                    v-model="form.offerDescription"
                    rows="2"
                    placeholder="Opis zakresu prac dla klienta..."
                    class="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#58b347] resize-none"
                  ></textarea>
                </div>
                <div class="sm:col-span-5">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-rose-600 mb-1">Notatka wewnętrzna (tylko rejestr)</label>
                  <textarea
                    v-model="form.internalNotes"
                    rows="2"
                    placeholder="Uwagi robocze niewidoczne na PDF..."
                    class="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#58b347] resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- SEKCJA 3: KOSZTORYS -->
            <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">3. Pozycje kosztorysowe (Netto)</span>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    @click="addItemRow('manual')"
                    class="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    + Własna pozycja
                  </button>
                  <button
                    type="button"
                    @click="addItemRow('catalog_search')"
                    class="px-2.5 py-1 rounded-lg border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-700 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    + Z Magazynu / Indeksów
                  </button>
                  <button
                    type="button"
                    @click="addItemRow('service')"
                    class="px-3 py-1 rounded-lg bg-[#58b347] hover:bg-[#499b3a] text-white text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    + Z Cennika
                  </button>
                </div>
              </div>

              <!-- Nagłówki kolumn -->
              <div class="grid grid-cols-12 gap-2 px-2 text-[9.5px] font-black uppercase tracking-wider text-slate-400">
                <div class="col-span-5">Nazwa usługi / części</div>
                <div class="col-span-2 text-center">Ilość</div>
                <div class="col-span-2 text-right">Cena jedn.</div>
                <div class="col-span-2 text-right">Łącznie</div>
                <div class="col-span-1"></div>
              </div>

              <!-- Wiersze pozycji -->
              <div class="space-y-2">
                <div
                  v-for="(item, idx) in form.items"
                  :key="item.uid"
                  class="p-2 rounded-xl bg-slate-50 border border-slate-200/90 grid grid-cols-12 gap-2 items-center relative"
                >
                  <!-- Nazwa wg trybu wiersza -->
                  <div class="col-span-5 relative">
                    <select
                      v-if="item.mode === 'service'"
                      :value="item.name"
                      @change="onPickServiceItem(item, $event.target.value)"
                      class="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#58b347]"
                    >
                      <option value="">-- Wybierz z cennika --</option>
                      <option v-for="srv in serviceCatalog" :key="srv.id" :value="srv.name">
                        {{ srv.name }} ({{ formatMoney(srv.unit_price_pln) }})
                      </option>
                      <option v-if="item.name && !serviceCatalog.some(s => s.name === item.name)" :value="item.name">
                        {{ item.name }}
                      </option>
                    </select>

                    <div v-else-if="item.mode === 'catalog_search'" class="relative" @click.stop>
                      <input
                        v-model="item.name"
                        @focus="activeAutocompleteUid = item.uid"
                        @click.stop="activeAutocompleteUid = item.uid"
                        @input="activeAutocompleteUid = item.uid"
                        type="text"
                        placeholder="Wpisz SKU z magazynu lub nazwę części..."
                        class="w-full h-8 px-2.5 rounded-lg border border-sky-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                      />
                      <div
                        v-if="activeAutocompleteUid === item.uid && getCatalogSuggestions(item.name).length > 0"
                        class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-40 max-h-56 overflow-y-auto creator-scrollbar divide-y divide-slate-100"
                      >
                        <div
                          v-for="cand in getCatalogSuggestions(item.name)"
                          :key="cand.id"
                          @mousedown.prevent="applyCatalogSuggestion(item, cand)"
                          class="px-3 py-2 hover:bg-[#f0f7f1] cursor-pointer flex items-center justify-between gap-2 text-xs"
                        >
                          <div class="min-w-0 flex items-center gap-1.5 flex-wrap">
                            <span
                              class="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase tracking-wider border shrink-0"
                              :class="cand.item_type === 'WAREHOUSE_PART'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
                            >
                              {{ cand.item_type === 'WAREHOUSE_PART' ? 'MAGAZYN' : 'CENNIK' }}
                            </span>
                            <span v-if="cand.code" class="font-mono font-black text-sky-700">{{ cand.code }}</span>
                            <span class="font-bold text-slate-800 truncate">{{ cand.name }}</span>
                          </div>
                          <span class="font-mono font-black text-emerald-700 shrink-0">{{ formatMoney(cand.unit_price_pln) }}</span>
                        </div>
                      </div>
                    </div>

                    <input
                      v-else
                      v-model="item.name"
                      type="text"
                      placeholder="Nazwa pozycji..."
                      class="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#58b347]"
                    />
                  </div>

                  <!-- Ilość -->
                  <div class="col-span-2">
                    <input
                      v-model.number="item.qty"
                      type="number"
                      min="0.01"
                      step="any"
                      class="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-black text-center text-slate-800 focus:outline-none focus:border-[#58b347]"
                    />
                  </div>

                  <!-- Cena jednostkowa -->
                  <div class="col-span-2">
                    <input
                      v-model.number="item.unitPln"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      class="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-black text-right font-mono text-slate-800 focus:outline-none focus:border-[#58b347]"
                    />
                  </div>

                  <!-- Suma wiersza -->
                  <div class="col-span-2 text-right font-mono font-black text-xs text-slate-800 whitespace-nowrap">
                    {{ formatMoney((Number(item.qty) || 0) * (Number(item.unitPln) || 0)) }}
                  </div>

                  <!-- Usuń -->
                  <div class="col-span-1 text-right">
                    <button
                      type="button"
                      @click="removeItemRow(idx)"
                      class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black text-xs cursor-pointer"
                      title="Usuń pozycję"
                    >✕</button>
                  </div>
                </div>
              </div>

              <!-- Pasek podsumowania -->
              <div class="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between flex-wrap gap-3">
                <label class="flex items-center gap-2 text-xs font-extrabold text-amber-300 cursor-pointer select-none">
                  <input type="checkbox" v-model="form.isCollectiveInvoice" class="rounded accent-amber-400" />
                  <span>Rozliczenie w FAKTURZE ZBIORCZEJ</span>
                </label>

                <div class="flex items-center gap-4">
                  <div class="text-xs text-slate-400 font-bold">
                    Brutto (23%): <span class="text-slate-200 font-mono">{{ formatMoney(totalBrutto) }}</span>
                  </div>
                  <div class="text-sm font-black">
                    RAZEM NETTO: <span class="text-[#7ce368] font-mono">{{ formatMoney(totalNetto) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- SEKCJA 4: WARUNKI HANDLOWE -->
            <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div class="text-[11px] font-black uppercase tracking-widest text-slate-700 border-b border-slate-100 pb-2">
                4. Warunki handlowe i realizacja
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div class="sm:col-span-3">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Termin realizacji</label>
                  <input
                    v-model="form.executionTerm"
                    type="text"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#58b347]"
                  />
                </div>
                <div class="sm:col-span-4">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Status oferty</label>
                  <select
                    v-model="form.statusOffer"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-800 focus:outline-none focus:border-[#58b347]"
                  >
                    <option value="OCZEKUJE NA AKCEPTACJE">WYSŁANA / OCZEKUJE</option>
                    <option value="ZAAKCEPTOWANA">ZAAKCEPTOWANA</option>
                    <option value="PRZYGOTOWANIE">PRZYGOTOWANIE</option>
                  </select>
                </div>
                <div class="sm:col-span-5">
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Warunki płatności</label>
                  <select
                    v-model="form.paymentPreset"
                    class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#58b347]"
                  >
                    <option v-for="opt in PAYMENT_PRESETS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    <option value="CUSTOM">Własny wpis...</option>
                  </select>
                </div>
              </div>

              <input
                v-if="form.paymentPreset === 'CUSTOM'"
                v-model="form.paymentCustom"
                type="text"
                placeholder="Wpisz własne warunki płatności..."
                class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#58b347]"
              />

              <div class="space-y-1.5">
                <label class="flex items-center gap-2 text-xs font-extrabold text-slate-700 cursor-pointer select-none">
                  <input type="checkbox" v-model="form.includeFlatRate" class="rounded accent-[#58b347]" />
                  <span>Dołącz klauzulę ryczałtu (900 zł do 1h, +300 zł za każdą kolejną RBH)</span>
                </label>
                <textarea
                  v-if="form.includeFlatRate"
                  v-model="form.flatRateTerms"
                  rows="2"
                  class="w-full p-2.5 rounded-xl border border-amber-200 bg-amber-50/40 text-[11px] font-medium text-slate-700 focus:outline-none focus:border-amber-400 resize-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Uwagi dodatkowe na dokumencie PDF</label>
                <input
                  v-model="form.extraNotes"
                  type="text"
                  class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#58b347]"
                />
              </div>
            </div>
          </div>

          <!-- PRAWA KOLUMNA: PODGLĄD PDF NA ŻYWO -->
          <div class="lg:col-span-5 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden min-h-[380px]">
            <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0 bg-slate-50/70">
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">Podgląd dokumentu</span>
                <span
                  v-if="previewMode === 'html'"
                  class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black uppercase"
                >
                  DEV HTML
                </span>
              </div>
              <button
                type="button"
                :disabled="isGeneratingPreview"
                @click="handleGeneratePreview"
                class="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {{ isGeneratingPreview ? 'Generowanie...' : 'Generuj podgląd PDF' }}
              </button>
            </div>

            <div class="flex-1 bg-slate-100/70 relative overflow-hidden flex items-center justify-center">
              <div v-if="isGeneratingPreview" class="text-center text-xs font-bold text-slate-500 animate-pulse">
                Renderowanie podglądu oferty PDF...
              </div>

              <iframe
                v-else-if="previewMode === 'pdf' && previewPdfSrc"
                :src="previewPdfSrc"
                class="w-full h-full border-0"
              ></iframe>

              <iframe
                v-else-if="previewMode === 'html' && previewHtmlDoc"
                :srcdoc="previewHtmlDoc"
                class="w-full h-full border-0 bg-white"
              ></iframe>

              <div v-else class="text-center px-8 py-6 max-w-sm space-y-2">
                <svg class="w-12 h-12 text-slate-300 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <div class="text-xs font-extrabold text-slate-500">Kliknij „Generuj podgląd PDF”</div>
                <p class="text-[11px] text-slate-400 leading-relaxed">
                  Sprawdzisz tutaj układ tabeli cenowej, danych nabywcy i warunków przed zapisaniem dokumentu na Dysku Google.
                </p>
                <p v-if="previewError" class="text-[11px] font-bold text-rose-600 pt-1">{{ previewError }}</p>
              </div>
            </div>
          </div>

        </div>

        <!-- STOPKA -->
        <div class="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div class="text-xs font-bold text-slate-400">
            Po zapisaniu plik PDF trafi do folderu <span class="font-mono text-slate-600">Stacje / QP / Oferty</span> na Dysku Google.
          </div>

          <div class="flex items-center gap-2.5">
            <button
              type="button"
              @click="emit('close')"
              class="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold cursor-pointer"
            >
              Anuluj
            </button>

            <button
              type="button"
              :disabled="isSubmitting"
              @click="handleSave(false)"
              class="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              Zapisz bez PDF
            </button>

            <button
              type="button"
              :disabled="isSubmitting"
              @click="handleSave(true)"
              class="px-6 py-2.5 rounded-xl bg-[#58b347] hover:bg-[#499b3a] text-white text-xs font-black uppercase tracking-wider shadow-md shadow-[#58b347]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M20 6 9 17l-5-5"/></svg>
              {{ isSubmitting ? 'Generowanie PDF...' : 'Zapisz ofertę i wygeneruj PDF' }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useOffersStore } from '../stores/useOffersStore'
import { useAuthStore } from '../stores/useAuthStore'

const DEFAULT_FLAT_RATE = 'Oferta obejmuje ryczałt za wykonanie usługi w kwocie 900 zł (przy czasie pracy do 1 godz.). W przypadku przekroczenia tego czasu, za każdą kolejną rozpoczętą roboczogodzinę (RBH) doliczana jest opłata 300 zł. Wycena dotyczy wyłącznie wskazanego zakresu prac – prace dodatkowe wymagają odrębnych ustaleń.'

const PAYMENT_PRESETS = [
  {
    label: 'Przelew 14 dni po wykonaniu prac',
    value: 'Kwota płatna przelewem w terminie 14 dni od daty wystawienia faktury końcowej po wykonaniu prac.'
  },
  {
    label: 'Przedpłata 100% proforma',
    value: 'Kwota płatna w formie przedpłaty (100% wartości zamówienia) na podstawie faktury proforma, przed rozpoczęciem realizacji prac.'
  }
]

const props = defineProps({
  show: { type: Boolean, default: false },
  initialOffer: { type: Object, default: null },
  isCopy: { type: Boolean, default: false },
  prefillTicket: { type: Object, default: null }
})

const emit = defineEmits(['close', 'saved'])

const store = useOffersStore()
const auth = useAuthStore()

let uidCounter = 1
const nextUid = () => `uid_${Date.now()}_${uidCounter++}`

const form = ref({
  id: '',
  seqNum: 0,
  offerNumber: '',
  offerDate: '',
  validUntil: '14 dni',
  author: '',
  clientId: '',
  clientName: '',
  clientNip: '',
  clientAddress: '',
  clientContact: '',
  stations: [],
  projectName: '',
  eepOrder: '',
  ticketIds: '',
  ticketModule: '',
  offerDescription: '',
  internalNotes: '',
  items: [],
  isCollectiveInvoice: false,
  executionTerm: '14 dni',
  statusOffer: 'OCZEKUJE NA AKCEPTACJE',
  paymentPreset: PAYMENT_PRESETS[0].value,
  paymentCustom: '',
  includeFlatRate: true,
  flatRateTerms: DEFAULT_FLAT_RATE,
  extraNotes: 'Brak.'
})

const isEditingExisting = ref(false)
const isRevisionMode = ref(false)
const manualNumberEdited = ref(false)
const assignNewNumberFlag = ref(true)
const clientAutoFilled = ref(false)

const showPasteStations = ref(false)
const pasteStationsRaw = ref('')
const activeAutocompleteUid = ref('')

const isGeneratingPreview = ref(false)
const isSubmitting = ref(false)
const previewMode = ref('') // 'pdf' | 'html' | ''
const previewPdfSrc = ref('')
const previewHtmlDoc = ref('')
const previewError = ref('')

const modalHeading = computed(() => {
  if (props.isCopy && props.initialOffer) return 'Nowa Oferta na bazie poprzedniej'
  if (isEditingExisting.value) return 'Edycja Oferty Handlowej'
  return 'Kreator Oferty Handlowej EKOEN'
})

const serviceCatalog = computed(() =>
  (store.catalog || []).filter(c => c.item_type !== 'PART')
)

const totalNetto = computed(() =>
  (form.value.items || []).reduce((sum, it) => sum + ((Number(it.qty) || 0) * (Number(it.unitPln) || 0)), 0)
)

const totalBrutto = computed(() => totalNetto.value * 1.23)

const formatMoney = (val) => {
  const num = Number(val) || 0
  return num.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł'
}

// Połączona lista klientów z sys_clients oraz z historycznych ofert (żeby auto-uzupełniać też NIP i adres)
const mergedClientsSuggestions = computed(() => {
  const map = new Map()

  ;(store.clients || []).forEach(c => {
    const name = String(c.name || '').trim()
    if (!name) return
    const contact = [c.contact_person, c.email, c.phone].filter(Boolean).join(', ')
    map.set(name.toLowerCase(), {
      id: c.id || '',
      name,
      nip: c.nip || '',
      address: c.address || '',
      contact
    })
  })

  ;(store.offers || []).forEach(o => {
    const name = String(o.client_name || '').trim()
    if (!name) return
    const key = name.toLowerCase()
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        id: o.client_id || '',
        name,
        nip: o.client_nip || '',
        address: o.client_address || '',
        contact: o.client_contact || ''
      })
    } else {
      if (!existing.nip && o.client_nip) existing.nip = o.client_nip
      if (!existing.address && o.client_address) existing.address = o.client_address
      if (!existing.contact && o.client_contact) existing.contact = o.client_contact
    }
  })

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'pl'))
})

const buildDynamicOfferNumber = (clientName) => {
  const base = store.baseOfferNumber || `OES/001/${new Date().getFullYear()}`
  const cleanClient = String(clientName || '')
    .trim()
    .replace(/[\/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, '_')
    .toUpperCase()
  return cleanClient ? `${base}/${cleanClient}` : base
}

const incrementRevisionString = (existingNum) => {
  const clean = String(existingNum || '').trim()
  const m = clean.match(/^(.*)_v(\d+)$/i)
  if (m) return `${m[1]}_v${parseInt(m[2], 10) + 1}`
  return `${clean}_v2`
}

const onClientNameInput = () => {
  if (!isRevisionMode.value && !manualNumberEdited.value) {
    form.value.offerNumber = buildDynamicOfferNumber(form.value.clientName)
  }

  const key = String(form.value.clientName || '').trim().toLowerCase()
  const matched = mergedClientsSuggestions.value.find(c => c.name.toLowerCase() === key)
  if (matched) {
    form.value.clientId = matched.id || form.value.clientId
    if (matched.nip) form.value.clientNip = matched.nip
    if (matched.address) form.value.clientAddress = matched.address
    if (matched.contact) form.value.clientContact = matched.contact
    clientAutoFilled.value = true
  } else {
    clientAutoFilled.value = false
  }
}

const assignFreshNumber = () => {
  isRevisionMode.value = false
  manualNumberEdited.value = false
  assignNewNumberFlag.value = true
  form.value.offerNumber = buildDynamicOfferNumber(form.value.clientName)
}

// Stacje
const addStationRow = (qp = '', location = '', model = '-') => {
  form.value.stations.push({ uid: nextUid(), qp, location, model })
}

const removeStationRow = (idx) => {
  form.value.stations.splice(idx, 1)
  if (form.value.stations.length === 0) addStationRow()
}

const parsePastedStations = () => {
  const raw = pasteStationsRaw.value.trim()
  if (!raw) {
    showPasteStations.value = false
    return
  }
  const lines = raw.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean)
  if (form.value.stations.length === 1 && !form.value.stations[0].qp && !form.value.stations[0].location) {
    form.value.stations = []
  }
  lines.forEach(line => {
    const cols = line.includes('\t') ? line.split('\t') : line.split(';')
    addStationRow((cols[0] || '').trim(), (cols[1] || '').trim(), (cols[2] || '-').trim() || '-')
  })
  pasteStationsRaw.value = ''
  showPasteStations.value = false
}

// Pozycje kosztorysowe
const addItemRow = (mode = 'service', defaults = null) => {
  form.value.items.push({
    uid: nextUid(),
    mode,
    name: defaults?.name || '',
    qty: defaults?.qty != null ? Number(defaults.qty) : 1,
    unitPln: defaults?.unitPln != null ? Number(defaults.unitPln) : 0
  })
}

const removeItemRow = (idx) => {
  form.value.items.splice(idx, 1)
  if (form.value.items.length === 0) addItemRow('service')
}

const onPickServiceItem = (item, name) => {
  item.name = name
  const found = serviceCatalog.value.find(s => s.name === name)
  if (found) item.unitPln = Number(found.unit_price_pln) || 0
}

// Połączona lista z sys_offer_catalog oraz części z magazynu sys_parts (z priorytetem cen z cennika handlowego)
const allSearchableItems = computed(() => {
  const catItems = store.catalog || []
  const seenCodes = new Set(
    catItems
      .map(c => String(c.code || '').trim().toLowerCase())
      .filter(Boolean)
  )

  const whItems = (store.warehouseParts || []).filter(wp => {
    const codeKey = String(wp.code || '').trim().toLowerCase()
    return !codeKey || !seenCodes.has(codeKey)
  })

  return [...whItems, ...catItems]
})

const getCatalogSuggestions = (query) => {
  const q = String(query || '').toLowerCase().trim()
  const source = allSearchableItems.value
  if (!q) return source.slice(0, 15)
  return source
    .filter(c => `${c.code || ''} ${c.name || ''} ${c.category || ''}`.toLowerCase().includes(q))
    .slice(0, 15)
}

const applyCatalogSuggestion = (item, cand) => {
  const isPart = cand.item_type === 'PART' || cand.item_type === 'WAREHOUSE_PART'
  const codeStr = String(cand.code || '').trim()
  const nameStr = String(cand.name || '').trim()

  // Dla części dopisujemy indeks SKU przed nazwą (tak jak w starym CPQ); dla usług zostawiamy czystą nazwę
  item.name = (isPart && codeStr && !nameStr.toLowerCase().includes(codeStr.toLowerCase()))
    ? `${codeStr} - ${nameStr}`
    : (nameStr || codeStr)

  item.unitPln = Number(cand.unit_price_pln) || 0
  activeAutocompleteUid.value = ''
}

// Inicjalizacja formularza przy otwarciu
const initForm = () => {
  previewMode.value = ''
  previewPdfSrc.value = ''
  previewHtmlDoc.value = ''
  previewError.value = ''
  showPasteStations.value = false
  pasteStationsRaw.value = ''
  activeAutocompleteUid.value = ''
  clientAutoFilled.value = false
  manualNumberEdited.value = false

  const o = props.initialOffer
  const pre = props.prefillTicket
  const snap = o?.snapshot || null
  const defaultAuthor = auth.user?.username || 'Biuro EKOEN'

  isEditingExisting.value = Boolean(o && !props.isCopy)

  // Bazowe wartości
  const clientName = snap?.clientName || o?.client_name || pre?.client_name || ''
  const stationsList = []

  if (snap?.stations && snap.stations.length > 0) {
    snap.stations.forEach(s => stationsList.push({ uid: nextUid(), qp: s.qp || '', location: s.location || '', model: s.model || '-' }))
  } else {
    const qpLines = String(o?.station_qp || pre?.station_qp || '').replace(/\r/g, '').split('\n').map(s => s.trim())
    const locLines = String(o?.station_location || pre?.station_location || '').replace(/\r/g, '').split('\n').map(s => s.trim())
    const maxLen = Math.max(qpLines.length, locLines.length)
    for (let i = 0; i < maxLen; i++) {
      if (qpLines[i] || locLines[i]) {
        stationsList.push({ uid: nextUid(), qp: qpLines[i] || '', location: locLines[i] || '', model: '-' })
      }
    }
  }
  if (stationsList.length === 0) stationsList.push({ uid: nextUid(), qp: '', location: '', model: '-' })

  const itemsList = []
  if (snap?.items && snap.items.length > 0) {
    snap.items.forEach(it => {
      const q = Number(it.qty) || 1
      const u = it.unitPln != null ? Number(it.unitPln) : ((Number(it.totalPln) || 0) / q)
      itemsList.push({ uid: nextUid(), mode: 'manual', name: it.name || '', qty: q, unitPln: u })
    })
  } else {
    itemsList.push({ uid: nextUid(), mode: 'service', name: '', qty: 1, unitPln: 0 })
  }

  let paymentPreset = PAYMENT_PRESETS[0].value
  let paymentCustom = ''
  const savedPay = snap?.paymentTerms || ''
  if (savedPay) {
    if (PAYMENT_PRESETS.some(p => p.value === savedPay)) {
      paymentPreset = savedPay
    } else {
      paymentPreset = 'CUSTOM'
      paymentCustom = savedPay
    }
  }

  const hasSavedFlatRate = snap ? Boolean(snap.flatRateTerms) : true
  const existingHasNumber = Boolean(o && !props.isCopy && o.offer_number && o.offer_number !== '-')

  if (existingHasNumber) {
    isRevisionMode.value = true
    assignNewNumberFlag.value = false
  } else {
    isRevisionMode.value = false
    assignNewNumberFlag.value = true
  }

  form.value = {
    id: (o && !props.isCopy) ? o.id : '',
    seqNum: (o && !props.isCopy) ? (Number(o.seq_num) || 0) : 0,
    offerNumber: existingHasNumber
      ? incrementRevisionString(o.offer_number)
      : buildDynamicOfferNumber(clientName),
    offerDate: (o && !props.isCopy && o.offer_date) ? o.offer_date : (store.today || new Date().toISOString().split('T')[0]),
    validUntil: snap?.validUntil || o?.valid_until || '14 dni',
    author: snap?.author || o?.author || defaultAuthor,
    clientId: o?.client_id || '',
    clientName,
    clientNip: snap?.clientNip || o?.client_nip || '',
    clientAddress: snap?.clientAddress || o?.client_address || '',
    clientContact: snap?.clientContact || o?.client_contact || '',
    stations: stationsList,
    projectName: snap?.projectName || o?.project_name || pre?.project_name || '',
    eepOrder: snap?.eepOrder || o?.eep_order || pre?.eep_order || '',
    ticketIds: (o && !props.isCopy) ? (o.ticket_ids || '') : (pre?.ticket_ids || ''),
    ticketModule: (o && !props.isCopy) ? (o.ticket_module || '') : (pre?.ticket_module || ''),
    offerDescription: snap?.offerDescription || o?.description || pre?.description || '',
    internalNotes: snap?.internalNotes || o?.internal_notes || pre?.internal_notes || '',
    items: itemsList,
    isCollectiveInvoice: Boolean(snap?.isCollectiveInvoice || o?.is_collective),
    executionTerm: snap?.executionTerm || '14 dni',
    statusOffer: (o && !props.isCopy && o.status_offer && o.status_offer !== 'PRZYGOTOWANIE')
      ? o.status_offer
      : 'OCZEKUJE NA AKCEPTACJE',
    paymentPreset,
    paymentCustom,
    includeFlatRate: hasSavedFlatRate,
    flatRateTerms: snap?.flatRateTerms || DEFAULT_FLAT_RATE,
    extraNotes: snap?.extraNotes || 'Brak.'
  }

  // Dociągnij NIP/adres z bazy jeśli jeszcze puste
  if (clientName && (!form.value.clientNip || !form.value.clientAddress || !form.value.clientContact)) {
    const matched = mergedClientsSuggestions.value.find(c => c.name.toLowerCase() === clientName.toLowerCase())
    if (matched) {
      if (!form.value.clientNip && matched.nip) form.value.clientNip = matched.nip
      if (!form.value.clientAddress && matched.address) form.value.clientAddress = matched.address
      if (!form.value.clientContact && matched.contact) form.value.clientContact = matched.contact
      clientAutoFilled.value = true
    }
  }
}

watch(() => props.show, (visible) => {
  if (visible) initForm()
})

const handleKeydown = (e) => {
  if (props.show && e.key === 'Escape') emit('close')
}
const handleDocClick = () => {
  activeAutocompleteUid.value = ''
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('click', handleDocClick)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('click', handleDocClick)
})

// Budowa spójnego payloadu dla saveOfferRecord + buildOfferPdfHtml_
const buildPayload = (saveAsDraft = false) => {
  const cleanStations = form.value.stations
    .filter(s => (s.qp || '').trim() || (s.location || '').trim())
    .map(s => ({
      qp: (s.qp || '-').trim(),
      location: (s.location || '-').trim(),
      model: (s.model || '-').trim() || '-'
    }))

  const cleanItems = form.value.items.map(it => {
    const q = Number(it.qty) || 1
    const u = Number(it.unitPln) || 0
    return {
      name: String(it.name || '').trim() || 'Usługa serwisowa',
      qty: q,
      unitPln: u,
      totalPln: q * u
    }
  })

  const paymentTerms = form.value.paymentPreset === 'CUSTOM'
    ? form.value.paymentCustom.trim()
    : form.value.paymentPreset

  const flatRateTerms = form.value.includeFlatRate ? form.value.flatRateTerms.trim() : ''
  const stationQpStr = cleanStations.map(s => s.qp).join('\n')
  const stationLocStr = cleanStations.map(s => s.location).join('\n')
  const stationModStr = cleanStations.map(s => s.model).join('\n')
  const sumNetto = totalNetto.value

  const snapshotObj = {
    offerNumber: form.value.offerNumber.trim(),
    offerDate: form.value.offerDate,
    validUntil: form.value.validUntil.trim() || '14 dni',
    author: form.value.author.trim(),
    clientName: form.value.clientName.trim(),
    clientNip: form.value.clientNip.trim(),
    clientAddress: form.value.clientAddress.trim(),
    clientContact: form.value.clientContact.trim(),
    stations: cleanStations,
    projectName: form.value.projectName.trim(),
    eepOrder: form.value.eepOrder.trim(),
    offerDescription: form.value.offerDescription.trim(),
    internalNotes: form.value.internalNotes.trim(),
    items: cleanItems,
    isCollectiveInvoice: form.value.isCollectiveInvoice,
    executionTerm: form.value.executionTerm.trim() || '14 dni',
    paymentTerms,
    flatRateTerms,
    extraNotes: form.value.extraNotes.trim() || 'Brak.',
    totalNetto: sumNetto
  }

  return {
    // Pola dla sys_offers (snake_case)
    id: form.value.id || '',
    seq_num: assignNewNumberFlag.value ? 0 : form.value.seqNum,
    offer_number: form.value.offerNumber.trim(),
    offer_date: form.value.offerDate,
    valid_until: snapshotObj.validUntil,
    status_offer: saveAsDraft ? 'PRZYGOTOWANIE' : form.value.statusOffer,
    is_collective: form.value.isCollectiveInvoice,
    client_id: form.value.clientId || '',
    client_name: snapshotObj.clientName,
    client_nip: snapshotObj.clientNip,
    client_address: snapshotObj.clientAddress,
    client_contact: snapshotObj.clientContact,
    station_qp: stationQpStr,
    station_location: stationLocStr,
    ticket_ids: form.value.ticketIds.trim(),
    ticket_module: form.value.ticketModule || '',
    eep_order: snapshotObj.eepOrder,
    project_name: snapshotObj.projectName,
    description: snapshotObj.offerDescription,
    internal_notes: snapshotObj.internalNotes,
    total_netto: sumNetto,
    snapshot_json: JSON.stringify(snapshotObj),
    author: snapshotObj.author,
    assignNewNumber: assignNewNumberFlag.value && !manualNumberEdited.value && !saveAsDraft,
    bumpRevision: false,
    saveAsDraft,

    // Pola dla buildOfferPdfHtml_ (camelCase)
    ...snapshotObj,
    stationQp: stationQpStr,
    stationLocation: stationLocStr,
    stationModel: stationModStr
  }
}

// Lokalny podgląd HTML (gdy pracujesz na localhoście poza ramką Google Apps Script)
const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const buildLocalPreviewHtml = (p) => {
  const stRows = (p.stations.length ? p.stations : [{ qp: '-', location: '-', model: '-' }]).map(s =>
    `<tr><td style="padding:5px 7px;border:1px solid #cbd5e1;font-family:monospace;font-weight:700;">${esc(s.qp)}</td><td style="padding:5px 7px;border:1px solid #cbd5e1;">${esc(s.location)}</td><td style="padding:5px 7px;border:1px solid #cbd5e1;">${esc(s.model)}</td></tr>`
  ).join('')

  const itRows = p.items.map((it, i) =>
    `<tr><td style="padding:6px;border:1px solid #cbd5e1;text-align:center;">${i + 1}</td><td style="padding:6px;border:1px solid #cbd5e1;">${esc(it.name)}</td><td style="padding:6px;border:1px solid #cbd5e1;text-align:center;">${it.qty}</td><td style="padding:6px;border:1px solid #cbd5e1;text-align:right;white-space:nowrap;">${formatMoney(it.unitPln)}</td><td style="padding:6px;border:1px solid #cbd5e1;text-align:right;font-weight:700;white-space:nowrap;">${formatMoney(it.totalPln)}</td></tr>`
  ).join('')

  const brutto = p.totalNetto * 1.23

  return `<meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;color:#0f172a;font-size:11.5px;line-height:1.45;margin:20px;}
    .hd{display:flex;justify-content:space-between;border-bottom:3px solid #16a34a;padding-bottom:10px;margin-bottom:14px;}
    .br{font-size:18px;font-weight:800;}.br span{color:#16a34a;}
    table.g{width:100%;border-collapse:collapse;margin-bottom:12px;}
    table.g td{width:50%;vertical-align:top;padding:8px;border:1px solid #e2e8f0;background:#f8fafc;}
    .st{font-size:10px;font-weight:800;text-transform:uppercase;color:#16a34a;margin:12px 0 5px;}
    table.t{width:100%;border-collapse:collapse;margin-bottom:10px;}
    table.t th{background:#0f172a;color:#fff;padding:6px;border:1px solid #0f172a;text-align:left;font-size:10px;}
    table.tot{width:240px;margin-left:auto;border-collapse:collapse;}
    table.tot td{padding:5px 7px;border-bottom:1px solid #e2e8f0;}
    table.tot tr.gr td{font-weight:800;background:#f0fdf4;border-top:2px solid #16a34a;border-bottom:2px solid #16a34a;}
  </style><div class="offer-preview-root">
    <div class="hd">
      <div><div class="br">EKOEN <span>SERWIS</span></div><div style="font-size:10px;color:#64748b;">Oferta handlowo-serwisowa</div></div>
      <div style="text-align:right;font-size:10.5px;">
        <div style="font-size:13px;font-weight:800;">${esc(p.offerNumber)}</div>
        <div>Data: <strong>${esc(p.offerDate)}</strong> • Ważność: <strong>${esc(p.validUntil)}</strong></div>
      </div>
    </div>
    <table class="g"><tr>
      <td><div style="font-size:9px;font-weight:800;color:#64748b;text-transform:uppercase;">Nabywca</div><div style="font-weight:800;">${esc(p.clientName || '-')}</div>${p.clientNip ? `<div>NIP: ${esc(p.clientNip)}</div>` : ''}${p.clientAddress ? `<div>${esc(p.clientAddress)}</div>` : ''}${p.clientContact ? `<div style="color:#475569;">${esc(p.clientContact)}</div>` : ''}</td>
      <td><div style="font-size:9px;font-weight:800;color:#64748b;text-transform:uppercase;">Sporządzający</div><div style="font-weight:800;">${esc(p.author)}</div><div>EKOEN Sp. z o.o. • serwis@ekoen.pl</div></td>
    </tr></table>
    ${p.projectName ? `<div style="font-size:13px;font-weight:800;margin-bottom:6px;">Przedmiot: ${esc(p.projectName)}</div>` : ''}
    ${p.offerDescription ? `<div style="padding:8px 10px;background:#f8fafc;border-left:4px solid #16a34a;white-space:pre-line;margin-bottom:10px;">${esc(p.offerDescription)}</div>` : ''}
    <div class="st">Obiekty / Stacje</div>
    <table class="t"><thead><tr><th>QP</th><th>Lokalizacja</th><th>Model</th></tr></thead><tbody>${stRows}</tbody></table>
    <div class="st">Wycena pozycji</div>
    <table class="t"><thead><tr><th>Lp.</th><th>Pozycja</th><th>Ilość</th><th style="text-align:right;">Cena jedn.</th><th style="text-align:right;">Wartość netto</th></tr></thead><tbody>${itRows}</tbody></table>
    <table class="tot">
      <tr><td>Suma netto:</td><td style="text-align:right;font-weight:700;">${formatMoney(p.totalNetto)}</td></tr>
      <tr><td>VAT (23%):</td><td style="text-align:right;">${formatMoney(brutto - p.totalNetto)}</td></tr>
      <tr class="gr"><td>Razem brutto:</td><td style="text-align:right;color:#15803d;">${formatMoney(brutto)}</td></tr>
    </table>
    <div style="margin-top:12px;font-size:10.5px;">
      <div><strong>Termin realizacji:</strong> ${esc(p.executionTerm)}</div>
      ${p.paymentTerms ? `<div style="margin-top:3px;"><strong>Płatność:</strong> ${esc(p.paymentTerms)}</div>` : ''}
      ${p.flatRateTerms ? `<div style="margin-top:6px;padding:6px 8px;background:#fffbeb;border:1px solid #fde68a;font-size:10px;"><strong>Ryczałt:</strong> ${esc(p.flatRateTerms)}</div>` : ''}
      ${p.extraNotes && p.extraNotes !== 'Brak.' ? `<div style="margin-top:4px;"><strong>Uwagi:</strong> ${esc(p.extraNotes)}</div>` : ''}
    </div>
  </div>`
}

const handleGeneratePreview = async () => {
  if (!form.value.clientName.trim()) {
    alert('Wpisz nazwę klienta, aby wygenerować podgląd.')
    return
  }

  isGeneratingPreview.value = true
  previewError.value = ''
  const payload = buildPayload(false)

  try {
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      const res = await store.previewPdf(payload)
      if (res && res.success && res.base64) {
        previewPdfSrc.value = `data:application/pdf;base64,${res.base64}`
        previewMode.value = 'pdf'
      } else {
        previewError.value = res?.error || 'Nie udało się wygenerować podglądu PDF.'
      }
    } else {
      previewHtmlDoc.value = buildLocalPreviewHtml(payload)
      previewMode.value = 'html'
    }
  } catch (err) {
    previewError.value = err?.message || String(err)
  } finally {
    isGeneratingPreview.value = false
  }
}

const handleSave = async (withPdf) => {
  if (!form.value.clientName.trim()) {
    alert('Podaj nazwę klienta!')
    return
  }

  isSubmitting.value = true
  try {
    const payload = buildPayload(!withPdf && !form.value.offerNumber.trim())
    const res = withPdf
      ? await store.generatePdf(payload)
      : await store.saveOffer(payload)

    if (res && res.success) {
      if (withPdf && res.pdfUrl) {
        window.open(res.pdfUrl, '_blank')
      }
      emit('saved', res)
      emit('close')
    } else {
      alert(res?.error || 'Nie udało się zapisać oferty.')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.creator-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.creator-scrollbar::-webkit-scrollbar-track { background: transparent; }
.creator-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.35); border-radius: 10px; }
.creator-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(88, 179, 71, 0.8); }
</style>