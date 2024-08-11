import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

const useArchiveOpen = create<ModalState>((set) => ({
  isOpen: false,
  setOpen: (isOpen) => set({ isOpen }),
}));

export default useArchiveOpen;
