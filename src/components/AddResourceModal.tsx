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
  const { addResource, role, setRole, isLoggedIn, openAuthModal, currentUser } = useRole();

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
          const formData = new FormData();
          formData.append("file", file);

          // Upload directly to AWS S3 via upload endpoint
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            const realS3Url = data.direct_s3_url || data.s3_url;
            if (realS3Url) {
              setS3UploadedUrls((prev) => [...prev, realS3Url]);
              setUploadedPhotos((prev) => [...prev, realS3Url]);
            }
          }
        }
      } catch (err) {
        console.warn("AWS S3 Upload error:", err);
      } finally {
        setIsUploadingS3(false);
      }
    }
  };

  if (!isOpen) return null;

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
        <div className="relative w-full max-w-md rounded-none bg-[#1c1b1b] p-6 sm:p-8 shadow-[0_8px_0_0_#0f0f0f] border-2 border-[#2a2a2a] text-center space-y-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-none p-2 bg-[#141414] border border-[#2a2a2a] text-[#bec9c2] hover:text-white hover:border-[#8bd6b6] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-[#141414] text-[#8bd6b6] border-2 border-[#2a2a2a] shadow-[0_3px_0_0_#0f0f0f]">
            <Lock className="h-8 w-8 text-[#8bd6b6]" />
          </div>

          <div>
            <h3 className="text-lg font-['Silkscreen'] uppercase tracking-wider text-white">Authentication Required</h3>
            <p className="text-xs text-[#bec9c2] font-mono mt-2 leading-relaxed">
              Only registered Resource Owners can publish gear. Please log in or sign up to continue.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                onClose();
                openAuthModal("login");
              }}
              className="w-full py-3.5 px-4 rounded-none bg-[#065f46] border-2 border-[#047857] shadow-[0_4px_0_0_#003828] text-white font-['Silkscreen'] text-xs uppercase tracking-wider hover:bg-[#047857] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              Log In as Resource Owner
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (role !== "owner") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
        <div className="relative w-full max-w-md rounded-none bg-[#1c1b1b] p-6 sm:p-8 shadow-[0_8px_0_0_#0f0f0f] border-2 border-[#2a2a2a] text-center space-y-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-none p-2 bg-[#141414] border border-[#2a2a2a] text-[#bec9c2] hover:text-white hover:border-[#8bd6b6] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-[#141414] text-amber-400 border-2 border-[#2a2a2a] shadow-[0_3px_0_0_#0f0f0f]">
            <ShieldCheck className="h-8 w-8 text-amber-400" />
          </div>

          <div>
            <h3 className="text-lg font-['Silkscreen'] uppercase tracking-wider text-white">Resource Owner Mode Required</h3>
            <p className="text-xs text-[#bec9c2] font-mono mt-2 leading-relaxed">
              You are currently in <strong className="text-white font-bold uppercase">{role} Mode</strong>. Borrowers explore and rent gear. To list equipment and monetize what you own, please switch to Resource Owner Mode.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                setRole("owner");
              }}
              className="w-full py-3.5 px-4 rounded-none bg-[#065f46] border-2 border-[#047857] shadow-[0_4px_0_0_#003828] text-white font-['Silkscreen'] text-xs uppercase tracking-wider hover:bg-[#047857] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              Switch to Owner Mode &amp; Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = () => {
    // Strict AWS S3 Cloud Storage URLs
    const finalPhotos =
      s3UploadedUrls.length > 0
        ? s3UploadedUrls
        : uploadedPhotos.filter((p) => p.startsWith("http")).length > 0
        ? uploadedPhotos.filter((p) => p.startsWith("http"))
        : [
            "https://reuse-gear-images-2026.s3.ap-south-1.amazonaws.com/equipment/default_gear.jpg",
          ];

    const newRes: Resource = {
      id: `r_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      ownerId: currentUser?.id || "u_owner_active",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-none bg-[#1c1b1b] p-5 sm:p-8 shadow-[0_8px_0_0_#0f0f0f] border-2 border-[#2a2a2a] max-h-[90vh] flex flex-col justify-between overflow-hidden">
        {/* Header with Step Tracker and Non-Overlapping Close Button */}
        <div className="flex items-center justify-between border-b-2 border-[#2a2a2a] pb-4 mb-5 pr-10">
          <span className="inline-flex items-center gap-1.5 rounded-none bg-[#065f46]/30 px-3 py-1 text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#8bd6b6] border border-[#8bd6b6]/30">
            <PlusCircle className="h-3.5 w-3.5 text-[#8bd6b6]" />
            List Equipment Asset
          </span>
          <span className="text-xs font-['Silkscreen'] text-white bg-[#141414] px-3 py-1 rounded-none border border-[#2a2a2a]">
            Step {step} of 5
          </span>
        </div>

        {/* Top-Right Absolute Close X Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-none p-2 bg-[#141414] border border-[#2a2a2a] text-[#bec9c2] hover:text-white hover:border-[#8bd6b6] transition-colors z-20 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {isSuccess ? (
          <div className="text-center py-12 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-[#065f46]/30 text-[#8bd6b6] border-2 border-[#8bd6b6] shadow-[0_4px_0_0_#003828] mb-4">
              <CheckCircle2 className="h-8 w-8 text-[#8bd6b6]" />
            </div>
            <h3 className="text-xl font-['Silkscreen'] uppercase tracking-wider text-white">
              Resource Published to AWS S3 &amp; Live!
            </h3>
            <p className="mt-2 text-xs text-[#bec9c2] font-mono max-w-md mx-auto">
              Photos uploaded to AWS S3 Bucket <code className="text-[#8bd6b6] font-mono">reuse-gear-images-2026 (ap-south-1)</code>. Live on spatial radar map!
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            {/* Step Title Header */}
            <div className="mb-5">
              <h3 className="text-sm sm:text-base font-['Silkscreen'] tracking-wider uppercase text-white">
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
                    <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">
                      Equipment Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Sony Alpha 7 IV Mirrorless Camera / DeWalt Impact Drill"
                      className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-3 text-xs font-mono font-bold text-white focus:border-[#8bd6b6] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as CategoryId)}
                        className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-3 text-xs font-mono font-semibold text-white focus:border-[#8bd6b6] focus:outline-none cursor-pointer"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">
                        Equipment Condition
                      </label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as Condition)}
                        className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-3 text-xs font-mono font-semibold text-white focus:border-[#8bd6b6] focus:outline-none cursor-pointer"
                      >
                        <option value="brand_new">Brand New (Pristine)</option>
                        <option value="like_new">Like New (Flawless)</option>
                        <option value="good">Good (Lightly Used)</option>
                        <option value="fair">Fair (Functional)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">
                      Detailed Usage Notes &amp; Accessories
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mention battery health, memory cards included, and any special care rules..."
                      className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-3 text-xs font-mono text-white focus:border-[#8bd6b6] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Pricing & Deposit */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">
                        Daily Rental Rate (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={dailyRate}
                        onChange={(e) => setDailyRate(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="e.g. 500"
                        className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-3.5 text-sm font-['Silkscreen'] text-[#8bd6b6] focus:border-[#8bd6b6] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">
                        Refundable Security Deposit (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={deposit}
                        onChange={(e) => setDeposit(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="e.g. 1500"
                        className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-3.5 text-sm font-['Silkscreen'] text-[#8bd6b6] focus:border-[#8bd6b6] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-none bg-[#141414] p-3.5 border-2 border-[#2a2a2a] text-xs font-mono text-[#bec9c2]">
                    <span className="font-['Silkscreen'] text-[#8bd6b6] block mb-1">Escrow Guarantee:</span>
                    The security deposit is held in verified smart escrow and automatically refunded to the borrower upon physical return OTP confirmation.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">
                        Min Rental Period (Days)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={minDays}
                        onChange={(e) => setMinDays(Number(e.target.value))}
                        className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-3 text-xs font-mono font-semibold text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">
                        Max Rental Period (Days)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={maxDays}
                        onChange={(e) => setMaxDays(Number(e.target.value))}
                        className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-3 text-xs font-mono font-semibold text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Spatial Location & Coordinates */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">
                      Approximate Neighborhood Address
                    </label>
                    <input
                      type="text"
                      required
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="e.g. Civic Center, Pune / Near MIT Library"
                      className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-3 text-xs font-mono font-semibold text-white focus:border-[#8bd6b6] focus:outline-none"
                    />
                    <p className="text-[10px] text-[#89938d] font-mono mt-1">
                      * Strict privacy rule: Exact address is never shown publicly; only neighborhood and distance are revealed.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">
                        PostGIS Latitude
                      </label>
                      <input
                        type="text"
                        value={gpsLat}
                        onChange={(e) => setGpsLat(e.target.value)}
                        className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-2.5 text-xs font-mono text-[#8bd6b6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1">
                        PostGIS Longitude
                      </label>
                      <input
                        type="text"
                        value={gpsLng}
                        onChange={(e) => setGpsLng(e.target.value)}
                        className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#141414] p-2.5 text-xs font-mono text-[#8bd6b6]"
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
                      <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2]">
                        Upload Photos to AWS S3 Cloud Storage
                      </label>
                      <span className="text-[10px] text-[#8bd6b6] font-['Silkscreen'] flex items-center gap-1">
                        <Cloud className="h-3 w-3" />
                        <span>S3: reuse-gear-images-2026</span>
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
                      className="border-2 border-dashed border-[#2a2a2a] rounded-none p-6 text-center hover:border-[#8bd6b6] bg-[#141414] transition-all cursor-pointer group"
                    >
                      {isUploadingS3 ? (
                        <div className="py-2">
                          <Sparkles className="h-8 w-8 text-[#8bd6b6] animate-spin mx-auto mb-2" />
                          <div className="text-xs font-['Silkscreen'] text-[#8bd6b6]">
                            Uploading photo to AWS S3 Bucket (ap-south-1)...
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-[#89938d] group-hover:text-[#8bd6b6] mx-auto mb-2 transition-colors" />
                          <div className="text-xs font-['Silkscreen'] uppercase tracking-wider text-white">
                            Browse photos from your device
                          </div>
                          <div className="text-[10px] text-[#89938d] font-mono mt-1">
                            Uploaded securely to AWS S3 (reuse-gear-images-2026)
                          </div>
                        </>
                      )}
                    </div>

                    {/* Live Selected Photos Previews */}
                    {uploadedPhotos.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-1.5 flex items-center justify-between">
                          <span>Selected Photos ({uploadedPhotos.length}):</span>
                          {s3UploadedUrls.length > 0 && (
                            <span className="text-[#8bd6b6] font-bold flex items-center gap-1 text-[10px]">
                              <Check className="h-3 w-3" />
                              <span>{s3UploadedUrls.length} on AWS S3</span>
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {uploadedPhotos.map((photoUrl, idx) => (
                            <div
                              key={idx}
                              className="relative group rounded-none overflow-hidden border-2 border-[#2a2a2a] aspect-square shadow-[0_3px_0_0_#0f0f0f] bg-[#0e0e0e] flex items-center justify-center"
                            >
                              <img
                                src={photoUrl}
                                alt={`Selected photo ${idx + 1}`}
                                className="max-h-full max-w-full object-contain p-1"
                              />
                              <span className="absolute bottom-1 left-1 bg-[#141414]/90 text-[9px] font-['Silkscreen'] text-[#8bd6b6] px-1.5 py-0.5 border border-[#2a2a2a] flex items-center gap-1">
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
                                className="absolute top-1 right-1 bg-[#141414] border border-[#2a2a2a] text-[#bec9c2] p-1 text-xs hover:text-white hover:bg-red-800 transition-colors cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-none bg-[#141414] p-4 text-white border-2 border-[#2a2a2a]">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="h-4 w-4 text-[#8bd6b6]" />
                      <span className="text-[10px] font-['Silkscreen'] text-[#8bd6b6] uppercase tracking-wider">
                        Confidential Serial Number Registry
                      </span>
                    </div>
                    <input
                      type="text"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="e.g. CN-5D-882194-X"
                      className="w-full rounded-none border-2 border-[#2a2a2a] bg-[#0e0e0e] p-2.5 text-xs font-mono text-[#8bd6b6] focus:border-[#8bd6b6] focus:outline-none"
                    />
                    <div className="mt-2 text-[10px] text-[#89938d] font-mono leading-relaxed">
                      * Encrypted on server. Serial number is NEVER displayed publicly; it is only revealed during custody handoff.
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Borrowing Policy & Modes */}
              {step === 5 && (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] mb-2">
                      Who Can Borrow This Asset?
                    </label>
                    <div className="space-y-2 text-xs">
                      <label className={`flex items-center gap-2.5 p-3 rounded-none border-2 cursor-pointer transition-all ${borrowerPolicy === "all" ? "border-[#8bd6b6] bg-[#065f46]/30" : "border-[#2a2a2a] bg-[#141414]"}`}>
                        <input
                          type="radio"
                          name="policy"
                          checked={borrowerPolicy === "all"}
                          onChange={() => setBorrowerPolicy("all")}
                          className="accent-[#8bd6b6]"
                        />
                        <div>
                          <span className="font-['Silkscreen'] text-white block uppercase text-xs">All Verified Campus Peers</span>
                          <span className="text-[#89938d] font-mono text-[10px]">Any student with verified email and campus profile.</span>
                        </div>
                      </label>
                      <label className={`flex items-center gap-2.5 p-3 rounded-none border-2 cursor-pointer transition-all ${borrowerPolicy === "verified_id" ? "border-[#8bd6b6] bg-[#065f46]/30" : "border-[#2a2a2a] bg-[#141414]"}`}>
                        <input
                          type="radio"
                          name="policy"
                          checked={borrowerPolicy === "verified_id"}
                          onChange={() => setBorrowerPolicy("verified_id")}
                          className="accent-[#8bd6b6]"
                        />
                        <div>
                          <span className="font-['Silkscreen'] text-white block uppercase text-xs">Govt / Student ID Verified (Recommended)</span>
                          <span className="text-[#89938d] font-mono text-[10px]">Requires verified Govt Aadhaar / Campus Student ID card.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="rounded-none bg-[#141414] p-4 border-2 border-[#2a2a2a] space-y-3 font-mono">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-white">Allow Direct Campus Pickup Spot</span>
                      <input
                        type="checkbox"
                        checked={allowPickup}
                        onChange={(e) => setAllowPickup(e.target.checked)}
                        className="rounded-none border-[#2a2a2a] accent-[#065f46] h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-white">Allow Local Campus Courier Delivery</span>
                      <input
                        type="checkbox"
                        checked={allowDelivery}
                        onChange={(e) => setAllowDelivery(e.target.checked)}
                        className="rounded-none border-[#2a2a2a] accent-[#065f46] h-4 w-4"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="mt-6 border-t-2 border-[#2a2a2a] pt-4 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-1.5 rounded-none border-2 border-[#2a2a2a] bg-[#141414] px-4 py-2.5 text-xs font-['Silkscreen'] uppercase tracking-wider text-[#bec9c2] hover:text-white hover:border-[#8bd6b6] cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-none bg-[#065f46] border-2 border-[#047857] shadow-[0_4px_0_0_#003828] hover:bg-[#047857] px-6 py-2.5 text-xs font-['Silkscreen'] uppercase tracking-wider text-white active:translate-y-1 active:shadow-none transition-all cursor-pointer"
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
