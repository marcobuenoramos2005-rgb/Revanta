import { cn } from "cn";

import { STATUS_LABELS, type ProductStatus } from "@/lib/products/labels";

const styles: Record<ProductStatus, string> = {
  in_stock: "bg-secondary text-secondary-foreground",
  listed: "bg-primary/12 text-primary dark:bg-primary/20",
  reserved: "bg-warning/20 text-amber-800 dark:text-warning",
  sold: "bg-success/15 text-success",
  archived: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status, className }: { status: ProductStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        styles[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
