import crypto from "node:crypto";
import fs from "node:fs";
const ENCRYPTION_SECERT_KEY = Buffer.from("12345678901234567890123456789012");
const IV_LENGTH = Number(process.env.IV_LENGTH);

export const encrypt = (plaintext) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECERT_KEY,
    iv
  );
  let encrypted = cipher.update(plaintext, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encryptedDate) => {
  const [ivHex, cipherText] = encryptedDate.split(":");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECERT_KEY,
    iv
  );
  let decrypted = decipher.update(cipherText, "hex", "utf-8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

if (fs.existsSync("public_key.pem") && fs.existsSync("private_key.pem")) {
  console.log("Key Already Exists");
} else {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "pkcs1", format: "pem" },
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
  });
  fs.writeFileSync("public_key.pem", publicKey);
  fs.writeFileSync("private_key.pem", privateKey);
}

export const asymmetricEncrypt = (plainText) => {
  const bufferedText = Buffer.from(plainText, "utf8");

  const encryptedData = crypto.publicEncrypt(
    {
      key: fs.readFileSync("public_key.pem", "utf8"),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    bufferedText
  );

  return encryptedData.toString("hex");
};

export const asymmetricDecrypt = (cipherText) => {
  const bufferedCipherText = Buffer.from(cipherText, "hex");

  const decryptedData = crypto.privateDecrypt(
    {
      key: fs.readFileSync("private_key.pem", "utf8"),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    bufferedCipherText
  );

  return decryptedData.toString("utf8");
};
