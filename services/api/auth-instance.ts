import { getAccessToken } from "@/features/auth/services/auth.storage";
import axios from "axios";
import qs from "qs";
import { SERVER_URL } from "./config";
import { setupAuthInterceptor } from "./setupAuthInterceptor";

export const apiInstance = axios.create({
  baseURL: SERVER_URL,
});

apiInstance.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const query = qs.stringify(config.params, { arrayFormat: "repeat" });
  const fullUrl = `${config.baseURL}${config.url}?${query}`;
  console.log("fullUrl", fullUrl);

  return config;
});

setupAuthInterceptor(apiInstance);
