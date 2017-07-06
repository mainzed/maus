module.exports = {
  "env": {
    "browser": false,
    "node": true,
    "mocha": true
  },
  "extends": "standard",
  "plugins": [
    "standard",
    "promise"
  ],

  "rules": {
    // enforce spaces in curly braces
    "object-curly-spacing": [2, "always"],

    // use const if variable is never re-asigned
    "prefer-const": ["error", {
        "destructuring": "any",
        "ignoreReadBeforeAssign": false
    }]
  }
}
