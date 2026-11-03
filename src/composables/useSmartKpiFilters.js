import { computed } from 'vue'

export function useSmartKpiFilters(store, checkSearchFunction) {
  
  // Zunifikowana funkcja oceniająca filtry AND/OR/NOT
  const evaluateQueries = (item, queries) => {
    const validSearch = queries?.filter(q => q.text.trim() !== '') || []
    if (validSearch.length === 0) return true

    let match = checkSearchFunction(item, validSearch[0].text)
    if (validSearch[0].logic === 'NOT') match = !match
    
    for (let i = 1; i < validSearch.length; i++) {
      const cMet = checkSearchFunction(item, validSearch[i].text)
      if (validSearch[i].logic === 'AND') match = match && cMet
      else if (validSearch[i].logic === 'OR') match = match || cMet
      else if (validSearch[i].logic === 'NOT') match = match && !cMet
    }
    return match
  }

  const evaluateTab = (item, tab) => {
    if (!tab || !tab.customQueries) return true;
    return evaluateQueries(item, tab.customQueries);
  }

  // Funkcja pomocnicza grupująca wybrane kafelki na 3 koszyki
  const getGroupedActiveTabs = (activeTabIds) => {
    const techTabs = []
    const statusTabs = []
    const otherTabs = []

    const activeTabObjs = activeTabIds
      .filter(id => id !== 'ALL' && id !== 'DUPLICATES')
      .map(id => store.kpiTabs.find(c => c.id === id))
      .filter(Boolean);

    activeTabObjs.forEach(tab => {
      let isTechTab = tab.id.startsWith('TECH_') || tab.id === 'MY_TICKETS'
      let isStatusTab = tab.id.includes('WAIT_') || tab.id === 'DONE' || tab.id === 'MY_WAIT_PARTS' || tab.id === 'MY_WAIT_EXEC' || tab.id === 'MY_DONE' || tab.id === 'NEW' || tab.id === 'MY_NEW'

      if (!isTechTab && !isStatusTab) {
         const qTexts = (tab.customQueries || []).map(q => String(q.text).toUpperCase())
         if (qTexts.some(text => text.includes('TECH_EXACT:'))) isTechTab = true
         if (qTexts.some(text => text.includes('STATUS_EXACT:') || text.includes('OCZEKUJE NA'))) isStatusTab = true
      }

      if (isTechTab) techTabs.push(tab)
      else if (isStatusTab) statusTabs.push(tab)
      else otherTabs.push(tab)
    })

    return { techTabs, statusTabs, otherTabs }
  }

  // Funkcja do fizycznego przepuszczenia listy zgłoszeń przez zadaną grupę kafelków
  const applyKpiFilters = (baseList, groupedTabs, checkDuplicates = false, activeTabIds = []) => {
    const { techTabs, statusTabs, otherTabs } = groupedTabs

    return baseList.filter(item => {
      if (checkDuplicates && activeTabIds.includes('DUPLICATES') && store.duplicateIds && !store.duplicateIds.includes(item.qp_id || item.station_id)) {
         return false;
      }

      let passTech = techTabs.length === 0
      let passStatus = statusTabs.length === 0
      let passOther = true

      if (techTabs.length > 0) {
        passTech = techTabs.some(tab => evaluateTab(item, tab)) // LUB między technikami
      }
      if (statusTabs.length > 0) {
        passStatus = statusTabs.some(tab => evaluateTab(item, tab)) // LUB między statusami
      }
      if (otherTabs.length > 0) {
        passOther = otherTabs.every(tab => evaluateTab(item, tab)) // ORAZ między resztą
      }

      return passTech && passStatus && passOther // ORAZ między grupami
    })
  }

  // 1. Zmienna obliczająca listę dla GŁÓWNEJ TABELI (pod wszystkimi filtrami)
  const filteredBaseList = computed(() => {
    let base = store.getBaseList ? store.getBaseList() : []
    const activeTabIds = store.activeTabs || ['ALL']

    if (!activeTabIds.includes('ALL')) {
      const grouped = getGroupedActiveTabs(activeTabIds)
      base = applyKpiFilters(base, grouped, true, activeTabIds)
    } else if (activeTabIds.includes('DUPLICATES')) {
       base = base.filter(item => store.duplicateIds && store.duplicateIds.includes(item.qp_id || item.station_id));
    }

    if (store.searchQueriesMain.some(q => q.text.trim() !== '')) {
      base = base.filter(item => evaluateQueries(item, store.searchQueriesMain))
    }
    return base
  })

  // 2. Zmienna zliczająca KONTEKSTOWO cyferki na kafelkach
  const tabCounts = computed(() => {
    const counts = {}
    if (!store.kpiTabs) return counts
    
    // Główna baza bierzemy TYLKO przepuszczoną przez wyszukiwarkę (żeby szukajka działała na cyfry KPI!)
    let searchFilteredBase = store.getBaseList ? store.getBaseList() : []
    if (store.searchQueriesMain.some(q => q.text.trim() !== '')) {
      searchFilteredBase = searchFilteredBase.filter(item => evaluateQueries(item, store.searchQueriesMain))
    }

    const activeTabIds = store.activeTabs || ['ALL']
    const currentGroupedActive = getGroupedActiveTabs(activeTabIds)
    const isDuplicatesActive = activeTabIds.includes('DUPLICATES')

    store.kpiTabs.forEach(tab => {
      if (tab.isHidden) return;
      
      if (tab.filter === 'ALL') {
        counts[tab.id] = searchFilteredBase.length
      } else if (tab.id === 'DUPLICATES') {
        // Liczy wszystkie duplikaty w bieżącej szukajce
        counts[tab.id] = searchFilteredBase.filter(item => store.duplicateIds && store.duplicateIds.includes(item.qp_id || item.station_id)).length
      } else if (tab.customQueries) {
        
        // Zliczanie w systemie Multi-Select:
        // Aby sprawdzić ile zliczy "Technik A", musimy przepuścić listę przez
        // wszystko, co jest wybrane, OPRÓCZ pozostałych techników (bo w swojej grupie są towarem zamiennym LUB).
        // Czyli: Technik A = Cała baza PRZEZ (Wybrane Statusy) PRZEZ (Wybrane Inne) PRZEZ (Ten konkretny Technik A)
        
        let isTechTab = tab.id.startsWith('TECH_') || tab.id === 'MY_TICKETS'
        let isStatusTab = tab.id.includes('WAIT_') || tab.id === 'DONE' || tab.id === 'MY_WAIT_PARTS' || tab.id === 'MY_WAIT_EXEC' || tab.id === 'MY_DONE' || tab.id === 'NEW' || tab.id === 'MY_NEW'

        if (!isTechTab && !isStatusTab) {
           const qTexts = (tab.customQueries || []).map(q => String(q.text).toUpperCase())
           if (qTexts.some(text => text.includes('TECH_EXACT:'))) isTechTab = true
           if (qTexts.some(text => text.includes('STATUS_EXACT:') || text.includes('OCZEKUJE NA'))) isStatusTab = true
        }

        // Budujemy symulowaną grupę aktywnych kafelków z pominięciem "konkurencji" z własnej grupy
        let simulatedGroup = {
          techTabs: isTechTab ? [tab] : currentGroupedActive.techTabs,
          statusTabs: isStatusTab ? [tab] : currentGroupedActive.statusTabs,
          otherTabs: (!isTechTab && !isStatusTab) ? [...currentGroupedActive.otherTabs, tab] : currentGroupedActive.otherTabs
        }

        // Przepuszczamy symulację
        counts[tab.id] = applyKpiFilters(searchFilteredBase, simulatedGroup, isDuplicatesActive, activeTabIds).length

      } else {
        counts[tab.id] = 0
      }
    })
    return counts
  })

  return { filteredBaseList, tabCounts, evaluateQueries }
}