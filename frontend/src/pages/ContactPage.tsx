import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { contactApi } from '../lib/api';
import type { ContactFormData, ContactResponse } from '../types';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Disc3,
  Building2,
  User,
  MessageSquare,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'Music Production',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<ContactResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Sync service requirement and plan from URL query string if navigated from Services page
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    const planParam = searchParams.get('plan');
    if (serviceParam) {
      setFormData((prev) => ({
        ...prev,
        service: serviceParam,
        message:
          prev.message ||
          (planParam
            ? `Hello, I would like to book the "${planParam}" plan for ${serviceParam}. Here are my project details:`
            : prev.message),
      }));
    }
    if (planParam) {
      setSelectedPlan(planParam);
    }
  }, [searchParams]);

  const serviceOptions = [
    'Music Production',
    'Mixing & Mastering',
    'Audio & Video Production',
    'Artist Management',
    'Music Distribution',
    'Digital Marketing',
    'Brand Collaboration',
    'Pre-Wedding Shoot',
    'Other',
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.service) {
      newErrors.service = 'Please select a service requirement.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Project message is required.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
    }

    if (formData.phone && formData.phone.trim()) {
      const cleanPhone = formData.phone.trim().replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        newErrors.phone = 'Phone number must be a valid 10-digit number.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'phone') {
      finalValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const response = await contactApi.submitContact(formData);
      setSubmissionResult(response.data);
    } catch (err: any) {
      setApiError(err.message || 'An unexpected network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      service: 'Music Production',
      message: '',
    });
    setErrors({});
    setSubmissionResult(null);
    setApiError(null);
  };

  return (
    <div className="pt-20 min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-white pb-24 transition-colors duration-300">
      {/* 1. HERO HEADER SECTION (Adaptive for Light & Dark Mode) */}
      <div className="relative pt-16 pb-20 border-b border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#07070a] transition-colors duration-300">
        {/* Subtle Ambient Red Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-vexo-red/5 dark:bg-vexo-red/10 rounded-full blur-[140px] pointer-events-none" />

        <Container size="md" className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-red-50 dark:bg-vexo-red/10 text-vexo-red border border-red-200 dark:border-vexo-red/30 mb-6">
            <Disc3 className="w-3.5 h-3.5 text-vexo-red" /> INITIATE PROJECT / INQUIRIES
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-slate-950 dark:text-white mb-5 leading-none select-none">
            BOOK A <span className="text-vexo-red">PROJECT</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-zinc-300 font-normal leading-relaxed max-w-2xl mx-auto tracking-wide">
            Connect with VEXO Music Entertainment for original music production, artist management, video shoots, distribution, or brand partnerships.
          </p>
        </Container>
      </div>

      {/* 2. MAIN CONTACT SECTION */}
      <Container size="lg" className="max-w-6xl mx-auto px-4 mt-10 sm:mt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: DIRECT CONTACT INFO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Direct Contact Info Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl transition-all duration-300">
              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-black uppercase tracking-wider text-slate-950 dark:text-white border-l-2 border-vexo-red pl-3">
                  DIRECT CONTACT INFO
                </h3>

                {/* Headquarters */}
                <div className="flex items-start gap-3.5 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-vexo-red/10 border border-red-100 dark:border-vexo-red/20 text-vexo-red shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                      Headquarters & Studio
                    </h4>
                    <p className="text-slate-700 dark:text-zinc-300">SKY CROWN, Office No. 205</p>
                    <p className="text-slate-500 dark:text-zinc-400">Chordiya City, Kamla Nehru Nagar, Ajmer Road</p>
                    <p className="text-slate-500 dark:text-zinc-400">Jaipur, Pin Code- 302021, Rajasthan, India</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3.5 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-vexo-red/10 border border-red-100 dark:border-vexo-red/20 text-vexo-red shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                      Phone & WhatsApp
                    </h4>
                    <a
                      href="tel:+917239999966"
                      className="text-xs font-mono font-bold text-slate-900 dark:text-white hover:text-vexo-red transition-colors block"
                    >
                      +91 72399-99966
                    </a>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">Mon - Sat, 10:00 AM - 8:00 PM IST</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="p-2.5 rounded-xl bg-red-50 dark:bg-vexo-red/10 border border-red-100 dark:border-vexo-red/20 text-vexo-red shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                      Official Email
                    </h4>
                    <a
                      href="mailto:Contact@vexomusic.in"
                      className="text-xs font-mono font-bold text-slate-900 dark:text-white hover:text-vexo-red transition-colors block"
                    >
                      Contact@vexomusic.in
                    </a>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">24/7 Priority Support Response</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time Box */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-zinc-400 shadow-2xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-vexo-red" />
                <span>Response Time:</span>
              </div>
              <span className="text-vexo-red font-bold bg-red-50 dark:bg-vexo-red/10 px-2.5 py-1 rounded-md border border-red-200 dark:border-vexo-red/20 text-[11px]">
                Under 24 Hours
              </span>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: BOOKING FORM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-slate-950 dark:text-white">
                    Start Your Project
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-normal">
                    Fill out your requirements below and our production team will get back to you.
                  </p>
                </div>
                <Disc3 className="w-6 h-6 text-vexo-red shrink-0" />
              </div>

              {/* Selected Plan Notification Pill */}
              {selectedPlan && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-vexo-red/10 border border-red-200 dark:border-vexo-red/30 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                    <Sparkles className="w-4 h-4 text-vexo-red shrink-0" />
                    <span>
                      Selected Package: <strong>{formData.service}</strong> —{' '}
                      <span className="text-vexo-red font-bold">{selectedPlan}</span>
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 hidden sm:inline">
                    Plan Selected ✓
                  </span>
                </div>
              )}

              {/* API Error Notification */}
              {apiError && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div className="flex-1">
                    <span className="font-bold block">Submission Failure</span>
                    <span>{apiError}</span>
                  </div>
                </div>
              )}

              {/* SUCCESS STATE */}
              {submissionResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 sm:p-10 rounded-2xl bg-red-50 dark:bg-vexo-red/10 border border-red-200 dark:border-vexo-red/30 text-center flex flex-col items-center gap-5"
                >
                  <div className="w-16 h-16 rounded-full bg-vexo-red text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <h4 className="text-2xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Project Request Received!
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-md leading-relaxed">
                    {submissionResult.message}
                  </p>

                  {/* Summary Card */}
                  <div className="w-full bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-left font-mono text-xs text-slate-600 dark:text-zinc-400 flex flex-col gap-2 my-2">
                    <div className="flex justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                      <span>Reference ID:</span>
                      <span className="text-vexo-red font-bold">{submissionResult.referenceId}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                      <span>Selected Service:</span>
                      <span className="text-slate-900 dark:text-white">{formData.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contact Email:</span>
                      <span className="text-slate-900 dark:text-white">{formData.email}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleReset}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                    className="font-bold tracking-wider text-xs uppercase mt-2 border-slate-300 dark:border-white/20"
                  >
                    SUBMIT ANOTHER REQUEST
                  </Button>
                </motion.div>
              ) : (
                /* FORM INPUTS */
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-vexo-red" /> Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        disabled={isLoading}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full bg-slate-50 dark:bg-white/5 border rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none transition-all duration-200 focus:bg-white dark:focus:bg-white/10 focus:border-vexo-red focus:ring-2 focus:ring-vexo-red/20 shadow-2xs ${
                          errors.name ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                        }`}
                      />
                      {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-vexo-red" /> Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        disabled={isLoading}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={`w-full bg-slate-50 dark:bg-white/5 border rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none transition-all duration-200 focus:bg-white dark:focus:bg-white/10 focus:border-vexo-red focus:ring-2 focus:ring-vexo-red/20 shadow-2xs ${
                          errors.email ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                        }`}
                      />
                      {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  {/* Phone & Company Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-vexo-red" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        inputMode="numeric"
                        maxLength={10}
                        disabled={isLoading}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="9876543210 (10 digits)"
                        className={`w-full bg-slate-50 dark:bg-white/5 border rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none transition-all duration-200 focus:bg-white dark:focus:bg-white/10 focus:border-vexo-red focus:ring-2 focus:ring-vexo-red/20 shadow-2xs ${
                          errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                        }`}
                      />
                      {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-vexo-red" /> Company / Brand
                      </label>
                      <input
                        type="text"
                        name="company"
                        disabled={isLoading}
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="VEXO Records / Independent"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-vexo-red focus:ring-2 focus:ring-vexo-red/20 focus:bg-white dark:focus:bg-white/10 transition-all duration-200 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Service Dropdown */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Disc3 className="w-3.5 h-3.5 text-vexo-red" /> Service Required *
                      </span>
                      {searchParams.get('service') && (
                        <span className="text-[10px] font-mono text-vexo-red uppercase tracking-widest bg-red-50 dark:bg-vexo-red/10 px-2 py-0.5 rounded border border-red-200 dark:border-vexo-red/20 font-bold">
                          Auto-Selected
                        </span>
                      )}
                    </label>
                    <select
                      name="service"
                      disabled={isLoading}
                      value={formData.service}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 dark:bg-zinc-900 border rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white outline-none transition-all duration-200 focus:border-vexo-red focus:ring-2 focus:ring-vexo-red/20 shadow-2xs ${
                        errors.service ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                      }`}
                    >
                      {serviceOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    {errors.service && <p className="text-[11px] text-red-500 mt-1">{errors.service}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-vexo-red" /> Project Message *
                    </label>
                    <textarea
                      rows={4}
                      name="message"
                      disabled={isLoading}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project requirements, timeline, budget, or ideas..."
                      className={`w-full bg-slate-50 dark:bg-white/5 border rounded-xl px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none transition-all duration-200 resize-none focus:bg-white dark:focus:bg-white/10 focus:border-vexo-red focus:ring-2 focus:ring-vexo-red/20 shadow-2xs ${
                        errors.message ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                      }`}
                    />
                    {errors.message && <p className="text-[11px] text-red-500 mt-1">{errors.message}</p>}
                  </div>

                  {/* Submit Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={isLoading}
                    rightIcon={
                      isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 ml-1" />
                      )
                    }
                    className="w-full font-bold uppercase tracking-wider text-xs py-4 bg-vexo-red text-white hover:bg-red-700 transition-colors shadow-sm rounded-xl cursor-pointer"
                  >
                    {isLoading ? 'SUBMITTING REQUEST...' : 'SEND MESSAGE'}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default ContactPage;
