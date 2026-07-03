/**
 * Brand Color Palette
 * Based on the provided color scheme with priority order
 */

export const brandColors = {
  // Color 1 (Primary) - rgb(83, 88, 94) - Dark gray - Most used
  primary: {
    50: '#f8f9fa',
    100: '#e9ecef',
    200: '#dee2e6',
    300: '#ced4da',
    400: '#adb5bd',
    500: '#6c757d',
    600: '#53585e', // Main primary color
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },

  // Color 2 (Secondary) - rgb(218, 83, 52) - Red/orange
  secondary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#da5334', // Main secondary color
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Color 3 (Accent) - rgb(224, 225, 224) - Light gray
  accent: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#e0e1e0', // Main accent color
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },

  // Color 4 (Muted) - rgb(169, 169, 170) - Medium gray
  muted: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#a9a9aa', // Main muted color
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Color 5 (Dark) - rgb(127, 73, 54) - Brown
  dark: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#7f4936', // Main dark color
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },

  // Color 6 (Neutral) - rgb(151, 141, 132) - Beige/brown
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#978d84', // Main neutral color
    700: '#57534e',
    800: '#44403c',
    900: '#292524',
  },
} as const;

/**
 * Get color class names for Tailwind CSS
 */
export const getBrandColorClasses = {
  primary: {
    bg: 'bg-slate-600',
    text: 'text-slate-600',
    border: 'border-slate-600',
    hover: 'hover:bg-slate-700',
  },
  secondary: {
    bg: 'bg-red-600',
    text: 'text-red-600',
    border: 'border-red-600',
    hover: 'hover:bg-red-700',
  },
  accent: {
    bg: 'bg-gray-200',
    text: 'text-gray-200',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-300',
  },
  muted: {
    bg: 'bg-gray-400',
    text: 'text-gray-400',
    border: 'border-gray-400',
    hover: 'hover:bg-gray-500',
  },
  dark: {
    bg: 'bg-amber-800',
    text: 'text-amber-800',
    border: 'border-amber-800',
    hover: 'hover:bg-amber-900',
  },
  neutral: {
    bg: 'bg-stone-500',
    text: 'text-stone-500',
    border: 'border-stone-500',
    hover: 'hover:bg-stone-600',
  },
} as const;

/**
 * Status colors using the brand palette
 */
export const statusColors = {
  success: brandColors.secondary[600], // Red/orange for success
  warning: brandColors.dark[600], // Brown for warning
  error: brandColors.secondary[700], // Darker red for error
  info: brandColors.primary[600], // Dark gray for info
  neutral: brandColors.muted[600], // Medium gray for neutral
} as const;

/**
 * Room status colors
 */
export const roomStatusColors = {
  FREE: '#16a34a', // Green for free
  BUSY: '#dc2626', // Red for busy
  MAINTENANCE: '#6b7280', // Grey for maintenance
} as const;

/**
 * Booking status colors
 */
export const bookingStatusColors = {
  ACTIVE: brandColors.secondary[600], // Red/orange for active
  CANCELLED: brandColors.primary[600], // Dark gray for cancelled
  COMPLETED: brandColors.muted[600], // Medium gray for completed
} as const;
