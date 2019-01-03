module.exports = {
    "env": {
        "browser": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
				"padded-blocks": [
					"error",
					"never"
				],
        // "quotes": [
        //     "error",
        //     "double"
        // ],
        "semi": [
            "error",
            "always"
        ]
    }
};
