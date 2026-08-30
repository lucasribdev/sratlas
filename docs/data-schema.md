# Schema dos Dados

Este documento descreve o formato runtime dos dados usados pelo mapa.

## Fonte Runtime

`src/data/markers.json` e a fonte confiavel e runtime dos dados do mapa. A UI
usa esse arquivo para renderizar marcadores, busca, filtros e popups.

`src/data/monsters.json` is the single source of truth for monster metadata.
Markers reference monsters by stable monster IDs, and `src/data/markers.ts`
hydrates those references for runtime UI consumers.

`src/data/maps.json` e apenas um arquivo auxiliar de importacao/metadados da
imagem do mapa, com `id`, `name`, `imageUrl`, `width` e `height`. Ele nao deve
guardar entidades, monstros, recursos, interactables ou dados de popup.

Backend, login, painel administrativo e sincronizacao automatica com a wiki
continuam fora do MVP.

## Marker

Campos aceitos em cada item de `markers.json`:

| Campo | Obrigatorio | Tipo | Descricao |
| --- | --- | --- | --- |
| `id` | Sim | `string` | Identificador unico em `kebab-case`. |
| `name` | Sim | `string` | Nome exibido para o jogador. |
| `mapId` | Sim | `string` | Id do mapa auxiliar, por exemplo `world`. |
| `x` | Sim | `number` | Coordenada horizontal percentual, de `0` a `100`. |
| `y` | Sim | `number` | Coordenada vertical percentual, de `0` a `100`. |
| `area` | Nao | `string` | Regiao usada em filtros e cor visual. |
| `zoneType` | Nao | `string` | Tipo da zona, como `Surface zone`, `Dungeon` ou `Cave`. |
| `level` | Nao | `string` | Nivel recomendado ou nivel da zona. |
| `monsters` | Nao | `string[]` | Stable monster IDs from `src/data/monsters.json`. |
| `resources` | Nao | `MarkerResourceGroup[]` | Recursos agrupados por tipo de coleta. |
| `warpPoint` | Nao | `boolean` | Indica ponto de warp. |
| `wikiSlug` | Nao | `string` | Slug da pagina da wiki do proprio marker. |
| `interactables` | Nao | `MarkerInteractable[]` | NPCs, objetos ou pontos interativos. |
| `tags` | Nao | `string[]` | Termos extras de busca. |

## Monster Catalog

Monster metadata lives in `src/data/monsters.json`.

```json
{
  "id": "hopper",
  "name": "Hopper",
  "elements": [],
  "drops": [],
  "wikiSlug": "Hopper",
  "image": "Hopper.png/16px-Hopper.png"
}
```

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `id` | Yes | `string` | Stable unique ID in `kebab-case`. Markers use this value. |
| `name` | Yes | `string` | Display name. |
| `level` | No | `number` | Monster-specific level, when known. Do not infer this from marker zone level. |
| `elements` | Yes | `string[]` | Normalized stable element IDs for future filtering. Use an empty array when unknown. |
| `drops` | Yes | `MonsterDrop[]` | Known item or essence drops. Use an empty array when unknown. |
| `wikiSlug` | No | `string` | Wiki page slug for the monster. |
| `image` | No | `string` | Wiki thumbnail path for the monster. |

Monster drops use stable IDs instead of display names alone:

```json
{
  "id": "minor-earth-essence",
  "name": "Minor Earth Essence",
  "type": "essence"
}
```

| Field | Required | Type | Description |
| --- | --- | --- | --- |
| `id` | Yes | `string` | Stable drop ID in `kebab-case`. |
| `name` | Yes | `string` | Display name. |
| `type` | No | `"item" | "essence"` | Drop category when known. |

## Rich Objects

`resources[].items` and `interactables` use rich objects, not strings.
`monsters` in `markers.json` uses monster ID strings that resolve to rich
monster objects at runtime.

```json
{
  "name": "Hopper",
  "wikiSlug": "Hopper",
  "image": "Hopper.png/16px-Hopper.png"
}
```

```json
{
  "name": "Stone",
  "wikiSlug": "Stone",
  "image": "Stone.png/16px-Stone.png",
  "chancePercent": 65.2
}
```

```json
{
  "name": "Quest Master",
  "wikiSlug": "Quest_Master",
  "image": "Quest_Master.png/16px-Quest_Master.png"
}
```

## Resource Group

```json
{
  "type": "Fishing",
  "items": [
    {
      "name": "Clam",
      "wikiSlug": "Clam",
      "image": "Clam.png/16px-Clam.png",
      "chancePercent": 62.5
    }
  ]
}
```

`wikiSlug` guarda apenas a parte variavel depois de
`https://soulsremnant.wiki.gg/wiki/`. `image` guarda apenas a parte variavel
depois de `https://soulsremnant.wiki.gg/images/thumb/`. A UI monta os URLs finais
com helpers centralizados.

`chancePercent` e opcional e representa a chance percentual do item naquele
grupo de recurso quando esse dado existir.

## Marker Basico

```json
{
  "id": "spawn",
  "name": "Spawn",
  "mapId": "world",
  "x": 50,
  "y": 53,
  "area": "Spawn",
  "zoneType": "Surface zone",
  "level": "0",
  "warpPoint": true,
  "wikiSlug": "Spawn_Grounds"
}
```

## Marker Rico

```json
{
  "id": "outskirts-south",
  "name": "Outskirts south",
  "mapId": "world",
  "x": 48,
  "y": 57.8,
  "area": "Outskirts",
  "zoneType": "Surface zone",
  "level": "7",
  "monsters": ["hopper"],
  "resources": [
    {
      "type": "Mining",
      "items": [
        {
          "name": "Stone",
          "wikiSlug": "Stone",
          "image": "Stone.png/16px-Stone.png",
          "chancePercent": 65.2
        }
      ]
    }
  ],
  "interactables": [
    {
      "name": "Quest Master",
      "wikiSlug": "Quest_Master",
      "image": "Quest_Master.png/16px-Quest_Master.png"
    }
  ],
  "wikiSlug": "Outskirts_South",
  "tags": ["level 7"]
}
```

## Coordenadas

Coordenadas continuam percentuais de `0` a `100`, com origem no canto superior
esquerdo da imagem do mapa.

```text
x = 0      esquerda
x = 100    direita
y = 0      topo
y = 100    base
```

Formula a partir de pixels:

```text
x = (pixelX / imageWidth) * 100
y = (pixelY / imageHeight) * 100
```
