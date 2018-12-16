const { FuseBox, WebIndexPlugin, QuantumPlugin, JSONPlugin, ImageBase64Plugin, EnvPlugin, SVGPlugin, TerserPlugin, CopyPlugin } = require("fuse-box")
const { src, task, context } = require('fuse-box/sparky')
const fs = require('fs-extra')

context(
  class {
    getConfig() {
      return FuseBox.init({
        homeDir: "./src",
        output: 'dist/$name.js',
        sourceMaps: true,
        useTypescriptCompiler : true,
        plugins: [
          WebIndexPlugin({
            template: 'src/index.html',
          })
        ],
      })
    }
  }
)

task('default', async context => {
  const fuse = context.getConfig()

  fuse
    .dev({ fallback: 'index.html' })

  fuse
    .bundle('public/vendor')
    .instructions("~index.ts")
    .target('browser')

  fuse
    .bundle("public/client")
    .instructions(">[index.ts]")
    .target('browser')
    .hmr()
    .watch()

  await fuse.run()
})

task('clean', () =>
  src('./dist').clean('./dist')
)

task('dist', [ 'clean' ], async context => {
  context.isProduction = true
  // fs.copySync('src/404.html', 'dist/404.html')

  const fuse = context.getConfig()
  
  fuse
    .bundle('app')
    .instructions('>index.ts')
  
  await fuse.run()
})
