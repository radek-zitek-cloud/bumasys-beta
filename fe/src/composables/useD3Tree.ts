/**
 * @fileoverview Vue D3 Tree Composable
 *
 * This composable provides tree visualization functionality using vue3-d3-tree
 * to replace the previous direct d3.js implementation.
 */

import { ref, computed, type Component } from 'vue'
import VueTree, { type VueTreeProps } from 'vue3-d3-tree'

export interface TreeNodeData {
  name: string
  title?: string
  children?: TreeNodeData[]
}

export interface TreeConfig {
  containerSelector?: string // Keep for backward compatibility but not used
  width?: number
  height?: number
  nodeWidth?: number
  nodeHeight?: number
  levelSeparation?: number // Maps to hierarchyMargin
  siblingSeparation?: number // Maps to neighborMargin
  nodeColor?: string
  linkColor?: string
  direction?: 'vertical' | 'horizontal'
  showKnot?: boolean
  wheelZoom?: boolean
  lineType?: 'polyline' | 'curve'
  collapsedWay?: 'clickTreeNode' | 'clickKnotNode'
}

/**
 * Composable for creating and managing Vue D3 tree visualizations
 */
export function useD3Tree () {
  const error = ref<string | null>(null)
  const treeData = ref<TreeNodeData | null>(null)
  const treeConfig = ref<VueTreeProps | null>(null)

  /**
   * Convert TreeConfig to VueTreeProps
   */
  function convertConfig (data: TreeNodeData, config: TreeConfig): VueTreeProps {
    return {
      data,
      direction: config.direction ?? 'vertical',
      hierarchyMargin: config.levelSeparation ?? 60,
      neighborMargin: config.siblingSeparation ?? 20,
      showKnot: config.showKnot ?? false,
      wheelZoom: config.wheelZoom ?? true,
      lineType: config.lineType ?? 'polyline',
      lineStyle: config.linkColor ? { stroke: config.linkColor, strokeWidth: 2 } : undefined,
      collapsedWay: config.collapsedWay,
      top: 20,
      left: 'center',
    }
  }

  /**
   * Create a tree visualization using Vue3 D3 Tree
   * This function now prepares the configuration for the Vue component
   */
  function createTree (data: TreeNodeData, config: TreeConfig): void {
    try {
      error.value = null
      treeData.value = data
      treeConfig.value = convertConfig(data, config)
    } catch (error_) {
      console.error('Error creating Vue D3 tree:', error_)
      error.value = error_ instanceof Error ? error_.message : 'Failed to create tree visualization'
    }
  }

  /**
   * Clear the tree visualization
   */
  function clearTree (containerSelector?: string): void {
    treeData.value = null
    treeConfig.value = null
  }

  /**
   * Get the Vue Tree component
   */
  const VueTreeComponent = VueTree

  /**
   * Computed props for the Vue Tree component
   */
  const vueTreeProps = computed(() => treeConfig.value)

  return {
    createTree,
    clearTree,
    error,
    treeData,
    treeConfig,
    vueTreeProps,
    VueTreeComponent,
  }
}
