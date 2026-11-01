<template>
  <div class="h-full w-full flex flex-col items-center justify-center bg-slate-50 p-8 font-sans">
    <div class="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col items-center max-w-md text-center relative overflow-hidden">
      
      <!-- Tło dekoracyjne -->
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-amber-50 rounded-full blur-3xl opacity-60"></div>
      
      <!-- Ikona Budowy -->
      <div class="relative w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-md shadow-amber-500/20">
        <svg class="w-10 h-10 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      </div>
      
      <h2 class="text-2xl font-black text-slate-800 tracking-tight mb-3">Moduł Ofert</h2>
      <p class="text-[13px] font-medium text-slate-500 leading-relaxed">
        Ta sekcja jest obecnie w fazie projektowania. Wkrótce pojawi się tutaj generator ofert oraz menedżer wycen dla klientów.
      </p>
      
      <div class="mt-8 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Moduł w budowie 🚧
        </span>
      </div>
    </div>
  </div>
</template>