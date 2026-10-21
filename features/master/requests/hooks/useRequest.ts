import { useAuth } from "@/features/auth/hooks/useAuth";
import { getCurrentMonthStart } from "@/utils/date";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApplicationStatusId } from "../constants/status";
import { RequestService } from "../services/request.service";

export const useRequests = (status: string, from?: string, to?: string) => {
  const { user } = useAuth();
  const masterId = user?.userInfo.currentStaff.staffId;
  const bukrs = user?.userInfo.bukrs[0].id;

  const {
    data: requests = [],
    isLoading: isLoadingRequests,
    // refetch: refetchRequests,
    refetch,
  } = useQuery({
    queryKey: ["get-master-requests", masterId, status, from, to],
    queryFn: () => RequestService.getMasterRequests(masterId!, status, bukrs),
    enabled: !!masterId,
    staleTime: 0,
    retry: 1,
  });
  return { requests, isLoadingRequests, refetch };
};

export const useRequestDetail = (id: number) => {
  const {
    data: requestDetail,
    isLoading: isLoadingReqDetail,
    refetch: refetchRequestDetail,
  } = useQuery({
    queryKey: ["get-master-request-details", id],
    queryFn: () => RequestService.getMasterRequestDetail(id),
    retry: 1,
  });

  return {
    requestDetail,
    isLoadingReqDetail,
    refetchRequestDetail,
  };
};

export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateRequestStatus, isPending: isLoading } =
    useMutation({
      mutationKey: ["update-request-status"],
      mutationFn: ({ reqId, statusId }: { reqId: number; statusId: number }) =>
        RequestService.updateRequestStatus(reqId, statusId),
      retry: false,
      onSuccess: ({ data: { application } }) => {
        queryClient.setQueryData(
          ["get-master-request-details", application.applicationNumber],
          (old: any) => ({
            ...old,
            applicationStatusId: application.applicationStatusId,
          }),
        );
        queryClient.invalidateQueries({
          queryKey: ["get-master-requests"],
        });
      },
    });
  return { updateRequestStatus, isLoading };
};

export const useDoneRequests = ({ enabled }: { enabled: boolean }) => {
  const { user } = useAuth();
  const masterId = user?.userInfo.currentStaff.staffId;

  const {
    data: doneRequests = [],
    isLoading: isLoadingDoneRequests,
    refetch: refetchDoneRequests,
  } = useQuery({
    queryKey: ["get-master-done-requests", masterId],
    queryFn: () => RequestService.getMastersDoneRequests(masterId!),
    retry: false,
    enabled,
  });
  return { doneRequests, isLoadingDoneRequests, refetchDoneRequests };
};

export const useDoneRequestDetail = (id: number) => {
  const {
    data: doneRequestDetail,
    isLoading: isLoadingDoneReqDetail,
    refetch: refetchDoneReqDetail,
  } = useQuery({
    queryKey: ["get-done-request-detail", id],
    queryFn: () => RequestService.getMasterDoneRequestDetail(id),
    retry: false,
    enabled: !!id,
  });

  return {
    doneRequestDetail,
    isLoadingDoneReqDetail,
    refetchDoneReqDetail,
  };
};

export const useCompletedSummary = ({ enabled }: { enabled: boolean }) => {
  const { user } = useAuth();
  const from = getCurrentMonthStart();
  const masterId = user?.userInfo.currentStaff.staffId;
  const bukrs = user?.userInfo.bukrs[0].id;

  const {
    data = [],
    refetch: refetchCompletedRequests,
    isLoading,
  } = useQuery({
    queryKey: ["get-completed-requests", masterId],
    queryFn: () =>
      RequestService.getCompletedRequests(
        bukrs,
        String(ApplicationStatusId.COMPLETED),
        masterId!,
        from,
      ),
    retry: false,
    enabled,
  });

  return { completedRequests: data, refetchCompletedRequests, isLoading };
};
