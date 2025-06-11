// hash.js
const bcrypt = require('bcrypt');

const password = process.argv[2]; // récupère le mot de passe depuis les arguments

if (!password) {
  console.error('Usage: node hash.js <mot_de_passe>');
  process.exit(1);
}

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('Mot de passe hashé :', hash);
  })
  .catch(err => {
    console.error('Erreur :', err);
  });
