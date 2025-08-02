import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🚨 GET /auth/signup requested');
  console.log('📋 User Agent:', request.headers.get('user-agent'));
  console.log('📋 Referer:', request.headers.get('referer'));
  console.log('📋 Origin:', request.headers.get('origin'));
  
  return NextResponse.redirect(new URL('/signup', request.url));
}

export async function POST(request: NextRequest) {
  console.log('🚨 POST /auth/signup requested');
  console.log('📋 User Agent:', request.headers.get('user-agent'));
  console.log('📋 Referer:', request.headers.get('referer'));
  console.log('📋 Origin:', request.headers.get('origin'));
  
  return NextResponse.redirect(new URL('/signup', request.url));
} 