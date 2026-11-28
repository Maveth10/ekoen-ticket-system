<template>
  <div class="space-y-4">

    <!-- NAGŁÓWEK POMIARÓW + MIERNIKI I UKŁAD SIECI -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
      <div class="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
        <div>
          <span class="text-[11px] font-black uppercase tracking-widest text-teal-800">
            Załącznik 5.3 — Tabele pomiarowe stacji ładowania
          </span>
          <p class="text-[10px] font-semibold text-slate-400 mt-0.5">
            Niewykorzystane wiersze powyżej wpisanej liczby punktów są automatycznie usuwane z tabeli w PDF.
          </p>
        </div>

        <button
          type="button"
          @click="handleResetStandard"
          class="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
        >
          ↻ Wstaw standardowe wartości
        </button>
      </div>

      <!-- Układ sieci i napięcie -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="col-span-1 sm:col-span-2">
          <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Układ sieci</label>
          <input
            v-model="measurements.gridSystem"
            type="text"
            placeholder="TN-C-S"
            class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-600"
          />
        </div>
        <div class="col-span-1 sm:col-span-2">
          <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Napięcie znamionowe Uf</label>
          <input
            v-model="measurements.gridVoltage"
            type="text"
            placeholder="230/400 V"
            class="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>

      <!-- Przyrządy pomiarowe (1 lub 2 mierniki) -->
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="text-[10px] font-black uppercase tracking-wider text-slate-600">Przyrządy pomiarowe i świadectwa wzorcowania</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="saveMetersToStorage"
              class="px-2.5 py-1 rounded-lg border text-[9.5px] font-black uppercase tracking-wider cursor-pointer transition-colors"
              :class="metersSavedFlash
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'"
              title="Zapamiętaj wpisane mierniki w tej przeglądarce do kolejnych protokołów"
            >
              {{ metersSavedFlash ? '✓ Zapamiętano miernik' : 'Zapamiętaj miernik' }}
            </button>
            <button
              v-if="!showSecondMeter"
              type="button"
              @click="showSecondMeter = true"
              class="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[9.5px] font-black uppercase tracking-wider cursor-pointer"
            >
              + Drugi miernik
            </button>
          </div>
        </div>

        <!-- Miernik 1 -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label class="block text-[9.5px] font-bold uppercase text-slate-400 mb-0.5">Przyrząd pomiarowy 1</label>
            <input v-model="measurements.meterName" type="text" placeholder="np. Sonel MPI-540" class="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-600" />
          </div>
          <div>
            <label class="block text-[9.5px] font-bold uppercase text-slate-400 mb-0.5">Nr seryjny miernika 1</label>
            <input v-model="measurements.meterSerial" type="text" placeholder="Nr seryjny S/N" class="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-teal-600" />
          </div>
          <div>
            <label class="block text-[9.5px] font-bold uppercase text-slate-400 mb-0.5">Świadectwo wzorcowania 1</label>
            <input v-model="measurements.meterCert" type="text" placeholder="Nr świadectwa" class="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-teal-600" />
          </div>
        </div>

        <!-- Miernik 2 (opcjonalny) -->
        <div v-if="showSecondMeter" class="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-200/70 items-end">
          <div class="sm:col-span-4">
            <label class="block text-[9.5px] font-bold uppercase text-blue-600 mb-0.5">Przyrząd pomiarowy 2</label>
            <input v-model="measurements.meterName2" type="text" placeholder="Model 2. miernika" class="w-full h-8 px-2.5 rounded-lg border border-blue-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500" />
          </div>
          <div class="sm:col-span-4">
            <label class="block text-[9.5px] font-bold uppercase text-blue-600 mb-0.5">Nr seryjny 2</label>
            <input v-model="measurements.meterSerial2" type="text" placeholder="Nr seryjny 2" class="w-full h-8 px-2.5 rounded-lg border border-blue-200 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500" />
          </div>
          <div class="sm:col-span-3">
            <label class="block text-[9.5px] font-bold uppercase text-blue-600 mb-0.5">Świadectwo 2</label>
            <input v-model="measurements.meterCert2" type="text" placeholder="Nr świadectwa 2" class="w-full h-8 px-2.5 rounded-lg border border-blue-200 bg-white text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500" />
          </div>
          <div class="sm:col-span-1 text-right">
            <button
              type="button"
              @click="clearSecondMeter"
              class="h-8 w-8 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black cursor-pointer"
              title="Usuń drugi miernik"
            >✕</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================================== -->
    <!-- TABELA 1: CIĄGŁOŚĆ PRZEWODÓW OCHRONNYCH (PE) (MAX 10)               -->
    <!-- ================================================================== -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
      <div class="flex items-center justify-between border-b border-slate-100 pb-2">
        <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">
          1. Ciągłość przewodów ochronnych PE ({{ measurements.peRows.length }}/10)
        </span>
        <button
          type="button"
          :disabled="measurements.peRows.length >= 10"
          @click="addPeRow"
          class="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-black uppercase cursor-pointer disabled:opacity-40"
        >
          + Dodaj punkt PE
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[560px] border-collapse text-xs">
          <thead>
            <tr class="bg-teal-50/70 text-teal-900 text-[10px] font-black uppercase border-b border-teal-200">
              <th class="py-2 px-2 w-9 text-center">Nr</th>
              <th class="py-2 px-2 text-left">Punkt pomiarowy nr 1</th>
              <th class="py-2 px-2 text-left">Punkt pomiarowy nr 2</th>
              <th class="py-2 px-2 w-44 text-center">Ocena [&lt;1Ω / nieprzerwany]</th>
              <th class="py-2 px-1 w-8"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(row, idx) in measurements.peRows" :key="idx">
              <td class="py-1.5 px-2 text-center font-mono font-black text-slate-500">{{ idx + 1 }}.</td>
              <td class="py-1.5 px-1.5">
                <input v-model="row.p1" type="text" class="w-full h-7 px-2 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600" />
              </td>
              <td class="py-1.5 px-1.5">
                <input v-model="row.p2" type="text" class="w-full h-7 px-2 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600" />
              </td>
              <td class="py-1.5 px-1.5">
                <input v-model="row.val" type="text" class="w-full h-7 px-2 rounded-md border border-slate-200 bg-emerald-50/40 text-xs font-bold text-center text-emerald-800 focus:outline-none focus:border-teal-600" />
              </td>
              <td class="py-1.5 px-1 text-center">
                <button
                  v-if="measurements.peRows.length > 1"
                  type="button"
                  @click="measurements.peRows.splice(idx, 1)"
                  class="w-6 h-6 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black cursor-pointer"
                >✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <label class="block text-[9.5px] font-black uppercase tracking-wider text-slate-400 mb-1">Dodatkowe uwagi (Ciągłość PE)</label>
        <input v-model="measurements.notesPE" type="text" class="w-full h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-600" />
      </div>
    </div>

    <!-- ================================================================== -->
    <!-- TABELA 2: REZYSTANCJA IZOLACJI ELEKTRYCZNEJ (RISO)                  -->
    <!-- ================================================================== -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
      <div class="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
        <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">
          2. Rezystancja izolacji RISO (Wejście AC + Wyjścia {{ measurements.riso.outputs.length }}/6)
        </span>
        <button
          type="button"
          :disabled="measurements.riso.outputs.length >= 6"
          @click="addRisoOutput"
          class="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-black uppercase cursor-pointer disabled:opacity-40"
        >
          + Dodaj obwód wyjściowy
        </button>
      </div>

      <!-- Obwód 1: Wejściowy AC -->
      <div class="p-3 rounded-xl border border-teal-200/80 bg-teal-50/25 space-y-2.5">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2 py-0.5 rounded bg-teal-700 text-white text-[10px] font-black">Obwód 1 (AC)</span>
            <input
              v-model="measurements.riso.RISO_NAZWA_1"
              type="text"
              class="h-7 w-40 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-extrabold text-slate-800"
            />
            <div class="flex items-center gap-1 text-[10.5px] font-bold text-slate-600">
              <span>Napięcie:</span>
              <input
                v-model="measurements.riso.RISO_NAPIECIE_1"
                type="text"
                class="h-7 w-20 px-2 rounded-md border border-slate-200 bg-white text-xs font-mono font-black text-center text-slate-800"
              />
            </div>
          </div>
          <span class="text-[10px] font-black text-teal-800 uppercase">Wymagana: ≥ 1 MΩ</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div v-for="fld in RISO_AC_FIELDS" :key="fld.key">
            <label class="block text-[9.5px] font-black text-center mb-0.5" :class="fld.pe ? 'text-blue-700' : 'text-slate-500'">
              {{ fld.label }}
            </label>
            <input
              v-model="measurements.riso[fld.key]"
              type="text"
              class="w-full h-7 px-2 rounded-md border border-slate-200 bg-white text-xs font-mono font-bold text-center text-slate-800 focus:outline-none focus:border-teal-600"
            />
          </div>
        </div>
      </div>

      <!-- Obwód 2: Dynamiczne wyjścia DC / AC (1..6) -->
      <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-slate-800 text-white text-[10px] font-black">Obwód 2 (Wyjścia)</span>
            <input
              v-model="measurements.riso.RISO_NAZWA_WYJ"
              type="text"
              class="h-7 w-36 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-extrabold text-slate-800"
              title="Nazwa sekcji wyjściowej w tabeli protokołu"
            />
          </div>
          <span class="text-[10px] font-black text-slate-500 uppercase">Wymagana: ≥ 1 MΩ</span>
        </div>

        <div class="space-y-2">
          <div
            v-for="(out, oIdx) in measurements.riso.outputs"
            :key="oIdx"
            class="p-2.5 rounded-xl bg-white border border-slate-200 grid grid-cols-12 gap-2 items-end"
          >
            <div class="col-span-8 sm:col-span-4">
              <label class="block text-[9px] font-black uppercase text-slate-400 mb-0.5">Wyjście {{ oIdx + 1 }}</label>
              <input v-model="out.name" type="text" class="w-full h-7 px-2 rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-800" />
            </div>
            <div class="col-span-4 sm:col-span-2">
              <label class="block text-[9px] font-black uppercase text-slate-400 mb-0.5">Napięcie</label>
              <input v-model="out.voltage" type="text" class="w-full h-7 px-1.5 rounded-md border border-slate-200 bg-white text-xs font-mono font-bold text-center text-slate-800" />
            </div>
            <div class="col-span-4 sm:col-span-2">
              <label class="block text-[9px] font-black uppercase text-blue-700 mb-0.5 text-center">DC+ - DC-</label>
              <input v-model="out.dcdc" type="text" class="w-full h-7 px-1.5 rounded-md border border-slate-200 bg-white text-xs font-mono font-bold text-center text-slate-800" />
            </div>
            <div class="col-span-4 sm:col-span-2">
              <label class="block text-[9px] font-black uppercase text-blue-700 mb-0.5 text-center">PE - DC+</label>
              <input v-model="out.pedcp" type="text" class="w-full h-7 px-1.5 rounded-md border border-slate-200 bg-white text-xs font-mono font-bold text-center text-slate-800" />
            </div>
            <div class="col-span-3 sm:col-span-1">
              <label class="block text-[9px] font-black uppercase text-blue-700 mb-0.5 text-center">PE - DC-</label>
              <input v-model="out.pedcm" type="text" class="w-full h-7 px-1 rounded-md border border-slate-200 bg-white text-xs font-mono font-bold text-center text-slate-800" />
            </div>
            <div class="col-span-1 text-right">
              <button
                v-if="measurements.riso.outputs.length > 1"
                type="button"
                @click="measurements.riso.outputs.splice(oIdx, 1)"
                class="w-7 h-7 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black text-xs cursor-pointer"
                title="Usuń wyjście"
              >✕</button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-[9.5px] font-black uppercase tracking-wider text-slate-400 mb-1">Dodatkowe uwagi (RISO)</label>
        <input v-model="measurements.notesRISO" type="text" class="w-full h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-600" />
      </div>
    </div>

    <!-- ================================================================== -->
    <!-- TABELA 3: WYŁĄCZNIKI RÓŻNICOWOPRĄDOWE (RCD) (MAX 10)               -->
    <!-- ================================================================== -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
      <div class="flex items-center justify-between border-b border-slate-100 pb-2">
        <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">
          3. Badanie wyłączników różnicowoprądowych RCD ({{ measurements.rcdRows.length }}/10)
        </span>
        <button
          type="button"
          :disabled="measurements.rcdRows.length >= 10"
          @click="addRcdRow"
          class="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-black uppercase cursor-pointer disabled:opacity-40"
        >
          + Dodaj punkt RCD
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[680px] border-collapse text-xs">
          <thead>
            <tr class="bg-teal-50/70 text-teal-900 text-[9.5px] font-black uppercase border-b border-teal-200">
              <th class="py-2 px-1.5 w-8 text-center">Nr</th>
              <th class="py-2 px-2 text-left">Rodzaj zabezpieczenia / Obwód</th>
              <th class="py-2 px-1.5 w-16 text-center">ΔIn [A]</th>
              <th class="py-2 px-1.5 w-20 text-center">IΔ [mA]</th>
              <th class="py-2 px-1.5 w-20 text-center">tA [ms]</th>
              <th class="py-2 px-1.5 w-20 text-center">Ub [V]</th>
              <th class="py-2 px-1.5 w-16 text-center">Re [Ω]</th>
              <th class="py-2 px-1.5 w-16 text-center">TEST</th>
              <th class="py-2 px-1.5 w-20 text-center">Ocena</th>
              <th class="py-2 px-1 w-7"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(r, idx) in measurements.rcdRows" :key="idx">
              <td class="py-1.5 px-1.5 text-center font-mono font-black text-slate-500">{{ idx + 1 }}.</td>
              <td class="py-1.5 px-1">
                <input v-model="r.name" type="text" class="w-full h-7 px-2 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-800" />
              </td>
              <td class="py-1.5 px-1">
                <input v-model="r.din" type="text" class="w-full h-7 px-1 rounded-md border border-slate-200 bg-white text-xs font-mono text-center" />
              </td>
              <td class="py-1.5 px-1">
                <input v-model="r.prad" type="text" class="w-full h-7 px-1 rounded-md border border-slate-200 bg-white text-xs font-mono text-center" />
              </td>
              <td class="py-1.5 px-1">
                <input v-model="r.czas" type="text" class="w-full h-7 px-1 rounded-md border border-slate-200 bg-white text-xs font-mono text-center" />
              </td>
              <td class="py-1.5 px-1">
                <input v-model="r.ub" type="text" class="w-full h-7 px-1 rounded-md border border-slate-200 bg-white text-xs font-mono text-center" />
              </td>
              <td class="py-1.5 px-1">
                <input v-model="r.re" type="text" class="w-full h-7 px-1 rounded-md border border-slate-200 bg-white text-xs font-mono text-center" />
              </td>
              <td class="py-1.5 px-1">
                <select v-model="r.test" class="w-full h-7 px-1 rounded-md border border-slate-200 bg-white text-[10.5px] font-black text-center text-emerald-700">
                  <option value="TAK">TAK</option>
                  <option value="NIE">NIE</option>
                </select>
              </td>
              <td class="py-1.5 px-1">
                <select
                  v-model="r.ocena"
                  class="w-full h-7 px-1 rounded-md border border-slate-200 bg-white text-[10.5px] font-black text-center"
                  :class="r.ocena === 'NIE' ? 'text-rose-600' : 'text-emerald-700'"
                >
                  <option value="TAK">TAK</option>
                  <option value="NIE">NIE</option>
                </select>
              </td>
              <td class="py-1.5 px-1 text-center">
                <button
                  v-if="measurements.rcdRows.length > 1"
                  type="button"
                  @click="measurements.rcdRows.splice(idx, 1)"
                  class="w-6 h-6 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black cursor-pointer"
                >✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <label class="block text-[9.5px] font-black uppercase tracking-wider text-slate-400 mb-1">Dodatkowe uwagi (RCD)</label>
        <input v-model="measurements.notesRCD" type="text" class="w-full h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-600" />
      </div>
    </div>

    <!-- ================================================================== -->
    <!-- TABELA 4: SAMOCZYNNE WYŁĄCZENIE ZASILANIA (SWZ) + AUTO Ik (MAX 10) -->
    <!-- ================================================================== -->
    <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
      <div class="flex items-center justify-between border-b border-slate-100 pb-2">
        <div>
          <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">
            4. Test samoczynnego wyłączenia zasilania SWZ ({{ measurements.swzRows.length }}/10)
          </span>
          <span class="ml-2 text-[10px] font-bold text-slate-400">Ik wyliczane automatycznie z 230 / Zpom</span>
        </div>
        <button
          type="button"
          :disabled="measurements.swzRows.length >= 10"
          @click="addSwzRow"
          class="px-3 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-black uppercase cursor-pointer disabled:opacity-40"
        >
          + Dodaj punkt SWZ
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[720px] border-collapse text-xs">
          <thead>
            <tr class="bg-teal-50/70 text-teal-900 text-[9.5px] font-black uppercase border-b border-teal-200">
              <th class="py-2 px-1.5 w-8 text-center">Nr</th>
              <th class="py-2 px-2 text-left">Obiekt pomiarowy</th>
              <th class="py-2 px-1 w-14 text-center">Zab.</th>
              <th class="py-2 px-1 w-14 text-center">In [A]</th>
              <th class="py-2 px-1 w-14 text-center">tA [s]</th>
              <th class="py-2 px-1 w-16 text-center">IA [A]</th>
              <th class="py-2 px-1.5 w-20 text-center">Zpom [Ω]</th>
              <th class="py-2 px-1.5 w-20 text-center">Ik [A]</th>
              <th class="py-2 px-1.5 w-20 text-center">Zdop [Ω]</th>
              <th class="py-2 px-1.5 w-20 text-center">Ocena</th>
              <th class="py-2 px-1 w-7"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(s, idx) in measurements.swzRows" :key="idx">
              <td class="py-1.5 px-1.5 text-center font-mono font-black text-slate-500">{{ idx + 1 }}.</td>
              <td class="py-1.5 px-1">
                <input v-model="s.obiekt" type="text" class="w-full h-7 px-2 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-800" />
              </td>
              <td class="py-1.5 px-1">
                <input v-model="s.typ" type="text" class="w-full h-7 px-1 rounded-md border border-slate-200 bg-white text-xs font-mono text-center" />
              </td>
              <td class="py-1.5 px-1">
                <input v-model="s.inVal" type="text" class="w-full h-7 px-1 rounded-md border border-slate-200 bg-white text-xs font-mono text-center" />
              </td>
              <td class="py-1.5 px-1">
                <input v-model="s.ta" type="text" class="w-full h-7 px-1 rounded-md border border-slate-200 bg-white text-xs font-mono text-center" />
              </td>
              <td class="py-1.5 px-1">
                <input v-model="s.ia" type="text" class="w-full h-7 px-1 rounded-md border border-slate-200 bg-white text-xs font-mono text-center" />
              </td>
              <td class="py-1.5 px-1">
                <input
                  v-model="s.zpom"
                  @input="recalcSwzIk(s)"
                  type="text"
                  class="w-full h-7 px-1.5 rounded-md border border-blue-200 bg-blue-50/30 text-xs font-mono font-bold text-center text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </td>
              <td class="py-1.5 px-1">
                <input
                  v-model="s.ik"
                  type="text"
                  class="w-full h-7 px-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs font-mono font-black text-center text-slate-700"
                />
              </td>
              <td class="py-1.5 px-1">
                <input v-model="s.zdop" type="text" class="w-full h-7 px-1.5 rounded-md border border-slate-200 bg-white text-xs font-mono text-center" />
              </td>
              <td class="py-1.5 px-1">
                <select
                  v-model="s.ocena"
                  class="w-full h-7 px-1 rounded-md border border-slate-200 bg-white text-[10.5px] font-black text-center"
                  :class="s.ocena === 'NIE' ? 'text-rose-600' : 'text-emerald-700'"
                >
                  <option value="TAK">TAK</option>
                  <option value="NIE">NIE</option>
                </select>
              </td>
              <td class="py-1.5 px-1 text-center">
                <button
                  v-if="measurements.swzRows.length > 1"
                  type="button"
                  @click="measurements.swzRows.splice(idx, 1)"
                  class="w-6 h-6 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black cursor-pointer"
                >✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <label class="block text-[9.5px] font-black uppercase tracking-wider text-slate-400 mb-1">Dodatkowe uwagi (SWZ)</label>
        <input v-model="measurements.notesSWZ" type="text" class="w-full h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-teal-600" />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const METERS_STORAGE_KEY = 'ekoen_saved_meters_v1'

const RISO_AC_FIELDS = [
  { key: 'RISO_L1_L2', label: 'L1 - L2', pe: false },
  { key: 'RISO_L1_L3', label: 'L1 - L3', pe: false },
  { key: 'RISO_L2_L3', label: 'L2 - L3', pe: false },
  { key: 'RISO_L1_N', label: 'L1 - N', pe: false },
  { key: 'RISO_L2_N', label: 'L2 - N', pe: false },
  { key: 'RISO_L3_N', label: 'L3 - N', pe: false },
  { key: 'RISO_L1_PE', label: 'L1 - PE', pe: true },
  { key: 'RISO_L2_PE', label: 'L2 - PE', pe: true },
  { key: 'RISO_L3_PE', label: 'L3 - PE', pe: true },
  { key: 'RISO_N_PE', label: 'N - PE', pe: false }
]

const props = defineProps({
  measurements: { type: Object, required: true }
})

const emit = defineEmits(['reset-defaults'])

const showSecondMeter = ref(false)
const metersSavedFlash = ref(false)

const loadSavedMetersIfEmpty = () => {
  try {
    const raw = localStorage.getItem(METERS_STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (!props.measurements.meterName && saved.meterName) props.measurements.meterName = saved.meterName
    if (!props.measurements.meterSerial && saved.meterSerial) props.measurements.meterSerial = saved.meterSerial
    if (!props.measurements.meterCert && saved.meterCert) props.measurements.meterCert = saved.meterCert
    if (!props.measurements.meterName2 && saved.meterName2) props.measurements.meterName2 = saved.meterName2
    if (!props.measurements.meterSerial2 && saved.meterSerial2) props.measurements.meterSerial2 = saved.meterSerial2
    if (!props.measurements.meterCert2 && saved.meterCert2) props.measurements.meterCert2 = saved.meterCert2

    if (props.measurements.meterName2 || props.measurements.meterSerial2 || props.measurements.meterCert2) {
      showSecondMeter.value = true
    }
  } catch (_) {}
}

const saveMetersToStorage = () => {
  try {
    localStorage.setItem(METERS_STORAGE_KEY, JSON.stringify({
      meterName: props.measurements.meterName || '',
      meterSerial: props.measurements.meterSerial || '',
      meterCert: props.measurements.meterCert || '',
      meterName2: props.measurements.meterName2 || '',
      meterSerial2: props.measurements.meterSerial2 || '',
      meterCert2: props.measurements.meterCert2 || ''
    }))
    metersSavedFlash.value = true
    setTimeout(() => { metersSavedFlash.value = false }, 2200)
  } catch (_) {}
}

const clearSecondMeter = () => {
  props.measurements.meterName2 = ''
  props.measurements.meterSerial2 = ''
  props.measurements.meterCert2 = ''
  showSecondMeter.value = false
}

const addPeRow = () => {
  if (props.measurements.peRows.length >= 10) return
  props.measurements.peRows.push({
    p1: 'Główna szyna PE',
    p2: 'Nowy punkt PE',
    val: '<1Ω Nieprzerwany'
  })
}

const addRisoOutput = () => {
  if (props.measurements.riso.outputs.length >= 6) return
  const nextNum = props.measurements.riso.outputs.length + 1
  props.measurements.riso.outputs.push({
    name: `Wyjście: Obwód ${nextNum}`,
    voltage: '1000 V',
    dcdc: '>3 GΩ',
    pedcp: '>3 GΩ',
    pedcm: '>3 GΩ'
  })
}

const addRcdRow = () => {
  if (props.measurements.rcdRows.length >= 10) return
  props.measurements.rcdRows.push({
    name: 'Nowy wyłącznik RCD',
    din: '0.03',
    prad: '20.0',
    czas: '15',
    ub: '0.008',
    re: '0.39',
    test: 'TAK',
    ocena: 'TAK'
  })
}

const addSwzRow = () => {
  if (props.measurements.swzRows.length >= 10) return
  props.measurements.swzRows.push({
    obiekt: 'Nowy obwód SWZ',
    typ: 'B',
    inVal: '16',
    ta: '0.4',
    ia: '80',
    zpom: '0.100',
    ik: '2300',
    zdop: '1.44',
    ocena: 'TAK'
  })
}

const recalcSwzIk = (row) => {
  const z = parseFloat(String(row.zpom || '').replace(',', '.'))
  row.ik = (!isNaN(z) && z > 0) ? String(Math.round(230 / z)) : '-'
}

const handleResetStandard = () => {
  if (!confirm('Przywrócić standardowe wyniki w tabelach PE, RISO, RCD i SWZ?')) return
  emit('reset-defaults')
}

onMounted(() => {
  loadSavedMetersIfEmpty()
  if (props.measurements.meterName2 || props.measurements.meterSerial2 || props.measurements.meterCert2) {
    showSecondMeter.value = true
  }
})
</script>