import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null) // Zalogowany użytkownik
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

  const login = async (email, password) => {
    isLoading.value = true
    error.value = ''
    
    try {
      // Wywołanie oryginalnego skryptu Google
      const result = await new Promise((resolve, reject) => {
        if (typeof google === 'undefined') {
          // Fallback dla trybu DEV na Localhost (poza ramką)
          setTimeout(() => {
            if (email === 'test' && password === 'test') {
              resolve({ success: true, username: 'test', role: 'ADMIN', panels: '*', settings: '{}' })
            } else {
              resolve({ success: false, message: 'Błąd lokalny. Wprowadź: test / test' })
            }
          }, 800)
          return
        }

        // Produkcja w Apps Script
        google.script.run
          .withSuccessHandler(res => resolve(res))
          .withFailureHandler(err => reject(err))
          .verifySystemLogin(email, password)
      })

      if (result.success) {
        // Zapis do stanu
        user.value = {
          username: result.username,
          role: result.role,
          panels: result.panels,
          settings: result.settings ? JSON.parse(result.settings) : {}
        }
        
        // Zapis do LocalStorage (żeby nie wylogowało po F5)
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

  return { user, isLoading, error, login, logout }
})