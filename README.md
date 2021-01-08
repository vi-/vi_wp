# vi_wp
### Modern WordPress workflow with Webpack

**Introduction**

This is a starter WordPress theme, it's based on a very stripped-down **_s** theme and adds a convenient development & build process using Webpack. To make this your own, please refer to the  [_s Getting Started](https://github.com/automattic/_s#getting-started) section and use `vi_wp` instead of `_s` when performing find & replace.

**IMPORTANT** This starter theme is intended as a starter theme for building client websites with WordPress. If you wanted to build themes for WP repo or the marketplace, I would recommend bringing back some of the starter functionality that I have stripped out eg. various customizer functions etc. 

**Instructions**

1. Clone the repository into you `wp-content/themes` directory
2. `cd`  into the repository and run the install command (`npm install` or `yarn install`).
3. After all the packages have been installed, swap out the proxy URL on line `80` of `src/config/webpack.config.js` to your local url. 
4. You can run (`npm start` or `yarn start`) in order to run in development mode, and run (`npm build` or `yarn build`) when ready for production.

**IMPORTANT:** Do not manually modify anything inside the /assets/ folder. All the code there is generated by Webpack.