import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Mermaid, Pele } from './mermaid';

function getRawText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(getRawText).join('');
  if (typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return getRawText(props?.children);
  }
  return '';
}

interface CustomPreProps extends ComponentPropsWithoutRef<'pre'> {
  'data-language'?: string;
  title?: string;
}

function CustomPre(props: CustomPreProps) {
  const child = props.children;
  const childProps =
    child && typeof child === 'object' && 'props' in child
      ? ((child as { props?: CustomPreProps }).props ?? null)
      : null;

  const isMermaid =
    props['data-language'] === 'mermaid' ||
    props['data-language'] === 'pele' ||
    (typeof props.className === 'string' &&
      props.className.includes('language-mermaid')) ||
    childProps?.['data-language'] === 'mermaid' ||
    childProps?.['data-language'] === 'pele' ||
    (typeof childProps?.className === 'string' &&
      childProps.className.includes('language-mermaid'));

  if (isMermaid) {
    const rawChart = getRawText(child ?? props.children);
    return (
      <Mermaid
        chart={rawChart}
        codeBlock={child}
        figureStyle={props.style}
        figureClassName={props.className}
        title={props.title}
      />
    );
  }

  const DefaultPre = defaultMdxComponents.pre;
  return <DefaultPre {...props} />;
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    pre: CustomPre,
    Mermaid,
    Pele,
    ...components,
  };
}
