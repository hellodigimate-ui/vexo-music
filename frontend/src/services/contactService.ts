import type { ContactFormData, ContactResponse } from '../types';
import { adminMockStore } from '../admin/services/adminMockStore';

/**
 * API-ready service for processing contact and project booking submissions.
 * Syncs directly with VEXO Admin Inquiries store.
 */
export const submitContactForm = async (data: ContactFormData): Promise<ContactResponse> => {
  // Simulate slight network delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Client-side fallback check
  if (!data.name || !data.email || !data.message) {
    throw new Error('Please fill in all required fields.');
  }

  // Generate unique tracking reference ID (e.g., VEXO-2026-8942)
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const referenceId = `VEXO-2026-${randomId}`;

  // Persist directly into Admin Inquiries store
  try {
    adminMockStore.createInquiry({
      referenceId,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      company: data.company || '',
      service: data.service || 'General Inquiry',
      message: data.message,
    });
  } catch (err) {
    console.warn('[ContactService] Failed to persist inquiry to local store:', err);
  }

  return {
    success: true,
    message: 'Your project request has been submitted successfully! Our team will contact you within 24 hours.',
    referenceId,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
};
