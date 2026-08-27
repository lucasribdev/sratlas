# AGENTS.md

Orientacoes para trabalhar neste projeto.

## Produto

Este projeto e o mapa interativo de Soul's Remnant. A primeira versao deve ser simples, util e rapida de lancar.

Priorize sempre:

1. encontrar informacoes rapidamente;
2. mapa navegavel e responsivo;
3. dados faceis de manter;
4. escopo pequeno;
5. arquitetura que permita evoluir depois.

Evite adicionar backend, login, painel administrativo, sincronizacao automatica com wiki ou sistemas colaborativos antes do MVP estar funcional.

## Stack

Stack esperada para o MVP:

- Vite
- React
- TypeScript
- Leaflet
- React Leaflet
- dados estaticos em JSON

Nao introduza bibliotecas grandes sem necessidade clara. Para busca, comece simples; use Fuse.js apenas se a busca basica ficar insuficiente.

## Estrutura recomendada

Quando a implementacao comecar, prefira uma estrutura parecida com:

```text
src/
  components/
    map/
    search/
    filters/
    layout/
  data/
    maps.json
    markers.json
  domain/
    marker.ts
    map.ts
  lib/
    coordinates.ts
    marker-search.ts
```

Use `public/` para imagens grandes do mapa:

```text
public/
  maps/
    world-map.jpg
```

## Regras de produto

- O usuario deve conseguir encontrar NPCs, inimigos, areas e recursos com poucos cliques.
- A busca e os filtros devem trabalhar juntos.
- Clicar em um resultado de busca deve centralizar o mapa no marcador.
- Todo marcador deve ter nome, mapa e coordenadas.
- Link de wiki deve ser opcional, mas suportado desde o inicio.
- Nao crie features de contribuicao publica antes de existir moderacao ou fluxo editorial.

## Regras de dados

- Coordenadas de marcadores devem ser percentuais, de `0` a `100`.
- Origem das coordenadas: canto superior esquerdo do mapa.
- `x = 0` fica na esquerda; `x = 100` fica na direita.
- `y = 0` fica no topo; `y = 100` fica na base.
- Marcadores representam posicoes no mapa.
- Entidades representam coisas do jogo, como NPCs, monstros, itens, quests e recursos.
- No MVP, o marcador pode conter dados simples diretamente. Depois, separe entidades para evitar duplicacao.

## UX

- Desktop: sidebar com busca, filtros e resultados; mapa ocupa o restante.
- Mobile: mapa como tela principal; busca no topo; filtros em drawer; detalhe em bottom sheet ou popup simples.
- Evite telas explicativas. O mapa deve ser a primeira experiencia.
- Use estilo visual claro derivado dos dados reais do marcador, como ponto de warp, recursos e monstros.
- Nao sobrecarregue o mapa com informacao textual permanente.

## Qualidade

Antes de considerar uma alteracao pronta:

- rode `pnpm build`;
- rode `pnpm lint`;
- teste o fluxo principal manualmente;
- verifique desktop e mobile;
- confirme que dados novos podem ser adicionados sem alterar codigo.

Se um comando falhar por dependencia ausente, informe claramente em vez de mascarar o problema.

## Escopo fora do MVP

Nao implemente no MVP:

- login;
- contas de usuario;
- painel administrativo completo;
- comentarios;
- favoritos;
- rotas automaticas;
- drops complexos;
- sincronizacao automatica com wiki;
- historico de revisoes;
- permissao por papeis.

Esses itens so devem entrar quando houver dados suficientes e uso real do mapa.
