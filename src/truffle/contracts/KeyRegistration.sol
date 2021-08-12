pragma solidity ^0.5.0;

contract KeyRegistration {
    struct PreKey {
        string preKeyId;
        string preKeyPub;
        bool isUsed;
    }
    struct KeyBundle {
        string keyId;
        string userId;
        string idPublicKey;
        string preKeyPub;
        string signedPreKeyPub;
        string signature;
    }

    mapping(address => KeyBundle) public keyBundles;

    event KeyBundleRegistered(
        address indexed ownerAddress,
        string indexed keyId,
        string indexed userId
    );
    event KeyBundleRevoked(address indexed ownerAddress);

    function createKeyBundle(
        string memory keyId,
        string memory userId,
        string memory idPublicKey,
        string memory preKeyPub,
        string memory signedPreKeyPub,
        string memory signature
    ) public {
        // uint256 keyBundleId = keyBundles.length;

        keyBundles[msg.sender] = KeyBundle({
            keyId: keyId,
            userId: userId,
            idPublicKey: idPublicKey,
            preKeyPub: preKeyPub,
            signedPreKeyPub: signedPreKeyPub,
            signature: signature
        });

        emit KeyBundleRegistered(msg.sender, keyId, userId);
        // return keyBundleId;
    }

    function getKeyBundle(address owner)
        public
        view
        returns (
            string memory keyId,
            string memory userId,
            string memory idPublicKey,
            string memory preKeyPub,
            string memory signedPreKeyPub,
            string memory signature
        )
    {
        KeyBundle storage keyBundle = keyBundles[owner];

        keyId = keyBundle.keyId;
        userId = keyBundle.userId;
        idPublicKey = keyBundle.idPublicKey;
        preKeyPub = keyBundle.preKeyPub;
        signedPreKeyPub = keyBundle.signedPreKeyPub;
        signature = keyBundle.signature;
    }
}
