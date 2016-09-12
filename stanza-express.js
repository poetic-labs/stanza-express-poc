const express = require('express')
const path = require('path');
// TODO: Replace resolve root with stanza standard for this
const resolveRoot = require('stanza-keyword-resolver');
const app = express();
const generateHTML = require('./base-html.js');

/* Stanza Express should handle all serverside convention of a typical
 * application while allowing or exposing the ability to extend or configure its
 * behavior */

class StanzaExpress {
  /* Constructor should setup the port number and do any preconfiguration
   * during this part it should also search for any plugins that depend on it
   * and pass itself to the other extensions if they are registered as
   * stanza-express or whatever keyword we choose */
  constructor() {
    this.port = 3000;
  }

  /* Register is function that is found by its dependencies and is passed an
   * instance of the class for each thing it depends on.  Currently this is only
   * webpack. */
  register(keyword, instance) {
		console.log('express', keyword, instance);
    switch(keyword) {
      case 'stanza-webpack': this.setupWebpackConfig(instance); break;
      default: console.log('nothing was found');
    }
  }

  requestCompiler(keyword, instance) {
    switch(keyword) {
      case 'stanza-webpack': this.setupCompilerHooks(instance); break;
      default: console.log('nothing was found');
    }
  }

  setupCompilerHooks(webpack) {
    webpack.clientCompiler.plugin('after-emit', (compilation, callback) => {
      callback();
      this.restart();
    });
  }

  setupWebpackConfig(webpack) {
    /* Need to setup the webpack config to work with defined convention.  This
     * should have two entry points and two created bundles that are pushed into
     * the "build" folder */
    webpack.clientConfig.entry = {
      client: './client/index.jsx',
    };

    webpack.clientConfig.output = {
      path: path.join(resolveRoot('stanza'), "build"),
      filename: "[name].entry.js",
    };

    webpack.clientConfig.resolve = {
      extensions: ['', '.js', '.jsx']
    };

    webpack.clientConfig.module = {
      loaders: [{
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['react', 'es2015']
        }
      }]
    };
  }


  run() {
    app.get('/v1', (req, res) => {
      res.status(200).send('hello')
    });

    app.get('/js', (req, res) => {
      res.sendFile(`${resolveRoot('stanza')}/build/client.entry.js`);
    });

    app.get('*', (req, res) => {
			// TODO: Add serverside rendering and clientside route validation
      res.status(200).send(generateHTML());
    });

    this.server = app.listen(this.port);
    console.log('server started on port 3000');
  }

  restart() {
    console.log('restarting stanza server');
    if (this.server) {
      this.server.close();
    }

    this.run();
  }
}

module.exports = new StanzaExpress();
