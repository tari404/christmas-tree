import Vue from 'vue'

import lines from './lines'
import lines2 from './lines2'
import lines3 from './lines3'
import lines4 from './lines4'
import broken from './broken'
import diamond from './diamond'
import points from './points'
import oblique from './oblique'
import star from './star'
import heart from './heart'

export const Texture = Vue.component('interface-input', {
  functional: true,
  render (createElement, context) {
    function getComponent (index) {
      switch (index) {
        case 0: return lines
        case 1: return lines2
        case 2: return broken
        case 3: return diamond
        case 4: return points
        case 5: return oblique
        case 6: return lines3
        case 7: return lines4
        case 8: return star
        case 9: return heart
        default: return lines
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
  '圆点',
  '斜条纹',
  '两端',
  '细两端',
  '星星',
  '心形'
]
