var __noop = function() {}

if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
  module.exports = D3Chart
}

function D3Chart (d3, svg, options) {
  'use strict'

  if (!(this instanceof D3Chart)) return new D3Chart(d3, svg, options)
  this.d3 = d3 || window.d3
  this.svg = svg

  this.padding = options.padding || 0
  this.data = options.data || []

  this.type = options.type || 'scatter' //valid: 'scatter', 'bar', 'line'

  this.rect = this.svg[0][0].getBoundingClientRect()
  this.height = this.rect.height
  this.width = this.rect.width
}





