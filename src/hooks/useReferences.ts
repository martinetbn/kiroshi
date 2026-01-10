import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/tauri";
import type { CreateReferenceRequest, UpdateReferenceRequest } from "../types";

export const useReferencesByPC = (pcId: number) =>
  useQuery({
    queryKey: ["references", pcId],
    queryFn: () => api.getReferencesByPc(pcId),
    enabled: pcId > 0,
  });

export const useCreateReference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateReferenceRequest) => api.createReference(request),
    onSuccess: (newRef) => {
      queryClient.invalidateQueries({ queryKey: ["references", newRef.pc_id] });
    },
  });
};

export const useUpdateReference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateReferenceRequest) => api.updateReference(request),
    onSuccess: (updatedRef) => {
      queryClient.invalidateQueries({
        queryKey: ["references", updatedRef.pc_id],
      });
    },
  });
};

export const useDeleteReference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteReference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["references"] });
    },
  });
};

export const useToggleControlZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.toggleControlZone,
    onSuccess: (updatedRef) => {
      queryClient.invalidateQueries({
        queryKey: ["references", updatedRef.pc_id],
      });
    },
  });
};
