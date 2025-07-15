'use client'
import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type CsvDatum = {
  date: Date
  value: number
}

const margin = { top: 10, right: 30, bottom: 30, left: 60 }
const width = 660 - margin.left - margin.right
const height = 600 - margin.top - margin.bottom

const updateMyChart = { current: () => {} }
const resetMyChart = { current: () => {} }

const Page: React.FC = () => {
  const chartRef = useRef<SVGSVGElement | null>(null)

  let isAnimated = false
  gsap.registerPlugin(ScrollTrigger)
  useGSAP(() => {
    gsap.to('.chart-container', {
      scrollTrigger: {
        trigger: '.chart-container',
        start: 'top top',
        end: '+=400%',
        pin: true,
        scrub: 1,
        onUpdate: (event) => {
          const progress = event?.progress * 100
          console.log('myLog done', progress) // TODO remove before merging into master
          if (progress > 20) {
            if (updateMyChart.current && !isAnimated) {
              updateMyChart.current()
              console.log('myLog animating') // TODO remove before merging into master
              isAnimated = true
            }
          } else {
            if (resetMyChart.current && isAnimated) {
              console.log('myLog RESETING ANIMATION') // TODO remove before merging into master
              isAnimated = false
              resetMyChart.current()
            }
          }
        }
      }
    })
  })

  useEffect(() => {
    if (!chartRef.current) return
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove()

    const svg = d3
      .select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    d3.csv(
      'https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv',
      (d) => ({
        date: d3.timeParse('%Y-%m-%d')(d.date ?? '') as Date,
        value: +(d.value ?? 0)
      })
    ).then((data: CsvDatum[] | undefined) => {
      if (!data) return
      // X axis
      const x = d3
        .scaleTime()
        .domain(d3.extent(data, (d) => d.date) as [Date, Date])
        .range([0, width])
      const xAxis = svg
        .append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x))

      // Y axis
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value) ?? 0])
        .range([height, 0])
      const yAxis = svg.append('g').call(d3.axisLeft(y))

      // Clip path
      svg
        .append('defs')
        .append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('x', 0)
        .attr('y', 0)

      // Brushing
      const brush = d3
        .brushX()
        .extent([
          [0, 0],
          [width, height]
        ])
        .on('end', updateChart)

      // Line group
      const lineGroup = svg.append('g').attr('clip-path', 'url(#clip)')
      svg.on('scroll', () => {
        console.log('myLog scrolling') // TODO remove before merging into master
      })

      // Line generator
      const lineGenerator = d3
        .line<CsvDatum>()
        .x((d) => x(d.date))
        .y((d) => y(d.value))

      // Line path
      const path = lineGroup
        .append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 1.5)
        .attr('d', lineGenerator)

        const pathLength = path?.node()?.getTotalLength() ?? 0
        // D3 provides lots of transition options, have a play around here:
        // https://github.com/d3/d3-transition
        const transitionPath = d3.transition().ease(d3.easeSin).duration(2500)
        console.log('myLog ', pathLength) // TODO remove before merging into master

        path
          .attr('stroke-dashoffset', pathLength)
          .attr('stroke-dasharray', pathLength)
          .transition(transitionPath)
          .attr('stroke-dashoffset', 0)
      // Brushing
      lineGroup.append('g').attr('class', 'brush').call(brush)

      let idleTimeout: NodeJS.Timeout | null = null
      function idled() {
        idleTimeout = null
      }

      function updateChart(event: d3.D3BrushEvent<unknown>) {
        path.attr('stroke-dashoffset', null).attr('stroke-dasharray', null)
        console.log('myLog ', event) // TODO remove before merging into master
        const extent = event.selection as [number, number] | null
        if (!extent) {
          if (!idleTimeout) idleTimeout = setTimeout(idled, 350)
          return
        }

        x.domain([x.invert(extent[0]), x.invert(extent[1])] as [Date, Date])
        xAxis.transition().duration(1000).call(d3.axisBottom(x))
        lineGroup
          .select('.line')
          .transition()
          .duration(1000)
          .attr('d', function (d) {
            return lineGenerator(d as CsvDatum[])
          })
        // lineGroup.select('.brush').call(brush.move, null)
      }
      updateMyChart.current = () => {
        path.attr('stroke-dasharray', null).attr('stroke-dashoffset', null)
        // path.attr('stroke-dashoffset', null).attr('stroke-dasharray', null)
        // console.log('myLog ', event) // TODO remove before merging into master
        // const extent = event.selection as [number, number] | null
        // if (!extent) {
        //   if (!idleTimeout) idleTimeout = setTimeout(idled, 350)
        //   return
        // }

        // x.domain([x.invert(extent[0]), x.invert(extent[1])] as [Date, Date])
        x.domain([new Date('01-01-2017'), new Date('06-01-2017')] as [Date, Date])
        xAxis.transition().duration(2000).call(d3.axisBottom(x))
        // Optionally update the y domain based on the new x domain
        const filteredData = data.filter((d) => d.date >= x.domain()[0] && d.date <= x.domain()[1])
        y.domain([0, d3.max(filteredData, (d) => d.value) ?? 0])
        yAxis.transition().duration(2000).call(d3.axisLeft(y))

        lineGroup
          .select('.line')
          .transition()
          .duration(2000)
          .attr('d', function (d) {
            return lineGenerator(d as CsvDatum[])
          })
        // lineGroup.select('.brush').call(brush.move, null)
      }

      resetMyChart.current = function () {
        path.attr('stroke-dasharray', null).attr('stroke-dashoffset', null)
        x.domain(d3.extent(data, (d) => d.date) as [Date, Date])
        y.domain([0, d3.max(data, (d) => d.value) ?? 0])
        xAxis.transition().call(d3.axisBottom(x))
        yAxis.transition().call(d3.axisLeft(y))
        lineGroup
          .select('.line')
          .transition()
          .duration(1000)
          .attr('d', function (d) {
            return lineGenerator(d as CsvDatum[])
          })
      }
    })
  }, [])

  return (
    <div className='bg-gray-600 max-w-screen overflow-hidden'>
      <div className='chart-container flex flex-col items-center justify-center h-screen'>
        <svg ref={chartRef} />
        <button
          className='mt-4 px-4 py-2 bg-blue-500 text-white rounded'
          onClick={() => {
            if (updateMyChart.current) {
              updateMyChart.current()
            }
          }}
        >
          Update Chart
        </button>
        <button
          className='mt-4 px-4 py-2 bg-blue-500 text-white rounded'
          onClick={() => {
            if (resetMyChart.current) {
              resetMyChart.current()
            }
          }}
        >
          reset Chart
        </button>
      </div>
      <div className='bg-gray-500 h-screen w-screen' />
    </div>
  )
}

export default Page
