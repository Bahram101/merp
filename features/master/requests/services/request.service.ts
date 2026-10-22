import { parseServiceError } from "@/services/api/error";
import { apiInstance } from "@/services/api/auth-instance";
import { getCurrentMonthStart, getToday } from "@/utils/date";
import { ApplicationStatusId } from "../constants/status";

export const RequestService = {
  async getMasterRequests(masterId: number, status: string, bukrs?: number) {
    try {
      const { data } = await apiInstance.get("/api/service/smappl/appList", {
        params: {
          bukrs,
          appStatusIds: status,
          masterId,
          ...((status === String(ApplicationStatusId.COMPLETED) ||
            status === String(ApplicationStatusId.DONE)) && {
            dateOpenAt:
              status === String(ApplicationStatusId.COMPLETED)
                ? getCurrentMonthStart()
                : getToday(),
            dateOpenTo: getToday(),
          }),
        },
      });
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  async getMasterRequestDetail(reqId: number) {
    try {
      const { data } = await apiInstance.get(`/api/service/smecam-ma/${reqId}`);
      return data.data.application;
    } catch (error) {
      throw error;
    }
  },

  async getMastersDoneRequests(masterId: number) {
    try {
      const { data } = await apiInstance.get(
        "/api/service/smcs/master/draft/my-list",
        {
          params: {
            masterId,
          },
        },
      );
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  async getMasterDoneRequestDetail(id: number) {
    try {
      const { data } = await apiInstance.get(
        `/api/service/smcs/master/draft/${id}`,
      );
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  async updateRequestStatus(reqId: number, statusId: number) {
    try {
      const { data } = await apiInstance.put(
        "/api/service/smecam-ma-status-update",
        {},
        {
          params: {
            id: reqId,
            statusId: statusId,
          },
        },
      );
      return data;
    } catch (e: any) {
      throw new Error(parseServiceError(e));
    }
  },

};
