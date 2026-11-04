import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    // 1. WYGLĄD I MOTYW
    theme: 'auto', // 'light', 'dark', 'auto'
    mainColor: '#58b347',
    colorEffect: 'none', // 'none', 'pulse', 'breathe', 'rgb'
    
    // 2. WIDOKI MODUŁÓW (Wybór między wersją A i B)
    warehouseViewMode: 'v1', // 'v1' lub 'v2'
    ticketsViewMode: 'v1',   // 'v1' lub 'v2'
    
    // 3. NAWIGACJA
    defaultPage: 'dashboard',
    sidebarOrder: ['dashboard', 'tickets', 'schedule', 'warehouse', 'billings', 'crm', 'settings'],
    
    // 4. POWIADOMIENIA I DŹWIĘKI
    soundEnabled: true,
    slaAlertsEnabled: true,
    
    // 5. BEZPIECZEŃSTWO
    autoLogoutMinutes: 30
  }),

  actions: {
    loadSettings() {
      try {
        const saved = localStorage.getItem('EKOEN_USER_SETTINGS')
        if (saved) {
          const parsed = JSON.parse(saved)
          Object.assign(this.$state, parsed) // Nadpisuje state zapisanymi danymi
        }
      } catch (e) {
        console.error('Błąd ładowania ustawień:', e)
      }
    },

    saveSettings() {
      try {
        localStorage.setItem('EKOEN_USER_SETTINGS', JSON.stringify(this.$state))
        // Tutaj w przyszłości można dodać wywołanie do backendu (Google Apps Script), 
        // aby zsynchronizować ustawienia z kontem w arkuszu sys_users
      } catch (e) {
        console.error('Błąd zapisu ustawień:', e)
      }
    }
  }
})