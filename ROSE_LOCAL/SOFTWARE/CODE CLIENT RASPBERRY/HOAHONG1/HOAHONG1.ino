//================= CAM BIEN ANH SANG
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_TSL2561_U.h>
//=========
#include <StandardCplusplus.h>
#include <vector>
#include <string>
#include <avr/pgmspace.h>
#include "CKSerial.h"

using namespace std;

Adafruit_TSL2561_Unified tsl = Adafruit_TSL2561_Unified(TSL2561_ADDR_FLOAT, 12345);

vector<int> vec;

CKSerial ckserial;

// ================ DHT11
#include "DHT.h"
DHT dht(22, DHT11);
//========== SERIAL STRING===================
char data;
char buff[255];
int iCh = 0;
//================= CAM BIEN DO AM ==========
int relay = 13;
//==========================================
bool isValidCharacter(char ch) {
  vec.push_back(10);
  return (ch >= '0' && ch <= '9') || (ch >= 'a' && ch <= 'z') || ch == '.' || ch == '_';
}
//===========================================
void displaySensorDetails(void)
{
  sensor_t sensor;
  tsl.getSensor(&sensor);
}

void configureSensor(void)
{

  tsl.enableAutoRange(true);            /* Auto-gain ... switches automatically between 1x and 16x */
  
  tsl.setIntegrationTime(TSL2561_INTEGRATIONTIME_13MS);      /* fast but low resolution */

}
long convert(long x, long in_min, long in_max, long out_min, long out_max)
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
int map_soil (int soil){
  return convert(analogRead(soil),1023,0,0,100);
}
void setup(void) 
{
  pinMode(A0,INPUT);
  pinMode(A1,INPUT);
  pinMode(A2,INPUT);
  pinMode(A4,INPUT);
  pinMode(13,OUTPUT);
  dht.begin();
  Serial.begin(115200);

//  CKSerial.begin();
  if(!tsl.begin())
  {
    /* There was a problem detecting the TSL2561 ... check your connections */
    Serial.print("lap cam bien chua ba..");
    while(1);
  }
  
  /* Display some basic information on this sensor */
//  displaySensorDetails();

//  /* Setup the sensor gain and integration time */
  configureSensor();

  //==============
  delay(500);
  Serial.print("HE Thong OK");Serial.println("");
}

void loop(void) 
{  
   while (Serial.available()) {
  data = Serial.read();
  if (data == '\r') {
    Serial.read(); // read '\n' charater
    buff[iCh] = '\0';
    iCh = 0;
    while (Serial.available()) Serial.read();
    //------- DHT11 -----
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    int soil0 = map_soil(A0);
    int soil1 = map_soil(A1);
    int soil2 = map_soil(A2);
    int soil3 = map_soil(A3);

    //  int soil0 = analogRead(A0);
    //  int soil1 = analogRead(A1);
    //  int soil2 = analogRead(A2);
    //  int soil3 = analogRead(A3);

    //------- LIGHT SENSOR   
    sensors_event_t event;
    tsl.getEvent(&event);

    /* Display the results (light is measured in lux) */
      ckserial.begin();
      ckserial.addData("light", 10.5);
      ckserial.end();
//    Serial.print("light:");
//    Serial.print(event.light); 
//    // Serial.print("lux");
//    Serial.print(" ");
//    Serial.print("soil0:");
//    Serial.print(soil0); 
//    Serial.print(" ");
//    Serial.print("soil1:");
//    Serial.print(soil1); 
//    Serial.print(" ");
//    Serial.print("soil2:");
//    Serial.print(soil2); 
//    Serial.print(" ");
//    Serial.print("soil3:");
//    Serial.print(soil3); 
//    //  Serial.print("%");
//    Serial.print(" ");
//    Serial.print("hum:"); 
//    Serial.print(h);
//    //Serial.print("%");
//    Serial.print(" ");
//    Serial.print("temp:"); 
//    Serial.print(t);
//    Serial.println(" ");

  

    if (event.light > 600) // bat cam bien dat
    digitalWrite(13,1);
    else
    digitalWrite(13,0);
    // 200 lux be hon canh bao bat den
    // lon hon dong nha man
    // cam bien dat < 400 bat may bom
    // 300 700 an toan, 700 > tat bom
  }
  else if (isValidCharacter(data)) buff[iCh++] = data;
  }

}
