"use client";
import { motion } from "framer-motion";

const paths = [
  "M 0 200 L 150 200 L 150 100 L 300 100",
  "M 300 100 L 450 100 L 450 250 L 600 250",
  "M 600 250 L 750 250 L 750 150 L 900 150",
  "M 0 400 L 200 400 L 200 300 L 400 300 L 400 450 L 600 450",
  "M 600 450 L 700 450 L 700 350 L 900 350",
  "M 100 0 L 100 150 L 250 150 L 250 300",
  "M 500 0 L 500 100 L 650 100 L 650 200 L 800 200",
  "M 800 200 L 800 400 L 1000 400",
  "M 150 500 L 350 500 L 350 380 L 550 380",
  "M 50 300 L 50 450 L 200 450",
];

export function CircuitBackground({ opacity = 0.04 }: { opacity?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        style={{ opacity }}
      >
        {paths.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              pathLength: { duration: 3, ease: "linear", delay: i * 0.2 },
              opacity: { duration: 0.5, delay: i * 0.2 },
            }}
          />
        ))}
        {/* Circuit nodes */}
        {[
          [150, 200], [300, 100], [450, 250], [600, 250], [750, 150],
          [200, 400], [400, 300], [700, 450], [100, 150], [650, 100],
        ].map(([cx, cy], i) => (
          <motion.circle
            key={`node-${i}`}
            cx={cx}
            cy={cy}
            r="3"
            fill="#2563EB"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.2, duration: 0.3 }}
          />
        ))}
      </svg>
    </div>
  );
}
