import { NextRequest, NextResponse } from "next/server";

// Option 1: Named export
export function middleware(request: NextRequest) {
  // Your middleware logic
  return NextResponse.next();
}