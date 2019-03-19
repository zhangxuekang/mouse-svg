(function() {
  const $body = document.querySelector('body')
  const $svgEl = document.createElementNS("http://www.w3.org/2000/svg", 'svg')
  const $path = document.createElementNS("http://www.w3.org/2000/svg", 'path')
  $path.style.fill = 'none'
  $path.style.stroke = 'black'
  $path.style.strokeWidth = 1
  $svgEl.style.width = '100vw'
  $svgEl.style.height = '100vh'
  window.addEventListener('mousedown', () => {
    $body.innerHTML = ''
    $path.setAttribute('d', '')
    $svgEl.appendChild($path)
    $body.appendChild($svgEl)
    const points = []
    function draw(e) {
      const x = e.pageX - 10
      const y = e.pageY - 10
      points.push(x, y)
      if (points.length >= 10) {
        const pathString = solve(points, 1.5)
        $path.setAttribute('d', pathString)
      }
    }
    window.addEventListener('mousemove', draw)
    window.addEventListener('mouseup', () => {
      points.length = 0
      console.log($path.getAttribute('d'))
      window.removeEventListener('mousemove', draw)
    })
  })
  /**
 * 将折线修改为圆滑曲线
 * @param {*} data  [x1,y1,x2,y2,x3,y3...] 长度必须大于4, 长度必须是偶数
 * @param {*} k 拟合系数, 数字
 */
  function solve(data, k = 1) {
    const size = data.length
    const last = size - 4
    let path = `M${data[0]},${data[1]}`
    for (let i = 0; i < size - 2; i += 2) {
      const x0 = i ? data[i - 2] : data[0]
      const y0 = i ? data[i - 1] : data[1]
      const x1 = data[i + 0]
      const y1 = data[i + 1]
      // x2 和 y2 作为终点坐标
      const x2 = data[i + 2]
      const y2 = data[i + 3]
      const x3 = i !== last ? data[i + 4] : x2
      const y3 = i !== last ? data[i + 5] : y2
      // 计算控制点
      const cp1x = x1 + (x2 - x0) / 6 * k
      const cp1y = y1 + (y2 - y0) / 6 * k
      const cp2x = x2 - (x3 - x1) / 6 * k
      const cp2y = y2 - (y3 - y1) / 6 * k
      path += ` C${cp1x},${cp1y},${cp2x},${cp2y},${x2},${y2}`
    }

    return path
  }
})()