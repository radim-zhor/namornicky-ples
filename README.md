# Námořnický ples – web

Web [namornicky-ples.cz](https://namornicky-ples.cz). Jedna stránka v čistém HTML a CSS, kterou zdarma publikuje GitHub Pages.

## Jak změnit údaje ročníku

Všechno, co se každý rok mění, je v souboru [`_data/rocnik.yml`](_data/rocnik.yml):
datum, ročník, kapela, počet rumů, kontakty, stav vstupenek, program, dotazy, fotky.

1. Otevři soubor na github.com a klikni na tužku (Edit).
2. Přepiš hodnotu za dvojtečkou. Text s dvojtečkou nebo začínající číslicí dej do uvozovek.
3. Klikni na **Commit changes**. Do minuty je změna na webu.

Každá změna zůstává v historii (Commits) a jde vrátit.

### Spuštění prodeje vstupenek

V `rocnik.yml` v části `vstupenky`:

```yaml
vstupenky:
  stav: prodej
  cena: "450 Kč"
  reenio_odkaz: "https://…"     # přímý odkaz na rezervaci
  reenio_vlozeni: "https://…"   # src iframe z Reenia (nepovinné)
```

`stav: brzy` ukáže „Vstupenky v prodeji již brzy“, `stav: vyprodano` ukáže „Vyprodáno“.

### Fotky

Fotky nahraj do `assets/img/galerie/` (ideálně JPG, šířka do 1600 px) a zapiš je do `galerie` v `rocnik.yml`.
Dokud je seznam prázdný, sekce Fotky se nezobrazuje.

## Soubory

| Soubor | Co obsahuje |
| --- | --- |
| `_data/rocnik.yml` | údaje ročníku |
| `index.html` | stránka a texty |
| `assets/css/styles.css` | vzhled (barvy podle brand manuálu) |
| `assets/img/` | logo, úvodní fotka, náhled pro Facebook |
| `ples.ics` | událost do kalendáře (generuje se z `rocnik.yml`) |

## Zobrazení na vlastním počítači

```sh
gem install jekyll
jekyll serve
```

Web pak běží na http://localhost:4000.
