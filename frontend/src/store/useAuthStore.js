import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

import toast from "react-hot-toast"

export const useAuthStore = create((set,get) => ({
authUser:null,
isSigningUp:false,
isLogingingIp:false,
isUpdatingProfile:false,
isCheckingAuth:true,



/* ================= checkAuth ================= */
checkAuth: async () => {
  set({ isCheckingAuth: true });

  try {
    const res = await axiosInstance.get("/auth/check");
    set({ authUser: res.data });
    return true;
  } catch (error) {
    set({ authUser: null });
    return false;
  } finally {
    set({ isCheckingAuth: false });
  }
},

/* ================= signup ================= */
signup:async (data) => {
    set({isSigningUp :true});
    try {
        const res = await axiosInstance.post("/auth/signup",data);
        set({authUser :res.data});
        toast.success("Account created Succesfully");
    }  catch (error) {
      toast.error(error?.response?.data?.message ?? "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
},
/* ================= login================= */
login:async (data) => {
    set({isLogingingIp:trur});
    try {
        const res = await axiosInstance.post("/auth/login",data);
        set({authUser:res.data });
        toast.success("loging is Succesfully")

    } catch (error) {
         toast.error(error?.response?.data?.message ?? "Signup failed");
    } finally {
      set({ isLogingingIp: false });
}
},
/* ================= logout================= */
logout:async (data) => {
    try {
        await axiosInstance.post("/auth/logout");
        set({authUser:null})
         toast.success("Logged out successfully");
    } catch (error) {
         toast.error("Logout failed");
    }
},
/* ================= updateProfile  ================= */
updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
})


)