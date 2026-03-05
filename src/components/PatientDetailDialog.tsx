import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { AlertTriangle, Save, Loader2 } from "lucide-react";
import { usePatient, useUpdatePatient } from "@/hooks/usePatients";
import { Patient } from "@/types/patient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { toast } from "sonner";

interface Props {
  patientId: number | null;
  onClose: () => void;
}

export default function PatientDetailDialog({ patientId, onClose }: Props) {
  const { data: patient, isLoading } = usePatient(patientId);
  const updateMutation = useUpdatePatient();

  const [familyName, setFamilyName] = useState("");
  const [givenName, setGivenName] = useState("");
  const [sex, setSex] = useState("");
  const [paramPage, setParamPage] = useState(1);
  const [paramPageSize, setParamPageSize] = useState(5);

  useEffect(() => {
    if (patient) {
      setFamilyName(patient.familyName);
      setGivenName(patient.givenName);
      setSex(patient.sex);
      setParamPage(1);
    }
  }, [patient]);

  const totalParamPages = useMemo(
    () => Math.max(1, Math.ceil((patient?.parameters.length ?? 0) / paramPageSize)),
    [patient, paramPageSize]
  );

  const safeParamPage = Math.min(paramPage, totalParamPages);

  const paginatedParams = useMemo(() => {
    if (!patient) return [];
    return patient.parameters.slice(
      (safeParamPage - 1) * paramPageSize,
      safeParamPage * paramPageSize
    );
  }, [patient, safeParamPage, paramPageSize]);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalParamPages <= 5) {
      for (let i = 1; i <= totalParamPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeParamPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, safeParamPage - 1); i <= Math.min(totalParamPages - 1, safeParamPage + 1); i++) {
        pages.push(i);
      }
      if (safeParamPage < totalParamPages - 2) pages.push("ellipsis");
      pages.push(totalParamPages);
    }
    return pages;
  };

  const handleSave = async () => {
    if (!patient) return;
    const updated: Patient = { ...patient, familyName, givenName, sex };
    try {
      await updateMutation.mutateAsync(updated);
      toast.success("Patient updated successfully");
      onClose();
    } catch {
      toast.error("Failed to update patient");
    }
  };

  const isOpen = patientId !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : patient ? (
          <div className="space-y-6">
            {/* Editable Fields */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Family Name</Label>
                <Input value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Given Name</Label>
                <Input value={givenName} onChange={(e) => setGivenName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Sex</Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="O">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Read-only info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Birth Date</Label>
                <p className="text-sm font-medium">{format(new Date(patient.birthDate), "MMMM d, yyyy")}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Patient ID</Label>
                <p className="text-sm font-medium">{patient.id}</p>
              </div>
            </div>

            {/* Parameters Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">
                  Parameters ({patient.parameters.length})
                </h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Rows:</span>
                  <Select value={String(paramPageSize)} onValueChange={(v) => { setParamPageSize(Number(v)); setParamPage(1); }}>
                    <SelectTrigger className="h-7 w-[60px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Alarm</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedParams.map((param) => (
                      <TableRow key={param.id}>
                        <TableCell className="font-mono text-xs">{param.name}</TableCell>
                        <TableCell>
                          {typeof param.value === "number" ? param.value.toFixed(4) : param.value}
                        </TableCell>
                        <TableCell>
                          {param.alarm ? (
                            <span className="inline-flex items-center gap-1 text-destructive">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span className="text-xs">Alarm</span>
                            </span>
                          ) : (
                            <Badge variant="secondary" className="text-xs">OK</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalParamPages > 1 && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {(safeParamPage - 1) * paramPageSize + 1}–{Math.min(safeParamPage * paramPageSize, patient.parameters.length)} of {patient.parameters.length}
                  </span>
                  <Pagination className="mx-0 w-auto justify-end">
                    <PaginationContent className="gap-0.5">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setParamPage((p) => Math.max(1, p - 1))}
                          className={safeParamPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {getPageNumbers().map((page, i) =>
                        page === "ellipsis" ? (
                          <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                        ) : (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={page === safeParamPage}
                              onClick={() => setParamPage(page)}
                              className="cursor-pointer"
                            >{page}</PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setParamPage((p) => Math.min(totalParamPages, p + 1))}
                          className={safeParamPage >= totalParamPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
