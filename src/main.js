import { gsap, Power4 } from 'gsap';
import './main.css';

class SectionAnimation {
    constructor(sections) {
        this.colors = [
            '#ff0000',
            '#00ff00',
            '#0000ff',
        ],
        this.sections = sections;
        this.animations = [
            this.matrixAnimation,
            this.randomPattern,
            this.particleWeb,
        ];

        this.init();
    }

    init() {
        for (let i = 0; i < this.sections.length; i++) {
            const section = this.sections[i];
            
            if (i < this.animations.length) {
                this.animations[i](section);
            } else {
                this.animations[i % this.animations.length](section);
            }
        }

        // loop through sections except for the last one
        for (let i = 0; i < this.sections.length; i++) {
            const section = this.sections[i];
            const canvas = section.querySelector('canvas');
            const ctx = canvas.getContext('2d');
            const color = this.colors[i];
            const rect = section.getBoundingClientRect();

            const offset = i * window.innerHeight;
            canvas.style.transform = `translateY(${offset}px)`;

            canvas.width = rect.width;
            canvas.height = rect.height;

            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    resetCanvas() {
        for (let i = 0; i < this.sections.length; i++) {
            const section = this.sections[i];
            const canvas = section.querySelector('canvas');
            const rect = section.getBoundingClientRect();

            canvas.width = rect.width;
            canvas.height = rect.height;
            const offset = i * window.innerHeight;
            canvas.style.transform = `translateY(${offset}px)`;
        }
    }

    matrixAnimation(section) {
        const canvas = section.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const fontSize = 20;
        const columns = width / fontSize;
        const drops = [];
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }

        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = '#0f0';
            ctx.font = `${fontSize}px arial`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }

                drops[i]++;
            }
        }

        setInterval(draw, 33);
    }

    randomPattern(section) {
        const canvas = section.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const circles = [];
        const cellSize = 250;
        
        class Circle {
            constructor(id, x, y, radius, color, velocity) {
                this.id = id;
                this.x = x;
                this.y = y;
                this.radius = radius;
                this.color = color;
                this.mass = radius^2;
                this.velocity = velocity;
            }

            draw() {
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);

                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); // Inner color with higher opacity
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Outer color with lower opacity
                ctx.fillStyle = gradient;

                const shadowColor = 'rgba(0, 0, 0, 0.5)';
                const highlightColor = 'rgba(255, 255, 255, 0.5)';

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                ctx.fillStyle = this.color;
                ctx.fill();
                ctx.closePath();
            }

            update() {
                this.draw();
                this.x += this.velocity.x;
                this.y += this.velocity.y;

                // if circle hits the edge of the canvas, reverse its velocity
                if (this.x > width - this.radius){
                    let diff = this.x - (width - this.radius);
                    this.x -= diff;
                    this.velocity.x *= -1;
                } else if (this.x < this.radius) {
                    let diff = this.radius - this.x;
                    this.x = this.radius + diff;
                    this.velocity.x *= -1;
                }

                if (this.y > height - this.radius){
                    let diff = this.y - (height - this.radius);
                    this.y -= diff;
                    this.velocity.y *= -1;
                } else if (this.y < this.radius) {
                    let diff = this.radius - this.y;
                    this.y = this.radius + diff;
                    this.velocity.y *= -1;
                }
            }
        }

        function init() {
            let id = 0;
            for (let x = 0; x < width; x += cellSize) {
                for (let y = 0; y < height; y += cellSize) {
                    const radius = Math.random() * 30 + 30;
                    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
                    const velocity = {
                        x: Math.sign(Math.random() - 0.5) * (Math.random()*0.7 + 0.3),
                        y: Math.sign(Math.random() - 0.5) * (Math.random()*0.7 + 0.3)
                    }

                    circles.push(new Circle(id++, x, y, radius, color, velocity));
                }
            }
        }

        function animate() {
            // file a layer of black on top of the circles
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fillRect(0, 0, width, height);
            
            circles.forEach(circle => circle.update());

            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            requestAnimationFrame(animate);
            detectCollision();
        }

        function detectCollision() {
            circles.forEach(circle => {
                circles.forEach(otherCircle => {
                    if (circle === otherCircle) {
                        return;
                    }

                    const dx = circle.x - otherCircle.x;
                    const dy = circle.y - otherCircle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // this part is working, but the collision feels not very natural
                    // I changed to repulsion approach, looks better
                    
                    // if (distance <= circle.radius + otherCircle.radius) {
                    //     let overlap = distance - circle.radius - otherCircle.radius

                    //     let separactionVector = {
                    //         x: 0,
                    //         y: 0
                    //     }

                    //     if (overlap < 0) {
                    //         separactionVector = {
                    //             x: dx / distance,
                    //             y: dy / distance
                    //         }

                    //         circle.x -= overlap * separactionVector.x;
                    //         circle.y -= overlap * separactionVector.y;
                    //         otherCircle.x += overlap * separactionVector.x;
                    //         otherCircle.y += overlap * separactionVector.y;
                    //     }

                    //     const newVx1 = ((circle.mass - otherCircle.mass) * circle.velocity.x + 2 * otherCircle.mass * otherCircle.velocity.x) / (circle.mass + otherCircle.mass);
                    //     const newVy1 = ((circle.mass - otherCircle.mass) * circle.velocity.y + 2 * otherCircle.mass * otherCircle.velocity.y) / (circle.mass + otherCircle.mass);
                    //     const newVx2 = -((otherCircle.mass - circle.mass) * otherCircle.velocity.x + 2 * circle.mass * circle.velocity.x) / (circle.mass + otherCircle.mass);
                    //     const newVy2 = -((otherCircle.mass - circle.mass) * otherCircle.velocity.y + 2 * circle.mass * circle.velocity.y) / (circle.mass + otherCircle.mass);

                    //     circle.velocity.x = newVx1;
                    //     circle.velocity.y = newVy1;
                    //     otherCircle.velocity.x = newVx2;
                    //     otherCircle.velocity.y = newVy2;
                    // }

                    if (distance <= circle.radius + otherCircle.radius + 5) {
                        // apply repulsion force
                        let x = circle.x - otherCircle.x;
                        let y = circle.y - otherCircle.y;
                        let angle = Math.atan2(y, x);
                        let force = 0.1;
                        let forceX = Math.cos(angle) * force;
                        let forceY = Math.sin(angle) * force;

                        circle.velocity.x += forceX;
                        circle.velocity.y += forceY;
                        
                        otherCircle.velocity.x -= forceX;
                        otherCircle.velocity.y -= forceY;
                    }
                }
            )})
        }

        init();
        animate();
    }

    particleWeb(section) {
        const canvas = section.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const particles = [];
        const cellSize = 80;
        const particleRadius = 2;
        const particleSpeed = 1;
        const particleColor = '#fff';

        class Particle {
            constructor(x, y, color) {
                this.drawn = false;
                this.x = x;
                this.y = y;
                this.color = color;
                this.velocity = particleSpeed;
                const angle = Math.random() * Math.PI * 2;
                this.dx = Math.cos(angle) * this.velocity;
                this.dy = Math.sin(angle) * this.velocity;
            }

            draw() {
                ctx.beginPath();
                ctx.fillStyle = this.color;
                ctx.arc(this.x, this.y, particleRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            }

            update() {
                if (!this.drawn) {
                    this.draw();
                    this.drawn = true;

                    return;
                }

                this.x += this.dx;
                this.y += this.dy;

                if (this.x < 0) {
                    this.x = width;
                } else if (this.x > width) {
                    this.x = 0;
                }

                if (this.y < 0) {
                    this.y = height;
                } else if (this.y > height) {
                    this.y = 0;
                }

                this.draw();
            }
        }

        function init() {
            // distribute particles evenly in the canvas rect
            for (let y = 0; y < height; y += cellSize) {
                for (let x = 0; x < width; x += cellSize) {
                    const particle = new Particle(x, y, particleColor);
                    particles.push(particle);
                }
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fillRect(0, 0, width, height);

            particles.forEach((particle) => {
                particle.update();
            });

            connect();
        }

        function connect() {
            let randomness = Math.random() < 0.5;

            particles.forEach((particle) => {
                particles.forEach((otherParticle) => {
                    if (particle === otherParticle) {
                        return;
                    }

                    const distance = getDistance(
                        particle.x,
                        particle.y,
                        otherParticle.x,
                        otherParticle.y,
                    );

                    if (distance < 120) {
                        let opacity = 1 - distance / 120;
                        ctx.strokeStyle = 'rgba(255, 255, 255, ' + opacity + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();

                        const x1 = particle.x;
                        const y1 = particle.y;
                        const x2 = otherParticle.x;
                        const y2 = otherParticle.y;

                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();

                        if (distance < 80) {
                            // apply repulsion force
                            const dx = x2 - x1;
                            const dy = y2 - y1;
                            const angle = Math.atan2(dy, dx);
                            const force = 0.2;
                            const fx = Math.cos(angle) * force / distance;
                            const fy = Math.sin(angle) * force / distance;

                            particle.dx -= fx;
                            particle.dy -= fy;
                            otherParticle.dx += fx;
                            otherParticle.dy += fy;
                        }
                    }
                });
            });
        }

        function getDistance(x1, y1, x2, y2) {
            const xDistance = x2 - x1;
            const yDistance = y2 - y1;

            return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
        }

        init();
        animate();
    }

    createParticleWeb(section) {
        const dimentions = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        const engine = Matter.Engine.create();
        const runner = Matter.Runner.create();
        const world = engine.world;
        const particles = [];
        const connectedParticles = {};

        Matter.Events.on(engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;

                const particleA = particles.find((p) => p.body === bodyA);
                const particleB = particles.find((p) => p.body === bodyB);

                if (particleA && particleB) {
                    // smaller left, bigger right
                    let key = particleA.id < particleB.id ? `${particleA.id}-${particleB.id}` : `${particleB.id}-${particleA.id}`;
                    connectedParticles[key] = [particleA, particleB];
                }

                // console.log("colliding", connectedParticles);
            });
        });

        Matter.Events.on(engine, 'collisionEnd', (event) => {
            const pairs = event.pairs;
            pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;

                const particleA = particles.find((p) => p.body === bodyA);
                const particleB = particles.find((p) => p.body === bodyB);

                if (particleA && particleB) {
                    let key = particleA.id < particleB.id ? `${particleA.id}-${particleB.id}` : `${particleB.id}-${particleA.id}`;
                    delete connectedParticles[key];
                }
            });
        });

        function sketch(p) {
            p.frameRate(60);

            p.setup = () => {
                let canvas = p.createCanvas(dimentions.width, dimentions.height);
                canvas.parent(section);
                canvas.addClass('background');
                // get the index of section of its parent
                const i = Array.from(section.parentNode.children).indexOf(section);
                const offset = i * window.innerHeight;
                canvas.style('transform', `translateY(${offset}px)`);

                // modify enginer world solver iterations
                world.constraintsIterations = 20;
                world.pairs = 10;
                engine.detector.collisions = 5;

                Matter.Runner.run(runner, engine);
                createParticles()
            }

            p.draw = () => {
                p.background(0);
                updateParticles();
                drawParticles(p);
                drawConnections(p);
            }
        }

        function drawConnections(p) {
            p.stroke(255);
            p.strokeWeight(1);
            p.noFill();

            Object.keys(connectedParticles).forEach((key) => {
                const [particleA, particleB] = connectedParticles[key];
                p.push();
                p.line(particleA.position.x, particleA.position.y, particleB.position.x, particleB.position.y);
                p.pop();
            });
        }

        function updateParticles() {
            particles.forEach((particle) => {
                particle.position.x += particle.velocity.x;
                particle.position.y += particle.velocity.y;

                if (particle.position.x < 0) particle.velocity.x *= -1;
                if (particle.position.x > dimentions.width) particle.velocity.x *= -1;
                if (particle.position.y < 0) particle.velocity.y *= -1;
                if (particle.position.y > dimentions.height) particle.velocity.y *= -1;

                // has a small chance of change direction
                if (Math.random() > 0.999) {
                    particle.velocity.x = Math.random() * 2 - 1;
                    particle.velocity.y = Math.random() * 2 - 1;
                }

                Matter.Body.setPosition(particle.body, { x: particle.position.x, y: particle.position.y });
                Matter.Body.setVelocity(particle.body, { x: particle.velocity.x, y: particle.velocity.y });
            });
        }

        function drawParticles(p) {
            particles.forEach((particle) => {
                particle.show(p)
            })
        }

        function createParticles() {
            for (let i = 0; i < 400; i++) {
                const x = Math.random() *dimentions.width;
                const y = Math.random() * dimentions.height;
                const particle = new createParticle(x, y);
                particle.id = i;
                particles.push(particle);
                Matter.World.add(world, particle.body);
            }
        }

        function createParticle(x, y) {
            const radius = 2;
            const options = {
                friction: 0.3,
                restitution: 0.5,
            };
            const body = Matter.Bodies.circle(x, y, radius * 30, options);

            function show(p) {
                const pos = body.position;
                const angle = body.angle;

                p.push();
                p.translate(pos.x, pos.y);
                p.rotate(angle);
                p.fill(255);
                p.stroke(255);
                p.strokeWeight(1);
                p.circle(0, 0, radius);
                p.pop();
            }

            return {
                body,
                show,
                radius: radius,
                velocity: 
                    p5.Vector.random2D(),
                position: {
                    x, y
                }
            };
        }

        new p5(sketch, section);
    }
}

class SectionControl {
    constructor(maindiv, header) {
        this.header = header;
        this.maindiv = maindiv;
        this.wrapper = maindiv.querySelector('.section-wrapper');
        this.sections = maindiv.querySelectorAll('.section');

        /* constant */
        this.windowHeight = window.innerHeight;
        this.scrollThreshold = 0.3;
        this.accumulateMouseDeltaY = 0;
        this.resetInterval = 500;
        this.wheelThreshold = 100;
        this.swipeThreshold = 100;
        this.duration = 0.8;

        /* state */
        this.resetTimer = null;
        this.currentSection = 0;
        this.isScrolling = false;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.isHeaderVisible = true;
        this.accumulateMouseDeltaY = 0;

        this.registerEvents();
        this.updateSections();
    }

    registerEvents() {
        this.wrapper.addEventListener('wheel', this.handleMouseScroll);
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('keydown', this.handleKeydown);
        this.wrapper.addEventListener('touchstart', this.handleTouchStart);
        this.wrapper.addEventListener('touchmove', this.handleTouchMove);
        this.wrapper.addEventListener('touchend', this.handleTouchEnd);

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleClick);
        });
    }

    updateSections() {
        this.sections.forEach((section, i) => {
            const rect = section.getBoundingClientRect();
            const isActive = rect.top <= this.windowHeight * this.scrollThreshold && rect.bottom >= this.windowHeight * this.scrollThreshold;

            section.classList.toggle('active', isActive);

            if (isActive) {
                this.currentSection = i;
            }
        });
    }

    
    scrollToSection(i) {
        this.isScrolling = true;
        const scrollOffset = this.sections[i].offsetTop;

        gsap.to(this.wrapper, {
            duration: this.duration,
            y: -scrollOffset,
            ease: Power4.easeInOut,
            onComplete: () => {
                this.isScrolling = false;
                this.updateSections();
            }
        });
    }

    handleClick(e) {
        e.preventDefault();

        const i = parseInt(e.target.getAttribute('href').replace('#', ''));

        if (!isNaN(i)) {
            this.scrollToSection(i);
        }
    }
    
    collapseHeader(bool) {
        // four cases:
       // 1. header is visible, bool is true (meaning collapse header) -> collapse header
       // 2. header is visible, bool is false (meaning expand header) -> do nothing
       // 3. header is not visible, bool is true (meaning collapse header) -> do nothing
       // 4. header is not visible, bool is false (meaning expand header) -> expand header
       if (this.isHeaderVisible != bool) {
           return;
       }

       this.isHeaderVisible = !this.isHeaderVisible
       let offset = this.isHeaderVisible ? 0 : -this.header.offsetHeight;

       if (!this.isHeaderVisible) {
           this.maindiv.classList.remove('h-screen-minus-header');
           this.maindiv.classList.add('h-screen');
       } 

       gsap.to(this.header, {
           duration: 0.8,
           y: offset,
           ease: Power4.easeInOut,
       });
    }
    
    handleMouseScroll = (e) => {
        e.preventDefault();
        if (this.isScrolling) {
            return;
        }

        this.accumulateMouseDeltaY += e.deltaY;

        if (e.deltaY > 0) {
            this.collapseHeader(true);
        } else if (e.deltaY < 0) {
            this.collapseHeader(false);
        }

        if (this.resetTimer) {
            clearTimeout(this.resetTimer);
        }

        if (this.accumulateMouseDeltaY > this.wheelThreshold) {
            if (this.currentSection < this.sections.length - 1) {
                this.scrollToSection(this.currentSection + 1);
            } else {
                this.scrollToSection(0);
            }
            this.accumulateMouseDeltaY = 0;
        } else if (this.accumulateMouseDeltaY < -this.wheelThreshold) {
            if (this.currentSection > 0) {
                this.scrollToSection(this.currentSection - 1);
            } else {
                this.scrollToSection(this.sections.length - 1);
            }
            this.accumulateMouseDeltaY = 0;
        }

        this.resetTimer = setTimeout(() => {
            this.accumulateMouseDeltaY = 0;
        }, this.resetInterval);
    }

    handleKeydown = (e) => {
        if (e.keyCode === 38 || e.keyCode === 40) {
            e.preventDefault();
            if (this.isScrolling) {
                return;
            }

            if (e.keyCode === 38) {
                if (this.currentSection > 0) {
                    this.scrollToSection(this.currentSection - 1);
                } else {
                    this.scrollToSection(this.sections.length - 1);
                }
            } else if (e.keyCode === 40) {
                if (this.currentSection < this.sections.length - 1) {
                    this.scrollToSection(this.currentSection + 1);
                } else {
                    this.scrollToSection(0);
                }
            }
        }
    }

    handleTouchStart = (e) => {
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchMove = (e) => {
        this.touchEndY = e.touches[0].clientY;
        e.preventDefault();

        let deltaY = this.touchEndY - this.touchStartY;
        if (deltaY > 0) {
            this.collapseHeader(false);
        } else if (deltaY < 0) {
            this.collapseHeader(true);
        }
    }

    handleScroll = (e) => {
        e.preventDefault();
    }

    handleTouchEnd = (e) => {
        let deltaY = this.touchEndY - this.touchStartY;

        if (deltaY > this.swipeThreshold) {
            if (this.currentSection > 0) {
                this.scrollToSection(this.currentSection - 1);
            } else {
                this.scrollToSection(this.sections.length - 1);
            }
        } else if (deltaY < - this.swipeThreshold) {
            if (this.currentSection < this.sections.length - 1) {
                this.scrollToSection(this.currentSection + 1);
            } else {
                this.scrollToSection(0);
            }
        } else {
            return;
        }
    }

}

document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header');
    const maindiv = document.querySelector('main');
    const sectionControl = new SectionControl(maindiv, header);

    const sections = maindiv.querySelectorAll('.section');
    const sectionAnimation = new SectionAnimation(sections);

    window.addEventListener('resize', () => {
        sectionControl.scrollToSection(sectionControl.currentSection);
        sectionAnimation.resetCanvas();
    });
});