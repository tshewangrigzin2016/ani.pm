import React from 'react';
import { Link } from 'react-router-dom';

export const BrandMark: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <Link to="/" className="sitebar__brand" aria-label="ani.pm home" title="ani.pm home">
      <span className="sitebar__mark" aria-hidden="true" />
      {!compact && (
        <span className="sitebar__word" aria-hidden="true">
          ANI<span>.PM</span>
        </span>
      )}
    </Link>
  );
};

export const BrandFooterLockup: React.FC = () => {
  return (
    <Link to="/" className="brand-lockup" aria-label="ani.pm">
      <span className="brand-star" aria-hidden="true" />
      <svg
        className="brand-lockup__name"
        width="77"
        height="31"
        viewBox="0 0 3023 1210"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient
            id="pmr0"
            gradientUnits="userSpaceOnUse"
            x1="1231.5"
            y1="440.3"
            x2="3099.7"
            y2="769.7"
          >
            <stop offset="0.1" className="pmr0-s1" />
            <stop offset="0.55" className="pmr0-s2" />
            <stop offset="0.95" className="pmr0-s3" />
          </linearGradient>
        </defs>
        <path
          d="M215 979.6Q162.9 979.6 121.7 961.2Q80.6 942.9 57 906.6Q33.4 870.3 33.4 816.4Q33.4 770.5 50.1 739.9Q66.8 709.3 95.8 690.6Q124.9 671.9 161.8 662.2Q198.8 652.4 239.2 648.6Q286.5 643.8 315.5 639.6Q344.6 635.4 358.1 626.5Q371.7 617.5 371.7 599.8V597.4Q371.7 574.1 361.8 557.9Q351.8 541.7 332.8 533.1Q313.7 524.5 285.9 524.5Q257.9 524.5 237 533Q216 541.6 202.6 555.8Q189.2 570 183.3 587.7L49 565.4Q62.9 517.7 95.6 484.5Q128.4 451.3 177 433.8Q225.7 416.3 286.4 416.3Q330.3 416.3 371.8 426.7Q413.3 437.1 446.3 459.3Q479.3 481.4 498.7 516.6Q518.1 551.8 518.1 601.5V969H379.2V893.2H374.4Q361.2 918.6 339.2 938Q317.3 957.5 286.4 968.6Q255.5 979.6 215 979.6ZM256.2 876.9Q290.8 876.9 317 863.1Q343.1 849.4 357.9 826Q372.8 802.6 372.8 773.8V714.8Q366.1 719.3 353 723.2Q340 727.2 323.9 730.3Q307.8 733.4 292.1 735.7Q276.5 738 264.3 739.7Q237.3 743.3 216.8 752.1Q196.4 760.8 185 775.4Q173.7 790 173.7 812.1Q173.7 833.3 184.4 847.7Q195.1 862.1 213.6 869.5Q232.2 876.9 256.2 876.9ZM734.4 652.9V969H587.9V423.1H726.2L728.5 559.4H719.8Q741.2 491.1 785 453.7Q828.8 416.3 897.9 416.3Q954.7 416.3 996.8 440.9Q1039 465.6 1062.3 511.7Q1085.6 557.7 1085.6 621.8V969H939.2V647.3Q939.2 596.4 913 567.5Q886.7 538.6 840.4 538.6Q809.5 538.6 785.5 552.1Q761.5 565.7 748 591.1Q734.4 616.6 734.4 652.9ZM1155.5 969V423.1H1301.9V969ZM1228.7 351.9Q1195.6 351.9 1172 329.8Q1148.4 307.7 1148.4 276.8Q1148.4 245.2 1172 223.3Q1195.6 201.5 1228.7 201.5Q1261.9 201.5 1285.5 223.3Q1309.2 245.1 1309.2 276.7Q1309.2 307.7 1285.5 329.8Q1261.9 351.9 1228.7 351.9Z"
          fill="currentColor"
        />
        <path
          d="M1476.1 978.2Q1440.3 978.2 1415.9 954.1Q1391.5 929.9 1391.5 894.4Q1391.5 858.9 1415.9 834.7Q1440.3 810.6 1476.1 810.6Q1511.9 810.6 1536.3 834.7Q1560.7 858.9 1560.7 894.4Q1560.7 929.9 1536.3 954.1Q1511.9 978.2 1476.1 978.2ZM1650.5 1173.1V423.1H1794.5V515H1801.6Q1811.7 493.2 1830.4 470.3Q1849.1 447.5 1880 431.9Q1910.8 416.3 1957.2 416.3Q2017.9 416.3 2068.1 447.5Q2118.2 478.8 2148.4 541.3Q2178.6 603.7 2178.6 697Q2178.6 787.9 2149.3 850.5Q2120 913.2 2069.7 945.7Q2019.4 978.1 1956.4 978.1Q1912 978.1 1881.2 963Q1850.4 948 1831.2 925.8Q1812 903.6 1801.6 881.6H1796.9V1173.1ZM1911.3 860.7Q1949.6 860.7 1975.6 839.7Q2001.6 818.7 2015 781.6Q2028.4 744.4 2028.4 696.5Q2028.4 648.6 2015.1 611.9Q2001.8 575.2 1975.8 554.4Q1949.9 533.6 1911.3 533.6Q1873.6 533.6 1847.4 553.8Q1821.1 573.9 1807.5 610.3Q1793.8 646.8 1793.8 696.5Q1793.8 745.7 1807.6 782.6Q1821.3 819.5 1847.7 840.1Q1874.1 860.7 1911.3 860.7ZM2225.9 969V423.1H2361.9L2369 558.9H2358.5Q2370.8 508.4 2395.6 476.7Q2420.4 445 2453.7 430Q2486.9 414.9 2523.4 414.9Q2582.2 414.9 2618.4 452.3Q2654.6 489.7 2671.7 567.8H2654.7Q2666.8 515.2 2694.6 481.3Q2722.3 447.4 2759.9 431.2Q2797.6 414.9 2839.5 414.9Q2889.5 414.9 2928.8 436.7Q2968.1 458.6 2990.8 499.9Q3013.4 541.3 3013.4 600.8V969H2867V628.9Q2867 582.4 2842 559.8Q2817 537.2 2780.4 537.2Q2752.7 537.2 2732.5 549.3Q2712.2 561.4 2701.3 582.8Q2690.5 604.3 2690.5 633.1V969H2548.8V624.8Q2548.8 584.7 2525.1 560.9Q2501.4 537.2 2463.8 537.2Q2438.1 537.2 2417.3 549Q2396.4 560.9 2384.4 583.5Q2372.3 606 2372.3 639V969Z"
          fill="url(#pmr0)"
        />
      </svg>
    </Link>
  );
};

interface AvatarBadgeProps {
  username: string;
  avatar?: string | null;
  color?: string;
  size?: number;
  frameStyle?: 'none' | 'crown' | 'celestial' | 'crimson' | 'neon';
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  username,
  avatar,
  color = '#43465a',
  size = 28,
  frameStyle = 'none',
}) => {
  const initial = (username?.trim()?.[0] ?? 'A').toUpperCase();
  const frameClass =
    frameStyle && frameStyle !== 'none' ? `avatar-frame-ring avatar-frame-ring--${frameStyle}` : '';

  return (
    <span
      className={frameClass}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        background: avatar ? '#191a20' : color,
        color: '#ffffff',
        fontSize: Math.max(10, Math.round(size * 0.42)),
        fontWeight: 700,
      }}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={username}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        initial
      )}
    </span>
  );
};

export function formatTimeSec(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const rem = sec % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  }
  return `${mins}:${String(rem).padStart(2, '0')}`;
}
