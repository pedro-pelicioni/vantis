# Setup Rápido - Vantis Mobile com Expo

## Passo a Passo

### 1. Instalar Dependências

```bash
cd mobile
npm install
```

### 2. Iniciar o Projeto

```bash
npm start
```

Isso abrirá o Expo Dev Tools no navegador.

### 3. Executar no Dispositivo

**Opção A: Usando Expo Go (Recomendado para desenvolvimento)**

1. Instale o app **Expo Go** no seu dispositivo:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Escaneie o QR code que aparece no terminal ou no navegador:
   - **iOS**: Use a câmera do iPhone
   - **Android**: Use o app Expo Go para escanear

**Opção B: Emulador/Simulador**

```bash
# Android
npm run android

# iOS (apenas macOS)
npm run ios

# Web
npm run web
```

## Estrutura de Arquivos

```
mobile/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── screens/       # Telas da aplicação
│   └── theme/         # Sistema de temas
├── App.tsx            # Componente raiz
├── index.js           # Entry point
├── app.json           # Configuração Expo
└── package.json       # Dependências
```

## Comandos Úteis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run android` - Abre no emulador Android
- `npm run ios` - Abre no simulador iOS
- `npm run web` - Abre no navegador
- `r` no terminal - Recarrega o app
- `m` no terminal - Abre o menu de desenvolvedor

## Troubleshooting

### Erro: "Unable to resolve module"
```bash
# Limpe o cache e reinstale
rm -rf node_modules
npm install
npm start -- --clear
```

### App não carrega no dispositivo
- Certifique-se de que o dispositivo e o computador estão na mesma rede Wi-Fi
- Tente usar o modo "Tunnel" no Expo Dev Tools

### Problemas com dependências nativas
```bash
# Limpe o cache do Expo
expo start --clear
```

## Próximos Passos

1. ✅ Projeto configurado com Expo
2. ✅ Navegação configurada
3. ✅ Sistema de temas implementado
4. ⏭️ Adicionar funcionalidades específicas
5. ⏭️ Integrar com backend
6. ⏭️ Testes e deploy

