import bcrypt from "bcrypt";

export const hash = async ({
  plaintext = "",
  saltRound = Number(process.env.SALT),
} = {}) => {
  return await bcrypt.hash(plaintext, saltRound);
};

export const compare = async ({ plaintext = "", hash = "" } = {}) => {
  return await bcrypt.compare(plaintext, hash);
};

/**
 * $2b$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa
 |  |  |                     |
 |  |  |                     hash-value = K0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa
 |  |  |
 |  |  salt = nOUIs5kJ7naTuTFkBy1veu
 |  |
 |  cost-factor => 10 = 2^10 rounds
 |
 hash-algorithm identifier => 2b = BCrypt
 */
