# Rede Social de Treinos: MotivAFIT

Este projeto é um aplicativo mobile focado em promover o engajamento e o apoio entre praticantes de atividade física, desenvolvido por alunos da Universidade do Contestado. Os usuários podem compartilhar fotos e descrições de seus treinos, registrar localização e interagir curtindo as publicações uns dos outros.

---

## Desenvolvedores

* **Matheus Pereira da Silva**
* **Luiz Fernando Kerico**

Alunos do curso de Engenharia de Software da Universidade do Contestado.

---

## Funcionalidades Implementadas

* **Autenticação de Usuários:**
    * Cadastro (e-mail, senha, nome, telefone)
    * Login
    * Redefinição de senha (Esqueci a Senha)
    * Logout
* **Gestão de Perfil:**
    * Exibição de informações do perfil (próprio e de outros usuários)
    * Exibição das publicações do usuário
    * Edição de perfil (nome, telefone, foto)
* **Publicações (Posts):**
    * Visualização do feed geral com publicações ordenadas por data.
    * Posts contêm: perfil do publicador, foto, descrição e localização.
    * Ao clicar no perfil, abre a página de perfil do usuário.
    * Funcionalidade de "Curtir" publicações.
* **Criação de Posts:**
    * Captura de foto via câmera ou seleção da galeria.
    * Inclusão de descrição e localização.
    * Posts vinculados ao usuário logado.
* **Remoção de Posts:**
    * Possibilidade de remover posts criados pelo próprio usuário.

---

## Tecnologias Utilizadas

* **React Native com Expo**: Framework para desenvolvimento de aplicativos mobile.
* **Firebase Authentication**: Para gestão de usuários (cadastro, login, logout).
* **Firestore (Firebase)**: Banco de dados NoSQL para armazenar dados de usuários e publicações.
* **Firebase Storage**: Para armazenamento das fotos dos treinos.
* **React Navigation**: Para navegação entre as telas do aplicativo.
* **Expo Image Picker**: Para seleção de imagens da galeria ou câmera.
* **Expo Location**: Para obter a localização do usuário.

---

## Configuração do Projeto

Siga os passos abaixo para configurar e rodar o projeto em sua máquina:

### Pré-requisitos

Certifique-se de ter o Node.js, npm (ou Yarn) e o Expo CLI instalados:

```bash
npm install -g expo-cli
```

### Clonar o Repositório
```
git clone https://github.com/fernandokerico/appRedeSocial
```
depois 
```
cd appRedeSocial
```
## Instalar Dependências
```
npm install
# ou
yarn install
```
### Configurar Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto, baseado no arquivo .env.example. Preencha-o com suas próprias credenciais do Firebase.

```

# Conteúdo do arquivo .env.example
EXPO_PUBLIC_API_KEY=SUA_API_KEY_DO_FIREBASE
EXPO_PUBLIC_AUTH_DOMAIN=SEU_AUTH_DOMAIN_DO_FIREBASE
EXPO_PUBLIC_PROJECT_ID=SEU_PROJECT_ID_DO_FIREBASE
EXPO_PUBLIC_STORAGE_BUCKET=SEU_STORAGE_BUCKET_DO_FIREBASE
EXPO_PUBLIC_MESSAGING_SENDER_ID=SEU_MESSAGING_SENDER_ID_DO_FIREBASE
EXPO_PUBLIC_APP_ID=SEU_APP_ID_DO_FIREBASE
```
> Importante: Nunca compartilhe suas chaves de API publicamente.

## Iniciar o Aplicativo
Para iniciar o servidor de desenvolvimento do Expo:
```
npm start
```

#### Como Abrir no Celular ou Navegador Web
Após executar o comando npm start (ou expo start), um QR Code será exibido no seu terminal, e opções para abrir em diferentes plataformas aparecerão:

No Celular/Smartphone (Recomendado):

Baixe o aplicativo "Expo Go" na Google Play Store (Android) ou Apple App Store (iOS) no seu celular.
Abra o aplicativo Expo Go e use-o para escanear o QR Code que aparece no seu terminal. O aplicativo será carregado diretamente no seu dispositivo.
No Navegador Web:

No terminal onde o Expo está rodando, pressione a tecla w. Isso abrirá o aplicativo em seu navegador padrão.
No Emulador (Android/iOS):

Se você tiver um emulador configurado no seu computador, você pode pressionar a tecla a (para Android) ou i (para iOS) no terminal para abrir o aplicativo diretamente no emulador.
