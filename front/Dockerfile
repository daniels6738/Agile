# --- ESTÁGIO 1: Build ---
# Usamos uma imagem slim do Node para ter as ferramentas de build
FROM node:20-slim AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e o package-lock.json
COPY package*.json ./

# Instala todas as dependências
RUN npm install

# Copia o restante do código-fonte do projeto
COPY . .

# Executa o script de build para gerar os arquivos estáticos na pasta /dist
RUN npm run build

# --- ESTÁGIO 2: Produção ---
# Usamos a imagem oficial e leve do Nginx
FROM nginx:stable-alpine

# Remove a configuração padrão do Nginx
#RUN rm /etc/nginx/conf.d/default.conf

# Copia a nossa configuração nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos da pasta 'dist' (gerada no estágio anterior)
# para a pasta padrão que o Nginx usa para servir arquivos
COPY --from=builder /app/dist /usr/share/nginx/html

# Na inicialização do contêiner, o Nginx irá automaticamente servir
# os arquivos da pasta /usr/share/nginx/html na porta 80.
EXPOSE 80

# Comando para iniciar o Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]