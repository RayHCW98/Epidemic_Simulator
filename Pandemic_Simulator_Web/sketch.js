var area;
var healthy;
var infected;
var immune;
var rec;
var cir;
var contactR;
var contactP;
var airborneR;
var airborneP;
var min;
var max;


function setup() {

    createCanvas(1000, 1000);
    area = new Rectangle(100, 100, 800, 800);
    rec = new Rectangle(0, 0, 100, 100);
    cir = new Circle(500, 500, 500);

    contactR = 5;
    contactP = 0.9;
    airborneR = 15;
    airborneP = 0.1;

    min = 30;
    max = 3000;

    healthy = new Set();
    for (let i = 0; i < 500; ++i) {
        healthy.add(new Person(area, 1, min, max));
    }

    infected = new Set();
    for (let i = 0; i < 50; ++i) {
        infected.add(new Person(area, 2, min, max));
    }

    immune = new Set();
    for (let i = 0; i < 10; ++i) {
        immune.add(new Person(area, 3, min, max));
    }
}

function draw() {
    background(51);
    var qt = new QuadTree(area, 5);
    
    for (let p of healthy) {
        p.randomWalk();
        //p.moveTowards(rec, 1);
        //p.moveTowards(area, 1);
    }
    for (let p of immune) {
        p.randomWalk();
        //p.moveTowards(rec, 1);
        //p.moveTowards(area, 1);
    }
    for (let p of infected) {
        if (p.randomWalk()) {
            immune.add(p);
            infected.delete(p);
        }
        //p.moveTowards(rec, 1);
        //p.moveTowards(area, 1);
    }

    for (let p of healthy) {
        qt.insert(p);
    }
    for (let p of immune) {
        qt.insert(p);
    }
    for (let p of infected) {
        qt.insert(p);
    }

    let newlyInfected = new Set();
    for (let p of infected) {
        let suspect = qt.query(new Circle(p.x, p.y, airborneR), 1, "Circle");
        for (let q of suspect) {
            if (q.infect(airborneP)) {
                newlyInfected.add(q);
            } else if ((p.dist(q) <= contactR) && (q.infect(contactP))) {
                newlyInfected.add(q);
            }
        }
    }
    for (let p of newlyInfected) {
        healthy.delete(p);
        infected.add(p);
    }
    


    
    
    qt.show();
    
    
    
}