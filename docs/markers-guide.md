# Guia de Marcadores

Este guia explica como adicionar e manter zonas em `src/data/markers.json` sem
alterar codigo. O MVP usa dados estaticos em JSON, entao cada novo marcador deve
ter dados suficientes para busca, filtros, popup e posicionamento no mapa.

`src/data/markers.json` e a fonte confiavel e runtime dos dados do mapa. A UI
le esse arquivo para montar marcadores, busca, filtros e detalhes. `src/data/maps.json`
e apenas auxiliar de importacao/metadados da imagem do mapa; nao coloque nele
dados de monstros, recursos, interactables ou entidades.

Para a lista completa de campos e exemplos isolados de monster, resource item e
interactable, veja o [Schema dos dados](./data-schema.md).

Backend, login, painel administrativo e sincronizacao automatica com a wiki
continuam fora do MVP.

## Como adicionar uma nova zona

1. Abra `src/data/markers.json`.
2. Copie um objeto existente parecido com a zona que voce quer adicionar.
3. Cole o novo objeto dentro do array principal.
4. Troque o `id`, `name`, `mapId`, `x` e `y`.
5. Preencha os campos opcionais que ajudam o jogador a encontrar a zona.
6. Confira se o JSON continua valido:
   - use aspas duplas;
   - separe objetos e campos com virgula;
   - nao deixe virgula depois do ultimo item do array ou objeto.

O `id` deve ser unico no arquivo. Use nomes curtos em `kebab-case`, por exemplo
`shell-beach`, `lost-peak` ou `plains-cave`.

## Campos obrigatorios

Todo marcador novo deve ter:

| Campo | Como preencher |
| --- | --- |
| `id` | Identificador unico em `kebab-case`. |
| `name` | Nome exibido para o jogador. |
| `mapId` | Id do mapa em `src/data/maps.json`, por exemplo `world`. |
| `x` | Coordenada horizontal percentual, de `0` a `100`. |
| `y` | Coordenada vertical percentual, de `0` a `100`. |

No MVP, a cor visual do marcador vem da area cadastrada em
`src/data/areas.json`. O marcador continua usando apenas o campo `area`; nao
adicione cor em cada marcador. Quando `warpPoint` for `true`, a UI adiciona um
anel/borda extra ao marcador sem trocar a cor da area.

## Campos opcionais

Use os campos opcionais quando eles ajudarem a busca, os filtros ou o detalhe do
marcador:

| Campo | Quando usar |
| --- | --- |
| `area` | Regiao usada no filtro principal, como `Ocean` ou `Plains`. |
| `zoneType` | Tipo da zona, como `Surface zone`, `Dungeon` ou `Cave`. |
| `level` | Nivel recomendado ou nivel da zona. Pode ser `"17"` ou `"12-15"`. |
| `monsters` | Lista rica de monstros encontrados na zona. |
| `resources` | Grupos de recursos por tipo de coleta. |
| `warpPoint` | `true` quando a zona tem ponto de warp. Omita quando nao tiver. |
| `wikiSlug` | Slug opcional da pagina da wiki. |
| `interactables` | Lista rica de NPCs, objetos ou pontos interativos. |
| `tags` | Termos extras para melhorar a busca. |

Dados importantes devem entrar em campos estruturados do marcador: `area`,
`zoneType`, `level`, `monsters`, `resources`, `interactables`, `warpPoint`,
`wikiSlug` e `tags`.

Nao use o formato antigo com `monsters` como array de strings nem
`resources[].items` como array de strings. Esses campos agora guardam objetos
ricos diretamente no marker.

Monsters may optionally include a `drops` array. Existing monster entries do not
need `drops`; omit it when drop data is unknown or not yet collected. Each drop
item must have `name` and may include `wikiSlug`, `image` and `chancePercent`.
`chancePercent` is optional and should only be added when the drop chance is
known.

`wikiSlug` guarda apenas a parte variavel depois de
`https://soulsremnant.wiki.gg/wiki/`. `image` guarda apenas a parte variavel
depois de `https://soulsremnant.wiki.gg/images/thumb/`. A UI monta os URLs finais
com helpers centralizados; nao repita esses prefixos em `markers.json`.

Nao separe NPCs, monstros, itens ou recursos em outros arquivos ainda. Isso fica
para depois do MVP, quando houver duplicacao real e dados suficientes.

## Cores por area

Para definir ou ajustar a cor de uma area, edite `src/data/areas.json`:

```json
{
  "name": "Outskirts",
  "color": "#2f7f68"
}
```

Regras:

- `name` deve corresponder ao valor usado em `marker.area`.
- `color` deve ser uma cor hexadecimal.
- nao adicione `color`, `markerColor` ou campos parecidos em `markers.json`;
- marcadores de areas sem cadastro de cor usam fallback neutro;
- `warpPoint: true` adiciona anel/borda extra ao marcador.

## Monster Drops

Use `drops` inside a monster only when known drop data is available:

```json
"monsters": [
  {
    "name": "Hopper",
    "wikiSlug": "Hopper",
    "image": "Hopper.png/16px-Hopper.png",
    "drops": [
      {
        "name": "Hopper Leg",
        "wikiSlug": "Hopper_Leg",
        "image": "Hopper_Leg.png/16px-Hopper_Leg.png",
        "chancePercent": 12.5
      }
    ]
  }
]
```

Do not add placeholder drops, empty chance values or separate drop datasets for
the MVP. Search, filtering and popup rendering for monster drops are planned for
later issues and are not current behavior.

## Recursos

Preencha `resources` agrupando os itens por tipo de coleta. Os tipos usados pelos
dados atuais sao:

- `Fishing`
- `Mining`
- `Herbalism`

Formato recomendado:

```json
"resources": [
  {
    "type": "Fishing",
    "items": [
      {
        "name": "Clam",
        "wikiSlug": "Clam",
        "image": "Clam.png/16px-Clam.png",
        "chancePercent": 62.5
      },
      {
        "name": "Shrimp",
        "wikiSlug": "Shrimp",
        "image": "Shrimp.png/16px-Shrimp.png",
        "chancePercent": 21.9
      }
    ]
  },
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
  },
  {
    "type": "Herbalism",
    "items": [
      {
        "name": "Green Herb",
        "wikiSlug": "Green_Herb",
        "image": "Green_Herb.png/16px-Green_Herb.png",
        "chancePercent": 22.2
      }
    ]
  }
]
```

Evite criar varios grupos com o mesmo `type` dentro do mesmo marcador. Junte os
itens em um unico grupo por tipo de coleta.

## Tags

Use `tags` apenas para termos de busca que nao aparecem naturalmente em outros
campos estruturados. Bons usos:

- sinonimos;
- termos alternativos;
- nomes de regiao;
- apelidos usados pela comunidade;
- nomes abreviados;
- termos importantes que nao aparecem em `name`, `area`, `zoneType`,
  `monsters` ou `resources`.

Nao duplique `name`, `area`, `zoneType`, `monsters`, `resources[].type` ou
`resources[].items` em `tags`: esses valores ja participam da busca. Se o
marcador ja tem `"Fishing"` em `resources[].type`, nao precisa adicionar
`"fishing"` em `tags`.

## Coordenadas

As coordenadas `x` e `y` sao percentuais de `0` a `100`, calculadas em relacao a
imagem original do mapa.

Origem: canto superior esquerdo da imagem.

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

Exemplo: se a imagem tem `4096 x 4096` e o ponto esta em `pixelX = 2048` e
`pixelY = 1024`:

```text
x = (2048 / 4096) * 100 = 50
y = (1024 / 4096) * 100 = 25
```

Use uma ou duas casas decimais quando precisar de mais precisao. Coordenadas
inteiras sao aceitaveis para marcadores aproximados.

## Coordenadas aproximadas no MVP

No MVP, coordenadas aproximadas sao aceitaveis quando ainda nao houver medicao
precisa. Nesse caso:

- posicione o marcador no centro aproximado da zona;
- registre a pendencia fora das `tags`, pois notas editoriais nao devem afetar a
  busca;
- ajuste depois quando houver imagem, print ou referencia melhor;
- nao bloqueie a inclusao de uma zona util apenas por falta de coordenada
  perfeita.

Mesmo quando aproximadas, `x` e `y` devem continuar entre `0` e `100`.

## Exemplo completo

```json
{
  "id": "mistwood-crossing",
  "name": "Mistwood Crossing",
  "mapId": "world",
  "x": 57.4,
  "y": 44.8,
  "area": "Mistwood",
  "zoneType": "Surface zone",
  "level": "24-28",
  "monsters": [
    {
      "name": "Mossling",
      "wikiSlug": "Mossling",
      "image": "Mossling.png/16px-Mossling.png"
    },
    {
      "name": "Elder Wisp",
      "wikiSlug": "Elder_Wisp",
      "image": "Elder_Wisp.png/16px-Elder_Wisp.png"
    }
  ],
  "resources": [
    {
      "type": "Fishing",
      "items": [
        {
          "name": "Trout",
          "wikiSlug": "Trout",
          "image": "Trout.png/16px-Trout.png",
          "chancePercent": 15.6
        }
      ]
    },
    {
      "type": "Mining",
      "items": [
        {
          "name": "Iron Ore",
          "wikiSlug": "Iron_Ore",
          "image": "Iron_Ore.png/16px-Iron_Ore.png",
          "chancePercent": 34.8
        }
      ]
    },
    {
      "type": "Herbalism",
      "items": [
        {
          "name": "Moonleaf",
          "wikiSlug": "Moonleaf",
          "image": "Moonleaf.png/16px-Moonleaf.png",
          "chancePercent": 22.2
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
  "wikiSlug": "Mistwood_Crossing",
  "tags": ["mist wood"]
}
```

## Validacao manual

Antes de abrir PR ou fechar uma issue de dados:

1. Confirme que `markers.json` continua sendo JSON valido.
2. Confira se o `id` e unico.
3. Confira se `mapId` existe em `src/data/maps.json`.
4. Confira se `x` e `y` estao entre `0` e `100`.
5. Confira se `monsters`, `resources[].items` e `interactables` usam objetos
   ricos com `name`, nao strings soltas.
6. Confira se `resources[].type` usa `Fishing`, `Mining` ou `Herbalism` quando
   a intencao for cadastrar pontos de coleta.
7. Se a area for nova, confira se existe entrada correspondente em
   `src/data/areas.json` ou aceite o fallback neutro temporariamente.
8. Pesquise pelo nome da zona, area, monstro, interactable e recurso principal.
9. Clique no resultado e confirme que o mapa centraliza no marcador.
10. Abra o popup e confira nome, dados estruturados da zona e link da wiki quando
   existir.
11. Verifique pelo menos uma tela desktop e uma mobile.

## Search Autocomplete

Autocomplete suggestions are derived from structured marker data. A new marker,
monster, resource item, resource type, or interactable becomes searchable when it
is added to `src/data/markers.json` using the fields described in this guide.

See [Search Autocomplete](./search-autocomplete.md) for the indexed entity
types and selection behavior.

## Checklist rapido

- `id`, `name`, `mapId`, `x` e `y` preenchidos.
- `x` e `y` calculados em percentual a partir do canto superior esquerdo.
- `area` preenchida quando a zona deve aparecer no filtro por regiao.
- `resources` agrupado por `Fishing`, `Mining` e `Herbalism`.
- `monsters`, `resources[].items` e `interactables` preenchidos como objetos ricos.
- area cadastrada em `src/data/areas.json` quando precisa de cor propria.
- `warpPoint` preenchido quando deve exibir anel/borda extra.
- `resources` e `monsters` preenchidos quando devem afetar filtros.
- `tags` usadas apenas para termos extras de busca.
- Marcador aparece, e o clique centraliza o mapa.
- Dados novos foram adicionados apenas em JSON, sem alterar codigo.
