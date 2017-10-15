# vi_starter
### A starter WP Theme with Gulp

**Introduction**

This is a starter WordPress theme, it's based on a very stripped-down **_s** theme and adds a convenient development & build process using Gulp task runner. To make this your own, please refer to the  [_s Getting Started](https://github.com/automattic/_s#getting-started) section and use `vi_starter` instead of `_s` when performing find & replace.

**IMPORTANT** This starter theme is intended as a starter theme for building client websites with WordPress. If you wanted to build themes for WP repo or the marketplace, I would recommend bringing back some of the starter functionality that I have stripped out eg. various customizer functions etc. 

**Instructions**

1. Clone the repository into you `wp-content/themes` directory
2. `cd`  into the repository and run the install command (`npm install` or `yarn install`).
3. After all the packages have been pulled, run `gulp` command to build out the files
4. Visit the localhost URL of your project.
5. To efficiently develop, run `grunt serve` this will setup browserSync, and watch for changes amongst `scss` and `js` files. (*NOTE:* You may have to change your localhost URL inside of the *browserSync* task in `gulpfile.js`
6. The default gulp task is a build task that will compile everything and then package your production-ready theme inside the `dist` folder. 

### Packages used

- Gulp
- gulp-concat
- gulp-uglify
- gulp-rename
- gulp-sass
- gulp-sourcemaps
- gulp-cssnano
- gulp-babel
- del
- browser-sync
