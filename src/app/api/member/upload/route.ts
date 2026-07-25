import { NextResponse } from 'next/server';
import { uploadProfileImage as serverUpload } from '@/lib/actions';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const memberId = url.searchParams.get('memberId');
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Missing memberId' }, { status: 400 });
    }

    const formData = await req.formData();
    const result = await serverUpload(memberId, formData as any);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('API /api/member/upload error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
