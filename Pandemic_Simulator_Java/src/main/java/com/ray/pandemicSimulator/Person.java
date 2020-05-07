package com.ray.pandemicSimulator;
import java.util.concurrent.ThreadLocalRandom;
public class Person {
	double x;
	double y;
	
	double vx;
	double vy;
	int status; // 1 = healthy, 2 = infected, 3 = deceased / recovered
	
	int recovery;
	
	int count;
	
	QuadTree.Rectangle bound;
	QuadTree.Rectangle quarantine;
	
	public Person(double xc, double yc, QuadTree.Rectangle b, int min, int max) {
		this.x = xc;
		this.y = yc;
		this.bound = b;
		this.status = 1;
		this.vx = 0;
		this.vy = 0;
		this.count = 0;
		this.recovery = ThreadLocalRandom.current().nextInt(min, max + 1);
	}
	
	public Person(QuadTree.Rectangle b, int min, int max) {
		this.bound = b;
		this.status = 1;
		this.vx = 0;
		this.vy = 0;
		this.x = Math.random() * b.width;
		this.y = Math.random() * b.height;
		this.count = 0;
		this.recovery = ThreadLocalRandom.current().nextInt(min, max + 1);
	}
	
	public Person(QuadTree.Rectangle b, int st, int min, int max) {
		this.bound = b;
		this.status = st;
		this.vx = 0;
		this.vy = 0;
		this.x = Math.random() * b.width;
		this.y = Math.random() * b.height;
		this.count = 0;
		this.recovery = ThreadLocalRandom.current().nextInt(min, max + 1);
	}
	
	public Person(double xc, double yc, int st, QuadTree.Rectangle b, int min, int max) {
		this.x = xc;
		this.y = yc;
		this.status = st;
		this.bound = b;
		this.vx = 0;
		this.vy = 0;
		this.count = 0;
		this.recovery = ThreadLocalRandom.current().nextInt(min, max + 1);
	}
	
	public double dist(Person p2) {
		return Math.sqrt(Math.pow(this.x - p2.x, 2) + Math.pow(this.y - p2.y, 2));
	}
	
	// The probability of getting infected is p. 0 <= p <= 1.
	public boolean infect(double p) {
		assert ((p >= 0) && (p <= 1));
		if ((this.status == 3) || (this.status == 2)) {
			return false;
		}
		boolean result = (p >= Math.random());
		if (result) {
			this.status = 2;
		}
		return result;
		
	}
	
	
	public boolean randomWalk() {
		double ax = 2 * Math.random() - 1;
		double ay = 2 * Math.random() - 1;
		this.vx += ax;
		this.vy += ay;
		if ((this.x + this.vx) > (this.bound.x + this.bound.width)) {
			this.x = this.x + this.vx - this.bound.width;
		} else {
			this.x += this.vx;
		}
		if ((this.y + this.vy) > (this.bound.y + this.bound.height)) {
			this.y = this.y + this.vy - this.bound.height;
		} else {
			this.y += this.vy;
		}
		if (this.status == 2) {
			this.count += 1;
			if (this.count == this.recovery) {
				this.status = 3;
				return true;
			}
		}
		
		return false;
		
	}
	
	public void moveTowards(QuadTree.Rectangle rect, double speed) {
		if (rect.contains(this)) {
			return;
		}
		double dist = Math.sqrt(Math.pow(rect.y + rect.height / 2 - this.y, 2) + Math.pow(rect.x + rect.width / 2 - this.x, 2));
		double sinA = (rect.y + rect.height / 2 - this.y) / dist;
		double cosA = (rect.x + rect.width / 2 - this.x) / dist;
		this.vx = speed * cosA;
		this.vy = speed * sinA;
		this.x += this.vx;
		this.y += this.vy;
		
	}
	
	@Override
	public String toString() {
		return "x: " + this.x + "\n" +
	"y: " + this.y + "\n" +
				"vx: " + this.vx + "\n" +
				"vy: " + this.vy + "\n" +
				"status: " + this.status + "\n" +
				"bound: " + this.bound.toString() +
				"recovery time: " + this.recovery + "\n";
		
	}
	
	static class Circle {
		double x;
		double y;
		double radius;
		
		public Circle(double xc, double yc, double r) {
			this.x = xc;
			this.y = yc;
			this.radius = r;
		}
		
		public boolean contains(Person p) {
			double dis = (this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y);
			return (dis <= (this.radius * this.radius));
		}
	}
}
