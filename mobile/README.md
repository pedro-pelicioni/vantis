# Vantis Mobile

Aplicação React Native com Expo para Vantis - The "Buy & Keep" Card.

## Estrutura do Projeto

```
mobile/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── screens/         # Telas da aplicação
│   ├── theme/           # Sistema de temas e cores
│   └── utils/           # Utilitários
├── App.tsx              # Componente principal
├── index.js             # Entry point
├── app.json             # Configuração do Expo
└── package.json         # Dependências
```

## Instalação

### Pré-requisitos

- Node.js >= 18
- Expo CLI (instalado globalmente ou via npx)
- Expo Go app no seu dispositivo móvel (para desenvolvimento)

### Passos

1. Instale as dependências:
```bash
npm install
# ou
yarn install
```

2. Execute o projeto:
```bash
npm start
# ou
expo start
```

3. Escaneie o QR code com:
   - **iOS**: Câmera do iPhone
   - **Android**: Expo Go app

## Comandos Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run android` - Inicia no Android
- `npm run ios` - Inicia no iOS (apenas macOS)
- `npm run web` - Inicia no navegador web

## Tecnologias Utilizadas

- **Expo** ~50.0.0 - Framework React Native
- **React Native** 0.73.2
- **TypeScript**
- **React Navigation** - Navegação entre telas
- **AsyncStorage** - Armazenamento local
- **React Native Gesture Handler** - Gestos
- **React Native Reanimated** - Animações

## Estrutura de Navegação

- **Welcome** - Tela de boas-vindas
- **Onboarding** - Configuração inicial da conta
- **Main Tabs**:
  - Home
  - Card
  - Pay Mode
  - DeFi
  - Activity
- **Settings** - Configurações

## Sistema de Temas

A aplicação suporta tema claro e escuro, com persistência usando AsyncStorage. O tema pode ser alternado através do componente `ThemeToggle`.

## Desenvolvimento

### Usando Expo Go

1. Instale o Expo Go no seu dispositivo
2. Execute `npm start`
3. Escaneie o QR code

### Build para Produção

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## Vantagens do Expo

- ✅ Desenvolvimento mais rápido
- ✅ Hot reload nativo
- ✅ Não precisa configurar Android Studio/Xcode para desenvolvimento
- ✅ Acesso fácil a APIs nativas
- ✅ Over-the-air updates
- ✅ Builds na nuvem (EAS Build)

## Notas

- A aplicação foi migrada de Nuxt.js/Vue.js para React Native com Expo
- Mantém a mesma estrutura visual e funcionalidades do frontend web
- Componentes adaptados para mobile com navegação nativa
