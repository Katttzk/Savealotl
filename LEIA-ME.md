# Savealotl: guia para pôr a app a funcionar

A app são ficheiros simples (sem servidor). Funciona como PWA: instala-se no telemóvel como uma app normal, abre sem internet e sincroniza pelo Google Drive.

## O que está na pasta

- `index.html`: a app toda.
- `config.js`: onde colas o ID de cliente do Google (passo 2).
- `manifest.webmanifest` e `icons/`: nome e ícone da app no telemóvel.
- `sw.js`: faz a app abrir mesmo sem internet.

## 1. Publicar a app (por exemplo no GitHub Pages)

1. Cria um repositório novo no GitHub (por exemplo `axolotls`).
2. Carrega todos os ficheiros desta pasta, mantendo a pasta `icons`.
3. Em **Settings → Pages**, escolhe o ramo `main` e a pasta `/ (root)`.
4. Ao fim de um minuto a app fica em `https://O-TEU-UTILIZADOR.github.io/axolotls/`.

Qualquer alojamento com **https** serve.

## 2. Ligar ao Google Drive (uma vez só)

Podes reutilizar o projeto da Google Cloud do Mind your Business ou criar um novo.

1. Abre a [Google Cloud Console](https://console.cloud.google.com/) e escolhe o projeto.
2. **APIs e serviços → Biblioteca**: procura **Google Drive API** e ativa.
3. **Ecrã de consentimento OAuth**: tipo *Externo*, põe o nome da app e o teu email. Em *Utilizadores de teste*, junta a conta Google que vão usar.
4. **Credenciais → Criar credenciais → ID de cliente OAuth**:
   - Tipo: **Aplicação Web**.
   - Em **Origens JavaScript autorizadas** junta o endereço da app, só a parte inicial, por exemplo `https://o-teu-utilizador.github.io`. Para testar no computador, junta também `http://localhost:8000`.
5. Copia o **ID de cliente** (acaba em `.apps.googleusercontent.com`) e cola-o em `config.js`, no lugar do texto `COLOCA_AQUI…`.
6. Volta a carregar o `config.js` para o GitHub.

A app só pede acesso a uma pasta privada dela no Drive (`drive.appdata`). Não consegue ver os vossos outros ficheiros. Enquanto a app estiver em modo de teste, o Google mostra um aviso de "app não verificada". É normal: toca em *Avançadas → Continuar*.

## 3. Instalar nos telemóveis

- **Android (Chrome):** abre o endereço, menu ⋮ → **Instalar app** (ou *Adicionar ao ecrã principal*).
- **iPhone (Safari):** abre o endereço, botão Partilhar → **Adicionar ao ecrã principal**.

## 4. Sincronizar os dois telemóveis

1. Em cada telemóvel, toca na nuvem ☁️ no canto superior direito → **Ligar ao Google Drive**.
2. Usa **a mesma conta Google** nos dois.
3. No segundo telemóvel, a app pergunta se queres usar os dados do Drive. Responde **OK**.

A partir daí, o que um regista aparece no outro em cerca de 5 segundos. Se os dois mexerem ao mesmo tempo, a app junta as alterações: gastos, rendimentos e poupanças dos dois ficam todos guardados.

A bolinha na nuvem mostra o estado: verde é sincronizado, laranja está a sincronizar, rosa precisa de voltar a ligar, cinzento está desligado ou sem internet. Sem internet fica tudo guardado no telemóvel e sincroniza quando a ligação voltar.

## 5. Começar a usar a sério

A app vem com números de exemplo. Na nuvem ☁️ → **Começar do zero** apagas os exemplos e ficas só com os axolotls. Convém fazer isto **num só telemóvel, já com a sincronização ligada**, para o outro receber a mesma limpeza.

Em **Cópia de segurança** podes descarregar um ficheiro com tudo, de vez em quando.

## Quando alterares a app

Sempre que mudares o `index.html`, aumenta o número em `sw.js` (`axolotls-v1` → `axolotls-v2`). Assim os telemóveis recebem a versão nova.
