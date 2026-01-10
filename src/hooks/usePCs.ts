import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/tauri";

export const usePCsByRace = (raceId: number) =>
  useQuery({
    queryKey: ["pcs", raceId],
    queryFn: () => api.getPcsByRace(raceId),
    enabled: raceId > 0,
  });

export const usePC = (id: number) =>
  useQuery({
    queryKey: ["pc", id],
    queryFn: () => api.getPc(id),
    enabled: id > 0,
  });

export const useCreatePC = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createPc,
    onSuccess: (newPc) => {
      queryClient.invalidateQueries({ queryKey: ["pcs", newPc.race_id] });
    },
  });
};

export const useDeletePC = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deletePc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pcs"] });
    },
  });
};

export const useGetNextPC = () => {
  return useMutation({
    mutationFn: api.getNextPc,
  });
};

export const useCreateNextPC = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createNextPc,
    onSuccess: (newPc) => {
      queryClient.invalidateQueries({ queryKey: ["pcs", newPc.race_id] });
    },
  });
};
