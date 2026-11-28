import { defineStore } from 'pinia'
import { ref } from 'vue'

const DEFAULT_DEV_PRICELISTS = {
  'Cennik Axon Easy 1.3': [
    { num: '1.1', name: 'Diagnostyka i weryfikacja usterki stacji DC', price: 85, curr: 'EUR' },
    { num: '2.4', name: 'Wymiana przewodu ładowania CCS2 z testem izolacji', price: 140, curr: 'EUR' },
    { num: '3.2', name: 'Wymiana modułu mocy / kontrolera CLC', price: 110, curr: 'EUR' }
  ],
  'Cennik Axon Side DLBS': [
    { num: '1.1', name: 'Diagnostyka szafy mocy / satelity SAT', price: 95, curr: 'EUR' }
  ]
}

const DEFAULT_DEV_PARTS = [
  { index: 'SKU-CCS2-250A', name: 'Przewód ładowania CCS2 250A 5m', source: 'MAGAZYN' },
  { index: 'SKU-FILTR-AXE', name: 'Komplet mat filtracyjnych Axon Easy', source: 'MAGAZYN' },
  { index: 'EEP-104920', name: 'Stycznik DC główny 500A', source: 'KATALOG' }
]

const parseGas = (res) => {
  if (typeof res === 'string') {
    try { return JSON.parse(res) } catch (_) { return { success: false, message: res } }
  }
  return res || { success: false, message: 'Pusta odpowiedź serwera' }
}

export const useReportsStore = defineStore('reports', () => {
  const technicians = ref([])
  const priceLists = ref({})
  const eurRate = ref(4.30)
  const partsCatalog = ref([])
  const today = ref(new Date().toISOString().split('T')[0])

  const isInitialized = ref(false)
  const isLoadingInit = ref(false)
  const isFetchingOrder = ref(false)
  const isGeneratingPreview = ref(false)
  const isCommitting = ref(false)
  const isSavingSettlement = ref(false)

  let inflightInit = null

  const isGasEnv = () => typeof google !== 'undefined' && google.script && google.script.run

  const runGas = (fnName, ...args) => {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler(res => resolve(parseGas(res)))
        .withFailureHandler(err => reject(err))
        [fnName](...args)
    })
  }

  const ensureInitialized = async () => {
    if (isInitialized.value) return
    if (inflightInit) return inflightInit

    isLoadingInit.value = true
    inflightInit = (async () => {
      try {
        if (isGasEnv()) {
          const res = await runGas('getReportGeneratorInitData')
          if (res && res.success) {
            technicians.value = res.technicians || []
            priceLists.value = res.priceLists || {}
            eurRate.value = Number(res.eurRate) || 4.30
            partsCatalog.value = res.partsCatalog || []
            if (res.today) today.value = res.today
            isInitialized.value = true
          }
        } else {
          technicians.value = ['Andrzej Kusoski', 'Bartosz Poprawski', 'Jakub Fugiel', 'Joanna Dankowska', 'Michał Stępień', 'Paweł Borowiecki']
          priceLists.value = DEFAULT_DEV_PRICELISTS
          partsCatalog.value = DEFAULT_DEV_PARTS
          isInitialized.value = true
        }
      } catch (e) {
        console.error('Błąd inicjalizacji danych generatora raportów:', e)
      } finally {
        isLoadingInit.value = false
        inflightInit = null
      }
    })()

    return inflightInit
  }

  const fetchOrderContext = async (queryPayload) => {
    isFetchingOrder.value = true
    try {
      if (isGasEnv()) {
        return await runGas('getReportOrderContext', queryPayload)
      }
      const q = typeof queryPayload === 'object' ? (queryPayload.query || queryPayload.ticketId) : queryPayload
      return {
        success: true,
        isEkoenOrder: String(q || '').toUpperCase().startsWith('EE_'),
        orderId: String(q || 'DEV-001'),
        ekoId: String(q || '').toUpperCase().startsWith('EE_') ? String(q) : '',
        qpNumber: 'QP-20536',
        client: 'EKOEN (DEV)',
        operator: 'EKOEN',
        location: 'Zielona Góra, ul. Rozwojowa 9',
        stationModel: 'Axon Easy 1.3',
        power: '150 kW',
        prodYear: '2024',
        connectors: '2x CCS Combo 2',
        description: 'Przykładowy opis usterki w trybie lokalnym DEV.',
        diagnosis: '',
        visitDate: today.value,
        visitType: 'Pierwsza wizyta',
        prefilledParts: [],
        settlementHistory: { found: false }
      }
    } catch (err) {
      return { success: false, message: err?.message || String(err) }
    } finally {
      isFetchingOrder.value = false
    }
  }

  const verifyTechPin = async (techName, pin) => {
    if (!isGasEnv()) {
      if (String(pin) === '1234') {
        return {
          success: true,
          hasSignature: true,
          uprE: 'E1/1234/24',
          uprD: 'D1/1234/24',
          certNumber: 'AIST-DEV-01'
        }
      }
      return { success: false, message: 'Tryb DEV: wpisz PIN 1234' }
    }
    return await runGas('verifyReportTechPin', techName, pin)
  }

  const previewReportPdf = async (formData) => {
    isGeneratingPreview.value = true
    try {
      if (!isGasEnv()) {
        return { success: false, isDevLocal: true, fileName: `DEV_${formData.docType || 'RAPORT'}.pdf` }
      }
      return await runGas('previewServiceReportPdf', formData)
    } catch (err) {
      return { success: false, message: err?.message || String(err) }
    } finally {
      isGeneratingPreview.value = false
    }
  }

  const commitReportPdf = async (formData) => {
    isCommitting.value = true
    try {
      if (!isGasEnv()) {
        return {
          success: true,
          visitNr: 1,
          fileName: `[RAPORT_1]_${formData.orderId || 'DEV'}.pdf`,
          pdfUrl: '#dev-pdf-saved',
          message: 'Tryb lokalny DEV — zasymulowano zapis raportu.'
        }
      }
      return await runGas('commitServiceReportPdf', formData)
    } catch (err) {
      return { success: false, message: err?.message || String(err) }
    } finally {
      isCommitting.value = false
    }
  }

  const saveReportSettlement = async (settlementPayload) => {
    isSavingSettlement.value = true
    try {
      if (!isGasEnv()) {
        return {
          success: true,
          visitLabel: 'I',
          ticket_status: settlementPayload.markAsFinalSettled ? 'Rozliczone' : 'Wstępnie rozliczone',
          billing_state: settlementPayload.markAsFinalSettled ? 'SETTLED' : 'PRE_SETTLED',
          message: 'Tryb lokalny DEV — zasymulowano zapis rozliczenia w sys_billings.'
        }
      }
      return await runGas('saveSettlementFromReportGenerator', settlementPayload)
    } catch (err) {
      return { success: false, message: err?.message || String(err) }
    } finally {
      isSavingSettlement.value = false
    }
  }

  return {
    technicians,
    priceLists,
    eurRate,
    partsCatalog,
    today,
    isInitialized,
    isLoadingInit,
    isFetchingOrder,
    isGeneratingPreview,
    isCommitting,
    isSavingSettlement,
    ensureInitialized,
    fetchOrderContext,
    verifyTechPin,
    previewReportPdf,
    commitReportPdf,
    saveReportSettlement
  }
})