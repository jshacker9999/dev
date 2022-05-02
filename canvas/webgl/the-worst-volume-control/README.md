# THE WORST VOLUME CONTROL CHALLENGE

<img src="./canvas/webgl/the-worst-volume-control/preview.JPG" width="640">

## Introduction

An exploration of designing intentionally bad interfaced to control the volume, inspired from a [thread](https://www.reddit.com/r/ProgrammerHumor/search?q=volume&restrict_sr=on) in [r/ProgrammerHumor](https://www.reddit.com/r/ProgrammerHumor/).

For the simplicity of sharing, This app is designed with Javascript tested running on Safari(11.1.1)/Chrome(66.0.3359.181)/Firefox(Quantum 59.0.2) on macOS(Sierra 10.12.6 / Retina Mid 2012).

## Process

Here are the keywords that I started with :

- Throw slider itself
- Resize slider
- Domino - Set 100 pieces of domino without mistakes
- Using social network - the number of comments
- Twitter bot reply change the volume
- Where the hot cities are - search city and the temperature is the volume
- Fireworks - the volume controller is actually fireworks launcher. Spark of fireworks has number, click it, it's the volume
- etc

And I set the 4 criteria to decide, they are following :

- Uniqueness : Something hasn't done by others
- Annoyingness : Make it hard to control
- Playfulness : Yet make a playful experience
- Relevance : Not to go too far

Since this thread is more than a year old, there are so many idea done already by other designers and developers. The most of my idea was similarly done by others. The domino, city's temperature, and fireworks were the candidates that I was about to go with but I thought none of them didn't satisfy all four criteria and a bit contrived. Then all of sudden, I came across [an old flash game](http://gamemonster.tistory.com/114) which pulling the nose hair out is the all about.

I'm somehow really attached to this idea and thinking it really makes sense to drive volume to the peak by pulling your nose hair cause the pain will be staying and building up like the volume so it's relevant to the volume control experience. It's not done by anyone yet from the original thread. Pulling out nose hair is all about annoyingness and painfulness but somehow satisfying. So I decided to go with this idea.

My initial plan was making this as realistic as possible but I didn't want to upset anyone's feeling so I decided to take the nuance of it's experience and to apply to more acceptable visuals by using a friendly monkey emoji and by changing hairs to droplets.

Since it's a fun challenge, might as well I decided to design 1 additional volume slider besides of the monkey, which contains multiple interactions to control the volume. Also the monkey and the slider are linked and working together.

In order to make a coherent experience with those two interfaces, I made the very minimal visual hints following :

- Shape : Circles are clickable/draggable
- Color : Red is down, blue is up
- Movement : Dangle the droplets to let users know it is interactable

Lastly, I chose to use the music [Lascia Ch'io Pianga](https://www.youtube.com/watch?v=WuSiuMuBLhM) from the movie [Farinelli](https://www.imdb.com/title/tt0109771/) which doesn't really related with this experience but I like it's english title "Let me weep" and I personally somehow feel it really goes well with the experience.

## Experiences

This app contains 5 ways to control the volume, they are following :

Pull the droplets from the nose. The length of each droplet-line-to-nose is intensity of changing volume.  
<img src="./canvas/webgl/the-worst-volume-control/preview0.gif" width="320">

If the droplets are over the threshold, +-20% volume changes.  
<img src="./canvas/webgl/the-worst-volume-control/preview1.gif" width="320">

Drag the volume handler to lauch.  
<img src="./canvas/webgl/the-worst-volume-control/preview2.gif" width="320">

Change the lenth of volume bar, the proportion of the position of volume handler defines volume.  
<img src="./canvas/webgl/the-worst-volume-control/preview3.gif" width="320">

Change the incline to change the volume by gravity.  
<img src="./canvas/webgl/the-worst-volume-control/preview4.gif" width="320">
