module.exports = function (wallaby) {
  return {
    files: [
      'server/**/*.js',
      'test/mock/*'
    ],

    tests: [
      'test/**/*.spec.js'
    ],

    compilers: {
      '**/*.js': wallaby.compilers.babel()
    },

    env: {
      type: 'node'
    }
  }
}
