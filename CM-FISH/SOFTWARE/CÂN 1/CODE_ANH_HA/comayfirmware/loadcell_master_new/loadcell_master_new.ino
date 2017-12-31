#include <Wire.h>
#include <QueueArray.h>
#include <EEPROMex.h>
#include <math.h>
#include <SoftwareSerial.h>

SoftwareSerial mySerial(A1, A0); //RX, TX

char buff[14]; //Mang buff chua du lieu doc duoc tu Weight indicator 
long weight = 0; //Gia tri can 

const int BUTTON_PIN[] = {6, 7, 8, 9, 10, 11};

#define I2C_CODE 9 // 9 - 19
//#undef I2C_CODE

#define ACTION_RESET 2 
#define ACTION_AUTO_CALIB 5

boolean weightStatus = false;

//EEPROM_I2C_BUS
#define EEPROM_I2C_CODE 100 //1;byte


typedef struct {
  long weight;
  long other;
  long other2;
} DataPack;

QueueArray <DataPack> queue;




//-----------------------

double  sum_of_weight;


int incomingByte = 0;
 
//Gan Buff ve 0
void buffInit() {
  for(int i = 0; i < 14; i++)
    buff[i] = 0;
}
 
//In mang Buff
void printBuff() {
  for(int i = 0; i < 14; i++) {
    Serial.print(buff[i]);
    Serial.print(' ');
  }
  Serial.println();
}
 
//Lay gia tri can duoc tra ve qua Serial
void getWeight() { 
 
  weight = 0; //Luu gia tri can duoc 
  bool check = false; //Kiem tra dau thap phan
 
  //buff[1] == 'S' khi can Stable thi moi lay gia tri
  if (buff[2] == 'S') {
    for(int i = 4; i < 11; i++) {
      if (buff[i] >= '0' && buff[i] <= '9') {
        if (check == false) weight = weight * 10 + (buff[i] - '0');
        else if (check) weight = weight + (buff[i] - '0') / 10;  
      }
      else if (buff[i] == '.') check = true;
    }
  }
}


void setup() 
{
  
  Serial.begin(115200);
  mySerial.begin(9600);
  Serial.println("begin serial");
  #ifdef I2C_CODE 
  EEPROM.writeByte(EEPROM_I2C_CODE, I2C_CODE);
  Serial.println("seted EPPROM");
  #endif
  byte i2c_code = EEPROM.readByte(EEPROM_I2C_CODE);
  Serial.print("I2C Code: ");
  Serial.println(i2c_code);


  //init button
  for (int i = 0; i < sizeof(BUTTON_PIN) / sizeof(int); i++) {
    pinMode(BUTTON_PIN[i], OUTPUT);
    digitalWrite(BUTTON_PIN[i], HIGH);
  }
  
  Wire.begin(i2c_code);
  
  Wire.onReceive(i2cReceiveEvent);
  Wire.onRequest(i2cRequestEvent);

}


unsigned long timer = 0;
void loop() {
  
  
  if (mySerial.available() > 0) {
    weightStatus = true;
    timer = millis();
    incomingByte = mySerial.read();
    if (incomingByte == '>') { //Kiem tra phai bat dau chuoi byte khong
      buff[0] = incomingByte;
      for(int i = 1; i < 14; i++){
        buff[i] = mySerial.read();
        delay(5);
      }
      printBuff();     
      getWeight();
      prepare_i2c_data();
      Serial.println(weight);
    } else 
      buffInit(); //Ket thuc tra lai Buff = 0;
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
  DataPack dp={round(weight),0 ,0};
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
    DataPack dp={0,0,0};
    Wire.write((byte*)&dp, sizeof(dp));
  }
}

