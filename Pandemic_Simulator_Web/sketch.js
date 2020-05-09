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
var data;

function setup() {

    createCanvas(1500, 900);
    area = new Rectangle(50, 50, 800, 800);
    rec = new Rectangle(400, 400, 100, 100);
    cir = new Circle(500, 500, 500);

    contactR = 5;
    contactP = 0.5;
    airborneR = 15;
    airborneP = 0.1;

    min = 30;
    max = 3000;

    data = new Array();
    healthy = new Set();
    for (let i = 0; i < 500; ++i) {
        healthy.add(new Person(area, 1, min, max));
    }

    infected = new Set();
    for (let i = 0; i < 1; ++i) {
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
    var qt2 = new QuadTree(rec, 5);
    for (let p of healthy) {
        if (rec.close(p)) {
            p.moveAway(rec, 0.3);
        } else {
            p.randomWalk();
        }
        
        //p.moveTowards(rec, 1);
        //p.moveTowards(area, 1);
    }
    for (let p of immune) {
        if (rec.close(p)) {
            p.moveAway(rec, 0.3);
        } else {
            p.randomWalk();
        }
        
        //p.moveTowards(rec, 1);
        //p.moveTowards(area, 1);
    }
    for (let p of infected) {
        if (p.moveTowards(rec, 3)) {
            immune.add(p);
            infected.delete(p);
        }
        //p.moveTowards(rec, 1);
        //p.moveTowards(area, 1);
    }

    for (let p of healthy) {
        qt.insert(p);
        qt2.insert(p);
    }
    for (let p of immune) {
        qt.insert(p);
        qt2.insert(p);
    }
    for (let p of infected) {
        qt.insert(p);
        qt2.insert(p);
    }

    let newlyInfected = new Set();
    for (let p of infected) {
        let suspect = qt.query(new Circle(p.x, p.y, airborneR), 1, "Circle");
        for (let q of suspect) {
            if (q.bound != p.bound) {
                suspect.delete(q);
            }
        }
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
    if (data.length < 900) {
        data.push([healthy.size, infected.size, immune.size]);
    } else {
        data.shift();
        data.push([healthy.size, infected.size, immune.size]);
    }
    qt.show();
    qt2.show();
    //showData(data);
}

function showData(data) {
    var total = healthy.size + infected.size + immune.size;
    for (let i = 0; i < data.length; ++i) {
        strokeWeight(1);
        stroke('green');
        line(900, i, 900 + 600 * healthy.size / total, i);
        stroke('red');
        line(900 + 600 * healthy.size / total, i, 900 + 600 * (healthy.size + infected.size) / total, i);
        stroke('grey');
        line(900 + 600 * (healthy.size + infected.size) / total, i, 1500, i);

    }
}