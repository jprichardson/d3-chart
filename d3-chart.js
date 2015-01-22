(function(){
'use strict'

var __noop = function() {}
var d3 = null

//I should make this a UMD sometime
if (typeof module != 'undefined' && typeof module.exports != 'undefined') {
  module.exports = D3Chart
} else {
  window.D3Chart = D3Chart
}

function D3Chart (d3js, svg, data, options) {
  if (!(this instanceof D3Chart)) return new D3Chart(d3js, svg, options)

  d3 = d3js //referenced above
  this.svg = svg

  this.opts = options

  this.padding = options.padding || 0
  this.data = data || []

  this.type = options.type || 'scatter' //'scatter', 'bar', 'line'

  this.rect = this.svg[0][0].getBoundingClientRect()
  this.height = options.height || this.rect.height
  this.width = options.width || this.rect.width

  this.xExtent = options.xExtent || null
  this.yExtent = options.yExtent || null

  this._xValue = function(d, i) { return i }
  this._yValue = function(d, i) { return d }
}

// Properties

Object.defineProperty(D3Chart.prototype, 'xValue', {
  get: function() { return this._xValue },
  set: function(val) { this._xValue = val}
})

Object.defineProperty(D3Chart.prototype, 'yValue', {
  get: function() { return this._yValue },
  set: function(val) { this._yValue = val}
})

D3Chart.prototype.render = function() {
  this.yExtent = this.yExtent || d3.extent(this.data)
  this.xExtent = this.xExtent || [0, this.data.length-1]
  
  var ret = null

  switch (this.type) {
    case 'scatter': ret = renderScatter.call(this); break;
    case 'bar': ret = renderBar.call(this); break;
    case 'line': ret = renderLine.call(this); break;
  }

  var xAxisTextSize = measure(this.opts.xAxisText, 'x label')

  if (this.opts.xAxisText) {
    this.svg.append("text").attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", this.width/2 - xAxisTextSize.width /2)
            .attr("y", this.height - 6)
            .text(this.opts.xAxisText);
  }

  /*this.svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("x", this.height/2)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("y axis text");*/

  return ret
}

// Private Methods

function renderScatter() {
  var me = this
  var xScale = d3.scale.linear().domain(this.xExtent).rangeRound([this.padding, this.width-this.padding])
  var yScale = d3.scale.linear().domain(this.yExtent).rangeRound([this.height-this.padding, this.padding])
  
  var ret = this.svg.selectAll("circle")
      .data(this.data)
      .enter()
      .append("circle")
      .attr('class', 'd3-chart-data-circle')
      .attr("r", 3)
      .attr("cx", function(d, i) {
        return xScale(me.xValue.apply(me, arguments))
      })
      .attr("cy", function(d, i) {
        return yScale(me.yValue.apply(me, arguments))
      })

  var xAxis = d3.svg.axis().scale(xScale).orient('bottom')
  var yAxis = d3.svg.axis().scale(yScale).orient('left')
  renderAxes.call(this, xAxis, yAxis)

  return ret
}

function renderBar () {
  var me = this
  var xScale = d3.scale.linear().domain(this.xExtent).rangeRound([this.padding, this.width-this.padding])
  var yScale = d3.scale.linear().domain(this.yExtent).rangeRound([this.padding, this.height-this.padding])
  
  var ret = this.svg.selectAll('rect')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('class', 'd3-chart-data-rect')
      .attr('x', function(d, i) {
        return xScale(me.xValue.apply(me, arguments))
      })
      .attr('y', function(d, i) {
        return me.height - yScale(me.yValue.apply(me, arguments))
      })
      .attr('width', (me.width-me.padding*2)/(me.data.length))
      .attr('height', function(d, i) {
        return yScale(me.yValue.apply(me, arguments)) - me.padding
      })

  var xAxis = d3.svg.axis().scale(xScale).orient('bottom')
  var iYScale = d3.scale.linear().domain(this.yExtent).rangeRound([this.height-this.padding, this.padding])
  var yAxis = d3.svg.axis().scale(iYScale).orient('left') 

  renderAxes.call(this, xAxis, yAxis)

  return ret
}

function renderLine () {
  var me = this

  var xScale = d3.scale.linear().domain(this.xExtent).rangeRound([this.padding, this.width-this.padding])
  var yScale = d3.scale.linear().domain(this.yExtent).rangeRound([this.height-this.padding, this.padding])
    
  var line = d3.svg.line()
                  .x(function(d, i) { return xScale(me.xValue.apply(me, arguments)) })
                  .y(function(d, i) { return yScale(me.yValue.apply(me, arguments)) })
                  .interpolate('linear')

  var ret = this.svg.append('path')
        .attr('class', 'd3-chart-data-path')
        .attr('d', line(this.data))

  var xAxis = d3.svg.axis().scale(xScale).orient('bottom')
  var yAxis = d3.svg.axis().scale(yScale).orient('left')

  renderAxes.call(this, xAxis, yAxis)

  return ret
}

function renderAxes (xAxis, yAxis) {
  this.svg.append('g').attr('class', 'x axis')
          .attr('transform', 'translate(0,' + (this.height-this.padding) + ')')
          .call(xAxis)
  this.svg.append('g').attr('class', 'y axis')
          .attr('transform', 'translate(' + this.padding + ',0)')
          .call(yAxis)
}

// create a dummy element, apply the appropriate classes,
// and then measure the element
function measure(text, classname) {
  if(!text || text.length === 0) return {height: 0, width: 0};

  var container = d3.select('body').append('svg').attr('class', classname);
  container.append('text').attr({x: -1000, y: -1000}).text(text);

  var bbox = container.node().getBBox();
  container.remove();

  return {height: bbox.height, width: bbox.width};
}

})();
