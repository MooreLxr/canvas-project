
$(function () {
  /**
   * 初始化
   */
  function init() {
    let container = $("#container"),
      canvas = $("#canvas"),
      canvas_width = container.clientWidth,
      canvas_height = container.clientHeight,
      stretch_factor = 600 / canvas_height,//延展速度
      y_speed = 3 / stretch_factor,
      ctx = canvas.getContext('2d');

    canvas.width = canvas_width
    canvas.height = canvas_height
    ctx.globalCompositeOperation = 'lighter'//显示源图像+目标图像

    let treeDom = new Tree()
    treeDom.init(ctx)

    //实例化三个主干
    for (let i = 0; i < 3; i++) {
      new Branch(new Vector(canvas_width / 2, canvas_height), new Vector(Math.random(-1, 1), -y_speed), 15 / stretch_factor)
    }
  }

  /**
   * @description：树
   */
  function Tree() {
    let branches = [],
      timer;
    this.stat = {
      fork: 0,
      length: 0
    }

    this.init = function (ctx) {
      this.ctx = ctx
    }

    this.addBranch = function (b) {
      branches.push(b)
    }

    this.removeBranch = function (b) {
      for (let i = 0; i < this.branches.length; i++) {
        if (this.branches[i] === b) {
          this.branches.splice(i, 1)
          return
        }
      }
    }

    this.render = function () {
      timer = setInterval(() => {
        if (branches.length) {
          for (let i = 0; i < branches.length; i++) {
            branches[i].grow()
          }
        }
      }, 1000 / 30)
    }
  }

  /**
   * @description:分支
   * @params: p绘制点坐标
   * @params: v生长速度
   * @params: r半径
   * @params: c颜色
   * @parmas: t树的实例化对象
   */
  function Branch(p, v, r, c, t) {
    this.position = p
    this.v = v
    this.r = r || 0
    this.color = c || 'rgba(255,255,255,0.3)'
    this.tree = t
    this.length = 0
    this.generation = 1
    this.init()
  }
  Branch.prototype = {
    init() {
      this.tree.addBranch()
    },
    draw() {
      let ctx = this.tree.ctx
      ctx.beginPath()
      ctx.fillStyle = this.color
      ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI, true)
      ctx.fill()
    }

  }
  Branch.random = function (min, max) {
    return Math.random() * (max - min) + min
  }
  Branch.rgba = function (r, g, b, a) {
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
  }
  Branch.randomrgba = function (min, max, a) {
    return Branch.rgba(Branch.random(min, max), Math.round(Branch.random(min, max)), Math.round(Branch.random(min, max)), a)
  }
  Branch.clone = function (b) {
    let r = new Branch(new Vector(b.position.x, b.position.y), new Vector(b.v.x, b.v.y), b.r, b.color, b.tree)
    r.generation = b.generation + 1
    return r
  }

  /**s
   * @description:花瓣
   */
  function Flower() {

  }

  /**
   * @description:叶子
   */
  function Leaf() {

  }

  //todo Flower和leaf应该是在同一个function中，绘制思路应该是一致的，但形状不同

  /**
   * 矢量函数
   * @param x 
   * @param y 
   */
  function Vector(x, y) {
    this.x = x || 0
    this.y = y || 0
  }
  Vector.prototype = {
    add(v) {
      this.x += v.x
      this.y += v.y
      return this
    },
    mult(t) {
      this.x *= t
      this.y *= t
      return this
    },
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y)
    },
    rotate(theta) {
      this.x = Math.cos(theta) * this.x - Math.sin(theta) * this.y
      this.y = Math.sin(theta) * this.x + Math.cos(theta) * this.y
      return this
    }
  }
})