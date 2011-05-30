var sys = require('sys');
var plask = require('plask');

plask.simpleWindow({
  width: 800,
  height: 600,
  type: '3d',
  vsync: true,  // Prevent tearing.
  multisample: true,  // Anti-alias.

  init: function() {
    var gl = this.gl;

    this.framerate(30);

    this.mprogram = plask.gl.MagicProgram.createFromBasename(
        gl, __dirname, 'app');

    function makeMesh() {
      var buffer = gl.createBuffer();
      var data = new Float32Array([0, 1, 0, -0.5, 0, 0, 0.5, 0, 0]);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return {buffer: buffer, num: data.length / 3, data: data};
    }

    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(230/255, 230/255, 230/255, 1.0);

    this.mesh = makeMesh();

    this.zoom = 0.5;
    this.rotate_x = 0;
    this.rotate_y = 0;

    this.on('leftMouseDragged', function(e) {
      this.rotate_x += e.dx / 100.0
      this.rotate_y += e.dy / 100.0
    });

    this.on('scrollWheel', function(e) {
      this.zoom = plask.clamp(this.zoom - e.dy/10.0, 0, 1);
    });
  },

  draw: function() {
    var gl = this.gl;
    var mesh = this.mesh;
    var mprogram = this.mprogram;

    // Clear the background to gray.  The depth buffer isn't really needed for
    // a single triangle, but generally the depth buffer should also be cleared.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Build our "model-view" matrix, which will rotate the triangle based on
    // the mouse controls.
    var mv = new plask.Mat4();
    mv.translate(0, 0, -4 - this.zoom*16);
    mv.rotate(this.rotate_y, 1, 0, 0);
    mv.rotate(this.rotate_x, 0, 1, 0);

    // Build our "perspective" matrix, which will apply the aspect ratio,
    // perspective divide, and clipping planes.
    var persp = new plask.Mat4();
    persp.perspective(27, this.width / this.height, 0.1, 20);

    mprogram.use();
    mprogram.set_u_p(persp);
    mprogram.set_u_mv(mv);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
    gl.vertexAttribPointer(mprogram.location_a_xyz,
                           3,
                           gl.FLOAT,
                           false, 0, 0);
    gl.enableVertexAttribArray(mprogram.location_a_xyz);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.num);
  }
});
