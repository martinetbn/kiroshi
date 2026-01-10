import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/tauri";

export const useRaces = () =>
  useQuery({
    queryKey: ["races"],
    queryFn: api.getAllRaces,
  });

export const useRace = (id: number) =>
  useQuery({
    queryKey: ["race", id],
    queryFn: () => api.getRace(id),
    enabled: id > 0,
  });

export const useCreateRace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createRace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["races"] });
    },
  });
};

export const useUpdateRace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      api.updateRace(id, name),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["races"] });
      queryClient.invalidateQueries({ queryKey: ["race", variables.id] });
    },
  });
};

export const useDeleteRace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteRace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["races"] });
    },
  });
};
