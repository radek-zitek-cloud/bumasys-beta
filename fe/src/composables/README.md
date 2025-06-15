# D3.js Tree Composable

A Vue 3 composable that provides tree visualization functionality using d3.js.

## Usage

```typescript
import { useD3Tree, type TreeNodeData } from './useD3Tree'

const { createTree, clearTree, error } = useD3Tree()

// Create tree structure
const treeData: TreeNodeData = {
  name: 'Root Node',
  title: 'Description',
  children: [
    {
      name: 'Child 1',
      title: 'Description 1'
    },
    {
      name: 'Child 2', 
      title: 'Description 2'
    }
  ]
}

// Render the tree
createTree(treeData, {
  containerSelector: '#tree-container',
  width: 800,
  height: 600,
  nodeColor: '#1976D2',
  linkColor: '#1976D2'
})
```

## API

### `createTree(data, config)`

Creates a d3.js tree visualization.

**Parameters:**
- `data: TreeNodeData` - The tree structure to render
- `config: TreeConfig` - Configuration options

### `clearTree(containerSelector)`

Clears the tree visualization from the specified container.

### `error`

Reactive ref containing any error messages from tree operations.

## Features

- SVG-based tree rendering using d3.js
- Customizable node and link colors
- Text wrapping for long node labels
- Responsive design
- Error handling