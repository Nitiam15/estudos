# Planejamento de Estudos: instalação

O app funciona sem internet e sincroniza o progresso entre Windows e Android pelo Firebase.
São três etapas, feitas uma única vez: **Firebase** (cerca de 15 min), **publicação no GitHub** (cerca de 10 min)
e **instalação nos aparelhos**.

---

## 1. Firebase

1. Acesse **console.firebase.google.com** com sua conta Google e clique em **Criar projeto**.
   Dê um nome (ex.: `estudos-residencia`). O Google Analytics pode ficar desativado.
2. No menu lateral, **Criação → Authentication → Vamos começar**. Em **Método de login**, ative:
   - **Google** (escolha seu e-mail como e-mail de suporte);
   - **E-mail/senha**.
3. **Criação → Firestore Database → Criar banco de dados.**
   Local: `southamerica-east1 (São Paulo)`. Modo: **produção**.
4. Na aba **Regras** do Firestore, apague o conteúdo, cole o do arquivo `firestore.rules` e clique em **Publicar**.
   Isso garante que cada conta só enxergue os próprios dados.
5. Clique na engrenagem → **Configurações do projeto** → em **Seus apps**, clique no ícone **Web `</>`**.
   Registre o app com qualquer apelido (não marque Firebase Hosting).
   Copie o bloco `firebaseConfig = { ... }` que aparece.
6. Abra o arquivo `firebase-config.js` num editor de texto e troque `window.FIREBASE_CONFIG = null;` por:
   ```js
   window.FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", storageBucket: "...", messagingSenderId: "...", appId: "..." };
   ```
   (com os valores copiados). Salve.

> A `apiKey` do Firebase não é uma senha: ela identifica o projeto e pode ficar pública. Quem protege os dados
> são as regras do passo 4.

## 2. Publicação no GitHub Pages (grátis)

1. Crie uma conta em **github.com**, se ainda não tiver.
2. **New repository** → nome `estudos` → **Public** → **Create repository**.
3. Clique em **uploading an existing file** e arraste **todo o conteúdo desta pasta**
   (inclusive as pastas `icons`, `vendor` e `fonte`). Clique em **Commit changes**.
4. **Settings → Pages** → em *Branch*, escolha `main` e `/ (root)` → **Save**.
   Em 1 a 2 minutos o endereço fica disponível: `https://SEU-USUARIO.github.io/estudos/`
5. Volte ao Firebase: **Authentication → Configurações → Domínios autorizados → Adicionar domínio**
   e informe `SEU-USUARIO.github.io`. Sem isso, o login com Google é recusado.

> Com o repositório público, qualquer pessoa com o endereço vê o código e a lista de temas do cronograma,
> mas **não** o seu progresso, que fica protegido no Firebase.

## 3. Instalação nos aparelhos

**Android (Chrome):** abra o endereço → menu **⋮** → **Instalar app** (ou *Adicionar à tela inicial*).
**Windows (Chrome ou Edge):** abra o endereço → ícone de instalar na barra de endereço
(ou menu → *Instalar Planejamento de Estudos*).

Em cada aparelho, **com internet**:
1. Abra o app instalado e vá em **Dados → Sincronização**.
2. Entre com **a mesma conta** nos dois (Google, ou e-mail e senha).
3. No segundo aparelho, o app avisa que a conta já tem progresso: toque em **OK** para usá-lo.

A partir daí o app abre e salva sem internet. As marcações feitas offline são enviadas quando a conexão volta,
e o cabeçalho mostra o estado: *sincronizado*, *enviando alterações* ou *offline · salvo no aparelho*.

### Trazer o progresso da versão anterior (opcional)
Na versão antiga: **Dados → Backup completo → Copiar**.
Na nova, **antes de fazer login**: **Dados → Exportar e restaurar** → cole no campo → **Restaurar backup**.
Depois faça o login: o progresso restaurado é enviado para a nuvem.

---

## Anki (opcional, no computador)

O app lê do Anki de computador quantos cartões de cada tema estão vencidos e quantos você revisou na semana.
Quando o baralho de um tema zera e houve revisão desde sábado, a revisão de flashcards daquele tema é marcada
sozinha. As contagens chegam ao celular pela sincronização.

1. No Anki do computador: **Ferramentas → Complementos → Obter complementos** → código **`2055492159`**
   (AnkiConnect) → reinicie o Anki.
2. **Ferramentas → Complementos → AnkiConnect → Configuração.** Na linha `"webCorsOriginList"`, acrescente o
   endereço do app, assim:
   ```json
   "webCorsOriginList": ["http://localhost", "https://SEU-USUARIO.github.io"],
   ```
   Salve e reinicie o Anki.
3. No app, **no computador**: **Dados → Anki** → marque **Ler do Anki neste aparelho** → **Associar baralhos**.
   O app compara os nomes dos seus baralhos com as aulas do cronograma e sugere as associações.
   Confira em **Ver associações**: aulas em amarelo estão sem baralho, e dá para remover (✕) ou adicionar baralhos.
4. Se o Chrome ou o Edge perguntarem se a página pode acessar outros apps e serviços deste dispositivo, permita.

Com o Anki aberto, o app lê as contagens ao abrir, a cada 5 minutos e ao tocar em **Ler contagens agora**.

**Marcação automática e manual**
- Revisão marcada pelo Anki aparece como *pelo Anki* nos concluídos. Se uma leitura posterior mostrar cartões
  vencidos de novo naquele baralho, ela volta para as pendências; quando zerar, é marcada outra vez.
- Você sempre pode marcar (✓) ou desmarcar (✕) à mão. Marcou à mão: o app não desmarca sozinho.
  Desmarcou à mão: o app só volta a marcar depois que você revisar novos cartões daquele baralho.
- Na aba **Mapa**, os botões **+** e **−** de cada matéria avançam ou recuam uma etapa da escada.
Revisões feitas no AnkiDroid entram na conta depois que o AnkiDroid e o Anki do computador sincronizarem com o AnkiWeb.
No celular, deixe **Ler do Anki neste aparelho** desligado; nas revisões aparece o atalho **Abrir AnkiDroid**.

## Atualizações

1. Eu gero um pacote com os arquivos alterados. A partir da próxima atualização, ele **não traz o
   `firebase-config.js`**, para não apagar a sua configuração.
2. No GitHub: **Add file → Upload files** → arraste os arquivos (os de mesmo nome são substituídos) → **Commit changes**.
   A nova versão fica no ar em 1 a 10 minutos.
3. Nos aparelhos, com internet, o app verifica sozinho ao abrir e a cada hora. Quando encontra a versão nova,
   baixa em segundo plano e mostra **"Nova versão disponível · Atualizar"**. Tocando em *Atualizar*, recarrega em
   cerca de um segundo. Se você ignorar o aviso, a versão nova entra na próxima vez que o app for fechado e aberto.
4. Sem internet não há verificação: a versão instalada continua funcionando normalmente.

O progresso não é afetado: ele fica guardado no aparelho e no Firebase, separado do código.
Em **Dados → Versão e atualizações** você vê a versão instalada e pode verificar manualmente.

## Limitações conhecidas

- A **primeira abertura** em cada aparelho e o **primeiro login** precisam de internet.
- Se o login com Google abrir e fechar sem concluir no app instalado, use e-mail e senha: funciona igual.
- Marcações diferentes feitas em dois aparelhos offline são **combinadas**. Se o **mesmo item** for alterado
  nos dois antes de sincronizar, vale a última alteração enviada.
- Apagar os dados do navegador ou desinstalar o app remove a cópia local. Com login feito, basta entrar de novo
  para recuperar tudo da nuvem.

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html`, `app.js` | o aplicativo |
| `vendor/react.js` | biblioteca React, incluída para funcionar offline |
| `sw.js` | funcionamento offline e controle de versões |
| `version.json` | versão publicada (usada para detectar atualizações) |
| `firebase-config.js` | configuração do seu projeto Firebase |
| `firestore.rules` | regras de segurança (colar no console, não precisa estar no GitHub) |
| `manifest.webmanifest`, `icons/` | nome e ícones do app instalado |
| `fonte/` | código-fonte (`app.jsx`) e script de compilação |
