/**
 * Type definitions for Treant.js
 * Since @types/treant-js doesn't exist, we declare the minimal types we need
 */

declare module 'treant-js' {
  interface TreeConfig {
    chart?: {
      container?: string
      levelSeparation?: number
      siblingSeparation?: number
      subTeeSeparation?: number
      rootOrientation?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'
      nodeAlign?: 'TOP' | 'CENTER' | 'BOTTOM'
      connectors?: {
        type?: 'straight' | 'bezier' | 'step'
        style?: {
          'stroke-width'?: number
          'stroke'?: string
        }
      }
      node?: {
        HTMLclass?: string
        collapsable?: boolean
      }
      animation?: {
        nodeSpeed?: number
        nodeAnimation?: string
        connectorsSpeed?: number
        connectorsAnimation?: string
      }
    }
    nodeStructure?: TreeNode
  }

  interface TreeNode {
    text?: {
      name?: string
      title?: string
      contact?: string
      [key: string]: any
    }
    image?: string
    link?: {
      href?: string
      target?: string
    }
    HTMLclass?: string
    HTMLid?: string
    children?: TreeNode[]
    collapsed?: boolean
    stackChildren?: boolean
    connectors?: {
      style?: {
        'stroke'?: string
        'stroke-width'?: number
      }
    }
  }

  class Tree {
    constructor (config: TreeConfig, callback?: () => void)
  }

  export = Tree
}
