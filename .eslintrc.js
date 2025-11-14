module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'prettier/prettier': 0, // 👈 desativa os avisos do prettier
    "react-hooks/exhaustive-deps": "off",
    "eslint.enable": false
  },
};
