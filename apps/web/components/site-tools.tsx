"use client";
import { useState } from "react";
import { AdamaAi } from "./adama-ai";

export function SiteTools() {
  const [open, setOpen] = useState(false);
  return <AdamaAi open={open} onOpenChange={setOpen} />;
}
