import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AccountabilityService } from "../services/accountabilityRequests.service";
import { AssignedMaterialsService } from "../services/assignedMaterials.service";
import { CreateAccountabilityPayload } from "../types";

export const useAssignedMaterials = <T = unknown>() => {
  const { user } = useAuth();
  const masterId = user?.userInfo.currentStaff?.staffId;
  const {
    data = [],
    isLoading,
    refetch: refetchAccountibilities,
  } = useQuery<T>({
    queryKey: ["get-assigned-materials", masterId],
    queryFn: () => AssignedMaterialsService.getAssignedMaterials(masterId, 3),
    retry: 1,
    enabled: !!masterId,
  });
  return { data, isLoading, refetchAccountibilities };
};

export const useAccountabilityRequests = <T = unknown>(statusId: number) => {
  const { user } = useAuth();
  const masterId = user?.userInfo.currentStaff?.staffId;
  const {
    data: statusesData = [],
    isLoading: isStatusesLoading,
    refetch: refetchStatuses,
  } = useQuery<T>({
    queryKey: ["get-accountability-requests", statusId],
    queryFn: () =>
      AccountabilityService.getAccountabilityRequestsByStatus(
        statusId,
        masterId,
      ),
    retry: 1,
    enabled: !!statusId,
  });
  return { statusesData, isStatusesLoading, refetchStatuses };
};

export const useAccountabilityRequestDetail = (id: number) => {
  const {
    data: accountabilityReqDetail,
    isLoading: isLoadingAccReqDetail,
    refetch: refetchAccReqDetail,
  } = useQuery({
    queryKey: ["get-accountability-request-detail", id],
    queryFn: () => AccountabilityService.getAccountibilityRequestById(id),
    retry: 1,
    enabled: !!id,
  });
  return {
    accountabilityReqDetail,
    isLoadingAccReqDetail,
    refetchAccReqDetail,
  };
};

export const useCreateAccountability = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: createAccountability, isPending: isCreating } =
    useMutation({
      mutationKey: ["create-accountability"],
      mutationFn: (payload: CreateAccountabilityPayload) =>
        AccountabilityService.createAccountability(payload),
      retry: false,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["get-accountability-requests", 1],
        });
      },
    });
  return { createAccountability, isCreating };
};
