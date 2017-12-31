#include <led7seg.h>
#include <HX711.h>
#include <Wire.h>
#include <QueueArray.h>
#include <EEPROMex.h>
#include <math.h>

// led7seg
#define DIO 3
#define RCLK 4
#define SCLK 5

#define DEFAULT_TARE 1515.23f//1515.23f

#define hx711_data_pin A1
#define hx711_clock_pin A0

#define LED 2

#define I2C_CODE 14 // 9 - 19
#undef I2C_CODE

#define ACTION_RESET 2 
#define ACTION_SELECT 3
#define ACTION_DESELECT 4
#define ACTION_AUTO_CALIB 5
#define ACTION_WARNING 6
#define ACTION_NO_WARNING 7
#define STABLE_WEIGHT 0.5f
#define STABLE_WEIGHT_2 1.69f
#define NO_STABLE_TIMES 10
#define READ_AVERAGE_TIMES_2  3
#define READ_AVERAGE_TIMES    5

//EEPROM_I2C_BUS
#define EEPROM_I2C_CODE 100 //1;byte
#define EEPROM_TARE_ARG 123 //4;byte

Led7Seg led(DIO,RCLK,SCLK);
HX711 hx711(hx711_data_pin, hx711_clock_pin);

typedef struct {
  long weight;
  long other;
  long other2;
} DataPack;

QueueArray <DataPack> queue;


///CODE ANH Hạ á <3
long OFFSET=0;
float AUTO_SCALE=1;

int led_state = 2;

void showLed()
{
  static long t0 = 0;
  static long local_state = LOW;
  
  if (led_state==0) {
    digitalWrite(LED,LOW);
  } else if (led_state==1) {
    digitalWrite(LED,HIGH);
  } else if (led_state==2) {
    if (millis()> t0 + 1000) {
      t0 = millis();
      local_state = HIGH - local_state;  
    }
    digitalWrite(LED,local_state);
  } else if (led_state==3) {
    if (millis()> t0 + 500) {
      t0 = millis();
      local_state = HIGH - local_state;  
    }
    digitalWrite(LED,local_state);
  } else if (led_state==4) {
    if (millis()> t0 + 200) {
      t0 = millis();
      local_state = HIGH - local_state;  
    }
    digitalWrite(LED,local_state);
  }
}



void autoCalib() {
  OFFSET = hx711.read();
  hx711.set_offset(OFFSET);
  hx711.set_scale(DEFAULT_TARE);
  // wait for user putting 500g on the scale
  led_state = 4;
  while (true) {
    long delta = abs(hx711.read() - OFFSET);
    if (delta > 50000) {
      
      break;
    }
    Serial.println(delta);
    showLed();
    delay(1);
  }
  // wait for stable
  delay(2000); 
  led_state = 3;
  double mu, w;
  mu = hx711.read();
  for (int i=0; i<30; i++) {
    w = hx711.read();
    mu = 0.5 * mu + 0.5 * w;
    showLed();
    delay(1);    
  }
  // compute scale
  AUTO_SCALE = (mu - OFFSET) / 500;

  
  Serial.print("OFFSET ");
  Serial.println(OFFSET);
  Serial.print("AUTO_SCALE ");
  Serial.println(AUTO_SCALE);

  
  hx711.set_offset(OFFSET);
  hx711.set_scale(AUTO_SCALE);
  EEPROM.writeDouble(EEPROM_TARE_ARG, AUTO_SCALE);
  //hx711.tare();
  digitalWrite(LED, LOW);
}

//-----------------------

double weight, sum_of_weight;

void reset() {
  Serial.println("reset");
  digitalWrite(LED, 1);
  hx711.tare();
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

  
  //read tare_arg
  float tare_arg = 0;
  tare_arg = EEPROM.readDouble(EEPROM_TARE_ARG);
  Serial.println(tare_arg);
  if (!isnan(tare_arg)) {
    hx711.set_scale(tare_arg);
    hx711.tare();
  } else
    autoCalib();
}

int btn_processing = 0;

bool run_calib_please = false, run_reset_please = false, is_warning = false;

double weight_array[READ_AVERAGE_TIMES_2] = {};


void loop() {
  static unsigned int idx = 0;
  static unsigned long stable_idx = 0;
  static unsigned long no_stable_idx = 0;
  if (hx711.is_ready()) {
    weight_array[idx++] = hx711.read_mva();
   
    if (idx >= READ_AVERAGE_TIMES_2) {
      sum_of_weight = 0;
      double deltaWeight = 0;
      for (int i = 0; i < idx; i++) {
        sum_of_weight += weight_array[i];
        
      }
      double new_weight = sum_of_weight / idx;
      deltaWeight = abs(new_weight - weight);
      if (deltaWeight < STABLE_WEIGHT) {
        stable_idx++;
        
      } else {
        stable_idx = 0;
        
      }
      if (stable_idx <= READ_AVERAGE_TIMES) {
        weight = new_weight;
        if (abs(new_weight) < STABLE_WEIGHT_2) {
          no_stable_idx++;
          if (no_stable_idx > NO_STABLE_TIMES) {
            no_stable_idx = 0;
            //Serial.println("Hot tare");
            //hx711.tare();
          }
        }
      }
      prepare_i2c_data();
      prepare_i2c_data();
      Serial.print(stable_idx);
      Serial.print(' ');
      Serial.println(weight);  
      idx = 0;  
    }      
  }
  //if (!is_warning) {
  //  led.display_long(round(weight));
  //} else {
    //led.blink(round(weight));
    led.display_long_blink(round(weight), is_warning);
  //}
  if (run_reset_please) {
    run_reset_please = false;
    reset();
  }
  if (run_calib_please) {
    run_calib_please = false;
    autoCalib();
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
  DataPack dp={round(weight), 0, 0};
  queue.push(dp);
}

void print_info() {
      Serial.print("weight=");
      Serial.println(weight);

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
    } else if (c == ACTION_AUTO_CALIB) {
      run_calib_please = true;
    } else if (c == ACTION_WARNING) {
      is_warning = true;
    } else if (c == ACTION_NO_WARNING) {
      is_warning = false;
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
    DataPack dp={0, 0, 0};
    Wire.write((byte*)&dp, sizeof(dp));
  }
}

