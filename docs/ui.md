# Base UI e manutencao visual

Este documento registra a base visual atual depois da migracao para Tailwind CSS
e shadcn/ui. Use estas regras para manter o MVP simples, util e centrado no mapa.

## Base atual

- O projeto usa Tailwind CSS 4 com tokens definidos em `src/index.css`.
- O projeto usa shadcn/ui v4 com componentes copiados para o codigo-fonte.
- A primitiva atual do shadcn/ui e Base UI, via dependencia `@base-ui/react`.
- A configuracao do shadcn fica em `components.json`, na raiz do projeto.
- Componentes de UI ficam em `src/components/ui/`.
- O utilitario `cn()` fica em `src/lib/utils.ts`.
- Imports internos podem usar o alias `@/*`, conforme `components.json`.

Componentes shadcn/ui disponiveis hoje:

```text
src/components/ui/
  badge.tsx
  button.tsx
  checkbox.tsx
  input.tsx
  scroll-area.tsx
  separator.tsx
  sheet.tsx
  tooltip.tsx
```

Arquivos auxiliares de variantes, como `button-variants.ts` e
`badge-variants.ts`, tambem fazem parte da base de UI local.

## Adicionar componentes shadcn/ui

Adicione componentes apenas quando houver uma necessidade real da interface.
shadcn/ui copia codigo para `src/components/ui/`, entao cada componente novo
passa a ser codigo mantido pelo projeto.

Fluxo recomendado:

1. Confirme que o componente resolve uma necessidade do MVP.
2. Use a CLI do shadcn para adicionar o componente necessario.
3. Nao rode `shadcn init` sem motivo: o projeto ja tem `components.json`,
   `src/index.css`, `src/components/ui/` e `src/lib/utils.ts` configurados.
4. Evite `add --all`; adicione somente o componente que sera usado.
5. Revise os diffs gerados pela CLI, incluindo dependencias, imports e tokens.
6. Rode as validacoes antes de considerar a mudanca pronta.

Exemplo:

```bash
pnpm dlx shadcn@latest add dialog
pnpm lint
pnpm build
```

Se for necessario investigar um componente antes de instalar, prefira comandos
da CLI como `docs`, `view` ou `--dry-run`.

## Convencoes visuais

- O mapa e sempre a primeira experiencia. Nao substitua a tela inicial por uma
  landing page ou apresentacao do produto.
- No desktop, mantenha a sidebar lateral com busca, filtros e resultados; o mapa
  deve ocupar o restante do espaco.
- No mobile, mantenha o mapa como tela principal, busca no topo e filtros em
  `Sheet`.
- Evite cards decorativos excessivos. Use cards apenas quando eles ajudam a
  organizar itens repetidos, estados vazios ou detalhes.
- Prefira UI funcional, densa e clara. O usuario deve encontrar NPCs, inimigos,
  areas e recursos com poucos cliques.
- Use tokens de tema (`bg-background`, `text-foreground`, `border-border`,
  `bg-card`, `text-muted-foreground`, `ring-ring`) em vez de cores ad hoc.
- Use cores especificas somente quando elas comunicarem dados do mapa, como tipo
  de marcador, ponto de warp, recursos ou monstros.
- Nao adicione efeitos visuais grandes, gradientes decorativos ou blocos de texto
  permanentes sobre o mapa sem necessidade clara.

## CSS global

`src/index.css` deve continuar enxuto e conter apenas:

- imports do Tailwind, shadcn/ui, animacoes e fontes;
- tokens de tema e `@theme inline`;
- `@layer base`;
- estilos indispensaveis de Leaflet, do container do mapa e dos marcadores.

Prefira classes Tailwind nos componentes para layout, espacamento, tipografia,
bordas, estados e responsividade. Evite recriar grandes blocos de CSS manual ou
adicionar seletores globais para casos que podem viver no componente.

## Checklist para mudancas de UI

Antes de fechar uma mudanca visual:

- Rode `pnpm lint`.
- Rode `pnpm build`.
- Teste desktop com sidebar, busca, filtros e resultados.
- Teste mobile com mapa principal, busca no topo e filtros no `Sheet`.
- Confirme que busca e filtros trabalham juntos.
- Clique em resultado de busca e confirme a centralizacao do marcador.
- Clique em marcador e confirme o popup.
- Adicione ou ajuste um marcador via JSON e confirme que nao foi necessario
  alterar codigo.
- Confirme que a mudanca nao adicionou backend, login, admin, comentarios,
  favoritos, clustering, Fuse.js, rotas automaticas, colaboracao publica ou
  sincronizacao com wiki.
