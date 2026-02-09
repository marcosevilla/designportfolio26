"use client";

import { useEffect } from "react";
import { useSidebar, type TOCItem } from "@/lib/SidebarContext";

export default function SidebarTOCBridge({
  items,
  backHref = "/#work",
}: {
  items: TOCItem[];
  backHref?: string;
}) {
  const { setTocItems, setBackHref } = useSidebar();

  useEffect(() => {
    setTocItems(items);
    setBackHref(backHref);
    return () => {
      setTocItems(null);
      setBackHref(null);
    };
  }, [items, backHref, setTocItems, setBackHref]);

  return null;
}
