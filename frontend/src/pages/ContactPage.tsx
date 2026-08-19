import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { AnimatedHeroBackground } from '../components/ui/AnimatedHeroBackground';
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
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();

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

  // Mouse tracking state for interactive spotlight glow effect
  const [formMousePos, setFormMousePos] = useState({ x: 0, y: 0 });
  const [infoMousePos, setInfoMousePos] = useState({ x: 0, y: 0 });

  const handleFormMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFormMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleInfoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setInfoMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // Sync service requirement from URL query string if navigated from Services or Events page
  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam) {
      setFormData((prev) => ({ ...prev, service: serviceParam }));
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

    // Disallow non-digit characters and limit to maximum 10 digits
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
    <div className="pt-24 min-h-screen bg-[#050505] text-white pb-24 selection:bg-vexo-red selection:text-white">
      {/* 1. HERO HEADER SECTION WITH CINEMATIC PHOTO BACKGROUND */}
      <div className="relative pt-20 pb-28 border-b border-white/10 overflow-hidden bg-[#050505]">
        <AnimatedHeroBackground bgImage="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=2000&q=80" />

        <Container size="md" className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-vexo-red/15 text-vexo-red-bright border border-vexo-red/35 shadow-[0_0_25px_rgba(224,0,0,0.4)] mb-6 animate-pulse">
            <Disc3 className="w-3.5 h-3.5" /> INITIATE PROJECT / INQUIRIES
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-[0.08em] text-white mb-6 leading-none drop-shadow-[0_10px_40px_rgba(0,0,0,0.95)]">
            BOOK A PROJECT
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-neutral-100 font-medium leading-relaxed max-w-2xl mx-auto tracking-wide mb-8 drop-shadow-[0_2px_15px_rgba(0,0,0,0.95)]">
            Connect with VEXO Music Entertainment for original music production, artist management, video shoots, distribution, or brand partnerships.
          </p>
        </Container>
      </div>

      {/* 2. MAIN CONTACT SECTION WITH INTERACTIVE MOUSE SPOTLIGHT */}
      <Container size="lg" className="max-w-6xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: DIRECT CONTACT INFO CARDS */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Interactive Mouse Glowing Info Card */}
            <div
              onMouseMove={handleInfoMouseMove}
              className="group relative p-8 sm:p-10 rounded-3xl bg-neutral-950/80 border border-white/10 hover:border-vexo-red/40 transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Mouse Tracking Radial Spotlight Mask */}
              <div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                style={{
                  background: `radial-gradient(450px circle at ${infoMousePos.x}px ${infoMousePos.y}px, rgba(224, 0, 0, 0.18), transparent 80%)`,
                }}
              />

              <div className="relative z-10 flex flex-col gap-7">
                <h3 className="text-xl font-black uppercase tracking-wider text-white border-l-2 border-vexo-red pl-3.5">
                  DIRECT CONTACT INFO
                </h3>

                {/* Headquarters */}
                <div className="flex items-start gap-4 text-sm text-neutral-300">
                  <div className="p-3.5 rounded-2xl bg-vexo-red/10 border border-vexo-red/20 text-vexo-red-bright shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-0.5">Headquarters & Studio</h4>
                    <p className="text-xs text-neutral-200">SKY CROWN, Office No. 205</p>
                    <p className="text-xs text-neutral-400">Chordiya City, Kamla Nehru Nagar, Ajmer Road</p>
                    <p className="text-xs text-neutral-400">Jaipur, Pin Code- 302021, Rajasthan, India</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 text-sm text-neutral-300">
                  <div className="p-3.5 rounded-2xl bg-vexo-red/10 border border-vexo-red/20 text-vexo-red-bright shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-0.5">Phone & WhatsApp</h4>
                    <a
                      href="tel:+917239999966"
                      className="text-xs font-mono text-white hover:text-vexo-red-bright transition-colors block"
                    >
                      +91 72399-99966
                    </a>
                    <span className="text-[11px] text-neutral-400">Mon - Sat, 10:00 AM - 8:00 PM IST</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 text-sm text-neutral-300">
                  <div className="p-3.5 rounded-2xl bg-vexo-red/10 border border-vexo-red/20 text-vexo-red-bright shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-0.5">Official Email</h4>
                    <a
                      href="mailto:Contact@vexomusic.in"
                      className="text-xs font-mono text-white hover:text-vexo-red-bright transition-colors block"
                    >
                      Contact@vexomusic.in
                    </a>
                    <span className="text-[11px] text-neutral-400">24/7 Priority Support Response</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time Box */}
            <div className="p-6 rounded-2xl bg-neutral-950/80 border border-white/10 flex items-center justify-between text-xs font-mono text-neutral-400 shadow-md">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-vexo-red" />
                <span>Response Time:</span>
              </div>
              <span className="text-white font-bold bg-vexo-red/20 px-3 py-1 rounded-md border border-vexo-red/30 shadow-[0_0_15px_rgba(224,0,0,0.3)]">
                Under 24 Hours
              </span>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: INTERACTIVE BOOKING FORM */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="lg:col-span-7"
          >
            <div
              onMouseMove={handleFormMouseMove}
              className="group relative p-8 sm:p-10 rounded-3xl bg-neutral-950/90 border border-white/10 hover:border-vexo-red/40 transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Mouse Tracking Radial Spotlight Mask */}
              <div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                style={{
                  background: `radial-gradient(550px circle at ${formMousePos.x}px ${formMousePos.y}px, rgba(224, 0, 0, 0.16), transparent 80%)`,
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
                      Start Your Project
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 font-normal">
                      Fill out your requirements below and our production team will get back to you.
                    </p>
                  </div>
                  <Disc3 className="w-6 h-6 text-vexo-red shrink-0" />
                </div>

                {/* API Error Notification */}
                {apiError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3 animate-fadeIn">
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
                    className="p-8 sm:p-10 rounded-2xl bg-vexo-red/10 border border-vexo-red/30 text-center flex flex-col items-center gap-5"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-vexo-red to-vexo-red-bright text-white flex items-center justify-center shadow-[0_0_35px_rgba(224,0,0,0.7)]">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>

                    <h4 className="text-2xl font-black uppercase tracking-wider text-white">
                      Project Request Received!
                    </h4>

                    <p className="text-xs text-neutral-300 max-w-md leading-relaxed">
                      {submissionResult.message}
                    </p>

                    {/* Summary Card */}
                    <div className="w-full bg-neutral-900/90 border border-white/10 rounded-xl p-4 text-left font-mono text-xs text-neutral-400 flex flex-col gap-2 my-2">
                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <span>Reference ID:</span>
                        <span className="text-vexo-red-bright font-bold">{submissionResult.referenceId}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10 pb-2">
                        <span>Selected Service:</span>
                        <span className="text-white">{formData.service}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contact Email:</span>
                        <span className="text-white">{formData.email}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleReset}
                      leftIcon={<RotateCcw className="w-4 h-4" />}
                      className="font-bold tracking-wider text-xs uppercase mt-2 bg-white/5 border border-white/20 hover:bg-white/10 text-white rounded-sm"
                    >
                      SUBMIT ANOTHER REQUEST
                    </Button>
                  </motion.div>
                ) : (
                  /* FORM INPUTS WITH SMOOTH FOCUS GLOW */
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-vexo-red" /> Your Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          disabled={isLoading}
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:bg-white/10 ${
                            errors.name
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-white/10 focus:border-vexo-red focus:shadow-[0_0_20px_rgba(224,0,0,0.25)]'
                          }`}
                        />
                        {errors.name && <p className="text-[11px] text-red-400 mt-1.5">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-vexo-red" /> Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          disabled={isLoading}
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:bg-white/10 ${
                            errors.email
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-white/10 focus:border-vexo-red focus:shadow-[0_0_20px_rgba(224,0,0,0.25)]'
                          }`}
                        />
                        {errors.email && <p className="text-[11px] text-red-400 mt-1.5">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Phone & Company Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
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
                          className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-300 focus:bg-white/10 ${
                            errors.phone
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-white/10 focus:border-vexo-red focus:shadow-[0_0_20px_rgba(224,0,0,0.25)]'
                          }`}
                        />
                        {errors.phone && <p className="text-[11px] text-red-400 mt-1.5">{errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-vexo-red" /> Company / Brand
                        </label>
                        <input
                          type="text"
                          name="company"
                          disabled={isLoading}
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="VEXO Records / Independent"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-vexo-red focus:shadow-[0_0_20px_rgba(224,0,0,0.25)] focus:bg-white/10 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Service Dropdown */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Disc3 className="w-3.5 h-3.5 text-vexo-red" /> Service Required *
                        </span>
                        {searchParams.get('service') && (
                          <span className="text-[10px] font-mono text-vexo-red-bright uppercase tracking-widest bg-vexo-red/10 px-2 py-0.5 rounded border border-vexo-red/20">
                            Auto-Selected from Link
                          </span>
                        )}
                      </label>
                      <select
                        name="service"
                        disabled={isLoading}
                        value={formData.service}
                        onChange={handleChange}
                        className={`w-full bg-[#121212] border rounded-xl px-4 py-3.5 text-xs text-white outline-none transition-all duration-300 focus:border-vexo-red focus:shadow-[0_0_20px_rgba(224,0,0,0.25)] ${
                          errors.service ? 'border-red-500 focus:border-red-500' : 'border-white/10'
                        }`}
                      >
                        {serviceOptions.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#121212] text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                      {errors.service && <p className="text-[11px] text-red-400 mt-1.5">{errors.service}</p>}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-vexo-red" /> Project Message *
                      </label>
                      <textarea
                        rows={5}
                        name="message"
                        disabled={isLoading}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your project requirements, timeline, budget, or ideas..."
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3.5 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-300 resize-none focus:bg-white/10 ${
                          errors.message
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-white/10 focus:border-vexo-red focus:shadow-[0_0_20px_rgba(224,0,0,0.25)]'
                        }`}
                      />
                      {errors.message && <p className="text-[11px] text-red-400 mt-1.5">{errors.message}</p>}
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
                      className="w-full font-extrabold uppercase tracking-widest text-xs py-4 bg-gradient-to-r from-[#FF4D4D] to-[#E00000] text-white hover:shadow-[0_0_35px_rgba(255,77,77,0.5)] transition-all duration-300 border-none rounded-md"
                    >
                      {isLoading ? 'SUBMITTING REQUEST...' : 'SEND MESSAGE'}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default ContactPage;
