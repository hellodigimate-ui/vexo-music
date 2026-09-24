import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import {
  WEDDING_STUDIO_INFO,
  PRE_WEDDING_PACKAGES,
  ADD_ON_SERVICES,
  type PreWeddingPackage,
  type AddOnService,
} from '../../data/weddingData';
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { InstagramIcon } from '../common/InstagramIcon';

interface BookDateSectionProps {
  selectedPackageId?: string;
  selectedAddOnIds?: string[];
  initialNotes?: string;
  studioInfo?: any;
  packages?: PreWeddingPackage[];
  addOns?: AddOnService[];
  badgeText?: string;
  serviceTypeLabel?: string;
}

export const BookDateSection: React.FC<BookDateSectionProps> = ({
  selectedPackageId,
  selectedAddOnIds = [],
  initialNotes = '',
  studioInfo = WEDDING_STUDIO_INFO,
  packages = PRE_WEDDING_PACKAGES,
  addOns = ADD_ON_SERVICES,
  badgeText = 'BOOK YOUR DATE',
  serviceTypeLabel = 'Wedding Photography | Cinematography | Pre-Wedding | Wedding Films',
}) => {
  const [coupleNames, setCoupleNames] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [location, setLocation] = useState<string>('Jaipur');
  const [currentPackage, setCurrentPackage] = useState<string>(
    selectedPackageId || (packages && packages.length > 0 ? packages[0].id : 'gold')
  );
  const [currentAddOns, setCurrentAddOns] = useState<string[]>(selectedAddOnIds);
  const [notes, setNotes] = useState<string>(initialNotes);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Sync props if passed
  React.useEffect(() => {
    if (selectedPackageId) {
      setCurrentPackage(selectedPackageId);
    } else if (packages && packages.length > 0 && !packages.some((p) => p.id === currentPackage)) {
      setCurrentPackage(packages[0].id);
    }
  }, [selectedPackageId, packages]);

  React.useEffect(() => {
    if (selectedAddOnIds) {
      setCurrentAddOns(selectedAddOnIds);
    }
  }, [selectedAddOnIds]);

  React.useEffect(() => {
    if (initialNotes) {
      setNotes(initialNotes);
    }
  }, [initialNotes]);

  const toggleAddOn = (addonId: string) => {
    setCurrentAddOns((prev: string[]) =>
      prev.includes(addonId) ? prev.filter((id: string) => id !== addonId) : [...prev, addonId]
    );
  };

  // Pricing calculation
  const basePackage = packages.find((p: PreWeddingPackage) => p.id === currentPackage);
  const basePrice: number = basePackage ? basePackage.priceINR : 39999;

  const addOnsTotal: number = currentAddOns.reduce((sum: number, addonId: string) => {
    const item = addOns.find((a: AddOnService) => a.id === addonId);
    return sum + (item ? item.priceINR : 0);
  }, 0);

  const totalEstimate: number = basePrice + addOnsTotal;

  const handleWhatsAppBooking = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const selectedAddonTitles = currentAddOns
      .map((id: string) => addOns.find((a: AddOnService) => a.id === id)?.title)
      .filter(Boolean)
      .join(', ');

    const message = encodeURIComponent(
      `💍 *${studioInfo?.name || WEDDING_STUDIO_INFO.name} — DATE RESERVATION INQUIRY*\n\n` +
      `• *Couple:* ${coupleNames || 'Not specified'}\n` +
      `• *Selected Package:* ✦ ${basePackage?.name || 'Custom'} (${basePackage?.priceDisplay || ''})\n` +
      `• *Event/Shoot Date:* ${eventDate || 'To be discussed'}\n` +
      `• *Location:* ${location}\n` +
      `• *Add-Ons:* ${selectedAddonTitles || 'None'}\n` +
      `• *Estimated Investment:* ₹${totalEstimate.toLocaleString('en-IN')}\n` +
      `• *Phone:* ${phone}\n` +
      `• *Email:* ${email}\n` +
      `• *Notes:* ${notes || 'Looking forward to your response'}\n\n` +
      `Please confirm availability for our dates!`
    );

    window.open(`https://wa.me/${studioInfo?.whatsappNumber || WEDDING_STUDIO_INFO.whatsappNumber}?text=${message}`, '_blank');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section id="book-your-date" className="cinematic-dark py-24 bg-[#050505] text-white relative overflow-hidden border-t border-white/5 scroll-mt-10">
      {/* Anchor for alternate id */}
      <div id="book-date" className="absolute -top-24 left-0 pointer-events-none" />
      {/* Glow effects */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-vexo-red/10 rounded-full blur-[150px] pointer-events-none opacity-20" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-vexo-red/10 rounded-full blur-[150px] pointer-events-none opacity-20" />

      <Container>
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vexo-red/10 border border-vexo-red/30 text-xs font-mono font-bold tracking-widest text-vexo-red uppercase mb-4">
            <Calendar className="w-3.5 h-3.5 text-vexo-red" />
            <span>{badgeText}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-3">
            {studioInfo?.name || WEDDING_STUDIO_INFO.name}
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 font-medium tracking-wide mb-2">
            {serviceTypeLabel}
          </p>

          <p className="text-xs font-mono uppercase tracking-[0.25em] text-vexo-red font-bold">
            YOUR MOMENTS. OUR STORYTELLING.
          </p>
        </div>

        {/* Form & Contact Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">

          {/* Booking Engine Form (Left 7 cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-[#0c0c0f] border border-white/15 p-6 sm:p-8 backdrop-blur-xl relative shadow-2xl">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-vexo-red/20 border border-vexo-red flex items-center justify-center text-vexo-red">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black uppercase text-white">
                  Thank You, {coupleNames || 'Lovebirds'}!
                </h3>
                <p className="text-sm text-zinc-300 max-w-md">
                  Your reservation inquiry has been received. Our senior cinematography director will connect with you within 4 hours.
                </p>
                <Button
                  onClick={handleWhatsAppBooking}
                  className="mt-4 font-bold text-xs uppercase px-6 py-3 rounded-xl shadow-lg"
                >
                  Chat with Us on WhatsApp Now
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <Sparkles className="w-4 h-4 text-vexo-red" />
                  <h3 className="text-lg font-bold text-white uppercase tracking-wide">Date Availability & Inquiry</h3>
                </div>

                {/* Couple Names */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 font-mono">
                    Couple Names (Bride & Groom) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul & Simran"
                    value={coupleNames}
                    onChange={(e) => setCoupleNames(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red text-white text-sm outline-none transition-all placeholder:text-zinc-600"
                  />
                </div>

                {/* Contact Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 font-mono">
                      WhatsApp / Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red text-white text-sm outline-none transition-all placeholder:text-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 font-mono">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="couple@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red text-white text-sm outline-none transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Date & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 font-mono">
                      Estimated Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red text-white text-sm outline-none transition-all text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 font-mono">
                      Shoot Location / City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jaipur, Udaipur, Goa..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red text-white text-sm outline-none transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Package Selection Radio Buttons */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 font-mono">
                    Select Package Tier
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {packages.map((pkg: PreWeddingPackage) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setCurrentPackage(pkg.id)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          currentPackage === pkg.id
                            ? 'bg-[#18080a] border-vexo-red text-vexo-red shadow-md'
                            : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        <span className="block text-xs font-bold uppercase">✦ {pkg.name}</span>
                        <span className="text-[11px] font-mono text-white font-semibold">
                          {pkg.priceDisplay}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add-ons Quick Multi-Select */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 font-mono">
                    Quick Add-ons (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {addOns.slice(0, 6).map((addon: AddOnService) => {
                      const isSelected = currentAddOns.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => toggleAddOn(addon.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-vexo-red/15 border-vexo-red text-white'
                              : 'bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {addon.title} ({addon.priceDisplay})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2 font-mono">
                    Any Special Concept / Requests
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your dream shoot style, outfits, or story..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red text-white text-sm outline-none transition-all placeholder:text-zinc-600"
                  />
                </div>

                {/* Investment Total Bar */}
                <div className="p-4 rounded-xl bg-black/60 border border-vexo-red/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 block font-medium font-mono">Estimated Package Total:</span>
                    <span className="text-2xl font-black text-vexo-red">
                      ₹{totalEstimate.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono font-medium">+ GST</span>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Submit Booking Request
                  </Button>

                  <Button
                    type="button"
                    onClick={handleWhatsAppBooking}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Instant WhatsApp Booking</span>
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Right Direct Contact Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Contact Details Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-[#12080a] to-[#07070a] border border-vexo-red/40 shadow-xl space-y-6">
              <div>
                <h3 className="text-2xl font-black uppercase mb-2 text-white">
                  Direct Studio Contact
                </h3>
                <p className="text-xs text-zinc-400">
                  Connect directly with our production leads for date holds and destination travel logistics.
                </p>
              </div>

              <div className="space-y-4">
                {/* Phone */}
                <a
                  href={`tel:${studioInfo?.phone || WEDDING_STUDIO_INFO.phone}`}
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-vexo-red/40 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-vexo-red/15 text-vexo-red group-hover:bg-vexo-red group-hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                      Call / WhatsApp
                    </span>
                    <span className="text-sm font-bold text-white group-hover:text-vexo-red-bright transition-colors">
                      {studioInfo?.displayPhone || studioInfo?.phone || WEDDING_STUDIO_INFO.displayPhone}
                    </span>
                  </div>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${studioInfo?.email || WEDDING_STUDIO_INFO.email}`}
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-vexo-red/40 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-vexo-red/15 text-vexo-red group-hover:bg-vexo-red group-hover:text-white transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                      Official Inquiries
                    </span>
                    <span className="text-sm font-bold text-white group-hover:text-vexo-red-bright transition-colors">
                      {studioInfo?.email || WEDDING_STUDIO_INFO.email}
                    </span>
                  </div>
                </a>

                {/* Instagram */}
                <a
                  href={studioInfo?.instagramUrl || WEDDING_STUDIO_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-vexo-red/40 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-vexo-red/15 text-vexo-red group-hover:bg-vexo-red group-hover:text-white transition-colors">
                    <InstagramIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                      Official Instagram
                    </span>
                    <span className="text-sm font-bold text-vexo-red">
                      {studioInfo?.instagramHandle || WEDDING_STUDIO_INFO.instagramHandle}
                    </span>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="p-3 rounded-xl bg-vexo-red/15 text-vexo-red">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block font-mono">
                      Studio Hubs
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">
                      {studioInfo?.location || WEDDING_STUDIO_INFO.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tagline & Copyright Footer */}
              <div className="pt-4 border-t border-white/10 text-center space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-vexo-red font-bold font-mono">
                  YOUR MOMENTS. OUR STORYTELLING.
                </p>
                <p className="text-[11px] text-zinc-500 font-medium">
                  ©️ Vexo Wedding Studio
                </p>
              </div>
            </div>

            {/* Quick Guarantees Pill */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2 text-zinc-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-vexo-red" />
                <span>Zero Hidden Fees — 100% Transparent Contracts</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-vexo-red" />
                <span>Dual Sony Cinema Cameras for 100% Redundancy</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-200 font-medium">
                <CheckCircle2 className="w-4 h-4 text-vexo-red" />
                <span>Fast 14-Day Delivery for Highlights & Reels</span>
              </div>
            </div>

          </div>

        </div>
      </Container>
    </section>
  );
};

export default BookDateSection;
