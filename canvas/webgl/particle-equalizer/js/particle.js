// Global variables
/*var MAX_PARTICLES = 5;
var MAX_LIFETIME = 50;
var particleSystem;
var lastTime; 
*/

/** 
	Particle definition
*/
function Particle(position, velocity) {
	this.position = position;
	this.velocity = velocity;
	this.lifetime = 0; 
}

Particle.prototype.removeParticle = function() {

	var index = particleSystem.indexOf(this);
	if (index > -1) {
		    particleSystem.splice(index, 1);
	}	
};


/** 
	Particle system definition
*/
var ParticleSystem = function() {
	particleSystem = new Array();

	particleSystem.addParticle = function() {

		var position = $V([0.0, 0.0, 0.0]);
		var velocity = $V([0.3, 0.1, 0.2]);

		particleSystem.push(new Particle(position, velocity));
	};

	particleSystem.advancePositions = function() {
		//TODO - ändra positionerna på alla partiklar i systemet.
		var timeNow = new Date().getTime()/1000;
		var time = timeNow - lastTime;

		for(var i = 0; i < MAX_PARTICLES; i++) {
			particleSystem[i].position = particleSystem[i].position.add(particleSystem[i].velocity.multiply(time));
		}

		lastTime = timeNow;

	};

	particleSystem.tickLifetime = function() {
		//TODO - Lägg till ett på alla partiklars lifetime
		for(var i = 0; i < particleSystem.length; i++) {
			if (particleSystem[i].lifetime > MAX_LIFETIME) {
				particleSystem[i].removeParticle();
			} else {
				particleSystem[i].lifetime += 1;	
			}
			
		}
	};

	return particleSystem;
};


/**
	Force
*/
function Force() {

}


/** 
	Test function
*/
function particleTest() {
	
	// Initialize lastTime
	lastTime = new Date().getTime()/1000;

	var particleSystem = new ParticleSystem();

	for(var i = 0; i < MAX_PARTICLES; i++) {		
		particleSystem.addParticle();
	}

	//particleSystem.advancePositions();
}

