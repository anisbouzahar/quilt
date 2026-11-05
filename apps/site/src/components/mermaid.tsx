'use client';

import {
  useState,
  useRef,
  useEffect,
  useId,
  useMemo,
  type ReactNode,
  type CSSProperties,
} from 'react';
import { render as renderPele, mount as mountPele } from 'pele';
import { Check, Copy, Code2, Eye } from 'lucide-react';

export interface MermaidProps {
  chart?: string;
  code?: string;
  children?: ReactNode;
  codeBlock?: ReactNode;
  figureStyle?: CSSProperties;
  figureClassName?: string;
  className?: string;
  title?: string;
}

function extractChartText(
  chart?: string,
  code?: string,
  children?: ReactNode,
): string {
  if (typeof chart === 'string' && chart.trim()) return chart.trim();
  if (typeof code === 'string' && code.trim()) return code.trim();
  if (typeof children === 'string' && children.trim()) return children.trim();
  return '';
}

function highlightMermaidLine(line: string): ReactNode {
  if (line.trim().startsWith('%%')) {
    return <span className="text-fd-muted-foreground/75 italic">{line}</span>;
  }

  const parts: ReactNode[] = [];
  let keyIndex = 0;

  const tokenRegex =
    /("(?:[^"\\]|\\.)*")|(\[[^\]]*\]|\([^\)]*\)|\{[^\}]*\})|(-->|-\.->|==>|-\.[^.]*\.->|---|-->|--\s*\|[^|]*\|\s*-->)|(\b(?:flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie|gitGraph|mindmap|timeline|quadrantChart|sankey-beta|xychart-beta|LR|RL|TB|TD|BT|subgraph|end|classDef|class|style|click|note|over|participant|actor)\b)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }

    const [full, str, label, arrow, kw] = match;

    if (str) {
      parts.push(
        <span
          key={keyIndex++}
          className="text-emerald-600 dark:text-emerald-400"
        >
          {str}
        </span>,
      );
    } else if (label) {
      parts.push(
        <span key={keyIndex++} className="text-blue-600 dark:text-blue-400">
          {label}
        </span>,
      );
    } else if (arrow) {
      parts.push(
        <span
          key={keyIndex++}
          className="text-pink-600 dark:text-pink-400 font-medium"
        >
          {arrow}
        </span>,
      );
    } else if (kw) {
      parts.push(
        <span
          key={keyIndex++}
          className="text-purple-600 dark:text-purple-400 font-semibold"
        >
          {kw}
        </span>,
      );
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.length > 0 ? parts : line || ' ';
}

export function Mermaid({
  chart,
  code,
  children,
  codeBlock,
  figureStyle,
  figureClassName = '',
  className = '',
  title,
}: MermaidProps) {
  const rawChart = extractChartText(chart, code, children);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const id = useId();

  // Initial synchronous render via Pele for SSR & fast initial display
  const { initialSvg, initialError } = useMemo(() => {
    if (!rawChart) return { initialSvg: '', initialError: null };
    try {
      const result = renderPele(rawChart, {
        idPrefix: `pele-${id.replace(/:/g, '')}`,
      });
      return { initialSvg: result.svg, initialError: null };
    } catch (err) {
      return {
        initialSvg: '',
        initialError: err instanceof Error ? err.message : String(err),
      };
    }
  }, [rawChart, id]);

  const [error, setError] = useState<string | null>(initialError);

  // Client-side dynamic enhancement via Pele mount
  useEffect(() => {
    if (showCode || !rawChart || !containerRef.current) return;

    try {
      const mounted = mountPele(containerRef.current, rawChart, {
        zoom: 'auto',
        idPrefix: `pele-${id.replace(/:/g, '')}`,
        onError: (err) => {
          setError(err instanceof Error ? err.message : String(err));
        },
      });

      return () => {
        mounted.destroy();
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [rawChart, showCode, id]);

  const handleCopy = async () => {
    if (!rawChart) return;
    try {
      await navigator.clipboard.writeText(rawChart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (!rawChart) return null;

  const lines = rawChart.split('\n');

  return (
    <figure
      dir="ltr"
      tabIndex={-1}
      style={figureStyle}
      className={`my-4 bg-fd-card rounded-xl shiki relative border border-fd-border not-prose overflow-hidden text-sm ${figureClassName} ${className}`.trim()}
    >
      {/* Header toolbar with view toggle & copy button */}
      <div className="flex items-center justify-between border-b border-fd-border bg-fd-secondary/35 px-3 py-1.5 text-xs text-fd-muted-foreground select-none">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowCode(false)}
            data-active={!showCode || undefined}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors hover:text-fd-foreground hover:bg-fd-accent/60 data-[active]:bg-fd-card data-[active]:text-fd-foreground data-[active]:shadow-xs data-[active]:border data-[active]:border-fd-border/60"
            aria-pressed={!showCode}
          >
            <Eye className="size-3.5 text-fd-primary" />
            <span>Diagram</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCode(true)}
            data-active={showCode || undefined}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors hover:text-fd-foreground hover:bg-fd-accent/60 data-[active]:bg-fd-card data-[active]:text-fd-foreground data-[active]:shadow-xs data-[active]:border data-[active]:border-fd-border/60"
            aria-pressed={showCode}
          >
            <Code2 className="size-3.5" />
            <span>Code</span>
          </button>

          {title && (
            <span className="ms-2 font-mono text-[11px] text-fd-muted-foreground/80 truncate max-w-[200px]">
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/70 transition-colors"
            title="Copy Mermaid code"
            aria-label="Copy Mermaid code"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-fd-primary" />
                <span className="text-fd-primary font-medium text-[11px]">
                  Copied
                </span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main content: Diagram view or Code view */}
      {showCode ? (
        <div
          role="region"
          tabIndex={0}
          className="text-[0.8125rem] py-3.5 overflow-auto max-h-[600px] fd-scroll-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring"
          style={
            { '--padding-right': 'calc(var(--spacing) * 8)' } as CSSProperties
          }
        >
          {codeBlock ?? (
            <pre className="min-w-full w-max *:flex *:flex-col px-4 font-mono leading-relaxed text-fd-foreground">
              <code>
                {lines.map((line, idx) => (
                  <span key={idx} className="line">
                    {highlightMermaidLine(line)}
                  </span>
                ))}
              </code>
            </pre>
          )}
        </div>
      ) : error ? (
        <div className="p-4 text-xs text-red-500 bg-red-500/10 font-mono">
          <p className="font-semibold mb-1">
            Failed to render Mermaid diagram with Pele:
          </p>
          <p className="text-red-400">{error}</p>
          <div className="mt-3">
            <div
              role="region"
              tabIndex={0}
              className="text-[0.8125rem] py-3.5 overflow-auto max-h-[600px] fd-scroll-container"
            >
              <pre className="min-w-full w-max *:flex *:flex-col px-4 font-mono leading-relaxed text-fd-foreground">
                <code>
                  {lines.map((line, idx) => (
                    <span key={idx} className="line">
                      {line || ' '}
                    </span>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="pele-content p-6 overflow-x-auto flex items-center justify-center min-h-[140px]"
          dangerouslySetInnerHTML={{ __html: initialSvg }}
        />
      )}
    </figure>
  );
}

export const Pele = Mermaid;
