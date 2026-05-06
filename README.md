# ScaleAds

Plataforma de curadoria de ofertas escaladas com área de membros.

## Acesso

- **Admin:** `/admin` → email: lincolnsouzav@gmail.com / senha: scaleads@admin2024
- **Membros:** `/` → email e senha cadastrados pelo admin

## Deploy na Vercel (recomendado)

1. Crie uma conta em vercel.com
2. Instale o Vercel CLI: `npm i -g vercel`
3. Na pasta do projeto: `vercel`
4. Siga as instruções — em 2 minutos está no ar
5. Para domínio personalizado: Vercel → Project → Settings → Domains → adicione `scaleads.questmed.com.br`

## Deploy manual

1. `npm run build`
2. Sobe a pasta `dist/` no Hostinger ou qualquer hospedagem estática

## Configurar domínio no Cloudflare

Adicione um CNAME:
- Nome: `scaleads`  
- Destino: `seu-projeto.vercel.app`
- Proxy: DNS only (nuvem cinza)

## Estrutura

- `src/pages/Login.jsx` — tela de login (membro e admin)
- `src/pages/Feed.jsx` — feed de ofertas para membros
- `src/pages/Admin.jsx` — painel admin (criar/editar/publicar ofertas + gerenciar membros)
- `src/components/OfferCard.jsx` — card de oferta
- `src/lib/db.js` — banco de dados (localStorage por ora)
- `src/lib/auth.jsx` — autenticação

## Próximos passos

- [ ] Integração Lastlink (webhook para ativar membro automaticamente ao assinar)
- [ ] Backend real (Railway + PostgreSQL) para dados persistentes entre dispositivos
- [ ] Upload de imagem para storage (Cloudflare R2 ou Supabase Storage)
