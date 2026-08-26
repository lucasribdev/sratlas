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
| Filtro por categoria | MVP |
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

## Categorias iniciais

Versao enxuta recomendada:

- Local
- Dungeon
- Teleport
- NPC
- Merchant
- Quest NPC
- Monstro
- Elite
- Boss
- Recurso
- Ponto de coleta
- Outro

Se a interface ficar carregada, agrupe visualmente:

- Locations: Local, Dungeon, Teleport
- NPCs: NPC, Merchant, Quest NPC
- Enemies: Monstro, Elite, Boss
- Gathering: Recurso, Ponto de coleta
- Other: Outro

## Tela principal

Desktop:

```text
Busca
Sidebar: filtros, categorias e resultados
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
3. Usuario filtra por categoria ou pesquisa por nome.
4. A lista de resultados atualiza.
5. Usuario clica em um marcador ou resultado.
6. O mapa centraliza no marcador selecionado.
7. O detalhe mostra nome, categoria, area, descricao curta e link da wiki.

## Busca e filtros

Busca do MVP:

- campo unico;
- busca por nome;
- busca tambem por area e tags;
- case-insensitive;
- resultado clicavel;
- mensagem simples para nenhum resultado.

Filtros do MVP:

- checkboxes por categoria;
- opcao para selecionar todas;
- opcao para limpar;
- filtros combinam com a busca.

Regra:

```text
um marcador aparece se a categoria esta ativa
E o texto buscado corresponde ao nome, area ou tags
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
- categorias principais;
- busca por nome;
- filtro por categoria;
- popup simples;
- link para wiki;
- dados em JSON.

Sem backend, sem admin e sem relacoes complexas.
