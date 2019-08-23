;(function() {
  const $body = document.querySelector('body')
  const $svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const $path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
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
      const x = e.pageX
      const y = e.pageY
      points.push(x, y)
      if (points.length >= 10) {
        const pathString = solve(points, 1.5)
        $path.setAttribute('d', pathString)
      }
    }
    window.addEventListener('mousemove', draw)
    window.addEventListener('mouseup', () => {
      if (points.length >= 10) {
        runAnimation($path.getAttribute('d'))
        console.log($path.getAttribute('d'))
      }
      points.length = 0
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
      const cp1x = x1 + ((x2 - x0) / 6) * k
      const cp1y = y1 + ((y2 - y0) / 6) * k
      const cp2x = x2 - ((x3 - x1) / 6) * k
      const cp2y = y2 - ((y3 - y1) / 6) * k
      path += ` C${cp1x},${cp1y},${cp2x},${cp2y},${x2},${y2}`
    }

    return path
  }

  /**
   * @description 运行动画
   * @date 2019-08-23
   * @param {*} path
   */
  function runAnimation(path) {
    // 设置移动点样式
    setStyle()
    const point = document.createElement('div')
    point.setAttribute('class', 'move_point')
    document.body.appendChild(point)
    const pathEl = getPathElement(path)
    // 获取空间区间
    const totalLength = pathEl.getTotalLength() // 总长
    const duration = totalLength / 0.3
    let curPosition = pathEl.getPointAtLength(0) // 当前坐标,一开始是在起始点,也就是from
    const startTime = new Date().getTime() // 起始时间

    requestAnimationFrame(step)

    /**
     * 动画前进一小步
     */
    function step() {
      const nowTime = new Date().getTime()
      const t = (nowTime - startTime) / duration // 时间进度 0~1
      const progress = totalLength * t // 当前走过的长度
      curPosition = pathEl.getPointAtLength(progress) // 当前位置点的坐标
      // 将位置,角度和大小作用到飞点上
      changePosition(point, curPosition)
      if (t < 1) {
        requestAnimationFrame(step)
      } else {
        try {
          document.body.removeChild(point)
        } catch (error) {}
      }
    }
  }

  /**
   * @description 设置移动点的样式, 这个样式可以改成可配置的, 样式会加到style标签放到head元素内
   * @date 2019-08-10
   */
  function setStyle() {
    if (!document.querySelector('#move_point')) {
      const styleStr = `
      .move_point {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: red;
        position: absolute;
        left: 0;
        top: 0
      }
    `
      const style = document.createElement('style')
      style.setAttribute('id', 'move_point')
      style.innerHTML = styleStr
      document.head.appendChild(style)
    }
  }

  /**
   * 修改元素的位置, position是元素中心点的坐标
   * @param {HTMLElement} dom
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  function changePosition($e, position) {
    const x = position.x - $e.offsetWidth / 2
    const y = position.y - $e.offsetHeight / 2
    $e.style.transform = `translate(${x}px, ${y}px)`
  }

  /**
   * 根据path路径, 构建一个svg元素
   * @param path
   */
  function getPathElement(path) {
    // 构建svg元素

    const pathEl = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    )
    pathEl.setAttribute('d', path)
    return pathEl
  }
})()
