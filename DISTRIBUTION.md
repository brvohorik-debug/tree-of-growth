# Distribuce aplikace Tree of Growth

Návod, jak aplikaci vydat na **Google Play Store** a umožnit **stažení z vlastního webu**.

---

## Přehled možností

| Cíl | Typ buildu | Příkaz | Výstup |
|-----|------------|--------|--------|
| **Google Play** | AAB (Android App Bundle) | `eas build --platform android --profile production` | Soubor `.aab` |
| **Vlastní web** | APK | `eas build --platform android --profile preview` | Soubor `.apk` |

---

## Před začátkem

### 1. App ikony (povinné pro build)

Přidej do složky `assets/`:

- **icon.png** – 1024×1024 px
- **splash.png** – 1284×2778 px
- **adaptive-icon.png** – 1024×1024 px
- **favicon.png** – 48×48 px

### 2. Expo účet a EAS CLI

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### 3. Pro Google Play: Developer účet

- Vytvoř účet na [Google Play Console](https://play.google.com/console)
- Jednorázový poplatek **25 USD**
- Doba schválení účtu obvykle 24–48 hodin

---

## Část A: Google Play Store

### Krok 1: Sestavení AAB pro produkci

```bash
eas build --platform android --profile production
```

- Build proběhne na serverech Expo
- Po dokončení stáhneš soubor `.aab` z [expo.dev](https://expo.dev) nebo odkazu v terminálu

### Krok 2: Vytvoření aplikace v Play Console

1. Otevři [Google Play Console](https://play.google.com/console)
2. **Vytvořit aplikaci** → vyplň název, jazyk, typ (aplikace)
3. Potvrzení zásad ochrany soukromí a dalších požadavků

### Krok 3: Připravení store listingu

Potřebuješ:

- **Krátký popis** (max. 80 znaků)
- **Plný popis** (max. 4000 znaků)
- **Screenshoty** – např. 2–8 obrázků telefonu (min. 320 px na nejkratší straně)
- **Ikona** – 512×512 px (obvykle z `icon.png`)
- **Obrázek na promo** – 1024×500 px (volitelné)

### Krok 4: Obsah aplikace

1. **Hlavní údaje** – kategorie, kontaktní e‑mail, web
2. **Úložiště** – nahrání souboru AAB
3. **Národní prostředí a ceny** – země a zdarma/placené
4. **Posouzení obsahu** – dotazník (např. reklamy, věk)
5. **Zásady ochrany soukromí** – URL na zásady (lze využít např. [privacypolicies.com](https://www.privacypolicies.com))

### Krok 5: Odeslání ke kontrole

1. Vytvoř **produkční verzi** (nebo interní testování)
2. Nahraj AAB soubor
3. Odešli k recenzi
4. Kontrola může trvat **několik hodin až několik dní**

---

## Část B: Stažení z vlastního webu

### Krok 1: Sestavení APK

```bash
eas build --platform android --profile preview
```

- Vytvoří se soubor `.apk` (cca 30–80 MB)
- Stáhni ho z odkazu po dokončení buildu

### Krok 2: Nahrání APK na web

1. Umísti APK do složky na webu (např. `/downloads/` nebo do CDN)
2. Důležité: nastav správný **Content-Type** (např. `application/vnd.android.package-archive`)
3. Zajisti **HTTPS** – jinak Android může bránit stažení

### Krok 3: Stránka pro stažení

Jednoduchý příklad HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Stáhnout Tree of Growth</title>
</head>
<body>
  <h1>Tree of Growth</h1>
  <p>Sleduj svůj růst prostřednictvím plnění úkolů.</p>
  <a href="/downloads/tree-of-growth.apk" download>
    Stáhnout pro Android
  </a>
  <p><small>Na Androidu povol instalaci z neznámých zdrojů v nastavení.</small></p>
</body>
</html>
```

### Krok 4: Upozornění pro uživatele

Na Androidu je potřeba povolit instalaci z neznámých zdrojů:

- **Android 8+:** Nastavení → Aplikace → Speciální přístup → Instalovat neznámé aplikace → prohlížeč
- **Android 14+:** Nastavení → Aplikace → Speciální přístup → Instalovat neznámé aplikace

---

## Aktualizace aplikace

### Verze v `app.json`

Před každým novým vydáním uprav v `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

- **version** – uživatelská verze (např. 1.0.1, 1.1.0)
- **versionCode** – celé číslo, které musí s každou novou verzí narůstat (1, 2, 3…)

### Play Store

- Nahraj nový AAB v Play Console
- Vytvoř novou release a odešli ke kontrole

### Vlastní web

- Nahraď starý APK novým pod stejným názvem/URL
- Uživatelé si musí stáhnout a nainstalovat novou verzi ručně

---

## GitHub (volitelné)

GitHub není nutný pro distribuci, ale můžeš ho využít k:

- verzování kódu a zálohování
- automatickému buildu přes EAS (GitHub Actions)

Expo podporuje [EAS Build s GitHubem](https://docs.expo.dev/build/setup/).

---

## Shrnutí – doporučený postup

1. Přidat ikony do `assets/`
2. Spustit `eas login` a `eas build:configure`
3. **Pro Play Store:**
   - `eas build --platform android --profile production`
   - Zřídit Google Play Developer účet
   - Vytvořit aplikaci, vyplnit údaje, nahrát AAB
4. **Pro web:**
   - `eas build --platform android --profile preview`
   - Nahrát APK na web
   - Připravit stránku pro stažení s krátkým návodem
5. Při aktualizacích zvyšovat `version` a `versionCode` v `app.json`

---

*Pro podrobnější informace viz [Expo EAS Build](https://docs.expo.dev/build/introduction/) a [Google Play Console nápověda](https://support.google.com/googleplay/android-developer).*
