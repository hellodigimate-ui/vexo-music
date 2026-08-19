import type { ContactFormData, ContactResponse } from '../../types';
import type { ApiResponse } from './types';
import { apiFetch } from './client';
import { submitContactForm } from '../../services/contactService';
import { adminMockStore } from '../../admin/services/adminMockStore';

export async function submitContact(
  formData: ContactFormData
): Promise<ApiResponse<ContactResponse>> {
  try {
    const res = await apiFetch<ContactResponse>('/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
    if (res.success && res.data) {
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
  } catch (error: any) {
    console.warn('[Contact API] Post to Fastify failed, falling back to mock handler.', error.message);
    const result = await submitContactForm(formData);
    return {
      success: result.success,
      data: result,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }
}
