module.exports = {
    runtimeCompiler: true,
    productionSourceMap: false,
    publicPath: process.env.NODE_ENV === 'production'
        ? './'
        : '/',
    devServer: {
        disableHostCheck: true,
        proxy: {
            '/dep': {
                target:  'http://localhost:3000',
                secure: false,
            },
            '/list': {
                target:  'http://localhost:3000',
                secure: false,
            },
            '/logs': {
                target:  'http://localhost:3000',
                secure: false,
            },
            '/ns': {
                target:  'http://localhost:3000',
                secure: false,
            },
            '/ws': {
                target:  'ws://localhost:3000',
                secure: false,
                ws: true
            },
        }
    },
}
