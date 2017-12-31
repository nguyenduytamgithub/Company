#include <HX711.h>
#include <Wire.h>
#include <QueueArray.h>

#define TARE_ARG 1515.23f

#define hx711_data_pin A0
#define hx711_clock_pin A1

#define LED 2

#define I2C_CODE 10

HX711 hx711(hx711_data_pin, hx711_clock_pin);

typedef struct {
  double weight;
} DataPack;

QueueArray <DataPack> queue;
//-----------------------

double weightLoadcell;

void setup() 

{
  Serial.begin(115200);
  Serial.println("begin serial");
  pinMode(LED, OUTPUT);
  digitalWrite(LED, 0);
  
  Wire.begin(I2C_CODE);
  Wire.onReceive(i2cReceiveEvent);
  Wire.onRequest(i2cRequestEvent);
  Serial.begin("Ok");
  hx711.set_scale(TARE_ARG);
  hx711.tare();
  
  Serial.begin("Tare ok");
}

int btn_processing = 0;


void loop() {
  if (hx711.is_ready()) {
    weightLoadcell = hx711.read_mva();
    prepare_i2c_data();
    Serial.println(weight);
  }
  //configure();
}

void prepare_i2c_data() {
  if (queue.isFull()) {
    Serial.println("WARNING: queue is full!");
    queue.pop();
  }
  /*String s = "";
  s += "{\"w\":";
  s += value;
  s += ",\"c\":";
  s += n;
  s += ", \"m\":";
  s += mean;
  s += ", \"a\":";
  s += state;
  s += "}";*/
  DataPack dp={weight};
  queue.push(dp);
}

void print_info() {
      Serial.print("weight=");
      Serial.println(weight);

}

void i2cReceiveEvent(int count)
{
  Serial.print("Received[");
  while (Wire.available())
  {
    char c = Wire.read();
    Serial.print(c);
  }
  Serial.println("]");
}

void i2cRequestEvent()
{
  if (!queue.isEmpty()) {
    /*String s = queue.pop();
    char buf[MAX_BUF];
    s.toCharArray(buf, MAX_BUF);
    Wire.write(buf);
    Wire.write(0);*/
    DataPack dp = queue.pop();
    Wire.write((byte*)&dp, sizeof(dp));
    Serial.print("sizeof(dp)");
    Serial.println(sizeof(dp));
  } else {
    DataPack dp={0};
    Wire.write((byte*)&dp, sizeof(dp));
  }
}






