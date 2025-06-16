declare module 'vue3-d3-tree' {
  import type { DefineComponent } from 'vue'

  export interface VueTreeProps {
    data: any
    direction?: 'vertical' | 'horizontal'
    childrenKey?: string | Function
    defaultNodeKey?: string | Function
    defaultNodeStyle?: string | Function
    defaultNodeCollapsedStyle?: string | Function
    showKnot?: boolean
    wheelZoom?: boolean
    lineType?: 'polyline' | 'curve'
    lineStyle?: object
    collapsedWay?: 'clickTreeNode' | 'clickKnotNode'
    top?: string | number
    left?: string | number
    hierarchyMargin?: number
    neighborMargin?: number
    stretchLength?: number
    knotStretchLength?: number
  }

  export interface VueTreeSlots {
    node?: (props: { data: any, index: number }) => any
  }

  const VueTree: DefineComponent<VueTreeProps, {}, {}, {}, {}, {}, {}, VueTreeSlots>
  export default VueTree
}
