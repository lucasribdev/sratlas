# Modelo de Dados

## Principio central

Separe mentalmente marcador de entidade:

- **Marcador**: uma posicao no mapa. No MVP, tambem pode representar uma area ou zona do mapa.
- **Entidade**: algo do jogo, como NPC, monstro, item, recurso, quest, cidade ou dungeon.

No MVP, um marcador contem dados ricos diretamente, inclusive dados de zona,
monstros, recursos, interactables e ponto de warp. Quando o projeto crescer,
entidades devem ser separadas para evitar duplicacao.

Hoje, `src/data/markers.json` e a fonte confiavel e runtime dos dados do mapa.
`src/data/monsters.json` is the single source of truth for monster metadata.
Markers keep only stable monster IDs, and `src/data/markers.ts` hydrates those
IDs into rich monster objects for the UI, search, filters, and popup.
`src/data/maps.json` fica como arquivo auxiliar de importacao/metadados da
imagem do mapa; nao use esse arquivo como fonte runtime de entidades,
marcadores, recursos ou interactables.

## Arquivos iniciais

Estrutura recomendada para o MVP:

```text
src/data/
  areas.json
  maps.json
  markers.json
  monsters.json
```

## Areas

`src/data/areas.json` guarda metadados visuais das areas usadas pelos marcadores.
No MVP, ele deve ficar simples e estatico:

```json
{
  "name": "Outskirts",
  "color": "#2f7f68"
}
```

| Campo | Obrigatorio | Descricao |
| --- | --- | --- |
| `name` | Sim | Nome da area exatamente como usado em `markers.json` |
| `color` | Sim | Cor hexadecimal usada nos marcadores dessa area |

A cor do marcador deve depender de `marker.area`. Nao repita cor dentro de cada
marcador. Se a area do marcador nao existir em `areas.json`, ou se o marcador
nao tiver `area`, a UI deve usar fallback neutro.

## Mapas

`src/data/maps.json` descreve a imagem base usada pelo Leaflet. No MVP, ele e um
arquivo auxiliar de importacao/metadados, nao a fonte runtime dos dados de jogo.

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

## Marcadores

Campos minimos e campos opcionais recomendados:

Para o passo a passo de manutencao, exemplos completos e regras de coordenadas,
veja o [Guia de marcadores](./markers-guide.md). Para a referencia de campos,
veja o [Schema dos dados](./data-schema.md).

```json
{
  "id": "zone-ashen-hollow",
  "name": "Ashen Hollow",
  "mapId": "world",
  "x": 58.2,
  "y": 31.7,
  "area": "Ashen Hollow",
  "zoneType": "Surface zone",
  "level": "12-15",
  "monsters": ["ironfang"],
  "resources": [
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
  ],
  "interactables": [
    {
      "name": "Quest Master",
      "wikiSlug": "Quest_Master",
      "image": "Quest_Master.png/16px-Quest_Master.png"
    }
  ],
  "warpPoint": true,
  "wikiSlug": "Ashen_Hollow"
}
```

| Campo | Obrigatorio | Descricao |
| --- | --- | --- |
| `id` | Sim | Identificador unico |
| `name` | Sim | Nome exibido |
| `mapId` | Sim | Mapa onde o marcador aparece |
| `x` | Sim | Coordenada horizontal percentual |
| `y` | Sim | Coordenada vertical percentual |
| `area` | Nao | Area ou regiao |
| `zoneType` | Nao | Tipo da zona, por exemplo `Surface zone` |
| `level` | Nao | Nivel recomendado ou nivel da zona |
| `monsters` | Nao | Stable monster IDs from `src/data/monsters.json` |
| `resources` | Nao | Lista de grupos de recursos por profissao ou tipo de coleta |
| `warpPoint` | Nao | Indica se a area tem ponto de warp |
| `wikiSlug` | Nao | Slug da pagina da wiki |
| `interactables` | Nao | Lista de NPCs, objetos ou pontos interativos ricos |
| `tags` | Nao | Termos auxiliares de busca que nao duplicam campos estruturados |

Formato recomendado para `resources`:

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

`resources[].items` e `interactables` nao devem ser arrays de strings. Use
objetos ricos com `name` e, quando houver, `wikiSlug`, `image` e
`chancePercent` nos itens de recurso. `monsters` is the exception: it stores
monster ID strings that resolve through `src/data/monsters.json`.

Use `area`, `zoneType`, `level`, `monsters`, `resources`, `interactables`,
`warpPoint`, `wikiSlug` e `tags` para registrar dados importantes do marcador de
forma estruturada. Use esses campos quando o marcador representar uma area ou
zona navegavel do mapa, e nao apenas um ponto isolado como NPC, boss, merchant ou
entrada. Esses campos devem continuar no JSON estatico do marcador durante o MVP
para que sejam faceis de manter.

Do not create additional entity tables during the MVP. Monster metadata is
already separated in `src/data/monsters.json` because the same monsters appear
across multiple markers and need normalized level, element, and drop fields.
Keep resources and interactables embedded until duplication or richer metadata
justifies another catalog.

## Busca

A busca inicial deve ser simples e funcionar sobre os dados estaticos em JSON. Para marcadores, os campos buscaveis devem incluir:

- `name`
- `area`
- `zoneType`
- `tags`
- `monsters`
- `resources`
- `interactables`

Em `resources`, a busca deve considerar tanto `type` quanto
`resources[].items[].name`, por exemplo `Fishing`, `Clam`, `Shrimp` e `Trout`.
Em `monsters` e `interactables`, a busca deve considerar pelo menos `name`.

## Filtros do MVP

O filtro principal da UI deve ser por area/regiao, usando os valores unicos de `area`
presentes em `markers.json`.

Filtros rapidos devem ser calculados diretamente dos marcadores:

- Warp point: `warpPoint: true`;
- Has monsters: `monsters` nao vazio;
- Fishing: algum grupo `resources[].type === "Fishing"`;
- Mining: algum grupo `resources[].type === "Mining"`;
- Herbalism: algum grupo `resources[].type === "Herbalism"`.

Nao crie agrupamento visual separado para cada monstro ou recurso. Nao separe entidades ainda.

## Estilo visual dos marcadores

No MVP, a cor do marcador deve ser derivada da area do marcador:

- `marker.area` aponta para uma entrada em `src/data/areas.json`;
- `areas.json` define a cor daquela area;
- se nao houver cor cadastrada para a area, use fallback neutro;
- `warpPoint: true` nao muda a cor base, apenas adiciona borda/anel visual.

Essa regra evita repetir cor em cada marcador e mantem o JSON de marcadores
focado em dados do mapa, busca, filtros e popup.

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
Backend, login, painel administrativo e sincronizacao automatica com a wiki
continuam fora do MVP.

## Integracao com wiki

No MVP, basta suportar:

```json
{
  "wikiSlug": "Ironfang"
}
```

Os links finais da wiki sao gerados por helpers centralizados a partir do slug.
Depois, pode evoluir para:

```json
{
  "wikiSlug": "Ironfang",
  "wikiPageId": "123",
  "lastSyncedAt": "2026-08-26T00:00:00.000Z"
}
```

Evite sincronizacao automatica antes de estabilizar o formato dos dados.
