import resolve from "rollup-plugin-node-resolve";
import uglify from "rollup-plugin-uglify";
import {minify} from "uglify-es";

export default {
  entry: './src/main.js',
  dest: './MyApp/static/js/MyScript.js',
  format: 'es',
  plugins: [
    resolve(),
    uglify({}, minify)
  ]
};
