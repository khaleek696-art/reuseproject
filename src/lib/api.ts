/**
 * RE:USE API Gateway Client
 * Seamlessly connects Next.js Frontend to Python FastAPI Backend (http://localhost:8000/api/v1)
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://reuse-backend-cbc3.onrender.com/api/v1";

export async function checkBackendHealth() {
  try {
    const healthUrl = API_BASE_URL.replace("/api/v1", "") + "/health";
    const res = await fetch(healthUrl, { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "healthy";
  } catch (e) {
    return false;
  }
}

export async function sendOTP(target: string) {
  try {
    const isEmail = target.includes("@");
    const payload = isEmail ? { email: target } : { phone: target };

    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: "OTP service offline. Make sure backend is running." };
  }
}

export async function verifyOTP(target: string, otp: string) {
  try {
    const isEmail = target.includes("@");
    const payload = isEmail
      ? { email: target, phone: target, otp }
      : { phone: target, email: target, otp };

    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.detail || "Invalid 6-digit OTP code" };
    }

    const data = await res.json();
    return { success: true, ...data };
  } catch (e) {
    return { success: false, error: "Authentication service unavailable" };
  }
}

export async function loginWithPassword(target: string, password: string, role = "borrower") {
  try {
    const isEmail = target.includes("@");
    const payload = isEmail
      ? { email: target, password, role }
      : { phone: target, password, role };

    const res = await fetch(`${API_BASE_URL}/auth/login-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.detail || "Invalid login credentials" };
    }

    const data = await res.json();
    return { success: true, ...data };
  } catch (e) {
    return { success: false, error: "Authentication service unavailable" };
  }
}


export async function fetchResourcesApi(category?: string, query?: string) {
  try {
    const url = new URL(`${API_BASE_URL}/resources`);
    if (category && category !== "all") url.searchParams.append("category", category);
    if (query) url.searchParams.append("query", query);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchAIMatchesApi(prompt: string) {
  try {
    const url = new URL(`${API_BASE_URL}/matches`);
    url.searchParams.append("prompt", prompt);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function advanceStageApi(bookingId: string, targetStage: string, otp?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/advance-stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetStage, otp }),
    });
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function fetchChatMessages(bookingId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/${bookingId}/messages`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function sendChatMessage(bookingId: string, senderId: string, senderName: string, content: string, messageType = "text") {
  try {
    const res = await fetch(`${API_BASE_URL}/chat/${bookingId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: senderId,
        sender_name: senderName,
        content,
        message_type: messageType,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export interface StressTestResult {
  baseline_rating: number | null;
  tested_rating: number | null;
  rating_sensitivity: number | null;
  excluded_group_size: number;
  excluded_counterparty_count: number;
  status: string;
  explanation: string;
}

export interface TrustLensProfile {
  user_id: string;
  eligible_review_count: number;
  average_rating: number | null;
  completed_rental_count: number;
  distinct_counterparty_count: number;
  reputation_confidence: "insufficient_evidence" | "limited_evidence" | "moderate_evidence" | "stronger_evidence";
  confidence_headline: string;
  stress_test: StressTestResult;
  reason_codes: string[];
  explanations: string[];
  analyzed_at: string;
}

export async function fetchTrustLensProfile(userId: string): Promise<TrustLensProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/trust/${userId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function submitReviewApi(review: {
  booking_id: string;
  reviewee_id: string;
  rating: number;
  condition_rating?: number;
  communication_rating?: number;
  comment?: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/trust/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.detail || "Failed to submit review" };
    }
    const data = await res.json();
    return { success: true, ...data };
  } catch (e) {
    return { success: false, error: "Network error submitting review" };
  }
}


