<template>
  <div class="h-full w-full bg-[#f4f6f8] overflow-hidden flex flex-col relative" @click.self="disableEditMode">
    
    <!-- NAGŁÓWEK DASHBOARDU -->
    <header class="px-6 md:px-10 py-8 shrink-0 flex items-center justify-between bg-gradient-to-b from-[#f4f6f8] to-transparent z-20">
      <div>
        <h1 class="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">Twój Pulpit</h1>
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{{ userRole }} • EKOEN PRO</p>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Przycisk Edycji Układu -->
        <button @click="toggleEditMode" class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#58b347] hover:border-[#58b347]/30 shadow-sm transition-all" :class="{ 'bg-amber-50 border-amber-200 text-amber-600': isEditMode }">
          <svg v-if="!isEditMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
      </div>
    </header>

    <!-- SIATKA BENTO BOX (Z płynnym przejściem TransitionGroup) -->
    <div class="flex-1 overflow-y-auto px-6 md:px-10 pb-20 custom-scrollbar relative z-10" ref="gridContainer" @click.self="disableEditMode">
      <TransitionGroup name="bento" tag="div" class="grid grid-cols-12 gap-4 auto-rows-[100px] relative pb-10" @click.self="disableEditMode">
        
        <div 
          v-for="tile in layout" 
          :key="tile.id"
          :data-id="tile.id"
          class="bento-tile relative rounded-3xl p-5 md:p-6 shadow-sm border transition-all duration-300 ease-out select-none flex flex-col justify-between"
          :class="[
            tile.bg, 
            tile.color, 
            isEditMode ? 'cursor-grab hover:shadow-lg edit-wiggle' : 'cursor-pointer hover:scale-[1.02] hover:shadow-md active:scale-95',
            dragState.activeId === tile.id ? 'opacity-0' : 'opacity-100'
          ]"
          :style="{ gridColumn: `span ${tile.w}`, gridRow: `span ${tile.h}` }"
          @contextmenu.prevent="openTileSettings(tile, $event)"
          @pointerdown="onPointerDown(tile, $event)"
          @click="handleTileClick(tile)"
        >
          <!-- WZÓR TŁA (Subtelny akcent) -->
          <div v-if="tile.bg.includes('gradient')" class="absolute -bottom-10 -right-10 opacity-20 w-40 h-40 pointer-events-none">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M11.6 11.6 5 21a2 2 0 0 1-2.8-2.8l9.4-6.6"/></svg>
          </div>

          <!-- IKONA I NAZWA -->
          <div class="flex justify-between items-start relative z-10">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-sm" :class="tile.iconBg || 'bg-white/20'">
              <span class="text-2xl drop-shadow-sm" v-html="tile.icon"></span>
            </div>
            
            <!-- MAŁY INDYKATOR (np. liczba zgłoszeń) -->
            <div v-if="tile.badge" class="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm">
              {{ tile.badge }}
            </div>
          </div>

          <div class="relative z-10 mt-4">
            <h3 class="text-sm md:text-base font-black tracking-tight" :class="tile.color === 'text-white' ? 'text-white' : 'text-slate-800'">{{ tile.name }}</h3>
            <p v-if="tile.w > 3" class="text-[10px] md:text-xs font-bold opacity-70 mt-1 uppercase tracking-widest line-clamp-1">{{ tile.desc }}</p>
          </div>
          
          <!-- NAKŁADKA TRYBU EDYCJI (Pulsująca ramka) -->
          <div v-if="isEditMode" class="absolute inset-0 border-4 border-amber-400/50 rounded-3xl pointer-events-none z-20"></div>
        </div>
      </TransitionGroup>
    </div>

    <!-- ======================================================= -->
    <!-- DRAG CLONE (Fizyczny byt podążający za kursorem/palcem) -->
    <!-- Z efektem JELLY PHYSICS -->
    <!-- ======================================================= -->
    <div 
      v-if="dragState.activeId"
      class="fixed pointer-events-none z-[9999] rounded-3xl p-6 shadow-2xl flex flex-col justify-between border-2 border-white/50 backdrop-blur-md will-change-transform"
      :class="[dragState.tile.bg, dragState.tile.color, dragState.isReleasing ? 'jelly-snap' : '']"
      :style="{
        width: dragState.width + 'px',
        height: dragState.height + 'px',
        top: 0,
        left: 0,
        transform: `translate3d(${dragState.currX - dragState.offsetX}px, ${dragState.currY - dragState.offsetY}px, 0) scale(1.05) skew(${dragState.skewX}deg, ${dragState.skewY}deg) rotate(${dragState.skewX * 0.2}deg)`
      }"
    >
      <div class="flex justify-between items-start">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" :class="dragState.tile.iconBg || 'bg-white/20'">
          <span class="text-2xl drop-shadow-sm" v-html="dragState.tile.icon"></span>
        </div>
      </div>
      <div class="mt-4">
        <h3 class="text-base font-black tracking-tight">{{ dragState.tile.name }}</h3>
      </div>
    </div>

    <!-- ======================================================= -->
    <!-- CONTEXT MENU (Pop-up przy prawym kliku w trybie edycji) -->
    <!-- ======================================================= -->
    <div v-if="contextMenu.show" class="fixed z-[100000] bg-white p-3 rounded-2xl shadow-2xl border border-slate-100 flex flex-col gap-2 w-48 animate-fadeIn" :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }" @click.stop>
      <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 pb-1 border-b border-slate-100 mb-1">Rozmiar Kafla</div>
      <button @click="resizeTile(contextMenu.tileId, 4, 1)" class="text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"><div class="w-4 h-2 bg-slate-300 rounded-sm"></div> Mały Poziomy (1/3)</button>
      <button @click="resizeTile(contextMenu.tileId, 6, 2)" class="text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"><div class="w-6 h-4 bg-slate-400 rounded-sm"></div> Średni (1/2)</button>
      <button @click="resizeTile(contextMenu.tileId, 12, 2)" class="text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"><div class="w-8 h-4 bg-slate-500 rounded-sm"></div> Pełna szerokość</button>
      <button @click="resizeTile(contextMenu.tileId, 6, 4)" class="text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"><div class="w-6 h-6 bg-slate-600 rounded-sm"></div> Duży Blok</button>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  userRole: String,
  userEmail: String
})

const emit = defineEmits(['toggle-ui', 'switch-view', 'logout'])

// --- BAZA MODUŁÓW (DEFAULT LAYOUT) ---
const defaultLayout = [
  { id: 'tickets', w: 6, h: 3, name: 'Zgłoszenia', desc: 'Centrum Operacyjne', icon: '🚨', bg: 'bg-gradient-to-br from-[#58b347] to-[#3f8c31]', color: 'text-white', iconBg: 'bg-white/20', badge: '3' },
  { id: 'map', w: 6, h: 3, name: 'Nawigacja', desc: 'Mapa stacji i techników', icon: '🗺️', bg: 'bg-slate-800', color: 'text-white', iconBg: 'bg-slate-700 border border-slate-600' },
  { id: 'schedule', w: 12, h: 2, name: 'Harmonogram', desc: 'Kalendarz wizyt na stacjach', icon: '📅', bg: 'bg-white border-slate-200', color: 'text-slate-800', iconBg: 'bg-indigo-50 border border-indigo-100' },
  { id: 'storage', w: 4, h: 2, name: 'Magazyn', desc: 'Stany części', icon: '📦', bg: 'bg-white border-slate-200', color: 'text-slate-800', iconBg: 'bg-amber-50 border border-amber-100' },
  { id: 'clients', w: 4, h: 2, name: 'Klienci CRM', desc: 'Baza kontrahentów', icon: '🏢', bg: 'bg-white border-slate-200', color: 'text-slate-800', iconBg: 'bg-blue-50 border border-blue-100' },
  { id: 'billings', w: 4, h: 2, name: 'Rozliczenia', desc: 'Faktury i koszty', icon: '💰', bg: 'bg-white border-slate-200', color: 'text-slate-800', iconBg: 'bg-emerald-50 border border-emerald-100' },
  { id: 'technicians', w: 3, h: 2, name: 'Technicy', desc: 'Flota', icon: '👷', bg: 'bg-white border-slate-200', color: 'text-slate-800', iconBg: 'bg-slate-50' },
  { id: 'stations', w: 3, h: 2, name: 'Stacje', desc: 'Baza', icon: '⚡', bg: 'bg-white border-slate-200', color: 'text-slate-800', iconBg: 'bg-slate-50' },
  { id: 'offers', w: 3, h: 2, name: 'Oferty', desc: 'Wyceny', icon: '📄', bg: 'bg-white border-slate-200', color: 'text-slate-800', iconBg: 'bg-slate-50' },
  { id: 'settings', w: 3, h: 2, name: 'Opcje', desc: 'System', icon: '⚙️', bg: 'bg-white border-slate-200', color: 'text-slate-800', iconBg: 'bg-slate-50' },
]

const layout = ref([])

onMounted(() => {
  // Wczytywanie układu z pamięci, jeśli istnieje
  const savedLayout = localStorage.getItem('ekoen_bento_layout')
  if (savedLayout) {
    try {
      layout.value = JSON.parse(savedLayout)
    } catch (e) {
      layout.value = JSON.parse(JSON.stringify(defaultLayout))
    }
  } else {
    layout.value = JSON.parse(JSON.stringify(defaultLayout))
  }
})

// --- TRYB EDYCJI I CONTEXT MENU ---
const isEditMode = ref(false)
const contextMenu = reactive({ show: false, x: 0, y: 0, tileId: null })

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  contextMenu.show = false
  if (!isEditMode.value) {
    localStorage.setItem('ekoen_bento_layout', JSON.stringify(layout.value))
  }
}

const disableEditMode = () => {
  contextMenu.show = false
}

const openTileSettings = (tile, e) => {
  if (!isEditMode.value) isEditMode.value = true
  contextMenu.tileId = tile.id
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY
  contextMenu.show = true
}

const resizeTile = (id, newW, newH) => {
  const t = layout.value.find(x => x.id === id)
  if (t) {
    t.w = newW
    t.h = newH
  }
  contextMenu.show = false
  localStorage.setItem('ekoen_bento_layout', JSON.stringify(layout.value))
}

const handleTileClick = (tile) => {
  if (isEditMode.value) return // W trybie edycji blokujemy kliknięcia modułów
  emit('switch-view', tile.id)
}

// ==============================================================
// SILNIK JELLY PHYSICS & DRAG'N'DROP
// ==============================================================
const dragState = reactive({
  activeId: null,
  tile: null,
  startX: 0, startY: 0,
  currX: 0, currY: 0,
  offsetX: 0, offsetY: 0,
  width: 0, height: 0,
  vX: 0, vY: 0,
  skewX: 0, skewY: 0,
  lastTime: 0,
  isReleasing: false
})

let rafId = null

const onPointerDown = (tile, e) => {
  if (!isEditMode.value) return
  
  e.preventDefault() // Zapobiega zaznaczaniu tekstu/scrollowaniu podczas dragowania na mobile
  e.target.setPointerCapture(e.pointerId)
  
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  
  dragState.tile = tile
  dragState.activeId = tile.id
  dragState.width = rect.width
  dragState.height = rect.height
  
  // Gdzie złapaliśmy kafel wewnątrz jego obszaru
  dragState.offsetX = e.clientX - rect.left
  dragState.offsetY = e.clientY - rect.top
  
  dragState.currX = e.clientX
  dragState.currY = e.clientY
  
  dragState.vX = 0
  dragState.vY = 0
  dragState.skewX = 0
  dragState.skewY = 0
  dragState.lastTime = performance.now()
  dragState.isReleasing = false

  window.addEventListener('pointermove', onPointerMove, { passive: false })
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
  
  // Uruchomienie pętli fizyki
  physicsLoop()
}

const onPointerMove = (e) => {
  if (!dragState.activeId) return
  e.preventDefault()
  
  const now = performance.now()
  const dt = Math.max(1, now - dragState.lastTime)
  
  // Obliczanie wektora prędkości (Delta X / Delta Time)
  const dx = e.clientX - dragState.currX
  const dy = e.clientY - dragState.currY
  
  // Aktualizacja pozycji
  dragState.currX = e.clientX
  dragState.currY = e.clientY
  
  // Czułość galarety - Mnożniki wpływają na to, jak mocno się wygina
  dragState.vX = (dx / dt) * 15
  dragState.vY = (dy / dt) * 15
  
  // Zastosowanie ograniczeń (Clamp), żeby kafel nie obrócił się na drugą stronę
  dragState.skewX = Math.max(-25, Math.min(25, -dragState.vX))
  dragState.skewY = Math.max(-25, Math.min(25, dragState.vY))
  
  dragState.lastTime = now

  // --- LOGIKA ZAMIANY MIEJSC (SWAPPING) ---
  // Ukrywamy na chwilę klon, żeby złapać element pod nim
  const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY)
  const targetTileEl = elementsUnderCursor.find(el => el.classList.contains('bento-tile') && el.dataset.id !== dragState.activeId)
  
  if (targetTileEl) {
    const targetId = targetTileEl.dataset.id
    swapTiles(dragState.activeId, targetId)
  }
}

const swapTiles = (id1, id2) => {
  const idx1 = layout.value.findIndex(t => t.id === id1)
  const idx2 = layout.value.findIndex(t => t.id === id2)
  if (idx1 !== -1 && idx2 !== -1) {
    const temp = layout.value[idx1]
    layout.value[idx1] = layout.value[idx2]
    layout.value[idx2] = temp
  }
}

const physicsLoop = () => {
  if (!dragState.activeId) return
  
  // Symulacja oporu powietrza (Friction) wyhamowuje rotację, gdy mysz się zatrzyma
  dragState.skewX *= 0.8
  dragState.skewY *= 0.8
  
  rafId = requestAnimationFrame(physicsLoop)
}

const onPointerUp = () => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  cancelAnimationFrame(rafId)
  
  // Animacja sprężynowa przy upuszczeniu
  dragState.isReleasing = true
  dragState.skewX = 0
  dragState.skewY = 0
  
  // Czekamy na zakończenie animacji CSS przed usunięciem klona
  setTimeout(() => {
    dragState.activeId = null
    dragState.tile = null
    localStorage.setItem('ekoen_bento_layout', JSON.stringify(layout.value))
  }, 300) 
}

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})
</script>

<style scoped>
/* Pasek przewijania */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }

/* Animacje wejścia */
.animate-fadeIn { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

/* ==================================================== */
/* 1. ANIMACJA JIGGLE (Trzęsienie w trybie edycji)      */
/* ==================================================== */
.edit-wiggle {
  animation: wiggle 0.4s infinite cubic-bezier(0.36, 0.07, 0.19, 0.97);
  transform-origin: center center;
}
/* Co drugi kafel trzęsie się w przeciwnej fazie dla realizmu */
.bento-tile:nth-child(even).edit-wiggle {
  animation-direction: reverse;
  animation-duration: 0.38s;
}
@keyframes wiggle {
  0% { transform: rotate(-0.5deg) scale(0.98); }
  50% { transform: rotate(0.5deg) scale(0.98); }
  100% { transform: rotate(-0.5deg) scale(0.98); }
}

/* ==================================================== */
/* 2. EFEKT GALARETY (Jelly release) na upuszczenie     */
/* ==================================================== */
/* Kiedy user puszcza myszkę, zdejmujemy custom transform
   z JS i pozwalamy tej klasie zrobić sprężysty powrót do zera */
.jelly-snap {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: translate3d(0,0,0) scale(1) skew(0,0) rotate(0) !important;
  opacity: 0; /* Znikanie klona, pojawia się prawdziwy kafel */
}

/* ==================================================== */
/* 3. TRANSITION GROUP (Płynne rozstępowanie siatki)    */
/* ==================================================== */
/* To jest klucz! Vue samo animuje płytki wokół myszki */
.bento-move {
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
}
</style>