import { Badge } from "@/components/ui/badge";

/** Indica de forma honesta que una función aún no está construida. */
export function ComingSoonBadge({ phase }: { phase: number }) {
  return (
    <Badge variant="secondary" className="font-normal">
      Disponible en la Fase {phase}
    </Badge>
  );
}
