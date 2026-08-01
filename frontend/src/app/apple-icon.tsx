import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

/**
 * Dynamic Apple Touch Icon Generator matching centralized branding.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '22%',
          background: 'linear-gradient(to top right, #1877f2, #16a34a)',
          padding: 28,
        }}
      >
        {/* White shield icon with inner checkmark */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L3 6V12C3 17 8.5 21 12 22C15.5 21 21 17 21 12V6L12 2Z"
            fill="white"
          />
          <path
            d="M9 11L11 13L15 9"
            stroke="#1877f2"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
