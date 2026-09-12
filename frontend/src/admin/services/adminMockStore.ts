/**
 * VEXO Admin Client-Side Mock Store (Offline Fallback)
 * Allows seamless admin dashboard usage when Fastify backend on port 4000 is offline.
 */

import { mockServicesList } from '../../data/services';

const STORAGE_KEY = 'vexo_admin_mock_db_v10';

function getInitialMockDb() {
  const now = new Date().toISOString();

  return {
    adminUsers: [
      {
        id: 'admin-super-1',
        email: 'admin@vexomusic.com',
        name: 'VEXO Executive Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
        lastLoginAt: now,
        createdAt: now,
      },
      {
        id: 'admin-editor-1',
        email: 'editor@vexomusic.com',
        name: 'VEXO Content Editor',
        role: 'EDITOR',
        isActive: true,
        lastLoginAt: now,
        createdAt: now,
      },
    ],
    artists: [
      {
        id: 'art-1',
        name: 'Rashmi Nishad',
        slug: 'rashmi-nishad',
        role: 'Lead Vocalist & Performing Artist',
        avatarUrl: '',
        coverUrl: '',
        bio: 'Lead vocalist of the blockbuster official single "Satane Lage Ho" presented by Vexo Entertainment Pvt. Ltd. Celebrated for soul-stirring vocal melodies and traditional Rajasthani contemporary fusion.',
        monthlyListeners: 245000,
        genres: ['Traditional Folk', 'Contemporary Indian', 'Sufi / Fusion'],
        featured: true,
        isComingSoon: false,
        order: 1,
        socials: [
          { platform: 'youtube', url: 'https://youtu.be/HcEcM5AtEZ8?si=cJi8p33qsdjoBI02' },
          { platform: 'instagram', url: 'https://www.instagram.com/vexomusicentertainment' },
          { platform: 'spotify', url: 'https://open.spotify.com/artist/vexo' },
        ],
        createdAt: now,
      },
      {
        id: 'art-rbeer',
        name: 'R Beer',
        slug: 'r-beer',
        role: 'Singer, Lyricist & Music Director',
        avatarUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
        coverUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
        bio: 'Multi-talented artist, singer, and lyricist behind the chartbuster release "Bhartar", collaborating with Rashmi Nishad and VEXO Music Entertainment.',
        monthlyListeners: 165000,
        genres: ['Rajasthani Folk', 'Contemporary Beat', 'Folk Pop'],
        featured: true,
        isComingSoon: false,
        order: 2,
        socials: [
          { platform: 'youtube', url: 'https://youtu.be/PsmXAUKjR5Y?si=WpdguDVkiQZkI0j6' },
        ],
        createdAt: now,
      },
      {
        id: 'art-2',
        name: 'Sonu Charan Bhatt',
        slug: 'sonu-charan-bhatt',
        role: 'Singer & Classical Folk Vocalist',
        avatarUrl: '',
        coverUrl: '',
        bio: 'Co-lead artist and power vocalist on "Satane Lage Ho", celebrated across Rajasthan and India for evocative folk stylings and high-energy stage presence.',
        monthlyListeners: 198000,
        genres: ['Rajasthani Folk', 'Regional Commercial', 'Contemporary Folk'],
        featured: true,
        isComingSoon: false,
        order: 3,
        socials: [
          { platform: 'youtube', url: 'https://youtu.be/HcEcM5AtEZ8?si=cJi8p33qsdjoBI02' },
          { platform: 'instagram', url: 'https://www.instagram.com/vexomusicentertainment' },
        ],
        createdAt: now,
      },
      {
        id: 'art-3',
        name: 'Cipher',
        slug: 'cipher',
        role: 'Electronic Producer & DJ',
        avatarUrl: '',
        coverUrl: '',
        bio: 'Pioneering heavy cyber-synth aesthetics and multi-genre bass architectures for stadium festivals worldwide.',
        monthlyListeners: 420500,
        genres: ['Synthwave', 'Cyberpunk', 'Bass'],
        featured: true,
        isComingSoon: false,
        order: 4,
        socials: [
          { platform: 'spotify', url: 'https://spotify.com' },
          { platform: 'instagram', url: 'https://instagram.com' },
          { platform: 'youtube', url: 'https://youtube.com' },
        ],
        createdAt: now,
      },
      {
        id: 'art-5',
        name: 'Aria Thorne',
        slug: 'aria-thorne',
        role: 'Vocalist & Songwriter',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
        bio: 'Ambient soul enchantress weaving haunting vocal harmonies through intricate analog soundbeds.',
        monthlyListeners: 620000,
        genres: ['Ambient Soul', 'Indie Electronic'],
        featured: false,
        isComingSoon: false,
        order: 5,
        socials: [
          { platform: 'spotify', url: 'https://spotify.com' },
          { platform: 'instagram', url: 'https://instagram.com' },
        ],
        createdAt: now,
      },
      {
        id: 'art-6',
        name: 'EchoPulse',
        slug: 'echopulse',
        role: 'Sound Architect & Mixing Engineer',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        bio: 'Master of low frequencies and psychoacoustic spatial design.',
        monthlyListeners: 290100,
        genres: ['Dark Electro', 'Experimental Bass'],
        featured: false,
        isComingSoon: false,
        order: 6,
        socials: [
          { platform: 'spotify', url: 'https://spotify.com' },
          { platform: 'soundcloud', url: 'https://soundcloud.com' },
        ],
        createdAt: now,
      },
    ],
    albums: [
      {
        id: 'alb-1',
        title: 'Satane Lage Ho',
        slug: 'satane-lage-ho',
        artistName: 'Rashmi Nishad & Sonu Charan Bhatt',
        artistId: 'art-1',
        coverUrl: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
        releaseDate: '2026-08-04',
        year: 2026,
        genre: 'Rajasthani Traditional / Modern Folk',
        trackCount: 1,
        spotifyUrl: 'https://open.spotify.com/album/satane-lage-ho',
        youtubeUrl: 'https://youtu.be/HcEcM5AtEZ8?si=cJi8p33qsdjoBI02',
        appleMusicUrl: 'https://music.apple.com/album/satane-lage-ho',
        featured: true,
        order: 1,
        createdAt: now,
      },
      {
        id: 'alb-bhartar',
        title: 'Bhartar',
        slug: 'bhartar',
        artistName: 'R Beer & Rashmi Nishad',
        artistId: 'art-rbeer',
        coverUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
        releaseDate: '2026-08-24',
        year: 2026,
        genre: 'Rajasthani Traditional / Modern Folk Beat',
        trackCount: 1,
        spotifyUrl: 'https://open.spotify.com/album/bhartar',
        youtubeUrl: 'https://youtu.be/PsmXAUKjR5Y?si=WpdguDVkiQZkI0j6',
        appleMusicUrl: 'https://music.apple.com/album/bhartar',
        featured: true,
        order: 2,
        createdAt: now,
      },
      {
        id: 'alb-2',
        title: 'Neon Odyssey',
        slug: 'neon-odyssey',
        artistName: 'Cipher',
        artistId: 'art-3',
        coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        releaseDate: '2026-03-15',
        year: 2026,
        genre: 'Synthwave / Cyberpunk',
        trackCount: 10,
        spotifyUrl: 'https://spotify.com',
        youtubeUrl: 'https://youtube.com',
        appleMusicUrl: 'https://apple.com',
        featured: true,
        order: 3,
        createdAt: now,
      },
      {
        id: 'alb-3',
        title: 'Pulse of Jaipur',
        slug: 'pulse-of-jaipur',
        artistName: 'Sonu Charan Bhatt & VEXO Artists',
        artistId: 'art-2',
        coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80',
        releaseDate: '2026-01-20',
        year: 2026,
        genre: 'Fusion Electronic',
        trackCount: 8,
        spotifyUrl: 'https://spotify.com',
        youtubeUrl: 'https://youtube.com',
        appleMusicUrl: 'https://apple.com',
        featured: true,
        order: 4,
        createdAt: now,
      },
      {
        id: 'alb-4',
        title: 'Velvet Horizon',
        slug: 'velvet-horizon',
        artistName: 'Aria Thorne',
        artistId: 'art-4',
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
        releaseDate: '2025-11-10',
        year: 2025,
        genre: 'Ambient Soul',
        trackCount: 6,
        spotifyUrl: 'https://spotify.com',
        youtubeUrl: 'https://youtube.com',
        appleMusicUrl: 'https://apple.com',
        featured: false,
        order: 5,
        createdAt: now,
      },
    ],
    tracks: [
      {
        id: 'trk-1',
        title: 'Satane Lage Ho (Official Single)',
        artistName: 'Rashmi Nishad & Sonu Charan Bhatt',
        artistId: 'art-1',
        albumId: 'alb-1',
        duration: 254,
        coverUrl: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
        genre: 'Rajasthani Folk / Contemporary',
        spotifyUrl: 'https://open.spotify.com/album/satane-lage-ho',
        youtubeUrl: 'https://youtu.be/HcEcM5AtEZ8?si=cJi8p33qsdjoBI02',
        plays: 185000,
        isPopular: true,
        order: 1,
        createdAt: now,
      },
      {
        id: 'trk-bhartar',
        title: 'Bhartar (Official Single)',
        artistName: 'R Beer & Rashmi Nishad',
        artistId: 'art-rbeer',
        albumId: 'alb-bhartar',
        duration: 236,
        coverUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
        genre: 'Rajasthani Traditional / Beat Song',
        spotifyUrl: 'https://open.spotify.com/album/bhartar',
        youtubeUrl: 'https://youtu.be/PsmXAUKjR5Y?si=WpdguDVkiQZkI0j6',
        plays: 215000,
        isPopular: true,
        order: 2,
        createdAt: now,
      },
      {
        id: 'trk-2',
        title: 'Midnight Grid Runner',
        artistName: 'Cipher',
        artistId: 'art-3',
        albumId: 'alb-2',
        duration: 218,
        coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        genre: 'Synthwave',
        spotifyUrl: 'https://spotify.com',
        youtubeUrl: 'https://youtube.com',
        plays: 420000,
        isPopular: true,
        order: 3,
        createdAt: now,
      },
      {
        id: 'trk-3',
        title: 'Desert Echoes (Jaipur Mix)',
        artistName: 'Sonu Charan Bhatt',
        artistId: 'art-2',
        albumId: 'alb-3',
        duration: 232,
        coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80',
        genre: 'Rajasthani Fusion',
        spotifyUrl: 'https://spotify.com',
        youtubeUrl: 'https://youtube.com',
        plays: 112000,
        isPopular: false,
        order: 4,
        createdAt: now,
      },
    ],
    events: [
      {
        id: 'e-1',
        title: 'Neon Odyssey: World Tour 2026',
        slug: 'neon-odyssey-world-tour-2026',
        mainArtist: 'Cipher & Special Guests',
        date: 'OCT 24, 2026',
        time: '20:00 EST',
        venue: 'Madison Square Garden',
        location: 'New York, USA',
        price: '$85.00 - $250.00',
        status: 'upcoming',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
        featured: true,
        order: 1,
        createdAt: now,
      },
      {
        id: 'e-2',
        title: 'VEXO Sonic Homecoming',
        slug: 'vexo-sonic-homecoming',
        mainArtist: 'Rashmi Nishad, Sonu Charan Bhatt & Full Roster',
        date: 'DEC 05, 2026',
        time: '19:00 IST',
        venue: 'SMS Stadium Arena',
        location: 'Jaipur, Rajasthan, India',
        price: '₹999 - ₹4,999',
        status: 'upcoming',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        featured: true,
        order: 2,
        createdAt: now,
      },
    ],
    videos: [
      {
        id: 'vid-1',
        title: 'Satane Lage Ho (Official Music Video)',
        artist: 'Rashmi Nishad & Sonu Charan Bhatt',
        youtubeId: 'HcEcM5AtEZ8',
        thumbnailUrl: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
        duration: '4:14',
        views: 835,
        likes: 62,
        publishedAt: '4 Aug 2026',
        category: 'Official Music Videos',
        featured: true,
        description: 'Presenting the Official Song of "Satane Lage Ho" by Vexo Entertainment Pvt. Ltd.',
        tags: ['#RashmiNishad', '#SonuCharanBhatt', '#SataneLageHo'],
        order: 1,
        createdAt: now,
      },
      {
        id: 'vid-bhartar',
        title: 'BHARTAR | R Beer & Rashmi Nishad | Mohit Arora & Shivya Arora | New Rajasthani Song 2026',
        artist: 'R Beer & Rashmi Nishad',
        youtubeId: 'PsmXAUKjR5Y',
        thumbnailUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
        duration: '3:56',
        views: 553,
        likes: 68,
        publishedAt: '24 Aug 2026',
        category: 'Official Music Videos',
        featured: true,
        description: 'Presenting "BHARTAR" by Vexo Entertainment Pvt. Ltd. Starring Mohit Arora & Shivya Arora, sung by R Beer & Rashmi Nishad, music by GR Music, directed by R Beer. राजस्थानी रंग, देसी अंदाज़ और धमाकेदार बीट्स के साथ पेश है – “BHARTAR”',
        tags: ['#RajasthaniMusic', '#RashmiNishad', '#NewRajasthaniSong', '#Bhartar', '#VexoMusic', '#RBeer', '#MohitArora', '#ShivyaArora'],
        order: 2,
        createdAt: now,
      },
    ],
    services: [
      {
        id: 'srv-1',
        number: '01',
        title: 'Music Production',
        slug: 'music-production',
        category: 'STUDIO & COMPOSITION',
        shortDesc: 'Full-cycle commercial audio production from composition to stem delivery.',
        fullDesc: 'High-fidelity sonic architecture. We build tracks from the ground up, blending analog warmth with cutting-edge digital precision. Designed for artists who demand a signature sound that resonates in arenas and headphones alike.',
        imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
        icon: 'Music',
        features: ['Original Beat Crafting & Composition', 'Analog Synthesizer & Modular Gear', 'Vocal Tracking & Stem Processing', 'Custom Sound Design & FX'],
        ctaText: 'INITIATE PROJECT',
        pricingRange: 'Starting from $1,200 / ₹95,000',
        isActive: true,
        order: 1,
        createdAt: now,
      },
      {
        id: 'srv-2',
        number: '02',
        title: 'Audio & Video Production',
        slug: 'audio-video-production',
        category: 'CINEMATIC VISUALS',
        shortDesc: '4K music videos, studio visualizers, live performance shoots, and narrative films.',
        fullDesc: 'Cinematic visual storytelling. From high-concept 4K music videos to live multi-cam concert films and studio visualizers, we craft compelling imagery that elevates your sonic identity.',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        icon: 'Video',
        features: ['4K Cinema Camera Rigging (RED/ARRI)', 'Lighting Choreography & Set Design', 'Audio-Reactive 3D Visualizer Sync', 'Full Post-Production Color Grading'],
        ctaText: 'START VIDEO SHOOT',
        pricingRange: 'Starting from $2,500 / ₹1,90,000',
        isActive: true,
        order: 2,
        createdAt: now,
      },
      {
        id: 'srv-3',
        number: '03',
        title: 'Artist Management',
        slug: 'artist-management',
        category: 'CAREER ARCHITECTURE',
        shortDesc: 'Strategic representation, worldwide tour logistics, and contract negotiations.',
        fullDesc: 'Strategic career architecture. We navigate the complexities of the modern music industry, from brand positioning and contract negotiation to tour routing. We protect your vision while scaling your global reach.',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
        icon: 'Users',
        features: ['360° Career Planning & Strategy', 'Tour Routing & Live Performance Logistics', 'Contract Structuring & Legal Support', 'Brand Endorsements & Media Placement'],
        ctaText: 'JOIN ROSTER',
        pricingRange: 'Retainer & Commission Based',
        isActive: true,
        order: 3,
        createdAt: now,
      },
      {
        id: 'srv-4',
        number: '04',
        title: 'Music Distribution',
        slug: 'music-distribution',
        category: 'GLOBAL DSP PUBLISHING',
        shortDesc: 'Direct-to-DSP delivery across 150+ platforms with transparent royalty reporting.',
        fullDesc: 'Global DSP amplification. Direct publishing on Spotify, Apple Music, YouTube Music, and 150+ digital stores with fast metadata delivery, playlist pitching, and transparent royalty accounting.',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
        icon: 'Radio',
        features: ['Direct Publishing on 150+ Streaming Stores', 'Editorial DSP Playlist Pitching', 'Global Copyright & YouTube Content ID', 'Monthly Royalty Analytics Dashboard'],
        ctaText: 'PUBLISH MUSIC',
        pricingRange: 'Single & Album Packages',
        isActive: true,
        order: 4,
        createdAt: now,
      },
      {
        id: 'srv-5',
        number: '05',
        title: 'Digital Marketing',
        slug: 'digital-marketing',
        category: 'GROWTH & VIRALITY',
        shortDesc: 'Performance advertising, short-form viral strategy, and press releases.',
        fullDesc: 'Data-driven audience engagement. Targeted music ad campaigns, short-form viral strategy, press outreach, and commercial brand sponsorship curation engineered to scale streaming numbers.',
        imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80',
        icon: 'TrendingUp',
        features: ['Meta & YouTube Targeted Video Ads', 'Viral TikTok & Instagram Reels Strategy', 'Music Blog & Press Release Syndication', 'Audience Retargeting & Fan Base Funnels'],
        ctaText: 'AMPLIFY BRAND',
        pricingRange: 'Custom Campaign Budgets',
        isActive: true,
        order: 5,
        createdAt: now,
      },
      {
        id: 'srv-6',
        number: '06',
        title: 'Brand Collaborations',
        slug: 'brand-collaborations',
        category: 'COMMERCIAL PARTNERSHIPS',
        shortDesc: 'Connecting leading brands with top music talent for commercial soundtracks and campaigns.',
        fullDesc: 'We bridge top-tier commercial brands with original artists for high-impact commercial jingles, co-branded music videos, product placements, and live event sponsorships.',
        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
        icon: 'Sparkles',
        features: ['Commercial Soundtrack Licensing', 'Co-Branded Music Campaigns', 'Product Placement in Music Videos', 'Event Brand Sponsorships'],
        ctaText: 'PARTNER WITH US',
        pricingRange: 'Bespoke Brand Deals',
        isActive: true,
        order: 6,
        createdAt: now,
      },
      {
        id: 'srv-7',
        number: '07',
        title: 'Pre-Wedding Shoot',
        slug: 'pre-wedding-shoot',
        category: 'BESPOKE NARRATIVES',
        shortDesc: 'Cinematic music video styling for luxury pre-wedding storytelling.',
        fullDesc: 'High fashion storytelling for your narrative. We apply our music video production standards to personal storytelling, creating moody, editorial, and unforgettable visual documents of your relationship.',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        icon: 'Camera',
        features: ['Cinematic 4K Drone Aerial Coverage', 'Custom Tailored Music Soundtrack', 'Editorial Mood Lighting & Direction', 'Luxury Album & Video Teaser Delivery'],
        ctaText: 'CONSULT US',
        pricingRange: 'Starting from ₹1,50,000',
        isActive: true,
        order: 7,
        createdAt: now,
      },
    ],
    media: [
      {
        id: 'med-1',
        filename: 'satane-lage-ho-thumb.jpg',
        originalName: 'Satane Lage Ho Cover.jpg',
        mimeType: 'image/jpeg',
        size: 452000,
        url: 'https://img.youtube.com/vi/HcEcM5AtEZ8/maxresdefault.jpg',
        category: 'image',
        altText: 'Official cover art for Satane Lage Ho',
        createdAt: now,
      },
      {
        id: 'med-2',
        filename: 'studio-mixing-board.jpg',
        originalName: 'Studio SSL Console.jpg',
        mimeType: 'image/jpeg',
        size: 890000,
        url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
        category: 'image',
        altText: 'VEXO Studio SSL 4000 Console',
        createdAt: now,
      },
      {
        id: 'med-3',
        filename: 'neon-horizon-audio-preview.mp3',
        originalName: 'Neon Horizon Master Preview.mp3',
        mimeType: 'audio/mpeg',
        size: 3450000,
        url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=electronic-future-beats-117997.mp3',
        category: 'audio',
        altText: 'Electronic Future Beats Audio Master',
        createdAt: now,
      },
      {
        id: 'med-4',
        filename: 'cipher-live-concert-film.mp4',
        originalName: 'Cipher Live Concert 4K Teaser.mp4',
        mimeType: 'video/mp4',
        size: 14500000,
        url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        category: 'video',
        altText: 'Cipher Live in Tokyo Concert Teaser',
        createdAt: now,
      },
      {
        id: 'med-5',
        filename: 'aria-thorne-portrait.jpg',
        originalName: 'Aria Thorne Editorial Press.jpg',
        mimeType: 'image/jpeg',
        size: 670000,
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
        category: 'image',
        altText: 'Aria Thorne Press Portrait',
        createdAt: now,
      },
      {
        id: 'med-6',
        filename: 'deep-frequency-preview.mp3',
        originalName: 'Deep Frequency Club Mix.mp3',
        mimeType: 'audio/mpeg',
        size: 4200000,
        url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tech-house-preview.mp3',
        category: 'audio',
        altText: 'Tech House Club Mix Preview',
        createdAt: now,
      },
    ],
    inquiries: [
      {
        id: 'cnt-1',
        referenceId: 'VXO-2026-8942',
        name: 'Aarav Sharma',
        email: 'aarav@soundlab.in',
        phone: '+91 98290 12345',
        company: 'SoundLab Studio Mumbai',
        service: 'Music Production',
        message: 'Looking to produce a 5-track commercial EP blending traditional instruments with modern electronic soundscapes.',
        status: 'NEW',
        notes: 'Initial inquiry received via website contact form.',
        createdAt: now,
      },
      {
        id: 'cnt-2',
        referenceId: 'VXO-2026-7814',
        name: 'Priya Mehra',
        email: 'priya@apexevents.com',
        phone: '+91 98110 56789',
        company: 'Apex Entertainment & Events',
        service: 'Artist Management',
        message: 'Requesting artist booking availability for Rashmi Nishad & Sonu Charan Bhatt for Jaipur Heritage Music Festival in December.',
        status: 'CONTACTED',
        notes: 'Spoke with Priya on phone. Sent preliminary artist rate sheet and rider requirements.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'cnt-3',
        referenceId: 'VXO-2026-6520',
        name: 'Vikramaditya Rathore',
        email: 'vikram@desertvibes.org',
        phone: '+91 94140 88221',
        company: 'Desert Vibes Media',
        service: 'Audio & Video Production',
        message: 'We require a 4K cinematic music video shoot with 5.1 surround sound mastering for our upcoming single release.',
        status: 'CLOSED',
        notes: 'Project completed and delivered. Client signed off on final video master stems.',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ],
    homepage: {
      id: 'homepage-singleton',
      // Hero Section
      heroTagline: 'Pioneering Original Soundscapes & Entertainment',
      heroHeadline: 'SONIC ARCHITECTURE FOR THE NEXT ERA',
      heroSubtitle: 'VEXO Music Entertainment is a global record label, high-end audio-visual production powerhouse, and artist development agency.',
      heroBgImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=80',
      heroBgMedia: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=80',
      featuredVideoId: 'PsmXAUKjR5Y',
      heroCtaText: 'EXPLORE RELEASES',
      heroCtaUrl: '/music',
      heroSecondaryCtaText: 'STUDIO SERVICES',
      heroSecondaryCtaUrl: '/services',

      // Latest Releases Section
      releasesHeading: 'LATEST RELEASES',
      releasesSubtitle: 'Explore the newest original tracks, singles, and full albums from VEXO Music Entertainment.',
      selectedAlbumIds: ['alb-2', 'alb-bhartar', 'alb-1', 'alb-3'],
      releasesLimit: 4,

      // Featured Artists Section
      artistsHeading: 'FEATURED ARTISTS',
      artistsSubtitle: 'Discover the visionary producers, vocalists, and composers driving our sonic movement.',
      featuredArtistIds: ['art-1', 'art-rbeer', 'art-2', 'art-3'],

      // Featured Events Section
      eventsHeading: 'FEATURED EVENTS & TOUR',
      eventsSubtitle: 'Experience the raw energy of VEXO live across premier concert halls and festival stadiums globally.',
      featuredEventIds: ['evt-1', 'evt-2', 'evt-3', 'evt-4'],

      // Featured Videos Section
      videosHeading: 'OFFICIAL VIDEO PRODUCTIONS',
      videosSubtitle: 'Watch high-definition 4K music videos, studio recordings, live stadium performances, and visualizers.',
      featuredVideoIds: ['vid-1', 'vid-bhartar', 'vid-2', 'vid-3'],

      // Statistics Section
      statsArtistsCount: '10+',
      statsReleasesCount: '50+',
      statsProjectsCount: '100+',
      statsTotalStreams: '1.2M+',
      statsGlobalReach: '45+ Countries',

      // About Section
      aboutBadge: 'ABOUT VEXO',
      aboutHeading: 'VEXO MUSIC ENTERTAINMENT PVT. LTD.',
      aboutDescription: 'Pioneering original soundscapes, artist management, and digital distribution for the next generation. VEXO Music Entertainment Pvt. Ltd. is a premier music agency and record label headquartered in Jaipur, Rajasthan. We specialize in producing chart-topping commercial tracks, high-concept audio visualizers, and empowering recording artists with global digital distribution.',
      aboutImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',

      // Final CTA Section
      finalCtaBadge: 'READY TO COLLABORATE?',
      finalCtaHeading: "LET'S CREATE SOMETHING ICONIC.",
      finalCtaDescription: 'Ready to bring your sonic or visual project to life? Collaborate with our team of elite sound engineers, music directors, and producers.',
      finalCtaButtonLabel: 'START A PROJECT',
      finalCtaButtonUrl: '/contact',
      finalCtaSecondaryLabel: 'CONTACT VEXO',
      finalCtaSecondaryUrl: '/contact',

      marqueeText: 'LATEST RELEASES: "BHARTAR" BY R BEER & RASHMI NISHAD & "SATANE LAGE HO" — STREAMING NOW ON ALL MAJOR DSPS',
      updatedAt: now,
    },
    siteSettings: {
      id: 'site-settings-singleton',
      siteName: 'VEXO Music Entertainment Pvt. Ltd.',
      siteDescription: 'Premier record label, studio production house, and artist management company.',
      logoUrl: '/logo.svg',
      faviconUrl: '/favicon.ico',
      contactEmail: 'contact@vexomusic.com',
      contactPhone: '+91 98290 00000',
      officeAddress: 'VEXO Creative Studios, Tone City, Jaipur, Rajasthan, India 302001',
      copyrightText: '© 2026 VEXO Music Entertainment Pvt. Ltd. All rights reserved.',
      socialSpotify: 'https://spotify.com',
      socialYoutube: 'https://youtube.com',
      socialInstagram: 'https://instagram.com',
      socialTwitter: 'https://twitter.com',
      maintenanceMode: false,
      updatedAt: now,
    },
    activityLogs: [
      {
        id: 'log-1',
        adminUserName: 'VEXO Executive Admin',
        action: 'SYSTEM_ONLINE',
        entityType: 'System',
        createdAt: now,
      },
    ],
  };
}

class AdminMockStore {
  private db: any;

  constructor() {
    this.load();
  }

  private load() {
    const initial = getInitialMockDb();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.db = JSON.parse(saved);
        if (this.db.homepage) {
          this.db.homepage = { ...initial.homepage, ...this.db.homepage };
        }
        return;
      }
    } catch {}
    this.db = initial;
    this.save();
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
    } catch {}
  }

  public login(credentials: { email: string; password: string }) {
    const email = credentials.email.toLowerCase().trim();
    const user = this.db.adminUsers.find((u: any) => u.email.toLowerCase() === email);

    if (user) {
      const isValidPassword =
        (user.role === 'SUPER_ADMIN' && (credentials.password === 'admin' || credentials.password === 'admin123')) ||
        (user.role === 'EDITOR' && (credentials.password === 'editor' || credentials.password === 'editor123')) ||
        credentials.password === 'admin';

      if (isValidPassword) {
        const token = `mock-jwt-token-${Date.now()}`;
        return {
          success: true,
          data: {
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              lastLoginAt: new Date().toISOString(),
            },
          },
          message: `Welcome back, ${user.name}!`,
        };
      }
    }

    return {
      success: false,
      message: 'Invalid email or password credentials.',
    };
  }

  public getStats() {
    return {
      success: true,
      data: {
        kpis: {
          totalArtists: this.db.artists.length,
          totalAlbums: this.db.albums.length,
          totalTracks: this.db.tracks.length,
          totalVideos: this.db.videos.length,
          totalEvents: this.db.events.length,
          totalServices: this.db.services.length,
          totalMedia: this.db.media.length,
          totalInquiries: this.db.inquiries.length,
          newInquiries: this.db.inquiries.filter((i: any) => i.status === 'NEW').length,
        },
        recentInquiries: this.db.inquiries.slice(0, 5),
        recentActivity: this.db.activityLogs.slice(0, 8),
      },
    };
  }

  public getArtists() {
    return { success: true, data: this.db.artists };
  }

  public getArtistById(id: string) {
    const artist = this.db.artists.find((a: any) => a.id === id || a.slug === id);
    if (artist) {
      return { success: true, data: artist };
    }
    return { success: false, message: 'Artist not found' };
  }

  public createArtist(data: any) {
    const artist = { ...data, id: `art-${Date.now()}`, createdAt: new Date().toISOString() };
    this.db.artists.unshift(artist);
    this.save();
    return { success: true, data: artist };
  }

  public updateArtist(id: string, data: any) {
    const idx = this.db.artists.findIndex((a: any) => a.id === id);
    if (idx !== -1) {
      this.db.artists[idx] = { ...this.db.artists[idx], ...data };
      this.save();
      return { success: true, data: this.db.artists[idx] };
    }
    return { success: false, message: 'Artist not found' };
  }

  public deleteArtist(id: string) {
    this.db.artists = this.db.artists.filter((a: any) => a.id !== id);
    this.save();
    return { success: true };
  }

  public getAlbums() {
    return { success: true, data: this.db.albums };
  }

  public getAlbumById(id: string) {
    const album = this.db.albums.find((a: any) => a.id === id || a.slug === id);
    if (album) {
      const albumTracks = this.db.tracks
        .filter((t: any) => t.albumId === album.id)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      return { success: true, data: { ...album, tracks: albumTracks } };
    }
    return { success: false, message: 'Album not found' };
  }

  public createAlbum(data: any) {
    const album = { ...data, id: `alb-${Date.now()}`, createdAt: new Date().toISOString() };
    this.db.albums.unshift(album);
    this.save();
    return { success: true, data: album };
  }

  public updateAlbum(id: string, data: any) {
    const idx = this.db.albums.findIndex((a: any) => a.id === id);
    if (idx !== -1) {
      this.db.albums[idx] = { ...this.db.albums[idx], ...data };
      this.save();
      return { success: true, data: this.db.albums[idx] };
    }
    return { success: false };
  }

  public deleteAlbum(id: string) {
    this.db.albums = this.db.albums.filter((a: any) => a.id !== id);
    this.save();
    return { success: true };
  }

  public getTracks(albumId?: string) {
    let list = this.db.tracks;
    if (albumId) {
      list = list.filter((t: any) => t.albumId === albumId);
    }
    list = [...list].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    return { success: true, data: list };
  }

  public createTrack(data: any) {
    const track = { ...data, id: `trk-${Date.now()}`, createdAt: new Date().toISOString() };
    this.db.tracks.unshift(track);
    if (track.albumId) {
      const count = this.db.tracks.filter((t: any) => t.albumId === track.albumId).length;
      const album = this.db.albums.find((a: any) => a.id === track.albumId);
      if (album) album.trackCount = count;
    }
    this.save();
    return { success: true, data: track };
  }

  public updateTrack(id: string, data: any) {
    const idx = this.db.tracks.findIndex((t: any) => t.id === id);
    if (idx !== -1) {
      this.db.tracks[idx] = { ...this.db.tracks[idx], ...data };
      this.save();
      return { success: true, data: this.db.tracks[idx] };
    }
    return { success: false };
  }

  public reorderTracks(_albumId: string, trackIds: string[]) {
    if (Array.isArray(trackIds)) {
      trackIds.forEach((id, idx) => {
        const track = this.db.tracks.find((t: any) => t.id === id);
        if (track) {
          track.order = idx + 1;
        }
      });
      this.save();
    }
    return { success: true };
  }

  public deleteTrack(id: string) {
    const track = this.db.tracks.find((t: any) => t.id === id);
    const albumId = track?.albumId;
    this.db.tracks = this.db.tracks.filter((t: any) => t.id !== id);
    if (albumId) {
      const count = this.db.tracks.filter((t: any) => t.albumId === albumId).length;
      const album = this.db.albums.find((a: any) => a.id === albumId);
      if (album) album.trackCount = count;
    }
    this.save();
    return { success: true };
  }

  public getEvents() {
    return { success: true, data: this.db.events };
  }

  public getEventById(id: string) {
    const event = this.db.events.find((e: any) => e.id === id || e.slug === id);
    if (event) {
      return { success: true, data: event };
    }
    return { success: false, message: 'Event not found' };
  }

  public createEvent(data: any) {
    const event = { ...data, id: `e-${Date.now()}`, createdAt: new Date().toISOString() };
    this.db.events.unshift(event);
    this.save();
    return { success: true, data: event };
  }

  public updateEvent(id: string, data: any) {
    const idx = this.db.events.findIndex((e: any) => e.id === id);
    if (idx !== -1) {
      this.db.events[idx] = { ...this.db.events[idx], ...data };
      this.save();
      return { success: true, data: this.db.events[idx] };
    }
    return { success: false };
  }

  public deleteEvent(id: string) {
    this.db.events = this.db.events.filter((e: any) => e.id !== id);
    this.save();
    return { success: true };
  }

  public getVideos() {
    return { success: true, data: this.db.videos };
  }

  public getVideoById(id: string) {
    const video = this.db.videos.find((v: any) => v.id === id || v.youtubeId === id);
    if (video) {
      return { success: true, data: video };
    }
    return { success: false, message: 'Video not found' };
  }

  public createVideo(data: any) {
    const video = { ...data, id: `vid-${Date.now()}`, createdAt: new Date().toISOString() };
    this.db.videos.unshift(video);
    this.save();
    return { success: true, data: video };
  }

  public updateVideo(id: string, data: any) {
    const idx = this.db.videos.findIndex((v: any) => v.id === id);
    if (idx !== -1) {
      this.db.videos[idx] = { ...this.db.videos[idx], ...data };
      this.save();
      return { success: true, data: this.db.videos[idx] };
    }
    return { success: false };
  }

  public deleteVideo(id: string) {
    this.db.videos = this.db.videos.filter((v: any) => v.id !== id);
    this.save();
    return { success: true };
  }

  public getServices() {
    const list = [...(this.db.services || [])]
      .map((s: any) => {
        if (!s.plans || s.plans.length === 0) {
          const fallback = mockServicesList.find(
            (m) => m.id === s.id || m.slug === s.slug || m.title?.toLowerCase() === s.title?.toLowerCase()
          );
          if (fallback) {
            return {
              ...s,
              plans: fallback.plans || [],
              specs: (s.specs && s.specs.length > 0) ? s.specs : (fallback.specs || []),
              processSteps: (s.processSteps && s.processSteps.length > 0) ? s.processSteps : (fallback.processSteps || []),
              deliverables: (s.deliverables && s.deliverables.length > 0) ? s.deliverables : (fallback.deliverables || []),
              faqs: (s.faqs && s.faqs.length > 0) ? s.faqs : (fallback.faqs || []),
            };
          }
        }
        return s;
      })
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    return { success: true, data: list };
  }

  public createService(data: any) {
    const title = data.title || 'Untitled Service';
    const slug =
      data.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const currentServices = this.db.services || [];
    const order = data.order !== undefined ? Number(data.order) : currentServices.length + 1;
    const number = data.number || (order < 10 ? `0${order}` : `${order}`);

    const service = {
      ...data,
      id: `srv-${Date.now()}`,
      number,
      title,
      slug,
      icon: data.icon || 'Music',
      shortDesc: data.shortDesc || data.shortDescription || '',
      fullDesc: data.fullDesc || data.fullDescription || data.shortDesc || '',
      imageUrl: data.imageUrl || data.image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      category: data.category || 'Production',
      features: Array.isArray(data.features) ? data.features : [],
      ctaText: data.ctaText || 'INITIATE PROJECT',
      pricingRange: data.pricingRange || null,
      order,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : data.published !== undefined ? Boolean(data.published) : true,
      createdAt: new Date().toISOString(),
    };

    this.db.services.push(service);
    this.save();
    return { success: true, data: service };
  }

  public updateService(id: string, data: any) {
    const idx = this.db.services.findIndex((s: any) => s.id === id);
    if (idx !== -1) {
      const existing = this.db.services[idx];
      const updated = {
        ...existing,
        ...data,
        shortDesc: data.shortDesc !== undefined ? data.shortDesc : data.shortDescription !== undefined ? data.shortDescription : existing.shortDesc,
        fullDesc: data.fullDesc !== undefined ? data.fullDesc : data.fullDescription !== undefined ? data.fullDescription : existing.fullDesc,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : data.image !== undefined ? data.image : existing.imageUrl,
        order: data.order !== undefined ? Number(data.order) : data.displayOrder !== undefined ? Number(data.displayOrder) : existing.order,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : data.published !== undefined ? Boolean(data.published) : existing.isActive,
      };
      this.db.services[idx] = updated;
      this.save();
      return { success: true, data: updated };
    }
    return { success: false, message: 'Service not found' };
  }

  public reorderServices(serviceIds: string[]) {
    if (Array.isArray(serviceIds)) {
      serviceIds.forEach((id, idx) => {
        const s = this.db.services.find((item: any) => item.id === id);
        if (s) {
          s.order = idx + 1;
        }
      });
      this.save();
    }
    return { success: true, data: this.getServices().data };
  }

  public togglePublishService(id: string, isActive?: boolean) {
    const s = this.db.services.find((item: any) => item.id === id);
    if (s) {
      s.isActive = isActive !== undefined ? Boolean(isActive) : !s.isActive;
      this.save();
      return { success: true, data: s };
    }
    return { success: false, message: 'Service not found' };
  }

  public deleteService(id: string) {
    this.db.services = this.db.services.filter((s: any) => s.id !== id);
    this.save();
    return { success: true };
  }

  public getMedia(category?: string, search?: string) {
    let list = this.db.media || [];
    if (category && category.toLowerCase() !== 'all') {
      const cat = category.toLowerCase().trim();
      list = list.filter((m: any) => m.category?.toLowerCase() === cat);
    }
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (m: any) =>
          m.filename?.toLowerCase().includes(q) ||
          m.originalName?.toLowerCase().includes(q) ||
          m.altText?.toLowerCase().includes(q)
      );
    }
    return { success: true, data: list };
  }

  public getMediaById(id: string) {
    const item = (this.db.media || []).find((m: any) => m.id === id);
    if (item) return { success: true, data: item };
    return { success: false, message: 'Media not found' };
  }

  public async uploadFile(file: File, altText?: string, category?: string) {
    const toBase64 = (f: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

    let url = '';
    try {
      url = await toBase64(file);
    } catch {
      url = URL.createObjectURL(file);
    }

    const cat = category || (file.type.startsWith('audio/') ? 'audio' : file.type.startsWith('video/') ? 'video' : 'image');
    const media = {
      id: `med-${Date.now()}`,
      filename: `vexo-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      url,
      altText: altText || file.name,
      category: cat,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!Array.isArray(this.db.media)) this.db.media = [];
    this.db.media.unshift(media);
    this.save();
    return { success: true, data: media };
  }

  public createMedia(data: any) {
    const media = {
      ...data,
      id: data.id || `med-${Date.now()}`,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!Array.isArray(this.db.media)) this.db.media = [];
    // If media already exists, update it, otherwise unshift
    const idx = this.db.media.findIndex((m: any) => m.id === media.id);
    if (idx !== -1) {
      this.db.media[idx] = { ...this.db.media[idx], ...media };
    } else {
      this.db.media.unshift(media);
    }
    this.save();
    return { success: true, data: media };
  }

  public deleteMedia(id: string) {
    if (Array.isArray(this.db.media)) {
      this.db.media = this.db.media.filter((m: any) => m.id !== id);
      this.save();
    }
    return { success: true };
  }

  public createInquiry(data: any) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const inquiry = {
      id: `cnt-${Date.now()}`,
      referenceId: data.referenceId || `VXO-2026-${randomNum}`,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      company: data.company || '',
      service: data.service || 'General Inquiry',
      message: data.message,
      status: 'NEW',
      notes: 'Inquiry received via website booking/contact form.',
      createdAt: new Date().toISOString(),
    };
    this.db.inquiries.unshift(inquiry);
    this.save();
    return { success: true, data: inquiry };
  }

  public getInquiries(status?: string, search?: string) {
    let list = this.db.inquiries || [];
    if (status && status !== 'ALL') {
      list = list.filter((i: any) => i.status === status);
    }
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (i: any) =>
          i.name?.toLowerCase().includes(q) ||
          i.email?.toLowerCase().includes(q) ||
          i.phone?.toLowerCase().includes(q) ||
          i.company?.toLowerCase().includes(q) ||
          i.service?.toLowerCase().includes(q) ||
          i.message?.toLowerCase().includes(q) ||
          i.referenceId?.toLowerCase().includes(q)
      );
    }
    const newCount = (this.db.inquiries || []).filter((i: any) => i.status === 'NEW').length;
    return { success: true, data: list, total: list.length, newCount };
  }

  public updateInquiryStatus(id: string, status: string, notes?: string) {
    const idx = this.db.inquiries.findIndex((i: any) => i.id === id);
    if (idx !== -1) {
      this.db.inquiries[idx].status = status;
      if (notes !== undefined) this.db.inquiries[idx].notes = notes;
      this.save();
      return { success: true, data: this.db.inquiries[idx] };
    }
    return { success: false };
  }

  public deleteInquiry(id: string) {
    this.db.inquiries = this.db.inquiries.filter((i: any) => i.id !== id);
    this.save();
    return { success: true };
  }

  public getHomepage() {
    return { success: true, data: this.db.homepage };
  }

  public updateHomepage(data: any) {
    this.db.homepage = { ...this.db.homepage, ...data };
    this.save();
    return { success: true, data: this.db.homepage };
  }

  public getSiteSettings() {
    return { success: true, data: this.db.siteSettings };
  }

  public updateSiteSettings(data: any) {
    this.db.siteSettings = { ...this.db.siteSettings, ...data };
    this.save();
    return { success: true, data: this.db.siteSettings };
  }

  public getActivityLogs() {
    return { success: true, data: this.db.activityLogs };
  }

  public getUsers() {
    return { success: true, data: this.db.adminUsers };
  }

  public createUser(data: any) {
    const user = { ...data, id: `adm-${Date.now()}`, isActive: true, createdAt: new Date().toISOString() };
    this.db.adminUsers.push(user);
    this.save();
    return { success: true, data: user };
  }

  public toggleUserStatus(id: string) {
    const idx = this.db.adminUsers.findIndex((u: any) => u.id === id);
    if (idx !== -1) {
      this.db.adminUsers[idx].isActive = !this.db.adminUsers[idx].isActive;
      this.save();
      return { success: true, data: this.db.adminUsers[idx] };
    }
    return { success: false };
  }
}

export const adminMockStore = new AdminMockStore();
