"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import ApplicationsTable from "../../components/ApplicationsTable";
import { listApplications } from "../../lib/api";
import type { ApplicationRow } from "../../types/application";
import PageHeader from "../../components/PageHeader";
import Skeleton from "../../components/Skeleton";
import ErrorState from "../../components/ErrorState";

export default function ApplicationsPage() {
  const {
    data: rows,
    isLoading,
    error,
  } = useQuery<ApplicationRow[]>({
    queryKey: ["applications"],
    queryFn: listApplications,
  });

  const [status, setStatus] = useState("");
  const [property, setProperty] = useState("");

  const statuses = useMemo(
    () => Array.from(new Set(rows?.map((r) => r.status) || [])),
    [rows]
  );
  const properties = useMemo(
    () => Array.from(new Set(rows?.map((r) => r.property) || [])),
    [rows]
  );

  const filteredRows = useMemo(
    () =>
      (rows || []).filter(
        (r) =>
          (!status || r.status === status) && (!property || r.property === property)
      ),
    [rows, status, property]
  );

  return (
    <div className="p-6">
      <PageHeader title="Applications" />
      <div className="flex space-x-4 mb-4">
        <select
          className="border p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="border p-2"
          value={property}
          onChange={(e) => setProperty(e.target.value)}
        >
          <option value="">All Properties</option>
          {properties.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <Skeleton className="h-32" />
      ) : error ? (
        <ErrorState message={(error as Error).message} />
      ) : (
        <ApplicationsTable rows={filteredRows} />
      )}
    </div>
  );
}
