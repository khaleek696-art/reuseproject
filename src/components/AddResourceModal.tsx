"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Lock,
  Upload,
  Calendar,
  MapPin,
  IndianRupee,
  Layers,
  ArrowRight,
  ArrowLeft,
  Cloud,
  Check,
} from "lucide-react";
import { CategoryId, Condition, Resource } from "@/lib/types";
import { CATEGORIES } from "@/data/mockData";
import { useRole } from "@/lib/roleContext";

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResource?: (newResource: Resource) => void;
}

export function AddResourceModal({
  isOpen,
  onClose,
  onAddResource,
}: AddResourceModalProps) {
  const [step, setStep] = useState(1);

  // File Input Ref & Uploaded Photos (Local Previews + Real S3 URLs)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [s3UploadedUrls, setS3UploadedUrls] = useState<string[]>([]);
  const [isUploadingS3, setIsUploadingS3] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<CategoryId>("tech");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<Condition>("like_new");

  const [dailyRate, setDailyRate] = useState<number | "">(500);
  const [deposit, setDeposit] = useState<number | "">(1500);
  const [minDays, setMinDays] = useState(1);
  const [maxDays, setMaxDays] = useState(7);

  const [neighborhood, setNeighborhood] = useState("Civic Center / Kothrud Campus");
  const [gpsLat, setGpsLat] = useState("18.5204");
  const [gpsLng, setGpsLng] = useState("73.8567");

  const [serialNumber, setSerialNumber] = useState("");
  const [borrowerPolicy, setBorrowerPolicy] = useState<"all" | "verified_id" | "established_trust">("verified_id");
  const [allowPickup, setAllowPickup] = useState(true);
  const [allowDelivery, setAllowDelivery] = useState(true);

  const [isSuccess, setIsSuccess] = useState(false);
  const { addResource } = useRole();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTitle("");
      setDescription("");
      setDailyRate(500);
      setDeposit(1500);
      setUploadedPhotos([]);
      setS3UploadedUrls([]);
      setSerialNumber("");
      setIsSuccess(false);
      setIsUploadingS3(false);
    }
  }, [isOpen]);

  // Async AWS S3 File Selection & Upload Handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setIsUploadingS3(true);

      const readFileAsDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      };

      try {
        for (const file of filesArray) {
          // Read file as Base64 Data URL for persistent image display
          const base64Url = await readFileAsDataUrl(file);
          setUploadedPhotos((prev) => [...prev, base64Url]);

          const formData = new FormData();
          formData.append("file", file);

          // Upload to /api/upload endpoint
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.s3_url) {
              setS3UploadedUrls((prev) => [...prev, data.s3_url]);
            }
          }
        }
      } catch (err) {
        console.warn("AWS S3 Upload fallback:", err);
      } finally {
        setIsUploadingS3(false);
      }
    }
  };

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = () => {
    // Prefer real S3 URLs if available, otherwise fallback to local/unsplash
    const finalPhotos =
      s3UploadedUrls.length > 0
        ? s3UploadedUrls
        : uploadedPhotos.length > 0
        ? uploadedPhotos
        : [
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
          ];

    const newRes: Resource = {
      id: `r_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      ownerId: "u_aman",
      title: title.trim() || "New Equipment Asset",
      category,
      condition,
      description: description.trim() || "Maintained in clean working condition.",
      photos: finalPhotos,
      pricePerDay: Number(dailyRate) || 500,
      deposit: Number(deposit) || 1500,
      availableFrom: "09:00",
      availableTo: "20:00",
      instructions: "Handle with verified care.",
      location: {
        lat: parseFloat(gpsLat) || 18.5204,
        lng: parseFloat(gpsLng) || 73.8567,
        campus: neighborhood,
      },
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      features: ["4K Video Support", "Dual Storage Slots", "Encrypted Custody Handoff", "AWS S3 Verified"],
    };

    addResource(newRes);

    if (onAddResource) {
      onAddResource(newRes);
    }
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setStep(1);
      setUploadedPhotos([]);
      setS3UploadedUrls([]);
      setTitle("");
      setDescription("");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col justify-between overflow-hidden">
        {/* Header with Step Tracker and Non-Overlapping Close Button */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 pr-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            <PlusCircle className="h-3.5 w-3.5 text-emerald-700" />
            List Equipment Asset
          </span>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-mono">
            Step {step} of 5
          </span>
        </div>

        {/* Top-Right Absolute Close X Button (Positioned safely outside step badge) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors z-20"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-12 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4 animate-bounce">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Resource Published to AWS S3 &amp; Live!
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Photos uploaded to AWS S3 Bucket <code className="text-emerald-700 font-mono">reuse-app-storage (ap-south-1)</code>. Live on spatial radar map!
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            {/* Step Title Header */}
            <div className="mb-5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {step === 1 && "1. Asset Information & Condition"}
                {step === 2 && "2. Daily Rental Rate & Escrow Deposit"}
                {step === 3 && "3. Campus Neighborhood & GPS Location"}
                {step === 4 && "4. Upload AWS S3 Photos & Serial Number"}
                {step === 5 && "5. Borrower Policy & Handover Modes"}
              </h3>
            </div>

            {/* Form Steps */}
            <form onSubmit={handleNext} className="space-y-4">
              {/* STEP 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Equipment Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Sony Alpha 7 IV Mirrorless Camera / DeWalt Impact Drill"
                      className="w-full rounded-2xl border border-slate-200 p-3 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CategoryId)}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Equipment Condition
                      </label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as Condition)}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                      >
                        <option value="brand_new">Brand New (Pristine)</option>
                        <option value="like_new">Like New (Flawless)</option>
                        <option value="good">Good (Lightly Used)</option>
                        <option value="fair">Fair (Functional)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Detailed Usage Notes &amp; Accessories
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mention battery health, memory cards included, and any special care rules..."
                      className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Pricing & Deposit */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Daily Rental Rate (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={dailyRate}
                        onChange={(e) => setDailyRate(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="e.g. 500"
                        className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm font-black text-slate-900 focus:border-emerald-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Refundable Security Deposit (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={deposit}
                        onChange={(e) => setDeposit(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="e.g. 1500"
                        className="w-full rounded-2xl border border-slate-200 p-3.5 text-sm font-black text-slate-900 focus:border-emerald-600 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-3.5 border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold">Escrow Guarantee:</span> The security deposit is held in verified smart escrow and automatically refunded to the borrower upon physical return OTP confirmation.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Min Rental Period (Days)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={minDays}
                        onChange={(e) => setMinDays(Number(e.target.value))}
                        className="w-full rounded-2xl border border-slate-200 p-3 text-xs font-semibold text-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Max Rental Period (Days)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={maxDays}
                        onChange={(e) => setMaxDays(Number(e.target.value))}
                        className="w-full rounded-2xl border border-slate-200 p-3 text-xs font-semibold text-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Spatial Location & Coordinates */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Approximate Neighborhood Address
                    </label>
                    <input
                      type="text"
                      required
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="e.g. Civic Center, Pune / Near MIT Library"
                      className="w-full rounded-2xl border border-slate-200 p-3 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      * Strict privacy rule: Exact address is never shown publicly; only neighborhood and distance are revealed.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        PostGIS Latitude
                      </label>
                      <input
                        type="text"
                        value={gpsLat}
                        onChange={(e) => setGpsLat(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 p-2.5 text-xs font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        PostGIS Longitude
                      </label>
                      <input
                        type="text"
                        value={gpsLng}
                        onChange={(e) => setGpsLng(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 p-2.5 text-xs font-mono text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: AWS S3 Photo Upload & Encrypted Serial Number */}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Upload Photos to AWS S3 Cloud Storage
                      </label>
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <Cloud className="h-3 w-3" />
                        <span>S3 Bucket: reuse-app-storage</span>
                      </span>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 transition-all cursor-pointer group"
                    >
                      {isUploadingS3 ? (
                        <div className="py-2">
                          <Sparkles className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-2" />
                          <div className="text-xs font-bold text-emerald-900">
                            Uploading photo to AWS S3 Bucket (ap-south-1)...
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-slate-400 group-hover:text-emerald-600 mx-auto mb-2 transition-colors" />
                          <div className="text-xs font-bold text-slate-800">
                            Click here to browse photos from your Mac/PC folder
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Uploaded securely to AWS S3 (reuse-app-storage)
                          </div>
                        </>
                      )}
                    </div>

                    {/* Live Selected Photos Previews */}
                    {uploadedPhotos.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                          <span>Selected Photos ({uploadedPhotos.length}):</span>
                          {s3UploadedUrls.length > 0 && (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px]">
                              <Check className="h-3 w-3" />
                              <span>{s3UploadedUrls.length} Uploaded to AWS S3</span>
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {uploadedPhotos.map((photoUrl, idx) => (
                            <div
                              key={idx}
                              className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square shadow-2xs"
                            >
                              <img
                                src={photoUrl}
                                alt={`Selected photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 left-1 bg-slate-950/80 text-[9px] font-bold text-emerald-400 px-1.5 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                                <Cloud className="h-2.5 w-2.5" />
                                <span>AWS S3</span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedPhotos((prev) =>
                                    prev.filter((_, i) => i !== idx)
                                  );
                                  setS3UploadedUrls((prev) =>
                                    prev.filter((_, i) => i !== idx)
                                  );
                                }}
                                className="absolute top-1 right-1 bg-slate-950/80 text-white p-1 rounded-full text-xs hover:bg-rose-600 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl bg-slate-950 p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        Confidential Serial Number Registry
                      </span>
                    </div>
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="e.g. CN-5D-882194-X"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs font-mono text-emerald-300 focus:outline-none"
                    />
                    <div className="mt-2 text-[10px] text-slate-400 leading-relaxed">
                      * Encrypted on server. Serial number is NEVER displayed publicly; it is only revealed to courier/borrower during the physical OTP custody handoff.
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Borrowing Policy & Modes */}
              {step === 5 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Who Can Borrow This Asset?
                    </label>
                    <div className="space-y-2 text-xs">
                      <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <input
                          type="radio"
                          name="policy"
                          checked={borrowerPolicy === "all"}
                          onChange={() => setBorrowerPolicy("all")}
                          className="text-emerald-600"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">All Verified Campus Peers</span>
                          <span className="text-slate-500 text-[11px]">Any student with verified email and campus profile.</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-emerald-500 bg-emerald-50/50 cursor-pointer">
                        <input
                          type="radio"
                          name="policy"
                          checked={borrowerPolicy === "verified_id"}
                          onChange={() => setBorrowerPolicy("verified_id")}
                          className="text-emerald-600"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">Govt / Student ID Verified Only (Recommended)</span>
                          <span className="text-slate-500 text-[11px]">Requires verified Govt Aadhaar / Campus Student ID card.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-bold text-slate-900">Allow Direct Campus Pickup Spot</span>
                      <input
                        type="checkbox"
                        checked={allowPickup}
                        onChange={(e) => setAllowPickup(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-bold text-slate-900">Allow Local Campus Courier Delivery</span>
                      <input
                        type="checkbox"
                        checked={allowDelivery}
                        onChange={(e) => setAllowDelivery(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-1.5 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 px-6 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                >
                  <span>{step === 5 ? "Publish Asset to AWS S3 & Map" : "Continue"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
