import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPatients, fetchPatient, updatePatient } from "@/services/patientApi";

export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: fetchPatients,
  });
}

export function usePatient(id: number | null) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => fetchPatient(id!),
    enabled: id !== null,
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
