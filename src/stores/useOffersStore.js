import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './useAuthStore'

const DEV_OFFERS_KEY = 'ekoen_dev_sys_offers_v1'
const DEV_CATALOG_KEY = 'ekoen_dev_sys_offer_catalog_v1'

const DEFAULT_DEV_CATALOG = [
  { id: 'SRV_001', item_type: 'SERVICE', code: 'SRV-001', name: 'Usługa logistyczna', unit_price_pln: 350 },
  { id: 'SRV_002', item_type: 'SERVICE', code: 'SRV-002', name: 'Diagnoza zdalna', unit_price_pln: 300 },
  { id: 'SRV_003', item_type: 'SERVICE', code: 'SRV-003', name: 'Diagnoza i naprawa na miejscu*', unit_price_pln: 900 },
  { id: 'SRV_004', item_type: 'SERVICE', code: 'SRV-004', name: 'Naprawa po diagnozie / kontynuacja zlecenia', unit_price_pln: 300 },
  { id: 'SRV_005', item_type: 'SERVICE', code: 'SRV-005', name: 'Wymiana/Instalacja CCS z zarobieniem przewodu', unit_price_pln: 450 },
  { id: 'SRV_006', item_type: 'SERVICE', code: 'SRV-006', name: 'Wymiana/Instalacja CCS złożenie (gotowy do instalacji)', unit_price_pln: 450 },
  { id: 'SRV_007', item_type: 'SERVICE', code: 'SRV-007', name: 'Modernizacja Chademo na CCS', unit_price_pln: 26750 },
  { id: 'SRV_008', item_type: 'SERVICE', code: 'SRV-008', name: 'Dołożenie kompensatora mocy biernej', unit_price_pln: 27000 },
  { id: 'SRV_009', item_type: 'SERVICE', code: 'SRV-009', name: 'Instalacja: Ładowarka DC All-in-one (1.0/1.2/1.3)', unit_price_pln: 4200 },
  { id: 'SRV_010', item_type: 'SERVICE', code: 'SRV-010', name: 'Instalacja: Ładowarka Power Unit (SIDE)', unit_price_pln: 4600 },
  { id: 'SRV_011', item_type: 'SERVICE', code: 'SRV-011', name: 'Instalacja: User Unit', unit_price_pln: 2000 },
  { id: 'SRV_012', item_type: 'SERVICE', code: 'SRV-012', name: 'Pomiary UDT', unit_price_pln: 1200 },
  { id: 'SRV_013', item_type: 'SERVICE', code: 'SRV-013', name: 'Uruchomienie stacji', unit_price_pln: 1600 },
  { id: 'SRV_014', item_type: 'SERVICE', code: 'SRV-014', name: 'Uruchomienie: DC All-in-One (1.0/1.2/1.3) / Side + UserUnit', unit_price_pln: 1600 },
  { id: 'SRV_015', item_type: 'SERVICE', code: 'SRV-015', name: 'Uruchomienie: Dodatkowy UserUnit', unit_price_pln: 200 },
  { id: 'SRV_016', item_type: 'SERVICE', code: 'SRV-016', name: 'Instalacja (pomiary+uruch.): Ładowarka DC All-in-One (1.0/1.2/1.3)', unit_price_pln: 5600 },
  { id: 'SRV_017', item_type: 'SERVICE', code: 'SRV-017', name: 'Instalacja (pomiary+uruch.): Ładowarka Power Unit (SIDE)', unit_price_pln: 6000 },
  { id: 'SRV_018', item_type: 'SERVICE', code: 'SRV-018', name: 'Instalacja (pomiary+uruch.): User Unit', unit_price_pln: 2850 },
  { id: 'SRV_019', item_type: 'SERVICE', code: 'SRV-019', name: 'Przegląd roczny 1-20 stacji (DC All-in-One/PANTO)', unit_price_pln: 2500 },
  { id: 'SRV_020', item_type: 'SERVICE', code: 'SRV-020', name: 'Przegląd roczny 21+ stacji (DC All-in-One/PANTO)', unit_price_pln: 2300 }
]

const parseGasResponse = (res) => {
  if (typeof res === 'string') {
    try { return JSON.parse(res) } catch (_) { return { success: false, error: res } }
  }
  return res || { success: false, error: 'Pusta odpowiedź serwera' }
}

const isOfferArchived = (o) => {
  if (!o) return false
  const stOff = String(o.status_offer || '').toUpperCase()
  const stEx = String(o.status_exec || '').toUpperCase()
  const stBill = String(o.status_billing || '').toUpperCase()
  if (stOff === 'ANULOWANE' || stEx === 'ANULOWANE') return true
  if (stEx === 'ZREALIZOWANO' && stBill === 'ROZLICZONE') return true
  return false
}

export const useOffersStore = defineStore('offers', () => {
  const auth = useAuthStore()

  const offers = ref([])
  const catalog = ref([])
  const clients = ref([])
  const warehouseParts = ref([])

  const nextSeq = ref(1)
  const currentYear = ref(new Date().getFullYear())
  const baseOfferNumber = ref(`OES/001/${new Date().getFullYear()}`)
  const today = ref(new Date().toISOString().split('T')[0])

  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref('')
  const hasLoaded = ref(false)
  let inflightFetchPromise = null

  // Stan pod szybkie przejście ze Zgłoszeń do konkretnej oferty lub kreatora
  const pendingOpenOfferId = ref(null)
  const pendingDraftFromTicket = ref(null)

  // Statystyki KPI dla panelu Ofert
  const kpiStats = computed(() => {
    let billedSum = 0
    let acceptedSum = 0
    let activeCount = 0
    let draftsCount = 0
    let collectiveCount = 0
    let flaggedCount = 0
    let archiveCount = 0
    let readyToBillCount = 0
    let missingReportCount = 0

    offers.value.forEach(o => {
      const archived = isOfferArchived(o)
      if (archived) {
        archiveCount++
      } else {
        activeCount++
        if (!o.offer_number || o.offer_number === '-' || o.status_offer === 'PRZYGOTOWANIE') {
          draftsCount++
        }
      }
      if (o.is_flagged) flaggedCount++

      if (o.status_offer === 'ANULOWANE' || o.status_exec === 'ANULOWANE') return

      const hasRep = Boolean(o.hasReport || (o.visitReports && o.visitReports.length > 0))
      if (o.status_billing === 'NIEROZLICZONE' && hasRep) readyToBillCount++
      if (o.status_exec === 'ZREALIZOWANO' && !hasRep) missingReportCount++
      if (o.is_collective && o.status_billing !== 'ROZLICZONE') collectiveCount++

      const amt = Number(o.total_netto) || 0
      if (o.status_billing === 'PRZEKAZANE DO FV' || o.status_billing === 'ROZLICZONE') {
        billedSum += amt
      } else if (o.status_offer === 'ZAAKCEPTOWANA') {
        acceptedSum += amt
      }
    })

    return {
      billedSum,
      acceptedSum,
      activeCount,
      draftsCount,
      collectiveCount,
      flaggedCount,
      archiveCount,
      readyToBillCount,
      missingReportCount
    }
  })

  const isGasEnv = () => typeof google !== 'undefined' && google.script && google.script.run

  const runGas = (fnName, ...args) => {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(res => resolve(parseGasResponse(res)))
        .withFailureHandler(err => reject(err))
        [fnName](...args)
    })
  }

  const persistDevCache = () => {
    try {
      localStorage.setItem(DEV_OFFERS_KEY, JSON.stringify(offers.value))
      localStorage.setItem(DEV_CATALOG_KEY, JSON.stringify(catalog.value))
    } catch (_) {}
  }

  const fetchOffersData = async () => {
    if (inflightFetchPromise) return inflightFetchPromise

    isLoading.value = true
    error.value = ''

    inflightFetchPromise = (async () => {
      try {
        if (isGasEnv()) {
          const res = await runGas('getOffersData')
          if (!res.success) throw new Error(res.error || 'Błąd pobierania ofert')

          offers.value = res.offers || []
        catalog.value = res.catalog || []
        warehouseParts.value = res.warehouseParts || []
        clients.value = res.clients || []
          nextSeq.value = res.nextSeq || 1
          currentYear.value = res.currentYear || new Date().getFullYear()
          baseOfferNumber.value = res.baseOfferNumber || `OES/001/${currentYear.value}`
          today.value = res.today || new Date().toISOString().split('T')[0]
          hasLoaded.value = true
        } else {
          const apiUrl = import.meta.env?.VITE_GAS_API_URL || ''
          if (apiUrl) {
            const resp = await fetch(`${apiUrl}?action=getOffersData`)
            const res = await resp.json()
            if (res.success) {
                offers.value = res.offers || []
                catalog.value = res.catalog || []
                warehouseParts.value = res.warehouseParts || []
                clients.value = res.clients || []
              nextSeq.value = res.nextSeq || 1
              currentYear.value = res.currentYear || new Date().getFullYear()
              baseOfferNumber.value = res.baseOfferNumber || `OES/001/${currentYear.value}`
              today.value = res.today || new Date().toISOString().split('T')[0]
              hasLoaded.value = true
              return
            }
          }

          const savedOff = localStorage.getItem(DEV_OFFERS_KEY)
          const savedCat = localStorage.getItem(DEV_CATALOG_KEY)
          offers.value = savedOff ? JSON.parse(savedOff) : []
          catalog.value = savedCat ? JSON.parse(savedCat) : [...DEFAULT_DEV_CATALOG]
          nextSeq.value = offers.value.length + 1
          baseOfferNumber.value = `OES/${String(nextSeq.value).padStart(3, '0')}/${currentYear.value}`
          hasLoaded.value = true
        }
      } catch (err) {
        error.value = err?.message || String(err)
        console.error('fetchOffersData error:', err)
      } finally {
        isLoading.value = false
        inflightFetchPromise = null
      }
    })()

    return inflightFetchPromise
  }

  const ensureOffersLoaded = () => {
    if (hasLoaded.value) return Promise.resolve()
    return fetchOffersData()
  }

  const requestOfferFromTicket = async (payload) => {
    if (!auth.offerPermissions.canRequestFromTicket) {
      return { success: false, error: 'Brak uprawnień do zgłaszania prośby o ofertę.' }
    }
    isSaving.value = true
    try {
      const fullPayload = {
        ...payload,
        requested_by: payload.requested_by || auth.user?.username || 'Serwis'
      }

      if (isGasEnv()) {
        const res = await runGas('requestOfferFromTicket', fullPayload)
        if (res.success) await fetchOffersData()
        return res
      }

      const newRec = {
        id: 'OFF_' + Date.now(),
        offer_number: '-',
        seq_num: 0,
        offer_date: today.value,
        monthKey: today.value.slice(0, 7),
        valid_until: '14 dni',
        status_offer: 'PRZYGOTOWANIE',
        status_exec: 'OCZEKUJE',
        status_billing: 'NIEROZLICZONE',
        is_collective: Boolean(fullPayload.is_collective),
        is_flagged: false,
        client_name: fullPayload.client_name || 'EKOEN',
        station_qp: fullPayload.station_qp || '',
        station_location: fullPayload.station_location || '',
        ticket_ids: fullPayload.ticket_ids || fullPayload.ticket_id || '',
        ticket_module: fullPayload.ticket_module || 'axon',
        project_name: fullPayload.project_name || fullPayload.subject || '',
        description: fullPayload.description || '',
        internal_notes: fullPayload.internal_notes || '',
        total_netto: 0,
        amountStr: '0,00 zł',
        requested_by: fullPayload.requested_by,
        author: fullPayload.requested_by,
        linkedTickets: [],
        scheduledVisits: []
      }
      offers.value.unshift(newRec)
      persistDevCache()
      return { success: true, id: newRec.id }
    } catch (err) {
      return { success: false, error: err?.message || String(err) }
    } finally {
      isSaving.value = false
    }
  }

  const saveOffer = async (payload) => {
    if (!auth.offerPermissions.canEdit) {
      return { success: false, error: 'Brak uprawnień do zapisu oferty.' }
    }
    isSaving.value = true
    try {
      const enriched = {
        ...payload,
        author: payload.author || auth.user?.username || 'Biuro EKOEN'
      }

      if (isGasEnv()) {
        const res = await runGas('saveOfferRecord', enriched)
        if (res.success) await fetchOffersData()
        return res
      }

      const idx = offers.value.findIndex(o => o.id === enriched.id)
      const amt = Number(enriched.total_netto) || 0
      const merged = {
        ...(idx > -1 ? offers.value[idx] : {}),
        ...enriched,
        id: enriched.id || ('OFF_' + Date.now()),
        offer_number: enriched.offer_number || baseOfferNumber.value,
        total_netto: amt,
        amountStr: amt.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł',
        monthKey: String(enriched.offer_date || today.value).slice(0, 7)
      }
      if (idx > -1) offers.value[idx] = merged
      else offers.value.unshift(merged)
      persistDevCache()
      return { success: true, id: merged.id, offer_number: merged.offer_number }
    } catch (err) {
      return { success: false, error: err?.message || String(err) }
    } finally {
      isSaving.value = false
    }
  }

  const updateOfferField = async (offerId, fieldName, value) => {
    if (!auth.offerPermissions.canEdit) {
      return { success: false, error: 'Brak uprawnień do edycji oferty.' }
    }
    const target = offers.value.find(o => o.id === offerId)
    if (target) {
      if (fieldName === 'is_collective') target.is_collective = (value === 'TAK' || value === true)
      else if (fieldName === 'is_flagged') target.is_flagged = (value === 'TAK' || value === true)
      else if (fieldName === 'total_netto') {
        const num = parseFloat(String(value).replace(/\s/g, '').replace(',', '.')) || 0
        target.total_netto = num
        target.amountStr = num.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł'
      } else {
        target[fieldName] = value
      }
    }

    if (isGasEnv()) {
      return await runGas('updateOfferCell', offerId, fieldName, value)
    }
    persistDevCache()
    return { success: true }
  }

  const toggleCollective = (offerId) => {
    const target = offers.value.find(o => o.id === offerId)
    if (!target) return
    const nextVal = !target.is_collective
    return updateOfferField(offerId, 'is_collective', nextVal ? 'TAK' : 'NIE')
  }

  const toggleFlag = (offerId) => {
    const target = offers.value.find(o => o.id === offerId)
    if (!target) return
    const nextVal = !target.is_flagged
    return updateOfferField(offerId, 'is_flagged', nextVal ? 'TAK' : 'NIE')
  }

  const saveCatalogItem = async (item) => {
    if (!auth.offerPermissions.canEditCatalog) {
      return { success: false, error: 'Brak uprawnień do edycji katalogu.' }
    }
    if (isGasEnv()) {
      const res = await runGas('saveOfferCatalogItem', item)
      if (res.success) await fetchOffersData()
      return res
    }
    const id = item.id || ('CAT_' + Date.now())
    const idx = catalog.value.findIndex(c => c.id === id)
    const entry = { ...item, id, unit_price_pln: Number(item.unit_price_pln) || 0 }
    if (idx > -1) catalog.value[idx] = entry
    else catalog.value.push(entry)
    persistDevCache()
    return { success: true, id }
  }

  const previewPdf = async (formData) => {
    if (!auth.offerPermissions.canGeneratePdf) {
      return { success: false, error: 'Brak uprawnień do generowania podglądu PDF.' }
    }
    if (!isGasEnv()) {
      return { success: false, error: 'Podgląd PDF działa bezpośrednio w środowisku Google Apps Script.' }
    }
    return await runGas('previewOfferPdf', formData)
  }

  const generatePdf = async (formData) => {
    if (!auth.offerPermissions.canGeneratePdf) {
      return { success: false, error: 'Brak uprawnień do generowania oferty PDF.' }
    }
    isSaving.value = true
    try {
      const enriched = {
        ...formData,
        author: payloadAuthor(formData, auth)
      }
      if (!isGasEnv()) {
        const saved = await saveOffer(enriched)
        return { ...saved, pdfUrl: '', note: 'Tryb lokalny DEV — zapisano w localStorage bez pliku PDF.' }
      }
      const res = await runGas('generateOfferPdf', enriched)
      if (res.success) await fetchOffersData()
      return res
    } catch (err) {
      return { success: false, error: err?.message || String(err) }
    } finally {
      isSaving.value = false
    }
  }

  const payloadAuthor = (formData, authStore) =>
    formData.author || authStore.user?.username || 'Biuro EKOEN'

    const getOffersForTicket = (ticketIdOrList) => {
        const rawList = Array.isArray(ticketIdOrList) ? ticketIdOrList : [ticketIdOrList]
        const needles = rawList
          .map(x => String(x || '').replace(/^#/, '').trim().toLowerCase())
          .filter(Boolean)
        if (needles.length === 0) return []
    
        return offers.value.filter(o => {
          const tokens = String(o.ticket_ids || '')
            .toLowerCase()
            .split(/[,;\s]+/)
            .map(t => t.replace(/^#/, '').trim())
            .filter(Boolean)
          return needles.some(n => tokens.includes(n))
        })
      }

      const deleteCatalogItem = async (itemId) => {
        if (!auth.offerPermissions.canEditCatalog) {
          return { success: false, error: 'Brak uprawnień do edycji katalogu.' }
        }
        if (isGasEnv()) {
          const res = await runGas('deleteOfferCatalogItem', itemId)
          if (res.success) await fetchOffersData()
          return res
        }
        catalog.value = catalog.value.filter(c => c.id !== itemId)
        persistDevCache()
        return { success: true }
      }
    
      const mergeOfferIntoExisting = async (draftOfferId, targetOfferId) => {
        if (!auth.offerPermissions.canEdit) {
          return { success: false, error: 'Brak uprawnień do scalania ofert.' }
        }
        isSaving.value = true
        try {
          if (isGasEnv()) {
            const res = await runGas('mergeDraftOfferIntoExisting', draftOfferId, targetOfferId)
            if (res.success) await fetchOffersData()
            return res
          }
          const draft = offers.value.find(o => o.id === draftOfferId)
          const target = offers.value.find(o => o.id === targetOfferId)
          if (!draft || !target) return { success: false, error: 'Nie znaleziono ofert.' }
    
          const tSet = new Set(
            `${target.ticket_ids || ''},${draft.ticket_ids || ''}`
              .split(/[,;\s]+/)
              .map(s => s.trim())
              .filter(Boolean)
          )
          target.ticket_ids = Array.from(tSet).join(', ')
          draft.status_offer = 'ANULOWANE'
          draft.status_exec = 'ANULOWANE'
          draft.internal_notes = [`Włączono do oferty: ${target.offer_number}`, draft.internal_notes].filter(Boolean).join(' | ')
          persistDevCache()
          return { success: true, targetOfferNumber: target.offer_number }
        } catch (err) {
          return { success: false, error: err?.message || String(err) }
        } finally {
          isSaving.value = false
        }
      }
    
      const sendOfferToTickets = async (offerId) => {
        if (!auth.offerPermissions.canEdit) {
          return { success: false, error: 'Brak uprawnień do wysyłania zleceń.' }
        }
        isSaving.value = true
        try {
          if (isGasEnv()) {
            const res = await runGas('sendOfferToTickets', offerId)
            if (res.success) await fetchOffersData()
            return res
          }
          const target = offers.value.find(o => o.id === offerId)
          if (!target) return { success: false, error: 'Nie znaleziono oferty.' }
          const fakeCode = 'EE_' + String(Math.floor(Math.random() * 900) + 100)
          target.ticket_ids = [target.ticket_ids, fakeCode].filter(Boolean).join(', ')
          persistDevCache()
          return { success: true, ticketNumber: fakeCode, message: `Tryb DEV: przypisano ${fakeCode}` }
        } catch (err) {
          return { success: false, error: err?.message || String(err) }
        } finally {
          isSaving.value = false
        }
      }
    
      const fetchOfferCaseFolder = async (offerId) => {
        if (!isGasEnv()) {
          return {
            success: true,
            folderName: 'Tryb lokalny DEV (Dysk Google dostępny po wdrożeniu w GAS)',
            folderUrl: '',
            ofertyFolderUrl: '',
            files: []
          }
        }
        return await runGas('getOfferCaseFolderContents', offerId)
      }
    
      const uploadFileToOfferFolder = async (payload) => {
        if (!isGasEnv()) {
          return { success: false, error: 'Wgrywanie plików na Dysk Google działa w środowisku Google Apps Script.' }
        }
        const res = await runGas('uploadOfferCaseFile', payload)
        if (res && res.success) await fetchOffersData()
        return res
      }
    
      const openOfferInPanel = (offerId) => {
        pendingOpenOfferId.value = offerId
      }
    
      const openNewOfferFromTicket = (ticketData) => {
        pendingDraftFromTicket.value = ticketData
      }
    
      return {
        offers,
        catalog,
        warehouseParts,
        clients,
    nextSeq,
    currentYear,
    baseOfferNumber,
    today,
    isLoading,
    isSaving,
    error,
    kpiStats,
    pendingOpenOfferId,
    pendingDraftFromTicket,
    isOfferArchived,
    fetchOffersData,
    requestOfferFromTicket,
    saveOffer,
    updateOfferField,
    toggleCollective,
    toggleFlag,
    saveCatalogItem,
    deleteCatalogItem,
    mergeOfferIntoExisting,
    sendOfferToTickets,
    fetchOfferCaseFolder,
    uploadFileToOfferFolder,
    previewPdf,
    generatePdf,
    getOffersForTicket,
    openOfferInPanel,
    openNewOfferFromTicket,
    hasLoaded,
    ensureOffersLoaded
  }
})