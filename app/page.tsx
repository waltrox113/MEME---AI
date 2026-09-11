"use client";

import { useState } from "react";

type Meme = {
  caption: string;
  format: string;
  reason: string;
  score: number;
  trend: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");

  function selectFile(next: File | undefined) {
    if (!next) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(next.type)) {
      setError("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (next.size > 10 * 1024 * 1024) {
      setError("Please choose an image smaller than 10 MB.");
      return;
    }
    setError("");
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setMemes([]);
    setAnalysis(null);
  }

  async function generate() {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch("/api/generate", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Meme generation failed.");
      setAnalysis(data.analysis);
      setMemes(data.memes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="badge">AI MEME ENGINE • V1</div>
        <h1>Give it a picture.<br /><span>Get a meme.</span></h1>
        <p>Upload an image and let Meme AI understand the expression, context and comedic angle before writing the joke.</p>
      </section>

      <section className="workspace">
        <div
          className="upload"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); selectFile(e.dataTransfer.files?.[0]); }}
        >
          {preview ? <img src={preview} alt="Uploaded preview" /> : <div className="drop-content">
            <div className="upload-icon">＋</div>
            <h2>Drop an image here</h2>
            <p>or choose one from your computer</p>
          </div>}
          <input aria-label="Upload image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => selectFile(e.target.files?.[0])} />
        </div>

        <div className="controls">
          <button className="primary" disabled={!file || loading} onClick={generate}>
            {loading ? "Analyzing & creating…" : "Generate memes"}
          </button>
          <p className="hint">JPG, PNG or WEBP • Max 10 MB</p>
          {error && <div className="error">{error}</div>}
        </div>

        {analysis && <div className="analysis">
          <div><small>EXPRESSION</small><strong>{analysis.expression}</strong></div>
          <div><small>MOOD</small><strong>{analysis.mood}</strong></div>
          <div><small>CONTEXT</small><strong>{analysis.context}</strong></div>
          <div><small>MEME POTENTIAL</small><strong>{analysis.comedic_potential}/100</strong></div>
        </div>}

        {memes.length > 0 && <section className="results">
          <div className="section-head"><div><small>YOUR MEME IDEAS</small><h2>Pick your weapon.</h2></div></div>
          <div className="grid">
            {memes.map((m, i) => (
              <article className="card" key={i}>
                <div className="card-top"><span>#{i + 1}</span><span>{m.format}</span></div>
                <h3>“{m.caption}”</h3>
                <p>{m.reason}</p>
                <div className="score"><b>{m.score}</b>/100 <span>{m.trend}</span></div>
                <button className="secondary" onClick={() => navigator.clipboard?.writeText(m.caption)}>Copy caption</button>
              </article>
            ))}
          </div>
        </section>}
      </section>
    </main>
  );
}