# vi_starter
### A starter WP Theme with Gulp

*Instructions*

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
