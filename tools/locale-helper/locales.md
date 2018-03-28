# `locale-helper`
The `locale-helper` tool will generate locales for the app.
To generate locales you need to run `npm run build-locales`. Locales will be
generated in `app/translations` directory. They will be sorted automatically.

To add a new word for i18n add it to `locale-template.json` and run
`npm run build-locales` to add a new word to all the files. Be sure to add
the entry alphabetically sorted to avoid merge conflicts in the template.

## Customizing
To customize locales generated, you can create custom locales and put them
in the `custom-locales` folder as `${locale}.js` or as a json file. If its a
javascript file make sure its returns an object or it will be ignored. The locale
in file name must be valid abbreviated locale from `supported-locales.js` file
(eg. `en.js` or `dl.json` are valid file names).
