export function remarkMermaid() {
  return (tree: any) => {
    function walk(node: any, parent?: any, index?: number) {
      if (
        node &&
        node.type === 'code' &&
        (node.lang === 'mermaid' || node.lang === 'pele')
      ) {
        if (parent && typeof index === 'number') {
          const attributes: any[] = [
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
          walk(node.children[i], node, i);
        }
      }
    }

    walk(tree);
  };
}

