#include <Wire.h>
#include <UTFT.h>
#include <EEPROM.h>
#define led_work 9
#define TARGET_CODE 14
#define WORK_CODE 13
#define ID_CODE 12
#define PERCENT_CODE 95
#define NAME_CODE 11
int stt_led = 0;
unsigned long check_time = 0;
String ID = "ID: ";
String Work,Name;
int Target = EEPROM.read(TARGET_CODE);
int Total = 0;
int Cycle = 0;
int arr[10] = {0}; // tme slot
// Declare which fonts we will be using
extern uint8_t SmallFont[];
extern uint8_t BigFont[];
//pos of time_slot
int pos_of_time_slot = EEPROM.read(100);
int pos_of_time_count = 0;
int count_time_of_work = -1; // khoi dong se co 1 update bang 0
int t_arr[255] = {0}; // time count, num = target
int sum_time = 0;
int PERCENT = EEPROM.read(PERCENT_CODE);
int total_prev = 0; // tong san pham truoc khung gio hien tai
UTFT myGLCD(ILI9341_16,38,39,40,41);
void set_name_to_eeprom(int howMany){
    int pos = 33;
    EEPROM.write(pos, howMany);
    while (Wire.available()){ // loop through all but the last
     char c = Wire.read();
     pos++;
     EEPROM.write(pos, int(c));  
    }  
}
void set_work_to_eeprom(int howMany){
    int pos = 53;
    EEPROM.write(pos, howMany);
    while (Wire.available()){ // loop through all but the last
     char c = Wire.read();
     pos++;
     EEPROM.write(pos, int(c));  
    }  
}
void set_id_to_eeprom(int howMany){
    int pos = 73;
    EEPROM.write(pos, howMany);
    while (Wire.available()){ // loop through all but the last
     char c = Wire.read();
     pos++;
     EEPROM.write(pos, int(c));  
    }  
}
void receiveEvent(int howMany) {
  int first = Wire.read();
  if (first == 12){ 
    Serial.println("ok");
    ID = "ID: ";
    set_id_to_eeprom(howMany);
    get_id_from_eeprom();
    myGLCD.clrScr();
    Serial.println(ID);
  }else if (first == 13){ 
    Work = "Work: ";
    set_work_to_eeprom(howMany);
    get_work_from_eeprom();
    myGLCD.clrScr();
    Serial.println(Work);
  }else if(first == 11){ //name
    Name = "Name: ";
    set_name_to_eeprom(howMany);
    get_name_from_eeprom();
    myGLCD.clrScr();
    Serial.println(Name);
  } else if (first == 14){ //target
    Target = Wire.read();
    EEPROM.write(TARGET_CODE, Target);
    myGLCD.clrScr();
    Serial.println(Target);
  }else if (first == 9){ //percent
    PERCENT = Wire.read();
    EEPROM.write(PERCENT_CODE, PERCENT);
    myGLCD.clrScr();
    Serial.println(PERCENT);
  }
   else if (first == 10){ //button  
    arr[pos_of_time_slot] = Wire.read(); 
    if (arr[pos_of_time_slot] == 0) myGLCD.clrScr(); 
    t_arr[pos_of_time_count] = Wire.read();
    if (t_arr[pos_of_time_count] == 0) t_arr[pos_of_time_count] = 1; 
    //Serial.println(t_arr[pos_of_time_count]); // thoi gian
    if (pos_of_time_count != 0)
      sum_time += t_arr[pos_of_time_count];
    //Serial.println(pos_of_time_count); // vi tri o dang count
    pos_of_time_count++;
    sum_of_total();
    //Serial.print(sum_time);
//    Serial.print(" ");
//   Serial.println(Total);
  }else if (first == 15){
    pos_of_time_slot = Wire.read();
    EEPROM.write(100, pos_of_time_slot);
    count_time_of_work++;
    for (int i = 0; i <= pos_of_time_count; i++)
      t_arr[i] = {0};
    pos_of_time_count = 0;
    sum_time = 0;
    arr[pos_of_time_slot] = 0; // chuyen khung gio moi can cap nhat =0 de xoa man hinh
    myGLCD.clrScr();
 }
}

void get_name_from_eeprom (){
  for (int i = 34; i < 33 + EEPROM.read(33); i ++)
      Name += char(EEPROM.read(i));  
}
void get_work_from_eeprom (){
  for (int i = 54; i < 53 + EEPROM.read(53); i ++)
      Work += char(EEPROM.read(i));  
}
void get_id_from_eeprom (){
  for (int i = 74; i < 73 + EEPROM.read(73); i ++)
      ID += char(EEPROM.read(i));  
}
void setup()
{
  Wire.begin(8);
  Wire.onReceive(receiveEvent);
  Serial.begin(115200);
  
  randomSeed(analogRead(0));
  pinMode(led_work,9);
// Setup the LCD
  myGLCD.InitLCD();
  
  Name = "Name: ";
  get_name_from_eeprom ();
  Work = "Work: ";
  get_work_from_eeprom ();
  ID = "ID: ";
  get_id_from_eeprom ();

  myGLCD.setColor(0, 0, 0); // nền chữ đen
  myGLCD.fillRect(1, 15, 318, 224); // tọa độ x, y, độ dài, độ rộng

}
void caculator (){
  if (sum_time != 0)
  Cycle = sum_time/(arr[pos_of_time_slot]-1);
//  if (Cycle < 10) myGLCD.clrScr(); //xoa 1 lan khong can vi cong nhan lam thuong > 10s
}

void sum_of_total(){
  Total = 0; //reset ko bi cong don
  for (int i = 0; i < 10; i++)
    Total += arr[i];  
}
int logictics(){
  total_prev = Total-arr[pos_of_time_slot];
  if (total_prev/count_time_of_work*100 < Target*PERCENT)
    return 1; 
  return 0;  
}
void active_led (){
   digitalWrite(led_work,stt_led);
   if ((sum_time/(arr[pos_of_time_slot]-1)) > Cycle*PERCENT/100)
    stt_led = 1;
    else 
    stt_led = 0;
}
void active_led_2 (){
   digitalWrite(led_work,stt_led);
   if (pos_of_time_slot != 0 && arr[pos_of_time_slot-1] != 0){ // ngoai tru khung gio dau va truoc do khac 0
      if (logictics()) stt_led = 1;
      else stt_led = 0;
   }else
    stt_led = 0;
}
void loop()
{
  
  myGLCD.setFont(SmallFont);
  caculator();
  active_led_2();
  int buf[318];
  int x, x2;
  int y, y2;
  int r;
 // Serial.println(EEPROM.read(NAME_CODE));
//====
 myGLCD.setFont(SmallFont);
  // mau do tren
  myGLCD.setColor(255, 0, 0); // màu nền tổng thể
 // myGLCD.fillRect(0, 0, 319, 14); // tọa độ x, y, độ dài, độ rộng
  myGLCD.drawLine(0, 0, 319, 0);
  myGLCD.drawLine(0, 13, 319, 13);
  myGLCD.drawLine(0, 14, 319, 14);
  // mau xanh duoi
  myGLCD.setColor(62, 218, 15); // màu nền tổng thể xanh
  //myGLCD.fillRect(0, 226, 319, 239); //phạm vi tô màu 
  myGLCD.drawLine(0, 226, 319, 226);
  myGLCD.drawLine(0, 227, 319, 227);
  myGLCD.drawLine(0, 239, 319, 239);
  // chu
  myGLCD.setColor(255, 255, 255); // màu chữ trắng
  myGLCD.setBackColor(255, 0, 0); // nền chữ tím
  myGLCD.print("*                Personal Counting Card                *", CENTER, 1); //tọa độ in chữ
  myGLCD.setBackColor(62, 218, 15); // nền xanh
  myGLCD.setColor(255,255,0); // chữ vàng
  myGLCD.print("               http://www.goldeneyetech.com.vn                      ", CENTER, 227);

  //khung trang
  myGLCD.setColor(255, 255, 255);
  myGLCD.drawRect(0, 15, 319, 225); //vẽ khung
  
//119,159
// Draw crosshairs
  myGLCD.setColor(255, 255, 0); // xanh nét 
  myGLCD.setBackColor(0, 0, 0); // background trắng
  myGLCD.print(Name, 5 , 22); //tọa độ in chữ
  myGLCD.print(ID, 217 , 22); //tọa độ in chữ
  myGLCD.print(Work, 5 , 48); //tọa độ in chữ
  myGLCD.print("Target", 217 , 48); //tọa độ in chữ
  myGLCD.setColor(255, 255, 255); // xanh nét 
  myGLCD.print("7:30", 10 , 79); //tọa độ in chữ
  myGLCD.print("8:30", 10 , 100); //tọa độ in chữ
  myGLCD.print("13:30", 10 , 157); //tọa độ in chữ
  myGLCD.print("14:30", 10 , 178); //tọa độ in chữ
  //========= cot thu 2
  myGLCD.print("8:30", 63 , 79); //tọa độ in chữ
  myGLCD.print("9:30", 63 , 100); //tọa độ in chữ
  myGLCD.print("14:30", 63 , 157); //tọa độ in chữ
  myGLCD.print("15:30", 63 , 178); //tọa độ in chữ
  
  //========= cot thu 3
  myGLCD.print("9:30", 116 , 79); //tọa độ in chữ
  myGLCD.print("10:30", 116 , 100); //tọa độ in chữ
  myGLCD.print("15:30", 116 , 157); //tọa độ in chữ
  myGLCD.print("16:30", 116 , 178); //tọa độ in chữ
  //========= cot thu 4
  myGLCD.print("10:30", 169 , 79); //tọa độ in chữ
  myGLCD.print("11:30", 169 , 100); //tọa độ in chữ
  myGLCD.print("17:30", 169 , 157); //tọa độ in chữ
  myGLCD.print("18:30", 169 , 178); //tọa độ in chữ
  //========= cot thu 5
  myGLCD.print("12:30", 222 , 79); //tọa độ in chữ
  myGLCD.print("13:30", 222 , 100); //tọa độ in chữ
  myGLCD.print("18:30", 222 , 157); //tọa độ in chữ
  myGLCD.print("19:30", 222 , 178); //tọa độ in chữ
    
  //========
  myGLCD.setColor(255, 255, 0); // xanh nét 
  myGLCD.print("Total", 275 , 89); //tọa độ in chữ
  myGLCD.print("Cycle", 275 , 166); //tọa độ in chữ
  //========
  //doc
  myGLCD.setColor(255, 255, 255); // xanh nét
  myGLCD.drawLine(53, 67, 53, 224);
  myGLCD.drawLine(106, 67, 106, 224);
  myGLCD.drawLine(159, 67, 159, 224);
  myGLCD.drawLine(212, 15, 212, 224); // thanh doc
  myGLCD.drawLine(265, 41, 265, 224);
  // ngang
  myGLCD.drawLine(1, 41, 318, 41);
  myGLCD.drawLine(1, 67, 318, 67);
  myGLCD.drawLine(1, 119, 318, 119);
  myGLCD.drawLine(1, 145, 318, 145);
  myGLCD.drawLine(1, 197, 318, 197);
  //========
  myGLCD.setFont(BigFont);
  //========= cot thu 6
  myGLCD.setColor(0, 200, 255); // xanh nét
  myGLCD.print(String(Total), 268 , 126); //tọa độ in chữ
  myGLCD.print(String(Cycle), 268 , 205); //tọa độ in chữ
  myGLCD.print(String(EEPROM.read(TARGET_CODE)), 268 , 48); //tọa độ in chữ
  //=======================
  myGLCD.setColor(0, 255, 60); // xanh nét
  myGLCD.print(String(arr[0]), 3 , 126); //tọa độ in chữ -20
  myGLCD.print(String(arr[5]), 3 , 205); //tọa độ in chữ - 20
  myGLCD.print(String(arr[1]), 57 , 126); //tọa độ in chữ -73
  myGLCD.print(String(arr[6]), 57 , 205); //tọa độ in chữ -73
  myGLCD.print(String(arr[2]), 109 , 126); //tọa độ in chữ -126
  myGLCD.print(String(arr[7]), 109 , 205); //tọa độ in chữ -126
  myGLCD.print(String(arr[8]), 162 , 205); //tọa độ in chữ -179
  myGLCD.print(String(arr[9]), 215 , 205); //tọa độ in chữ - 232
  myGLCD.print(String(arr[3]), 162 , 126); //tọa độ in chữ - 179
  myGLCD.print(String(arr[4]), 215 , 126); //tọa độ in chữ -232
//  while(1){}
}
