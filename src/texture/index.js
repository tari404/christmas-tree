import Vue from 'vue'

import lines from './lines'
import lines2 from './lines2'
import broken from './broken'
import diamond from './diamond'
import points from './points'

export const Texture = Vue.component('interface-input', {
  functional: true,
  render (createElement, context) {
    function getComponent (index) {
      switch (index) {
        case 0:
          return lines
        case 1:
          return lines2
        case 2:
          return broken
        case 3:
          return diamond
        case 4:
          return points
        default:
          return lines
      }
    }
    const component = getComponent(context.props.typeIndex)
    return createElement(component, context.data)
  }
})

export const catalog = [
  '三线条',
  '线条',
  '折线',
  '菱形',
  '圆点'
]
