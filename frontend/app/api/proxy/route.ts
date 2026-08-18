import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:7860";

export async function POST(request: Request) {
  try {
    const API_KEY = process.env.API_MANUAL_SECRET_KEY;
    const body = await request.json();
    
    if (!API_KEY) {
      console.error("API_KEY is missing on Vercel");
      return NextResponse.json({ error: "API_MANUAL_SECRET_KEY is missing on server" }, { status: 500 });
    }

    const res = await fetch(`${API_BASE}/api/research`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Backend error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const API_KEY = process.env.API_MANUAL_SECRET_KEY;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    if (!API_KEY) {
      console.error("API_KEY is missing on Vercel");
      return NextResponse.json({ error: "API_MANUAL_SECRET_KEY is missing on server" }, { status: 500 });
    }

    const res = await fetch(`${API_BASE}/api/research/${jobId}`, {
      headers: {
        "x-api-key": API_KEY,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Backend error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
