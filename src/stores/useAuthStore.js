import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref('')

  // Przywracanie sesji z LocalStorage po odświeżeniu
  const savedSession = localStorage.getItem('ekoen_user_session')
  if (savedSession) {
    try {
      user.value = JSON.parse(savedSession)
    } catch (e) {
      localStorage.removeItem('ekoen_user_session')
    }
  }

  const userRole = computed(() => String(user.value?.role || '').trim().toUpperCase())

  const allowedPanelsList = computed(() => {
    const raw = String(user.value?.panels || '').trim()
    if (!raw) return []
    if (raw === '*') return ['*']
    return raw.split(',').map(p => p.trim().toLowerCase()).filter(Boolean)
  })

  const hasPanelAccess = (panelKey) => {
    if (!user.value) return false
    if (userRole.value === 'ADMIN') return true
    const list = allowedPanelsList.value
    if (list.includes('*')) return true
    return list.includes(String(panelKey || '').trim().toLowerCase())
  }

  // Uprawnienia modułu Ofertowania (CPQ) uzależnione od roli i przypisanych paneli
  const offerPermissions = computed(() => {
    const role = userRole.value
    const isAdmin = role === 'ADMIN'
    const isOfferEditorRole = ['ADMIN', 'MANAGER', 'DISPATCHER'].includes(role)
    const isInternalStaff = [
      'ADMIN', 'MANAGER', 'DISPATCHER', 'TECHNICIAN',
      'HOTLINE', 'AUDITOR', 'SUBCONTRACTOR', 'EMPLOYEE'
    ].includes(role)

    const hasOffersPanel = isAdmin || hasPanelAccess('offers')
    const canManage = isAdmin || (isOfferEditorRole && hasOffersPanel)

    return {
      // Widoczność całego panelu Ofert w menu bocznym
      canViewPanel: isAdmin || (hasOffersPanel && ['MANAGER', 'DISPATCHER', 'HOTLINE', 'AUDITOR'].includes(role)),
      // Tworzenie nowych ofert, edycja kwot, pozycji i warunków
      canCreate: canManage,
      canEdit: canManage,
      // Podgląd i generowanie oficjalnego PDF na Dysku Google
      canGeneratePdf: canManage,
      // Zmiana statusu fakturowania, FV zbiorcze, archiwizacja
      canManageBilling: canManage,
      // Dodawanie/edycja pozycji w sys_offer_catalog
      canEditCatalog: isAdmin || ['MANAGER', 'DISPATCHER'].includes(role),
      // Przycisk "Poproś o ofertę" w Zgłoszeniach (dla techników i biura)
      canRequestFromTicket: isInternalStaff
    }
  })

  const login = async (email, password) => {
    isLoading.value = true
    error.value = ''

    try {
      const result = await new Promise((resolve, reject) => {
        if (typeof google === 'undefined') {
          setTimeout(() => {
            if (email === 'test' && password === 'test') {
              resolve({ success: true, username: 'test', role: 'ADMIN', panels: '*', settings: '{}' })
            } else {
              resolve({ success: false, message: 'Błąd lokalny. Wprowadź: test / test' })
            }
          }, 800)
          return
        }

        google.script.run
          .withSuccessHandler(res => resolve(res))
          .withFailureHandler(err => reject(err))
          .verifySystemLogin(email, password)
      })

      if (result.success) {
        user.value = {
          username: result.username,
          role: result.role,
          panels: result.panels,
          settings: result.settings ? JSON.parse(result.settings) : {}
        }

        localStorage.setItem('ekoen_user_session', JSON.stringify(user.value))
        isLoading.value = false
        return true
      } else {
        error.value = result.message || 'Nieprawidłowe dane logowania.'
        isLoading.value = false
        return false
      }
    } catch (err) {
      error.value = 'Błąd połączenia z serwerem: ' + err.toString()
      isLoading.value = false
      return false
    }
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('ekoen_user_session')
  }

  return {
    user,
    isLoading,
    error,
    userRole,
    allowedPanelsList,
    hasPanelAccess,
    offerPermissions,
    login,
    logout
  }
})