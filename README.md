# Laureate Marketplace

Static site presenting components that can be used by an example Universal University.

All code changes will be automatically deployed to [laureate-marketplace.netlify.com](https://laureate-marketplace.netlify.com).


## Getting Started

Editors handing copy in this project should look to the `*.pug` files in `src/` folder.

#### HTML

HTML content is written using [Pug template syntax](https://naltatis.github.io/jade-syntax-docs/) (formerly Jade). 

Here is an example:

```pug
.row
  .medium-12.columns
    h3 Example Header
    p Example body copy.
    p 
      a(href='example.html') Example Link
```

See also this [Pug tutorial for beginners](https://www.sitepoint.com/jade-tutorial-for-beginners/).

#### Images

Images should be uploaded to `src/assets/img` and `src/assets/img/screenshots`. 

Reference them in your templates like this:

```pug
figure
  img(src='assets/img/screenshots/ux-framework.jpg')
```

#### CSS

You can make CSS modifications in `src/assets/app.scss`.

This file uses [Sass syntax](http://blog.teamtreehouse.com/the-absolute-beginners-guide-to-sass).

[Zurb Foundation](http://foundation.zurb.com/sites/docs/grid.html) and [Font Awesome](http://fontawesome.io/icons/) are also included.


## Design Assets

Design assets are available on Dropbox:

* https://www.dropbox.com/sh/l8uhyiezazb35ei/AADat00Jku6Yj9wUbaqNf3Qoa?dl=0
* https://www.dropbox.com/sh/vf3svloe1wcmwgy/AAA_j6Npbvv79cH7WhrHyd_ha?dl=0
* https://www.dropbox.com/sh/3qraggxue93qvk5/AACfwZB3FgBMafLajYHk115ga?dl=0

Copy is available on Google Docs:

http://docs.google.com/a/gokartlabs.com/spreadsheets/d/1nR6QxzQ7atvSar-l3q8idgkl47quE4MgkigaPsLxodw



## Local Development

Local development commands:

    npm install      # installs dependencies
    npm run dev      # runs local development server at http://localhost:3000
    npm run build    # builds into ./dist folder (rarely needed)
    npm run clean    # cleans ./dist folder (rarely needed)
    git clean -dfx . # delete everything not under source control

#### Source Files

HTML is generated from [Pug](https://github.com/pugjs/pug) templates located in the `src` directory.

CSS is generated from [Sass](http://sass-lang.com) files located in `src/assets`.

CSS and Javascript are processed [Webpack](https://webpack.github.io).

#### Additional Consoles

    # Webpack debug console
    http://localhost:8080/webpack-dev-server/

    # BrowserSync console
    http://localhost:3001

#### Deployment

All commits to the `master` branch are automatically built and published at [Netlify](https://www.netlify.com).

Though rarely necessary, you can manually deploy with a Netlify account and credentials to administer the site.

    npm install -g netlify-cli
    npm run clean
    npm run build
    netlify deploy

