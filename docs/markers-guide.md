# Guia de Marcadores

Este guia explica como adicionar e manter zonas em `src/data/markers.json` sem
alterar codigo. O MVP usa dados estaticos em JSON, entao cada novo marcador deve
ter dados suficientes para busca, filtros, popup e posicionamento no mapa.

## Como adicionar uma nova zona

1. Abra `src/data/markers.json`.
2. Copie um objeto existente parecido com a zona que voce quer adicionar.
3. Cole o novo objeto dentro do array principal.
4. Troque o `id`, `name`, `category`, `mapId`, `x` e `y`.
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
| `category` | Categoria geral do marcador. Para zonas, use `zone`. |
| `mapId` | Id do mapa em `src/data/maps.json`, por exemplo `world`. |
| `x` | Coordenada horizontal percentual, de `0` a `100`. |
| `y` | Coordenada vertical percentual, de `0` a `100`. |

No MVP, alguns estilos e filtros ainda sao derivados de `warpPoint`,
`resources` e `monsters`. Mesmo assim, mantenha `category` preenchido nos novos
marcadores para preservar o contrato dos dados conforme o arquivo evoluir.

## Campos opcionais

Use os campos opcionais quando eles ajudarem a busca, os filtros ou o detalhe do
marcador:

| Campo | Quando usar |
| --- | --- |
| `area` | Regiao usada no filtro principal, como `Ocean` ou `Plains`. |
| `zoneType` | Tipo da zona, como `Surface zone`, `Dungeon` ou `Cave`. |
| `level` | Nivel recomendado ou nivel da zona. Pode ser `"17"` ou `"12-15"`. |
| `monsters` | Lista simples de monstros encontrados na zona. |
| `resources` | Grupos de recursos por tipo de coleta. |
| `warpPoint` | `true` quando a zona tem ponto de warp. Omita quando nao tiver. |
| `description` | Descricao curta com os dados mais importantes da zona. |
| `wikiUrl` | Link opcional para a wiki. |
| `tags` | Termos extras para melhorar a busca. |

Nao separe NPCs, monstros, itens ou recursos em outros arquivos ainda. Isso fica
para depois do MVP, quando houver duplicacao real e dados suficientes.

## Recursos

Preencha `resources` agrupando os itens por tipo de coleta. Os tipos usados pelos
filtros rapidos do MVP sao exatamente:

- `Fishing`
- `Mining`
- `Herbalism`

Formato recomendado:

```json
"resources": [
  {
    "type": "Fishing",
    "items": ["Clam", "Shrimp", "Trout"]
  },
  {
    "type": "Mining",
    "items": ["Stone", "Salt"]
  },
  {
    "type": "Herbalism",
    "items": ["Green Herb", "Red Herb", "Blue Herb"]
  }
]
```

Evite criar varios grupos com o mesmo `type` dentro do mesmo marcador. Junte os
itens em um unico grupo por tipo de coleta.

## Tags

Use `tags` apenas para termos de busca que nao aparecem naturalmente em outros
campos. Bons usos:

- sinonimos;
- termos alternativos;
- nomes de regiao;
- apelidos usados pela comunidade;
- nomes abreviados;
- termos importantes que nao aparecem em `name`, `area`, `zoneType`,
  `monsters` ou `resources`.

Evite duplicar tudo sem necessidade. Se o marcador ja tem `"Fishing"` em
`resources[].type`, nao precisa adicionar `"fishing"` em `tags` a menos que isso
resolva um caso real de busca.

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
- deixe a descricao indicar que a coordenada e temporaria, se isso ajudar a
  revisao;
- ajuste depois quando houver imagem, print ou referencia melhor;
- nao bloqueie a inclusao de uma zona util apenas por falta de coordenada
  perfeita.

Mesmo quando aproximadas, `x` e `y` devem continuar entre `0` e `100`.

## Exemplo completo

```json
{
  "id": "mistwood-crossing",
  "name": "Mistwood Crossing",
  "category": "zone",
  "mapId": "world",
  "x": 57.4,
  "y": 44.8,
  "area": "Mistwood",
  "zoneType": "Surface zone",
  "level": "24-28",
  "monsters": ["Mossling", "Elder Wisp"],
  "resources": [
    {
      "type": "Fishing",
      "items": ["Trout", "Glowfish"]
    },
    {
      "type": "Mining",
      "items": ["Stone", "Iron Ore"]
    },
    {
      "type": "Herbalism",
      "items": ["Green Herb", "Moonleaf"]
    }
  ],
  "warpPoint": true,
  "description": "Mistwood surface zone with monsters, gathering resources, and a warp point. Coordinates are approximate for MVP validation.",
  "wikiUrl": "/wiki/Mistwood_Crossing",
  "tags": ["mist wood", "crossing", "forest", "temporary coordinates"]
}
```

## Validacao manual

Antes de abrir PR ou fechar uma issue de dados:

1. Confirme que `markers.json` continua sendo JSON valido.
2. Confira se o `id` e unico.
3. Confira se `mapId` existe em `src/data/maps.json`.
4. Confira se `x` e `y` estao entre `0` e `100`.
5. Confira se `resources[].type` usa `Fishing`, `Mining` ou `Herbalism` quando
   a intencao for ativar filtros rapidos.
6. Pesquise pelo nome da zona, area, monstro e recurso principal.
7. Clique no resultado e confirme que o mapa centraliza no marcador.
8. Abra o popup e confira nome, dados da zona, descricao e link da wiki quando
   existir.
9. Verifique pelo menos uma tela desktop e uma mobile.

## Checklist rapido

- `id`, `name`, `category`, `mapId`, `x` e `y` preenchidos.
- `x` e `y` calculados em percentual a partir do canto superior esquerdo.
- `area` preenchida quando a zona deve aparecer no filtro por regiao.
- `resources` agrupado por `Fishing`, `Mining` e `Herbalism`.
- `tags` usadas apenas para termos extras de busca.
- Marcador aparece, e o clique centraliza o mapa.
- Dados novos foram adicionados apenas em JSON, sem alterar codigo.
