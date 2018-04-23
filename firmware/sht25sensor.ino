#include "SHT25.h"

SHT25 sensor;

double humidity;
double temperature;

unsigned int period = 2000;

void sample() {
  humidity = sensor.readHumidity();
  temperature = sensor.readTemp();

  Particle.publish("humidity", String(humidity), PRIVATE);
  Particle.publish("temperature", String(temperature), PRIVATE);
}

Timer t(period, sample);

void setup() {
  Wire.begin();

  Particle.variable("Humidity", humidity);
  Particle.variable("Temperature", temperature);

  t.start();
}

void loop() {
    delay(100);
}
