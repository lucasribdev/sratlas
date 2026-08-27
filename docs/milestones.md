# Milestones e Issues

Backlog inicial para construir o MVP do mapa interativo de Soul's Remnant.

## Milestone 1: Base do projeto

Objetivo: preparar a aplicacao para receber o mapa real, dados e componentes principais.

### Issues

#### 1. Limpar template inicial do Vite

Remover tela, assets e estilos padrao do Vite.

Status: MVP

#### 2. Definir estrutura inicial de pastas

Criar estrutura para componentes, dados, tipos de dominio e utilitarios.

Status: MVP

#### 3. Instalar dependencias do mapa

Adicionar Leaflet e React Leaflet.

Status: MVP

#### 4. Criar layout base da aplicacao

Criar estrutura com sidebar, area do mapa e comportamento responsivo inicial.

Status: MVP

## Milestone 2: Mapa navegavel

Objetivo: exibir a imagem do mapa do jogo com pan e zoom.

### Issues

#### 5. Adicionar imagem inicial do mapa

Adicionar a imagem em `public/maps/`.

Status: MVP

#### 6. Renderizar mapa com Leaflet

Configurar Leaflet para usar imagem estatica e sistema de coordenadas simples.

Status: MVP

#### 7. Ajustar limites, zoom minimo e zoom maximo

Impedir que o usuario se perca fora da area util do mapa.

Status: MVP

#### 8. Criar utilitario de conversao de coordenadas

Converter coordenadas percentuais dos dados para coordenadas usadas pelo Leaflet.

Status: MVP

## Milestone 3: Dados e marcadores

Objetivo: carregar mapas e marcadores a partir de JSON estatico.

### Issues

#### 9. Criar `maps.json`

Definir o mapa inicial, imagem e dimensoes.

Status: MVP

#### 10. Definir regra visual dos marcadores

Definir cores dos marcadores a partir de `warpPoint`, `resources`, `monsters` e fallback generico.

Status: MVP

#### 11. Criar `markers.json`

Adicionar conjunto inicial de marcadores reais ou placeholders controlados.

Status: MVP

#### 12. Criar tipos TypeScript para dados

Tipar mapas e marcadores.

Status: MVP

#### 13. Renderizar marcadores no mapa

Exibir marcadores usando dados do JSON.

Status: MVP

#### 14. Criar popup de marcador

Mostrar nome, area, dados reais do marcador, descricao curta e link da wiki.

Status: MVP

## Milestone 4: Busca e filtros

Objetivo: permitir que jogadores encontrem rapidamente pontos importantes.

### Issues

#### 15. Criar filtros rapidos por dados

Permitir filtrar por ponto de warp, monstros e tipos de recurso presentes nos marcadores.

Status: MVP

#### 16. Criar busca por texto

Buscar por nome, area e tags.

Status: MVP

#### 17. Criar lista de resultados

Mostrar marcadores filtrados em uma lista lateral.

Status: MVP

#### 18. Centralizar marcador selecionado

Ao clicar em resultado ou marcador, mover o mapa para o ponto escolhido.

Status: MVP

#### 19. Tratar estado vazio

Mostrar mensagem simples quando nenhum marcador corresponder a busca/filtros.

Status: MVP

## Milestone 5: UX e responsividade

Objetivo: deixar a experiencia utilizavel em desktop e mobile.

### Issues

#### 20. Ajustar layout desktop

Garantir sidebar legivel e mapa ocupando o espaco principal.

Status: MVP

#### 21. Ajustar layout mobile

Criar experiencia simples com busca no topo e filtros acessiveis.

Status: MVP

#### 22. Melhorar estados visuais dos marcadores

Diferenciar marcador normal, hover e selecionado.

Status: MVP

#### 23. Melhorar acessibilidade basica

Garantir labels, foco de teclado e contraste aceitavel.

Status: MVP

## Milestone 6: Preparacao para lancamento

Objetivo: validar a primeira versao e deixar claro como manter dados.

### Issues

#### 24. Criar guia para adicionar marcadores

Documentar como editar `markers.json` e como calcular coordenadas.

Status: MVP

#### 25. Validar dados iniciais

Checar IDs duplicados, coordenadas fora de faixa e campos obrigatorios ausentes.

Status: MVP

#### 26. Testar fluxo principal

Validar abrir mapa, buscar, filtrar, clicar em marcador e abrir wiki.

Status: MVP

#### 27. Rodar build e lint

Garantir que `pnpm build` e `pnpm lint` passam.

Status: MVP

#### 28. Revisar escopo final do MVP

Confirmar que nada fora do MVP foi adicionado.

Status: MVP

## Depois do MVP

Itens para nao entrar na primeira entrega.

### Issues futuras

#### 29. Adicionar clustering de marcadores

Status: Depois do MVP

#### 30. Adicionar busca fuzzy com Fuse.js

Status: Depois do MVP

#### 31. Criar URLs compartilhaveis para marcador selecionado

Status: Depois do MVP

#### 32. Criar painel administrativo simples

Status: Depois do MVP

#### 33. Criar editor visual de coordenadas

Status: Depois do MVP

#### 34. Separar entidades de marcadores

Status: Depois do MVP

#### 35. Adicionar relacoes com drops, quests e itens

Status: Depois do MVP

#### 36. Integrar melhor com a wiki

Status: Depois do MVP

#### 37. Adicionar favoritos

Status: Opcional

#### 38. Adicionar comentarios ou notas da comunidade

Status: Opcional

## Ordem recomendada

1. Base do projeto
2. Mapa navegavel
3. Dados e marcadores
4. Busca e filtros
5. UX e responsividade
6. Preparacao para lancamento

## Menor versao lancavel

Para lancar o quanto antes, conclua apenas:

- issues 1 a 4;
- issues 5 a 8;
- issues 9 a 14;
- issues 15, 16, 18 e 19;
- issues 20, 21 e 23;
- issues 24 a 28.

A issue 17, lista de resultados, agrega bastante valor, mas pode ser cortada se for necessario lancar uma versao ainda menor.
