import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "../../contexts/AuthContext";

type CategoryType = "general" | "tournament";

const InformationManagement: React.FC = () => {
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [editingInfo, setEditingInfo] = useState<Id<"information"> | null>(
    null,
  );

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryType>("general");
  const [tournamentId, setTournamentId] = useState<Id<"tournaments"> | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [order, setOrder] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [previewDialog, setPreviewDialog] = useState<{
    url: string;
    type: string;
    title: string;
  } | null>(null);

  // Queries
  const allInformation = useQuery(
    api.information.getAllInformation,
    user ? { userId: user._id } : "skip",
  );

  const allTournaments = useQuery(api.information.getAllTournaments);

  // Mutations
  const createInformation = useMutation(api.information.createInformation);
  const updateInformation = useMutation(api.information.updateInformation);
  const deleteInformation = useMutation(api.information.deleteInformation);
  const togglePublished = useMutation(api.information.togglePublished);
  const generateUploadUrl = useMutation(api.information.generateUploadUrl);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("general");
    setTournamentId("");
    setFile(null);
    setFilePreview(null);
    setIsPublished(true);
    setOrder("");
    setEditingInfo(null);
    setShowDialog(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      if (!validTypes.includes(selectedFile.type)) {
        alert("Silakan pilih file PDF, JPG, atau PNG");
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("Ukuran file harus kurang dari 10MB");
        return;
      }

      setFile(selectedFile);

      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === "application/pdf") {
        setFilePreview("PDF_FILE");
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (category === "tournament" && !tournamentId) {
      alert("Silakan pilih tournament");
      return;
    }

    if (!file && !editingInfo) {
      alert("Silakan pilih file");
      return;
    }

    setIsUploading(true);

    try {
      let fileStorageId: Id<"_storage"> | undefined;
      let fileType: string | undefined;

      if (file) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) {
          throw new Error("Failed to upload file");
        }

        const { storageId } = await result.json();
        fileStorageId = storageId;
        fileType = file.type.includes("pdf") ? "pdf" : file.type.split("/")[1];
      } else if (editingInfo) {
        const existingInfo = allInformation?.find((i) => i._id === editingInfo);
        if (existingInfo?.fileStorageId) {
          fileStorageId = existingInfo.fileStorageId;
          fileType = existingInfo.fileType;
        }
      }

      if (editingInfo) {
        await updateInformation({
          informationId: editingInfo,
          title,
          description: description || undefined,
          category,
          tournamentId:
            category === "tournament" && tournamentId
              ? tournamentId
              : undefined,
          fileStorageId,
          fileType,
          isPublished,
          order: order ? parseInt(order) : undefined,
          userId: user._id,
        });
      } else {
        await createInformation({
          title,
          description: description || undefined,
          category,
          tournamentId:
            category === "tournament" && tournamentId
              ? tournamentId
              : undefined,
          fileStorageId,
          fileType,
          isPublished,
          order: order ? parseInt(order) : undefined,
          userId: user._id,
        });
      }
      resetForm();
    } catch (error) {
      console.error("Error saving information:", error);
      alert(
        error instanceof Error ? error.message : "Failed to save information",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (info: NonNullable<typeof allInformation>[number]) => {
    setTitle(info.title);
    setDescription(info.description || "");
    setCategory(info.category as CategoryType);
    setTournamentId(info.tournamentId || "");
    setIsPublished(info.isPublished);
    setOrder(info.order?.toString() || "");
    setFilePreview(info.fileUrl || null);
    setEditingInfo(info._id);
    setShowDialog(true);
  };

  const handleDelete = async (infoId: Id<"information">) => {
    if (!user) return;
    if (!confirm("Apakah Anda yakin ingin menghapus informasi ini?")) return;

    try {
      await deleteInformation({ informationId: infoId, userId: user._id });
    } catch (error) {
      console.error("Error deleting information:", error);
      alert(
        error instanceof Error ? error.message : "Gagal menghapus informasi",
      );
    }
  };

  const handleTogglePublished = async (infoId: Id<"information">) => {
    if (!user) return;
    try {
      await togglePublished({ informationId: infoId, userId: user._id });
    } catch (error) {
      console.error("Error toggling published status:", error);
      alert(error instanceof Error ? error.message : "Gagal mengubah status");
    }
  };

  const getCategoryLabel = (c: string) => {
    switch (c) {
      case "general":
        return "General";
      case "tournament":
        return "Tournament";
      default:
        return c;
    }
  };

  const getCategoryColor = (c: string) => {
    switch (c) {
      case "general":
        return "bg-blue-600";
      case "tournament":
        return "bg-amber-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-1 h-8 bg-red-700 rounded-full"></span>
          Manajemen Informasi
        </h2>
        <p className="text-gray-400 mt-1">
          Kelola informasi General dan Tournament
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowDialog(true)}
          className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 hover:from-red-800 hover:via-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-[0_8px_24px_rgba(139,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(139,0,0,0.5)] flex items-center gap-2 border border-red-900/40"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tambah Informasi
        </button>
      </div>

      {/* Dialog Form */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 backdrop-blur-xl border-2 border-red-900/30 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-900/60 to-red-800/60 text-white px-6 py-4 border-b border-red-900/40 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {editingInfo ? "Edit Informasi" : "Tambah Informasi Baru"}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-red-950/40 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Judul *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all placeholder-gray-600"
                      placeholder="Masukkan judul"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Kategori *
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setCategory("general");
                          setTournamentId("");
                        }}
                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                          category === "general"
                            ? "bg-gradient-to-r from-blue-900 to-blue-800 border-blue-700 text-white shadow-lg shadow-blue-900/40"
                            : "bg-[#1a1a1a]/60 border-gray-800/60 text-gray-400 hover:border-gray-600 hover:text-white"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                          />
                        </svg>
                        General
                      </button>
                      <button
                        type="button"
                        onClick={() => setCategory("tournament")}
                        className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                          category === "tournament"
                            ? "bg-gradient-to-r from-amber-900 to-amber-800 border-amber-700 text-white shadow-lg shadow-amber-900/40"
                            : "bg-[#1a1a1a]/60 border-gray-800/60 text-gray-400 hover:border-gray-600 hover:text-white"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                        Tournament
                      </button>
                    </div>
                  </div>

                  {/* Tournament Dropdown — visible only when category is tournament */}
                  {category === "tournament" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Pilih Tournament *
                      </label>
                      {allTournaments && allTournaments.length > 0 ? (
                        <select
                          value={tournamentId}
                          onChange={(e) =>
                            setTournamentId(
                              e.target.value as Id<"tournaments"> | "",
                            )
                          }
                          required={category === "tournament"}
                          className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all"
                        >
                          <option
                            value=""
                            className="bg-[#1a1a1a] text-gray-400"
                          >
                            -- Pilih Tournament --
                          </option>
                          {allTournaments.map((t) => (
                            <option
                              key={t._id}
                              value={t._id}
                              className="bg-[#1a1a1a] text-white"
                            >
                              {t.name}
                              {t.date
                                ? ` — ${new Date(t.date).toLocaleDateString("id-ID")}`
                                : ""}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-gray-500 rounded-xl text-sm">
                          {allTournaments === undefined
                            ? "Memuat tournament..."
                            : "Belum ada tournament tersedia"}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all resize-none placeholder-gray-600"
                      placeholder="Deskripsi singkat"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      File (PDF, JPG, PNG) *
                    </label>

                    {filePreview || file ? (
                      <div className="relative">
                        {filePreview === "PDF_FILE" ||
                        (filePreview &&
                          (filePreview.includes(".pdf") ||
                            file?.type === "application/pdf")) ? (
                          <div className="w-full h-64 bg-gray-900/60 rounded-xl border-2 border-gray-800/60 flex items-center justify-center">
                            <div className="text-center">
                              <svg
                                className="w-16 h-16 text-red-500 mx-auto mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              <p className="text-white font-semibold mb-1">
                                PDF File
                              </p>
                              {file && (
                                <p className="text-gray-400 text-sm">
                                  {file.name}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : filePreview && filePreview.startsWith("data:") ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-full h-64 object-contain rounded-xl border-2 border-gray-800/60 bg-gray-900/40"
                          />
                        ) : filePreview ? (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-full h-64 object-contain rounded-xl border-2 border-gray-800/60 bg-gray-900/40"
                          />
                        ) : null}
                        <button
                          type="button"
                          onClick={removeFile}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-lg transition-colors border border-red-800/40"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-800/60 bg-[#1a1a1a]/40 rounded-xl p-8 text-center hover:border-red-800 transition-colors">
                        <input
                          type="file"
                          accept="application/pdf,image/jpeg,image/jpg,image/png"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <div className="w-16 h-16 bg-red-900/40 rounded-2xl flex items-center justify-center mb-3 border border-red-800/40">
                            <svg
                              className="w-8 h-8 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                          <span className="text-white font-medium mb-1">
                            Klik untuk upload file
                          </span>
                          <span className="text-gray-400 text-sm">
                            PDF, JPG, PNG maksimal 10MB
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Order & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Urutan (Optional)
                      </label>
                      <input
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        min="0"
                        className="w-full px-4 py-3 border-2 border-gray-800/60 bg-[#1a1a1a]/60 text-white rounded-xl focus:ring-2 focus:ring-red-900/50 focus:border-red-800 transition-all placeholder-gray-600"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Status
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPublished(true)}
                          className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                            isPublished
                              ? "bg-gradient-to-r from-green-900 to-green-800 border-green-700 text-white shadow-lg shadow-green-900/40"
                              : "bg-[#1a1a1a]/60 border-gray-800/60 text-gray-400 hover:border-gray-600 hover:text-white"
                          }`}
                        >
                          ✓ Published
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPublished(false)}
                          className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                            !isPublished
                              ? "bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600 text-white shadow-lg"
                              : "bg-[#1a1a1a]/60 border-gray-800/60 text-gray-400 hover:border-gray-600 hover:text-white"
                          }`}
                        >
                          Draft
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-red-900/40">
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="flex-1 bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-800/60 hover:to-red-900/60 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-red-900/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-red-800/40"
                    >
                      {isUploading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {editingInfo
                            ? "Update Informasi"
                            : "Simpan Informasi"}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 border-2 border-gray-700/60 hover:bg-gray-800/60 text-gray-300 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Information List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allInformation?.map((info) => (
          <div
            key={info._id}
            className="bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-red-900/30 hover:border-red-800 hover:shadow-[0_12px_32px_rgba(139,0,0,0.4)] transition-all flex flex-col"
          >
            {/* File Preview */}
            {info.fileUrl && (
              <div
                className="w-full h-48 overflow-hidden bg-gray-900/60 cursor-pointer group relative"
                onClick={() =>
                  setPreviewDialog({
                    url: info.fileUrl!,
                    type: info.fileType || "image",
                    title: info.title,
                  })
                }
              >
                {info.fileType === "pdf" ? (
                  <>
                    <iframe
                      src={`${info.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full pointer-events-none"
                      title={info.title}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-red-900/90 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                        Klik untuk memperbesar
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <img
                      src={info.fileUrl}
                      alt={info.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-red-900/90 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                        Klik untuk memperbesar
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="p-6 flex flex-col flex-1">
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className={`${getCategoryColor(info.category)} text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm`}
                >
                  {getCategoryLabel(info.category)}
                </span>
                <span
                  className={`${
                    info.isPublished
                      ? "bg-green-900/60 border border-green-800/40"
                      : "bg-gray-800/60 border border-gray-700/40"
                  } text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm`}
                >
                  {info.isPublished ? "Published" : "Draft"}
                </span>
                {info.order !== undefined && (
                  <span className="bg-blue-900/60 border border-blue-800/40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                    #{info.order}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-white text-lg font-bold mb-2 line-clamp-2">
                {info.title}
              </h3>

              {/* Tournament name badge */}
              {info.category === "tournament" && info.tournamentName && (
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-amber-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  <span className="text-amber-400 text-sm font-medium truncate">
                    {info.tournamentName}
                  </span>
                </div>
              )}

              {/* Description */}
              {info.description && (
                <p className="text-gray-400 text-sm mb-3 leading-relaxed line-clamp-2 flex-1">
                  {info.description}
                </p>
              )}

              {/* Meta */}
              <div className="space-y-2 mb-4">
                <div className="text-gray-500 text-xs flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(info.createdAt).toLocaleDateString("id-ID")}
                </div>
                <div className="text-gray-500 text-xs flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {info.creatorName}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-3 border-t border-gray-800/60">
                <button
                  onClick={() => handleTogglePublished(info._id)}
                  className={`flex-1 p-2 rounded-lg transition-colors border flex items-center justify-center gap-1 ${
                    info.isPublished
                      ? "hover:bg-gray-800/40 text-gray-400 border-gray-700/30"
                      : "hover:bg-green-950/40 text-green-500 border-green-900/30"
                  }`}
                  title={info.isPublished ? "Unpublish" : "Publish"}
                >
                  {info.isPublished ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                      <span className="text-xs">Unpublish</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span className="text-xs">Publish</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleEdit(info)}
                  className="flex-1 p-2 hover:bg-yellow-950/40 text-yellow-500 rounded-lg transition-colors border border-yellow-900/30 flex items-center justify-center gap-1"
                  title="Edit"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span className="text-xs">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(info._id)}
                  className="flex-1 p-2 hover:bg-red-950/40 text-red-500 rounded-lg transition-colors border border-red-900/30 flex items-center justify-center gap-1"
                  title="Delete"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span className="text-xs">Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {allInformation?.length === 0 && (
          <div className="col-span-full bg-gradient-to-b from-[#2e2e2e]/80 to-[#1a1a1a]/80 backdrop-blur-xl rounded-2xl border-2 border-red-900/30 p-12 text-center">
            <div className="w-20 h-20 bg-gray-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700/40">
              <svg
                className="w-10 h-10 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Belum ada informasi
            </h3>
            <p className="text-sm text-gray-400">
              Klik "Tambah Informasi" untuk menambahkan informasi baru
            </p>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      {previewDialog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#2e2e2e]/95 to-[#1a1a1a]/95 backdrop-blur-xl border-2 border-red-900/30 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-900/60 to-red-800/60 text-white px-6 py-4 border-b border-red-900/40 flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {previewDialog.title}
              </h3>
              <button
                onClick={() => setPreviewDialog(null)}
                className="p-2 hover:bg-red-950/40 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-900/40 p-4">
              {previewDialog.type === "pdf" ? (
                <iframe
                  src={previewDialog.url}
                  className="w-full h-full min-h-[600px] rounded-lg"
                  title={previewDialog.title}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <img
                    src={previewDialog.url}
                    alt={previewDialog.title}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-[#2e2e2e]/80 to-[#1a1a1a]/80 px-6 py-4 border-t border-red-900/40 flex items-center justify-between">
              <a
                href={previewDialog.url}
                download
                className="bg-gradient-to-r from-red-900/60 to-red-950/60 hover:from-red-800/60 hover:to-red-900/60 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 border border-red-800/40"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </a>
              <button
                onClick={() => setPreviewDialog(null)}
                className="px-6 border-2 border-gray-700/60 hover:bg-gray-800/60 text-gray-300 py-2 rounded-lg font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InformationManagement;
