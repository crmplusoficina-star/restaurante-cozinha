# BRASA 47 — Cozinha

Fila de pedidos por etapas: Novo → Em preparo → Pronto. Exibe tempo, itens, acompanhamentos e observações.

App independente com repositório, build e GitHub Pages próprios. A interface principal contém apenas este módulo; os links de navegação abrem os outros apps.

## Desenvolvimento

~~~sh
npm ci
npm run dev
npm run build
~~~

## Publicação

Alterações concluídas devem ser publicadas no Pages. O workflow publica main em https://crmplusoficina-star.github.io/restaurante-cozinha/ .

## Integração

Cliente: https://crmplusoficina-star.github.io/restaurante/
Atendimento: https://crmplusoficina-star.github.io/restaurante-atendimento/
Cozinha: https://crmplusoficina-star.github.io/restaurante-cozinha/
Caixa: https://crmplusoficina-star.github.io/--restaurante-caixa/

Protótipo local. Todos os Pages usam a mesma origem e compartilham localStorage entre abas deste navegador. As chaves e os formatos de comanda existentes foram preservados. Ao reabrir uma mesa, uma nova sessão preserva os recebimentos anteriores.

Sem autenticação, autorização de equipe, cobrança real ou sincronização entre aparelhos. A integração real será com o mesmo Supabase, usando login e permissões por restaurante e função, aplicadas no servidor. Não há conexão de banco ativa. O cadastro do catálogo e a assinatura não fazem parte deste repositório.
