#include <HX711.h>
#include <Wire.h>
#include <QueueArray.h>
#include <EEPROMex.h>
#include <math.h>

#define TARE_1 458.89f//1515.23f
#define TARE_2 427.46f//1515.23f

#define hx711_data_pin A1
#define hx711_clock_pin A0

#define hx711_data_pin_2 4
#define hx711_clock_pin_2 3

#define LED 2

#define I2C_CODE 9 // 9 - 19
#undef I2C_CODE

#define ACTION_RESET 2 
#define ACTION_SELECT 3
#define ACTION_DESELECT 4
#define ACTION_AUTO_CALIB 5
#define STABLE_WEIGHT 0.5f
#define STABLE_WEIGHT_2 1.69f
#define NO_STABLE_TIMES 10
#define READ_AVERAGE_TIMES_2  5
#define READ_AVERAGE_TIMES    10

//EEPROM_I2C_BUS
#define EEPROM_I2C_CODE 100 //1;byte
#define EEPROM_TARE_ARG 1 //4;byte


HX711 hx711[] = {
  HX711(hx711_data_pin, hx711_clock_pin),
  HX711(hx711_data_pin_2, hx711_clock_pin_2)
};

typedef struct {
  long weight;
} DataPack;

QueueArray <DataPack> queue;


//-----------------------

double weight[2], sum_of_weight;

void reset() {
  Serial.println("reset");
  digitalWrite(LED, 1);
  hx711[0].tare();
  hx711[1].tare();
  digitalWrite(LED, 0);
  Serial.println("reset...done");
}

void setup() 

{
  
  Serial.begin(115200);
  Serial.println("begin serial");
  #ifdef I2C_CODE 
  EEPROM.writeByte(EEPROM_I2C_CODE, I2C_CODE);
  Serial.println("seted EPPROM");
  #endif
  byte i2c_code = EEPROM.readByte(EEPROM_I2C_CODE);
  Serial.print("I2C Code: ");
  Serial.println(i2c_code);
  
  pinMode(LED, OUTPUT);
  digitalWrite(LED, 0);
  
  Wire.begin(i2c_code);
  
  Wire.onReceive(i2cReceiveEvent);
  Wire.onRequest(i2cRequestEvent);

  
  
  hx711[0].set_scale(TARE_1);
  hx711[0].tare();

  hx711[1].set_scale(TARE_2);
  hx711[1].tare();
  
}

int btn_processing = 0;

bool run_calib_please = false, run_reset_please = false;

double total_weight, weight_array[READ_AVERAGE_TIMES_2 * 2] = {0};


void runLoadCell(const int index) {
  static unsigned int idx[2] = {0, 0};
  static unsigned long stable_idx[2] ={0, 0};
  static unsigned long no_stable_idx[2] = {0, 0};
  if (hx711[index].is_ready()) {
    /*Serial.print(index);
    Serial.print(' ');
    Serial.println(hx711[index].read_mva());*/
    weight_array[5 * index + (idx[index]++)] = hx711[index].read_mva();
    
    if (idx[index] >= READ_AVERAGE_TIMES_2) {
      double sum_of_weight = 0;
      double deltaWeight = 0;
      for (int i = 0; i < idx[index]; i++) {
        /*Serial.print(5 * index + i);
        Serial.print(' ');
        Serial.print(weight_array[5 * index + i]);
        Serial.print(' ');*/
        sum_of_weight += weight_array[5 * index + i];
        
      }
      /*Serial.print(sum_of_weight);
      Serial.print(' ');*/
      double new_weight = sum_of_weight / idx[index];
      deltaWeight = abs(new_weight - weight[index]);
      if (deltaWeight < STABLE_WEIGHT) {
        stable_idx[index]++;
        
      } else {
        stable_idx[index] = 0;
        
      }
      if (stable_idx[index] <= READ_AVERAGE_TIMES) {
        weight[index] = new_weight;
        if (abs(new_weight) < STABLE_WEIGHT_2) {
          no_stable_idx[index]++;
          if (no_stable_idx[index] > NO_STABLE_TIMES) {
            no_stable_idx[index] = 0;
            Serial.println("Hot tare");
            hx711[index].tare();
          }
        }
      }
      /*Serial.print(index);
      Serial.print(' ');
      
      Serial.print(idx[index]);
      Serial.print(' ');
      Serial.print(stable_idx[index]);
      Serial.print(' ');
      Serial.println(weight[index]);  */
      idx[index] = 0;  
    }      
  }
}

void loop() {
  static unsigned long t0 = 0;
  runLoadCell(0);
  runLoadCell(1);
  if (run_reset_please) {
    run_reset_please = false;
    reset();
  }
  if (millis() - t0 > 300) {
    total_weight = weight[0] + weight[1];
    prepare_i2c_data(total_weight);
    t0 = millis();
    Serial.println(total_weight);
  }
  //configure();
}

void prepare_i2c_data(const double weight) {
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
  DataPack dp={round(weight)};
  queue.push(dp);
}


void i2cReceiveEvent(int count)
{
  /*Serial.print("Received[");
  int i =0;
  while (Wire.available())
  {
    char c = Wire.read();
    Serial.print((byte)c);
    i++;
  }
  Serial.print("]");
  Serial.println(i);*/
  while (Wire.available()) {
    char c = Wire.read();
    if (c == ACTION_RESET) {
      run_reset_please = true;
    } else if (c == ACTION_SELECT) {
      digitalWrite(LED, 1);
    } else if (c == ACTION_DESELECT) {
      digitalWrite(LED, 0);
    }
  }
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

