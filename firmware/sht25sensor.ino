#include "SHT25.h"

SHT25 sensor;

double humidity;
double temperature;
bool sampling;
unsigned long mark;
char buf[256];

unsigned int period = 5000;

void setup() {
  mark = 0;
  sampling = true;

  Wire.begin();

  Particle.variable("Humidity", humidity);
  Particle.variable("Temperature", temperature);
  Particle.variable("Sampling", sampling);
}

// Particle.publish("startup", String::format("frobnicator started at %s", Time.timeStr().c_str()));

void loop() {
  if(millis() - mark >= period){

    humidity = sensor.readHumidity();
    temperature = sensor.readTemp();

    snprintf(buf, sizeof(buf), "{\"humidity\":%.10f,\"temperature\":%.10f}", humidity, temperature);

    Particle.publish("SHT25", buf, 60, PRIVATE);

    mark = millis();
  }

}