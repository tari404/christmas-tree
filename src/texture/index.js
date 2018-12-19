import Vue from 'vue'

import lines from './lines'

export default Vue.component('interface-input', {
  functional: true,
  render (createElement, context) {
    function getComponent (index) {
      switch (index) {
        case 0:
          return lines
        default:
          return lines
      }
    }
    const component = getComponent(context.props.typeIndex)
    return createElement(component, context.data)
  }
})
