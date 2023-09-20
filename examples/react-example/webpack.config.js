const path = require('path');

module.exports = {
  entry: './index.js',
  mode: "development",
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public'),
  },
  devServer: {
    port: "9600",
    static: ["./public"],
    open: true,
    hot: true ,
    liveReload: true
  },
  resolve: {
    extensions: ['.js','.jsx','.json'] 
  },
  module:{
    rules: [
      {
        test: /\.(js|jsx)$/,    //kind of file extension this rule should look for and apply in test
        exclude: /node_modules/, //folder to be excluded
        use:  'babel-loader' //loader which we are going to use
      }
    ]
  }
};