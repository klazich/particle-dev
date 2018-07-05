#include "SHT25.h"

SHT25 sensor;

double humidity;
double temperature;
bool sampling;
unsigned long mark;
char buf[256];

unsigned int period = 15000;

void setup() {
  mark = 0;
  sampling = true;

  Wire.begin();

  Particle.variable("Humidity", humidity);
  Particle.variable("Temperature", temperature);
  Particle.variable("Sampling", sampling);
}

void loop() {
  if(millis() - mark >= period){

    humidity = sensor.readHumidity();
    temperature = sensor.readTemp();

    snprintf(buf, sizeof(buf), "humidity, %.10f \n temperature, %.10f", humidity, temperature);

    Particle.publish("reading", buf, 60, PRIVATE);

    mark = millis();
  }

}