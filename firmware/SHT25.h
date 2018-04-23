#include "spark_wiring_i2c.h"
#include "spark_wiring_usbserial.h"
#include "spark_wiring_constants.h"
#include "spark_wiring.h"

class SHT25{
public:
    double readHumidity();
    double readTemp();
private:
    int address = 0x40;
    double humidity;
    double temp;
    byte data[2];
    byte status;
    unsigned long readTimeout = 600;
    unsigned long startTime;
};
