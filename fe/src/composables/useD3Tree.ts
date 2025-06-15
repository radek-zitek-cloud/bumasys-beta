/**
 * @fileoverview D3.js Tree Composable
 *
 * This composable provides tree visualization functionality using d3.js
 * to replace the previous Treant.js implementation.
 */

import * as d3 from 'd3'
import { ref } from 'vue'

export interface TreeNodeData {
  name: string
  title?: string
  children?: TreeNodeData[]
}

export interface TreeConfig {
  containerSelector: string
  width?: number
  height?: number
  nodeWidth?: number
  nodeHeight?: number
  levelSeparation?: number
  siblingSeparation?: number
  nodeColor?: string
  linkColor?: string
}

/**
 * Composable for creating and managing d3.js tree visualizations
 */
export function useD3Tree () {
  const error = ref<string | null>(null)

  /**
   * Create a tree visualization using d3.js
   */
  function createTree (data: TreeNodeData, config: TreeConfig): void {
    try {
      error.value = null

      // Clear any existing content
      d3.select(config.containerSelector).selectAll('*').remove()

      // Set default dimensions
      const width = config.width ?? 800
      const height = config.height ?? 600
      const nodeWidth = config.nodeWidth ?? 140
      const nodeHeight = config.nodeHeight ?? 60
      const levelSeparation = config.levelSeparation ?? 120

      // Create SVG container
      const svg = d3.select(config.containerSelector)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', '#fafafa')
        .style('border', '1px solid #e0e0e0')
        .style('border-radius', '4px')

      // Create a group for the tree content with margins
      const g = svg.append('g')
        .attr('transform', `translate(${width / 2},50)`)

      // Create the tree layout
      const treeLayout = d3.tree<TreeNodeData>()
        .size([width - 100, height - 100])
        .separation((a, b) => {
          return a.parent === b.parent ? 1 : 1.5
        })

      // Create hierarchy from data
      const root = d3.hierarchy(data)

      // Apply the tree layout
      treeLayout(root)

      // Adjust positions to ensure proper separation
      for (const d of root.descendants()) {
        d.y = d.depth * levelSeparation
      }

      // Create links (connections between nodes)
      g.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', config.linkColor ?? '#1976D2')
        .attr('stroke-width', 2)
        .attr('d', d3.linkVertical<any, any>()
          .x((d: any) => d.x)
          .y((d: any) => d.y),
        )

      // Create node groups
      const nodes = g.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x},${d.y})`)

      // Add rectangles for nodes
      nodes.append('rect')
        .attr('width', nodeWidth)
        .attr('height', nodeHeight)
        .attr('x', -nodeWidth / 2)
        .attr('y', -nodeHeight / 2)
        .attr('fill', '#ffffff')
        .attr('stroke', config.nodeColor ?? '#1976D2')
        .attr('stroke-width', 2)
        .attr('rx', 8)
        .attr('ry', 8)

      // Add node text - name
      nodes.append('text')
        .attr('dy', '-0.2em')
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#1976D2')
        .text(d => d.data.name)
        .call(wrapText, nodeWidth - 10)

      // Add node text - title (if exists)
      nodes.filter(d => Boolean(d.data.title))
        .append('text')
        .attr('dy', '1.2em')
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#666')
        .text(d => d.data.title || '')
        .call(wrapText, nodeWidth - 10)
    } catch (error_) {
      console.error('Error creating d3 tree:', error_)
      error.value = error_ instanceof Error ? error_.message : 'Failed to create tree visualization'
    }
  }

  /**
   * Helper function to wrap text within a given width
   */
  function wrapText (text: any, width: number) {
    text.each(function (this: SVGTextElement) {
      const textEl = d3.select(this)
      const words = textEl.text().split(/\s+/).reverse()
      let word: string | undefined
      let line: string[] = []
      let lineNumber = 0
      const lineHeight = 1.1 // ems
      const y = textEl.attr('y') || 0
      const dy = Number.parseFloat(textEl.attr('dy') || '0')
      let tspan = textEl.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em')

      while ((word = words.pop())) {
        line.push(word)
        tspan.text(line.join(' '))
        if (tspan.node()!.getComputedTextLength() > width) {
          line.pop()
          tspan.text(line.join(' '))
          line = [word]
          tspan = textEl.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word)
        }
      }
    })
  }

  /**
   * Clear the tree visualization
   */
  function clearTree (containerSelector: string): void {
    d3.select(containerSelector).selectAll('*').remove()
  }

  return {
    createTree,
    clearTree,
    error,
  }
}
