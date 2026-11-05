import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  Check,
  Coins,
  HeartHandshake,
  Layers3,
  MoveUpRight,
} from 'lucide-react';
import { Brand } from '@/components/brand';
import { ProductPreview } from '@/components/product-preview';

export default function LandingPage() {
  return (
    <>
      <main id="main-content">
        <section
          className="landing-hero site-container"
          aria-labelledby="hero-title"
        >
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="status-dot" /> A NEW CHAPTER FOR SHARED MONEY
            </span>
            <h1 id="hero-title">
              Life is shared.
              <br />
              Your money can
              <br />
              feel that way, too.
            </h1>
            <p className="hero-description">
              Groceries, the bills, that little getaway. Quilt is taking shape
              as one calm place for the money you manage together.
            </p>
            <div className="hero-actions">
              <Link className="site-button site-button-primary" href="/docs">
                Meet Quilt <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className="site-text-link" href="/docs/project-status">
                Follow the build <MoveUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
            <p className="hero-note">
              <span className="status-dot" /> In development · Built for couples
              and households
            </p>
          </div>
          <div className="hero-art">
            <div className="art-label">
              <span>ONE HOUSEHOLD. A SHARED PICTURE.</span>
              <span>01 / QUILT</span>
            </div>
            <ProductPreview />
            <p className="preview-caption">
              A glimpse of the idea. An illustrative preview, with sample data.
            </p>
          </div>
        </section>
        <div className="site-container hero-bottom">
          <span>A little clarity goes a long way.</span>
          <a href="#the-idea" className="site-text-link">
            Get to know Quilt <ArrowDown size={15} aria-hidden="true" />
          </a>
        </div>
        <section
          id="the-idea"
          className="idea-section site-container"
          aria-labelledby="idea-title"
        >
          <div className="section-intro">
            <span className="eyebrow">MONEY, WITH MORE UNDERSTANDING</span>
            <h2 id="idea-title">
              Less keeping track.
              <br />
              More being on the same page.
            </h2>
            <p>
              A shared life has a lot of moving parts. We’re building Quilt
              around the everyday conversations that help bring them together.
            </p>
          </div>
          <div className="idea-grid">
            <article>
              <span className="feature-icon">
                <Layers3 size={23} aria-hidden="true" />
              </span>
              <span className="feature-number">01 / EVERYDAY</span>
              <h3>
                The whole month,
                <br />
                in one picture.
              </h3>
              <p>
                Spending, monthly plans, and upcoming bills, designed to make
                the day-to-day easier to understand.
              </p>
            </article>
            <article>
              <span className="feature-icon">
                <HeartHandshake size={23} aria-hidden="true" />
              </span>
              <span className="feature-number">02 / TOGETHER</span>
              <h3>
                A household.
                <br />
                Not a single-player game.
              </h3>
              <p>
                A shared workspace with owners, editors, and viewers, so
                everyone has the right place in the picture.
              </p>
            </article>
            <article>
              <span className="feature-icon">
                <Coins size={23} aria-hidden="true" />
              </span>
              <span className="feature-number">03 / WHAT’S NEXT</span>
              <h3>
                Space for the plans
                <br />
                you’re making.
              </h3>
              <p>
                Yearly goals and accounts in different currencies are part of
                the model we’re shaping from the start.
              </p>
            </article>
          </div>
        </section>
        <section
          className="building-section site-container"
          aria-labelledby="building-title"
        >
          <div>
            <span className="eyebrow">THOUGHTFUL FROM THE START</span>
            <h2 id="building-title">
              Good foundations.
              <br />
              Room to grow.
            </h2>
            <p>
              Quilt is early in its journey. The design system and household
              finance model are in place. Real accounts and stored financial
              activity come next.
            </p>
            <Link href="/docs/project-status" className="site-text-link">
              See what exists today <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="building-note">
            <span className="note-kicker">THE QUILT APPROACH</span>
            <ul>
              <li>
                <Check size={17} aria-hidden="true" /> A shared picture, with
                clear permissions
              </li>
              <li>
                <Check size={17} aria-hidden="true" /> Original currencies kept
                intact
              </li>
              <li>
                <Check size={17} aria-hidden="true" /> Review before a receipt
                becomes an expense
              </li>
            </ul>
            <p>
              Some of these are design principles and planned workflows. Our
              documentation distinguishes working foundations from what is still
              being built.
            </p>
          </div>
        </section>
        <section className="closing-section site-container">
          <span className="eyebrow">A LITTLE MORE TOGETHER</span>
          <h2>
            Make room for
            <br />
            what matters.
          </h2>
          <p>Start with the idea. Explore how it’s coming together.</p>
          <Link className="site-button site-button-primary" href="/docs">
            Explore the documentation{' '}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>
      </main>
      <footer className="site-footer site-container">
        <Link href="/" aria-label="Quilt home">
          <Brand />
        </Link>
        <span>A calmer picture of the money you share.</span>
        <div>
          <Link href="/docs">Documentation</Link>
          <Link href="/docs/project-status">Project status</Link>
        </div>
      </footer>
    </>
  );
}
