# Modelo de Dados

## Principio central

Separe mentalmente marcador de entidade:

- **Marcador**: uma posicao no mapa.
- **Entidade**: algo do jogo, como NPC, monstro, item, recurso, quest, cidade ou dungeon.

No MVP, um marcador pode conter informacoes simples diretamente. Quando o projeto crescer, entidades devem ser separadas para evitar duplicacao.

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

Campos minimos:

```json
{
  "id": "boss-ironfang",
  "name": "Ironfang",
  "category": "boss",
  "mapId": "world",
  "x": 58.2,
  "y": 31.7,
  "area": "Ashen Hollow",
  "description": "Boss encontrado dentro de Ashen Hollow.",
  "wikiUrl": "/wiki/Ironfang",
  "tags": ["boss", "ashen hollow"]
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
| `description` | Nao | Descricao curta |
| `wikiUrl` | Nao | Link para wiki |
| `tags` | Nao | Termos auxiliares de busca |

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
