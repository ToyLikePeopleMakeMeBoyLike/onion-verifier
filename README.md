# Onion Verifier & Shortener with End-to-End Encryption

A Next.js full-stack application to verify and shorten `.onion` links securely. URLs are encrypted client-side with AES-GCM and only ciphertext is stored on the server, ensuring zero-knowledge link storage.

---

## Table of Contents

- [Features](#features)  
- [Directory Structure](#directory-structure)  
- [Installation](#installation)  
- [Environment Variables](#environment-variables)  
- [Usage](#usage)  
- [Encryption Flow](#encryption-flow)  
  - [Key Generation](#key-generation)  
  - [Encryption](#encryption)  
  - [Decryption](#decryption)  
- [API Routes](#api-routes)  
- [Client Redirect](#client-redirect)  
- [Security Considerations](#security-considerations)  
- [Deployment](#deployment)  
- [License](#license)  

---

## Features

- ✅ Validate v2 and v3 `.onion` addresses  
- ✅ Generate absurd camelCase slugs (e.g., `flyingCapibara`)  
- 🔒 End-to-end encryption: server stores only ciphertext  
- 🔄 Client-side decryption and redirect  
- 🧅 Tor-themed UI with onion-layer animation  

---

## Directory Structure

onion-verifier/
├── README.md
├── data/
│ └── urls.json # Server JSON store: slug → ciphertext
├── pages/
│ ├── api/
│ │ ├── verify.js # POST slug & ciphertext
│ │ └── ciphertext/
│ │ └── [slug].js # GET ciphertext by slug
│ ├── _app.js # Global CSS import
│ ├── index.js # Client encrypted form
│ └── [slug].js # Client decryption & redirect
├── public/
│ └── favicon.ico
├── styles/
│ └── globals.css # Tor color palette & animation
├── utils/
│ └── wordlists.js # Adjective & noun arrays
├── .devcontainer/
│ └── devcontainer.json
├── package.json
└── vercel.json # (optional) Vercel config

yaml
Copy
Edit

---

## Installation

```bash
git clone <your-repo-url>
cd onion-verifier
npm install
npm run dev
Environment Variables
BASE_URL (optional): override the base URL used when constructing short links (e.g. https://short.example.com).

Usage
Navigate to http://localhost:3000

On first use, a symmetric AES-GCM key is generated and saved in browser storage.

Enter your .onion URL in the form.

The client encrypts it locally and POSTs

json
Copy
Edit
{ "slug": "<generatedSlug>", "ciphertext": "<iv:encryptedData>" }
to /api/verify.

If valid, the server returns a short link, e.g.

arduino
Copy
Edit
https://yourdomain.com/flyingCapibara
Visiting that short link loads the client redirect page, fetches ciphertext, decrypts it, and redirects to the real .onion URL.

Encryption Flow
Key Generation
js
Copy
Edit
const key = await window.crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true,
  ["encrypt", "decrypt"]
);
// Store this key in IndexedDB or localStorage
Encryption
js
Copy
Edit
async function encryptUrl(plaintextUrl, key) {
  const encoder = new TextEncoder();
  const data    = encoder.encode(plaintextUrl);
  const iv      = window.crypto.getRandomValues(new Uint8Array(12));
  const cipher  = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  const b64Iv = btoa(String.fromCharCode(...iv));
  const b64Ct = btoa(String.fromCharCode(...new Uint8Array(cipher)));
  return `${b64Iv}:${b64Ct}`;
}
Decryption
js
Copy
Edit
async function decryptUrl(payload, key) {
  const [b64Iv, b64Ct] = payload.split(":");
  const iv = Uint8Array.from(atob(b64Iv), c => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(b64Ct), c => c.charCodeAt(0));
  const plain = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ct
  );
  return new TextDecoder().decode(plain);
}
API Routes
POST /api/verify
Request Body:

json
Copy
Edit
{
  "slug": "string",
  "ciphertext": "string"
}
Behavior:

Validates the .onion URL format.

Stores urls.json[slug] = ciphertext.

Returns { success: true, link: "<BASE_URL>/<slug>" } on success.

GET /api/ciphertext/[slug]
Response:

json
Copy
Edit
{ "ciphertext": "string" }
Client Redirect
The page at pages/[slug].js runs in the browser and:

Fetches the ciphertext from

bash
Copy
Edit
GET /api/ciphertext/{slug}
Decrypts it using the stored AES key.

Performs

js
Copy
Edit
window.location.href = decryptedOnionUrl;
Security Considerations
Key Management: Protect the client-side AES key (mitigate XSS risks).

Integrity: AES-GCM provides built-in authentication—tampering is detected.

HTTPS Only: Serve over HTTPS to protect ciphertext and keys in transit.

Storage: Use secure browser storage (IndexedDB > localStorage).

Deployment
Commit & push to GitHub.

Deploy with Vercel:

bash
Copy
Edit
vercel --prod
Configure custom domain and any environment variables in the Vercel dashboard.

License
This project is released under the MIT License.