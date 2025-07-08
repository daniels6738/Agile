# --- ESTÁGIO 1: Build ---
# Define a imagem base com Node.js e o define como 'builder'
FROM node:20-slim AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de definição de pacotes
COPY package*.json ./

# Instala as dependências de produção primeiro para otimizar o cache do Docker
RUN npm install --only=production

# Copia o restante dos arquivos do projeto (código fonte, etc.)
COPY . .

# Instala todas as dependências (incluindo as de desenvolvimento, como o TypeScript)
RUN npm install

# Executa o comando de build para transpilar o TypeScript para JavaScript
RUN npm run build

# --- ESTÁGIO 2: Produção ---
# Define a imagem final, que é mais leve
FROM node:20-slim

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de definição de pacotes novamente
COPY package*.json ./

# Instala APENAS as dependências de produção
RUN npm install --only=production

# Copia o código transpilado (pasta 'dist') e a pasta 'node_modules' do estágio de build
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules


# Expõe a porta que a aplicação usa para se comunicar
EXPOSE 3000

# Comando para iniciar a aplicação em modo de produção
CMD [ "npm", "run", "start:prod" ]