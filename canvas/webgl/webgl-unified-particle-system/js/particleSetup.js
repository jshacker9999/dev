(function () {
  "use strict";

  window.R = {};

  R.setupBuffers = function () {
    setupBuffers("A");
    setupBuffers("RK2_A");
    setupBuffers("RK2_B");
    setupBuffers("RK2_C");
    setupBuffers("B");

    generateGrid("A");
    generateGrid("B");
  };

  R.particleSetup = function () {
    R.scene = 1;
    initParticleData(0);
    initRigidBodyData(0);
    initFunnelParticleData(1);
    initFunnelRigidBodyData(1);
    initPileParticleData(2);
    initPileRigidBodyData(2);
    initPushParticleData(3);
    initPushRigidBodyData(3);
    initDuckParticleData(4);
    initDuckRigidBodyData(4);
    initRender();
    R.setupBuffers();
    R.toReset = false;
  };

  R.initBuffers = function () {
    R.numParticles = [];
    R.particleSideLength = [];
    R.particlePositions = [];
    R.particleVelocities = [];
    R.forces = [];
    R.indices = [];
    R.intIndices = [];
    R.particleSize = [];
    R.bound = [];
    R.gridBound = [];
    R.k = [];
    R.kT = [];
    R.kBound = [];
    R.n = [];
    R.nBound = [];
    R.u = [];
    R.rigidBodiesEnabled = [];
    R.rigidBodiesStatic = [];
    R.bodyParticleMass = [];
    R.numBodies = [];
    R.bodySideLength = [];
    R.bodyPositions = [];
    R.bodyOrientations = [];
    R.bodyForces = [];
    R.bodyTorques = [];
    R.relativePositions = [];
    R.linearMomenta = [];
    R.angularMomenta = [];
  };

  var initParticleData = function (sceneIndex) {
    var exp = 12;
    if (exp % 2 != 0) {
      throw new Error("Texture side is not a power of two!");
    }
    R.numParticles[sceneIndex] = Math.pow(2, exp);
    R.particleSideLength[sceneIndex] = Math.sqrt(R.numParticles[sceneIndex]);

    var positions = [];

    var particleMass = 1.0;
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      positions.push(
        Math.random() * 1.0 - 0.5,
        Math.random() * 1.0 + 0.0,
        Math.random() * 1.0 - 0.5,
        particleMass
      );
    }
    R.particlePositions[sceneIndex] = positions;

    var velocities = [];
    var velBounds = {
      min: -0.2,
      max: 0.2,
    };

    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      velocities.push(
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        1.0
      );
    }
    R.particleVelocities[sceneIndex] = velocities;

    var forces = [];
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      forces.push(0.0, 0.0, 0.0, 1.0);
    }
    R.forces[sceneIndex] = forces;

    var indices = [];
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      indices[i] = i;
    }
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(indices), gl.STATIC_DRAW);
    R.indices[sceneIndex] = indexBuffer;

    R.timeStep = 0.01;

    R.particleSize[sceneIndex] = 0.1;
    R.bound[sceneIndex] = 0.5;
    R.gridBound[sceneIndex] = R.bound[sceneIndex] * 1.1;

    R.k[sceneIndex] = 800.0;
    R.kT[sceneIndex] = 5.0;
    R.kBound[sceneIndex] = 2000.0;
    R.n[sceneIndex] = 8.0;
    R.nBound[sceneIndex] = 40.0;
    R.u[sceneIndex] = 0.4;
  };
  var initRigidBodyData = function (sceneIndex) {
    R.rigidBodiesEnabled[sceneIndex] = false;
    R.rigidBodiesStatic[sceneIndex] = false;
    R.bodyParticleMass[sceneIndex] = 0.3;
    var exp = 2;
    if (exp % 2 != 0) {
      throw new Error("Texture side is not a power of two!");
    }
    R.numBodies[sceneIndex] = R.rigidBodiesEnabled[sceneIndex]
      ? Math.pow(2, exp)
      : 0;
    R.bodySideLength[sceneIndex] = R.rigidBodiesEnabled[sceneIndex]
      ? Math.sqrt(R.numBodies[sceneIndex])
      : 0;
    var particlesPerBody = 9;
    if (
      particlesPerBody * R.numBodies[sceneIndex] >
      R.numParticles[sceneIndex]
    ) {
      throw new Error("More body particles than available particles!");
    }

    var gridBounds = {
      min: 1,
      max: 2,
    };

    var positions = [];
    for (var i = 0; i < R.numBodies[sceneIndex]; i++) {
      positions.push(
        Math.random() * (gridBounds.max - gridBounds.min) -
          gridBounds.min / 2.0,
        0.8 + i / 4.0,
        Math.random() * (gridBounds.max - gridBounds.min) -
          gridBounds.min / 2.0,
        particlesPerBody * i
      );
    }
    R.bodyPositions[sceneIndex] = positions;

    var orientations = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      orientations.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyOrientations[sceneIndex] = orientations;

    var forces = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      forces.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyForces[sceneIndex] = forces;

    var torques = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      torques.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyTorques[sceneIndex] = torques;

    var linearMomenta = Array(R.numBodies[sceneIndex] * 4).fill(0.0);
    var angularMomenta = Array(R.numBodies[sceneIndex] * 4).fill(0.0);

    var relativePositions = Array(R.numParticles[sceneIndex] * 4).fill(-1.0);
    if (R.rigidBodiesEnabled[sceneIndex]) {
      var index = 0;
      for (var i = 0; i < R.numBodies[sceneIndex]; i++) {
        for (var x = 0; x < 2; x++) {
          for (var y = 0; y < 2; y++) {
            for (var z = 0; z < 2; z++) {
              relativePositions[index] =
                x * R.particleSize[sceneIndex] -
                R.particleSize[sceneIndex] / 2.0;
              relativePositions[index + 1] =
                y * R.particleSize[sceneIndex] -
                R.particleSize[sceneIndex] / 2.0;
              relativePositions[index + 2] =
                z * R.particleSize[sceneIndex] -
                R.particleSize[sceneIndex] / 2.0;
              relativePositions[index + 3] = i;
              R.particlePositions[sceneIndex][index + 3] =
                R.bodyParticleMass[sceneIndex];
              index += 4;
            }
          }
        }
        relativePositions[index] = 0;
        relativePositions[index + 1] = 0;
        relativePositions[index + 2] = 0;
        relativePositions[index + 3] = i;
        R.particlePositions[sceneIndex][index + 3] =
          R.bodyParticleMass[sceneIndex];
        linearMomenta[4 * i + 3] = particlesPerBody;

        index += 4;
      }
    }
    R.relativePositions[sceneIndex] = relativePositions;
    R.linearMomenta[sceneIndex] = linearMomenta;
    R.angularMomenta[sceneIndex] = angularMomenta;
  };

  var initFunnelParticleData = function (sceneIndex) {
    var exp = 12;
    if (exp % 2 != 0) {
      throw new Error("Texture side is not a power of two!");
    }
    R.numParticles[sceneIndex] = Math.pow(2, exp);
    R.particleSideLength[sceneIndex] = Math.sqrt(R.numParticles[sceneIndex]);

    var positions = [];

    var particleMass = 1.5;
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      positions.push(-10, -10, -10, particleMass);
    }
    R.particlePositions[sceneIndex] = positions;

    var velocities = [];
    var velBounds = {
      min: -0.2,
      max: 0.2,
    };

    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      velocities.push(
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        0.0
      );
    }
    R.particleVelocities[sceneIndex] = velocities;

    var forces = [];
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      forces.push(0.0, 0.0, 0.0, 1.0);
    }
    R.forces[sceneIndex] = forces;

    var indices = [];
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      indices[i] = i;
    }
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(indices), gl.STATIC_DRAW);
    R.indices[sceneIndex] = indexBuffer;

    R.timeStep = 0.01;

    R.particleSize[sceneIndex] = 0.05;
    R.bound[sceneIndex] = 1.1;
    R.gridBound[sceneIndex] = R.bound[sceneIndex] * 1.1;
    R.time = 0.0;

    R.k[sceneIndex] = 500.0;
    R.kT[sceneIndex] = 5.0;
    R.kBody = 2000.0;
    R.kBound[sceneIndex] = 10000.0;
    R.n[sceneIndex] = 5.0;
    R.nBody = 20.0;
    R.nBound[sceneIndex] = 200.0;
    R.u[sceneIndex] = 1.0;
  };
  var initFunnelRigidBodyData = function (sceneIndex) {
    R.rigidBodiesEnabled[sceneIndex] = true;
    R.rigidBodiesStatic[sceneIndex] = true;
    R.bodyParticleMass[sceneIndex] = 0.3;
    var exp = 0;
    if (exp % 2 != 0) {
      throw new Error("Texture side is not a power of two!");
    }
    R.numBodies[sceneIndex] = R.rigidBodiesEnabled[sceneIndex]
      ? Math.pow(2, exp)
      : 0;
    R.bodySideLength[sceneIndex] = R.rigidBodiesEnabled[sceneIndex]
      ? Math.sqrt(R.numBodies[sceneIndex])
      : 0;
    var particlesPerBody = 0;
    if (
      particlesPerBody * R.numBodies[sceneIndex] >
      R.numParticles[sceneIndex]
    ) {
      throw new Error("More body particles than available particles!");
    }

    var positions = [];
    for (var i = 0; i < R.numBodies[sceneIndex]; i++) {
      positions.push(0.0, 0.4, 0.0, 0.0);
    }
    R.bodyPositions[sceneIndex] = positions;

    var orientations = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      orientations.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyOrientations[sceneIndex] = orientations;

    var forces = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      forces.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyForces[sceneIndex] = forces;

    var torques = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      torques.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyTorques[sceneIndex] = torques;

    var linearMomenta = Array(R.numBodies[sceneIndex] * 4).fill(0.0);
    var angularMomenta = Array(R.numBodies[sceneIndex] * 4).fill(0.0);

    var relativePositions = Array(R.numParticles[sceneIndex] * 4).fill(-1.0);
    if (R.rigidBodiesEnabled[sceneIndex]) {
      var index = 0;
      var createCircle = function (y, rad, offset) {
        var numParticles = Math.floor(
          (2.0 * Math.PI * rad) / R.particleSize[sceneIndex]
        );
        var angle = (0.0174533 * 360.0) / numParticles;
        var angleOffset = offset ? angle * 0.5 : 0.0;

        for (var i = 0; i < numParticles; i++) {
          relativePositions[index] = Math.sin(i * angle + angleOffset) * rad;
          relativePositions[index + 1] = y;
          relativePositions[index + 2] =
            Math.cos(i * angle + angleOffset) * rad;
          relativePositions[index + 3] = 0;
          R.particlePositions[sceneIndex][index + 3] =
            R.bodyParticleMass[sceneIndex];
          index += 4;
        }
        particlesPerBody += numParticles;
      };
      for (var y = 0; y < 20; y++) {
        if (y >= 6) {
          createCircle(
            y * R.particleSize[sceneIndex],
            1.2 * R.particleSize[sceneIndex] +
              ((y - 4) / 12) * 4 * R.particleSize[sceneIndex],
            false
          );
          createCircle(
            y * R.particleSize[sceneIndex] + 0.5 * R.particleSize[sceneIndex],
            1.5 * R.particleSize[sceneIndex] +
              ((y - 4) / 12) * 4 * R.particleSize[sceneIndex],
            true
          );
          createCircle(
            y * R.particleSize[sceneIndex],
            1.2 * R.particleSize[sceneIndex] +
              ((y - 4) / 12) * 4 * R.particleSize[sceneIndex],
            true
          );
          createCircle(
            y * R.particleSize[sceneIndex] + 0.5 * R.particleSize[sceneIndex],
            1.5 * R.particleSize[sceneIndex] +
              ((y - 4) / 12) * 4 * R.particleSize[sceneIndex],
            false
          );
        }
      }
    }

    R.relativePositions[sceneIndex] = relativePositions;
    linearMomenta[3] = particlesPerBody;
    R.linearMomenta[sceneIndex] = linearMomenta;
    R.angularMomenta[sceneIndex] = angularMomenta;
  };

  var initPileParticleData = function (sceneIndex) {
    var exp = 12;
    if (exp % 2 != 0) {
      throw new Error("Texture side is not a power of two!");
    }
    R.numParticles[sceneIndex] = Math.pow(2, exp);
    R.particleSideLength[sceneIndex] = Math.sqrt(R.numParticles[sceneIndex]);

    var positions = [];

    var particleMass = 1.0;
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      positions.push(
        Math.random() * 2.0 - 1.0,
        Math.random() * 1.0 + 0.5,
        Math.random() * 2.0 - 1.0,
        particleMass
      );
    }
    R.particlePositions[sceneIndex] = positions;

    var velocities = [];
    var velBounds = {
      min: -0.2,
      max: 0.2,
    };

    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      velocities.push(
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        1.0
      );
    }
    R.particleVelocities[sceneIndex] = velocities;

    var forces = [];
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      forces.push(0.0, 0.0, 0.0, 1.0);
    }
    R.forces[sceneIndex] = forces;

    var indices = [];
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      indices[i] = i;
    }
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(indices), gl.STATIC_DRAW);
    R.indices[sceneIndex] = indexBuffer;

    R.timeStep = 0.01;

    R.particleSize[sceneIndex] = 0.1;
    R.bound[sceneIndex] = 2.3;
    R.gridBound[sceneIndex] = R.bound[sceneIndex] * 1.1;

    R.k[sceneIndex] = 1200.0;
    R.kT[sceneIndex] = 5.0;
    R.kBody = 1300.0;
    R.kBound[sceneIndex] = 2000.0;
    R.n[sceneIndex] = 4.0;
    R.nBody = 8.0;
    R.nBound[sceneIndex] = 40.0;
    R.u[sceneIndex] = 0.8;
  };
  var initPileRigidBodyData = function (sceneIndex) {
    R.rigidBodiesEnabled[sceneIndex] = true;
    R.rigidBodiesStatic[sceneIndex] = false;
    R.bodyParticleMass[sceneIndex] = 0.6;
    var exp = 8;
    if (exp % 2 != 0) {
      throw new Error("Texture side is not a power of two!");
    }
    R.numBodies[sceneIndex] = R.rigidBodiesEnabled[sceneIndex]
      ? Math.pow(2, exp)
      : 0;
    R.bodySideLength[sceneIndex] = R.rigidBodiesEnabled[sceneIndex]
      ? Math.sqrt(R.numBodies[sceneIndex])
      : 0;
    var particlesPerBody = 9;
    if (
      particlesPerBody * R.numBodies[sceneIndex] >
      R.numParticles[sceneIndex]
    ) {
      throw new Error("More body particles than available particles!");
    }

    var gridBounds = {
      min: 1,
      max: 2,
    };

    var positions = [];
    for (var i = 0; i < R.numBodies[sceneIndex]; i++) {
      positions.push(
        Math.random() * (gridBounds.max - gridBounds.min) -
          gridBounds.min / 2.0,
        0.8 + i / 40.0,
        Math.random() * (gridBounds.max - gridBounds.min) -
          gridBounds.min / 2.0,
        particlesPerBody * i
      );
    }
    R.bodyPositions[sceneIndex] = positions;

    var orientations = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      orientations.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyOrientations[sceneIndex] = orientations;

    var forces = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      forces.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyForces[sceneIndex] = forces;

    var torques = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      torques.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyTorques[sceneIndex] = torques;

    var linearMomenta = Array(R.numBodies[sceneIndex] * 4).fill(0.0);
    var angularMomenta = Array(R.numBodies[sceneIndex] * 4).fill(0.0);

    var relativePositions = Array(R.numParticles[sceneIndex] * 4).fill(-1.0);
    if (R.rigidBodiesEnabled[sceneIndex]) {
      var index = 0;
      for (var i = 0; i < R.numBodies[sceneIndex]; i++) {
        for (var x = 0; x < 2; x++) {
          for (var y = 0; y < 2; y++) {
            for (var z = 0; z < 2; z++) {
              relativePositions[index] =
                x * R.particleSize[sceneIndex] -
                R.particleSize[sceneIndex] / 2.0;
              relativePositions[index + 1] =
                y * R.particleSize[sceneIndex] -
                R.particleSize[sceneIndex] / 2.0;
              relativePositions[index + 2] =
                z * R.particleSize[sceneIndex] -
                R.particleSize[sceneIndex] / 2.0;
              relativePositions[index + 3] = i;
              R.particlePositions[sceneIndex][index + 3] =
                R.bodyParticleMass[sceneIndex];
              index += 4;
            }
          }
        }
        relativePositions[index] = 0;
        relativePositions[index + 1] = 0;
        relativePositions[index + 2] = 0;
        relativePositions[index + 3] = i;
        R.particlePositions[sceneIndex][index + 3] =
          R.bodyParticleMass[sceneIndex];
        linearMomenta[4 * i + 3] = particlesPerBody;

        index += 4;
      }
    }
    R.relativePositions[sceneIndex] = relativePositions;
    R.linearMomenta[sceneIndex] = linearMomenta;
    R.angularMomenta[sceneIndex] = angularMomenta;
  };

  var initPushParticleData = function (sceneIndex) {
    var exp = 10;
    if (exp % 2 != 0) {
      throw new Error("Texture side is not a power of two!");
    }
    R.numParticles[sceneIndex] = Math.pow(2, exp);
    R.particleSideLength[sceneIndex] = Math.sqrt(R.numParticles[sceneIndex]);

    var positions = [];

    var particleMass = 0.8;
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      positions.push(
        Math.random() * 2.0 - 1.0,
        Math.random() * 1.0 + 0.5,
        Math.random() * 2.0 - 1.0,
        particleMass
      );
    }
    R.particlePositions[sceneIndex] = positions;

    var velocities = [];
    var velBounds = {
      min: 0.0,
      max: 0.0,
    };

    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      velocities.push(
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        1.0
      );
    }
    R.particleVelocities[sceneIndex] = velocities;

    var forces = [];
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      forces.push(0.0, 0.0, 0.0, 1.0);
    }
    R.forces[sceneIndex] = forces;

    var indices = [];
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      indices[i] = i;
    }

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(indices), gl.STATIC_DRAW);
    var intIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, intIndexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW
    );
    R.indices[sceneIndex] = indexBuffer;
    R.intIndices[sceneIndex] = intIndexBuffer;

    R.timeStep = 0.01;

    R.particleSize[sceneIndex] = 0.1;
    R.bound[sceneIndex] = 1.1;
    R.gridBound[sceneIndex] = R.bound[sceneIndex] * 1.1;
    R.time = 0.0;

    R.k[sceneIndex] = 1200.0;
    R.kT[sceneIndex] = 5.0;
    R.kBody = 1600.0;
    R.kBound[sceneIndex] = 2000.0;
    R.n[sceneIndex] = 4.0;
    R.nBody = R.n[sceneIndex];
    R.nBound[sceneIndex] = 40.0;
    R.u[sceneIndex] = 0.4;
  };
  var initPushRigidBodyData = function (sceneIndex) {
    R.rigidBodiesEnabled[sceneIndex] = true;
    R.rigidBodiesStatic[sceneIndex] = true;
    R.bodyParticleMass[sceneIndex] = 0.3;
    var exp = 0;
    if (exp % 2 != 0) {
      throw new Error("Texture side is not a power of two!");
    }
    R.numBodies[sceneIndex] = R.rigidBodiesEnabled[sceneIndex]
      ? Math.pow(2, exp)
      : 0;
    R.bodySideLength[sceneIndex] = R.rigidBodiesEnabled[sceneIndex]
      ? Math.sqrt(R.numBodies[sceneIndex])
      : 0;

    var particlesPerBody = 0;
    if (
      particlesPerBody * R.numBodies[sceneIndex] >
      R.numParticles[sceneIndex]
    ) {
      throw new Error("More body particles than available particles!");
    }

    var positions = [];
    for (var i = 0; i < R.numBodies[sceneIndex]; i++) {
      positions.push(0.2, 0.2, -0.2, particlesPerBody * i);
    }
    R.bodyPositions[sceneIndex] = positions;

    var orientations = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      orientations.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyOrientations[sceneIndex] = orientations;

    var forces = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      forces.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyForces[sceneIndex] = forces;

    var torques = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      torques.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyTorques[sceneIndex] = torques;

    var linearMomenta = Array(R.numBodies[sceneIndex] * 4).fill(0.0);
    var angularMomenta = Array(R.numBodies[sceneIndex] * 4).fill(0.0);

    var relativePositions = Array(R.numParticles[sceneIndex] * 4).fill(-1.0);
    if (R.rigidBodiesEnabled[sceneIndex]) {
      var index = 0;
      for (var i = 0; i < R.numBodies[sceneIndex]; i++) {
        for (var z = 0; z < 8; z++) {
          for (var x = 0; x < 3; x++) {
            for (var y = 0; y < (x == 1 ? 4 : 3); y++) {
              relativePositions[index] =
                -R.particleSize[sceneIndex] / 2.0 -
                R.particleSize[sceneIndex] * 3.0 +
                x * R.particleSize[sceneIndex];
              relativePositions[index + 1] =
                -R.particleSize[sceneIndex] / 2.0 -
                R.particleSize[sceneIndex] * 2.0 +
                y * R.particleSize[sceneIndex];
              relativePositions[index + 2] =
                -R.particleSize[sceneIndex] + z * R.particleSize[sceneIndex];
              relativePositions[index + 3] = i;
              R.particlePositions[sceneIndex][index + 3] =
                R.bodyParticleMass[sceneIndex];
              index += 4;
              particlesPerBody++;
            }
          }
        }
        for (var z = 0; z < 7; z++) {
          for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 2; x++) {
              relativePositions[index] =
                -R.particleSize[sceneIndex] * 3.0 +
                x * R.particleSize[sceneIndex];
              relativePositions[index + 1] =
                -R.particleSize[sceneIndex] * 2.0 +
                y * R.particleSize[sceneIndex];
              relativePositions[index + 2] =
                -R.particleSize[sceneIndex] / 2.0 +
                z * R.particleSize[sceneIndex];
              relativePositions[index + 3] = i;
              R.particlePositions[sceneIndex][index + 3] =
                R.bodyParticleMass[sceneIndex];
              index += 4;
              particlesPerBody++;
            }
          }
        }
        console.log(particlesPerBody);
        linearMomenta[4 * i + 3] = particlesPerBody;
      }
    }
    console.log(relativePositions);
    R.relativePositions[sceneIndex] = relativePositions;
    R.linearMomenta[sceneIndex] = linearMomenta;
    R.angularMomenta[sceneIndex] = angularMomenta;
  };

  var initDuckParticleData = function (sceneIndex) {
    var exp = 12;
    if (exp % 2 != 0) {
      throw new Error("Texture side is not a power of two!");
    }
    R.numParticles[sceneIndex] = Math.pow(2, exp);
    R.particleSideLength[sceneIndex] = Math.sqrt(R.numParticles[sceneIndex]);

    var positions = [];

    var particleMass = 0.8;
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      positions.push(
        Math.random() * 2.0 - 1.0,
        Math.random() * 0.5,
        Math.random() * 2.0 - 1.0,
        particleMass
      );
    }
    R.particlePositions[sceneIndex] = positions;

    var velocities = [];
    var velBounds = {
      min: 0.0,
      max: 0.0,
    };

    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      velocities.push(
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        Math.random() * (velBounds.max - velBounds.min) + velBounds.min,
        1.0
      );
    }
    R.particleVelocities[sceneIndex] = velocities;

    var forces = [];
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      forces.push(0.0, 0.0, 0.0, 1.0);
    }
    R.forces[sceneIndex] = forces;

    var indices = [];
    for (var i = 0; i < R.numParticles[sceneIndex]; i++) {
      indices[i] = i;
    }
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(indices), gl.STATIC_DRAW);
    R.indices[sceneIndex] = indexBuffer;

    R.timeStep = 0.01;

    R.particleSize[sceneIndex] = 0.1;
    R.bound[sceneIndex] = 1.0;
    R.gridBound[sceneIndex] = R.bound[sceneIndex] * 1.1;
    R.time = 0.0;

    R.k[sceneIndex] = 1200.0;
    R.kT[sceneIndex] = 5.0;
    R.kBody = 1600.0;
    R.kBound[sceneIndex] = 2000.0;
    R.n[sceneIndex] = 4.0;
    R.nBody = R.n[sceneIndex];
    R.nBound[sceneIndex] = 40.0;
    R.u[sceneIndex] = 0.4;
  };

  var initDuckRigidBodyData = function (sceneIndex) {
    R.rigidBodiesEnabled[sceneIndex] = true;
    R.rigidBodiesStatic[sceneIndex] = false;
    R.bodyParticleMass[sceneIndex] = 0.3;
    var exp = 0;
    if (exp % 2 != 0) {
      throw new Error("Texture side is not a power of two!");
    }
    R.numBodies[sceneIndex] = R.rigidBodiesEnabled[sceneIndex]
      ? Math.pow(2, exp)
      : 0;
    R.bodySideLength[sceneIndex] = R.rigidBodiesEnabled[sceneIndex]
      ? Math.sqrt(R.numBodies[sceneIndex])
      : 0;
    var particlesPerBody = 0;
    if (
      particlesPerBody * R.numBodies[sceneIndex] >
      R.numParticles[sceneIndex]
    ) {
      throw new Error("More body particles than available particles!");
    }

    var positions = [];

    var orientations = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      orientations.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyOrientations[sceneIndex] = orientations;

    var forces = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      forces.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyForces[sceneIndex] = forces;

    var torques = [];
    for (i = 0; i < R.numBodies[sceneIndex]; i++) {
      torques.push(0.0, 0.0, 0.0, 1.0);
    }
    R.bodyTorques[sceneIndex] = torques;

    var linearMomenta = Array(R.numBodies[sceneIndex] * 4).fill(0.0);
    var angularMomenta = Array(R.numBodies[sceneIndex] * 4).fill(0.0);

    var relativePositions = Array(R.numParticles[sceneIndex] * 4).fill(-1.0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, R["meshParticlesFBOVoxelduck"]);
    var pixels = new Float32Array(
      R.gridTexSideLength * R.gridTexSideLength * 4
    );
    gl.readPixels(
      0,
      0,
      R.gridTexSideLength,
      R.gridTexSideLength,
      gl.RGBA,
      gl.FLOAT,
      pixels
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (R.rigidBodiesEnabled[sceneIndex]) {
      for (var i = 0; i < R.numBodies[sceneIndex]; i++) {
        var index = 0;
        var particlesPerBody = 0;
        for (var k = 0; k < pixels.length; k++) {
          if (pixels[k] != 0) {
            var pixelIdx = k / 4;
            var scale = 1.0;
            var x = pixelIdx % R.gridSideLength;
            x /= R.gridSideLength;
            x *= scale;
            x -= scale / 2;

            var y = Math.floor(pixelIdx / R.gridSideLength) % R.gridSideLength;
            y /= R.gridSideLength;
            y *= scale;
            y -= scale / 2;

            var z = Math.floor(pixelIdx / Math.pow(R.gridSideLength, 2));
            z /= R.gridSideLength;
            z *= scale;
            z -= scale / 2;

            relativePositions[index] = x;
            relativePositions[index + 1] = y;
            relativePositions[index + 2] = z;
            relativePositions[index + 3] = i;
            R.particlePositions[sceneIndex][index + 3] =
              R.bodyParticleMass[sceneIndex];
            index += 4;
            particlesPerBody++;
          }
        }
        positions.push(0.0, 1.5 + i / 4.0, 0.0, particlesPerBody * i);
        linearMomenta[4 * i + 3] = particlesPerBody;
      }
    }

    R.bodyPositions[sceneIndex] = positions;
    R.relativePositions[sceneIndex] = relativePositions;
    R.linearMomenta[sceneIndex] = linearMomenta;
    R.angularMomenta[sceneIndex] = angularMomenta;
  };

  var computeInertiaTensors = function () {
    var inertiaTensors = [];
    for (var i = 0; i < R.numBodies[sceneIndex]; i++) {
      var w_idx = 4 * i + 3;

      var mass = R.bodyParticleMass[R.scene];

      var startIndex = R.bodyPositions[R.scene][w_idx];

      var numParticles = R.linearMomenta[R.scene][w_idx];

      var particleInertia = Array(9).fill(0.0);
      for (var j = startIndex; j < startIndex + numParticles; j++) {
        var rx = R.relativePositions[R.scene][4 * j];
        var ry = R.relativePositions[R.scene][4 * j + 1];
        var rz = R.relativePositions[R.scene][4 * j + 2];

        particleInertia[0] += mass * (ry * ry + rz * rz);
        particleInertia[1] += -1 * mass * ry * rx;
        particleInertia[2] += -1 * mass * rz * rx;
        particleInertia[3] += -1 * mass * rx * ry;
        particleInertia[4] += mass * (rx * rx + rz * rz);
        particleInertia[5] += -1 * mass * rz * ry;
        particleInertia[6] += -1 * mass * rx * rz;
        particleInertia[7] += -1 * mass * ry * rz;
        particleInertia[8] += mass * (rx * rx + ry * ry);
      }

      inertiaTensors.push.apply(inertiaTensors, particleInertia);
    }

    R.inertiaTensors = inertiaTensors;
  };

  var initRender = function () {
    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.enable(gl.DEPTH_TEST);
  };

  var setupBuffers = function (id) {
    R["fbo" + id] = gl.createFramebuffer();

    R["particlePosTex" + id] = createAndBindTexture(
      R["fbo" + id],
      gl_draw_buffers.COLOR_ATTACHMENT0_WEBGL,
      R.particleSideLength[R.scene],
      R.particleSideLength[R.scene],
      R.particlePositions[R.scene]
    );

    R["particleVelTex" + id] = createAndBindTexture(
      R["fbo" + id],
      gl_draw_buffers.COLOR_ATTACHMENT1_WEBGL,
      R.particleSideLength[R.scene],
      R.particleSideLength[R.scene],
      R.particleVelocities[R.scene]
    );

    R["forceTex" + id] = createAndBindTexture(
      R["fbo" + id],
      gl_draw_buffers.COLOR_ATTACHMENT2_WEBGL,
      R.particleSideLength[R.scene],
      R.particleSideLength[R.scene],
      R.forces[R.scene]
    );

    R["relativePosTex" + id] = createAndBindTexture(
      R["fbo" + id],
      gl_draw_buffers.COLOR_ATTACHMENT3_WEBGL,
      R.particleSideLength[R.scene],
      R.particleSideLength[R.scene],
      R.relativePositions[R.scene]
    );

    abortIfFramebufferIncomplete(R["fbo" + id]);
    gl_draw_buffers.drawBuffersWEBGL([
      gl_draw_buffers.COLOR_ATTACHMENT0_WEBGL,
      gl_draw_buffers.COLOR_ATTACHMENT1_WEBGL,
      gl_draw_buffers.COLOR_ATTACHMENT2_WEBGL,
      gl_draw_buffers.COLOR_ATTACHMENT3_WEBGL,
    ]);

    if (R.rigidBodiesEnabled[R.scene]) {
      R["bodyFBO" + id] = gl.createFramebuffer();

      R["bodyPosTex" + id] = createAndBindTexture(
        R["bodyFBO" + id],
        gl_draw_buffers.COLOR_ATTACHMENT0_WEBGL,
        R.bodySideLength[R.scene],
        R.bodySideLength[R.scene],
        R.bodyPositions[R.scene]
      );

      R["bodyRotTex" + id] = createAndBindTexture(
        R["bodyFBO" + id],
        gl_draw_buffers.COLOR_ATTACHMENT1_WEBGL,
        R.bodySideLength[R.scene],
        R.bodySideLength[R.scene],
        R.bodyOrientations[R.scene]
      );

      R["bodyForceTex" + id] = createAndBindTexture(
        R["bodyFBO" + id],
        gl_draw_buffers.COLOR_ATTACHMENT2_WEBGL,
        R.bodySideLength[R.scene],
        R.bodySideLength[R.scene],
        R.bodyForces[R.scene]
      );

      R["bodyTorqueTex" + id] = createAndBindTexture(
        R["bodyFBO" + id],
        gl_draw_buffers.COLOR_ATTACHMENT3_WEBGL,
        R.bodySideLength[R.scene],
        R.bodySideLength[R.scene],
        R.bodyTorques[R.scene]
      );

      R["linearMomentumTex" + id] = createAndBindTexture(
        R["bodyFBO" + id],
        gl_draw_buffers.COLOR_ATTACHMENT4_WEBGL,
        R.bodySideLength[R.scene],
        R.bodySideLength[R.scene],
        R.linearMomenta[R.scene]
      );

      R["angularMomentumTex" + id] = createAndBindTexture(
        R["bodyFBO" + id],
        gl_draw_buffers.COLOR_ATTACHMENT5_WEBGL,
        R.bodySideLength[R.scene],
        R.bodySideLength[R.scene],
        R.angularMomenta[R.scene]
      );

      abortIfFramebufferIncomplete(R["bodyFBO" + id]);
      gl_draw_buffers.drawBuffersWEBGL([
        gl_draw_buffers.COLOR_ATTACHMENT0_WEBGL,
        gl_draw_buffers.COLOR_ATTACHMENT1_WEBGL,
        gl_draw_buffers.COLOR_ATTACHMENT2_WEBGL,
        gl_draw_buffers.COLOR_ATTACHMENT3_WEBGL,
        gl_draw_buffers.COLOR_ATTACHMENT4_WEBGL,
        gl_draw_buffers.COLOR_ATTACHMENT5_WEBGL,
      ]);
    }
  };

  var generateGrid = function (id) {
    R["gridFBO" + id] = gl.createFramebuffer();
    R.gridInfo = {};

    R.gridInfo.gridCellSize = R.particleSize[R.scene];
    R.gridInfo.numCellsPerSide = Math.ceil(
      (R.gridBound[R.scene] * 2) / R.gridInfo.gridCellSize
    );

    R.gridInfo.gridTexTileDimensions = Math.ceil(
      Math.sqrt(R.gridInfo.numCellsPerSide)
    );
    R.gridInfo.gridTexWidth =
      R.gridInfo.gridTexTileDimensions * R.gridInfo.numCellsPerSide;

    var gridVals = [];
    for (var i = 0; i < Math.pow(R.gridInfo.gridTexWidth, 2); i++) {
      gridVals.push(0.0, 0.0, 0.0, 0.0);
    }

    R["gridTex" + id] = createAndBindTexture(
      R["gridFBO" + id],
      gl_draw_buffers.COLOR_ATTACHMENT0_WEBGL,
      R.gridInfo.gridTexWidth,
      R.gridInfo.gridTexWidth,
      gridVals
    );

    createAndBindDepthStencilBuffer(
      R["gridFBO" + id],
      R.gridInfo.gridTexWidth,
      R.gridInfo.gridTexWidth
    );

    abortIfFramebufferIncomplete(R["gridFBO" + id]);
  };

  var generateParticlesFromMesh = function (id, gridSideLength) {
    if (
      !R.progParticleFromMeshDepth ||
      !R.progDebug ||
      !R.progParticleFromMeshVoxel
    ) {
      window.requestAnimationFrame(function () {
        generateParticlesFromMesh(id, gridSideLength);
      });
      return;
    }
    var localR = {};
    localR["meshParticlesFBO" + id] = gl.createFramebuffer();
    R["meshParticlesFBOVoxel" + id] = gl.createFramebuffer();
    var gridTexTileDimensions = Math.ceil(Math.sqrt(gridSideLength));
    R.gridTexSideLength = gridTexTileDimensions * gridSideLength;
    R.gridSideLength = gridSideLength;

    localR["meshParticlesTex" + id + "0"] = createAndBindTexture(
      localR["meshParticlesFBO" + id],
      gl_draw_buffers.COLOR_ATTACHMENT0_WEBGL,
      R.gridTexSideLength,
      R.gridTexSideLength,
      null
    );
    localR["meshParticlesTex" + id + "1"] = createAndBindTexture(
      localR["meshParticlesFBO" + id],
      gl_draw_buffers.COLOR_ATTACHMENT1_WEBGL,
      R.gridTexSideLength,
      R.gridTexSideLength,
      null
    );
    R["meshParticlesTex" + id] = createAndBindTexture(
      R["meshParticlesFBOVoxel" + id],
      gl_draw_buffers.COLOR_ATTACHMENT0_WEBGL,
      R.gridTexSideLength,
      R.gridTexSideLength,
      null
    );

    abortIfFramebufferIncomplete(localR["meshParticlesFBO" + id]);
    abortIfFramebufferIncomplete(R["meshParticlesFBOVoxel" + id]);

    createAndBindDepthStencilBuffer(
      localR["meshParticlesFBO" + id],
      R.gridTexSideLength,
      R.gridTexSideLength
    );

    gl.useProgram(R.progParticleFromMeshDepth.prog);
    gl.viewport(0, 0, R.gridTexSideLength, R.gridTexSideLength);
    gl.bindFramebuffer(gl.FRAMEBUFFER, localR["meshParticlesFBO" + id]);

    gl_draw_buffers.drawBuffersWEBGL([
      gl_draw_buffers.COLOR_ATTACHMENT0_WEBGL,
      gl_draw_buffers.COLOR_ATTACHMENT1_WEBGL,
      gl_draw_buffers.COLOR_ATTACHMENT2_WEBGL,
    ]);

    var orthoMat = new THREE.Matrix4();
    var width = 2;
    var height = 2;
    var camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      20
    );
    camera.position.set(0, 1, 10);
    camera.up = new THREE.Vector3(0, 1, 0);
    camera.lookAt(new THREE.Vector3(0, 1, 0));

    camera.updateMatrixWorld();
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    orthoMat.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );

    gl.uniformMatrix4fv(
      R.progParticleFromMeshDepth.u_cameraMat,
      false,
      orthoMat.elements
    );
    readyModelForDraw(R.progParticleFromMeshDepth, R.model);

    gl.uniform1i(R.progParticleFromMeshDepth.u_texID, 0);
    gl.depthFunc(gl.LESS);
    gl.drawElements(
      R.model.gltf.mode,
      R.model.gltf.indices.length,
      R.model.gltf.indicesComponentType,
      0
    );

    gl.uniform1i(R.progParticleFromMeshDepth.u_texID, 1);
    gl.disable(gl.CULL_FACE);
    gl.depthFunc(gl.GREATER);
    gl.drawElements(
      R.model.gltf.mode,
      R.model.gltf.indices.length,
      R.model.gltf.indicesComponentType,
      0
    );

    gl.depthFunc(gl.LESS);
    gl.enable(gl.CULL_FACE);

    gl.useProgram(R.progParticleFromMeshVoxel.prog);
    gl.viewport(0, 0, R.gridTexSideLength, R.gridTexSideLength);
    gl.bindFramebuffer(gl.FRAMEBUFFER, R["meshParticlesFBOVoxel" + id]);
    gl.disable(gl.BLEND);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    var orthoMatInv = new THREE.Matrix4();
    orthoMatInv.getInverse(orthoMat);

    gl.uniformMatrix4fv(
      R.progParticleFromMeshVoxel.u_cameraMat,
      false,
      orthoMat.elements
    );
    gl.uniformMatrix4fv(
      R.progParticleFromMeshVoxel.u_cameraMatInv,
      false,
      orthoMatInv.elements
    );
    gl.uniform1f(R.progParticleFromMeshVoxel.u_gridSideLength, gridSideLength);
    gl.uniform1f(
      R.progParticleFromMeshVoxel.u_gridTexSideLength,
      R.gridTexSideLength
    );
    gl.uniform1f(R.progParticleFromMeshVoxel.u_gridWorldBounds, width);
    gl.uniform2fv(R.progParticleFromMeshVoxel.u_gridWorldLowerLeft, [
      camera.position.x - width * 0.5,
      camera.position.y - height * 0.5,
    ]);

    gl.activeTexture(gl["TEXTURE0"]);
    gl.bindTexture(gl.TEXTURE_2D, localR["meshParticlesTex" + id + "0"]);
    gl.uniform1i(R.progParticleFromMeshVoxel.u_tex0, 0);

    gl.activeTexture(gl["TEXTURE1"]);
    gl.bindTexture(gl.TEXTURE_2D, localR["meshParticlesTex" + id + "1"]);
    gl.uniform1i(R.progParticleFromMeshVoxel.u_tex1, 1);

    renderFullScreenQuad(R.progParticleFromMeshVoxel);
    gl.enable(gl.BLEND);

    R.particleSetup();
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

  /**
   * Loads all of the shader programs used in the pipeline.
   */
  R.loadAllShaderPrograms = function () {
    loadShaderProgram(
      gl,
      "glsl/particle/quad.vert.glsl",
      "glsl/particle/forces.frag.glsl",
      function (prog) {
        var p = { prog: prog };

        p.u_posTex = gl.getUniformLocation(prog, "u_posTex");
        p.u_velTex = gl.getUniformLocation(prog, "u_velTex");
        p.u_relPosTex = gl.getUniformLocation(prog, "u_relPosTex");
        p.u_particleSideLength = gl.getUniformLocation(prog, "u_particleSide");
        p.u_diameter = gl.getUniformLocation(prog, "u_diameter");
        p.u_dt = gl.getUniformLocation(prog, "u_dt");
        p.u_bound = gl.getUniformLocation(prog, "u_bound");
        p.u_scene = gl.getUniformLocation(prog, "u_scene");
        p.a_position = gl.getAttribLocation(prog, "a_position");

        p.u_k = gl.getUniformLocation(prog, "u_k");
        p.u_kT = gl.getUniformLocation(prog, "u_kT");
        p.u_kBody = gl.getUniformLocation(prog, "u_kBody");
        p.u_kBound = gl.getUniformLocation(prog, "u_kBound");
        p.u_n = gl.getUniformLocation(prog, "u_n");
        p.u_nBody = gl.getUniformLocation(prog, "u_nBody");
        p.u_nBound = gl.getUniformLocation(prog, "u_nBound");
        p.u_u = gl.getUniformLocation(prog, "u_u");

        p.u_gridTex = gl.getUniformLocation(prog, "u_gridTex");
        p.u_gridSideLength = gl.getUniformLocation(prog, "u_gridSideLength");
        p.u_gridNumCellsPerSide = gl.getUniformLocation(
          prog,
          "u_gridNumCellsPerSide"
        );
        p.u_gridTexSize = gl.getUniformLocation(prog, "u_gridTexSize");
        p.u_gridTexTileDimensions = gl.getUniformLocation(
          prog,
          "u_gridTexTileDimensions"
        );
        p.u_gridCellSize = gl.getUniformLocation(prog, "u_gridCellSize");

        R.progPhysics = p;
      }
    );

    loadShaderProgram(
      gl,
      "glsl/particle/particle.vert.glsl",
      "glsl/particle/particle.frag.glsl",
      function (prog) {
        var p = { prog: prog };

        p.u_cameraMat = gl.getUniformLocation(prog, "u_cameraMat");
        p.u_cameraPos = gl.getUniformLocation(prog, "u_cameraPos");
        p.u_fovy = gl.getUniformLocation(prog, "u_fovy");
        p.u_posTex = gl.getUniformLocation(prog, "u_posTex");
        p.u_relPosTex = gl.getUniformLocation(prog, "u_relPosTex");
        p.u_bodyPosTex = gl.getUniformLocation(prog, "u_bodyPosTex");
        p.u_particleSideLength = gl.getUniformLocation(prog, "u_side");
        p.u_bodySideLength = gl.getUniformLocation(prog, "u_bodySide");
        p.u_diameter = gl.getUniformLocation(prog, "u_diameter");
        p.u_nearPlaneHeight = gl.getUniformLocation(prog, "u_nearPlaneHeight");
        p.a_idx = gl.getAttribLocation(prog, "a_idx");

        R.progParticle = p;
      }
    );

    loadShaderProgram(
      gl,
      "glsl/particle/quad.vert.glsl",
      "glsl/particle/euler.frag.glsl",
      function (prog) {
        var p = { prog: prog };

        p.u_posTex = gl.getUniformLocation(prog, "u_posTex");
        p.u_velTex = gl.getUniformLocation(prog, "u_velTex");
        p.u_forceTex = gl.getUniformLocation(prog, "u_forceTex");
        p.u_relPosTex = gl.getUniformLocation(prog, "u_relPosTex");
        p.u_dt = gl.getUniformLocation(prog, "u_dt");
        p.a_position = gl.getAttribLocation(prog, "a_position");

        R.progEuler = p;
      }
    );

    loadShaderProgram(
      gl,
      "glsl/particle/quad.vert.glsl",
      "glsl/object/bodyEuler.frag.glsl",
      function (prog) {
        var p = { prog: prog };

        p.u_posTex = gl.getUniformLocation(prog, "u_posTex");
        p.u_bodyPosTex = gl.getUniformLocation(prog, "u_bodyPosTex");
        p.u_bodyRotTex = gl.getUniformLocation(prog, "u_bodyRotTex");
        p.u_bodyForceTex = gl.getUniformLocation(prog, "u_bodyForceTex");
        p.u_bodyTorqueTex = gl.getUniformLocation(prog, "u_bodyTorqueTex");
        p.u_linearMomentumTex = gl.getUniformLocation(
          prog,
          "u_linearMomentumTex"
        );
        p.u_angularMomentumTex = gl.getUniformLocation(
          prog,
          "u_angularMomentumTex"
        );
        p.u_particleSideLength = gl.getUniformLocation(prog, "u_particleSide");
        p.u_diameter = gl.getUniformLocation(prog, "u_diameter");
        p.u_dt = gl.getUniformLocation(prog, "u_dt");

        p.a_position = gl.getAttribLocation(prog, "a_position");

        R.progBodyEuler = p;
      }
    );

    loadShaderProgram(
      gl,
      "glsl/particle/quad.vert.glsl",
      "glsl/object/bodyForces.frag.glsl",
      function (prog) {
        var p = { prog: prog };

        p.u_posTex = gl.getUniformLocation(prog, "u_posTex");
        p.u_forceTex = gl.getUniformLocation(prog, "u_forceTex");
        p.u_bodyPosTex = gl.getUniformLocation(prog, "u_bodyPosTex");
        p.u_bodyRotTex = gl.getUniformLocation(prog, "u_bodyRotTex");
        p.u_bodyForceTex = gl.getUniformLocation(prog, "u_bodyForceTex");
        p.u_bodyTorqueTex = gl.getUniformLocation(prog, "u_bodyTorqueTex");
        p.u_linearMomentumTex = gl.getUniformLocation(
          prog,
          "u_linearMomentumTex"
        );
        p.u_angularMomentumTex = gl.getUniformLocation(
          prog,
          "u_angularMomentumTex"
        );
        p.u_particleSideLength = gl.getUniformLocation(prog, "u_particleSide");
        p.a_position = gl.getAttribLocation(prog, "a_position");

        R.progBodyForces = p;
      }
    );

    loadShaderProgram(
      gl,
      "glsl/particle/quad.vert.glsl",
      "glsl/particle/rk2.frag.glsl",
      function (prog) {
        var p = { prog: prog };

        p.u_posTex = gl.getUniformLocation(prog, "u_posTex");
        p.u_velTex1 = gl.getUniformLocation(prog, "u_velTex1");
        p.u_forceTex1 = gl.getUniformLocation(prog, "u_forceTex1");
        p.u_velTex2 = gl.getUniformLocation(prog, "u_velTex2");
        p.u_forceTex2 = gl.getUniformLocation(prog, "u_forceTex2");
        p.u_relPosTex = gl.getUniformLocation(prog, "u_relPosTex");
        p.u_diameter = gl.getUniformLocation(prog, "u_diameter");
        p.u_dt = gl.getUniformLocation(prog, "u_dt");
        p.a_position = gl.getAttribLocation(prog, "a_position");

        R.progRK2 = p;
      }
    );

    loadShaderProgram(
      gl,
      "glsl/particle/quad.vert.glsl",
      "glsl/object/bodyRK2.frag.glsl",
      function (prog) {
        var p = { prog: prog };

        p.u_posTex = gl.getUniformLocation(prog, "u_posTex");
        p.u_bodyPosTex = gl.getUniformLocation(prog, "u_bodyPosTex");
        p.u_bodyRotTex = gl.getUniformLocation(prog, "u_bodyRotTex");
        p.u_forceTex_1 = gl.getUniformLocation(prog, "u_forceTex_1");
        p.u_forceTex_2 = gl.getUniformLocation(prog, "u_forceTex_2");
        p.u_torqueTex_1 = gl.getUniformLocation(prog, "u_torqueTex_1");
        p.u_torqueTex_2 = gl.getUniformLocation(prog, "u_torqueTex_2");
        p.u_linearMomentumTex_1 = gl.getUniformLocation(
          prog,
          "u_linearMomentumTex_1"
        );
        p.u_linearMomentumTex_2 = gl.getUniformLocation(
          prog,
          "u_linearMomentumTex_2"
        );
        p.u_angularMomentumTex_1 = gl.getUniformLocation(
          prog,
          "u_angularMomentumTex_1"
        );
        p.u_angularMomentumTex_2 = gl.getUniformLocation(
          prog,
          "u_angularMomentumTex_2"
        );
        p.u_particleSideLength = gl.getUniformLocation(prog, "u_particleSide");
        p.u_diameter = gl.getUniformLocation(prog, "u_diameter");
        p.u_dt = gl.getUniformLocation(prog, "u_dt");
        p.a_position = gl.getAttribLocation(prog, "a_position");

        R.progBodyRK2 = p;
      }
    );

    loadShaderProgram(
      gl,
      "glsl/particle/quad.vert.glsl",
      "glsl/particle/debug.frag.glsl",
      function (prog) {
        var p = { prog: prog };

        p.u_posTex = gl.getUniformLocation(prog, "u_posTex");
        p.u_velTex = gl.getUniformLocation(prog, "u_velTex");
        p.u_forceTex = gl.getUniformLocation(prog, "u_forceTex");
        p.u_gridTex = gl.getUniformLocation(prog, "u_gridTex");
        p.u_bodyPosTex = gl.getUniformLocation(prog, "u_bodyPosTex");
        p.u_bodyRotTex = gl.getUniformLocation(prog, "u_bodyRotTex");
        p.u_linearMomentumTex = gl.getUniformLocation(
          prog,
          "u_linearMomentumTex"
        );
        p.u_angularMomentumTex = gl.getUniformLocation(
          prog,
          "u_angularMomentumTex"
        );
        p.u_relPosTex = gl.getUniformLocation(prog, "u_relPosTex");

        p.u_bodyForceTex = gl.getUniformLocation(prog, "u_bodyForceTex");
        p.u_bodyTorqueTex = gl.getUniformLocation(prog, "u_bodyTorqueTex");
        p.a_position = gl.getAttribLocation(prog, "a_position");

        R.progDebug = p;
      }
    );

    loadShaderProgram(
      gl,
      "glsl/particle/quad.vert.glsl",
      "glsl/object/setup.frag.glsl",
      function (prog) {
        var p = { prog: prog };

        p.u_posTex = gl.getUniformLocation(prog, "u_posTex");
        p.u_velTex = gl.getUniformLocation(prog, "u_velTex");
        p.u_forceTex = gl.getUniformLocation(prog, "u_forceTex");
        p.u_bodyPosTex = gl.getUniformLocation(prog, "u_bodyPosTex");
        p.u_bodyRotTex = gl.getUniformLocation(prog, "u_bodyRotTex");
        p.u_relPosTex = gl.getUniformLocation(prog, "u_relPosTex");
        p.u_linearMomentumTex = gl.getUniformLocation(
          prog,
          "u_linearMomentumTex"
        );
        p.u_angularMomentumTex = gl.getUniformLocation(
          prog,
          "u_angularMomentumTex"
        );
        p.u_particleSideLength = gl.getUniformLocation(prog, "u_particleSide");
        p.u_bodySide = gl.getUniformLocation(prog, "u_bodySide");
        p.u_time = gl.getUniformLocation(prog, "u_time");
        p.u_scene = gl.getUniformLocation(prog, "u_scene");
        p.a_position = gl.getAttribLocation(prog, "a_position");

        R.progSetup = p;
      }
    );

    loadShaderProgram(
      gl,
      "glsl/object/ambient.vert.glsl",
      "glsl/object/ambient.frag.glsl",
      function (prog) {
        var p = { prog: prog };

        p.u_cameraMat = gl.getUniformLocation(prog, "u_cameraMat");
        p.u_posTex = gl.getUniformLocation(prog, "u_posTex");
        p.a_position = gl.getAttribLocation(prog, "a_position");
        p.a_normal = gl.getAttribLocation(prog, "a_normal");
        p.a_uv = gl.getAttribLocation(prog, "a_uv");

        R.progAmbient = p;
      }
    );

    loadShaderProgram(
      gl,
      "glsl/grid.vert.glsl",
      "glsl/grid.frag.glsl",
      function (prog) {
        var p = { prog: prog };

        p.u_posTex = gl.getUniformLocation(prog, "u_posTex");
        p.u_posTexSize = gl.getUniformLocation(prog, "u_posTexSize");
        p.u_gridSideLength = gl.getUniformLocation(prog, "u_gridSideLength");
        p.u_gridNumCellsPerSide = gl.getUniformLocation(
          prog,
          "u_gridNumCellsPerSide"
        );
        p.u_gridTexSize = gl.getUniformLocation(prog, "u_gridTexSize");
        p.u_gridTexTileDimensions = gl.getUniformLocation(
          prog,
          "u_gridTexTileDimensions"
        );
        p.u_gridCellSize = gl.getUniformLocation(prog, "u_gridCellSize");
        p.a_idx = gl.getAttribLocation(prog, "a_idx");

        R.progGrid = p;
      }
    );

    loadShaderProgram(
      gl,
      "glsl/object/particleFromMesh/depth.vert.glsl",
      "glsl/object/particleFromMesh/depth.frag.glsl",
      function (prog) {
        var p = { prog: prog };

        p.u_texID = gl.getUniformLocation(prog, "u_texID");
        p.u_cameraMat = gl.getUniformLocation(prog, "u_cameraMat");
        p.a_position = gl.getUniformLocation(prog, "a_position");

        R.progParticleFromMeshDepth = p;
      }
    );

    loadShaderProgram(
      gl,
      "glsl/particle/quad.vert.glsl",
      "glsl/object/particleFromMesh/voxel.frag.glsl",
      function (prog) {
        var p = { prog: prog };

        p.u_tex0 = gl.getUniformLocation(prog, "u_tex0");
        p.u_tex1 = gl.getUniformLocation(prog, "u_tex1");
        p.u_cameraMat = gl.getUniformLocation(prog, "u_cameraMat");
        p.u_cameraMatInv = gl.getUniformLocation(prog, "u_cameraMatInv");
        p.u_gridSideLength = gl.getUniformLocation(prog, "u_gridSideLength");
        p.u_gridTexSideLength = gl.getUniformLocation(
          prog,
          "u_gridTexSideLength"
        );
        p.u_gridWorldBounds = gl.getUniformLocation(prog, "u_gridWorldBounds");
        p.u_gridWorldLowerLeft = gl.getUniformLocation(
          prog,
          "u_gridWorldLowerLeft"
        );

        p.a_position = gl.getUniformLocation(prog, "a_position");

        R.progParticleFromMeshVoxel = p;
        generateParticlesFromMesh("duck", 12);
      }
    );
  };

  var createAndBindTexture = function (
    fbo,
    attachment,
    sideLengthx,
    sideLengthy,
    data
  ) {
    var tex = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, tex);

    if (data) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        sideLengthx,
        sideLengthy,
        0,
        gl.RGBA,
        gl.FLOAT,
        new Float32Array(data)
      );
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        sideLengthx,
        sideLengthy,
        0,
        gl.RGBA,
        gl.FLOAT,
        null
      );
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, tex, 0);

    return tex;
  };

  var createAndBindDepthStencilBuffer = function (
    fbo,
    sideLengthx,
    sideLengthy
  ) {
    var depthStencil = gl.createRenderbuffer();

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthStencil);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_STENCIL,
      sideLengthx,
      sideLengthy
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_STENCIL_ATTACHMENT,
      gl.RENDERBUFFER,
      depthStencil
    );

    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };
})();
