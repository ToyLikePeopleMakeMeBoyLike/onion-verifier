'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [shortUrl, setShortUrl] = useState('');
  const [err, setErr] = useState('');

  async function verify(e) {
    e.preventDefault();
    setErr(''); setFeedback(null); setShortUrl('');
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const json = await res.json();
      if (json.error) setErr(json.error);
      else if (!json.valid) setFeedback(false);
      else {
        setFeedback(true);
        setShortUrl(json.shortUrl);
      }
    } catch {
      setErr('Network error – please try again');
    }
  }

  return (
    <main style={{ width: '100%', maxWidth: 500 }}>
      {/* Onion-layer animation */}
      <div className="onion-loader">
        <div className="ring"></div>
        <div className="ring"></div>
        <div className="ring"></div>
      </div>

      <h1 style={{ textAlign: 'center' }}>.onion Verifier & Shortener</h1>
      <form onSubmit={verify}>
        <input
          type="text"
          placeholder="e.g. exampleabcd1234.onion"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button type="submit">Check & Shorten</button>
      </form>

      {err && <p style={{ color: '#f44336' }}>{err}</p>}

      {feedback === false && (
        <p style={{ color: '#f44336', marginTop: '1rem' }}>
          ❌ Invalid .onion URL
        </p>
      )}

      {feedback === true && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ color: 'var(--tor-green)' }}>✔️ Valid .onion URL</p>
          <p>
            Short link:{' '}
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
          </p>
        </div>
      )}
    </main>
  );
}
