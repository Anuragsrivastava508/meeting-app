// import axios from "axios"

// export const axiosInstance = axios.create({
//     baseURL:"http://localhost:5001/api",
//      withCredentials:true,
// });

import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://meeting-app-lszi.vercel.app/api",
  withCredentials: true,
});