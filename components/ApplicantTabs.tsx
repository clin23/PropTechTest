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
          Documents
        </button>
        <button
          className={`px-4 py-2 ${
            tab === "criteria" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setTab("criteria")}
        >
          Criteria/Score
        </button>
      </div>
      {tab === "profile" && (
        <div className="p-4 space-y-2">
          <div>Applicant: {application?.applicant}</div>
          <div>Property: {application?.property}</div>
          <div>Status: {application?.status}</div>
        </div>
      )}
      {tab === "docs" && (
        <div className="p-4 space-y-2">
          <div>ID Document</div>
          <div>Payslips</div>
          <div>References</div>
        </div>
      )}
      {tab === "criteria" && (
        <div className="p-4">Criteria and score details placeholder</div>
      )}
    </div>
  );
}
