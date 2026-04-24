export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256", 
    },
    true, 
    ["sign", "verify"]
  );
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", key);
  const exportedAsString = String.fromCharCode.apply(null, Array.from(new Uint8Array(exported)));
  return btoa(exportedAsString);
}

export async function signPayload(message: string, privateKey: CryptoKey): Promise<string> {
  const enc = new TextEncoder();
  const signature = await crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: {name: "SHA-256"},
    },
    privateKey,
    enc.encode(message)
  );
  
  const exportedAsString = String.fromCharCode.apply(null, Array.from(new Uint8Array(signature)));
  return btoa(exportedAsString);
}

export async function verifySignature(message: string, signatureBase64: string, publicKeyBase64: string): Promise<boolean> {
    try {
        const enc = new TextEncoder();
        
        // Import public key
        const binaryDerString = window.atob(publicKeyBase64);
        const binaryDer = new Uint8Array(binaryDerString.length);
        for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
        }
        
        const publicKey = await crypto.subtle.importKey(
            "spki",
            binaryDer.buffer,
            { name: "ECDSA", namedCurve: "P-256" },
            true,
            ["verify"]
        );

        // Decode signature
        const binarySigString = window.atob(signatureBase64);
        const binarySig = new Uint8Array(binarySigString.length);
        for (let i = 0; i < binarySigString.length; i++) {
            binarySig[i] = binarySigString.charCodeAt(i);
        }

        return await crypto.subtle.verify(
            {
                name: "ECDSA",
                hash: { name: "SHA-256" },
            },
            publicKey,
            binarySig.buffer,
            enc.encode(message)
        );
    } catch (e) {
        return false;
    }
}
