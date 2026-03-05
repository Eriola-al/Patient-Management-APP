import { useState, useMemo } from "react";
import { format } from "date-fns";
import { AlertTriangle, ArrowUpDown, Search, Loader2 } from "lucide-react";
import { Patient } from "@/types/patient";
import { usePatients } from "@/hooks/usePatients";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PatientDetailDialog from "./PatientDetailDialog";

type SortKey = "familyName" | "givenName" | "sex" | "birthDate" | "paramCount";
type SortDir = "asc" | "desc";

export default function PatientGrid() {
  const { data: patients, isLoading, error } = usePatients();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("familyName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    if (!patients) return [];
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.familyName.toLowerCase().includes(q) ||
        p.givenName.toLowerCase().includes(q) ||
        p.sex.toLowerCase().includes(q)
    );
  }, [patients, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "familyName":
          cmp = a.familyName.localeCompare(b.familyName);
          break;
        case "givenName":
          cmp = a.givenName.localeCompare(b.givenName);
          break;
        case "sex":
          cmp = a.sex.localeCompare(b.sex);
          break;
        case "birthDate":
          cmp = new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime();
          break;
        case "paramCount":
          cmp = a.parameters.length - b.parameters.length;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = sorted.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const hasAlarm = (p: Patient) => p.parameters.some((param) => param.alarm);

  const SortButton = ({ label, column }: { label: string; column: SortKey }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1 -ml-3 font-semibold text-muted-foreground hover:text-foreground"
      onClick={() => toggleSort(column)}
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" />
    </Button>
  );

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, safeCurrentPage - 1); i <= Math.min(totalPages - 1, safeCurrentPage + 1); i++) {
        pages.push(i);
      }
      if (safeCurrentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading patients…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-destructive">
        Failed to load patients. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter by name or gender…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead><SortButton label="Family Name" column="familyName" /></TableHead>
              <TableHead><SortButton label="Given Name" column="givenName" /></TableHead>
              <TableHead><SortButton label="Sex" column="sex" /></TableHead>
              <TableHead><SortButton label="Birth Date" column="birthDate" /></TableHead>
              <TableHead><SortButton label="Parameters" column="paramCount" /></TableHead>
              <TableHead className="text-center">Alarm</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  No patients found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((patient) => (
                <TableRow
                  key={patient.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setSelectedPatientId(patient.id)}
                >
                  <TableCell className="font-medium">{patient.familyName}</TableCell>
                  <TableCell>{patient.givenName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {patient.sex}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(patient.birthDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>{patient.parameters.length}</TableCell>
                  <TableCell className="text-center">
                    {hasAlarm(patient) && (
                      <span className="inline-flex items-center gap-1 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {sorted.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, sorted.length)} of{" "}
            {sorted.length} patient{sorted.length !== 1 ? "s" : ""}
          </span>
          <span className="mx-1">·</span>
          <div className="flex items-center gap-1">
            <span>Rows:</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={safeCurrentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {getPageNumbers().map((page, i) =>
              page === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === safeCurrentPage}
                    onClick={() => setCurrentPage(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={safeCurrentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <PatientDetailDialog
        patientId={selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
      />
    </div>
  );
}
