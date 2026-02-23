---
name: i18n-localization
description: Internationalization and localization patterns for multi-language applications — translation key management, locale configuration, date/number formatting, RTL support, and framework-specific i18n setups (next-intl, react-i18next, vue-i18n, Flask-Babel).
---

# Internationalization & Localization Patterns

Build multi-language applications with scalable translation workflows and locale-aware formatting.

## When to Activate

- Setting up i18n in a new project
- Adding a new language/locale to an existing app
- Managing translation keys and message catalogs
- Implementing date, number, or currency formatting per locale
- Adding RTL (right-to-left) language support
- Reviewing i18n implementation for completeness
- Migrating from hardcoded strings to i18n

## Core Principles

1. **Never hardcode user-facing strings** — all text goes through the translation system
2. **Translation keys are structured** — use dot-notation namespaces (`auth.login.title`, not `loginTitle`)
3. **Locale data lives in JSON/YAML** — not in code, not in databases (unless dynamic content)
4. **ICU MessageFormat for plurals** — use `{count, plural, one {# item} other {# items}}` instead of ternary
5. **Locale detection is layered** — URL → cookie → Accept-Language header → default

## Translation Key Management

### Key Naming Convention

```
namespace.context.element
```

```json
{
  "auth": {
    "login": {
      "title": "Sign In",
      "email_label": "Email Address",
      "password_label": "Password",
      "submit": "Sign In",
      "forgot_password": "Forgot your password?",
      "error": {
        "invalid_credentials": "Invalid email or password",
        "account_locked": "Account locked. Try again in {minutes} minutes."
      }
    },
    "register": {
      "title": "Create Account",
      "success": "Welcome, {name}! Your account has been created."
    }
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading...",
    "error": {
      "generic": "Something went wrong. Please try again.",
      "network": "Network error. Check your connection."
    }
  }
}
```

### Plural and Gender Handling (ICU MessageFormat)

```json
{
  "cart": {
    "item_count": "{count, plural, =0 {No items} one {# item} other {# items}} in your cart",
    "shipping": "{method, select, express {Express (1-2 days)} standard {Standard (5-7 days)} other {Unknown}}"
  },
  "profile": {
    "greeting": "{gender, select, male {Mr.} female {Ms.} other {}} {name}"
  }
}
```

## Next.js with next-intl

### Project Structure

```
src/
├── i18n/
│   ├── request.ts          # Server-side i18n config
│   └── routing.ts          # URL-based locale routing
├── messages/
│   ├── en.json
│   ├── ja.json
│   └── es.json
├── middleware.ts            # Locale detection middleware
└── app/
    └── [locale]/
        ├── layout.tsx
        └── page.tsx
```

### Configuration

```typescript
// src/i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ja", "es", "zh", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed",     // /about for default, /ja/about for others
  pathnames: {
    "/about": {
      en: "/about",
      ja: "/about",              // keep same path
      es: "/acerca",             // localized path
    },
  },
});
```

```typescript
// src/middleware.ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

### Usage in Components

```tsx
// src/app/[locale]/page.tsx
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

// Server Component
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: t("meta.title") };
}

// Client Component
export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div>
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.subtitle", { feature: "i18n" })}</p>
      <p>{t("stats.users", { count: 1000 })}</p>
    </div>
  );
}
```

## React with react-i18next

### Setup

```typescript
// src/i18n/config.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)                              // lazy-load translations
  .use(LanguageDetector)                     // detect user language
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "ja", "es", "zh", "ar"],
    ns: ["common", "auth", "dashboard"],     // namespace splitting
    defaultNS: "common",
    interpolation: { escapeValue: false },   // React already escapes
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator"],
      caches: ["cookie", "localStorage"],
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  });

export default i18n;
```

### Usage with Suspense

```tsx
import { useTranslation, Trans } from "react-i18next";
import { Suspense } from "react";

function MyComponent() {
  const { t, i18n } = useTranslation("dashboard");

  return (
    <div dir={i18n.dir()}>    {/* Automatic RTL direction */}
      <h1>{t("title")}</h1>
      <p>{t("welcome", { name: "Alice" })}</p>

      {/* Rich text with embedded components */}
      <Trans i18nKey="terms" t={t}>
        By signing up, you agree to our <a href="/terms">Terms</a> and
        <a href="/privacy">Privacy Policy</a>.
      </Trans>

      {/* Language switcher */}
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        {["en", "ja", "es"].map((lng) => (
          <option key={lng} value={lng}>{lng.toUpperCase()}</option>
        ))}
      </select>
    </div>
  );
}

// Wrap with Suspense for lazy-loaded translations
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyComponent />
    </Suspense>
  );
}
```

## Date, Number, and Currency Formatting

### Use Intl API (Not Libraries)

```typescript
// src/utils/formatters.ts

export function formatDate(date: Date, locale: string, style: "short" | "long" = "long") {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: style,
    timeStyle: style === "long" ? "short" : undefined,
  }).format(date);
}

export function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatCurrency(amount: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatRelativeTime(date: Date, locale: string) {
  const diff = date.getTime() - Date.now();
  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(days) >= 1) return rtf.format(days, "day");
  if (Math.abs(hours) >= 1) return rtf.format(hours, "hour");
  if (Math.abs(minutes) >= 1) return rtf.format(minutes, "minute");
  return rtf.format(seconds, "second");
}
```

### Usage Output Examples

```
formatDate(new Date(), "en-US")       → "February 23, 2026 at 12:00 PM"
formatDate(new Date(), "ja-JP")       → "2026年2月23日 12:00"
formatCurrency(1234.5, "en-US", "USD") → "$1,234.50"
formatCurrency(1234.5, "ja-JP", "JPY") → "￥1,235"
formatRelativeTime(yesterday, "en")    → "yesterday"
formatRelativeTime(yesterday, "ja")    → "昨日"
```

## RTL (Right-to-Left) Support

### CSS Logical Properties

```css
/* DON'T: physical properties */
.card {
  margin-left: 16px;
  padding-right: 8px;
  text-align: left;
  border-left: 2px solid blue;
}

/* DO: logical properties — auto-flip for RTL */
.card {
  margin-inline-start: 16px;
  padding-inline-end: 8px;
  text-align: start;
  border-inline-start: 2px solid blue;
}
```

### Tailwind CSS RTL

```tsx
// tailwind.config.js — enable RTL plugin
module.exports = {
  plugins: [require("tailwindcss-rtl")],
};

// Component with RTL-aware classes
function Sidebar() {
  return (
    <aside className="ms-4 ps-2 border-s-2 text-start">
      {/* ms = margin-start, ps = padding-start, border-s = border-start */}
      <nav>{/* ... */}</nav>
    </aside>
  );
}
```

### Auto-Direction Detection

```tsx
function LocaleProvider({ children, locale }) {
  const dir = ["ar", "he", "fa", "ur"].includes(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body className={dir === "rtl" ? "font-arabic" : "font-sans"}>
        {children}
      </body>
    </html>
  );
}
```

## Translation Workflow Automation

### Extract Keys Script

```bash
#!/bin/bash
# extract-keys.sh — find untranslated strings
# Run: ./extract-keys.sh src/ messages/en.json

SRC_DIR=$1
LOCALE_FILE=$2

echo "=== Searching for hardcoded strings ==="

# Find JSX text content not wrapped in t()
grep -rn --include="*.tsx" --include="*.jsx" \
  -E '>[A-Z][a-z]+(\s+[a-z]+){2,}<' "$SRC_DIR" \
  | grep -v '{t(' \
  | grep -v '// i18n-ignore'

echo ""
echo "=== Keys used in code but missing from locale file ==="

# Extract all t("key") calls
grep -roh --include="*.ts" --include="*.tsx" \
  't(["'"'"'][^"'"'"']*["'"'"'])' "$SRC_DIR" \
  | sed -E 's/t\(["'"'"']([^"'"'"']*)["'"'"']\)/\1/' \
  | sort -u \
  | while read key; do
    if ! jq -e ".$key" "$LOCALE_FILE" > /dev/null 2>&1; then
      echo "MISSING: $key"
    fi
  done
```

### CI Translation Check

```yaml
# .github/workflows/i18n-check.yml
name: i18n Completeness Check
on: [pull_request]

jobs:
  check-translations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check translation completeness
        run: |
          BASE="messages/en.json"
          ERRORS=0

          for file in messages/*.json; do
            [ "$file" = "$BASE" ] && continue
            LANG=$(basename "$file" .json)

            MISSING=$(jq -r --argfile base "$BASE" --argfile target "$file" -n '
              [$base | paths(scalars)] - [$target | paths(scalars)]
              | .[] | join(".")
            ')

            if [ -n "$MISSING" ]; then
              echo "::error::Missing keys in $LANG: $MISSING"
              ERRORS=$((ERRORS + 1))
            fi
          done

          [ $ERRORS -eq 0 ] || exit 1
```

## Python (Flask-Babel / Django)

### Flask-Babel Setup

```python
# app/i18n.py
from flask import Flask, request
from flask_babel import Babel, gettext as _, lazy_gettext as _l

def get_locale():
    # 1. Check URL parameter
    # 2. Check session
    # 3. Check Accept-Language header
    return request.accept_languages.best_match(["en", "ja", "es", "zh"])

babel = Babel()

def init_i18n(app: Flask):
    babel.init_app(app, locale_selector=get_locale)
```

### Django i18n

```python
# settings.py
LANGUAGE_CODE = "en"
LANGUAGES = [
    ("en", "English"),
    ("ja", "日本語"),
    ("es", "Español"),
    ("zh-hans", "简体中文"),
    ("ar", "العربية"),
]
USE_I18N = True
USE_L10N = True
LOCALE_PATHS = [BASE_DIR / "locale"]

# urls.py
from django.conf.urls.i18n import i18n_patterns

urlpatterns = i18n_patterns(
    path("", include("app.urls")),
    prefix_default_language=False,
)
```

```python
# views.py
from django.utils.translation import gettext as _, ngettext

def cart_view(request):
    count = get_cart_count(request.user)
    message = ngettext(
        "You have %(count)d item in your cart.",
        "You have %(count)d items in your cart.",
        count,
    ) % {"count": count}
    return render(request, "cart.html", {"message": message})
```

## i18n Checklist

Before shipping to a new locale:

- [ ] All user-facing strings extracted to translation files
- [ ] Pluralization uses ICU MessageFormat (not ternary/if-else)
- [ ] Date/number/currency formatted with `Intl` API or equivalent
- [ ] RTL tested if adding Arabic, Hebrew, Farsi, or Urdu
- [ ] CSS uses logical properties (`margin-inline-start`, not `margin-left`)
- [ ] Images with text have locale-specific alternatives
- [ ] Form validation messages are translated
- [ ] Error messages from API are translated or have fallbacks
- [ ] SEO: `hreflang` tags, localized `<title>` and `<meta description>`
- [ ] CI checks translation file completeness
- [ ] No string concatenation for translated text (use interpolation)
- [ ] Text expansion tested (German/Finnish text can be 30-40% longer than English)
