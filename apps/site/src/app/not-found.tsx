import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="site-container not-found">
      <span className="eyebrow">404 / A LOOSE THREAD</span>
      <h1>
        This page has
        <br />
        wandered off.
      </h1>
      <p>Let’s get you back to familiar ground.</p>
      <Link className="site-button site-button-primary" href="/">
        Back to Quilt
      </Link>
    </main>
  );
}
