import { create } from "zustand";

export type TLocation = "notes" | "favorites" | "trash";

type TLocationState = {
  location: TLocation;
  setLocation: (location: TLocation) => void;
};

export const useLocationStore = create<TLocationState>((set) => ({
  location: "notes",
  setLocation: (location: TLocation) => set({ location }),
}));
