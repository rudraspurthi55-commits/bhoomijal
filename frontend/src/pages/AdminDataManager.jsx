import React, { useState } from 'react';
import { uploadDataCSV, triggerRetrain } from '../services/api';

export default function AdminDataManager({ dataStatus, onRefreshStatus, t }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [retrainStatus, setRetrainStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadStatus(null);
    try {
      const res = await uploadDataCSV(selectedFile);
      setUploadStatus({
        success: true,
        message: `Successfully ingested ${res.rows_valid} observation records (${res.rows_rejected} rejected).`,
        warnings: res.warnings || []
      });
      if (onRefreshStatus) onRefreshStatus();
    } catch (err) {
      setUploadStatus({
        success: false,
        message: err.message || "Failed to upload and validate CSV file."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainStatus(null);
    try {
      const res = await triggerRetrain();
      setRetrainStatus({
        success: true,
        message: `Model retrained successfully! New Test RMSE: ${res.metrics?.metrics?.rmse}m, R²: ${res.metrics?.metrics?.r2_score}`
      });
      if (onRefreshStatus) onRefreshStatus();
    } catch (err) {
      setRetrainStatus({
        success: false,
        message: err.message || "Model retraining failed."
      });
    } finally {
      setIsRetraining(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent = "station_id,observation_date,depth_to_water_level_m,rainfall_mm,temperature_c\n" +
      "STN-IN-TS-01,2026-04-01,13.8,25.0,32.0\n" +
      "STN-IN-TS-02,2026-04-01,10.1,30.0,31.5\n" +
      "STN-IN-AP-01,2026-04-01,23.4,5.0,36.0\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "bhoomijal_sample_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-wider text-teal-400 font-bold">
          Data Governance & Pipeline
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
          {t.admin.title}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {t.admin.subtitle}
        </p>
      </div>

      {/* Upload & Retrain Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Ingestion Card */}
        <div className="bg-[#132A44] border border-[#244771] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>📤</span> {t.admin.uploadTitle}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Supports CSV with <code>station_id</code>, <code>observation_date</code>, <code>depth_to_water_level_m</code>, and <code>rainfall_mm</code>.
            </p>

            <div className="mt-4 p-4 border-2 border-dashed border-[#244771] rounded-xl bg-[#0B192C]/50 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-file-input"
              />
              <label htmlFor="csv-file-input" className="cursor-pointer block">
                <span className="text-2xl block mb-1">📄</span>
                <span className="text-xs font-semibold text-teal-400 hover:underline">
                  {selectedFile ? selectedFile.name : "Select or Drop CSV File"}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">
                  Automatic negative depth filtering and duplicate deduplication applied
                </span>
              </label>
            </div>

            {uploadStatus && (
              <div className={`mt-4 p-3 rounded-xl text-xs border ${
                uploadStatus.success ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
              }`}>
                <strong>{uploadStatus.success ? "Success:" : "Error:"}</strong> {uploadStatus.message}
                {uploadStatus.warnings?.length > 0 && (
                  <ul className="list-disc pl-4 mt-2 space-y-0.5 text-[11px] text-amber-300">
                    {uploadStatus.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-teal-500 text-white font-bold text-xs shadow-md hover:bg-teal-400 disabled:opacity-40 transition-all"
            >
              {isUploading ? "Validating & Ingesting..." : `✓ ${t.admin.uploadBtn}`}
            </button>
            <button
              onClick={downloadSampleTemplate}
              className="px-3 py-2.5 rounded-xl bg-[#0B192C] text-gray-300 border border-[#244771] text-xs font-semibold hover:text-white hover:bg-[#1E3E62] transition-all whitespace-nowrap"
            >
              📥 Template
            </button>
          </div>
        </div>

        {/* Model Retraining Card */}
        <div className="bg-[#132A44] border border-[#244771] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🧠</span> Continuous Machine Learning Retraining
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Retrain the Random Forest predictor on newly committed database records with time-based cross-validation.
            </p>

            <div className="mt-4 space-y-2 text-xs bg-[#0E2034] p-4 rounded-xl border border-[#1E3E62]">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Database Records:</span>
                <span className="font-bold text-white">{dataStatus?.total_observations || 432}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Retrain Policy:</span>
                <span className="text-teal-300 font-medium">Time-Series Split (80/20)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Previous Valid Model:</span>
                <span className="text-emerald-400 font-medium">Preserved on Failure</span>
              </div>
            </div>

            {retrainStatus && (
              <div className={`mt-4 p-3 rounded-xl text-xs border ${
                retrainStatus.success ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
              }`}>
                {retrainStatus.message}
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleRetrain}
              disabled={isRetraining}
              className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-xs shadow-md hover:from-teal-400 hover:to-cyan-400 disabled:opacity-40 transition-all"
            >
              {isRetraining ? "Retraining Model..." : `⚡ ${t.admin.retrainBtn}`}
            </button>
          </div>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="p-4 bg-[#0E2034] border border-[#1E3E62] rounded-xl text-xs text-gray-400">
        <strong className="text-teal-400 block mb-1">Strict Validation Enforcement:</strong>
        {t.admin.validationRules}
      </div>
    </div>
  );
}
