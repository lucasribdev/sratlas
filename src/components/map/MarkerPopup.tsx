import { useEffect, useId, useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  MapMarker,
  MarkerInteractable,
  MarkerMonster,
  MarkerMonsterDrop,
  MarkerResourceItem,
} from "@/domain/marker";
import { getWikiThumbnailUrl, getWikiUrl } from "@/lib/external-urls";
import { cn } from "@/lib/utils";

type MarkerPopupProps = {
  marker: MapMarker;
  onContentSizeChange?: () => void;
};

type PopupEntry = MarkerResourceItem | MarkerInteractable;

function PopupEntryRow({ entry }: { entry: PopupEntry }) {
  const imageUrl = entry.image ? getWikiThumbnailUrl(entry.image) : undefined;
  const wikiUrl = entry.wikiSlug ? getWikiUrl(entry.wikiSlug) : undefined;
  const label = (
    <span className="min-w-0 flex-1 truncate text-xs leading-5">
      {entry.name}
    </span>
  );

  return (
    <span className="inline-flex min-w-0 max-w-[12rem] items-center gap-1.5 rounded-sm bg-secondary px-1.5 py-0.5 text-secondary-foreground">
      {imageUrl ? (
        <img
          alt=""
          className="size-4 shrink-0 rounded-[2px] object-contain"
          height={16}
          loading="lazy"
          referrerPolicy="no-referrer"
          src={imageUrl}
          width={16}
        />
      ) : null}
      {wikiUrl ? (
        <a
          className="min-w-0 flex-1 truncate text-xs leading-5 font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          href={wikiUrl}
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

function MonsterDropRow({ drop }: { drop: MarkerMonsterDrop }) {
  const imageUrl = drop.image ? getWikiThumbnailUrl(drop.image) : undefined;
  const wikiUrl = drop.wikiSlug ? getWikiUrl(drop.wikiSlug) : undefined;

  return (
    <span className="flex min-w-0 w-full items-center gap-1.5 py-0.5 text-secondary-foreground">
      {imageUrl ? (
        <img
          alt=""
          className="size-4 shrink-0 rounded-[2px] object-contain"
          height={16}
          loading="lazy"
          referrerPolicy="no-referrer"
          src={imageUrl}
          width={16}
        />
      ) : null}
      {wikiUrl ? (
        <a
          className="min-w-0 flex-1 truncate text-xs leading-5 font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          href={wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {drop.name}
        </a>
      ) : (
        <span className="min-w-0 flex-1 truncate text-xs leading-5">
          {drop.name}
        </span>
      )}
      <Badge
        className="h-4 shrink-0 rounded-sm px-1 text-[0.625rem] leading-none font-semibold tabular-nums"
        variant="outline"
      >
        {drop.dropRate}%
      </Badge>
    </span>
  );
}

function MonsterIdentity({ monster }: { monster: MarkerMonster }) {
  const imageUrl = monster.image
    ? getWikiThumbnailUrl(monster.image)
    : undefined;
  const wikiUrl = monster.wikiSlug
    ? getWikiUrl(monster.wikiSlug)
    : undefined;

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {imageUrl ? (
        <img
          alt=""
          className="size-6 shrink-0 rounded-sm object-contain"
          height={24}
          loading="lazy"
          referrerPolicy="no-referrer"
          src={imageUrl}
          width={24}
        />
      ) : null}
      {wikiUrl ? (
        <a
          className="min-w-0 truncate rounded-sm text-xs leading-5 font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          href={wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {monster.name}
        </a>
      ) : (
        <span className="min-w-0 truncate text-xs leading-5 font-semibold text-foreground">
          {monster.name}
        </span>
      )}
    </div>
  );
}

function MonsterRow({
  monster,
  monsterIndex,
}: {
  monster: MarkerMonster;
  monsterIndex: number;
}) {
  const drops = monster.drops ?? [];
  const panelId = useId();
  const triggerId = useId();

  if (drops.length === 0) {
    return (
      <div className="flex min-w-0 items-center rounded-md border border-border bg-card p-1.5">
        <MonsterIdentity monster={monster} />
      </div>
    );
  }

  const dropLabel = `${drops.length} ${drops.length === 1 ? "drop" : "drops"}`;

  return (
    <AccordionItem
      className="overflow-hidden rounded-md border border-border bg-card"
      value={`monster-${monsterIndex}`}
    >
      <div className="flex min-w-0 items-center gap-1 p-1.5">
        <MonsterIdentity monster={monster} />
        <AccordionTrigger
          aria-controls={panelId}
          aria-label={`Toggle ${dropLabel} from ${monster.name}`}
          className="h-7 flex-none items-center gap-1 rounded-sm border-border px-1.5 py-1 text-[0.6875rem] leading-none font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:no-underline"
          id={triggerId}
        >
          <span className="whitespace-nowrap">{dropLabel}</span>
        </AccordionTrigger>
      </div>
      <AccordionContent
        aria-labelledby={triggerId}
        className="border-t border-border bg-muted/40 px-2 py-1.5"
        id={panelId}
      >
        <ul
          aria-label={`Drops from ${monster.name}`}
          className="grid gap-0.5"
        >
          {drops.map((drop, dropIndex) => (
            <li
              className="min-w-0"
              key={`${monster.name}-${monsterIndex}-${drop.wikiSlug ?? ""}-${drop.name}-${dropIndex}`}
            >
              <MonsterDropRow drop={drop} />
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}

export function MarkerPopup({
  marker,
  onContentSizeChange,
}: MarkerPopupProps) {
  const popupContentRef = useRef<HTMLElement>(null);
  const wikiUrl = marker.wikiSlug ? getWikiUrl(marker.wikiSlug) : undefined;
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

  useEffect(() => {
    const popupContent = popupContentRef.current;

    if (
      !popupContent ||
      !onContentSizeChange ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }

    let animationFrameId: number | undefined;
    const resizeObserver = new ResizeObserver(() => {
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = window.requestAnimationFrame(onContentSizeChange);
    });
    resizeObserver.observe(popupContent);

    return () => {
      resizeObserver.disconnect();

      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [onContentSizeChange]);

  return (
    <article
      className="grid max-w-[260px] min-w-[190px] gap-3 text-popover-foreground"
      ref={popupContentRef}
    >
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
            <Accordion
              className="gap-1.5"
              defaultValue={[]}
              keepMounted
              multiple
            >
              {monsters.map((monster, monsterIndex) => (
                <MonsterRow
                  key={`${monster.name}-${monsterIndex}`}
                  monster={monster}
                  monsterIndex={monsterIndex}
                />
              ))}
            </Accordion>
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

      {wikiUrl ? (
        <>
          <Separator />
          <a
            className="w-fit text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            href={wikiUrl}
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
