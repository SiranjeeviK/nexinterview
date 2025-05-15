import { NextResponse } from 'next/server';
import { signOutServer } from '@/lib/actions/auth.action';

export async function POST() {
  await signOutServer();
  return NextResponse.json({ success: true });
} 