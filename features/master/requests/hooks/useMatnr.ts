import { useAuth } from "@/features/auth/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { MatnrService } from "../services/product.service";

export const useMatnr = (serviceTypeId: number, tovarId: number) => {
  const { user } = useAuth();
  const masterId = user?.userInfo.currentStaff?.staffId;
  const bukrs = user?.userInfo?.bukrs?.[0]?.id;
  const branchId = user?.userInfo?.service?.[bukrs ?? ""]?.[0]?.value;

  const { data = [], isLoading } = useQuery({
    queryKey: ["get-matnr-list", masterId, serviceTypeId],
    queryFn: () =>
      MatnrService.getMatnrList(
        bukrs!,
        branchId!,
        tovarId!,
        masterId!,
        serviceTypeId,
      ),
    retry: 1,
    enabled: !!masterId && !!bukrs && !!branchId && !!serviceTypeId,
  });
  return { data, isLoading };
};
