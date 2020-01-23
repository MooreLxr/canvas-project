$(function () {
  init();
});

/**
 * 初始化
 */
function init() {
  let $window = $(window),
    canvas = $("#canvas")[0],
    canvas_width = $window.width(),
    canvas_height = $window.height() - 30,
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
    new Branch(new Vector(canvas_width / 2, canvas_height), new Vector(Math.random(-1, 1), -y_speed), 15 / stretch_factor, Branch.randomrgba(0, 255, 0.3), treeDom)
    // new Branch(new Vector(canvas_width / 2, canvas_height), new Vector(Math.random(-1, 1), -y_speed), 15 / stretch_factor, '#CACACA', treeDom)
  }

  treeDom.render()
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
    for (let i = 0; i < branches.length; i++) {
      if (branches[i] === b) {
        branches.splice(i, 1)
        return
      }
    }
  }

  this.render = function () {
    //这里的定时器可以使树干不断生长
    timer = setInterval(() => {
      if (branches.length > 0) {
        for (let i = 0; i < branches.length; i++) {
          branches[i].grow()
        }
      }
    }, 1000 / 30)
  }
}

/**
 * @description:绘制枝干
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
    this.tree.addBranch(this)
  },
  //绘制
  draw() {
    let ctx = this.tree.ctx
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.arc(this.position.x, this.position.y, this.r, 0, 2 * Math.PI, true)
    ctx.fill()
  },
  //修改Branch的position、v、r、length等属性，以便下一次的绘制
  change() {
    let angle = 0.18 - (0.12 / this.generation)
    this.position.add(this.v)
    this.length += this.v.length()
    this.r *= 0.99
    this.v.rotate(Branch.random(-angle, angle))//v经过旋转后得到新的矢量v
    if (this.r < 0.7 || this.generation > 10) {
      this.tree.removeBranch(this)
      //开始绘制叶子
      let leaf = new Leaf(this.position,10,this.color,this.tree.ctx)
      leaf.draw()

      //绘制花瓣
      // let flower = new Flower(this.position,'#CE466F',this.tree.ctx)
      // flower.draw()
    }
  },

  //绘制树杈（绘制的条件是等到主干的长度是150-250时才绘制）
  fork() {
    let p = this.length - Branch.random(100, 200)  //控制主干长到一定长度时再绘制其分支
    if (p > 0) {
      let n = Math.round(Branch.random(1, 3))
      this.tree.stat.fork += n - 1
      for (let i = 0; i < n; i++) {
        Branch.clone(this)
      }
      this.tree.removeBranch(this)
    }
  },

  grow() {
    this.draw()
    this.change()
    this.fork()
  }
}
Branch.random = function (min, max) {
  return Math.random() * (max - min) + min
}
Branch.rgba = function (r, g, b, a) {
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
}
Branch.randomrgba = function (min, max, a) {
  return Branch.rgba(Math.round(Branch.random(min, max)), Math.round(Branch.random(min, max)), Math.round(Branch.random(min, max)), a);
}
Branch.clone = function (b) {
  let r = new Branch(new Vector(b.position.x, b.position.y), new Vector(b.v.x, b.v.y), b.r, b.color, b.tree)
  r.generation = b.generation + 1
  return r
}

/**
 * @description:花瓣
 */
function Flower(p,c,ctx) {
  this.position = p
  this.color = c || 'rgba(255,192,203,.3)'
  this.ctx = ctx
}
Flower.prototype = {
  init(){},
  draw(){
    let that = this
    let { ctx } = this
    for(let i=0; i<5; i++){
      (function(r){
        setTimeout(() =>{
          for(let i=0;i<10;i++){
            ctx.beginPath()
            ctx.fillStyle = that.color
            ctx.arc(that.position.x+Branch.random(-80,80),that.position.y+Branch.random(-80,80),r,0,2 * Math.PI)
            ctx.fill()
          }
        },r *60)
      })(i)
    }
  }
}

/**
 * @description:叶子
 */
function Leaf(p,r,c,ctx) {
  this.position = p
  this.r = r || 0
  this.color = c || 'rgba(255,255,255,0.1)'
  this.ctx = ctx
}
Leaf.prototype = {
  draw(){
    let that = this
    let { ctx } = this
    for(let i=0; i<5; i++){
      (function(r){
        setTimeout(() =>{
          ctx.beginPath()
          ctx.fillStyle = that.color
          ctx.moveTo(that.position.x,that.position.y)
          ctx.arc(that.position.x,that.position.y,r,0,2 * Math.PI)
          ctx.fill()
        },r *60)
      })(i)
    }
  }
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