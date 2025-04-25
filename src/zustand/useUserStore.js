import React from 'react'
import { create } from 'zustand';

const useUserStore = create((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    clearUser: (user) => set({ user: null })
}))

export default useUserStore;
