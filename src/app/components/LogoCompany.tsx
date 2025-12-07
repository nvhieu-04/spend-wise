// Add img.logo.dev to your next.config.js:
// module.exports = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'img.logo.dev',
//       },
//     ],
//   },
// };

"use client";

import { FastAverageColor } from "fast-average-color";
import { useCallback } from "react";

const LOGO_PUBLIC_KEY =
  process.env.LOGO_DEV_PUBLIC_KEY || "pk_WMoeQCNFRxmS-gcweeB5SQ";

type CompanyLogoProps = {
  name: string;
  onColor?: (hex: string) => void;
  size?: number;
  className?: string;
};

function CompanyLogo({
  name,
  onColor,
  size = 128,
  className,
}: CompanyLogoProps) {
  // Map object for credit card name adjustments
  const nameAdjustments: { [key: string]: string } = {
    visa: "visa",
    mastercard: "mastercard",
    amex: "american-express",
    jcb: "JCB Co",
  };
  const adjustedName = nameAdjustments[name] || name;

  const handleComplete = useCallback(
    async (img: HTMLImageElement) => {
      try {
        const fac = new FastAverageColor();
        const { hex } = await fac.getColorAsync(img);
        onColor?.(hex);
      } catch (e) {
        // ignore color extraction failures
      }
    },
    [onColor],
  );

  return (
    <img
      src={`/api/logo?name=${encodeURIComponent(adjustedName)}`}
      alt="Company logo"
      className={className}
      onLoad={(e) => handleComplete(e.target as HTMLImageElement)}
      style={{ width: size, height: size }}
    />
  );
}
export default CompanyLogo;
