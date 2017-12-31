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

int ledPin[] = {5, 7};

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
#define EEPROM_TARE_ARG_2 9


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
  digitalWrite(ledPin[0], 1);
  digitalWrite(ledPin[1], 1);
  hx711[0].tare();
  hx711[1].tare();
  digitalWrite(ledPin[0], 0);
  digitalWrite(ledPin[1], 0);
  Serial.println("reset...done");
}

int led_state[2] = {0};

void showLed(int index)
{
  static long t0[2] = {0};
  static long local_state[2] = {LOW};
  
  if (led_state[index] == 0) {
    digitalWrite(ledPin[index], LOW);
  } else if (led_state[index] == 1) {
    digitalWrite(ledPin[index], HIGH);
  } else if (led_state[index] == 2) {
    if (millis()> t0[index] + 1000) {
      t0[index] = millis();
      local_state[index] = HIGH - local_state[index];  
    }
    digitalWrite(ledPin[index],local_state[index]);
  } else if (led_state[index]==3) {
    if (millis()> t0[index] + 500) {
      t0[index] = millis();
      local_state[index] = HIGH - local_state[index];  
    }
    digitalWrite(ledPin[index],local_state[index]);
  } else if (led_state[index]==4) {
    if (millis()> t0[index] + 200) {
      t0[index] = millis();
      local_state[index] = HIGH - local_state[index];  
    }
    digitalWrite(ledPin[index],local_state[index]);
  }
}



void autoCalib(int index) {
  long OFFSET = hx711[index].read();
  hx711[index].set_offset(OFFSET);
  hx711[index].set_scale(TARE_1);
  // wait for user putting 500g on the scale
  led_state[index] = 4;
  while (true) {
    long delta = abs(hx711[index].read() - OFFSET);
    if (delta > 50000) {
      
      break;
    }
    Serial.println(delta);
    showLed(index);
    delay(1);
  }
  // wait for stable
  delay(2000); 
  led_state[index] = 3;
  double mu, w;
  mu = hx711[index].read();
  for (int i=0; i<30; i++) {
    w = hx711[index].read();
    mu = 0.5 * mu + 0.5 * w;
    showLed(index);
    delay(1);    
  }
  // compute scale
  double AUTO_SCALE = (mu - OFFSET) / 500;

  
  Serial.print("OFFSET ");
  Serial.println(OFFSET);
  Serial.print("AUTO_SCALE ");
  Serial.println(AUTO_SCALE);

  
  hx711[index].set_offset(OFFSET);
  hx711[index].set_scale(AUTO_SCALE);

  byte idx = (index == 0) ? EEPROM_TARE_ARG : EEPROM_TARE_ARG_2;
  EEPROM.writeDouble(idx, AUTO_SCALE);
  //hx711.tare();
  digitalWrite(ledPin[index], LOW);
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
  
  for (int index = 0; index < 2; index++) {
    pinMode(ledPin[index], OUTPUT);
    digitalWrite(ledPin[index], 0);
  }
  
  
  
  Wire.begin(i2c_code);
  
  Wire.onReceive(i2cReceiveEvent);
  Wire.onRequest(i2cRequestEvent);

  
  
  /*hx711[0].set_scale(TARE_1);
  hx711[0].tare();

  hx711[1].set_scale(TARE_2);
  hx711[1].tare();*/

  //read tare_arg
  float tare_arg = 0;
  tare_arg = EEPROM.readDouble(EEPROM_TARE_ARG);
  Serial.println(tare_arg);
  if (!isnan(tare_arg)) {
    hx711[0].set_scale(tare_arg);
    hx711[0].tare();
  } else
    autoCalib(0);

  float tare_arg_2 = 0;
  tare_arg_2 = EEPROM.readDouble(EEPROM_TARE_ARG_2);
  Serial.println(tare_arg_2);
  if (!isnan(tare_arg_2)) {
    hx711[1].set_scale(tare_arg_2);
    hx711[1].tare();
  } else
    autoCalib(1);
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

  if (run_calib_please) {
    run_calib_please = false;
    autoCalib(0);
    autoCalib(1);
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
      digitalWrite(ledPin[0], 1);
    } else if (c == ACTION_DESELECT) {
      digitalWrite(ledPin[0], 0);
    } else if (c == ACTION_AUTO_CALIB) {
      run_calib_please = true;
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

