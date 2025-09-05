"use client";

import { useState } from "react";
import type { Application } from "../lib/api";

export default function ApplicantTabs({ application }: { application?: Application }) {
  const [tab, setTab] = useState("profile");

  return (
    <div>
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${
            tab === "profile" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setTab("profile")}
        >
          Profile
        </button>
        <button
          className={`px-4 py-2 ${
            tab === "docs" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setTab("docs")}
        >
          Docs
        </button>
        <button
          className={`px-4 py-2 ${
            tab === "checklist" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setTab("checklist")}
        >
          Checklist
        </button>
      </div>
      {tab === "profile" && (
        <div className="p-4">Applicant: {application?.applicant}</div>
      )}
      {tab === "docs" && (
        <div className="p-4">Documents tab placeholder</div>
      )}
      {tab === "checklist" && (
        <div className="p-4">Checklist tab placeholder</div>
      )}
    </div>
  );
}
