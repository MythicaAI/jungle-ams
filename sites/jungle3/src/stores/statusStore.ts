import {create} from "zustand";

interface StatusStore {
    success: string,
    errors: string[],
    warnings: string[],

    setSuccess: (message: string) => void;
    addError: (message: string) => void;
    addWarning: (message: string) => void;
    clear: () => void;
    hasStatus: () => boolean;
}

export const useStatusStore = create<StatusStore>((set, get) => ({
    success: '',
    errors: [],
    warnings: [],

    setSuccess: (message: string) => set({success: message, errors: [], warnings: []}),
    addError: (message: string) => set((state) => ({errors: [...state.errors, message]})),
    addWarning: (message: string) => set((state) => ({warnings: [...state.warnings, message]})),
    clear: () => set({success: '', errors: [], warnings: []}),
    hasStatus: () => {
        const state = get();
        return ((state.success && state.success != "")
            || state.errors.length > 0
            || state.warnings.length > 0);
    },
}));