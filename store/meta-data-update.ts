import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  _id: string;
  emoji: string;
  title: string;
  setData: (isOpen: boolean, _id: string, emoji: string, title: string) => void;
}

const useMetaDataUpdate = create<ModalState>((set) => ({
  isOpen: false,
  emoji: "",
  _id: "",
  title: "",
  setData: (isOpen, _id, title, emoji) => set({ isOpen, _id, title, emoji }),
}));

export default useMetaDataUpdate;
