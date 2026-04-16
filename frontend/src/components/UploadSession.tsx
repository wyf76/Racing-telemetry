import { useState } from "react";

import { uploadSession } from "../api/client";
import type { SessionSummary } from "../api/types";

type UploadSessionProps = {
  onUploaded: (session: SessionSummary) => void;
};

export function UploadSession({ onUploaded }: UploadSessionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file) {
      setError("Choose a CSV or JSON file first.");
      setMessage(null);
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const session = await uploadSession(file);
      onUploaded(session);
      setMessage(`Uploaded ${file.name} and created session ${session.track}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="panel panel-body flex w-full flex-col gap-5">
      <div>
        <p className="section-kicker">Upload Session</p>
        <h2 className="section-title">Import telemetry file</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Supports the current normalized JSON schema and the lightweight CSV import
          format used in this MVP.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          accept=".json,.csv,application/json,text/csv"
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setError(null);
            setMessage(null);
          }}
          type="file"
        />
        <button
          className="action-button shrink-0"
          disabled={uploading}
          onClick={handleUpload}
          type="button"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {message ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}
