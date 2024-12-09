import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TUser } from "@/types/user";

// Define the user state interface
interface userState {
  user: TUser | null;
  setUser: (user: TUser | null) => void;
}

// Create the user store
const useUserStore = create<userState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: TUser | null) => set({ user }),
    }),
    {
      name: "user", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // specify the storage mechanism
    }
  )
);

export default useUserStore;
