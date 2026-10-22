import { useQuery } from "@tanstack/react-query";
import { HistoryService } from "../services/history.service";

export const useHistories = (contractNumber?: number) => {
  const { data: historyList = [], isFetching: isLoading } = useQuery({
    queryKey: ["get-history-list", contractNumber],
    queryFn: () => HistoryService.getHistoryList(contractNumber!),
    enabled: !!contractNumber,
    retry: 1,
  });
  return { historyList, isLoading };
};
export const useHistory = (serviceId: number) => {
  const { data: history = {}, isFetching: isLoading } = useQuery({
    queryKey: ["get-history", serviceId],
    queryFn: () => HistoryService.getHistory(serviceId),
    enabled: !!serviceId,
    retry: 1,
  });
  return { history, isLoading };
};
