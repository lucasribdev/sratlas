# Modelo de Dados

## Principio central

Separe mentalmente marcador de entidade:

- **Marcador**: uma posicao no mapa. No MVP, tambem pode representar uma area ou zona do mapa.
- **Entidade**: algo do jogo, como NPC, monstro, item, recurso, quest, cidade ou dungeon.

No MVP, um marcador pode conter informacoes simples diretamente, inclusive dados basicos de zona, monstros, recursos e ponto de warp. Quando o projeto crescer, entidades devem ser separadas para evitar duplicacao.

## Arquivos iniciais

Estrutura recomendada para o MVP:

```text
src/data/
  maps.json
  categories.json
  markers.json
```

## Mapas

Campos sugeridos:

```json
{
  "id": "world",
  "name": "World Map",
  "imageUrl": "/maps/world-map.jpg",
  "width": 4096,
  "height": 4096
}
```

| Campo | Obrigatorio | Descricao |
| --- | --- | --- |
| `id` | Sim | Identificador unico do mapa |
| `name` | Sim | Nome exibido |
| `imageUrl` | Sim | Caminho publico da imagem |
| `width` | Sim | Largura original da imagem |
| `height` | Sim | Altura original da imagem |

## Categorias

Campos sugeridos:

```json
{
  "id": "boss",
  "label": "Boss",
  "group": "Enemies",
  "color": "#dc2626",
  "icon": "skull"
}
```

| Campo | Obrigatorio | Descricao |
| --- | --- | --- |
| `id` | Sim | Identificador usado nos marcadores |
| `label` | Sim | Nome exibido |
| `group` | Nao | Agrupamento visual |
| `color` | Sim | Cor da categoria |
| `icon` | Nao | Nome do icone |

## Marcadores

Campos minimos e campos opcionais recomendados:

```json
{
  "id": "zone-ashen-hollow",
  "name": "Ashen Hollow",
  "category": "area",
  "mapId": "world",
  "x": 58.2,
  "y": 31.7,
  "area": "Ashen Hollow",
  "zoneType": "Surface zone",
  "level": "12-15",
  "monsters": ["Ironfang", "Ash Crawler", "Hollow Wisp"],
  "resources": [
    {
      "type": "Fishing",
      "items": ["Clam", "Shrimp", "Trout"]
    }
  ],
  "warpPoint": true,
  "description": "Area de superficie com monstros iniciais e ponto de warp.",
  "wikiUrl": "/wiki/Ashen_Hollow",
  "tags": ["area", "surface", "ashen hollow"]
}
```

| Campo | Obrigatorio | Descricao |
| --- | --- | --- |
| `id` | Sim | Identificador unico |
| `name` | Sim | Nome exibido |
| `category` | Sim | Categoria existente em `categories.json` |
| `mapId` | Sim | Mapa onde o marcador aparece |
| `x` | Sim | Coordenada horizontal percentual |
| `y` | Sim | Coordenada vertical percentual |
| `area` | Nao | Area ou regiao |
| `zoneType` | Nao | Tipo da zona, por exemplo `Surface zone` |
| `level` | Nao | Nivel recomendado ou nivel da zona |
| `monsters` | Nao | Lista de monstros encontrados na area |
| `resources` | Nao | Lista de grupos de recursos por profissao ou tipo de coleta |
| `warpPoint` | Nao | Indica se a area tem ponto de warp |
| `description` | Nao | Descricao curta |
| `wikiUrl` | Nao | Link para wiki |
| `tags` | Nao | Termos auxiliares de busca |

Formato recomendado para `resources`:

```json
{
  "type": "Fishing",
  "items": ["Clam", "Shrimp", "Trout"]
}
```

Use `zoneType`, `level`, `monsters`, `resources` e `warpPoint` quando o marcador representar uma area ou zona navegavel do mapa, e nao apenas um ponto isolado como NPC, boss, merchant ou entrada. Esses campos devem continuar simples no MVP para que os dados possam ficar em JSON estatico e sejam faceis de manter.

Nao separe monstros, recursos ou entidades em arquivos/tabelas proprias ainda. Entidades separadas ficam para depois do MVP, quando houver dados suficientes e duplicacao real para justificar a mudanca.

## Busca

A busca inicial deve ser simples e funcionar sobre os dados estaticos em JSON. Para marcadores, os campos buscaveis devem incluir:

- `name`
- `area`
- `tags`
- `monsters`
- `resources`

Em `resources`, a busca deve considerar tanto `type` quanto os valores de `items`, por exemplo `Fishing`, `Clam`, `Shrimp` e `Trout`.

## Coordenadas

Use coordenadas percentuais de `0` a `100`.

```text
x = 0      esquerda
x = 100    direita
y = 0      topo
y = 100    base
```

Origem: canto superior esquerdo da imagem.

Vantagens:

- funciona com imagens redimensionadas;
- facilita layout responsivo;
- reduz retrabalho se a imagem ganhar resolucao maior;
- simplifica importacao/exportacao de dados.

## Relacoes futuras

Quando houver backend ou dados mais complexos, evolua para:

```text
Map
  has many Markers

Marker
  belongs to Map
  belongs to Category
  may reference Entity

Entity
  can be Location, NPC, Monster, Item, Resource or Quest
```

Relacoes importantes:

- NPC aparece em um ou mais marcadores.
- Monstro aparece em uma ou mais areas.
- Monstro pode dropar muitos itens.
- Merchant vende muitos itens.
- Quest pode envolver NPCs, locais, monstros e recompensas.
- Recurso aparece em varios pontos de coleta.
- Item pode vir de drops, merchants, quests ou coleta.

## Tabelas futuras

Caso um backend seja adicionado:

- `maps`
- `marker_categories`
- `markers`
- `locations`
- `npcs`
- `monsters`
- `items`
- `resources`
- `quests`
- `drops`
- `spawns`
- `wiki_pages`
- `users`
- `revisions`

Nao crie essas tabelas no MVP. Use esta lista apenas como direcao arquitetural.

## Integracao com wiki

No MVP, basta suportar:

```json
{
  "wikiUrl": "/wiki/Ironfang"
}
```

Depois, pode evoluir para:

```json
{
  "wikiSlug": "Ironfang",
  "wikiPageId": "123",
  "wikiUrl": "/wiki/Ironfang",
  "lastSyncedAt": "2026-08-26T00:00:00.000Z"
}
```

Evite sincronizacao automatica antes de estabilizar o formato dos dados.
