import { ChevronDown } from "lucide-react";
import type { GameMap } from "@/domain/map";
import { cn } from "@/lib/utils";

type MapSelectorProps = {
  activeMapId: GameMap["id"];
  className?: string;
  labelClassName?: string;
  maps: readonly GameMap[];
  onMapChange: (mapId: GameMap["id"]) => void;
  selectClassName?: string;
};

export function MapSelector({
  activeMapId,
  className,
  labelClassName,
  maps,
  onMapChange,
  selectClassName,
}: MapSelectorProps) {
  return (
    <label
      className={cn(
        "grid min-w-0 gap-2 text-sm font-semibold text-foreground",
        className,
      )}
    >
      <span className={labelClassName}>Map</span>
      <span className="relative min-w-0">
        <select
          className={cn(
            "h-10 w-full appearance-none rounded-md border border-input bg-card px-3 pr-9 text-sm text-card-foreground shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            selectClassName,
          )}
          onChange={(event) => onMapChange(event.target.value)}
          value={activeMapId}
        >
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </span>
    </label>
  );
}
