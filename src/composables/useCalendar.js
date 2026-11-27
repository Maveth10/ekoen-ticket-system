import { ref, computed, onUnmounted } from 'vue'
import { useScheduleStore } from '../stores/useScheduleStore'

// Globalny stan alternatywnego wyglądu Harmonogramu (sterowany z Opcji)
const SCHEDULE_LAYOUT_KEY = 'ekoen_schedule_layout_mode'
const scheduleLayoutMode = ref(localStorage.getItem(SCHEDULE_LAYOUT_KEY) || 'standard')

export function useScheduleLayout() {
  const setScheduleLayoutMode = (mode) => {
    const normalized = mode === 'matrix' ? 'matrix' : 'standard'
    scheduleLayoutMode.value = normalized
    try {
      localStorage.setItem(SCHEDULE_LAYOUT_KEY, normalized)
    } catch (_) {}
  }

  const isMatrixLayout = computed({
    get: () => scheduleLayoutMode.value === 'matrix',
    set: (val) => setScheduleLayoutMode(val ? 'matrix' : 'standard')
  })

  return {
    scheduleLayoutMode,
    isMatrixLayout,
    setScheduleLayoutMode
  }
}

export function useCalendar() {
  const store = useScheduleStore()
  const { isMatrixLayout } = useScheduleLayout()

  const GRID_START_HOUR = 6
  const currentDate = ref(new Date())
  const calendarHours = Array.from({ length: 24 - GRID_START_HOUR }, (_, i) => i + GRID_START_HOUR)

  const currentNow = ref(new Date())
  const nowTimer = setInterval(() => { currentNow.value = new Date() }, 60000)
  onUnmounted(() => clearInterval(nowTimer))

  const pad2 = (n) => String(n).padStart(2, '0')

  const toLocalYMD = (d) => {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
  }

  const parseSafeEventDate = (raw) => {
    if (!raw) return null
    const str = String(raw).trim().replace(/^(\d{4}-\d{2}-\d{2})\s+/, '$1T')
    const d = new Date(str)
    return isNaN(d.getTime()) ? null : d
  }

  const currentTimeLineStyle = computed(() => {
    const hour = currentNow.value.getHours() + (currentNow.value.getMinutes() / 60)
    if (hour < GRID_START_HOUR) return 'display: none;'
    return `top: ${(hour - GRID_START_HOUR) * 120}px;`
  })

  const getStartOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

  const navigateCalendar = (dir) => {
    const d = new Date(currentDate.value)
    if (isMatrixLayout.value) d.setDate(d.getDate() + (dir * 7))
    else if (store.currentView === 'month') d.setMonth(d.getMonth() + dir)
    else if (store.currentView === 'week') d.setDate(d.getDate() + (dir * 7))
    else if (store.currentView === 'day') d.setDate(d.getDate() + dir)
    currentDate.value = d
  }

  const navigateToday = () => { currentDate.value = new Date() }

  const SHORT_DAYS = ['Niedz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob']
  const FULL_DAYS = ['NIEDZIELA', 'PONIEDZIAŁEK', 'WTOREK', 'ŚRODA', 'CZWARTEK', 'PIĄTEK', 'SOBOTA']

  const activeDaysArray = computed(() => {
    const days = []
    const d = getStartOfDay(currentDate.value)
    const todayStr = toLocalYMD(new Date())

    if (isMatrixLayout.value || store.currentView === 'week') {
      const day = d.getDay() || 7
      d.setDate(d.getDate() - day + 1)
      for (let i = 0; i < 7; i++) {
        const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i)
        const iso = toLocalYMD(nd)
        days.push({
          date: nd,
          YYYY_MM_DD: iso,
          dayName: SHORT_DAYS[nd.getDay()],
          dayNameFull: FULL_DAYS[nd.getDay()],
          DD: pad2(nd.getDate()),
          MM: pad2(nd.getMonth() + 1),
          YYYY: nd.getFullYear(),
          dayOfWeek: nd.getDay(),
          isToday: iso === todayStr
        })
      }
    } else if (store.currentView === 'day') {
      const iso = toLocalYMD(d)
      days.push({
        date: d,
        YYYY_MM_DD: iso,
        dayName: SHORT_DAYS[d.getDay()],
        dayNameFull: FULL_DAYS[d.getDay()],
        DD: pad2(d.getDate()),
        MM: pad2(d.getMonth() + 1),
        YYYY: d.getFullYear(),
        dayOfWeek: d.getDay(),
        isToday: iso === todayStr
      })
    }
    return days
  })

  const activeMonthArray = computed(() => {
    if (isMatrixLayout.value || store.currentView !== 'month') return []
    const d = getStartOfDay(currentDate.value)
    d.setDate(1)
    const firstDay = d.getDay() || 7
    const startDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() - firstDay + 1)
    const days = []
    const todayStr = toLocalYMD(new Date())
    for (let i = 0; i < 35; i++) {
      const nd = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
      const iso = toLocalYMD(nd)
      days.push({
        date: nd,
        YYYY_MM_DD: iso,
        isCurrentMonth: nd.getMonth() === currentDate.value.getMonth(),
        DD: nd.getDate(),
        isToday: iso === todayStr
      })
    }
    return days
  })

  const calendarTitleDisplay = computed(() => {
    const d = currentDate.value
    const months = ['STYCZEŃ', 'LUTY', 'MARZEC', 'KWIECIEŃ', 'MAJ', 'CZERWIEC', 'LIPIEC', 'SIERPIEŃ', 'WRZESIEŃ', 'PAŹDZIERNIK', 'LISTOPAD', 'GRUDZIEŃ']
    return `${months[d.getMonth()]} ${d.getFullYear()}`
  })

  const eventsByDate = computed(() => {
    const dict = {}

    const filteredEvents = store.events.filter(ev => {
      if (store.selectedTechId !== 'ALL') {
        const tObj = store.techList.find(t => t.id === store.selectedTechId)
        const tName = tObj ? tObj.name : store.selectedTechId
        const isSameTech = (
          ev.technician_id === store.selectedTechId ||
          ev.technician_id === tName ||
          (ev.extendedProps && ev.extendedProps.technicianName === tName)
        )
        if (!isSameTech) return false
      }
      return Boolean(ev.start_time)
    })

    filteredEvents.forEach(ev => {
      const rawStart = String(ev.start_time)
      const dateStr = rawStart.includes('T') ? rawStart.split('T')[0] : rawStart.split(' ')[0]
      if (!dict[dateStr]) dict[dateStr] = []

      const evTidNorm = String(ev.ticket_id || '').trim().toLowerCase().replace(/^#/, '')
      const ticket = evTidNorm
        ? store.tickets.find(t =>
            String(t.t_id || '').trim().toLowerCase() === evTidNorm ||
            String(t.t_code || '').trim().toLowerCase() === evTidNorm ||
            String(t.id || '').trim().toLowerCase() === evTidNorm
          )
        : null

      const tech = store.techList.find(
        t => String(t.id) === String(ev.technician_id) || String(t.name) === String(ev.technician_id)
      )

      const qpFallback = (String(ev.title || '').match(/QP-\d+/i) || [])[0] || ''
      const resolvedQp = (ticket?.t_qp || qpFallback || '').toUpperCase()

      const srcHint = String(ticket?.source || ticket?.t_source || ticket?.module || '').toLowerCase()
      const isAxonPattern = /^\d{4,}_/.test(String(ticket?.t_title || ev.title || ''))
      const sourceBrand = srcHint.includes('ekoen')
        ? 'EKOEN'
        : (srcHint.includes('axon') || isAxonPattern ? 'EEP' : (ticket ? 'EEP' : 'EKOEN'))

      dict[dateStr].push({
        ...ev,
        extendedProps: {
          technicianId: tech ? tech.id : (ev.technician_id || ''),
          technicianName: tech ? tech.name : (ev.technician_id || 'Brak'),
          techColor: tech ? (tech.zone_color || tech.color) : '#cbd5e1',
          ticketCode: ticket ? (ticket.t_code || ticket.t_id) : (ev.ticket_id || ''),
          qpCode: resolvedQp,
          t_status: ticket ? ticket.t_status : '',
          t_address: ticket ? ticket.t_address : '',
          t_client: ticket ? ticket.t_client : '',
          sourceBrand,
          category: ticket ? (ticket.t_category || ticket.t_type) : '',
          description: ev.description || (ticket ? ticket.t_desc : ''),
          event_type: ev.event_type || 'service',
          event_subtype: ev.event_subtype || '',
          all_day: ev.all_day === 'TAK' || ev.all_day === true
        }
      })
    })

    Object.keys(dict).forEach(date => {
      const dayEvents = dict[date].sort((a, b) => {
        const aMs = parseSafeEventDate(a.start_time)?.getTime() || 0
        const bMs = parseSafeEventDate(b.start_time)?.getTime() || 0
        if (aMs !== bMs) return aMs - bMs
        return a.extendedProps.technicianName.localeCompare(b.extendedProps.technicianName)
      })

      if (isMatrixLayout.value || store.currentView === 'month') {
        dayEvents.forEach(ev => {
          ev.computedStyle = { borderLeft: `6px solid ${ev.extendedProps.techColor}` }
        })
      } else {
        const uniqueTechs = [...new Set(dayEvents.map(e => e.extendedProps.technicianName))].sort()

        dayEvents.forEach(ev => {
          if (ev.extendedProps.event_type === 'absence') {
            ev.computedStyle = { display: 'none' }
            return
          }

          const start = parseSafeEventDate(ev.start_time) || new Date(`${date}T08:00:00`)
          const end = parseSafeEventDate(ev.end_time) || new Date(start.getTime() + 2 * 3600000)

          const rawStartHour = start.getHours() + (start.getMinutes() / 60)
          let rawEndHour = end.getHours() + (end.getMinutes() / 60)
          if (end.getDate() !== start.getDate() || end.getMonth() !== start.getMonth()) {
            rawEndHour = 24
          }
          if (rawEndHour <= rawStartHour) rawEndHour = rawStartHour + 0.5

          const visibleStartHour = Math.max(GRID_START_HOUR, rawStartHour)
          const visibleEndHour = Math.max(visibleStartHour + 0.5, rawEndHour)

          const top = (visibleStartHour - GRID_START_HOUR) * 120
          const height = Math.max(60, (visibleEndHour - visibleStartHour) * 120)

          const techIndex = uniqueTechs.indexOf(ev.extendedProps.technicianName)
          const offset = techIndex * 24

          const isDayView = store.currentView === 'day'
          const width = isDayView ? `calc(85% - ${offset + 8}px)` : `calc(100% - ${offset + 8}px)`
          const left = `${offset + 4}px`

          const isTask = ev.extendedProps.event_type === 'task'

          ev.computedStyle = {
            top: `${top}px`,
            height: `${height}px`,
            width,
            left,
            borderLeft: isTask ? '6px solid #58b347' : `6px solid ${ev.extendedProps.techColor}`,
            zIndex: 10 + techIndex,
            backgroundColor: '#ffffff'
          }
        })
      }
    })
    return dict
  })

  const absencesByDate = computed(() => {
    const dict = {}
    const absences = store.events.filter(
      ev => (ev.extendedProps ? ev.extendedProps.event_type : ev.event_type) === 'absence'
    )

    absences.forEach(ev => {
      if (store.selectedTechId !== 'ALL') {
        const tObj = store.techList.find(t => t.id === store.selectedTechId)
        const tName = tObj ? tObj.name : store.selectedTechId
        const isSameTech = (
          ev.technician_id === store.selectedTechId ||
          ev.technician_id === tName ||
          (ev.extendedProps && ev.extendedProps.technicianName === tName)
        )
        if (!isSameTech) return
      }
      if (!ev.start_time) return

      const startStr = String(ev.start_time).includes('T') ? String(ev.start_time).split('T')[0] : String(ev.start_time).split(' ')[0]
      const endStr = ev.end_time
        ? (String(ev.end_time).includes('T') ? String(ev.end_time).split('T')[0] : String(ev.end_time).split(' ')[0])
        : startStr

      let current = new Date(`${startStr}T12:00:00Z`)
      const endObj = new Date(`${endStr}T12:00:00Z`)

      const evTechId = ev.technician_id || (ev.extendedProps ? ev.extendedProps.technicianName : '')
      const tech = store.techList.find(t => String(t.id) === String(evTechId) || String(t.name) === String(evTechId))

      let safetyCount = 0
      while (current <= endObj && safetyCount < 365) {
        const dStr = current.toISOString().split('T')[0]
        if (!dict[dStr]) dict[dStr] = []

        dict[dStr].push({
          ...ev,
          extendedProps: {
            ...(ev.extendedProps || {}),
            technicianId: tech ? tech.id : evTechId,
            technicianName: tech ? tech.name : (ev.technician_id || 'Brak'),
            techColor: tech ? (tech.zone_color || tech.color) : '#cbd5e1',
            event_type: 'absence',
            event_subtype: ev.event_subtype || (ev.extendedProps && ev.extendedProps.event_subtype) || 'Urlop',
            all_day: true
          }
        })
        current.setUTCDate(current.getUTCDate() + 1)
        safetyCount++
      }
    })
    return dict
  })

  const formatISO = (date) => {
    const tzo = -date.getTimezoneOffset()
    const dif = tzo >= 0 ? '+' : '-'
    const offStr = `${dif}${pad2(Math.floor(Math.abs(tzo) / 60))}:${pad2(Math.abs(tzo) % 60)}`
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}:00${offStr}`
  }

  const checkOverlap = (techId, startStr, endStr, excludeEventId = null) => {
    if (!techId) return false
    const start = new Date(String(startStr).replace(' ', 'T')).getTime()
    const end = new Date(String(endStr).replace(' ', 'T')).getTime()

    const techObj = store.techList.find(t => t.id === techId || t.name === techId)
    const finalTechId = techObj ? techObj.id : techId
    const techName = techObj ? techObj.name : techId

    return store.events.some(ev => {
      const isAbsence = ev.event_type === 'absence' || (ev.extendedProps && ev.extendedProps.event_type === 'absence')
      if (isAbsence) return false

      const isSameTech = (
        ev.technician_id === finalTechId ||
        ev.technician_id === techName ||
        (ev.extendedProps && ev.extendedProps.technicianName === techName)
      )
      if (ev.id === excludeEventId || !isSameTech || !ev.start_time || !ev.end_time) return false

      const evStart = new Date(String(ev.start_time).replace(' ', 'T')).getTime()
      const evEnd = new Date(String(ev.end_time).replace(' ', 'T')).getTime()
      return start < evEnd && end > evStart
    })
  }

  const findNextAvailableSlot = (techId, baseDateStr, excludeEventId = null, startHourFrom = 7, durationHours = 2) => {
    let startHour = Math.max(GRID_START_HOUR, Math.floor(startHourFrom * 2) / 2)
    while (startHour + durationHours <= 24) {
      const h = Math.floor(startHour)
      const m = startHour % 1 === 0.5 ? 30 : 0
      const sObj = new Date(`${baseDateStr}T${pad2(h)}:${pad2(m)}:00`)
      const eObj = new Date(sObj.getTime() + durationHours * 3600000)

      const sTime = formatISO(sObj)
      const eTime = formatISO(eObj)

      if (!checkOverlap(techId, sTime, eTime, excludeEventId)) return { start: sTime, end: eTime }
      startHour += 0.5
    }
    const sDef = new Date(`${baseDateStr}T20:00:00`)
    const eDef = new Date(sDef.getTime() + durationHours * 3600000)
    return { start: formatISO(sDef), end: formatISO(eDef) }
  }

  const resizeData = { evId: null, startY: 0, startDurationMs: 0, snapshot: [], modifiedEvents: new Set() }

  const startResize = (e, ev) => {
    e.preventDefault()
    e.stopPropagation()
    const startMs = parseSafeEventDate(ev.start_time)?.getTime() || Date.now()
    const endMs = parseSafeEventDate(ev.end_time)?.getTime() || (startMs + 2 * 3600000)

    resizeData.evId = ev.id
    resizeData.startY = e.clientY
    resizeData.startDurationMs = endMs - startMs
    resizeData.modifiedEvents = new Set([ev.id])

    const dateStr = String(ev.start_time).includes('T') ? String(ev.start_time).split('T')[0] : String(ev.start_time).split(' ')[0]

    const techEvents = store.events.filter(x => {
      const isAbsence = x.event_type === 'absence' || (x.extendedProps && x.extendedProps.event_type === 'absence')
      if (isAbsence) return false

      const techMatch = x.technician_id === ev.technician_id ||
        (x.extendedProps && x.extendedProps.technicianName === ev.extendedProps?.technicianName)
      const xDateStr = String(x.start_time).includes('T') ? String(x.start_time).split('T')[0] : String(x.start_time).split(' ')[0]
      return techMatch && xDateStr === dateStr
    })

    resizeData.snapshot = techEvents.map(x => {
      const s = parseSafeEventDate(x.start_time)?.getTime() || 0
      const eTime = parseSafeEventDate(x.end_time)?.getTime() || (s + 2 * 3600000)
      return { id: x.id, startMs: s, endMs: eTime }
    }).sort((a, b) => a.startMs - b.startMs)

    window.addEventListener('mousemove', handleResizeMove)
    window.addEventListener('mouseup', handleResizeUp)
  }

  const handleResizeMove = (e) => {
    if (!resizeData.evId) return
    const deltaY = e.clientY - resizeData.startY
    let newDurationMs = resizeData.startDurationMs + (deltaY / 120) * 3600000

    newDurationMs = Math.round(newDurationMs / 1800000) * 1800000
    if (newDurationMs < 1800000) newDurationMs = 1800000
    if (newDurationMs > 86400000) newDurationMs = 86400000

    const eventsCopy = [...store.events]
    const evIndex = eventsCopy.findIndex(x => x.id === resizeData.evId)

    if (evIndex !== -1) {
      const evToResize = { ...eventsCopy[evIndex] }
      const startMs = parseSafeEventDate(evToResize.start_time)?.getTime() || Date.now()
      const newEndMs = startMs + newDurationMs

      evToResize.end_time = formatISO(new Date(newEndMs))
      eventsCopy[evIndex] = evToResize

      let currentEndTime = newEndMs

      for (const snap of resizeData.snapshot) {
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

  const handleEmptySlotClick = (dateStr, hour) => {
    const defaultTech = store.selectedTechId !== 'ALL' ? store.selectedTechId : null
    let targetTime = `${dateStr}T08:00:00`

    if (hour !== undefined) {
      const snapped = Math.max(GRID_START_HOUR, Math.min(23.5, Math.floor(hour * 2) / 2))
      const h = Math.floor(snapped)
      const m = (snapped % 1) >= 0.5 ? 30 : 0
      targetTime = `${dateStr}T${pad2(h)}:${pad2(m)}:00`
    }

    return {
      startDate: formatISO(new Date(targetTime)),
      techId: defaultTech
    }
  }

  return {
    GRID_START_HOUR,
    currentDate,
    calendarHours,
    currentTimeLineStyle,
    activeDaysArray,
    activeMonthArray,
    calendarTitleDisplay,
    eventsByDate,
    absencesByDate,
    navigateCalendar,
    navigateToday,
    formatISO,
    checkOverlap,
    findNextAvailableSlot,
    startResize,
    handleEmptySlotClick
  }
}