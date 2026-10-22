import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApplicationStatusId } from "../constants/status";
import { RequestService } from "../services/request.service";

export const MASTER_REQUESTS_QUERY_KEY = "get-master-requests";
export const MASTER_DONE_REQUESTS_QUERY_KEY = "get-master-done-requests";

export const useRequests = (status: string, enabled: boolean = true) => {
  const { user } = useAuth();
  const masterId = user?.userInfo.currentStaff.staffId;
  const bukrs = user?.userInfo.bukrs[0].id;

  const {
    data: requests = [],
    isLoading: isLoadingRequests,
    refetch,
  } = useQuery({
    queryKey: [MASTER_REQUESTS_QUERY_KEY, masterId, status],
    queryFn: () => RequestService.getMasterRequests(masterId!, status, bukrs),
    enabled: !!masterId && enabled,
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
        const activeStatusIds = [
          ApplicationStatusId.ASSIGNED,
          ApplicationStatusId.ACCEPTED,
          ApplicationStatusId.ARRIVED,
        ].map(String);

        queryClient.invalidateQueries({
          predicate: (query) => {
            if (query.queryKey[0] !== MASTER_REQUESTS_QUERY_KEY) return false;
            const status = query.queryKey[2];
            return (
              typeof status === "string" &&
              status.split(",").some((id) => activeStatusIds.includes(id))
            );
          },
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
    queryKey: [MASTER_DONE_REQUESTS_QUERY_KEY, masterId],
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
  const {
    requests: completedRequests,
    isLoadingRequests: isLoading,
    refetch: refetchCompletedRequests,
  } = useRequests(String(ApplicationStatusId.COMPLETED), enabled);

  return { completedRequests, refetchCompletedRequests, isLoading };
};
