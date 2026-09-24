import type { ContactFormData, ContactResponse } from '../../types';
import type { ApiResponse } from './types';
import { apiFetch, USE_MOCK_DATA } from './client';
import { submitContactForm } from '../../services/contactService';
import { adminMockStore } from '../../admin/services/adminMockStore';

export async function submitContact(
  formData: ContactFormData
): Promise<ApiResponse<ContactResponse>> {
  if (USE_MOCK_DATA) {
    const result = await submitContactForm(formData);
    return {
      success: result.success,
      data: result,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }

  // Real backend call to Fastify /api/contact -> Supabase & DatabaseStore
  const res = await apiFetch<ContactResponse>('/contact', {
    method: 'POST',
    body: JSON.stringify(formData),
  });

  if (!res.success) {
    throw new Error(res.message || 'Failed to submit contact request');
  }

  if (res.data) {
    adminMockStore.createInquiry({
      referenceId: res.data.referenceId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      company: formData.company || '',
      service: formData.service || 'General Inquiry',
      message: formData.message,
    });
  }

  return res;
}
