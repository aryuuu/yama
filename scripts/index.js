const express = require('express');
const app = express();

const contract = require('./contract');

const PORT = process.env.PORT || 3005;

const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.post('/register', async (req, res) => {
  try {
    const { body } = req;
    const keyBundle = {
      keyId: body.key_id,
      userId: body.user_id,
      idPublicKey: body.id_public_key,
      preKeyPub: body.prekey_pub,
      signedPreKeyPub: body.signed_prekey_pub,
      signature: body.signature,
      userSign: body.user_sign
    }

    await contract.createKeyBundle(keyBundle, body.address)

    res.status(200).json({
      message: "Key successfully registered"
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error });
  }
});

app.all('*', (req, res) => {
  res.status(404).json({ message: 'not found' });
});

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
