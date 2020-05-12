package com.ray.pandemicSimulator;

import java.util.HashSet;
import java.util.Iterator;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Component;

@SpringBootApplication
@Component
public class PandemicSimulatorApplication implements CommandLineRunner{

	public static void main(String[] args) {
		SpringApplication.run(PandemicSimulatorApplication.class, args);
	}
	
	@Override
	public void run(String... args) throws Exception {
		// ********** < Basic Setup > ************
		
		// Bound of simulation
		QuadTree.Rectangle area = new QuadTree.Rectangle(0, 0, 1000, 1000);
		
		// Person contact radius
		double contactR = 3;
		// Probability of being infected if making direct contact
		double contactP = 0.9;
		
		// Virus airborne radius
		double airborneR = 10;
		// Probability of being infected within airborne radius
		double airborneP = 0.1;
		
		assert(contactR <= airborneR);
		
		// Minimum iteration for the infected to decease / recover
		int minimum = 50;
		
		// Maximum iteration for the infected to decease / recover
		int maximum = 500;
		
		// QuadTree capacity
		int capacity = 5;
		
		// Number of healthy people in the population
		int h = 500;
		HashSet<Person> healthy = new HashSet<Person>();
		for (int i = 0; i < h; ++i) {
			healthy.add(new Person(area, minimum, maximum));
		}
		
		// Number of infected people in the population
		int inf = 1;
		HashSet<Person> infected = new HashSet<Person>();
		for (int i = 0; i < inf; ++i) {
			infected.add(new Person(area, 2, minimum, maximum));
		}
		
		// Number of deceased / recovered people in the population
		int imm = 0;
		HashSet<Person> immune = new HashSet<Person>();
		for (int i = 0; i < imm; ++i) {
			immune.add(new Person(area, 3, minimum, maximum));
		}
		
		// ********** </ Basic Setup > ************
		
		// ********** < Simulation > ************
		
		// Number of iterations to be run
		int i = 0;
		while (infected.size() != 0) {
			// random walk
			for (Person p: healthy) {
				p.randomWalk();
			}
			for (Person p: immune) {
				p.randomWalk();
			}
			
			// Recover / Decease process
			int recoverCount = 0;
			for (Iterator<Person> iterator = infected.iterator(); iterator.hasNext();) {
				Person p = iterator.next();
				
				if (p.randomWalk()) {
					immune.add(p);
					iterator.remove();
					++recoverCount;
				}
				
			}
			
			// insert into quadtree
			QuadTree qt = new QuadTree(area, capacity);
			
			qt.insert(healthy);
			qt.insert(infected);
			qt.insert(immune);
			
			// Infection process
			HashSet<Person> newlyInfected = new HashSet<Person>();
			for (Person p: infected) {
				HashSet<Person> suspect = qt.queryHealthy(new Person.Circle(p.x, p.y, airborneR));
				for (Person q: suspect) {
					if (q.infect(airborneP)) {
						newlyInfected.add(q);
					} else if ((p.dist(q) <= contactR) && (q.infect(contactP))) {
						newlyInfected.add(q);
					}
				}
				
			}
			healthy.removeAll(newlyInfected);
			infected.addAll(newlyInfected);	
			
			System.out.print("\nStatus of Iteration " + i + "\n");
			System.out.print(newlyInfected.size() + " people are infected in iteration " + i + "\n");
			System.out.print(recoverCount + " people are recovered / deceased in iteration " + i + "\n");
			System.out.print("Total number of healthy people: " + healthy.size() + "\n");
			System.out.print("Total number of infected people: " + infected.size() + "\n");
			System.out.print("Total number of recovered / deceased (immune) people: " + immune.size() + "\n");
			++i;
		}
		// ********** </ Simulation > ************
	}

}
