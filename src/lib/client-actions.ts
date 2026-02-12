export default async function uploadProfileImage(memberId: string, formData: FormData) {
  const url = `/api/member/upload?memberId=${encodeURIComponent(memberId)}`;
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  try {
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Invalid JSON response from upload endpoint' };
  }
}
