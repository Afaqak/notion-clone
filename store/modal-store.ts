import { create } from "zustand";

interface ModalState {
  type: string;
  data: any;
  setTypeAndData: (newType: string, newData?: any) => void;
}

const useModalStore = create<ModalState>((set) => ({
  type: "",
  data: {},
  setTypeAndData: (newType, newData) => set({ type: newType, data: newData }),
}));

export default useModalStore;
