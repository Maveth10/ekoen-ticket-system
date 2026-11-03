import { ref, computed } from 'vue'
import { useScheduleStore } from '../stores/useScheduleStore'

export function useCalendar() {
  const store = useScheduleStore()

  const currentDate = ref(new Date())
  const calendarHours = Array.from({ length: 24 }, (_, i) => i)
  
  const currentNow = ref(new Date())
  setInterval(() => { currentNow.value = new Date() }, 60000)

  const currentTimeLineStyle = computed(() => {
    const hour = currentNow.value.getHours() + (currentNow.value.getMinutes() / 60)
    return `top: ${hour * 80}px;`
  })

  const getStartOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  
  const navigateCalendar = (dir) => {
    const d = new Date(currentDate.value)
    if (store.currentView === 'month') d.setMonth(d.getMonth() + dir)
    else if (store.currentView === 'week') d.setDate(d.getDate() + (dir * 7))
    else if (store.currentView === 'day') d.setDate(d.getDate() + dir)
    currentDate.value = d
  }
  const navigateToday = () => { currentDate.value = new Date() }

  const activeDaysArray = computed(() => {
    const days = []
    const d = getStartOfDay(currentDate.value)
    const todayStr = new Date().toISOString().split('T')[0]

    if (store.currentView === 'week') {
      const day = d.getDay() || 7
      d.setDate(d.getDate() - day + 1)
      for(let i=0; i<7; i++) {
        const nd = new Date(d)
        nd.setDate(d.getDate() + i)
        const iso = nd.toISOString().split('T')[0]
        days.push({ date: nd, YYYY_MM_DD: iso, dayName: ['Niedz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'][nd.getDay()], DD: String(nd.getDate()).padStart(2, '0'), isToday: iso === todayStr })
      }
    } else if (store.currentView === 'day') {
      const iso = d.toISOString().split('T')[0]
      days.push({ date: d, YYYY_MM_DD: iso, dayName: ['Niedz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'][d.getDay()], DD: String(d.getDate()).padStart(2, '0'), isToday: iso === todayStr })
    }
    return days
  })

  const activeMonthArray = computed(() => {
    if(store.currentView !== 'month') return []
    const d = getStartOfDay(currentDate.value)
    d.setDate(1)
    const firstDay = d.getDay() || 7
    const startDate = new Date(d)
    startDate.setDate(startDate.getDate() - firstDay + 1)
    const days = []
    const todayStr = new Date().toISOString().split('T')[0]
    for(let i=0; i<35; i++) {
      const nd = new Date(startDate)
      nd.setDate(startDate.getDate() + i)
      const iso = nd.toISOString().split('T')[0]
      days.push({ date: nd, YYYY_MM_DD: iso, isCurrentMonth: nd.getMonth() === currentDate.value.getMonth(), DD: nd.getDate(), isToday: iso === todayStr })
    }
    return days
  })

  const calendarTitleDisplay = computed(() => {
    const d = currentDate.value
    const months = ['STYCZEŃ', 'LUTY', 'MARZEC', 'KWIECIEŃ', 'MAJ', 'CZERWIEC', 'LIPIEC', 'SIERPIEŃ', 'WRZESIEŃ', 'PAŹDZIERNIK', 'LISTOPAD', 'GRUDZIEŃ']
    
    // Niezależnie od wybranego widoku, pokazujemy tylko aktualny miesiąc i rok, 
    // ponieważ szczegółowe dni widać bezpośrednio w siatce poniżej.
    return `${months[d.getMonth()]} ${d.getFullYear()}`
  })

  const eventsByDate = computed(() => {
    const dict = {}
    
    // NOWE PANCERNE FILTROWANIE DLA AKTUALNIE WYBRANEGO TECHNIKA Z MENU
    const filteredEvents = store.events.filter(ev => {
      if (store.selectedTechId !== "ALL") {
         const tObj = store.techList.find(t => t.id === store.selectedTechId);
         const tName = tObj ? tObj.name : store.selectedTechId;
         const isSameTech = (ev.technician_id === store.selectedTechId || ev.technician_id === tName || (ev.extendedProps && ev.extendedProps.technicianName === tName));
         if (!isSameTech) return false;
      }
      return ev.start_time;
    })

    filteredEvents.forEach(ev => {
      // NOWE: Odporność na brak litery 'T' w zapisanej z bazy dacie
      const dateStr = ev.start_time.includes('T') ? ev.start_time.split('T')[0] : ev.start_time.split(' ')[0]
      if (!dict[dateStr]) dict[dateStr] = []
      
      const ticket = store.tickets.find(t => String(t.t_id) === String(ev.ticket_id) || String(t.t_code) === String(ev.ticket_id))
      // ZMIANA: Szukamy podwójnie - po ID lub Imieniu (dla kompatybilności ze starymi wpisami)
      const tech = store.techList.find(t => String(t.id) === String(ev.technician_id) || String(t.name) === String(ev.technician_id))
      
      dict[dateStr].push({ 
        ...ev, 
        extendedProps: { 
          technicianName: tech ? tech.name : 'Brak', 
          techColor: tech ? (tech.zone_color || tech.color) : '#cbd5e1',
          ticketCode: ticket ? ticket.t_code : '',
          qpCode: ticket ? ticket.t_qp : '',
          t_status: ticket ? ticket.t_status : '',
          category: ticket ? (ticket.t_category || ticket.t_type) : '',
          // Nowe pola z naszej modyfikacji
          description: ev.description || (ticket ? ticket.t_desc : ''),
          event_type: ev.event_type || 'service',
          event_subtype: ev.event_subtype || '',
          all_day: ev.all_day === 'TAK' || ev.all_day === true
        }
      })
    })

    Object.keys(dict).forEach(date => {
      const dayEvents = dict[date].sort((a, b) => {
        const timeDiff = new Date(a.start_time) - new Date(b.start_time)
        if (timeDiff !== 0) return timeDiff
        return a.extendedProps.technicianName.localeCompare(b.extendedProps.technicianName)
      })

      if (store.currentView === 'month') {
        dayEvents.forEach(ev => {
          ev.computedStyle = { borderLeft: `6px solid ${ev.extendedProps.techColor}` }
        })
     } else { 
        const uniqueTechs = [...new Set(dayEvents.map(e => e.extendedProps.technicianName))].sort()

        dayEvents.forEach(ev => {
         // --- OMIJAMY URLOPY W GŁÓWNYM WIDOKU GODZINOWYM (rysujemy je jako tła) ---
         if (ev.extendedProps.event_type === 'absence') {
            ev.computedStyle = { display: 'none' };
            return;
         }
          const start = new Date(ev.start_time)
          const end = ev.end_time ? new Date(ev.end_time) : new Date(start.getTime() + 2 * 3600000)
          
          const startHour = start.getHours() + (start.getMinutes() / 60)
          let endHour = end.getHours() + (end.getMinutes() / 60)
          if(endHour <= startHour) endHour = startHour + 0.5
          
          const top = startHour * 80
          const height = Math.max(40, (endHour - startHour) * 80)
          
          const techIndex = uniqueTechs.indexOf(ev.extendedProps.technicianName)
          const offset = techIndex * 24 
          
          // Dzień jest węższy (85%), Tydzień zabiera wszystko, co może (100%) bo i tak kolumny są wąskie
          const isDayView = store.currentView === 'day'
          const width = isDayView ? `calc(85% - ${offset + 8}px)` : `calc(100% - ${offset + 8}px)`
          const left = `${offset + 4}px`

          const isAbsence = ev.extendedProps.event_type === 'absence'
          const isTask = ev.extendedProps.event_type === 'task'
          
          ev.computedStyle = { 
            top: `${top}px`, 
            height: `${height}px`, 
            width: width, 
            left: left, 
            borderLeft: isAbsence ? `6px solid #ef4444` : (isTask ? `6px solid #58b347` : `6px solid ${ev.extendedProps.techColor}`), 
            zIndex: (isAbsence ? 0 : 10) + techIndex,
            // DODAJ TĘ LINIJKĘ:
            backgroundColor: isAbsence ? 'transparent' : '#ffffff' 
          }
        })
      }
    })
    return dict
  })
          // --- NOWE: GENERATOR TEŁ DLA WIELODNIOWYCH NIEOBECNOŚCI ---
  const absencesByDate = computed(() => {
    const dict = {};
    const absences = store.events.filter(ev => (ev.extendedProps ? ev.extendedProps.event_type : ev.event_type) === 'absence');

    absences.forEach(ev => {
      // Filtr technika
      if (store.selectedTechId !== "ALL") {
        const tObj = store.techList.find(t => t.id === store.selectedTechId);
        const tName = tObj ? tObj.name : store.selectedTechId;
        const isSameTech = (ev.technician_id === store.selectedTechId || ev.technician_id === tName || (ev.extendedProps && ev.extendedProps.technicianName === tName));
        if (!isSameTech) return;
      }
      if (!ev.start_time) return;

      const startStr = String(ev.start_time).includes('T') ? String(ev.start_time).split('T')[0] : String(ev.start_time).split(' ')[0];
      const endStr = ev.end_time ? (String(ev.end_time).includes('T') ? String(ev.end_time).split('T')[0] : String(ev.end_time).split(' ')[0]) : startStr;

      // Zabezpieczenie przed strefami czasowymi (używamy południa UTC)
      let current = new Date(`${startStr}T12:00:00Z`);
      const endObj = new Date(`${endStr}T12:00:00Z`);
      
      // ZABEZPIECZENIE przed pustym technician_id
      const evTechId = ev.technician_id || (ev.extendedProps ? ev.extendedProps.technicianName : '');
      const tech = store.techList.find(t => String(t.id) === String(evTechId) || String(t.name) === String(evTechId));
      
      // Pętla wypełniająca każdy dzień trwania urlopu (z limitem maksymalnym dla bezpieczeństwa wylogowania przeglądarki)
      let safetyCount = 0;
      while(current <= endObj && safetyCount < 365) {
        const dStr = current.toISOString().split('T')[0];
        if (!dict[dStr]) dict[dStr] = [];
        
        dict[dStr].push({ 
          ...ev, 
          extendedProps: { 
            ...(ev.extendedProps || {}),
            technicianName: tech ? tech.name : (ev.technician_id || 'Brak'), 
            techColor: tech ? (tech.zone_color || tech.color) : '#cbd5e1',
            event_type: 'absence',
            event_subtype: ev.event_subtype || (ev.extendedProps && ev.extendedProps.event_subtype) || 'Urlop'
          }
        });
        current.setDate(current.getDate() + 1); // Skok o 1 dzień
      }
    });
    return dict;
  });

  const formatISO = (date) => {
    const pad = n => String(n).padStart(2,'0')
    const tzo = -date.getTimezoneOffset()
    const dif = tzo >= 0 ? '+' : '-'
    const offStr = `${dif}${pad(Math.floor(Math.abs(tzo)/60))}:${pad(Math.abs(tzo)%60)}`
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00${offStr}`
  }

  const checkOverlap = (techId, startStr, endStr, excludeEventId = null) => {
    if(!techId) return false
    // Zabezpieczenie na puste spacje zamiast 'T' w dacie przychodzącej
    const start = new Date(startStr.replace(' ', 'T')).getTime()
    const end = new Date(endStr.replace(' ', 'T')).getTime()
    
    const techObj = store.techList.find(t => t.id === techId || t.name === techId)
    const finalTechId = techObj ? techObj.id : techId
    const techName = techObj ? techObj.name : techId

    return store.events.some(ev => {
      // IGNORUJEMY URLOPY PRZY SPRAWDZANIU KOLIZJI FIZYCZNYCH
      const isAbsence = ev.event_type === 'absence' || (ev.extendedProps && ev.extendedProps.event_type === 'absence');
      if (isAbsence) return false;

      const isSameTech = (ev.technician_id === finalTechId || ev.technician_id === techName || (ev.extendedProps && ev.extendedProps.technicianName === techName));
      if(ev.id === excludeEventId || !isSameTech || !ev.start_time || !ev.end_time) return false
      
      let evStart = new Date(String(ev.start_time).replace(' ', 'T')).getTime()
      let evEnd = new Date(ev.end_time.replace(' ', 'T')).getTime()
      return (start < evEnd && end > evStart)
    })
  }

  const findNextAvailableSlot = (techId, baseDateStr, excludeEventId = null, startHourFrom = 7, durationHours = 2) => {
    let startHour = Math.floor(startHourFrom * 2) / 2
    while (startHour + durationHours <= 24) {
      const h = Math.floor(startHour)
      const m = startHour % 1 === 0.5 ? 30 : 0
      const pad = n => String(n).padStart(2,'0')
      const sObj = new Date(`${baseDateStr}T${pad(h)}:${pad(m)}:00`)
      const eObj = new Date(sObj.getTime() + durationHours * 3600000)
      
      let sTime = formatISO(sObj)
      let eTime = formatISO(eObj)
      
      if (!checkOverlap(techId, sTime, eTime, excludeEventId)) return { start: sTime, end: eTime }
      startHour += 0.5
    }
    const sDef = new Date(`${baseDateStr}T20:00:00`)
    const eDef = new Date(sDef.getTime() + durationHours * 3600000)
    return { start: formatISO(sDef), end: formatISO(eDef) }
  }

  const resizeData = { evId: null, startY: 0, startDurationMs: 0, snapshot: [], modifiedEvents: new Set() }

  const startResize = (e, ev) => {
    e.preventDefault(); e.stopPropagation()
    const startMs = new Date(ev.start_time).getTime()
    const endMs = ev.end_time ? new Date(ev.end_time).getTime() : startMs + 2 * 3600000

    resizeData.evId = ev.id
    resizeData.startY = e.clientY
    resizeData.startDurationMs = endMs - startMs
    resizeData.modifiedEvents = new Set([ev.id])

    const dateStr = String(ev.start_time).includes('T') ? String(ev.start_time).split('T')[0] : String(ev.start_time).split(' ')[0];
    
    const techEvents = store.events.filter(x => {
      // Ignoruj urlopy i L4 - nie przepychaj ich w dół podczas rozciągania!
      const isAbsence = x.event_type === 'absence' || (x.extendedProps && x.extendedProps.event_type === 'absence');
      if (isAbsence) return false;
      
      const techMatch = x.technician_id === ev.technician_id || (x.extendedProps && ev.extendedProps && x.extendedProps.technicianName === ev.extendedProps.technicianName);
      const xDateStr = String(x.start_time).includes('T') ? String(x.start_time).split('T')[0] : String(x.start_time).split(' ')[0];
      
      return techMatch && xDateStr === dateStr;
    })

    resizeData.snapshot = techEvents.map(x => ({
      id: x.id,
      startMs: new Date(x.start_time).getTime(),
      endMs: x.end_time ? new Date(x.end_time).getTime() : new Date(x.start_time).getTime() + 2 * 3600000
    })).sort((a, b) => a.startMs - b.startMs)

    window.addEventListener('mousemove', handleResizeMove)
    window.addEventListener('mouseup', handleResizeUp)
  }

  const handleResizeMove = (e) => {
    if (!resizeData.evId) return
    const deltaY = e.clientY - resizeData.startY
    let newDurationMs = resizeData.startDurationMs + (deltaY / 80) * 3600000

    newDurationMs = Math.round(newDurationMs / 1800000) * 1800000
    if (newDurationMs < 1800000) newDurationMs = 1800000
    if (newDurationMs > 86400000) newDurationMs = 86400000

    const eventsCopy = [...store.events]
    const evIndex = eventsCopy.findIndex(x => x.id === resizeData.evId)

    if (evIndex !== -1) {
      const evToResize = { ...eventsCopy[evIndex] }
      const startMs = new Date(evToResize.start_time).getTime()
      const newEndMs = startMs + newDurationMs

      evToResize.end_time = formatISO(new Date(newEndMs))
      eventsCopy[evIndex] = evToResize

      let currentEndTime = newEndMs

      for (let snap of resizeData.snapshot) {
        if (snap.id === resizeData.evId) continue
        if (snap.startMs >= startMs) {
          const targetIdx = eventsCopy.findIndex(x => x.id === snap.id)
          if (targetIdx === -1) continue

          const targetEv = { ...eventsCopy[targetIdx] }
          const duration = snap.endMs - snap.startMs

          if (snap.startMs < currentEndTime) {
            targetEv.start_time = formatISO(new Date(currentEndTime))
            targetEv.end_time = formatISO(new Date(currentEndTime + duration))
            resizeData.modifiedEvents.add(snap.id)
            currentEndTime = currentEndTime + duration
          } else {
            targetEv.start_time = formatISO(new Date(snap.startMs))
            targetEv.end_time = formatISO(new Date(snap.endMs))
            currentEndTime = snap.endMs
          }
          eventsCopy[targetIdx] = targetEv
        }
      }
      store.events = eventsCopy
    }
  }

  const handleResizeUp = () => {
    window.removeEventListener('mousemove', handleResizeMove)
    window.removeEventListener('mouseup', handleResizeUp)
    if (resizeData.evId) {
      resizeData.modifiedEvents.forEach(id => {
        const ev = store.events.find(x => x.id === id)
        if (ev) store.saveEventToCloud(ev)
      })
      resizeData.evId = null
      resizeData.modifiedEvents.clear()
    }
  }

  // --- LOGIKA KLIKNIĘCIA PUSTEGO SLOTU W KALENDARZU ---
  const handleEmptySlotClick = (dateStr, hour) => {
    const defaultTech = store.selectedTechId !== 'ALL' ? store.selectedTechId : null;
    let targetTime = `${dateStr}T10:00:00`;

    if (hour !== undefined) {
      const pad = n => String(n).padStart(2, '0');
      const h = Math.floor(hour);
      const m = hour % 1 === 0.5 ? 30 : 0;
      targetTime = `${dateStr}T${pad(h)}:${pad(m)}:00`;
    }

    // Zamieniamy naszą wyliczoną datę z powrotem na poprawny ISO string uwzględniający strefę
    return { 
      startDate: formatISO(new Date(targetTime)), 
      techId: defaultTech 
    };
  }

  return {
    currentDate, calendarHours, currentTimeLineStyle,
    activeDaysArray, activeMonthArray, calendarTitleDisplay,
    eventsByDate, absencesByDate,
    navigateCalendar, navigateToday, formatISO, checkOverlap, findNextAvailableSlot,
    startResize, handleEmptySlotClick // <--- WYEKSPORTOWANO
  }
}