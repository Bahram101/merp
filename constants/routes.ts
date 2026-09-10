export const ROUTES = {
  REQUESTS: "/(apps)/master/(tabs)/requests",
  REQUEST_ASSIGNED: "/(apps)/master/(tabs)/requests/[appNumber]",
  REQUEST_DONE: "/(apps)/master/(tabs)/requests/done-requests/[id]",
  WORK: "/(apps)/master/(tabs)/requests/[appNumber]/work",
  PAYMENT: "/(apps)/master/(tabs)/requests/[appNumber]/work/payment",
  QR_PAYMENT: "/(apps)/master/(tabs)/requests/[appNumber]/work/qr-payment",
  PAYMENT_SUCCESS: "/(apps)/master/payment-success",
  REQUEST_HISTORY: "/(apps)/master/(tabs)/requests/[appNumber]/history",
  REQUEST_HISTORY_DETAIL:
    "/(apps)/master/(tabs)/requests/[appNumber]/history/[serviceId]",
  ACCOUNTABILITY_DETAIL: "/(apps)/master/(tabs)/accountability/[id]",
  ACCOUNTABILITY_CREATE: "/(apps)/master/(tabs)/accountability/create-request",
} as const;
