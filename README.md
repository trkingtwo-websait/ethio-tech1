# ኢትዮ ቴክ ዲጂታል – Netlify ላይ ማስቀመጥ

## በዚህ ፓኬጅ ውስጥ ያለው
- `public/` – ዌብሳይቱ (index.html እና poster.jpg)
- `netlify/functions/` – ሶስት ትንንሽ ሰርቨር ፋንክሽኖች
  - `order.mjs` – ትዕዛዙን ወደ እርስዎ ቴሌግራም ይልካል
  - `portfolio.mjs` – ፖርትፎሊዮውን ያስቀምጣል እና ያመጣል (የሚያስቀምጠው አድሚን ብቻ)
  - `image.mjs` – አድሚኑ ከጋለሪ የጫናቸውን ፎቶዎች ያሳያል
- `netlify.toml`, `package.json` – የNetlify ቅንብሮች

## 1. ቴሌግራም ቦት ይፍጠሩ
1. በቴሌግራም `@BotFather` ይክፈቱ፤ `/newbot` ይላኩ፤ ስም ይስጡ።
2. የሚሰጥዎትን **ቶክን** (Token) ያስቀምጡ። ለማንም አያካፍሉ።
3. የፈጠሩትን ቦት ይክፈቱ እና **Start** ይጫኑ፤ አንድ መልዕክት ይላኩለት።
4. በብራውዘር `https://api.telegram.org/bot<ቶክኑ>/getUpdates` ይክፈቱ። በውጤቱ ውስጥ `"chat":{"id":123456789` የሚለውን ቁጥር ያግኙ፤ ይህ **Chat ID** ነው።

## 2. ወደ Netlify ይጫኑ
ፋንክሽኖቹ ፓኬጅ (`@netlify/blobs`) ስለሚጠቀሙ **drag & drop አይሰራም**። በGitHub ያድርጉ፦
1. በGitHub አዲስ repository ይክፈቱ፤ የዚህን ዚፕ ይዘት (ፎልደሩን ሳይሆን ውስጡ ያሉትን) ይጫኑ።
2. Netlify → **Add new site → Import an existing project** → GitHub repository ይምረጡ።
3. Build settings ባዶ ይተዉ (netlify.toml ራሱ ይሞላቸዋል) → **Deploy**።

## 3. የሚስጥር ቅንብሮችን ያስገቡ
Netlify → Site configuration → **Environment variables** → Add:

| ስም | ዋጋ |
|---|---|
| `ADMIN_PASSWORD` | `3Yetakiya` |
| `TELEGRAM_BOT_TOKEN` | ከBotFather ያገኙት ቶክን |
| `TELEGRAM_CHAT_ID` | ያገኙት Chat ID |

ከዚያ **Deploys → Trigger deploy → Deploy site** ይጫኑ።

## 4. ይሞክሩ
- ፎርሙን ሞልተው "ትዕዛዝ ላክ" ይጫኑ → ትዕዛዙ ቦቱ ላይ ይመጣል።
- "Admin" → የይለፍ ቃል → ፖርትፎሊዮ ጨምሩ/ኤዲት/አጥፉ፤ ፎቶ ከጋለሪ ይምረጡ → ሴቭ። ሁሉም ጎብኚ ወዲያውኑ ያያል።

## ደህንነት
- የይለፍ ቃሉ እና የቦት ቶክኑ በNetlify ውስጥ ብቻ ነው የሚቀመጡት፤ በገጹ ኮድ ውስጥ የሉም።
- ትዕዛዝ መላኪያው በደቂቃ ከአንድ አይፒ 6 ጥያቄ ብቻ ይቀበላል፤ የተደበቀ የስፓም ወጥመድ መስክም አለው።
- የይለፍ ቃሉን መቀየር ከፈለጉ `ADMIN_PASSWORD`ን በNetlify ይቀይሩ እና እንደገና Deploy ያድርጉ።
