"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import type { ModuleImpact } from "@/types/release";
import { SectionHeading } from "./SectionHeading";

const riskColor: Record<string, string> = {
  high: "#fb7185",
  medium: "#fbbf24",
  low: "#34d399",
};

interface TreemapCellProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  size?: number;
  riskLevel?: string;
  depth?: number;
}

function TreemapCell(props: TreemapCellProps) {
  const { x = 0, y = 0, width = 0, height = 0, name, size, riskLevel, depth } = props;
  if (depth === 0) return null;
  const color = riskColor[riskLevel ?? "low"];
  const showLabel = width > 70 && height > 50;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={12}
        fill={color}
        fillOpacity={0.18}
        stroke={color}
        strokeOpacity={0.5}
        strokeWidth={1.5}
      />
      {showLabel && (
        <>
          <text x={x + 14} y={y + 26} fill="#fff" fontSize={13} fontWeight={600}>
            {name}
          </text>
          <text x={x + 14} y={y + 46} fill="rgba(255,255,255,0.55)" fontSize={11}>
            {size} files changed
          </text>
        </>
      )}
    </g>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TreemapCellProps }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const color = riskColor[data.riskLevel ?? "low"];

  return (
    <div className="rounded-lg border border-white/10 bg-[#0e0e16]/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      <p className="font-medium text-white">{data.name}</p>
      <p className="mt-0.5 text-white/55">{data.size} files changed</p>
      <p className="mt-1 flex items-center gap-1.5" style={{ color }}>
        <span className="inline-block size-1.5 rounded-full" style={{ background: color }} />
        {data.riskLevel} impact
      </p>
    </div>
  );
}

interface ImpactHeatmapProps {
  impactModules: ModuleImpact[];
}

export function ImpactHeatmap({ impactModules }: ImpactHeatmapProps) {
  const treemapData = impactModules.map((m) => ({
    name: m.name,
    size: m.filesChanged,
    riskLevel: m.riskLevel,
  }));

  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
      <SectionHeading
        eyebrow="Impact Heatmap"
        title="Where this release hit hardest"
        description="Module size reflects the number of files modified — hover to inspect."
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="h-[420px] rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
      >
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="size"
            nameKey="name"
            stroke="transparent"
            content={<TreemapCell />}
            isAnimationActive={false}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </motion.div>

      <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/50">
        {Object.entries(riskColor).map(([level, color]) => (
          <span key={level} className="flex items-center gap-1.5 capitalize">
            <span className="inline-block size-2.5 rounded-full" style={{ background: color }} />
            {level} impact
          </span>
        ))}
      </div>
    </section>
  );
}
