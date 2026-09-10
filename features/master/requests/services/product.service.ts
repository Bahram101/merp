import { apiInstance } from "@/services/api/auth-instance";

export const MatnrService = {
  async getMatnrList(
    bukrs: number,
    branchId: number,
    tovarId: number,
    masterId: number,
    serviceTypeId: number,
  ) {
    try {
      const { data } = await apiInstance.get(
        "/api/service/smcs/getMatnrPriceList",
        {
          params: {
            bukrs,
            branchId,
            tovarId,
            masterId,
            serviceTypeId,
          },
        },
      );
      return data.data;
    } catch (e) {
      throw e;
    }
  },
};
