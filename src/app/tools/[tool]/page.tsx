"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import GenericBuilder from "@/components/GenericBuilder";
import { getToolBySlug } from "@/lib/tool-registry";
import { TOOL_CONFIGS } from "@/lib/tool-configs";

export default function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool: slug } = use(params);
  const tool = getToolBySlug(slug);
  const config = TOOL_CONFIGS[slug];

  if (!tool || !config) {
    notFound();
  }

  return <GenericBuilder tool={tool} config={config} />;
}
