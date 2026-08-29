# Soul's Remnant Interactive Map

Mapa interativo para ajudar jogadores de Soul's Remnant a encontrar locais, NPCs, monstros, bosses, recursos, teleports e outros pontos de interesse.

Este projeto comeca como um MVP simples: uma aplicacao React/Vite com dados estaticos em JSON. Backend, painel administrativo e integracao profunda com a wiki ficam para depois que a primeira versao ja estiver util.

## Objetivo do MVP

Responder rapidamente a pergunta:

> Onde encontro isso no mundo de Soul's Remnant?

O MVP deve permitir:

- abrir o mapa;
- navegar com pan e zoom;
- ver marcadores;
- filtrar por area/regiao e dados do marcador;
- pesquisar por nome, area, monstros e recursos;
- clicar em um marcador para ver detalhes;
- abrir a pagina correspondente na wiki quando existir.

## Stack planejada

- Vite
- React
- TypeScript
- Leaflet
- React Leaflet
- JSON estatico para dados iniciais
- Fuse.js opcional para busca melhor

## Documentacao

- [Plano do MVP](./docs/mvp.md)
- [Modelo de dados](./docs/data-model.md)
- [Schema dos dados](./docs/data-schema.md)
- [Guia de marcadores](./docs/markers-guide.md)
- [Base UI e manutencao visual](./docs/ui.md)
- [Milestones e issues](./docs/milestones.md)
- [Instrucoes para agentes](./AGENTS.md)

## Comandos

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

## Decisoes importantes

- Comecar sem backend.
- Manter login, painel administrativo e sincronizacao automatica com a wiki fora do MVP.
- Usar Leaflet com uma imagem do mapa do jogo.
- Salvar coordenadas dos marcadores em percentual relativo ao mapa.
- Tratar `src/data/markers.json` como fonte confiavel e runtime dos dados do mapa.
- Usar `src/data/maps.json` apenas como auxiliar de importacao/metadados da imagem, nao como fonte runtime de marcadores ou entidades.
- Manter dados editaveis em JSON estatico no inicio.
- Separar "marcador" de "entidade" quando o projeto crescer.
