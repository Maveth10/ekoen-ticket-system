<template>
  <div class="h-full w-full bg-[#e2e8f0] overflow-hidden flex flex-col relative select-none" @click.self="disableEditMode">
    
    <!-- TŁO AMBIENT + GIGANTYCZNE LOGO EKOEN W TLE -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-[15%] -right-[5%] w-[45%] h-[45%] rounded-full bg-[#58b347]/[0.08] blur-[100px]"></div>
      <div class="absolute -bottom-[15%] -left-[5%] w-[40%] h-[40%] rounded-full bg-slate-400/[0.1] blur-[100px]"></div>

      <!-- Ogromny, przycięty fragment logo EKOEN -->
      <svg 
        viewBox="0 0 200 200" 
        class="absolute -right-[12%] -bottom-[24%] w-[88vh] h-[88vh] max-w-[980px] max-h-[980px] text-[#58b347]/[0.13] -rotate-12" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M100 10C149.706 10 190 50.2944 190 100C190 149.706 149.706 190 100 190C50.2944 190 10 149.706 10 100C10 50.2944 50.2944 10 100 10Z" stroke="currentColor" stroke-width="11" />
        <circle cx="100" cy="100" r="70" fill="currentColor" fill-opacity="0.55" />
        <path d="M85 70H135V85H85V70ZM65 92.5H115V107.5H65V92.5ZM85 115H135V130H85V115Z" fill="#e2e8f0" />
      </svg>
    </div>

    <!-- PŁYWAJĄCY PASEK EDYCJI (Pojawia się TYLKO po kliknięciu PPM na kafel) -->
    <div 
      v-if="isEditMode" 
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-fadeIn"
    >
      <span class="text-[10px] font-black uppercase tracking-widest text-amber-400 pl-1">Tryb edycji</span>
      <div class="w-px h-4 bg-white/15"></div>
      <button @click="resetLayout" class="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-400 transition-colors px-2 py-1">
        Resetuj układ
      </button>
      <button @click="toggleEditMode" class="bg-[#58b347] hover:bg-[#499b3a] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl transition-colors">
        Gotowe
      </button>
    </div>

    <!-- SIATKA BENTO BOX -->
    <div class="flex-1 overflow-y-auto px-4 md:px-10 pt-5 md:pt-8 pb-20 custom-scrollbar relative z-10" ref="gridContainer" @click.self="disableEditMode">
    
      <TransitionGroup name="bento" tag="div" class="grid grid-cols-12 gap-3 md:gap-4 auto-rows-[88px] md:auto-rows-[104px] relative pb-10 max-w-[1600px] mx-auto" @click.self="disableEditMode">
        
        <div 
          v-for="tile in layout" 
          :key="tile.id"
          :data-id="tile.id"
          class="bento-tile group relative rounded-[1.5rem] md:rounded-[1.75rem] p-4 md:p-6 overflow-hidden transition-all duration-300 ease-out flex flex-col justify-between"
          :class="[
            tile.bg,
            tile.border,
            tile.shadow,
            isEditMode 
              ? 'cursor-grab hover:shadow-xl hover:-translate-y-0.5' 
              : 'cursor-pointer hover:-translate-y-1 hover:shadow-xl active:scale-[0.98]',
            dragState.activeId === tile.id ? 'opacity-0' : 'opacity-100'
          ]"
          :style="getTileStyle(tile)"
          @contextmenu.prevent="openTileSettings(tile, $event)"
          @pointerdown="onPointerDown(tile, $event)"
          @click="handleTileClick(tile)"
        >
          <!-- SUBTELNA POŚWIATA W NAROŻNIKU -->
          <div 
            v-if="tile.glow" 
            class="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-60 group-hover:opacity-100"
            :class="tile.glow"
          ></div>

          <!-- GIGANTYCZNY ZNAK WODNY SVG W TLE -->
          <div 
            class="absolute -bottom-7 -right-7 pointer-events-none transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6"
            :class="[tile.watermarkClass, tile.h >= 3 ? 'w-52 h-52' : 'w-36 h-36']"
          >
            <div v-if="tile.watermark" class="w-full h-full" v-html="tile.watermark"></div>
            <component v-else :is="iconMap[tile.id]" class="w-full h-full" :stroke-width="1.4" />
          </div>

          <!-- GÓRNA BELKA KAFLA (IKONA + BADGE / STRZAŁKA) -->
          <div class="flex justify-between items-start relative z-10 pointer-events-none">
            <div class="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105" :class="tile.iconBg">
              <component :is="iconMap[tile.id]" class="w-5 h-5" :stroke-width="2" />
            </div>

            <!-- Licznik (np. zgłoszenia) lub subtelna strzałka wejścia -->
            <div v-if="tile.badge" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase backdrop-blur-md" :class="tile.badgeClass">
              <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              {{ tile.badge }}
            </div>
            <div 
              v-else-if="!isEditMode" 
              class="w-8 h-8 rounded-full flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
              :class="tile.isDark ? 'bg-white/10 text-white' : 'bg-slate-900/5 text-slate-600'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H7M17 7v10"/></svg>
            </div>
          </div>

          <!-- DOLNA BELKA KAFLA (TYTUŁ + OPIS) -->
          <div class="relative z-10 mt-auto pt-3 pointer-events-none">
            <div v-if="tile.tag && tile.h >= 2" class="text-[9px] font-black uppercase tracking-[0.18em] mb-1" :class="tile.tagClass">
              {{ tile.tag }}
            </div>
            <h3 class="text-base md:text-lg font-black tracking-tight leading-tight" :class="tile.titleClass">
              {{ tile.name }}
            </h3>
            <p v-if="tile.w >= 4" class="text-[11px] font-semibold mt-1 line-clamp-1" :class="tile.descClass">
              {{ tile.desc }}
            </p>
          </div>
          
          <!-- RAMKA TRYBU EDYCJI -->
          <div v-if="isEditMode" class="absolute inset-0 border-2 border-dashed border-amber-400/70 rounded-[1.75rem] pointer-events-none z-20"></div>
        </div>
      </TransitionGroup>
    </div>

    <!-- ======================================================= -->
    <!-- DRAG CLONE (Z fizyką bezwładności - subtelny blob)      -->
    <!-- ======================================================= -->
    <div 
      v-if="dragState.activeId"
      class="fixed pointer-events-none z-[9999] rounded-[1.75rem] p-6 shadow-2xl overflow-hidden flex flex-col justify-between will-change-transform ring-2 ring-white/50"
      :class="[dragState.tile.bg, dragState.tile.border]"
      :style="{
        width: dragState.width + 'px',
        height: dragState.height + 'px',
        top: 0,
        left: 0,
        transform: `translate3d(${dragState.currX - dragState.offsetX}px, ${dragState.currY - dragState.offsetY}px, 0) scale(1.03) skew(${physics.currentSkewX}deg, ${physics.currentSkewY}deg) rotate(${physics.currentSkewX * 0.15}deg)`
      }"
    >
      <div 
        class="absolute -bottom-7 -right-7 pointer-events-none"
        :class="[dragState.tile.watermarkClass, dragState.tile.h >= 3 ? 'w-52 h-52' : 'w-36 h-36']"
      >
        <div v-if="dragState.tile.watermark" class="w-full h-full" v-html="dragState.tile.watermark"></div>
        <component v-else :is="iconMap[dragState.tile.id]" class="w-full h-full" :stroke-width="1.4" />
      </div>

      <div class="flex justify-between items-start relative z-10">
        <div class="w-11 h-11 rounded-2xl flex items-center justify-center" :class="dragState.tile.iconBg">
          <component :is="iconMap[dragState.tile.id]" class="w-5 h-5" :stroke-width="2" />
        </div>
      </div>

      <div class="relative z-10 mt-auto">
        <h3 class="text-lg font-black tracking-tight" :class="dragState.tile.titleClass">{{ dragState.tile.name }}</h3>
      </div>
    </div>

    <!-- ======================================================= -->
    <!-- CONTEXT MENU (Prawe kliknięcie - zmiana kształtu)       -->
    <!-- ======================================================= -->
    <div 
      v-if="contextMenu.show" 
      class="fixed z-[100000] bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col gap-1 w-52 animate-fadeIn" 
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }" 
      @click.stop
    >
      <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2.5 py-1.5 border-b border-slate-100 mb-1">Rozmiar kafla</div>
      <button @click="resizeTile(contextMenu.tileId, 3, 2)" class="text-left px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2.5">
        <div class="w-4 h-4 bg-slate-300 rounded"></div> Mały kwadrat (1/4)
      </button>
      <button @click="resizeTile(contextMenu.tileId, 4, 2)" class="text-left px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2.5">
        <div class="w-5 h-4 bg-slate-400 rounded"></div> Kompaktowy (1/3)
      </button>
      <button @click="resizeTile(contextMenu.tileId, 6, 2)" class="text-left px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2.5">
        <div class="w-6 h-4 bg-slate-500 rounded"></div> Średni poziomy (1/2)
      </button>
      <button @click="resizeTile(contextMenu.tileId, 6, 3)" class="text-left px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2.5">
        <div class="w-6 h-6 bg-[#58b347] rounded"></div> Duży Hero (1/2)
      </button>
      <button @click="resizeTile(contextMenu.tileId, 12, 2)" class="text-left px-2.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2.5">
        <div class="w-8 h-4 bg-slate-700 rounded"></div> Pełna szerokość
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { 
  Zap, Map, Calendar, Package, Building2, 
  CreditCard, Users, PlugZap, FileText, Settings 
} from 'lucide-vue-next'

const iconMap = {
  tickets: Zap,
  map: Map,
  schedule: Calendar,
  storage: Package,
  clients: Building2,
  billings: CreditCard,
  technicians: Users,
  stations: PlugZap, // albo BatteryCharging
  offers: FileText,
  settings: Settings
}


const props = defineProps({
  userRole: String,
  userEmail: String
})

const emit = defineEmits(['toggle-ui', 'switch-view', 'logout'])

// --- LOGO EKOEN JAKO ZNAK WODNY ---
const ekoenWatermark = `<svg viewBox="0 0 200 200" fill="none" class="w-full h-full"><path d="M100 10C149.706 10 190 50.2944 190 100C190 149.706 149.706 190 100 190C50.2944 190 10 149.706 10 100C10 50.2944 50.2944 10 100 10Z" stroke="currentColor" stroke-width="10"/><circle cx="100" cy="100" r="68" fill="currentColor" fill-opacity="0.2"/><path d="M85 70H135V85H85V70ZM65 92.5H115V107.5H65V92.5ZM85 115H135V130H85V115Z" fill="currentColor"/></svg>`

// --- KATALOG KAFELKÓW (DESIGN + DOMYŚLNE WYMIARY) ---
const defaultTiles = [
  {
    id: 'tickets', w: 6, h: 3, isDark: true,
    tag: 'Operacje Live', name: 'Zgłoszenia', desc: 'Centrum awarii, Axon Connect i zgłoszenia wewnętrzne',
    badge: 'Aktywne', badgeClass: 'bg-white/20 text-white border border-white/25',
    bg: 'bg-gradient-to-br from-[#58b347] via-[#469c36] to-[#27631e]',
    border: 'border border-white/15 ring-1 ring-inset ring-white/20',
    shadow: 'shadow-[0_14px_32px_-10px_rgba(88,179,71,0.5)]',
    glow: 'bg-emerald-200/35',
    iconBg: 'bg-white/20 text-white backdrop-blur-md border border-white/25',
    titleClass: 'text-white', descClass: 'text-emerald-50/85', tagClass: 'text-emerald-100/90',
    watermarkClass: 'text-white/[0.15]',
    watermark: ekoenWatermark,
    icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`
  },
  {
    id: 'map', w: 6, h: 3, isDark: true,
    tag: 'Geolokalizacja', name: 'Mapa Systemu', desc: 'Podgląd stacji, stref techników i obszarów analitycznych',
    bg: 'bg-gradient-to-br from-[#0f1f16] via-[#152b1e] to-[#0a140e]',
    border: 'border border-[#58b347]/30 ring-1 ring-inset ring-white/10',
    shadow: 'shadow-[0_14px_32px_-10px_rgba(15,31,22,0.55)]',
    glow: 'bg-[#58b347]/30',
    iconBg: 'bg-[#58b347]/20 text-[#72e85d] border border-[#58b347]/35',
    titleClass: 'text-white', descClass: 'text-emerald-100/60', tagClass: 'text-[#72e85d]',
    watermarkClass: 'text-[#58b347]/[0.10]',
    icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>`
  },
  {
    id: 'schedule', w: 12, h: 2, isDark: true,
    tag: 'Planowanie', name: 'Harmonogram', desc: 'Kalendarz wizyt serwisowych i dyspozycja zespołu w terenie',
    bg: 'bg-gradient-to-r from-[#1b3a28] via-[#244f36] to-[#2f6b47]',
    border: 'border border-[#58b347]/25 ring-1 ring-inset ring-white/10',
    shadow: 'shadow-[0_12px_28px_-10px_rgba(27,58,40,0.45)]',
    glow: 'bg-[#58b347]/25',
    iconBg: 'bg-white/15 text-emerald-100 border border-white/20',
    titleClass: 'text-white', descClass: 'text-emerald-100/75', tagClass: 'text-[#86ef74]',
    watermarkClass: 'text-white/[0.08]',
    icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
  },
  {
    id: 'storage', w: 4, h: 2, isDark: false,
    tag: 'Logistyka', name: 'Magazyn', desc: 'Stany części, przesunięcia i flota',
    bg: 'bg-gradient-to-br from-[#f2fbf0] via-[#e4f6e0] to-[#cdebc7]',
    border: 'border border-[#58b347]/35 hover:border-[#58b347]',
    shadow: 'shadow-[0_8px_20px_-8px_rgba(88,179,71,0.2)]',
    glow: 'bg-[#58b347]/20',
    iconBg: 'bg-[#58b347] text-white shadow-sm shadow-[#58b347]/30',
    titleClass: 'text-[#142919]', descClass: 'text-[#284d31]/75', tagClass: 'text-[#3c852e]',
    watermarkClass: 'text-[#3c852e]/[0.11]',
    icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
  },
  {
    id: 'clients', w: 4, h: 2, isDark: false,
    tag: 'Baza B2B', name: 'Klienci CRM', desc: 'Kontrahenci, umowy SLA i kontakty',
    bg: 'bg-gradient-to-br from-white via-[#f3f9f2] to-[#dcefd9]',
    border: 'border border-[#58b347]/30 hover:border-[#58b347]',
    shadow: 'shadow-[0_8px_20px_-8px_rgba(40,77,49,0.14)]',
    glow: 'bg-emerald-400/20',
    iconBg: 'bg-[#2c6623] text-white shadow-sm',
    titleClass: 'text-slate-900', descClass: 'text-slate-600', tagClass: 'text-[#3c852e]',
    watermarkClass: 'text-[#2c6623]/[0.09]',
    icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`
  },
  {
    id: 'billings', w: 4, h: 2, isDark: false,
    tag: 'Finanse', name: 'Rozliczenia', desc: 'Cenniki, raporty i fakturowanie EUR',
    bg: 'bg-gradient-to-br from-[#ecfdf5] via-[#d8f5e7] to-[#bdebd5]',
    border: 'border border-emerald-500/30 hover:border-emerald-600',
    shadow: 'shadow-[0_8px_20px_-8px_rgba(16,185,129,0.2)]',
    glow: 'bg-emerald-400/25',
    iconBg: 'bg-emerald-700 text-white shadow-sm',
    titleClass: 'text-emerald-950', descClass: 'text-emerald-900/70', tagClass: 'text-emerald-700',
    watermarkClass: 'text-emerald-800/[0.10]',
    icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`
  },
  {
    id: 'technicians', w: 3, h: 2, isDark: false,
    tag: 'Zespół', name: 'Technicy', desc: 'Kadry, SEP i pojazdy',
    bg: 'bg-gradient-to-br from-[#f8faf8] via-[#edf3ed] to-[#d9e5da]',
    border: 'border border-slate-300/90 hover:border-[#58b347]/60',
    shadow: 'shadow-sm',
    glow: 'bg-[#58b347]/15',
    iconBg: 'bg-[#1e3a29] text-white shadow-sm',
    titleClass: 'text-slate-900', descClass: 'text-slate-600', tagClass: 'text-[#3c852e]',
    watermarkClass: 'text-[#1e3a29]/[0.08]',
    icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path stroke-linecap="round" stroke-linejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`
  },
  {
    id: 'stations', w: 3, h: 2, isDark: true,
    tag: 'Infrastruktura', name: 'Stacje', desc: 'Baza ładowarek QP',
    bg: 'bg-gradient-to-br from-[#37782b] via-[#2c6322] to-[#1d4516]',
    border: 'border border-white/15 ring-1 ring-inset ring-white/15',
    shadow: 'shadow-[0_10px_24px_-8px_rgba(44,99,34,0.45)]',
    glow: 'bg-[#86ef74]/25',
    iconBg: 'bg-white/20 text-white border border-white/20',
    titleClass: 'text-white', descClass: 'text-emerald-100/80', tagClass: 'text-[#a3f593]',
    watermarkClass: 'text-white/[0.12]',
    icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 20h10M10 20V5a2 2 0 012-2h4a2 2 0 012 2v15M18 10h2a1 1 0 011 1v4a2 2 0 01-2 2h-1M13 8l-2 4h3l-2 4"/></svg>`
  },
  {
    id: 'offers', w: 3, h: 2, isDark: false,
    tag: 'Sprzedaż', name: 'Oferty', desc: 'Wyceny i dokumenty',
    bg: 'bg-gradient-to-br from-white via-[#f0f7ef] to-[#d6ead3]',
    border: 'border border-[#58b347]/30 hover:border-[#58b347]',
    shadow: 'shadow-sm',
    glow: 'bg-[#58b347]/20',
    iconBg: 'bg-[#469c36] text-white shadow-sm',
    titleClass: 'text-slate-900', descClass: 'text-slate-600', tagClass: 'text-[#3c852e]',
    watermarkClass: 'text-[#469c36]/[0.10]',
    icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
  },
  {
    id: 'settings', w: 3, h: 2, isDark: true,
    tag: 'System', name: 'Ustawienia', desc: 'Motyw i preferencje',
    bg: 'bg-gradient-to-br from-[#1f2924] via-[#18211c] to-[#101713]',
    border: 'border border-white/10 ring-1 ring-inset ring-white/5',
    shadow: 'shadow-[0_10px_24px_-8px_rgba(16,23,19,0.45)]',
    glow: 'bg-[#58b347]/20',
    iconBg: 'bg-white/10 text-emerald-100 border border-white/15',
    titleClass: 'text-white', descClass: 'text-slate-300/75', tagClass: 'text-[#6ee759]/80',
    watermarkClass: 'text-white/[0.07]',
    icon: `<svg class="w-full h-full" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`
  }
]

const layout = ref([])

// Zapisujemy tylko układ (id, w, h), żeby wygląd zawsze był świeży z kodu
const saveLayout = () => {
  const minimal = layout.value.map(({ id, w, h }) => ({ id, w, h }))
  localStorage.setItem('ekoen_bento_layout', JSON.stringify(minimal))
}

const loadLayout = () => {
  const catalog = Object.fromEntries(defaultTiles.map(t => [t.id, t]))
  const savedRaw = localStorage.getItem('ekoen_bento_layout')
  if (savedRaw) {
    try {
      const saved = JSON.parse(savedRaw)
      const merged = saved
        .filter(item => catalog[item.id])
        .map(item => ({ ...catalog[item.id], w: item.w, h: item.h }))
      // Dodaj ewentualne nowe moduły, których nie było w zapisie
      const existingIds = new Set(merged.map(m => m.id))
      defaultTiles.forEach(t => {
        if (!existingIds.has(t.id)) merged.push({ ...t })
      })
      layout.value = merged
      return
    } catch (e) {}
  }
  layout.value = defaultTiles.map(t => ({ ...t }))
}

const resetLayout = () => {
  localStorage.removeItem('ekoen_bento_layout')
  layout.value = defaultTiles.map(t => ({ ...t }))
  contextMenu.show = false
}

// --- RESPONSYWNOŚĆ KAFELKÓW (TELEFON / TABLET) ---
const isMobile = ref(window.innerWidth < 768)
const handleViewportResize = () => {
  isMobile.value = window.innerWidth < 768
}

const getTileStyle = (tile) => {
  if (isMobile.value) {
    // Na telefonie: duże kafle (w >= 6) na całą szerokość, mniejsze po 2 w rzędzie
    return {
      gridColumn: tile.w >= 6 ? 'span 12' : 'span 6',
      gridRow: 'span 2'
    }
  }
  return {
    gridColumn: `span ${tile.w}`,
    gridRow: `span ${tile.h}`
  }
}

onMounted(() => {
  loadLayout()
  window.addEventListener('resize', handleViewportResize)
})

// --- TRYB EDYCJI ---
const isEditMode = ref(false)
const contextMenu = reactive({ show: false, x: 0, y: 0, tileId: null })

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  contextMenu.show = false
  if (!isEditMode.value) saveLayout()
}

const disableEditMode = () => { contextMenu.show = false }

const openTileSettings = (tile, e) => {
  if (!isEditMode.value) isEditMode.value = true
  contextMenu.tileId = tile.id
  // Zabezpieczenie, żeby menu nie uciekło poza krawędź ekranu
  contextMenu.x = Math.min(e.clientX, window.innerWidth - 220)
  contextMenu.y = Math.min(e.clientY, window.innerHeight - 230)
  contextMenu.show = true
}

const resizeTile = (id, newW, newH) => {
  const t = layout.value.find(x => x.id === id)
  if (t) { t.w = newW; t.h = newH }
  contextMenu.show = false
  saveLayout()
}

const handleTileClick = (tile) => {
  if (isEditMode.value) return
  emit('switch-view', tile.id)
}

// ==============================================================
// SILNIK JELLY PHYSICS (SPRING-MASS-DAMPER - SUBTELNY BLOB)
// ==============================================================
const dragState = reactive({
  activeId: null, tile: null,
  currX: 0, currY: 0,
  offsetX: 0, offsetY: 0,
  width: 0, height: 0,
  lastTime: 0
})

const physics = reactive({
  currentSkewX: 0, currentSkewY: 0,
  targetSkewX: 0, targetSkewY: 0,
  velocityX: 0, velocityY: 0,
  isReleasing: false
})

let rafId = null

const onPointerDown = (tile, e) => {
  if (!isEditMode.value || e.button !== 0) return
  e.preventDefault()
  e.target.setPointerCapture(e.pointerId)
  
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  
  dragState.tile = tile
  dragState.activeId = tile.id
  dragState.width = rect.width
  dragState.height = rect.height
  dragState.offsetX = e.clientX - rect.left
  dragState.offsetY = e.clientY - rect.top
  dragState.currX = e.clientX
  dragState.currY = e.clientY
  dragState.lastTime = performance.now()

  physics.currentSkewX = 0; physics.currentSkewY = 0
  physics.targetSkewX = 0; physics.targetSkewY = 0
  physics.velocityX = 0; physics.velocityY = 0
  physics.isReleasing = false

  window.addEventListener('pointermove', onPointerMove, { passive: false })
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
  
  physicsLoop()
}

const onPointerMove = (e) => {
  if (!dragState.activeId) return
  e.preventDefault()
  
  const now = performance.now()
  const dt = Math.max(1, now - dragState.lastTime)
  
  const dx = e.clientX - dragState.currX
  const dy = e.clientY - dragState.currY
  
  dragState.currX = e.clientX
  dragState.currY = e.clientY
  dragState.lastTime = now

  let tX = (dx / dt) * -6
  let tY = (dy / dt) * 6
  
  physics.targetSkewX = Math.max(-8, Math.min(8, tX))
  physics.targetSkewY = Math.max(-8, Math.min(8, tY))

  const elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY)
  const targetTileEl = elementsUnderCursor.find(el => el.classList.contains('bento-tile') && el.dataset.id !== dragState.activeId)
  
  if (targetTileEl) {
    swapTiles(dragState.activeId, targetTileEl.dataset.id)
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
  if (!dragState.activeId && !physics.isReleasing) return
  
  if (physics.isReleasing) {
    physics.targetSkewX = 0
    physics.targetSkewY = 0
  }

  const tension = 0.16
  const friction = 0.65

  const ax = (physics.targetSkewX - physics.currentSkewX) * tension
  const ay = (physics.targetSkewY - physics.currentSkewY) * tension

  physics.velocityX = (physics.velocityX + ax) * friction
  physics.velocityY = (physics.velocityY + ay) * friction

  physics.currentSkewX += physics.velocityX
  physics.currentSkewY += physics.velocityY

  physics.targetSkewX *= 0.8
  physics.targetSkewY *= 0.8

  if (physics.isReleasing && Math.abs(physics.velocityX) < 0.08 && Math.abs(physics.currentSkewX) < 0.08) {
    physics.isReleasing = false
    dragState.activeId = null
    dragState.tile = null
    saveLayout()
    return
  }

  rafId = requestAnimationFrame(physicsLoop)
}

const onPointerUp = () => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  
  physics.isReleasing = true
}

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  window.removeEventListener('resize', handleViewportResize)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.35); border-radius: 10px; }

.animate-fadeIn { animation: fadeIn 0.18s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

.bento-move {
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
</style>