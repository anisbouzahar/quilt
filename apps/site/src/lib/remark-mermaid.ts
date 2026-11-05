interface UnistNode {
  type: string;
  lang?: string;
  value?: string;
  meta?: string;
  children?: UnistNode[];
  [key: string]: unknown;
}

export function remarkMermaid() {
  return (tree: UnistNode) => {
    function walk(node: UnistNode, parent?: UnistNode, index?: number) {
      if (
        node &&
        node.type === 'code' &&
        (node.lang === 'mermaid' || node.lang === 'pele')
      ) {
        if (parent && typeof index === 'number' && parent.children) {
          const attributes: Array<{
            type: string;
            name: string;
            value: unknown;
          }> = [
            {
              type: 'mdxJsxAttribute',
              name: 'chart',
              value: node.value,
            },
          ];

          if (node.meta) {
            const titleMatch = node.meta.match(/title=["']([^"']+)["']/);
            if (titleMatch) {
              attributes.push({
                type: 'mdxJsxAttribute',
                name: 'title',
                value: titleMatch[1],
              });
            }
          }

          parent.children[index] = {
            type: 'mdxJsxFlowElement',
            name: 'Mermaid',
            attributes,
            children: [],
            data: {
              _mdxExplicitJsx: true,
            },
          };
        }
      }

      if (node && Array.isArray(node.children)) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (child) {
            walk(child, node, i);
          }
        }
      }
    }

    walk(tree);
  };
}
