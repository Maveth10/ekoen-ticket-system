<template>
  <div :class="fullWidth ? 'w-full' : 'inline-flex'" @click.stop>

    <!-- GDY ISTNIEJE POWIĄZANA OFERTA W sys_offers -->
    <div v-if="primaryOffer" class="flex items-center gap-1 w-full">
      <button
        type="button"
        @click.stop="handlePrimaryClick(primaryOffer)"
        class="flex-1 min-w-0 rounded-xl px-2.5 py-1 text-left border transition-all flex items-center justify-between gap-1.5"
        :class="[
          getOfferBadgeClass(primaryOffer),
          (auth.offerPermissions.canViewPanel || !isPricedOffer(primaryOffer)) ? 'cursor-pointer' : 'cursor-default'
        ]"
        :title="getOfferTooltip(primaryOffer)"
      >
        <span class="flex items-center gap-1.5 min-w-0 text-[9px] font-black uppercase tracking-wider">
          <span
            v-if="!isPricedOffer(primaryOffer) && primaryOffer.status_offer === 'PRZYGOTOWANIE'"
            class="w-1.5 h-1.5 rounded-full bg-violet-600 animate-ping shrink-0"
          ></span>
          <span class="truncate">{{ getPrimaryLabel(primaryOffer) }}</span>
        </span>

        <span
          v-if="linkedOffers.length > 1"
          class="px-1 py-0.2 rounded bg-black/10 text-[8px] font-black shrink-0"
        >
          +{{ linkedOffers.length - 1 }}
        </span>
      </button>

      <!-- Szybki skrót do wygenerowanego PDF (dla ról z dostępem do Ofert) -->
      <a
        v-if="primaryOffer.pdf_url && auth.offerPermissions.canViewPanel"
        :href="primaryOffer.pdf_url"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
        class="px-2 py-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-wider shrink-0 transition-colors"
        title="Otwórz wygenerowany plik PDF oferty"
      >
        PDF
      </a>
    </div>

    <!-- GDY BRAK OFERTY: ROLA EDYTORA OFERT -> PRZYGOTUJ OFERTĘ (KREATOR PDF) -->
    <button
      v-else-if="auth.offerPermissions.canGeneratePdf"
      type="button"
      @click.stop="handleCreateOfferInPanel"
      class="w-full rounded-xl px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest border border-dashed border-slate-300 text-slate-400 bg-white/70 hover:border-[#58b347] hover:text-[#499b3a] hover:bg-[#f0f7f1]/70 transition-colors cursor-pointer text-center truncate"
      title="Otwórz Kreator Oferty PDF z danymi tego zgłoszenia"
    >
      + Przygotuj ofertę
    </button>

    <!-- GDY BRAK OFERTY: TECHNIK / POZOSTAŁY PERSONEL -> POPROŚ O OFERTĘ -->
    <button
      v-else-if="auth.offerPermissions.canRequestFromTicket"
      type="button"
      @click.stop="openRequestModal"
      class="w-full rounded-xl px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest border border-dashed border-slate-300 text-slate-500 bg-white/70 hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50/50 transition-colors cursor-pointer text-center truncate"
      title="Wyślij prośbę o wycenę do biura (zapisuje w sys_offers)"
    >
      + Poproś o ofertę
    </button>

    <!-- MODAL PROŚBY O OFERTĘ (DLA SERWISU / TECHNIKÓW) -->
    <Teleport to="body">
      <div
        v-if="showRequestModal"
        @click.self="showRequestModal = false"
        class="fixed inset-0 z-[2100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-black uppercase tracking-widest text-slate-800">
                {{ existingRequestOffer ? 'Szczegóły prośby o ofertę' : 'Prośba o przygotowanie oferty' }}
              </h3>
              <p class="text-[11px] font-bold text-slate-400 mt-0.5">
                Zgłoszenie <span class="font-mono text-slate-600">#{{ normalizedMeta.primaryId }}</span>
                <span v-if="normalizedMeta.qp"> • <span class="font-mono text-[#58b347]">{{ normalizedMeta.qp }}</span></span>
              </p>
            </div>
            <button type="button" @click="showRequestModal = false" class="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
          </div>

          <form @submit.prevent="submitOfferRequest" class="p-6 space-y-4 bg-slate-50/40">
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-white border border-slate-200">
                <div class="text-[9.5px] font-black uppercase tracking-wider text-slate-400">Klient</div>
                <div class="font-extrabold text-slate-800 mt-0.5 truncate">{{ normalizedMeta.clientName || 'Brak danych' }}</div>
              </div>
              <div class="p-3 rounded-xl bg-white border border-slate-200">
                <div class="text-[9.5px] font-black uppercase tracking-wider text-slate-400">Stacja / Lokalizacja</div>
                <div class="font-extrabold text-slate-800 mt-0.5 truncate">{{ normalizedMeta.qp || '-' }} {{ normalizedMeta.location ? '• ' + normalizedMeta.location : '' }}</div>
              </div>
            </div>

            <!-- Szybkie tagi powodów -->
            <div v-if="!existingRequestOffer" class="flex flex-wrap gap-1.5">
              <button
                v-for="tag in QUICK_REASONS"
                :key="tag"
                type="button"
                @click="applyQuickTag(tag)"
                class="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-600 hover:text-violet-700 transition-colors cursor-pointer"
              >
                + {{ tag }}
              </button>
            </div>

            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Temat / zakres do wyceny *</label>
              <input
                v-model="requestForm.project_name"
                :readonly="Boolean(existingRequestOffer)"
                type="text"
                required
                placeholder="np. Wymiana wtyczki CCS2 + pomiary"
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#58b347] read-only:bg-slate-100"
              />
            </div>

            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Szczegóły, diagnoza i potrzebne części *</label>
              <textarea
                v-model="requestForm.description"
                :readonly="Boolean(existingRequestOffer)"
                rows="4"
                required
                placeholder="Opisz co trzeba wycenić (części, roboczogodziny, podnośnik, ponowny dojazd)..."
                class="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#58b347] resize-none read-only:bg-slate-100"
              ></textarea>
            </div>

            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1">Uwagi dla biura (opcjonalnie)</label>
              <input
                v-model="requestForm.internal_notes"
                :readonly="Boolean(existingRequestOffer)"
                type="text"
                placeholder="np. Pilne — stacja całkowicie wyłączona"
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-[#58b347] read-only:bg-slate-100"
              />
            </div>
          </form>

          <div class="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-2.5">
            <button type="button" @click="showRequestModal = false" class="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer">
              {{ existingRequestOffer ? 'Zamknij' : 'Anuluj' }}
            </button>
            <button
              v-if="!existingRequestOffer"
              type="button"
              :disabled="isSubmitting"
              @click="submitOfferRequest"
              class="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {{ isSubmitting ? 'Wysyłanie...' : 'Wyślij prośbę do wyceny' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script>
// Wspólna blokada na poziomie modułu — 100 wierszy w tabeli wywoła tylko 1 pobranie sys_offers
let sharedOffersBootstrapPromise = null
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOffersStore } from '../../stores/useOffersStore'
import { useAuthStore } from '../../stores/useAuthStore'

const QUICK_REASONS = ['Uszkodzenie mech.', 'Kabel / wtyczka', 'Pogwarancyjne', 'Modernizacja']

const props = defineProps({
  ticket: { type: Object, required: true },
  module: { type: String, default: 'axon' }, // 'axon' | 'ekoen'
  displayCode: { type: String, default: '' },
  fullWidth: { type: Boolean, default: false }
})

const offersStore = useOffersStore()
const auth = useAuthStore()

const showRequestModal = ref(false)
const existingRequestOffer = ref(null)
const isSubmitting = ref(false)
const requestForm = ref({
  project_name: '',
  description: '',
  internal_notes: ''
})

const getShortQp = (rawQp) => {
  if (!rawQp) return ''
  const str = String(rawQp).trim()
  const firstDash = str.indexOf('-')
  if (firstDash === -1) return str
  const secondDash = str.indexOf('-', firstDash + 1)
  return secondDash !== -1 ? str.substring(0, secondDash) : str
}

const normalizedMeta = computed(() => {
  const t = props.ticket || {}
  const isEkoen = props.module === 'ekoen'

  const primaryId = String(
    props.displayCode ||
    (isEkoen ? (t.ekoen_code || t.ticket_number || t.id) : (t.ticket_code || t.id)) ||
    ''
  ).trim()

  const extraLinked = String(t.linked_ekoen_id || '')
    .split(/[,;\s]+/)
    .map(s => s.trim())
    .filter(Boolean)

  const matchIds = [
    primaryId,
    t.ticket_code,
    t.ekoen_code,
    t.ticket_number,
    t.id,
    t.axon_ticket_id,
    ...extraLinked
  ].filter(Boolean)

  const qp = getShortQp(t.qp_id || t.station_id)
  const clientName = String(t.client || t.contact_name || (isEkoen ? 'EKOEN' : '')).trim()
  const location = [t.city, t.address || t.street].filter(Boolean).join(', ').trim()
  const title = String(t.title || t.subject || '').trim()
  const eepOrder = isEkoen ? String(t.axon_ticket_id || '').trim() : String(t.ticket_code || '').trim()
  const clientContact = [t.contact_person || t.contact_name, t.contact_email, t.contact_phone].filter(Boolean).join(', ')

  const descParts = []
  if (t.description) descParts.push(String(t.description).trim())
  if (t.raw_diagnoza) descParts.push(`Diagnoza: ${String(t.raw_diagnoza).trim()}`)
  if (t.parts_str) descParts.push(`Części: ${String(t.parts_str).trim()}`)

  return {
    primaryId,
    matchIds,
    qp,
    clientName,
    clientContact,
    location,
    title,
    eepOrder,
    fullDesc: descParts.join('\n')
  }
})

const linkedOffers = computed(() => {
  const needles = normalizedMeta.value.matchIds
    .map(x => String(x || '').replace(/^#/, '').trim().toLowerCase())
    .filter(Boolean)
  if (needles.length === 0) return []

  return (offersStore.offers || []).filter(o => {
    const tokens = String(o.ticket_ids || '')
      .toLowerCase()
      .split(/[,;\s]+/)
      .map(tok => tok.replace(/^#/, '').trim())
      .filter(Boolean)
    return needles.some(n => tokens.includes(n))
  })
})

const primaryOffer = computed(() => {
  if (linkedOffers.value.length === 0) return null
  return linkedOffers.value.find(o => o.status_offer !== 'ANULOWANE') || linkedOffers.value[0]
})

const isPricedOffer = (off) => {
  return Boolean(off && off.offer_number && off.offer_number !== '-')
}

const shortOfferNum = (num) => {
  const parts = String(num || '').split('/')
  if (parts.length >= 3) return `${parts[0]}/${parts[1]}/${parts[2]}`
  return String(num || '')
}

const getPrimaryLabel = (off) => {
  const st = String(off.status_offer || '').toUpperCase()
  const hasNum = isPricedOffer(off)
  const sNum = hasNum ? shortOfferNum(off.offer_number) : ''

  // Widok dla Biura / Managera / Admina
  if (auth.offerPermissions.canViewPanel) {
    if (!hasNum && st === 'PRZYGOTOWANIE') return 'Prośba o ofertę!'
    if (st === 'ZAAKCEPTOWANA') return sNum ? `✓ ${sNum}` : 'Oferta zaakcept.'
    if (st === 'OCZEKUJE NA AKCEPTACJE') return sNum ? `Oferta: ${sNum}` : 'Oferta wysłana'
    if (st === 'ANULOWANE') return sNum ? `✕ ${sNum}` : 'Oferta anulowana'
    return sNum ? `Szkic: ${sNum}` : 'Oferta w toku'
  }

  // Widok dla Technika (czysty status operacyjny bez kwot)
  if (st === 'ZAAKCEPTOWANA') return '✓ Oferta zaakcept.'
  if (st === 'OCZEKUJE NA AKCEPTACJE') return 'Oferta wysłana'
  if (st === 'ANULOWANE') return '✕ Oferta anulowana'
  return 'W wycenie (prośba)'
}

const getOfferBadgeClass = (off) => {
  const st = String(off.status_offer || '').toUpperCase()
  if (!isPricedOffer(off) && st === 'PRZYGOTOWANIE') {
    return 'bg-violet-50 text-violet-800 border-violet-300 hover:bg-violet-100 shadow-2xs'
  }
  if (st === 'ZAAKCEPTOWANA') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
  }
  if (st === 'OCZEKUJE NA AKCEPTACJE') {
    return 'bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100'
  }
  if (st === 'ANULOWANE') {
    return 'bg-slate-100 text-slate-400 border-slate-200 line-through'
  }
  return 'bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100'
}

const getOfferTooltip = (off) => {
  if (auth.offerPermissions.canViewPanel) {
    const num = isPricedOffer(off) ? off.offer_number : 'Szkic / Prośba z serwisu'
    const price = Number(off.total_netto) > 0 ? ` • ${off.amountStr || (off.total_netto + ' zł netto')}` : ''
    const note = off.project_name ? `\nZakres: ${off.project_name}` : ''
    return `${num} (${off.status_offer})${price}${note}\nKliknij, aby otworzyć w panelu Ofert`
  }
  return `${getPrimaryLabel(off)}${off.project_name ? ' — ' + off.project_name : ''}`
}

const buildPrefillPayload = () => {
  const m = normalizedMeta.value
  return {
    client_name: m.clientName,
    client_contact: m.clientContact,
    station_qp: m.qp,
    station_location: m.location,
    ticket_ids: m.primaryId,
    ticket_module: props.module,
    eep_order: m.eepOrder,
    project_name: m.title,
    description: m.fullDesc,
    internal_notes: ''
  }
}

const handlePrimaryClick = (off) => {
  if (auth.offerPermissions.canViewPanel) {
    offersStore.openOfferInPanel(off.id)
    return
  }
  // Technik może podejrzeć treść wysłanej przez siebie prośby
  if (!isPricedOffer(off)) {
    existingRequestOffer.value = off
    requestForm.value = {
      project_name: off.project_name || '',
      description: off.description || '',
      internal_notes: off.internal_notes || ''
    }
    showRequestModal.value = true
  }
}

const handleCreateOfferInPanel = () => {
  offersStore.openNewOfferFromTicket(buildPrefillPayload())
}

const applyQuickTag = (tag) => {
  const m = normalizedMeta.value
  requestForm.value.project_name = m.qp ? `${tag} — ${m.qp}` : tag
}

const openRequestModal = () => {
  existingRequestOffer.value = null
  const m = normalizedMeta.value
  requestForm.value = {
    project_name: m.title || (m.qp ? `Wycena prac serwisowych — ${m.qp}` : 'Wycena prac serwisowych'),
    description: m.fullDesc,
    internal_notes: ''
  }
  showRequestModal.value = true
}

const submitOfferRequest = async () => {
  if (existingRequestOffer.value || !requestForm.value.project_name.trim()) return
  isSubmitting.value = true
  try {
    const res = await offersStore.requestOfferFromTicket({
      ...buildPrefillPayload(),
      project_name: requestForm.value.project_name.trim(),
      description: requestForm.value.description.trim(),
      internal_notes: requestForm.value.internal_notes.trim()
    })
    if (res && res.success) {
      showRequestModal.value = false
    } else {
      alert(res?.error || 'Nie udało się wysłać prośby o ofertę.')
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (offersStore.offers.length === 0 && !sharedOffersBootstrapPromise) {
    sharedOffersBootstrapPromise = offersStore.fetchOffersData().finally(() => {
      setTimeout(() => { sharedOffersBootstrapPromise = null }, 5000)
    })
  }
})
</script>