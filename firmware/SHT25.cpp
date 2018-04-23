#include "SHT25.h"

double SHT25::readHumidity(){
    Wire.beginTransmission(address);
    Wire.write(0xF5);
    status = Wire.endTransmission();
    if(status !=0){
        // Serial.println("Sensor coms failed");
        return 0.00;
    }
    delay(100);
    Wire.requestFrom(address, 2);
    startTime = millis();
    while(Wire.available() < 2 && millis() < startTime + readTimeout);
    if (Wire.available() < 2){
        // Serial.println("Sensor did not respond");
        return 0.00;
    }
    data[0] = Wire.read();
    data[1] = Wire.read();

    humidity = ((((data[0] * 256.0) + data[1]) * 125.0) / 65536.0) - 6;

    // Serial.printf("Humidity (RH): %f \n", humidity);
    return humidity;
}

double SHT25::readTemp(){
    Wire.beginTransmission(address);
    Wire.write(0xF3);
    status = Wire.endTransmission();
    if(status !=0){
        // Serial.println("Sensor coms failed");
        return 0.00;
    }
    delay(100);
    Wire.requestFrom(address, 2);
    startTime = millis();
    while(Wire.available() < 2 && millis() < startTime + readTimeout);
    if (Wire.available() < 2){
        // Serial.println("Sensor did not respond");
        return 0.00;
    }
    data[0] = Wire.read();
    data[1] = Wire.read();

    temp = ((((data[0] * 256.0) + data[1]) * 175.72) / 65536.0) - 46.85;

    // Serial.printf("Temperature (C): %f \n", temp);
    return temp;
}

