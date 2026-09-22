import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Save,
  ExternalLink,
  Crown,
  Sliders,
  Plus,
  Trash2,
  Building,
  Layers,
  Award,
  ChevronLeft,
  ChevronRight,
  Camera,
  Film,
  User,
  Heart,
  Play,
  Image as ImageIcon,
  RefreshCw,
  Check,
  Upload,
  UploadCloud,
  Loader2,
} from 'lucide-react';
import { MediaInput } from '../components/media/MediaInput';
import { adminPreWeddingApi, adminMediaApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';
import { getMediaUrl } from '../../lib/utils';
import { DEFAULT_WEDDING_PLANS } from '../../data/weddingData';

type TabKey =
  | 'info'
  | 'packages'
  | 'gallery'
  | 'videos'
  | 'director'
  | 'stories'
  | 'addons'
  | 'customServices'
  | 'pillars';

export const AdminPreWeddingPage: React.FC = () => {
  const toast = useAdminToast();
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [packageSubTab, setPackageSubTab] = useState<'pre-wedding' | 'wedding'>('pre-wedding');

  // Tabs Slider ref and scroll state
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkTabsScroll = useCallback(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkTabsScroll();
    const el = tabsContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkTabsScroll, { passive: true });
    window.addEventListener('resize', checkTabsScroll);
    return () => {
      el.removeEventListener('scroll', checkTabsScroll);
      window.removeEventListener('resize', checkTabsScroll);
    };
  }, [checkTabsScroll]);

  const slideTabs = (direction: 'left' | 'right') => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const distance = 260;
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [galleryDragOver, setGalleryDragOver] = useState(false);
  const [dragOverCardIndex, setDragOverCardIndex] = useState<number | null>(null);
  const [uploadingCardIndex, setUploadingCardIndex] = useState<number | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const fetchPreWeddingData = async () => {
    try {
      setIsLoading(true);
      const res = await adminPreWeddingApi.get();
      if (res.success && res.data) {
        const payload = { ...res.data };
        if (!payload.weddingPackages || payload.weddingPackages.length === 0) {
          payload.weddingPackages = DEFAULT_WEDDING_PLANS;
        }
        setData(payload);
        setIsDirty(false);
      }
    } catch (err: any) {
      toast.error('Failed to load pre-wedding data', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreWeddingData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!data) return;

    setIsSaving(true);
    try {
      const res = await adminPreWeddingApi.update(data);
      if (res.success) {
        toast.success(
          'Pre-Wedding Studio Updated',
          'All packages, galleries, videos, and studio settings saved successfully.'
        );
        setIsDirty(false);
      }
    } catch (err: any) {
      toast.error('Save failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data]);

  // --- Form update helpers ---

  // Studio info
  const updateStudioInfo = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      studioInfo: {
        ...prev.studioInfo,
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  // Hero highlights stats
  const updateHeroStat = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const list = [...(prev.heroStats || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, heroStats: list };
    });
    setIsDirty(true);
  };

  // Packages & Wedding Plans CRUD
  const addPackage = (targetKey: 'packages' | 'weddingPackages' = packageSubTab === 'wedding' ? 'weddingPackages' : 'packages') => {
    const isWedding = targetKey === 'weddingPackages';
    const newPkg = isWedding
      ? {
          id: `wedding-plan-${Date.now()}`,
          category: 'WEDDING',
          name: 'NEW WEDDING PLAN',
          tagline: 'For custom wedding celebrations',
          priceINR: 0,
          priceDisplay: 'Custom Quote',
          badge: 'WEDDING DAY',
          isPopular: false,
          highlightText: 'Complete wedding day coverage capturing every ritual and ceremony.',
          foodTravel: 'Food, Travel — Paid By Client / Company',
          ctaText: 'Choose Wedding Plan',
          whatsappMessage: 'Hello VEXO Wedding Studio! I am interested in this wedding plan.',
          photography: {
            photographersCount: 'Professional Wedding Photographers',
            cameraSetup: 'Sony Cinema Setup',
            details: ['Traditional & Candid Photography'],
          },
          cinematography: {
            cinematographersCount: 'Professional Cinematographer',
            cameraSetup: 'Sony Cinema Setup',
            details: ['Cinematic Wedding Film'],
          },
          deliverables: ['Edited Photographs', 'Highlight Wedding Film'],
          shoot: {
            days: '1 Shoot Day',
            locations: '1 Location',
          },
          bonus: [],
        }
      : {
          id: `pkg-${Date.now()}`,
          category: 'PRE_WEDDING',
          name: 'NEW TIER',
          tagline: 'Perfect for intimate shoots',
          priceINR: 29999,
          priceDisplay: '₹29,999',
          badge: 'BESPOKE',
          isPopular: false,
          highlightText: 'Cinematic camera setups with personalized storytelling.',
          photography: {
            photographersCount: '1 Photographer',
            cameraSetup: 'Prime Camera Setup',
            details: ['Candid & Portrait Photography'],
          },
          cinematography: {
            cinematographersCount: '1 Cinematographer',
            cameraSetup: 'Sony Cinema Setup',
            details: ['Cinematic video highlights'],
          },
          deliverables: ['1 Pre-Wedding Film', '2 Reels', 'Edited Photos'],
          shoot: {
            days: '1 Day Shoot',
            locations: '1 Location',
          },
          bonus: ['Couple Portrait Session'],
        };

    setData((prev: any) => ({
      ...prev,
      [targetKey]: [...(prev[targetKey] || (isWedding ? DEFAULT_WEDDING_PLANS : [])), newPkg],
    }));
    setIsDirty(true);
  };

  const removePackage = (index: number, targetKey: 'packages' | 'weddingPackages' = packageSubTab === 'wedding' ? 'weddingPackages' : 'packages') => {
    if (!window.confirm('Are you sure you want to delete this package tier?')) return;
    setData((prev: any) => {
      const list = [...(prev[targetKey] || (targetKey === 'weddingPackages' ? DEFAULT_WEDDING_PLANS : []))];
      list.splice(index, 1);
      return { ...prev, [targetKey]: list };
    });
    setIsDirty(true);
  };

  const updatePackage = (index: number, field: string, value: any, targetKey: 'packages' | 'weddingPackages' = packageSubTab === 'wedding' ? 'weddingPackages' : 'packages') => {
    setData((prev: any) => {
      const list = [...(prev[targetKey] || (targetKey === 'weddingPackages' ? DEFAULT_WEDDING_PLANS : []))];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [targetKey]: list };
    });
    setIsDirty(true);
  };

  const updatePackageNested = (index: number, parent: string, field: string, value: any, targetKey: 'packages' | 'weddingPackages' = packageSubTab === 'wedding' ? 'weddingPackages' : 'packages') => {
    setData((prev: any) => {
      const list = [...(prev[targetKey] || (targetKey === 'weddingPackages' ? DEFAULT_WEDDING_PLANS : []))];
      list[index] = {
        ...list[index],
        [parent]: {
          ...(list[index][parent] || {}),
          [field]: value,
        },
      };
      return { ...prev, [targetKey]: list };
    });
    setIsDirty(true);
  };

  const updatePackageList = (packageIndex: number, listField: 'deliverables' | 'bonus', itemIndex: number, value: string, targetKey: 'packages' | 'weddingPackages' = packageSubTab === 'wedding' ? 'weddingPackages' : 'packages') => {
    setData((prev: any) => {
      const list = [...(prev[targetKey] || (targetKey === 'weddingPackages' ? DEFAULT_WEDDING_PLANS : []))];
      const items = [...(list[packageIndex][listField] || [])];
      items[itemIndex] = value;
      list[packageIndex] = { ...list[packageIndex], [listField]: items };
      return { ...prev, [targetKey]: list };
    });
    setIsDirty(true);
  };

  const addPackageListItem = (packageIndex: number, listField: 'deliverables' | 'bonus', targetKey: 'packages' | 'weddingPackages' = packageSubTab === 'wedding' ? 'weddingPackages' : 'packages') => {
    setData((prev: any) => {
      const list = [...(prev[targetKey] || (targetKey === 'weddingPackages' ? DEFAULT_WEDDING_PLANS : []))];
      const items = [...(list[packageIndex][listField] || []), 'New Inclusions'];
      list[packageIndex] = { ...list[packageIndex], [listField]: items };
      return { ...prev, [targetKey]: list };
    });
    setIsDirty(true);
  };

  const removePackageListItem = (packageIndex: number, listField: 'deliverables' | 'bonus', itemIndex: number, targetKey: 'packages' | 'weddingPackages' = packageSubTab === 'wedding' ? 'weddingPackages' : 'packages') => {
    setData((prev: any) => {
      const list = [...(prev[targetKey] || (targetKey === 'weddingPackages' ? DEFAULT_WEDDING_PLANS : []))];
      const items = [...(list[packageIndex][listField] || [])];
      items.splice(itemIndex, 1);
      list[packageIndex] = { ...list[packageIndex], [listField]: items };
      return { ...prev, [targetKey]: list };
    });
    setIsDirty(true);
  };

  const updatePackageNestedList = (
    packageIndex: number,
    parent: string,
    itemIndex: number,
    value: string,
    targetKey: 'packages' | 'weddingPackages' = packageSubTab === 'wedding' ? 'weddingPackages' : 'packages'
  ) => {
    setData((prev: any) => {
      const list = [...(prev[targetKey] || (targetKey === 'weddingPackages' ? DEFAULT_WEDDING_PLANS : []))];
      const parentObj = { ...(list[packageIndex][parent] || {}) };
      const details = [...(parentObj.details || [])];
      details[itemIndex] = value;
      parentObj.details = details;
      list[packageIndex] = { ...list[packageIndex], [parent]: parentObj };
      return { ...prev, [targetKey]: list };
    });
    setIsDirty(true);
  };

  const addPackageNestedListItem = (packageIndex: number, parent: string, targetKey: 'packages' | 'weddingPackages' = packageSubTab === 'wedding' ? 'weddingPackages' : 'packages') => {
    setData((prev: any) => {
      const list = [...(prev[targetKey] || (targetKey === 'weddingPackages' ? DEFAULT_WEDDING_PLANS : []))];
      const parentObj = { ...(list[packageIndex][parent] || {}) };
      parentObj.details = [...(parentObj.details || []), 'New Feature Item'];
      list[packageIndex] = { ...list[packageIndex], [parent]: parentObj };
      return { ...prev, [targetKey]: list };
    });
    setIsDirty(true);
  };

  const removePackageNestedListItem = (packageIndex: number, parent: string, itemIndex: number, targetKey: 'packages' | 'weddingPackages' = packageSubTab === 'wedding' ? 'weddingPackages' : 'packages') => {
    setData((prev: any) => {
      const list = [...(prev[targetKey] || (targetKey === 'weddingPackages' ? DEFAULT_WEDDING_PLANS : []))];
      const parentObj = { ...(list[packageIndex][parent] || {}) };
      const details = [...(parentObj.details || [])];
      details.splice(itemIndex, 1);
      parentObj.details = details;
      list[packageIndex] = { ...list[packageIndex], [parent]: parentObj };
      return { ...prev, [targetKey]: list };
    });
    setIsDirty(true);
  };

  const updatePlatinumExp = (packageIndex: number, itemIndex: number, value: string, targetKey: 'packages' | 'weddingPackages' = packageSubTab === 'wedding' ? 'weddingPackages' : 'packages') => {
    setData((prev: any) => {
      const list = [...(prev[targetKey] || (targetKey === 'weddingPackages' ? DEFAULT_WEDDING_PLANS : []))];
      const items = [...(list[packageIndex].platinumExperience || [])];
      items[itemIndex] = value;
      list[packageIndex] = { ...list[packageIndex], platinumExperience: items };
      return { ...prev, [targetKey]: list };
    });
    setIsDirty(true);
  };

  const addPlatinumExpItem = (packageIndex: number, targetKey: 'packages' | 'weddingPackages' = packageSubTab === 'wedding' ? 'weddingPackages' : 'packages') => {
    setData((prev: any) => {
      const list = [...(prev[targetKey] || (targetKey === 'weddingPackages' ? DEFAULT_WEDDING_PLANS : []))];
      const items = [...(list[packageIndex].platinumExperience || []), 'New VIP Service'];
      list[packageIndex] = { ...list[packageIndex], platinumExperience: items };
      return { ...prev, [targetKey]: list };
    });
    setIsDirty(true);
  };

  const removePlatinumExpItem = (packageIndex: number, itemIndex: number, targetKey: 'packages' | 'weddingPackages' = packageSubTab === 'wedding' ? 'weddingPackages' : 'packages') => {
    setData((prev: any) => {
      const list = [...(prev[targetKey] || (targetKey === 'weddingPackages' ? DEFAULT_WEDDING_PLANS : []))];
      const items = [...(list[packageIndex].platinumExperience || [])];
      items.splice(itemIndex, 1);
      list[packageIndex] = { ...list[packageIndex], platinumExperience: items };
      return { ...prev, [targetKey]: list };
    });
    setIsDirty(true);
  };

  // Gallery CRUD
  const addGalleryItem = () => {
    setData((prev: any) => ({
      ...prev,
      portfolioGallery: [
        ...(prev.portfolioGallery || []),
        {
          id: `gal-${Date.now()}`,
          title: 'Royal Palace Grandeur',
          category: 'Pre-Wedding',
          couple: 'Aarav & Simran',
          location: 'Amer Fort, Jaipur',
          imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80',
        },
      ],
    }));
    setIsDirty(true);
  };

  const updateGalleryItem = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const list = [...(prev.portfolioGallery || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, portfolioGallery: list };
    });
    setIsDirty(true);
  };

  const removeGalleryItem = (index: number) => {
    setData((prev: any) => {
      const list = [...(prev.portfolioGallery || [])];
      list.splice(index, 1);
      return { ...prev, portfolioGallery: list };
    });
    setIsDirty(true);
  };

  const handleBatchUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      toast.error('Invalid files', 'Please select or drop valid image files (JPG, PNG, WEBP).');
      return;
    }
    setIsGalleryUploading(true);
    try {
      const newItems: any[] = [];
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const res = await adminMediaApi.upload(file, file.name, 'image');
        if (res.success && res.data?.url) {
          const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);
          newItems.push({
            id: `gal-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
            title: title || 'Royal Wedding Shoot',
            category: 'Pre-Wedding',
            couple: 'Aarav & Simran',
            location: 'Amer Fort, Jaipur',
            imageUrl: res.data.url,
          });
        }
      }
      if (newItems.length > 0) {
        setData((prev: any) => ({
          ...prev,
          portfolioGallery: [...newItems, ...(prev.portfolioGallery || [])],
        }));
        setIsDirty(true);
        toast.success(
          `Added ${newItems.length} photo${newItems.length > 1 ? 's' : ''}`,
          'High-resolution photos uploaded and added to the gallery.'
        );
      }
    } catch (err: any) {
      toast.error('Upload failed', err.message || 'Error uploading photos.');
    } finally {
      setIsGalleryUploading(false);
    }
  };

  const handleCardUpload = async (cardIndex: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file', 'Please drop or select an image file (JPG, PNG, WEBP).');
      return;
    }
    setUploadingCardIndex(cardIndex);
    try {
      const res = await adminMediaApi.upload(file, file.name, 'image');
      if (res.success && res.data?.url) {
        updateGalleryItem(cardIndex, 'imageUrl', res.data.url);
        toast.success('Photo updated', 'New image uploaded successfully.');
      }
    } catch (err: any) {
      toast.error('Upload failed', err.message || 'Failed to upload photo.');
    } finally {
      setUploadingCardIndex(null);
    }
  };

  // Videos CRUD
  const addVideo = () => {
    setData((prev: any) => ({
      ...prev,
      videos: [
        ...(prev.videos || []),
        {
          id: `vid-${Date.now()}`,
          title: 'Royal Udaipur Romance — Pre-Wedding Film',
          category: 'Pre-Wedding',
          couple: 'Kabir & Meera',
          location: 'Lake Pichola, Udaipur',
          videoUrl: 'https://www.youtube.com/watch?v=HcEcM5AtEZ8',
          thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
          duration: '3:45',
          tag: 'Cinematic 4K',
        },
      ],
    }));
    setIsDirty(true);
  };

  const updateVideo = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const list = [...(prev.videos || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, videos: list };
    });
    setIsDirty(true);
  };

  const removeVideo = (index: number) => {
    setData((prev: any) => {
      const list = [...(prev.videos || [])];
      list.splice(index, 1);
      return { ...prev, videos: list };
    });
    setIsDirty(true);
  };

  // Director & Process
  const updateDirectorInfo = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      directorInfo: {
        ...(prev.directorInfo || {}),
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const updateProcessStep = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const list = [...(prev.processSteps || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, processSteps: list };
    });
    setIsDirty(true);
  };

  // Couple Stories CRUD
  const addCoupleStory = () => {
    setData((prev: any) => ({
      ...prev,
      coupleStories: [
        ...(prev.coupleStories || []),
        {
          id: `story-${Date.now()}`,
          title: 'The Sunrise Stroll',
          couple: 'Aarav & Simran',
          location: 'Amer Fort, Jaipur',
          imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
          quote: 'The calm morning light made us forget the cameras were even rolling.',
        },
      ],
    }));
    setIsDirty(true);
  };

  const updateCoupleStory = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const list = [...(prev.coupleStories || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, coupleStories: list };
    });
    setIsDirty(true);
  };

  const removeCoupleStory = (index: number) => {
    setData((prev: any) => {
      const list = [...(prev.coupleStories || [])];
      list.splice(index, 1);
      return { ...prev, coupleStories: list };
    });
    setIsDirty(true);
  };

  // Add-Ons
  const updateAddOn = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const newAddOns = [...prev.addOns];
      const updatedItem = { ...newAddOns[index], [field]: value };
      newAddOns[index] = updatedItem;

      // Automatically sync matching service in customServices (Signature Builder)
      let newCustomServices = prev.customServices ? [...prev.customServices] : [];
      const itemTitle = (field === 'title' ? value : updatedItem.title || '').trim().toLowerCase();

      newCustomServices = newCustomServices.map((cs: any) => {
        const csName = (cs.name || '').trim().toLowerCase();
        const isMatch =
          csName === itemTitle ||
          (updatedItem.id === 'addon-drone' && cs.id === 'opt-drone') ||
          (updatedItem.id === 'addon-reel' && cs.id === 'opt-reels') ||
          (updatedItem.id === 'addon-makeup' && cs.id === 'opt-makeup') ||
          (updatedItem.id === 'addon-costume' && cs.id === 'opt-costume') ||
          (updatedItem.id === 'addon-location' && cs.id === 'opt-location') ||
          (updatedItem.id === 'addon-album' && cs.id === 'opt-album');

        if (isMatch) {
          return {
            ...cs,
            ...(field === 'priceINR' ? { startingPriceINR: Number(value) } : {}),
            ...(field === 'description' ? { description: value } : {}),
            ...(field === 'title' ? { name: value } : {}),
          };
        }
        return cs;
      });

      return {
        ...prev,
        addOns: newAddOns,
        customServices: newCustomServices,
      };
    });
    setIsDirty(true);
  };

  const addAddOn = () => {
    setData((prev: any) => ({
      ...prev,
      addOns: [
        ...prev.addOns,
        {
          id: `addon-${Date.now()}`,
          title: 'New Add-On Service',
          priceDisplay: 'Starting ₹5,000',
          priceINR: 5000,
          description: 'Description of the add-on service.',
          badge: '',
        },
      ],
    }));
    setIsDirty(true);
  };

  const removeAddOn = (index: number) => {
    setData((prev: any) => {
      const newAddOns = [...prev.addOns];
      newAddOns.splice(index, 1);
      return { ...prev, addOns: newAddOns };
    });
    setIsDirty(true);
  };

  // Custom Builder Services
  const updateCustomService = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const newServices = [...prev.customServices];
      const updatedItem = { ...newServices[index], [field]: value };
      newServices[index] = updatedItem;

      // Automatically sync matching item in addOns
      let newAddOns = prev.addOns ? [...prev.addOns] : [];
      const csName = (field === 'name' ? value : updatedItem.name || '').trim().toLowerCase();

      newAddOns = newAddOns.map((addon: any) => {
        const addonTitle = (addon.title || '').trim().toLowerCase();
        const isMatch =
          addonTitle === csName ||
          (updatedItem.id === 'opt-drone' && addon.id === 'addon-drone') ||
          (updatedItem.id === 'opt-reels' && addon.id === 'addon-reel') ||
          (updatedItem.id === 'opt-makeup' && addon.id === 'addon-makeup') ||
          (updatedItem.id === 'opt-costume' && addon.id === 'addon-costume') ||
          (updatedItem.id === 'opt-location' && addon.id === 'addon-location') ||
          (updatedItem.id === 'opt-album' && addon.id === 'addon-album');

        if (isMatch) {
          const numPrice = field === 'startingPriceINR' ? Number(value) : addon.priceINR;
          return {
            ...addon,
            ...(field === 'startingPriceINR'
              ? { priceINR: numPrice, priceDisplay: `Starting ₹${numPrice.toLocaleString('en-IN')}` }
              : {}),
            ...(field === 'description' ? { description: value } : {}),
            ...(field === 'name' ? { title: value } : {}),
          };
        }
        return addon;
      });

      return {
        ...prev,
        customServices: newServices,
        addOns: newAddOns,
      };
    });
    setIsDirty(true);
  };

  // Why Us Pillars
  const updatePillar = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const newPillars = [...prev.whyUsPillars];
      newPillars[index] = { ...newPillars[index], [field]: value };
      return { ...prev, whyUsPillars: newPillars };
    });
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-vexo-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-mono text-zinc-500 tracking-wider uppercase">Loading Pre-Wedding Studio CMS...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Unable to load Pre-Wedding studio data</p>
        <button
          type="button"
          onClick={fetchPreWeddingData}
          className="px-4 py-2 rounded-xl bg-vexo-red text-white text-xs font-bold hover:bg-red-600 transition-all cursor-pointer shadow-md shadow-red-600/20"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const {
    studioInfo = {},
    heroStats = [],
    packages = [],
    weddingPackages = DEFAULT_WEDDING_PLANS,
    portfolioGallery = [],
    videos = [],
    directorInfo = {},
    processSteps = [],
    coupleStories = [],
    addOns = [],
    customServices = [],
    whyUsPillars = [],
  } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0d] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-vexo-red/10 border border-vexo-red/30 text-vexo-red text-[10px] font-mono font-bold uppercase tracking-wider">
              STUDIO CMS
            </span>
            {isDirty && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                UNSAVED CHANGES
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
            Pre-Wedding Studio Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Control packages, photo portfolio, video teasers, director profile, custom builder options & bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/pre-wedding"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700/80 dark:text-zinc-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>Preview Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
          </a>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-vexo-red hover:bg-red-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-red-500/20 dark:shadow-red-900/30 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Slider with Left/Right Arrows */}
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={() => slideTabs('left')}
          disabled={!canScrollLeft}
          title="Scroll Left"
          aria-label="Scroll tabs left"
          className="w-8 h-8 rounded-xl bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:text-white hover:bg-vexo-red hover:border-vexo-red dark:hover:bg-vexo-red dark:hover:border-vexo-red transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={tabsContainerRef}
          className="flex-1 flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800/80 overflow-x-auto pb-px scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {[
            { id: 'info', label: 'Studio & Hero', icon: Building },
            { id: 'packages', label: `Packages & Plans (${packages.length + weddingPackages.length})`, icon: Crown },
            { id: 'gallery', label: `Portfolio Photos (${portfolioGallery.length})`, icon: Camera },
            { id: 'videos', label: `Video Teasers (${videos.length})`, icon: Film },
            { id: 'director', label: 'Director & Workflow', icon: User },
            { id: 'stories', label: `Couple Stories (${coupleStories.length})`, icon: Heart },
            { id: 'addons', label: `Add-Ons (${addOns.length})`, icon: Layers },
            { id: 'customServices', label: `Signature Builder (${customServices.length})`, icon: Sliders },
            { id: 'pillars', label: 'Why VEXO Pillars', icon: Award },
          ].map((t) => {
            const Icon = t.icon;
            const isTabActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as TabKey)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
                  isTabActive
                    ? 'bg-red-50/80 text-vexo-red border-vexo-red dark:bg-vexo-red/10 dark:text-white dark:border-vexo-red shadow-2xs'
                    : 'text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => slideTabs('right')}
          disabled={!canScrollRight}
          title="Scroll Right"
          aria-label="Scroll tabs right"
          className="w-8 h-8 rounded-xl bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:text-white hover:bg-vexo-red hover:border-vexo-red dark:hover:bg-vexo-red dark:hover:border-vexo-red transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STUDIO INFO & HERO */}
      {/* ======================================================== */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-xs transition-colors">
            <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Brand & Hero Headlines</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">The primary brand name, tagline, and emotional hook quotes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">STUDIO NAME</label>
                <input
                  type="text"
                  value={studioInfo.name || ''}
                  onChange={(e) => updateStudioInfo('name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">TAGLINE</label>
                <input
                  type="text"
                  value={studioInfo.tagline || ''}
                  onChange={(e) => updateStudioInfo('tagline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">HERO HEADLINE</label>
                <input
                  type="text"
                  value={studioInfo.headline || ''}
                  onChange={(e) => updateStudioInfo('headline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">HINDI PHILOSOPHY HOOK QUOTE</label>
                <textarea
                  rows={2}
                  value={studioInfo.subHeadlineHindi || ''}
                  onChange={(e) => {
                    updateStudioInfo('subHeadlineHindi', e.target.value);
                    updateStudioInfo('storyHook', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none resize-none transition-colors shadow-2xs"
                />
              </div>

            </div>
          </div>

          {/* Dedicated Hero Background Image & Atmosphere Card */}
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="w-4 h-4 text-vexo-red" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Hero Background & Atmosphere</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Control the main cinematic wallpaper image displayed in the public Pre-Wedding &amp; Packages hero section.
                </p>
              </div>

              <button
                type="button"
                onClick={() => updateStudioInfo('heroBgImage', '/images/pre-wedding/hero-bride.jpg')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 hover:border-vexo-red text-slate-700 dark:text-zinc-300 hover:text-vexo-red dark:hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className="w-3 h-3 text-vexo-red" />
                <span>Reset to Royal Bride</span>
              </button>
            </div>

            {/* MediaInput with Library & File Upload */}
            <div className="space-y-4">
              <MediaInput
                label="HERO BACKGROUND IMAGE URL / UPLOAD"
                value={studioInfo.heroBgImage || '/images/pre-wedding/hero-bride.jpg'}
                onChange={(url) => updateStudioInfo('heroBgImage', url)}
                placeholder="/images/pre-wedding/hero-bride.jpg or paste URL"
                allowedTypes={['image']}
                helperText="Supports local uploads, media library files, or external high-resolution URLs."
              />

              {/* Live 16:9 Hero Wallpaper Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300 uppercase">
                    LIVE HERO BANNER PREVIEW
                  </label>
                  <span className="text-[11px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Live Active Preview
                  </span>
                </div>

                <div className="relative aspect-video sm:aspect-[21/9] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-[#050508] shadow-lg">
                  {/* Background Wallpaper */}
                  <img
                    src={getMediaUrl(studioInfo.heroBgImage || '/images/pre-wedding/hero-bride.jpg')}
                    alt="Hero Preview"
                    className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/pre-wedding/hero-bride.jpg';
                    }}
                  />

                  {/* Gradient atmospheric overlay matching public page */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-black/25 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />

                  {/* Mock Public Page Content Overlay */}
                  <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-4 sm:p-8 space-y-2">
                    <span className="px-3 py-1 rounded-full bg-vexo-red/30 border border-vexo-red/60 text-vexo-red text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest backdrop-blur-xs">
                      {studioInfo.tagline || 'WEDDING • PRE-WEDDING • CINEMATOGRAPHY'}
                    </span>
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-black uppercase text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] font-serif">
                      {studioInfo.name || 'VEXO WEDDING STUDIO'}
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-100 italic max-w-lg mx-auto drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] line-clamp-2">
                      &ldquo;{studioInfo.subHeadlineHindi || "Every couple has a story of their own — and we turn it into a beautiful memory that lasts forever."}&rdquo;
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-vexo-red text-white text-[10px] font-bold uppercase">
                        Explore Packages
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-black/50 border border-white/20 text-white text-[10px] font-semibold uppercase">
                        Book Your Date
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Curated Wallpaper Presets */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300 uppercase">
                  OR CHOOSE FROM CURATED CINEMATIC PRESETS
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    {
                      label: 'Royal Bride (Signature)',
                      tag: 'High Visibility Red',
                      url: '/images/pre-wedding/hero-bride.jpg',
                      thumb: '/images/pre-wedding/hero-bride.jpg',
                    },
                    {
                      label: 'Amer Fort Couple',
                      tag: 'Rajasthan Heritage',
                      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=2000&q=85',
                      thumb: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80',
                    },
                    {
                      label: 'Lake Pichola Sunset',
                      tag: 'Udaipur Romance',
                      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85',
                      thumb: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
                    },
                    {
                      label: 'Palace Symphony',
                      tag: 'Royal Courtyard',
                      url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=2000&q=85',
                      thumb: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=400&q=80',
                    },
                  ].map((preset, pIdx) => {
                    const isSelected = (studioInfo.heroBgImage || '/images/pre-wedding/hero-bride.jpg') === preset.url;
                    return (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => updateStudioInfo('heroBgImage', preset.url)}
                        className={`group relative rounded-xl overflow-hidden border p-1 text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                          isSelected
                            ? 'border-vexo-red bg-vexo-red/10 ring-2 ring-vexo-red/30'
                            : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 hover:border-slate-400 dark:hover:border-zinc-600'
                        }`}
                      >
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black">
                          <img
                            src={preset.thumb}
                            alt={preset.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-vexo-red text-white flex items-center justify-center text-[10px]">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                        <div className="px-1 pb-1">
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                            {preset.label}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono truncate">
                            {preset.tag}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Hero 3 Highlight Benefit Cards */}
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-xs transition-colors">
            <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Hero 3 Benefit Pillars Strip</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">The 3 quick benefit cards displayed right beneath the hero banner.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {heroStats.map((stat: any, sIdx: number) => (
                <div key={sIdx} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3 bg-slate-50/50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={stat.number || `0${sIdx + 1}`}
                      onChange={(e) => updateHeroStat(sIdx, 'number', e.target.value)}
                      className="w-14 px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-xs text-vexo-red font-bold text-center"
                    />
                    <input
                      type="text"
                      value={stat.title || ''}
                      onChange={(e) => updateHeroStat(sIdx, 'title', e.target.value)}
                      placeholder="Title"
                      className="w-full px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={stat.description || ''}
                    onChange={(e) => updateHeroStat(sIdx, 'description', e.target.value)}
                    placeholder="Benefit description"
                    className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Booking Coordinates */}
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-xs transition-colors">
            <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Studio Booking Coordinates</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Contact phone, WhatsApp dispatch, official studio email, and shoot locations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">PHONE NUMBER</label>
                <input
                  type="text"
                  value={studioInfo.displayPhone || studioInfo.phone || ''}
                  onChange={(e) => {
                    updateStudioInfo('phone', e.target.value);
                    updateStudioInfo('displayPhone', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">WHATSAPP DISPATCH NUMBER</label>
                <input
                  type="text"
                  value={studioInfo.whatsappNumber || ''}
                  onChange={(e) => updateStudioInfo('whatsappNumber', e.target.value)}
                  placeholder="e.g. 917239999966"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">STUDIO EMAIL</label>
                <input
                  type="email"
                  value={studioInfo.email || ''}
                  onChange={(e) => updateStudioInfo('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">SHOOT BASE LOCATIONS</label>
                <input
                  type="text"
                  value={studioInfo.location || ''}
                  onChange={(e) => updateStudioInfo('location', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* TAB 2: PACKAGES & WEDDING PLANS (FULL CRUD) */}
      {/* ======================================================== */}
      {activeTab === 'packages' && (() => {
        const isWeddingTab = packageSubTab === 'wedding';
        const currentList = isWeddingTab ? weddingPackages : packages;
        const currentTarget: 'packages' | 'weddingPackages' = isWeddingTab ? 'weddingPackages' : 'packages';

        return (
          <div className="space-y-6">
            {/* Sub-Tabs Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPackageSubTab('pre-wedding')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    !isWeddingTab
                      ? 'bg-white dark:bg-[#181820] text-vexo-red dark:text-white shadow-xs border border-slate-200 dark:border-zinc-700'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Pre-Wedding Packages ({packages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPackageSubTab('wedding')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isWeddingTab
                      ? 'bg-white dark:bg-[#181820] text-vexo-red dark:text-white shadow-xs border border-slate-200 dark:border-zinc-700'
                      : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  Wedding Plans ({weddingPackages.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => addPackage(currentTarget)}
                className="px-4 py-2 rounded-xl bg-vexo-red text-white text-xs font-bold hover:bg-red-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>{isWeddingTab ? 'Create New Wedding Plan' : 'Create New Package'}</span>
              </button>
            </div>

            {/* Context Notice */}
            <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
              {isWeddingTab ? (
                <p>
                  <strong className="text-slate-900 dark:text-white uppercase font-mono mr-2">Wedding Plans (Day of Wedding):</strong>
                  Manage Essential Wedding, Signature Wedding, and Royal Wedding packages. Customize pricing, photo/cinema crew, deliverables, food & travel policy, and WhatsApp inquiry text.
                </p>
              ) : (
                <p>
                  <strong className="text-slate-900 dark:text-white uppercase font-mono mr-2">Pre-Wedding Packages:</strong>
                  Manage Silver, Gold, and Platinum pre-wedding cinematic shoots, camera gear specs, shoot days, locations, and deliverables.
                </p>
              )}
            </div>

            <div className="space-y-8">
              {currentList.map((pkg: any, idx: number) => {
                const isFeatured = pkg.isPopular || (isWeddingTab ? pkg.id === 'wedding-signature' : pkg.id === 'gold');

                return (
                  <div
                    key={pkg.id || idx}
                    className={`bg-white dark:bg-[#0e0e13] border rounded-2xl p-6 space-y-6 shadow-xs transition-colors relative ${
                      isFeatured ? 'border-vexo-red/50 shadow-md shadow-red-500/10' : 'border-slate-200 dark:border-zinc-800/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800/80 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-red-50 dark:bg-vexo-red/20 text-vexo-red flex items-center justify-center font-black text-sm">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                            {pkg.name || 'UNTITLED'} {isWeddingTab ? 'PLAN' : 'TIER'}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">{pkg.tagline}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={pkg.isPopular || false}
                            onChange={(e) => updatePackage(idx, 'isPopular', e.target.checked, currentTarget)}
                            className="rounded border-slate-300 dark:border-zinc-700 text-vexo-red focus:ring-0"
                          />
                          <span>"Featured / Most Popular" Highlight</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => removePackage(idx, currentTarget)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Delete Package"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PLAN / PACKAGE NAME</label>
                        <input
                          type="text"
                          value={pkg.name || ''}
                          onChange={(e) => updatePackage(idx, 'name', e.target.value, currentTarget)}
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PRICE (NUMERIC INR)</label>
                        <input
                          type="number"
                          value={pkg.priceINR || 0}
                          onChange={(e) => {
                            const num = Number(e.target.value);
                            updatePackage(idx, 'priceINR', num, currentTarget);
                            if (num > 0) {
                              updatePackage(idx, 'priceDisplay', `₹${num.toLocaleString('en-IN')}`, currentTarget);
                            }
                          }}
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PRICE DISPLAY STRING</label>
                        <input
                          type="text"
                          value={pkg.priceDisplay || ''}
                          onChange={(e) => updatePackage(idx, 'priceDisplay', e.target.value, currentTarget)}
                          placeholder="e.g. ₹49,999 or Custom Quote"
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">BADGE LABEL</label>
                        <input
                          type="text"
                          value={pkg.badge || ''}
                          onChange={(e) => updatePackage(idx, 'badge', e.target.value, currentTarget)}
                          placeholder="e.g. MOST POPULAR, ROYAL LUXURY"
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">TAGLINE / SHORT DESCRIPTION</label>
                        <input
                          type="text"
                          value={pkg.tagline || ''}
                          onChange={(e) => updatePackage(idx, 'tagline', e.target.value, currentTarget)}
                          placeholder="e.g. For complete wedding-day coverage"
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">SHOOT DURATION</label>
                        <input
                          type="text"
                          value={pkg.shoot?.days || ''}
                          onChange={(e) => updatePackageNested(idx, 'shoot', 'days', e.target.value, currentTarget)}
                          placeholder="e.g. 1 Shoot Day or 1–2 Shoot Days"
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">LOCATIONS</label>
                        <input
                          type="text"
                          value={pkg.shoot?.locations || ''}
                          onChange={(e) => updatePackageNested(idx, 'shoot', 'locations', e.target.value, currentTarget)}
                          placeholder="e.g. Up to 1 Location, Multiple Locations"
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">HIGHLIGHT TEXT</label>
                        <input
                          type="text"
                          value={pkg.highlightText || ''}
                          onChange={(e) => updatePackage(idx, 'highlightText', e.target.value, currentTarget)}
                          placeholder="e.g. Artfully curated coverage for close-knit ceremonies"
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      {/* Wedding Plans extra fields: Food/Travel, CTA Text, WhatsApp Inquiry */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">FOOD & TRAVEL RESPONSIBILITY</label>
                        <input
                          type="text"
                          value={pkg.foodTravel || ''}
                          onChange={(e) => updatePackage(idx, 'foodTravel', e.target.value, currentTarget)}
                          placeholder="e.g. Food, Travel — Paid By Client / Company"
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">CTA BUTTON TEXT</label>
                        <input
                          type="text"
                          value={pkg.ctaText || ''}
                          onChange={(e) => updatePackage(idx, 'ctaText', e.target.value, currentTarget)}
                          placeholder={`e.g. Choose ${pkg.name || 'Plan'}`}
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">WHATSAPP PRE-FILLED INQUIRY</label>
                        <input
                          type="text"
                          value={pkg.whatsappMessage || ''}
                          onChange={(e) => updatePackage(idx, 'whatsappMessage', e.target.value, currentTarget)}
                          placeholder="e.g. Hello VEXO! I am interested in this wedding plan..."
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PHOTOGRAPHERS COUNT LABEL</label>
                        <input
                          type="text"
                          value={pkg.photography?.photographersCount || ''}
                          onChange={(e) => updatePackageNested(idx, 'photography', 'photographersCount', e.target.value, currentTarget)}
                          placeholder="e.g. 1 Professional Photographer"
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PHOTOGRAPHY CAMERA SETUP</label>
                        <input
                          type="text"
                          value={pkg.photography?.cameraSetup || ''}
                          onChange={(e) => updatePackageNested(idx, 'photography', 'cameraSetup', e.target.value, currentTarget)}
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">CINEMATOGRAPHERS COUNT LABEL</label>
                        <input
                          type="text"
                          value={pkg.cinematography?.cinematographersCount || ''}
                          onChange={(e) => updatePackageNested(idx, 'cinematography', 'cinematographersCount', e.target.value, currentTarget)}
                          placeholder="e.g. 2 Cinematographers"
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">CINEMATOGRAPHY CAMERA RIG</label>
                        <input
                          type="text"
                          value={pkg.cinematography?.cameraSetup || ''}
                          onChange={(e) => updatePackageNested(idx, 'cinematography', 'cameraSetup', e.target.value, currentTarget)}
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Photography Details Bullet List */}
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-300">
                          PHOTOGRAPHY FEATURES ({pkg.photography?.details?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => addPackageNestedListItem(idx, 'photography', currentTarget)}
                          className="text-xs text-vexo-red hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Detail</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(pkg.photography?.details || []).map((item: string, dIdx: number) => (
                          <div key={dIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => updatePackageNestedList(idx, 'photography', dIdx, e.target.value, currentTarget)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => removePackageNestedListItem(idx, 'photography', dIdx, currentTarget)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 dark:hover:bg-red-500/10 dark:text-zinc-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cinematography Details Bullet List */}
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-300">
                          CINEMATOGRAPHY FEATURES ({pkg.cinematography?.details?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => addPackageNestedListItem(idx, 'cinematography', currentTarget)}
                          className="text-xs text-vexo-red hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Detail</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(pkg.cinematography?.details || []).map((item: string, dIdx: number) => (
                          <div key={dIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => updatePackageNestedList(idx, 'cinematography', dIdx, e.target.value, currentTarget)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => removePackageNestedListItem(idx, 'cinematography', dIdx, currentTarget)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 dark:hover:bg-red-500/10 dark:text-zinc-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deliverables List */}
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-300">
                          DELIVERABLES ({pkg.deliverables?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => addPackageListItem(idx, 'deliverables', currentTarget)}
                          className="text-xs text-vexo-red hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Deliverable</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(pkg.deliverables || []).map((del: string, delIdx: number) => (
                          <div key={delIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={del}
                              onChange={(e) => updatePackageList(idx, 'deliverables', delIdx, e.target.value, currentTarget)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => removePackageListItem(idx, 'deliverables', delIdx, currentTarget)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 dark:hover:bg-red-500/10 dark:text-zinc-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete Deliverable"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bonus Perks */}
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-vexo-red">
                          BONUS PERKS ({pkg.bonus?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => addPackageListItem(idx, 'bonus', currentTarget)}
                          className="text-xs text-vexo-red hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Bonus</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(pkg.bonus || []).map((b: string, bIdx: number) => (
                          <div key={bIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={b}
                              onChange={(e) => updatePackageList(idx, 'bonus', bIdx, e.target.value, currentTarget)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => removePackageListItem(idx, 'bonus', bIdx, currentTarget)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 dark:hover:bg-red-500/10 dark:text-zinc-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Platinum VIP Experience */}
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-500">
                          PLATINUM / ROYAL VIP DIRECTION ({pkg.platinumExperience?.length || 0})
                        </span>
                        <button
                          type="button"
                          onClick={() => addPlatinumExpItem(idx, currentTarget)}
                          className="text-xs text-amber-500 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add VIP Item</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                        Shown as the VIP Direction block on the public package card. Leave empty if not applicable.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(pkg.platinumExperience || []).map((exp: string, eIdx: number) => (
                          <div key={eIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={exp}
                              onChange={(e) => updatePlatinumExp(idx, eIdx, e.target.value, currentTarget)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-amber-400 focus:outline-none transition-colors shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => removePlatinumExpItem(idx, eIdx, currentTarget)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 dark:hover:bg-red-500/10 dark:text-zinc-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* TAB 3: PORTFOLIO GALLERY (ADD / EDIT / DELETE) */}
      {/* ======================================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Portfolio Photo Gallery ({portfolioGallery.length})</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Manage high-resolution photos, couple names, shoot locations, and category filters.</p>
            </div>
            <button
              type="button"
              onClick={addGalleryItem}
              className="px-4 py-2 rounded-xl bg-vexo-red text-white text-xs font-bold hover:bg-red-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Photo</span>
            </button>
          </div>

          {/* Dedicated Drag & Drop File Upload Section */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setGalleryDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setGalleryDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setGalleryDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleBatchUpload(e.dataTransfer.files);
              }
            }}
            onClick={() => galleryFileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              galleryDragOver
                ? 'border-vexo-red bg-vexo-red/10 scale-[1.01] shadow-lg shadow-red-600/20'
                : 'border-slate-300 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 hover:border-vexo-red/70 hover:bg-slate-100/50 dark:hover:bg-zinc-900/70'
            }`}
          >
            <input
              ref={galleryFileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleBatchUpload(e.target.files);
                }
              }}
            />
            {isGalleryUploading ? (
              <div className="flex flex-col items-center gap-2.5 py-4">
                <Loader2 className="w-9 h-9 text-vexo-red animate-spin" />
                <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">Uploading photos to gallery...</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Storing image assets and updating gallery items</p>
              </div>
            ) : (
              <>
                <div className="w-13 h-13 rounded-2xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red shadow-lg shadow-red-600/10">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    <span className="text-vexo-red underline underline-offset-4 decoration-vexo-red/50 hover:decoration-vexo-red font-semibold">
                      Click to upload photos
                    </span>{' '}
                    or drag &amp; drop files here
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                    Supports JPG, PNG, WEBP. Drag multiple files to batch upload and instantly generate gallery cards.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                  <span className="px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-zinc-800 text-[10px] font-mono font-medium text-slate-700 dark:text-zinc-300">
                    Batch Drag &amp; Drop
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-zinc-800 text-[10px] font-mono font-medium text-slate-700 dark:text-zinc-300">
                    High-Res 4K Support
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-zinc-800 text-[10px] font-mono font-medium text-slate-700 dark:text-zinc-300">
                    Auto-Save to Media Storage
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioGallery.map((item: any, gIdx: number) => {
              const isCardDragOver = dragOverCardIndex === gIdx;
              const isCardUploading = uploadingCardIndex === gIdx;

              return (
                <div key={item.id || gIdx} className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs relative group transition-all">
                  {/* Card Image Thumbnail with Direct Drag & Drop Support */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverCardIndex(gIdx);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDragOverCardIndex(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverCardIndex(null);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleCardUpload(gIdx, e.dataTransfer.files[0]);
                      }
                    }}
                    className={`h-48 overflow-hidden relative bg-zinc-900 transition-all ${
                      isCardDragOver ? 'ring-4 ring-vexo-red' : ''
                    }`}
                  >
                    <img
                      src={getMediaUrl(item.imageUrl)}
                      alt={item.title || 'Gallery item'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                    {/* Drag Over Active Overlay */}
                    {isCardDragOver && (
                      <div className="absolute inset-0 bg-vexo-red/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                        <UploadCloud className="w-8 h-8 animate-bounce mb-1" />
                        <span className="text-xs font-mono font-bold tracking-wider uppercase">Drop Photo to Replace</span>
                      </div>
                    )}

                    {/* Uploading Spinner Overlay */}
                    {isCardUploading && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20">
                        <Loader2 className="w-7 h-7 animate-spin text-vexo-red mb-1" />
                        <span className="text-xs font-mono font-bold">Uploading...</span>
                      </div>
                    )}

                    {/* Quick Action Overlays */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                      <label
                        className="p-1.5 rounded-lg bg-black/70 hover:bg-zinc-800 text-white transition-colors cursor-pointer"
                        title="Upload Replacement Image"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleCardUpload(gIdx, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeGalleryItem(gIdx)}
                        className="p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-white transition-colors cursor-pointer"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-black/70 text-vexo-red border border-vexo-red/30 z-10">
                      {item.category || 'Pre-Wedding'}
                    </span>

                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono text-zinc-300 bg-black/60 z-10">
                      Drag &amp; drop to replace
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">COUPLE NAME(S)</label>
                      <input
                        type="text"
                        value={item.couple || ''}
                        onChange={(e) => updateGalleryItem(gIdx, 'couple', e.target.value)}
                        placeholder="e.g. Kabir &amp; Meera"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">CATEGORY</label>
                        <select
                          value={item.category || 'Pre-Wedding'}
                          onChange={(e) => updateGalleryItem(gIdx, 'category', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                        >
                          <option value="Pre-Wedding">Pre-Wedding</option>
                          <option value="Weddings">Weddings</option>
                          <option value="Portraits">Portraits</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">LOCATION</label>
                        <input
                          type="text"
                          value={item.location || ''}
                          onChange={(e) => updateGalleryItem(gIdx, 'location', e.target.value)}
                          placeholder="e.g. City Palace, Jaipur"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <MediaInput
                      label="IMAGE URL / UPLOAD"
                      value={item.imageUrl || ''}
                      onChange={(url) => updateGalleryItem(gIdx, 'imageUrl', url)}
                      placeholder="https://... or select from media library"
                      allowedTypes={['image']}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: VIDEO TEASERS (ADD / EDIT / DELETE) */}
      {/* ======================================================== */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Video Teasers & Highlights ({videos.length})</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Manage video URLs, YouTube embed links, duration, thumbnails, and couple tags.</p>
            </div>
            <button
              type="button"
              onClick={addVideo}
              className="px-4 py-2 rounded-xl bg-vexo-red text-white text-xs font-bold hover:bg-red-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Video</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((vid: any, vIdx: number) => (
              <div key={vid.id || vIdx} className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs relative">
                <div className="h-44 overflow-hidden relative bg-zinc-900">
                  <img src={vid.thumbnailUrl} alt={vid.title} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeVideo(vIdx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-white transition-colors cursor-pointer"
                    title="Delete Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-vexo-red/90 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">FILM TITLE</label>
                    <input
                      type="text"
                      value={vid.title || ''}
                      onChange={(e) => updateVideo(vIdx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">COUPLE NAME</label>
                      <input
                        type="text"
                        value={vid.couple || ''}
                        onChange={(e) => updateVideo(vIdx, 'couple', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">DURATION</label>
                      <input
                        type="text"
                        value={vid.duration || ''}
                        onChange={(e) => updateVideo(vIdx, 'duration', e.target.value)}
                        placeholder="e.g. 3:45"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">LOCATION</label>
                      <input
                        type="text"
                        value={vid.location || ''}
                        onChange={(e) => updateVideo(vIdx, 'location', e.target.value)}
                        placeholder="e.g. Udaipur"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">TAG BADGE</label>
                      <input
                        type="text"
                        value={vid.tag || ''}
                        onChange={(e) => updateVideo(vIdx, 'tag', e.target.value)}
                        placeholder="e.g. 4K Cinema"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">VIDEO URL (YOUTUBE / DIRECT)</label>
                    <input
                      type="text"
                      value={vid.videoUrl || ''}
                      onChange={(e) => updateVideo(vIdx, 'videoUrl', e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-700 dark:text-zinc-300"
                    />
                  </div>

                  <MediaInput
                    label="THUMBNAIL IMAGE / UPLOAD"
                    value={vid.thumbnailUrl || ''}
                    onChange={(url) => updateVideo(vIdx, 'thumbnailUrl', url)}
                    placeholder="https://... or upload thumbnail"
                    allowedTypes={['image']}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: DIRECTOR & PROCESS STEPS */}
      {/* ======================================================== */}
      {activeTab === 'director' && (
        <div className="space-y-6">
          {/* Director Profile */}
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Creative Director / Lead Artist Profile</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Configure photo, headline quote, name, bio, and experience badge.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-700 dark:text-zinc-300">DIRECTOR NAME</label>
                <input
                  type="text"
                  value={directorInfo.name || ''}
                  onChange={(e) => updateDirectorInfo('name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-700 dark:text-zinc-300">TITLE / ROLE</label>
                <input
                  type="text"
                  value={directorInfo.title || ''}
                  onChange={(e) => updateDirectorInfo('title', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-mono text-slate-700 dark:text-zinc-300">EDITORIAL QUOTE</label>
                <textarea
                  rows={2}
                  value={directorInfo.quote || ''}
                  onChange={(e) => updateDirectorInfo('quote', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white italic"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-mono text-slate-700 dark:text-zinc-300">BIO & PHILOSOPHY</label>
                <textarea
                  rows={3}
                  value={directorInfo.bio || ''}
                  onChange={(e) => updateDirectorInfo('bio', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <MediaInput
                  label="DIRECTOR PHOTO / UPLOAD"
                  value={directorInfo.image || ''}
                  onChange={(url) => updateDirectorInfo('image', url)}
                  placeholder="/images/... or upload photo"
                  allowedTypes={['image']}
                  helperText="Lead director / artist portrait photo"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-mono text-slate-700 dark:text-zinc-300">EXPERIENCE BADGE</label>
                <input
                  type="text"
                  value={directorInfo.experienceYears || ''}
                  onChange={(e) => updateDirectorInfo('experienceYears', e.target.value)}
                  placeholder="e.g. 8+ Years of Royal Cinema"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Process Workflow Steps */}
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workflow Process Steps (3 Steps)</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Step 01 Discovery Call, Step 02 The Shoot Day, Step 03 The Final Art.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {processSteps.map((step: any, pIdx: number) => (
                <div key={pIdx} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5 bg-slate-50/50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={step.step || `0${pIdx + 1}`}
                      onChange={(e) => updateProcessStep(pIdx, 'step', e.target.value)}
                      className="w-12 px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-xs text-vexo-red font-bold text-center"
                    />
                    <input
                      type="text"
                      value={step.title || ''}
                      onChange={(e) => updateProcessStep(pIdx, 'title', e.target.value)}
                      placeholder="Step Title"
                      className="w-full px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={step.description || ''}
                    onChange={(e) => updateProcessStep(pIdx, 'description', e.target.value)}
                    placeholder="Step details"
                    className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: COUPLE STORIES */}
      {/* ======================================================== */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Couple Stories Preview ({coupleStories.length})</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Editorial romantic memories cards displayed before the packages section.</p>
            </div>
            <button
              type="button"
              onClick={addCoupleStory}
              className="px-4 py-2 rounded-xl bg-vexo-red text-white text-xs font-bold hover:bg-red-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Couple Story</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coupleStories.map((story: any, sIdx: number) => (
              <div key={story.id || sIdx} className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs relative">
                <div className="h-44 overflow-hidden relative bg-zinc-900">
                  <img
                    src={getMediaUrl(story.imageUrl)}
                    alt={story.couple}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeCoupleStory(sIdx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-white transition-colors cursor-pointer"
                    title="Delete Story"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">COUPLE NAME</label>
                    <input
                      type="text"
                      value={story.couple || ''}
                      onChange={(e) => updateCoupleStory(sIdx, 'couple', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">LOCATION</label>
                    <input
                      type="text"
                      value={story.location || ''}
                      onChange={(e) => updateCoupleStory(sIdx, 'location', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <MediaInput
                    label="STORY PHOTO / UPLOAD"
                    value={story.imageUrl || ''}
                    onChange={(url) => updateCoupleStory(sIdx, 'imageUrl', url)}
                    placeholder="https://... or upload photo"
                    allowedTypes={['image']}
                  />
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">COUPLE'S QUOTE</label>
                    <textarea
                      rows={2}
                      value={story.quote || ''}
                      onChange={(e) => updateCoupleStory(sIdx, 'quote', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs italic text-slate-700 dark:text-zinc-300 resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: ADD-ON SERVICES */}
      {/* ======================================================== */}
      {activeTab === 'addons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs transition-colors">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add-On Services Pricing</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">A-la-carte upgrades couples can attach to their reservation.</p>
            </div>
            <button
              type="button"
              onClick={addAddOn}
              className="px-4 py-2 rounded-xl bg-red-50 dark:bg-vexo-red/10 border border-red-200 dark:border-vexo-red/30 text-vexo-red text-xs font-bold hover:bg-red-100 dark:hover:bg-vexo-red/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Add-On</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addOns.map((addon: any, idx: number) => (
              <div key={addon.id || idx} className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 space-y-3.5 relative shadow-xs transition-colors">
                <button
                  type="button"
                  onClick={() => removeAddOn(idx)}
                  className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Remove add-on"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="space-y-1.5 pr-8">
                  <label className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 font-medium">SERVICE TITLE</label>
                  <input
                    type="text"
                    value={addon.title || ''}
                    onChange={(e) => updateAddOn(idx, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-bold transition-colors shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">PRICE (INR)</label>
                    <input
                      type="number"
                      value={addon.priceINR || 0}
                      onChange={(e) => {
                        const num = Number(e.target.value);
                        updateAddOn(idx, 'priceINR', num);
                        updateAddOn(idx, 'priceDisplay', num > 0 ? `Starting ₹${num.toLocaleString('en-IN')}` : 'As per requirement');
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">PRICE DISPLAY</label>
                    <input
                      type="text"
                      value={addon.priceDisplay || ''}
                      onChange={(e) => updateAddOn(idx, 'priceDisplay', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">BADGE</label>
                  <input
                    type="text"
                    value={addon.badge || ''}
                    onChange={(e) => updateAddOn(idx, 'badge', e.target.value)}
                    placeholder="e.g. POPULAR, KEEPSAKE"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={addon.description || ''}
                    onChange={(e) => updateAddOn(idx, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none resize-none transition-colors shadow-2xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 8: CUSTOM BUILDER SERVICES */}
      {/* ======================================================== */}
      {activeTab === 'customServices' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">VEXO Signature Package Builder Services</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Configure starting rates and descriptions for the custom services in the interactive builder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customServices.map((service: any, idx: number) => (
              <div key={service.id || idx} className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 space-y-3.5 shadow-xs transition-colors">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800/60">
                  <span className="text-xs font-mono font-bold text-vexo-red uppercase">{service.category}</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-500">{service.id}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 font-medium">SERVICE NAME</label>
                  <input
                    type="text"
                    value={service.name || ''}
                    onChange={(e) => updateCustomService(idx, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-bold transition-colors shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">STARTING PRICE (INR)</label>
                    <input
                      type="number"
                      value={service.startingPriceINR || 0}
                      onChange={(e) => updateCustomService(idx, 'startingPriceINR', Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">UNIT / BASIS</label>
                    <input
                      type="text"
                      value={service.unit || ''}
                      onChange={(e) => updateCustomService(idx, 'unit', e.target.value)}
                      placeholder="per day / per reel"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={service.description || ''}
                    onChange={(e) => updateCustomService(idx, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none resize-none transition-colors shadow-2xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 9: WHY VEXO PILLARS */}
      {/* ======================================================== */}
      {activeTab === 'pillars' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Why VEXO Studio Pillars</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Edit the 5 USP trust cards displayed on the Pre-Wedding page.</p>
          </div>

          <div className="space-y-4">
            {whyUsPillars.map((pillar: any, idx: number) => (
              <div key={pillar.id || idx} className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 space-y-3 shadow-xs transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-red-50 dark:bg-vexo-red/20 text-vexo-red flex items-center justify-center text-xs font-bold font-mono">
                    {idx + 1}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 font-medium">PILLAR TITLE</label>
                      <input
                        type="text"
                        value={pillar.title || ''}
                        onChange={(e) => updatePillar(idx, 'title', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-bold uppercase transition-colors shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 font-medium">TAG BADGE</label>
                      <input
                        type="text"
                        value={pillar.tag || ''}
                        onChange={(e) => updatePillar(idx, 'tag', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 font-medium">DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={pillar.description || ''}
                    onChange={(e) => updatePillar(idx, 'description', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none resize-none transition-colors shadow-2xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Save Bar on Mobile / Unsaved Changes */}
      {isDirty && (
        <div className="fixed bottom-6 right-6 z-40 bg-white/95 dark:bg-[#120708]/95 backdrop-blur-md border border-slate-200 dark:border-vexo-red/50 shadow-xl dark:shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 transition-colors">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Unsaved Changes</p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">Remember to save before leaving.</p>
          </div>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-vexo-red hover:bg-red-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-red-500/25 dark:shadow-red-900/40 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Now'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPreWeddingPage;
