import { useEffect, useRef } from "react";
import { divIcon, type Marker as LeafletMarker } from "leaflet";
import { Marker, Popup, Tooltip } from "react-leaflet";
import type { GameMap } from "@/domain/map";
import type {
  MapMarker,
  MarkerInteractable,
  MarkerMonster,
  MarkerResourceItem,
} from "@/domain/marker";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { percentageToLeafletLatLng } from "@/lib/coordinates";
import { markerVisualStyle } from "@/lib/marker-style";
import { cn } from "@/lib/utils";

type MapMarkersProps = {
  map: GameMap;
  markers: MapMarker[];
  onMarkerSelect: (markerId: MapMarker["id"]) => void;
  selectedMarkerId?: MapMarker["id"];
};

type MarkerPopupProps = {
  marker: MapMarker;
};

type PopupEntry = MarkerMonster | MarkerResourceItem | MarkerInteractable;

type MapMarkerItemProps = {
  map: GameMap;
  marker: MapMarker;
  onMarkerSelect: (markerId: MapMarker["id"]) => void;
  selectedMarkerId?: MapMarker["id"];
};

const markerIconsByKey = new Map<string, ReturnType<typeof divIcon>>();

function markerIcon(style: ReturnType<typeof markerVisualStyle>) {
  const iconKey = `${style.color}:${style.className ?? "plain"}`;
  const cachedIcon = markerIconsByKey.get(iconKey);

  if (cachedIcon) {
    return cachedIcon;
  }

  const icon = divIcon({
    className: cn("map-marker", style.className),
    html: `<span class="map-marker__pin" style="--marker-color: ${style.color}"></span>`,
    iconAnchor: [13, 13],
    iconSize: [26, 26],
    popupAnchor: [0, -12],
  });

  markerIconsByKey.set(iconKey, icon);

  return icon;
}

function PopupEntryRow({ entry }: { entry: PopupEntry }) {
  const label = (
    <span className="min-w-0 flex-1 truncate text-xs leading-5">
      {entry.name}
    </span>
  );

  return (
    <span className="inline-flex min-w-0 max-w-[12rem] items-center gap-1.5 rounded-sm bg-secondary px-1.5 py-0.5 text-secondary-foreground">
      {entry.imageUrl ? (
        <img
          alt=""
          className="size-4 shrink-0 rounded-[2px] object-contain"
          height={16}
          loading="lazy"
          src={entry.imageUrl}
          width={16}
        />
      ) : null}
      {entry.wikiUrl ? (
        <a
          className="min-w-0 flex-1 truncate text-xs leading-5 font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          href={entry.wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {entry.name}
        </a>
      ) : (
        label
      )}
      {"chancePercent" in entry && entry.chancePercent !== undefined ? (
        <Badge
          className="h-4 rounded-sm px-1 text-[0.625rem] leading-none font-semibold"
          variant="outline"
        >
          {entry.chancePercent}%
        </Badge>
      ) : null}
    </span>
  );
}

function MarkerPopup({ marker }: MarkerPopupProps) {
  const monsters =
    marker.monsters?.filter((monster) => monster.name.trim()) ?? [];
  const resourceGroups =
    marker.resources?.filter((resource) =>
      resource.items.some((item) => item.name.trim()),
    ) ?? [];
  const interactables =
    marker.interactables?.filter((interactable) => interactable.name.trim()) ??
    [];
  const metadataBadges = [
    marker.warpPoint ? "Warp point" : undefined,
    marker.area,
    marker.zoneType,
    marker.level ? `Level ${marker.level}` : undefined,
  ].filter(Boolean);

  return (
    <article className="grid max-w-[260px] min-w-[190px] gap-3 text-popover-foreground">
      <div className="grid gap-2">
        <h2 className="text-base leading-tight font-bold text-foreground">
          {marker.name}
        </h2>
        {metadataBadges.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {metadataBadges.map((badge) => (
              <Badge
                className={cn(
                  "rounded-full px-2 py-0.5 text-[0.6875rem] leading-4 font-semibold",
                  badge === "Warp point" &&
                    "border-cyan-200 bg-cyan-50 text-cyan-800",
                )}
                key={badge}
                variant={badge === "Warp point" ? "outline" : "secondary"}
              >
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {monsters.length > 0 ? (
        <>
          <Separator />
          <section className="grid gap-1.5" aria-label="Monsters">
            <h3 className="text-[0.6875rem] leading-none font-bold tracking-normal text-muted-foreground uppercase">
              Monsters
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {monsters.map((monster) => (
                <li className="min-w-0" key={monster.name}>
                  <PopupEntryRow entry={monster} />
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {resourceGroups.length > 0 ? (
        <>
          <Separator />
          <section className="grid gap-1.5" aria-label="Resources">
            <h3 className="text-[0.6875rem] leading-none font-bold tracking-normal text-muted-foreground uppercase">
              Resources
            </h3>
            <div className="grid gap-1.5">
              {resourceGroups.map((resource, resourceIndex) => {
                const items = resource.items.filter((item) => item.name.trim());

                return (
                  <div
                    className="grid gap-1"
                    key={`${resource.type}-${resourceIndex}`}
                  >
                    <h4 className="text-xs leading-snug font-semibold text-foreground">
                      {resource.type}
                    </h4>
                    <ul className="flex flex-wrap gap-1.5">
                      {items.map((item) => (
                        <li className="min-w-0" key={item.name}>
                          <PopupEntryRow entry={item} />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : null}

      {interactables.length > 0 ? (
        <>
          <Separator />
          <section className="grid gap-1.5" aria-label="Interactables">
            <h3 className="text-[0.6875rem] leading-none font-bold tracking-normal text-muted-foreground uppercase">
              Interactables
            </h3>
            <ul className="flex flex-wrap gap-1.5">
              {interactables.map((interactable) => (
                <li className="min-w-0" key={interactable.name}>
                  <PopupEntryRow entry={interactable} />
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {marker.wikiUrl ? (
        <>
          <Separator />
          <a
            className="w-fit text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            href={marker.wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open wiki page
          </a>
        </>
      ) : null}
    </article>
  );
}

function MapMarkerItem({
  map,
  marker,
  onMarkerSelect,
  selectedMarkerId,
}: MapMarkerItemProps) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const position = percentageToLeafletLatLng(marker, map);
  const isSelected = marker.id === selectedMarkerId;
  const visualStyle = markerVisualStyle(marker, { selected: isSelected });

  useEffect(() => {
    if (!isSelected) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      markerRef.current?.openPopup();
    }, 550);

    return () => window.clearTimeout(timeoutId);
  }, [isSelected]);

  return (
    <Marker
      icon={markerIcon(visualStyle)}
      ref={markerRef}
      eventHandlers={{ click: () => onMarkerSelect(marker.id) }}
      position={position}
      title={marker.name}
    >
      <Tooltip
        className="map-marker-tooltip"
        direction="top"
        offset={[0, -14]}
        opacity={1}
      >
        {marker.name}
      </Tooltip>
      <Popup
        className="map-popup"
        autoPanPaddingBottomRight={[16, 16]}
        autoPanPaddingTopLeft={[16, 120]}
        maxHeight={360}
        maxWidth={300}
      >
        <MarkerPopup marker={marker} />
      </Popup>
    </Marker>
  );
}

export function MapMarkers({
  map,
  markers,
  onMarkerSelect,
  selectedMarkerId,
}: MapMarkersProps) {
  const mapMarkers = markers.filter((marker) => marker.mapId === map.id);

  return mapMarkers.map((marker) => (
    <MapMarkerItem
      key={marker.id}
      map={map}
      marker={marker}
      onMarkerSelect={onMarkerSelect}
      selectedMarkerId={selectedMarkerId}
    />
  ));
}
