pragma solidity ^0.5.0;

contract KeyRegistration {
    // struct PreKey {
    //     string preKeyId;
    //     string preKeyPub;
    //     bool isUsed;
    // }

    struct KeyBundle {
        string keyId;
        string userId;
        string idPublicKey;
        // PreKey[] preKeys;
        string preKeyPub;
        string signedPreKeyPub;
        string signature;
        string userSign;
        // bool isUsed;
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
        string memory signature,
        string memory userSign
    ) public {
        keyBundles[msg.sender] = KeyBundle({
            keyId: keyId,
            userId: userId,
            idPublicKey: idPublicKey,
            preKeyPub: preKeyPub,
            signedPreKeyPub: signedPreKeyPub,
            signature: signature,
            userSign: userSign
        });

        emit KeyBundleRegistered(msg.sender, keyId, userId);
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
            string memory signature,
            string memory userSign
        )
    {
        KeyBundle storage keyBundle = keyBundles[owner];
        // uint256 len = keyBundle.preKeys.length;
        // PreKey memory preKey;
        // for (uint256 i = 0; i < len; i++) {
        //     if (!keyBundle.preKeys[i].isUsed) {
        //         preKey = keyBundle.preKeys[i];
        //         keyBundles[owner].preKeys[i].isUsed = true;
        //         // keyBundle.preKeys[i].isUsed = true;
        //         // keyBundles[owner] = keyBundle;
        //         break;
        //     }
        // }

        keyId = keyBundle.keyId;
        userId = keyBundle.userId;
        idPublicKey = keyBundle.idPublicKey;
        preKeyPub = keyBundle.preKeyPub;
        signedPreKeyPub = keyBundle.signedPreKeyPub;
        signature = keyBundle.signature;
        userSign = keyBundle.userSign;
        // isUsed = keyBundle.isUsed;
    }

    function revokeKeyBundle(address owner) public {
        keyBundles[owner].keyId = "";
        emit KeyBundleRevoked(owner);
    }

    function isRegistered(address owner) public view returns (bool) {
        bytes memory temp = bytes(keyBundles[owner].keyId);
        if (temp.length == 0) {
            return false;
        }
        return true;
        // PreKey[] memory preKeys = keyBundles[owner].preKeys;
        // uint256 len = preKeys.length;
        // for (uint256 i = 0; i < len; i++) {
        //     if (!preKeys[i].isUsed) {
        //         return true;
        //     }
        // }
        // return false;
    }
}
