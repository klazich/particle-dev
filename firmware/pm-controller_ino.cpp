// This #include statement was automatically added by the Particle IDE.
#include <NCD2Relay.h>

// This #include statement was automatically added by the Particle IDE.
#include <blynk.h>

NCD2Relay relayController;
// Variables used for debouncing digital inputs on relay board when reading
//  things like buttons/switches.
bool tripped[6];

int debugTrips[6];

int minTrips = 5;

// Authentication code for Blynk app running on phone.
char blynkAuth[] = "4a02f45208f1495d8ff044b2fdecc871";

// LED widget objects on Blynk app user interface.
// Used for indicating status of inputs on relay board(Closed/Open)
WidgetLED led[6] = {V2, V3, V4, V5, V6, V7};

unsigned long lastPublish = 0;
unsigned long publishInterval = 1000;

void updateCurrentMonitor();

bool extendDisable;
bool retractDisable;

bool extending;
bool retracting;

bool monitorExtend;
bool monitorRetract;

float maxExtendReading;
float maxRetractReading;

float voltageTotal = 0.00;
float currentTotal = 0.00;
float counts = 0;
unsigned long cycleStartTime = 0;

float maxCurrent = 2.00;

float currentPerStep = 0.005623;

int rawADCbase = 543;

int cyclesCount;
unsigned long cyclesCountLastPublish;
unsigned long cyclesCountPublishInterval = 60000;

// EEPROM registers
int currentMaxReg = 0;  // (Float) Occupies bytes 0-3 in EEPROM.
int cyclesCountReg = 4; // (int)   Occupies bytes 4-7 in EEPROM.

float updateVoltage();

STARTUP(WiFi.selectAntenna(ANT_EXTERNAL));

void setup()
{
  // Get Stored info from EEPROM.
  EEPROM.get(currentMaxReg, maxCurrent);
  EEPROM.get(cyclesCountReg, cyclesCount);

  // Configure Blynk
  Blynk.begin(blynkAuth);
  // Initialize relay controller by passing status of the 3 on board address
  //  jumpers.
  // This function must be called prior to interfacing with the controller.
  relayController.setAddress(0, 0, 0);

  // Publish status of inputs to app on boot
  updateInputs(true);
}

BLYNK_CONNECTED()
{
  Blynk.virtualWrite(V10, maxCurrent);
  Blynk.virtualWrite(V11, cyclesCount);
}

BLYNK_DISCONNECTED()
{
  relayController.turnOffAllRelays();
}

void loop()
{
  Blynk.run();
  // Read inputs on relay board:
  updateInputs(false);
  updateCurrentMonitor();
  if (!relayController.initialized)
  {
    Serial.println("Relay Controller failed");
    relayController.setAddress(0, 0, 0);
  }
}

BLYNK_WRITE(V0)
{
  // Received command to control relay 1.
  int value = param.asInt();
  Serial.printf("Blynk virtual write pin %i with param %i \n", V0, value);
  switch (value)
  {
  case 1:
    if (!extendDisable)
    {
      extending = true;
      relayController.turnOnRelay(1);
      cyclesCount++;
    }
    if (retractDisable)
    {
      retractDisable = false;
    }

    break;
  case 0:
    relayController.turnOffRelay(1);
    extending = false;
    EEPROM.put(cyclesCountReg, cyclesCount);
    break;
  }
}
BLYNK_WRITE(V1)
{
  // Received command to control relay 2.
  int value = param.asInt();
  Serial.printf("Blynk virtual write pin %i with param %i \n", V1, value);
  switch (value)
  {
  case 1:
    if (!retractDisable)
    {
      retracting = true;
      relayController.turnOnRelay(2);
      cyclesCount++;
    }
    if (extendDisable)
    {
      extendDisable = false;
    }

    break;
  case 0:
    relayController.turnOffRelay(2);
    retracting = false;
    EEPROM.put(cyclesCountReg, cyclesCount);
    break;
  }
}

BLYNK_WRITE(V10)
{
  maxCurrent = param.asFloat();
  EEPROM.put(currentMaxReg, maxCurrent);
}

void updateInputs(bool startup)
{
  // Read and debounce digital inputs on relay board.
  int status = relayController.readAllInputs();
  int a = 0;
  for (int i = 1; i < 33; i *= 2)
  {
    if (status & i)
    {
      debugTrips[a]++;
      if (debugTrips[a] >= minTrips || startup)
      {
        if (!tripped[a] || startup)
        {
          // Input is closed
          Serial.println("Input Closed");
          tripped[a] = true;
          // Publish high status to LED indicator in Blynk app notifying user
          //  that input is closed.
          led[a].on();
          switch (a + 1)
          {
          case 1:
            if (!extendDisable)
            {
              extending = true;
              relayController.turnOnRelay(1);
              cyclesCount++;
            }
            if (retractDisable)
            {
              retractDisable = false;
            }
            break;
          case 2:
            if (!retractDisable)
            {
              retracting = true;
              relayController.turnOnRelay(2);
              cyclesCount++;
            }
            if (extendDisable)
            {
              extendDisable = false;
            }
            break;
          case 3:
            if (extending)
            {
              relayController.turnOffRelay(1);
              extendDisable = true;
              extending = false;
              EEPROM.put(cyclesCountReg, cyclesCount);
              break;
            }

          case 4:
            if (retracting)
            {
              relayController.turnOffRelay(2);
              retractDisable = true;
              retracting = false;
              EEPROM.put(cyclesCountReg, cyclesCount);
              break;
            }
          }
        }
      }
    }
    else
    {
      debugTrips[a] = 0;
      if (tripped[a] || startup)
      {
        Serial.println("Input Open");
        // Input is open
        tripped[a] = false;
        // Publish low status to LED indicator in Blynk app notifying user that
        //  input is open.
        led[a].off();
        switch (a + 1)
        {
        case 1:
          extending = false;
          relayController.turnOffRelay(1);
          EEPROM.put(cyclesCountReg, cyclesCount);
          break;
        case 2:
          retracting = false;
          relayController.turnOffRelay(2);
          EEPROM.put(cyclesCountReg, cyclesCount);
          break;
        }
      }
    }
    a++;
  }
}

void updateCurrentMonitor()
{
  // Start I2C Transmission
  Wire.beginTransmission(0x48);
  // Send command byte
  // channel-0 selected,  A/D Converter ON
  Wire.write(0x04);
  // Stop I2C transmission
  Wire.endTransmission();
  // Request 2 bytes of data
  Wire.requestFrom(0x48, 2);

  // Read 2 bytes of data
  // raw_adc msb, raw_adc lsb
  byte data[2];
  if (Wire.available() == 2)
  {
    data[0] = Wire.read();
    data[1] = Wire.read();

    delay(20);

    // Converting the data to 12 bits
    int raw_adc = ((data[0] & 0x0F) * 256) + data[1];
    float readCurrent = (raw_adc - rawADCbase) * currentPerStep;

    if (readCurrent > maxCurrent)
    {
      if (extending)
      {
        extending = false;
        extendDisable = true;
        relayController.turnOffRelay(1);
        EEPROM.put(cyclesCountReg, cyclesCount);
      }
      if (retracting)
      {
        retracting = false;
        retractDisable = true;
        relayController.turnOffRelay(2);
        EEPROM.put(cyclesCountReg, cyclesCount);
      }
    }

    // Publish Extend Cycle max current
    if (extending && !monitorExtend)
    {
      monitorExtend = true;
      cycleStartTime = millis();
    }
    if (monitorExtend)
    {
      counts++;
      float readVoltage = updateVoltage();
      voltageTotal += readVoltage;
      currentTotal += readCurrent;
      if (readCurrent > maxExtendReading)
      {
        maxExtendReading = readCurrent;
      }
    }
    if (monitorExtend && !extending)
    {

      float avgCurrent = currentTotal / counts;
      float avgVoltage = voltageTotal / counts;
      float avgWattage = avgCurrent * avgVoltage;
      unsigned long d = millis() - cycleStartTime;
      float cycleDuration = (float)d;
      cycleDuration = cycleDuration / 1000.00;

      char publishData[200];
      sprintf(publishData, "%0.2f Max Amps | %0.2f Avg Amps| %0.2f Avg Voltage| %0.2f Avg Wattage| Cycle Duration: %0.2f seconds| Cycles: %i", maxExtendReading, avgCurrent, avgVoltage, avgWattage, cycleDuration, cyclesCount);

      counts = 0;
      currentTotal = 0.00;
      voltageTotal = 0.00;

      // PUBLISH EXTEND EVENT /////////////////////////////////////////////////
      Particle.publish("extend", String(publishData), PRIVATE);
      /////////////////////////////////////////////////////////////////////////

      maxExtendReading = 0.00;
      monitorExtend = false;
    }

    // Publish Retract Cycle max current
    if (retracting && !monitorRetract)
    {
      monitorRetract = true;
      cycleStartTime = millis();
    }
    if (monitorRetract)
    {
      counts++;
      float readVoltage = updateVoltage();
      voltageTotal += readVoltage;
      currentTotal += readCurrent;
      if (readCurrent > maxRetractReading)
      {
        maxRetractReading = readCurrent;
      }
    }
    if (monitorRetract && !retracting)
    {

      float avgCurrent = currentTotal / counts;
      float avgVoltage = voltageTotal / counts;
      float avgWattage = avgCurrent * avgVoltage;
      unsigned long d = millis() - cycleStartTime;
      float cycleDuration = (float)d;
      cycleDuration = cycleDuration / 1000.00;

      char publishData[200];
      sprintf(publishData, "%0.2f Max Amps | %0.2f Avg Amps| %0.2f Avg Voltage| %0.2f Avg Wattage| Cycle Duration: %0.2f seconds| Cycles: %i", maxRetractReading, avgCurrent, avgVoltage, avgWattage, cycleDuration, cyclesCount);

      counts = 0;
      currentTotal = 0.00;
      voltageTotal = 0.00;

      // PUBLISH RETRACT EVENT ////////////////////////////////////////////////
      Particle.publish("retract", String(publishData), PRIVATE);
      /////////////////////////////////////////////////////////////////////////
      maxRetractReading = 0.00;
      monitorRetract = false;
    }

    // Output data to dashboard
    if (millis() > lastPublish + publishInterval)
    {
      char currentChar[10];
      float current = (raw_adc - rawADCbase) * currentPerStep;
      sprintf(currentChar, "%0.2f", current);
      lastPublish = millis();
      Blynk.virtualWrite(V9, String(currentChar));
      Blynk.virtualWrite(V11, cyclesCount);
    }
  }
}

float updateVoltage()
{
  int voltMonAddr = 0x68;

  float voltsPerStep = 0.000366216525521;

  // Start I2C Transmission
  Wire.beginTransmission(voltMonAddr);
  // Select configuration command
  // Continuous conversion mode, Channel-1, 12-bit resolution
  Wire.write(0x10);
  // Stop I2C Transmission
  byte status = Wire.endTransmission();
  if (status != 0)
  {
    return 255;
  }
  // Start I2C Transmission
  Wire.beginTransmission(voltMonAddr);
  // Select data register
  Wire.write(0x00);
  // Stop I2C Transmission
  status = Wire.endTransmission();
  if (status != 0)
  {
    Serial.println("Voltage sensor write 2 failed");
    return 255;
  }

  // Request 2 bytes of data
  Wire.requestFrom(voltMonAddr, 2);
  unsigned long startTime = millis();
  unsigned long tOut = 500;
  while (Wire.available() < 2 && millis() < startTime + tOut)
    ;
  if (Wire.available() < 2)
  {
    Serial.println("No response");
    return 255;
  }
  byte data[2];
  if (Wire.available() == 2)
  {
    data[0] = Wire.read();
    data[1] = Wire.read();
  }

  // Convert the data to 12-bits
  int raw_adc = ((data[0] & 0x0F) * 256) + data[1];
  if (raw_adc > 2047)
  {
    raw_adc -= 4095;
  }

  Serial.printf("Voltage: %0.2f, Raw ADC: %i \n", (raw_adc * voltsPerStep), raw_adc);

  return (raw_adc * voltsPerStep);
}