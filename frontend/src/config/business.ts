/**
 * Centralized Business Configuration for TrustZone Mobile Care
 * Decoupled data layers for easy rebranding, branch changes, or localization updates.
 */

export interface BranchInfo {
  id: string;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  whatsapp: string;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
    embedSrc: string;
  };
}

export interface BusinessConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  email: string;
  helpline: string;
  whatsapp: string;
  socials: {
    facebook: string;
    youtube: string;
    instagram: string;
  };
  defaultHours: string;
  currency: {
    code: string;
    symbol: string;
  };
  branches: BranchInfo[];
}

export const businessConfig: BusinessConfig = {
  name: 'TrustZone Mobile Care',
  shortName: 'TrustZone',
  tagline: "Bangladesh's Premier Smartphone Diagnostics Lab",
  description: 'Dhaka’s premier certified smartphone repair diagnostic lab. Screen replacements, battery diagnostics, water decontamination, and software upgrades with lifetime warranty.',
  email: 'support@trustzone.care',
  helpline: '+880 1977-123456',
  whatsapp: 'https://wa.me/8801977123456',
  socials: {
    facebook: 'https://facebook.com/trustzonemobilecare',
    youtube: 'https://youtube.com/c/trustzonemobilecare',
    instagram: 'https://instagram.com/trustzonemobilecare',
  },
  defaultHours: '10:00 AM - 08:00 PM (Open Every Day)',
  currency: {
    code: 'BDT',
    symbol: '৳',
  },
  branches: [
    {
      id: 'dhanmondi',
      name: 'Dhanmondi Head Office (Metro Shopping Mall)',
      shortName: 'Dhanmondi Lab',
      address: 'Level 4, Shop #412, Metro Shopping Mall, Mirpur Road, Dhanmondi, Dhaka 1209',
      phone: '+880 1977-123456',
      whatsapp: 'https://wa.me/8801977123456',
      hours: '10:00 AM - 08:00 PM (Open Every Day)',
      coordinates: {
        lat: 23.750858,
        lng: 90.391084,
        embedSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9024424301387!2d90.3910840763261!3d23.750858178668472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8bd55555555%3A0x7d6a5e1cfdb08fcd!2sDhaka%201215!5e0!3m2!1sen!2sbd!4v1711200000000!5m2!1sen!2sbd',
      },
    },
    {
      id: 'banani',
      name: 'Banani Laboratory Branch (Road 11)',
      shortName: 'Banani Lab',
      address: 'Level 2, Plot #45, Road 11, Banani, Dhaka 1213',
      phone: '+880 1977-123455',
      whatsapp: 'https://wa.me/8801977123455',
      hours: '10:00 AM - 08:00 PM (Open Every Day)',
      coordinates: {
        lat: 23.7937,
        lng: 90.4066,
        embedSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.098485292437!2d90.4066!3d23.7937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7a3f5555555%3A0x7fa28987b7a12345!2sRoad+11%2C+Banani%2C+Dhaka!5e0!3m2!1sen!2sbd!4v1711200000000!5m2!1sen!2sbd',
      },
    },
    {
      id: 'mirpur',
      name: 'Mirpur-10 Diagnostic Desk (Opposite Fire Station)',
      shortName: 'Mirpur Lab',
      address: 'Level 1, Section 10, Sector C, Mirpur, Dhaka 1216',
      phone: '+880 1977-123454',
      whatsapp: 'https://wa.me/8801977123454',
      hours: '10:00 AM - 08:00 PM (Open Every Day)',
      coordinates: {
        lat: 23.8069,
        lng: 90.3687,
        embedSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.789124589234!2d90.3687!3d23.8069!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c12345555555%3A0x7d6a5e123456789!2sMirpur-10%2C+Dhaka!5e0!3m2!1sen!2sbd!4v1711200000000!5m2!1sen!2sbd',
      },
    },
    {
      id: 'uttara',
      name: 'Uttara Lab Desk (Sector 7, commercial zone)',
      shortName: 'Uttara Lab',
      address: 'Level 3, House #12, Sector 7, Uttara Commercial Area, Dhaka 1230',
      phone: '+880 1977-123453',
      whatsapp: 'https://wa.me/8801977123453',
      hours: '10:00 AM - 08:00 PM (Open Every Day)',
      coordinates: {
        lat: 23.8729,
        lng: 90.4007,
        embedSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3646.432845239847!2d90.4007!3d23.8729!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c56789123456%3A0x7d6a5e7890123456!2sSector+7%2C+Uttara%2C+Dhaka!5e0!3m2!1sen!2sbd!4v1711200000000!5m2!1sen!2sbd',
      },
    },
  ],
};

// Static content items centralized here to allow single-point localization updates

export const pricingMatrix = [
  {
    device: 'iPhone 14 Pro / Pro Max',
    screen: '৳18,500',
    battery: '৳5,500',
    port: '৳3,500',
    water: '৳3,000',
  },
  {
    device: 'iPhone 13 / 13 Pro',
    screen: '৳14,500',
    battery: '৳4,500',
    port: '৳2,500',
    water: '৳2,500',
  },
  {
    device: 'Samsung Galaxy S23 Ultra',
    screen: '৳22,500',
    battery: '৳6,500',
    port: '৳4,000',
    water: '৳3,000',
  },
  {
    device: 'Samsung Galaxy S22 / S22+',
    screen: '৳16,500',
    battery: '৳5,000',
    port: '৳3,000',
    water: '৳2,500',
  },
  {
    device: 'iPad Air (5th Gen)',
    screen: '৳15,500',
    battery: '৳6,500',
    port: '৳4,500',
    water: '৳3,500',
  },
];

export const faqsList = [
  {
    q: 'Do you charge a diagnostic fee at the counter?',
    a: 'We charge a flat diagnostics assessment fee of ৳500 for motherboard trace diagnostics. If you proceed with the hardware repair at our desks, this diagnostics fee is completely waived and deducted from your final bill.',
  },
  {
    q: 'How long does a mobile screen replacement take?',
    a: 'Most standard display assembly, glass lens swap, and touch calibrator procedures are completed within 30 to 45 minutes on our workbench.',
  },
  {
    q: 'Will my TrueTone and face serialization work post-repair?',
    a: 'Yes. We utilize hardware EEPROM programming chips to transfer internal screen calibration signatures, fully preserving TrueTone and FaceID functions.',
  },
  {
    q: 'What does your lifetime component warranty cover?',
    a: 'Our lifetime warranty covers all manufacturing assembly defects, touch digitizer stuttering, or display line glitches. It does not cover secondary accidents, glass shatters, or liquid exposures.',
  },
  {
    q: 'Is my personal data safe during diagnostics?',
    a: 'Yes. We strictly adhere to clean workbench protocols. Diagnostics do not require device passcodes unless testing specific radio antennas. Your private data is completely untouched.',
  },
];

export const blogArticles = [
  {
    slug: 'swollen-battery-warning-signs',
    title: 'Swollen Batteries: 5 Warning Signs to Watch For',
    desc: 'Understand the heat indexes and voltage cuts that indicate swollen cells before they damage your phone screen.',
    date: 'July 8, 2026',
    readTime: '3 min read',
    content: 'Lithium-ion cells degrade naturally, but high temperature operations speed up chemical outgassing...',
  },
  {
    slug: 'why-rice-fails-liquid-damage',
    title: 'Why Rice Fails to Save Liquid Damaged Motherboards',
    desc: 'Debunking the rice myth - why professional ultrasonic solvent decontamination is required immediately.',
    date: 'July 5, 2026',
    readTime: '5 min read',
    content: 'Placing a wet device in rice does not extract deep micro-circuit moisture. The lingering salt residue accelerates copper corrosion...',
  },
  {
    slug: 'understanding-amoled-burnin',
    title: 'Understanding AMOLED Display Burn-In and Overlays',
    desc: 'Why status bars leave ghosts on organic screen layers and how voltage calibrations can alleviate slight discolorations.',
    date: 'June 28, 2026',
    readTime: '4 min read',
    content: 'Subpixel luminance wear is an inherent trait of organic LEDs. Discover how modern panels mitigate burn-in traces...',
  },
];

export const reviewsList = [
  {
    name: 'Tanvir Hossain',
    role: 'Software Architect, Banani',
    device: 'iPhone 14 Pro Max',
    text: 'My iPhone 14 Pro Max screen was completely shattered. Took it to TrustZone Metro Shopping Mall branch. They replaced the display panel in 35 minutes! TrueTone works perfectly.',
    stars: 5,
  },
  {
    name: 'Farhana Akter',
    role: 'Content Creator, Dhanmondi',
    device: 'Samsung S22 Ultra',
    text: 'Professional, clean laboratory diagnostics. They diagnosed a short-circuit on my OnePlus 11 motherboard and resolved it the same afternoon. Completely transparent prices.',
    stars: 5,
  },
  {
    name: 'Sajid Rahman',
    role: 'Tech Lead, Mirpur',
    device: 'OnePlus 11',
    text: 'Excellent service. The charging port fix took less than 20 minutes. Recommended for express repairs in Dhaka.',
    stars: 5,
  },
];

export const beforeAfterList = [
  {
    title: 'Shattered Display Recovery',
    desc: 'Display lamination under dust-free vacuum hood',
    before: 'Shattered glass, leaking black display matrix, non-responsive touch.',
    after: 'Flawless grade-A OLED panel replacement, original TrueTone calibration restored.',
  },
  {
    title: 'Swollen Battery Safety Swap',
    desc: 'Voltage draw profiling & battery tab pull',
    before: 'Expanded lithium cell pushing back glass off the frame, maximum capacity 71%.',
    after: 'OEM high-drain cell installed, frame re-glued, maximum capacity 100% capacity cycle.',
  },
  {
    title: 'iPad Water Contamination',
    desc: 'Motherboard chemical decontamination',
    before: 'Liquid spots on LCD, corrosion layers on charging IC pins, short standby current.',
    after: 'Ultrasonic solvent clean, trace soldering repair, fully booted with files preserved.',
  },
];

export const partnerBrands = [
  { name: 'Apple', logo: '' },
  { name: 'Samsung', logo: 'Samsung' },
  { name: 'Xiaomi', logo: 'Mi' },
  { name: 'OnePlus', logo: '1+' },
  { name: 'Realme', logo: 'realme' },
  { name: 'Vivo', logo: 'vivo' },
  { name: 'Oppo', logo: 'oppo' },
  { name: 'Google Pixel', logo: 'G' },
];
