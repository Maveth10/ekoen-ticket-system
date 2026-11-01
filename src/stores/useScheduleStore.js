import { defineStore } from 'pinia'

const ICON_USER = "PHN2ZyBjbGFzcz0idy02IGgtNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTE5IDIxdi0yYTQgNCAwIDAgMC00LTRIOWE0IDQgMCAwIDAtNCA0djIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48L3N2Zz4="

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    tickets: [],
    events: [],
    techList: [],
    stations: [],
    
    currentView: 'week',
    activeTabs: ['ALL'],
    selectedTechId: 'ALL',
    
    kpiTabs: [],
    searchQueriesMain: [{ id: 'm_' + Date.now(), logic: 'AND', text: '' }],
    isLoading: false,
    
    usersMap: {}
  }),
  actions: {
    getDefaultTabs() {
      return [
        { id: 'ALL', name: 'WSZYSTKIE', filter: 'ALL', color: '#58b347', icon: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', customQueries: [] },
        { id: 'GROUP_TECHS', name: 'TECHNICY', filter: 'GROUP', color: '#0ea5e9', icon: '', customQueries: [] },
        { id: 'URGENT', name: 'PILNE SLA (< 24H)', filter: 'URGENT', color: '#ef4444', icon: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>', customQueries: [] },
        { id: 'TODAY', name: 'ZAPLANOWANE DZIŚ', filter: 'TODAY', color: '#3b82f6', icon: '<svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>', customQueries: [] }
      ]
    },
    loadTabsConfiguration() {
      try {
        const localStore = JSON.parse(localStorage.getItem('EKOEN_SCHEDULE_UI')) || {}
        let savedTabs = localStore.tabs || []
        
        if (savedTabs.length > 0) {
          const defaults = this.getDefaultTabs()
          savedTabs = savedTabs.map(tab => {
            const defaultEquivalent = defaults.find(d => d.id === tab.id)
            if (defaultEquivalent && (defaultEquivalent.filter === 'SYSTEM' || defaultEquivalent.filter === 'ALL' || defaultEquivalent.filter === 'URGENT' || defaultEquivalent.filter === 'TODAY' || defaultEquivalent.filter === 'GROUP')) {
              tab.filter = defaultEquivalent.filter
            }
            return tab
          })
          defaults.forEach(dTab => {
            if (!savedTabs.find(sTab => sTab.id === dTab.id)) savedTabs.push(dTab)
          })
          this.kpiTabs = savedTabs
        } else {
          this.kpiTabs = this.getDefaultTabs()
        }
      } catch (e) {
        this.kpiTabs = this.getDefaultTabs()
      }
    },
    saveTabsConfiguration() {
      try {
        const localStore = JSON.parse(localStorage.getItem('EKOEN_SCHEDULE_UI')) || {}
        localStore.tabs = this.kpiTabs
        localStorage.setItem('EKOEN_SCHEDULE_UI', JSON.stringify(localStore))
      } catch (e) {}
    },
    setupTechTabs() {
      if (!this.techList || this.techList.length === 0) return
      
      let validTechIds = this.techList.map(tech => 'TECH_' + String(tech.id || tech.name).toUpperCase().replace(/[^A-Z0-9]/g, '_'))
      
      this.kpiTabs = this.kpiTabs.filter(t => !t.id.startsWith('TECH_') || validTechIds.includes(t.id))
      
      if (!this.kpiTabs.find(t => t.id === 'GROUP_TECHS')) {
        this.kpiTabs.splice(1, 0, { id: 'GROUP_TECHS', name: 'TECHNICY', filter: 'GROUP', color: '#0ea5e9', icon: '', customQueries: [] })
      }

      this.techList.forEach(tech => {
        if (!tech) return
        let safeId = 'TECH_' + String(tech.id || tech.name).toUpperCase().replace(/[^A-Z0-9]/g, '_')
        let techColor = tech.zone_color || tech.color || '#0ea5e9'
        let techName = tech.name || tech.id || 'NN'
        
        let exists = this.kpiTabs.find(t => t.id === safeId)
        if (!exists) {
          this.kpiTabs.push({
            id: safeId, 
            name: techName.toUpperCase(), 
            filter: 'SYSTEM', 
            color: techColor, 
            icon: ICON_USER,
            customQueries: [{ id: 'tq_tech_' + Date.now(), logic: 'AND', text: 'TECH_EXACT:' + techName }],
            isHidden: true 
          })
        } else {
          exists.color = techColor
          exists.icon = ICON_USER
        }
      })
      this.saveTabsConfiguration()
    },
    extractTicketData(t) {
      if (!t) return null
      try {
        let t_id='', t_code='', t_qp_full='', t_title='', t_desc='', t_type='', t_status='', t_created='', t_techRaw='', t_category='', t_client=''
        let t_city = '', t_street = '', t_post = ''
        let status_g = '', status_v = ''
        
        if (Array.isArray(t)) {
          t_id = String(t[0] || '').trim(); if(!t_id || t_id.toLowerCase() === 'id') return null; 
          t_code = String(t[0] || '').trim(); t_qp_full = String(t[1] || '').trim(); t_title = String(t[2] || 'Brak tytułu'); t_type = String(t[4] || 'Zgłoszenie'); t_category = String(t[5] || ''); status_g = String(t[6] || '').trim(); 
          t_street = String(t[13] || '').trim(); t_post = String(t[14] || '').trim(); t_city = String(t[15] || '').trim(); 
          status_v = String(t[21] || '').trim(); 
          t_desc = String(t[8] || ''); t_techRaw = String(t[12] || '').trim(); t_created = String(t[16] || new Date().toISOString()); 
        } else {
          t_id = String(t.id || t.ID || t.ticket_id || '').trim(); if(!t_id || t_id.toLowerCase() === 'id') return null;
          t_code = String(t.ticket_number || t.ticket_code || t.id || '')
          t_qp_full = String(t.station_id || t['Numer QP'] || t.qp_id || t.QP || '').trim()
          t_title = String(t.subject || t['Tytuł'] || t.title || 'Brak tytułu')
          t_desc = String(t.description || t['Opis'] || '')
          t_category = String(t.priority || t['Kategoria'] || t.category || '')
          status_g = String(t.status || t.Status || t['Status'] || '').trim()
          status_v = String(t.ticket_status || t['Status Zlecenia'] || t.status_zlecenia || '').trim()
          t_street = String(t.street || t['Adres'] || t.address || t.Ulica || '').trim()
          t_post = String(t.zip || t['Kod pocztowy'] || t.postcode || t.Kod || '').trim()
          t_city = String(t.city || t['Miasto'] || '').trim()
          t_type = String(t.ticket_type || t['Typ serwisu'] || 'Zgłoszenie')
          t_created = String(t.created_at || t['Utworzono'] || new Date().toISOString())
          t_techRaw = String(t.technician_id || t['Przypisany technik'] || t.Technician || t.technician || '').trim()
          t_client = (t.client || t['Klient'] || '')
        }
        
        if(!t_code) t_code = t_id
        const st_check = (status_g + ' ' + status_v).toLowerCase()
        let t_is_closed = false
        if (st_check.includes('ticket_closed') || st_check.includes('cancelled') || st_check.includes('zakończ') || st_check.includes('anulow') || st_check.includes('closed') || st_check.includes('zamknięt') || st_check.includes('wykonano') || st_check.includes('rozliczone')) {
          t_is_closed = true
        }
        let final_status = status_v
        if (!final_status || final_status.toLowerCase() === 'undefined' || final_status.toLowerCase() === 'null') final_status = status_g
        if (!final_status || final_status.toLowerCase() === 'undefined' || final_status.toLowerCase() === 'null') final_status = ''
        t_status = final_status ? final_status : 'BRAK STATUSU ZLECENIA'

        const dashIdx = t_qp_full.indexOf('-', t_qp_full.indexOf('-') + 1)
        const t_qp = dashIdx !== -1 ? t_qp_full.substring(0, dashIdx) : t_qp_full
        if (t_city.toLowerCase() === 'undefined' || t_city.toLowerCase() === 'null') t_city = ''
        if (t_street.toLowerCase() === 'undefined' || t_street.toLowerCase() === 'null') t_street = ''
        if (t_post.toLowerCase() === 'undefined' || t_post.toLowerCase() === 'null') t_post = ''
        
        let addrParts = []
        if (t_city) addrParts.push(t_city); if (t_street) addrParts.push(t_street); if (t_post) addrParts.push(t_post)
        let finalAddressString = addrParts.length > 0 ? addrParts.join(', ') : 'Brak lokalizacji'
        
        const tech = this.techList.find(techObj => techObj.id === t_techRaw || techObj.name === t_techRaw)
        const actualTechId = tech ? tech.id : ''
        const techColor = tech ? (tech.zone_color || tech.color) : '#cbd5e1'
        const techName = tech ? tech.name : (t_techRaw || 'BRAK PRZYPISANIA')

        let parsedDate = new Date(t_created)
        if(isNaN(parsedDate.getTime())) parsedDate = new Date() 
        const slaLeft = Math.round(((parsedDate.getTime() + (48 * 3600000)) - Date.now()) / 3600000)
        
        return { 
          t_id, t_code, t_qp, t_title, t_desc, t_address: finalAddressString, 
          t_client, t_category, t_type, t_status, t_created, 
          actualTechId, techColor, techName, slaLeft, t_is_closed,
          
          ticket_code: t_code,
          ticket_number: t_code,
          id: t_id,
          status: status_g,
          ticket_status: status_v,
          req_status: '', 
          technician_id: t_techRaw
        }
      } catch (err) { return null }
    },
    async fetchScheduleData() {
      this.loadTabsConfiguration()
      
      // 1. SZYBKIE ŁADOWANIE Z CACHE
      const cachedData = localStorage.getItem('CACHE_SCHEDULE_DATA')
      if (cachedData) {
        try {
          const parsedCache = JSON.parse(cachedData)
          this.events = parsedCache.events || []
          this.techList = parsedCache.techList || []
          this.tickets = parsedCache.tickets || []
          if (this.events.length > 0 || this.tickets.length > 0) {
             this.setupTechTabs()
             this.isLoading = false
          }
        } catch(e) {}
      } else {
        this.isLoading = true
      }

      if (typeof google === 'undefined') {
        setTimeout(() => { this.isLoading = false }, 500)
        return
      }

      // 2. DOCIĄGANIE W TLE (Poprawiono nazwę funkcji wywoływanej na backendzie)
      google.script.run
        .withSuccessHandler((response) => {
          try {
            const res = typeof response === 'string' ? JSON.parse(response) : response
            if (res && res.success !== false) {
              
              this.events = Array.isArray(res.events) ? res.events.map(ev => {
                if (Array.isArray(ev)) {
                   if(String(ev[0]||'').toLowerCase() === 'id') return null
                   return { id: String(ev[0]||''), ticket_id: String(ev[1]||''), technician_id: String(ev[2]||''), title: String(ev[3]||''), start_time: String(ev[4]||''), end_time: String(ev[5]||''), event_type: String(ev[6]||''), created_at: String(ev[7]||'') }
                } else {
                   if(String(ev.id||'').toLowerCase() === 'id') return null
                   return { id: String(ev.id||ev.ID||''), ticket_id: String(ev.ticket_id||''), technician_id: String(ev.technician_id||''), title: String(ev.title||''), start_time: String(ev.start_time||''), end_time: String(ev.end_time||''), event_type: String(ev.event_type||''), created_at: String(ev.created_at||'') }
                }
              }).filter(Boolean) : []

              this.techList = Array.isArray(res.technicians) ? res.technicians : []
              this.setupTechTabs()
              
              const rawTickets = Array.isArray(res.tickets) ? res.tickets : []
              this.tickets = rawTickets.map(this.extractTicketData).filter(Boolean)
              
              this.usersMap = {}
              this.techList.forEach(t => {
                if (t.name) this.usersMap[t.name.toUpperCase()] = t
              })

              // Aktualizacja Cache'u
              localStorage.setItem('CACHE_SCHEDULE_DATA', JSON.stringify({
                 events: this.events,
                 techList: this.techList,
                 tickets: this.tickets
              }))
            }
          } catch(e) {}
          this.isLoading = false
        })
        .withFailureHandler(() => {
          this.isLoading = false
        })
        .getScheduleData() // <--- TUTAJ BYŁ BŁĄD. Zmienione z getScheduleDataForFrontend
    },
    saveEventToCloud(evData) {
      if(typeof google === 'undefined') return
      
      const payload = {
        id: evData.id,
        ticket_id: evData.ticket_id,
        tech_id: evData.tech_id || evData.techName, 
        start_time: evData.start_time,
        end_time: evData.end_time || evData.start_time,
        notes: evData.notes || '',
        status: evData.status || 'PLANNED',
        is_all_day: evData.is_all_day || false,
        created_by: window.CURRENT_USERNAME || ''
      }
      
      google.script.run
        .withSuccessHandler((savedId) => {
          if(String(evData.id).includes('temp_')) {
            const idx = this.events.findIndex(x => x.id === evData.id)
            if(idx > -1) this.events[idx].id = savedId
          }
        })
        .saveCalendarEvent(payload) // Backend API method name handling for events
    },
    deleteEventFromCloud(eventId) {
      this.events = this.events.filter(e => String(e.id) !== String(eventId))
      if (typeof google !== 'undefined' && google.script) {
        google.script.run.deleteCalendarEvent(eventId) // Backend API method name
      }
    }
  }
})