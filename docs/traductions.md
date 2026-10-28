# Traductions · Translations

La carte parle la langue de Home Assistant : français, anglais, allemand. Toute autre langue s’affiche en anglais.
The card follows Home Assistant's language: French, English, German. Any other language is shown in English.

## Améliorer un texte · Improve a text

Vous n’avez pas besoin de connaître git ni de compiler quoi que ce soit.
You do not need to know git or to build anything.

1. Ouvrez le fichier de votre langue sur GitHub · Open the file for your language on GitHub:
   - Anglais · English: [`card/src/i18n/en.ts`](../card/src/i18n/en.ts)
   - Allemand · German: [`card/src/i18n/de.ts`](../card/src/i18n/de.ts) (carte · card) et [`custom_components/niak_weather/engine/i18n_de.py`](../custom_components/niak_weather/engine/i18n_de.py) (bulletin, événements, mesures · bulletin, events, measurements) et [`custom_components/niak_weather/translations/de.json`](../custom_components/niak_weather/translations/de.json) (fenêtres d’installation et de configuration · setup and options dialogs)
2. Cliquez sur le crayon (Edit) · Click the pencil (Edit). GitHub crée une copie à votre nom · GitHub makes a copy under your name.
3. Corrigez ce qui est **à droite des deux-points** · Change only what is **on the right of the colon**:
   ```ts
   'Pluie': 'Regen',      // left: French source (do not change) · right: your language
   ```
4. Gardez tels quels les mots entre accolades, comme `{place}` ou `{speed}` · Keep the words between braces, like `{place}` or `{speed}`, exactly as they are.
5. Cliquez sur **Commit changes… → Propose changes**, puis **Create pull request** · Click **Commit changes… → Propose changes**, then **Create pull request**.

Le mainteneur relit et fusionne. Les tests vérifient qu’aucun texte ne manque et que les `{noms}` sont intacts.
The maintainer reviews and merges. The tests check that no text is missing and that the `{names}` are intact.

Pas à l’aise avec GitHub ? Écrivez les corrections dans l’[issue #7](https://github.com/Niakman13/niak-weather-integration/issues/7) : le mainteneur les reporte.
Not comfortable with GitHub? Post your corrections in [issue #7](https://github.com/Niakman13/niak-weather-integration/issues/7) and the maintainer will apply them.

## Ajouter une langue · Add a language

1. Copiez `card/src/i18n/en.ts` en `card/src/i18n/xx.ts` (`xx` = code de la langue, par exemple `nl`) · Copy `en.ts` to `xx.ts`.
2. Traduisez les valeurs · Translate the values.
3. Dans `card/src/i18n.ts`, importez le dictionnaire et ajoutez-le à `DICTIONARIES` · Import it and add it to `DICTIONARIES` in `card/src/i18n.ts`.
4. Lancez `npm run validate` dans `card/` · Run `npm run validate` in `card/`.

## Ce qui n’est pas encore traduit · Not translated yet

Les noms des capteurs (`entity` dans `translations/*.json`) et le panneau de réglages Niak (onglet Météo, en français seulement) ne sont pas encore traduits.
The sensor names (`entity` in `translations/*.json`) and the Niak settings panel (Météo tab, French only) are not translated yet.
