module.exports = {
    "parser":       "babel-eslint",
    "globals":      {
        "angular": 1
    },
    "rules":        {
        "quotes":          [
            2,
            "single"
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "semi":            [
            2,
            "always"
        ]
    },
    "env":          {
        "node":     true,
        "browser":  true,
        "es6":      true,
        "commonjs": true,
        "amd":      true,
        "jest":     true,
        "mocha":    true,
        "jquery":   true
    },
    "extends":      "eslint:recommended",
    "ecmaFeatures": {
        "jsx":                          true,
        "experimentalObjectRestSpread": true
    },
    "plugins":      [
        "react"
    ]
};
