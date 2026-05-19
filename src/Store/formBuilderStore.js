import { create } from "zustand";

export const useformBuilderStore = create((set) => ({
    searchFiltervalue: [],
    setSearchFilterValue: (value) => set({ searchFiltervalue: value }),
    dateRangeFiltervalue: [],
    setDateRangeFilterValue: (value) => set({ dateRangeFiltervalue: value }),
    drapdownFiltervalue: [],
    setDrapdownFilterValue: (value) => set({ drapdownFiltervalue: value }),
    multiSelectfiltervalue: [],
    setMultiSelectFilterValue: (value) => set({ multiSelectfiltervalue: value }),  
}));
