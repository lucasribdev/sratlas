# Schema dos Dados

Este documento descreve o formato runtime dos dados usados pelo mapa.

## Fonte Runtime

`src/data/markers.json` e a fonte confiavel e runtime dos dados do mapa. A UI
usa esse arquivo para renderizar marcadores, busca, filtros e popups.

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
| `monsters` | Nao | `MarkerMonster[]` | Monstros encontrados na zona. |
| `resources` | Nao | `MarkerResourceGroup[]` | Recursos agrupados por tipo de coleta. |
| `warpPoint` | Nao | `boolean` | Indica ponto de warp. |
| `wikiUrl` | Nao | `string` | Link da wiki para o proprio marker. |
| `interactables` | Nao | `MarkerInteractable[]` | NPCs, objetos ou pontos interativos. |
| `tags` | Nao | `string[]` | Termos extras de busca. |

## Objetos Ricos

`monsters`, `resources[].items` e `interactables` usam objetos, nao strings.

```json
{
  "name": "Hopper",
  "wikiUrl": "https://soulsremnant.wiki.gg/wiki/Hopper",
  "imageUrl": "https://soulsremnant.wiki.gg/images/thumb/Hopper.png/16px-Hopper.png"
}
```

```json
{
  "name": "Stone",
  "wikiUrl": "https://soulsremnant.wiki.gg/wiki/Stone",
  "imageUrl": "https://soulsremnant.wiki.gg/images/thumb/Stone.png/16px-Stone.png",
  "chancePercent": 65.2
}
```

```json
{
  "name": "Quest Master",
  "wikiUrl": "https://soulsremnant.wiki.gg/wiki/Quest_Master",
  "imageUrl": "https://soulsremnant.wiki.gg/images/thumb/Quest_Master.png/16px-Quest_Master.png"
}
```

## Resource Group

```json
{
  "type": "Fishing",
  "items": [
    {
      "name": "Clam",
      "wikiUrl": "https://soulsremnant.wiki.gg/wiki/Clam",
      "imageUrl": "https://soulsremnant.wiki.gg/images/thumb/Clam.png/16px-Clam.png",
      "chancePercent": 62.5
    }
  ]
}
```

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
  "wikiUrl": "https://soulsremnant.wiki.gg/wiki/Spawn_Grounds"
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
  "monsters": [
    {
      "name": "Hopper",
      "wikiUrl": "https://soulsremnant.wiki.gg/wiki/Hopper",
      "imageUrl": "https://soulsremnant.wiki.gg/images/thumb/Hopper.png/16px-Hopper.png"
    }
  ],
  "resources": [
    {
      "type": "Mining",
      "items": [
        {
          "name": "Stone",
          "wikiUrl": "https://soulsremnant.wiki.gg/wiki/Stone",
          "imageUrl": "https://soulsremnant.wiki.gg/images/thumb/Stone.png/16px-Stone.png",
          "chancePercent": 65.2
        }
      ]
    }
  ],
  "interactables": [
    {
      "name": "Quest Master",
      "wikiUrl": "https://soulsremnant.wiki.gg/wiki/Quest_Master",
      "imageUrl": "https://soulsremnant.wiki.gg/images/thumb/Quest_Master.png/16px-Quest_Master.png"
    }
  ],
  "wikiUrl": "https://soulsremnant.wiki.gg/wiki/Outskirts_South",
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
