# Plano do MVP

## Objetivo

Criar um mapa interativo simples para jogadores encontrarem rapidamente locais, NPCs, monstros, bosses, recursos, teleports e pontos de interesse em Soul's Remnant.

O MVP deve responder:

> Onde encontro isso?

## Usuario principal

Jogadores que querem localizar algo no mundo do jogo sem procurar em varias paginas, videos ou conversas.

## Problemas resolvidos

- Encontrar NPCs, bosses, monstros e recursos com rapidez.
- Entender onde ficam cidades, areas, dungeons e teleports.
- Acessar a pagina da wiki relacionada quando existir.
- Reduzir dependencia de guias externos e informacoes espalhadas.

## Escopo do MVP

| Funcionalidade | Status |
| --- | --- |
| Mapa navegavel com pan e zoom | MVP |
| Marcadores no mapa | MVP |
| Popup ou painel de detalhes | MVP |
| Filtro por area/regiao | MVP |
| Filtros rapidos por dados da area | MVP |
| Busca por nome | MVP |
| Lista de resultados da busca | MVP |
| Link para wiki | MVP |
| Dados em JSON estatico | MVP |
| Layout responsivo basico | MVP |
| Clustering de marcadores | Depois do MVP |
| Backend | Depois do MVP |
| Painel administrativo | Depois do MVP |
| Login | Depois do MVP |
| Edicao colaborativa | Depois do MVP |
| Drops completos | Depois do MVP |
| Relacoes completas com quests | Depois do MVP |
| Favoritos | Opcional |
| Comentarios | Opcional |
| Rotas automaticas | Opcional |

## Tela principal

Desktop:

```text
Busca
Sidebar: filtros por area, filtros rapidos e resultados
Mapa: marcadores, zoom e detalhe selecionado
```

Mobile:

```text
Busca no topo
Mapa como tela principal
Filtros em drawer
Detalhe do marcador em popup ou bottom sheet
```

## Fluxo principal

1. Usuario abre o mapa.
2. O mapa carrega com marcadores visiveis.
3. Usuario filtra por area/regiao, liga filtros rapidos ou pesquisa por texto.
4. A lista de resultados atualiza.
5. Usuario clica em um marcador ou resultado.
6. O mapa centraliza no marcador selecionado.
7. O detalhe mostra nome, area, tipo de zona, dados estruturados do marcador e link da wiki.

## Busca e filtros

Busca do MVP:

- campo unico;
- busca por nome;
- busca tambem por area, tipo de zona, tags, monstros e recursos;
- case-insensitive;
- resultado clicavel;
- mensagem simples para nenhum resultado.

Filtros do MVP:

- checkboxes por area/regiao derivados dos marcadores;
- filtros rapidos derivados dos campos dos marcadores:
  - Warp point: `warpPoint: true`;
  - Has monsters: `monsters` nao vazio;
  - Fishing: algum grupo `resources[].type === "Fishing"`;
  - Mining: algum grupo `resources[].type === "Mining"`;
  - Herbalism: algum grupo `resources[].type === "Herbalism"`;
- opcao para selecionar todas as areas;
- opcao para limpar;
- filtros combinam com a busca.

Estilo visual dos marcadores:

- usar `warpPoint: true` quando existir;
- senao, usar a presenca de `resources`;
- senao, usar a presenca de `monsters`;
- senao, usar fallback generico para zona/local.

Regra:

```text
um marcador aparece se a area esta ativa, ou nenhuma area esta selecionada
E todos os filtros rapidos ativos correspondem aos dados do marcador
E o texto buscado corresponde aos campos buscaveis

Sem busca e sem filtros ativos, todos os marcadores aparecem.
```

## Criterios de pronto

O MVP esta pronto quando:

- o mapa abre corretamente;
- pan e zoom funcionam;
- existem marcadores reais suficientes para serem uteis;
- filtros funcionam;
- busca funciona;
- clicar em marcador mostra detalhes;
- clicar em resultado centraliza o mapa;
- links da wiki funcionam quando existirem;
- layout e utilizavel em desktop e mobile;
- novos marcadores podem ser adicionados editando JSON.

## Versao extremamente enxuta

Primeiro lancamento possivel:

- um mapa do mundo;
- 30 a 50 marcadores reais;
- areas principais;
- busca por nome;
- filtro por area/regiao;
- filtros rapidos;
- popup simples;
- link para wiki;
- dados em JSON.

Sem backend, sem admin e sem relacoes complexas.
