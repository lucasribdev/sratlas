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
};

type PopupEntry = MarkerMonster | MarkerResourceItem | MarkerInteractable;

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
    <span className="inline-flex min-w-0 max-w-[12rem] items-center gap-1.5 rounded-sm bg-secondary px-1.5 py-0.5 text-secondary-foreground">
      {imageUrl ? (
        <img
          alt=""
          className="size-4 shrink-0 rounded-[2px] object-contain"
          height={16}
          loading="lazy"
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
        className="h-4 rounded-sm px-1 text-[0.625rem] leading-none font-semibold"
        variant="outline"
      >
        {drop.dropRate}%
      </Badge>
    </span>
  );
}

export function MarkerPopup({ marker }: MarkerPopupProps) {
  const wikiUrl = marker.wikiSlug ? getWikiUrl(marker.wikiSlug) : undefined;
  const monsters =
    marker.monsters?.filter((monster) => monster.name.trim()) ?? [];
  const hasMonsterDrops = monsters.some(
    (monster) => monster.drops && monster.drops.length > 0,
  );
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
            {hasMonsterDrops ? (
              <ul className="flex flex-wrap items-start gap-1.5">
                {monsters.map((monster, monsterIndex) => (
                  <li
                    className="grid min-w-0 max-w-full gap-1"
                    key={`${monster.name}-${monsterIndex}`}
                  >
                    <PopupEntryRow entry={monster} />
                    {monster.drops && monster.drops.length > 0 ? (
                      <div className="grid gap-1 border-l border-border pl-2">
                        <h4
                          aria-hidden="true"
                          className="text-[0.625rem] leading-none font-semibold text-muted-foreground"
                        >
                          Drops
                        </h4>
                        <ul
                          aria-label={`Drops from ${monster.name}`}
                          className="flex flex-wrap gap-1"
                        >
                          {monster.drops.map((drop, dropIndex) => (
                            <li
                              className="min-w-0"
                              key={`${monster.name}-${monsterIndex}-${drop.wikiSlug ?? ""}-${drop.name}-${dropIndex}`}
                            >
                              <MonsterDropRow drop={drop} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {monsters.map((monster) => (
                  <li className="min-w-0" key={monster.name}>
                    <PopupEntryRow entry={monster} />
                  </li>
                ))}
              </ul>
            )}
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
