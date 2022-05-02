(function () {
  "use strict";

  R.particleRender = function (state) {
    if (
      !R.progParticle ||
      !R.progEuler ||
      !R.progPhysics ||
      !R.progDebug ||
      !R.progAmbient ||
      !R.progSetup ||
      !R.progGrid
    ) {
      console.log("waiting for programs to load...");
      return;
    }

    if (R.rigidBodiesEnabled[R.scene]) {
      computeBodyParticles(state, R.progSetup, "B", "B", "A");
      if (cfg.pingPong) {
        pingPongBody("A", "B");
      }
    }

    if (cfg.pingPong) {
      updateGrid(state, R.progGrid, "A", "A");
      calculateForces(state, R.progPhysics, "A", "A", "RK2_B");
      updateEuler(state, "A", "RK2_B", "RK2_A");

      if (R.rigidBodiesEnabled[R.scene] && !R.rigidBodiesStatic[R.scene]) {
        calculateBodyForces(state, "A", "RK2_B", "RK2_C");

        updateBodyEuler(state, "A", "RK2_C", "RK2_A");

        computeBodyParticles(state, R.progSetup, "RK2_A", "RK2_A", "RK2_B");

        updateGrid(state, R.progGrid, "RK2_B", "RK2_B");
        calculateForces(state, R.progPhysics, "RK2_B", "RK2_B", "RK2_C");

        updateParticlesRK2(
          state,
          R.progRK2,
          "A",
          "A",
          "RK2_A",
          "RK2_C",
          "RK2_C",
          "B"
        );

        calculateBodyForces(state, "RK2_C", "RK2_C", "RK2_B");
        updateBodyRK2(
          state,
          R.progBodyRK2,
          "A",
          "A",
          "RK2_A",
          "RK2_B",
          "RK2_B",
          "B"
        );
      } else {
        updateGrid(state, R.progGrid, "RK2_A", "RK2_A");
        calculateForces(state, R.progPhysics, "RK2_A", "RK2_A", "RK2_C");

        updateParticlesRK2(
          state,
          R.progRK2,
          "A",
          "A",
          "RK2_A",
          "RK2_A",
          "RK2_C",
          "B"
        );
      }
    }

    renderParticles(state, R.progParticle);

    drawDebug();

    if (!R.rigidBodiesEnabled[R.scene] && cfg.pingPong) {
      pingPong("A", "B");
    }
  };

  var computeBodyParticles = function (
    state,
    prog,
    particleSource,
    bodySource,
    target
  ) {
    gl.useProgram(prog.prog);

    gl.bindFramebuffer(gl.FRAMEBUFFER, R["fbo" + target]);
    gl.disable(gl.BLEND);

    gl.viewport(
      0,
      0,
      R.particleSideLength[R.scene],
      R.particleSideLength[R.scene]
    );

    gl.uniform1i(prog.u_particleSideLength, R.particleSideLength[R.scene]);
    gl.uniform1i(prog.u_bodySide, R.bodySideLength[R.scene]);
    gl.uniform1f(prog.u_time, R.time);
    gl.uniform1i(prog.u_scene, R.scene);
    if (R.scene == 3 || R.scene == 1) {
      R.time += R.timeStep;
    }

    bindTextures(
      prog,
      [
        prog.u_posTex,
        prog.u_velTex,
        prog.u_forceTex,
        prog.u_bodyPosTex,
        prog.u_bodyRotTex,
        prog.u_relPosTex,
        prog.u_linearMomentumTex,
        prog.u_angularMomentumTex,
      ],
      [
        R["particlePosTex" + particleSource],
        R["particleVelTex" + particleSource],
        R["forceTex" + particleSource],
        R["bodyPosTex" + bodySource],
        R["bodyRotTex" + bodySource],
        R["relativePosTex" + bodySource],
        R["linearMomentumTex" + bodySource],
        R["angularMomentumTex" + bodySource],
      ]
    );

    renderFullScreenQuad(prog);
    gl.enable(gl.BLEND);
  };

  var updateGrid = function (state, prog, source, target) {
    gl.useProgram(prog.prog);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, R["gridFBO" + target]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, R.gridInfo.gridTexWidth, R.gridInfo.gridTexWidth);

    bindTextures(prog, [prog.u_posTex], [R["particlePosTex" + source]]);

    gl.uniform1i(prog.u_posTexSize, R.particleSideLength[R.scene]);
    gl.uniform1f(prog.u_gridSideLength, R.gridBound[R.scene] * 2);
    gl.uniform1i(prog.u_gridNumCellsPerSide, R.gridInfo.numCellsPerSide);
    gl.uniform1i(prog.u_gridTexSize, R.gridInfo.gridTexWidth);
    gl.uniform1i(
      prog.u_gridTexTileDimensions,
      R.gridInfo.gridTexTileDimensions
    );
    gl.uniform1f(prog.u_gridCellSize, R.gridInfo.gridCellSize);

    gl.bindBuffer(gl.ARRAY_BUFFER, R.indices[R.scene]);
    gl.enableVertexAttribArray(prog.a_idx);
    gl.vertexAttribPointer(prog.a_idx, 1, gl.FLOAT, gl.FALSE, 0, 0);

    gl.colorMask(true, false, false, false);
    gl.depthFunc(gl.LESS);
    gl.drawArrays(gl.POINTS, 0, R.numParticles[R.scene]);

    gl.enable(gl.STENCIL_TEST);
    gl.depthFunc(gl.GREATER);
    gl.stencilFunc(gl.EQUAL, 0, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

    gl.colorMask(false, true, false, false);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, R.numParticles[R.scene]);

    gl.colorMask(false, false, true, false);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, R.numParticles[R.scene]);

    gl.colorMask(false, false, false, true);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, R.numParticles[R.scene]);

    gl.disable(gl.STENCIL_TEST);
    gl.depthFunc(gl.LESS);
    gl.colorMask(true, true, true, true);
    gl.enable(gl.BLEND);
    gl.clearColor(0.8, 0.8, 0.8, 1);
  };

  var calculateForces = function (state, prog, source, gridSource, target) {
    gl.useProgram(prog.prog);

    gl.bindFramebuffer(gl.FRAMEBUFFER, R["fbo" + target]);
    gl.disable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(
      0,
      0,
      R.particleSideLength[R.scene],
      R.particleSideLength[R.scene]
    );

    gl.uniform1i(prog.u_particleSideLength, R.particleSideLength[R.scene]);
    gl.uniform1f(prog.u_diameter, R.particleSize[R.scene]);
    gl.uniform1f(prog.u_dt, R.timeStep);
    gl.uniform1f(prog.u_bound, R.bound[R.scene]);

    gl.uniform1f(prog.u_k, R.k[R.scene]);
    gl.uniform1f(prog.u_kT, R.kT[R.scene]);
    gl.uniform1f(prog.u_kBody, R.kBody);
    gl.uniform1f(prog.u_kBound, R.kBound[R.scene]);
    gl.uniform1f(prog.u_n, R.n[R.scene]);
    gl.uniform1f(prog.u_nBody, R.nBody);
    gl.uniform1f(prog.u_nBound, R.nBound[R.scene]);
    gl.uniform1f(prog.u_u, R.u[R.scene]);
    gl.uniform1i(prog.u_scene, R.scene[R.scene]);

    gl.uniform1f(prog.u_gridSideLength, R.gridBound[R.scene] * 2);
    gl.uniform1i(prog.u_gridNumCellsPerSide, R.gridInfo.numCellsPerSide);
    gl.uniform1i(prog.u_gridTexSize, R.gridInfo.gridTexWidth);
    gl.uniform1i(
      prog.u_gridTexTileDimensions,
      R.gridInfo.gridTexTileDimensions
    );
    gl.uniform1f(prog.u_gridCellSize, R.gridInfo.gridCellSize);

    bindTextures(
      prog,
      [prog.u_posTex, prog.u_velTex, prog.u_relPosTex, prog.u_gridTex],
      [
        R["particlePosTex" + source],
        R["particleVelTex" + source],
        R["relativePosTex" + source],
        R["gridTex" + gridSource],
      ]
    );

    renderFullScreenQuad(prog);
    gl.enable(gl.BLEND);
  };

  var updateEuler = function (state, stateSource, forceSource, target) {
    var prog = R.progEuler;
    gl.useProgram(prog.prog);

    gl.bindFramebuffer(gl.FRAMEBUFFER, R["fbo" + target]);
    gl.disable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(
      0,
      0,
      R.particleSideLength[R.scene],
      R.particleSideLength[R.scene]
    );

    gl.uniform1f(prog.u_dt, R.timeStep);

    bindTextures(
      prog,
      [
        prog.u_posTex,
        prog.u_velTex,
        prog.u_forceTex,
        prog.u_relPosTex,
        prog.u_linearMomentumTex,
        prog.u_angularMomentumTex,
      ],
      [
        R["particlePosTex" + stateSource],
        R["particleVelTex" + stateSource],
        R["forceTex" + forceSource],
        R["relativePosTex" + stateSource],
        R["linearMomentumTex" + stateSource],
        R["angularMomentumTex" + stateSource],
      ]
    );

    renderFullScreenQuad(prog);
    gl.enable(gl.BLEND);
  };

  var calculateBodyForces = function (state, stateSource, forceSource, target) {
    var prog = R.progBodyForces;
    gl.useProgram(prog.prog);

    gl.bindFramebuffer(gl.FRAMEBUFFER, R["bodyFBO" + target]);
    gl.disable(gl.BLEND);

    gl.viewport(0, 0, R.bodySideLength[R.scene], R.bodySideLength[R.scene]);

    gl.uniform1i(prog.u_particleSideLength, R.particleSideLength[R.scene]);

    bindTextures(
      prog,
      [
        prog.u_posTex,
        prog.u_forceTex,
        prog.u_bodyPosTex,
        prog.u_bodyRotTex,
        prog.u_bodyForceTex,
        prog.u_bodyTorqueTex,
        prog.u_linearMomentumTex,
        prog.u_angularMomentumTex,
      ],
      [
        R["particlePosTex" + stateSource],
        R["forceTex" + forceSource],
        R["bodyPosTex" + stateSource],
        R["bodyRotTex" + stateSource],
        R["bodyForceTex" + forceSource],
        R["bodyTorqueTex" + forceSource],
        R["linearMomentumTex" + stateSource],
        R["angularMomentumTex" + stateSource],
      ]
    );

    renderFullScreenQuad(prog);
    gl.enable(gl.BLEND);
  };

  var updateBodyEuler = function (state, stateSource, forceSource, target) {
    var prog = R.progBodyEuler;
    gl.useProgram(prog.prog);

    gl.bindFramebuffer(gl.FRAMEBUFFER, R["bodyFBO" + target]);
    gl.disable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, R.bodySideLength[R.scene], R.bodySideLength[R.scene]);

    gl.uniform1i(prog.u_particleSideLength, R.particleSideLength[R.scene]);
    gl.uniform1f(prog.u_diameter, R.particleSize[R.scene]);
    gl.uniform1f(prog.u_dt, R.timeStep);

    bindTextures(
      prog,
      [
        prog.u_posTex,
        prog.u_bodyPosTex,
        prog.u_bodyRotTex,
        prog.u_bodyForceTex,
        prog.u_bodyTorqueTex,
        prog.u_linearMomentumTex,
        prog.u_angularMomentumTex,
      ],
      [
        R["particlePosTex" + stateSource],
        R["bodyPosTex" + stateSource],
        R["bodyRotTex" + stateSource],
        R["bodyForceTex" + forceSource],
        R["bodyTorqueTex" + forceSource],
        R["linearMomentumTex" + stateSource],
        R["angularMomentumTex" + stateSource],
      ]
    );

    renderFullScreenQuad(prog);
    gl.enable(gl.BLEND);
  };

  var updateParticlesRK2 = function (
    state,
    prog,
    pos,
    vel_1,
    force_1,
    vel_2,
    force_2,
    target
  ) {
    gl.useProgram(prog.prog);

    gl.bindFramebuffer(gl.FRAMEBUFFER, R["fbo" + target]);
    gl.disable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(
      0,
      0,
      R.particleSideLength[R.scene],
      R.particleSideLength[R.scene]
    );

    gl.uniform1f(prog.u_diameter, R.particleSize[R.scene]);
    gl.uniform1f(prog.u_dt, R.timeStep);

    bindTextures(
      prog,
      [
        prog.u_posTex,
        prog.u_velTex1,
        prog.u_forceTex1,
        prog.u_velTex2,
        prog.u_forceTex2,
        prog.u_relPosTex,
      ],
      [
        R["particlePosTex" + pos],
        R["particleVelTex" + vel_1],
        R["forceTex" + force_1],
        R["particleVelTex" + vel_2],
        R["forceTex" + force_2],
        R["relativePosTex" + pos],
      ]
    );

    renderFullScreenQuad(prog);
    gl.enable(gl.BLEND);
  };

  var updateBodyRK2 = function (
    state,
    prog,
    pos,
    vel_1,
    force_1,
    vel_2,
    force_2,
    target
  ) {
    gl.useProgram(prog.prog);

    gl.bindFramebuffer(gl.FRAMEBUFFER, R["bodyFBO" + target]);
    gl.disable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, R.bodySideLength[R.scene], R.bodySideLength[R.scene]);

    gl.uniform1i(prog.u_particleSideLength, R.particleSideLength[R.scene]);
    gl.uniform1f(prog.u_diameter, R.particleSize[R.scene]);
    gl.uniform1f(prog.u_dt, R.timeStep);

    bindTextures(
      prog,
      [
        prog.u_posTex,
        prog.u_bodyPosTex,
        prog.u_bodyRotTex,
        prog.u_forceTex_1,
        prog.u_forceTex_2,
        prog.u_torqueTex_1,
        prog.u_torqueTex_2,
        prog.u_linearMomentumTex_1,
        prog.u_linearMomentumTex_2,
        prog.u_angularMomentumTex_1,
        prog.u_angularMomentumTex_2,
      ],
      [
        R["particlePosTex" + pos],
        R["bodyPosTex" + pos],
        R["bodyRotTex" + pos],
        R["bodyForceTex" + force_1],
        R["bodyForceTex" + force_2],
        R["bodyTorqueTex" + force_1],
        R["bodyTorqueTex" + force_2],
        R["linearMomentumTex" + vel_1],
        R["linearMomentumTex" + vel_2],
        R["angularMomentumTex" + vel_1],
        R["angularMomentumTex" + vel_2],
      ]
    );

    renderFullScreenQuad(prog);
    gl.enable(gl.BLEND);
  };

  var renderParticles = function (state, prog) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.useProgram(prog.prog);

    gl.uniformMatrix4fv(prog.u_cameraMat, false, state.cameraMat.elements);

    gl.uniform1i(prog.u_particleSideLength, R.particleSideLength[R.scene]);
    gl.uniform1i(prog.u_bodySideLength, R.bodySideLength[R.scene]);
    gl.uniform1f(prog.u_diameter, R.particleSize[R.scene]);
    gl.uniform1f(prog.u_nearPlaneHeight, R.nearPlaneHeight);
    gl.uniform3f(
      prog.u_cameraPos,
      state.cameraPos.x,
      state.cameraPos.y,
      state.cameraPos.z
    );
    gl.uniform1f(prog.u_fovy, R.fovy);

    gl.enableVertexAttribArray(prog.a_idx);
    gl.bindBuffer(gl.ARRAY_BUFFER, R.indices[R.scene]);
    gl.vertexAttribPointer(prog.a_idx, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, R.intIndices[R.scene]);

    bindTextures(
      prog,
      [prog.u_posTex, prog.u_relPosTex],
      [R.particlePosTexA, R.relativePosTexA]
    );

    gl.drawArrays(gl.POINTS, 0, R.numParticles[R.scene]);
  };

  var bindTextures = function (prog, location, tex) {
    gl.useProgram(prog.prog);

    for (var i = 0; i < tex.length; i++) {
      gl.activeTexture(gl["TEXTURE" + i]);
      gl.bindTexture(gl.TEXTURE_2D, tex[i]);
      gl.uniform1i(location[i], i);
    }
  };

  var swap = function (property, a, b) {
    var temp = R[property + a];
    R[property + a] = R[property + b];
    R[property + b] = temp;
  };

  var pingPong = function (a, b) {
    swap("particlePosTex", a, b);
    swap("particleVelTex", a, b);
    swap("forceTex", a, b);
    swap("relativePosTex", a, b);
    swap("fbo", a, b);
  };

  var pingPongBody = function (a, b) {
    swap("bodyFBO", a, b);
    swap("bodyPosTex", a, b);
    swap("bodyRotTex", a, b);
    swap("bodyForceTex", a, b);
    swap("bodyTorqueTex", a, b);
    swap("linearMomentumTex", a, b);
    swap("angularMomentumTex", a, b);
  };

  var drawModels = function (state) {
    for (var i = 0; i < state.models.length; i++) {
      var m = state.models[i];
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.useProgram(R.progAmbient.prog);

      gl.uniformMatrix4fv(
        R.progAmbient.u_cameraMat,
        false,
        state.cameraMat.elements
      );
      bindTextures(
        R.progAmbient,
        [R.progAmbient.u_posTex],
        [R.particlePosTexA]
      );

      readyModelForDraw(R.progAmbient, m);
      drawReadyModel(m);
    }
  };

  var drawDebug = function () {
    if (cfg.debugTexture) {
      var prog = R.progDebug;
      gl.useProgram(prog.prog);
      gl.viewport(0, 0, 128 * 4, 128 * 2);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.uniform1i(prog.u_particleSideLength, R.particleSideLength[R.scene]);
      bindTextures(
        prog,
        [
          prog.u_posTex,
          prog.u_velTex,
          prog.u_forceTex,
          prog.u_gridTex,
          prog.u_bodyPosTex,
          prog.u_bodyRotTex,
          prog.u_linearMomentumTex,
          prog.u_angularMomentumTex,
          prog.u_relPosTex,
          prog.u_bodyForceTex,
          prog.u_bodyTorqueTex,
        ],
        [
          R.particlePosTexA,
          R.particleVelTexA,
          R.forceTexRK2_B,
          R.gridTexA,
          R.bodyPosTexA,
          R.bodyRotTexA,
          R.linearMomentumTexA,
          R.angularMomentumTexA,
          R.relativePosTexA,
          R.bodyForceTexRK2_B,
          R.bodyTorqueTexRK2_B,
        ]
      );
      renderFullScreenQuad(R.progDebug);
    }
  };

  var renderFullScreenQuad = (function () {
    var positions = new Float32Array([
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
    ]);

    var vbo = null;

    var init = function () {
      vbo = gl.createBuffer();

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    };

    return function (prog) {
      if (!vbo) {
        init();
      }

      gl.useProgram(prog.prog);

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.enableVertexAttribArray(prog.a_position);
      gl.vertexAttribPointer(prog.a_position, 2, gl.FLOAT, gl.FALSE, 0, 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
  })();
})();
