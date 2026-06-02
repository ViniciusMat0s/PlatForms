# Deploy

## Produção local

```bash
npm install
npm run build
npm start
```

Depois disso a aplicação fica disponível em `http://localhost:3001` e a API em `http://localhost:3001/api`.

## Docker

```bash
docker build -t forms-platform .
docker run -p 3001:3001 forms-platform
```

## Variáveis úteis

- `PORT`: porta da API e do servidor de arquivos estáticos
- `SERVE_CLIENT`: defina como `false` se quiser desligar o frontend servido pelo Express
- `VITE_API_URL`: substitui o padrão `/api` quando for necessário apontar para outro backend
