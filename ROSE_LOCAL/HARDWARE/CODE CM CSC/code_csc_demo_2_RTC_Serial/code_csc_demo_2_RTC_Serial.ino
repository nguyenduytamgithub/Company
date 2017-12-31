int arr_soil[10] = {A0, A1, A2, A3, A4, A5, A6, A7, A8, A9};
int arr_soil_avl[10] = {0};
#define ROLE 2
#define BT_ROLE 3
#define VALUE 70  // nguong bom
//#define NUM 2 // so luong toi thieu duoi nguong
int num_soil = 10;
int sum = 0; //gia tri cam bien trung binh
//====================== RTC
#include <Wire.h> 
/* Địa chỉ của DS1307 */
const byte DS1307 = 0x68;
/* Số byte dữ liệu sẽ đọc từ DS1307 */
const byte NumberOfFields = 7;
/* khai báo các biến thời gian */
int second, minute, hour, day, wday, month, year;
//======================
int bien = 0;
//====================== 
void add_arr_soil_avl(int sheet, int pos) { // sheet la chan duoc cam, pos la vi tri thu i - 1 cua mang
  arr_soil_avl[pos - 1] = sheet;
}
void count_soil () { // ham dem so luong cam bien duoc ket noi
  int x, y;
  int count = 0;
  for (int i = 0; i < 10; i++) {
    x = 0; // gia tri chan duoi
    y = 1023; // gia tri chan tren
    for (int j = 0; j < 40; j++) {
      if (analogRead(arr_soil[i]) > x)  x = analogRead(arr_soil[i]);
      if (analogRead(arr_soil[i]) < y)  y = analogRead(arr_soil[i]);
      delay(10);
    }
    if (abs(x - y) > 100) {
      Serial.print("chan nay ");
      Serial.print(arr_soil[i]);
      Serial.println(" fail");
    } else {
      Serial.print("chan nay ");
      Serial.print(arr_soil[i]);
      Serial.println(" ok");
      count++;
      add_arr_soil_avl(i, count); // gui di vi tri chan va so luong duoc cam
    }
  }
  //  num_soil = count; // lay gia tri cho so luong divice toan he thong
  num_soil = 4; //set cung 4 thiet bimm
  Serial.print("so device la: ");
  Serial.println(count);
}

void read_soil (int arr_convert[]) { // doc va convert toan bo cam bien sang thang 100%
  for (int i = 0; i < num_soil; i++)
    arr_convert[i] = map(analogRead(arr_soil_avl[i]), 1023, 0, 0, 100);
}
int check_soil (int arr_convert[]) { // ham kiem tra 1 trong num_soil cam bien co duoi nguong quy dinh bom
  sum = 0; // gan ve 0 de reset sum moi lan goi ham
  //int temp = 0;
  for (int i = 0; i < num_soil; i++)
    sum += arr_convert[i];
  //if (arr_convert[i] < VALUE) temp++;
  //if(sum/num_soil < VALUE || temp >= 2)
  if (sum / num_soil < VALUE) // gia tri chia n de lay trung binh
    return 1;
  return 0;
}
int read_button() { // doc gia tri nut bam ROLE
  return !digitalRead(BT_ROLE);
}
void print_soil (int arr_convert[]) {
  for (int i = 0; i < num_soil; i++) {
    Serial.print(arr_convert[i]);
    Serial.print("  ");
  }
  Serial.print(sum / num_soil);
  Serial.print("  ");
  Serial.println();
}

/* cài đặt thời gian cho DS1307 */
void setTime(byte hr, byte min, byte sec, byte wd, byte d, byte mth, byte yr)
{
        Wire.beginTransmission(DS1307);
        Wire.write(byte(0x00)); // đặt lại pointer
        Wire.write(dec2bcd(sec));
        Wire.write(dec2bcd(min));
        Wire.write(dec2bcd(hr));
        Wire.write(dec2bcd(wd)); // day of week: Sunday = 1, Saturday = 7
        Wire.write(dec2bcd(d)); 
        Wire.write(dec2bcd(mth));
        Wire.write(dec2bcd(yr));
        Wire.endTransmission();
}
void readDS1307()
{
        Wire.beginTransmission(DS1307);
        Wire.write((byte)0x00);
        Wire.endTransmission();
        Wire.requestFrom(DS1307, NumberOfFields);
        
        second = bcd2dec(Wire.read() & 0x7f);
        minute = bcd2dec(Wire.read() );
        hour   = bcd2dec(Wire.read() & 0x3f); // chế độ 24h.
        wday   = bcd2dec(Wire.read() );
        day    = bcd2dec(Wire.read() );
        month  = bcd2dec(Wire.read() );
        year   = bcd2dec(Wire.read() );
        year += 2000;    
}
/* Chuyển từ format BCD (Binary-Coded Decimal) sang Decimal */
int bcd2dec(byte num)
{
        return ((num/16 * 10) + (num % 16));
}
/* Chuyển từ Decimal sang BCD */
int dec2bcd(byte num)
{
        return ((num/10 * 16) + (num % 10));
}

void digitalClockDisplay(){
    // digital clock display of the time
    Serial.print(hour);
    printDigits(minute);
    printDigits(second);
    Serial.print(" ");
    Serial.print(day);
    Serial.print(" ");
    Serial.print(month);
    Serial.print(" ");
    Serial.print(year); 
    Serial.println(); 
}
 
void printDigits(int digits){
    // các thành phần thời gian được ngăn chách bằng dấu :
    Serial.print(":");
        
    if(digits < 10)
        Serial.print('0');
    Serial.print(digits);
}
void setup () {
  Wire.begin();
  /* cài đặt thời gian cho module */
  //setTime(1, 21, 00, 5, 21, 12, 17); // 12:30:45 CN 08-02-2015
  Serial.begin (115200);
  pinMode(BT_ROLE, INPUT_PULLUP);
  pinMode(ROLE, OUTPUT);
  for (int i = 0; i < num_soil; i++)
    pinMode(arr_soil[i], INPUT);
  count_soil();
}
void loop () {
  int arr_convert[num_soil]; // chuyen doi toan bo gia tri cam bien da dem
  read_soil(arr_convert); //doc va convert toan bo gia tri cam bien
  //=========== doc chuoi dai tu monitor
  if(Serial.available() > 0){
   // Đọc giá trị nhận được từ bluetooth
   bien = Serial.read();
 }
 //========== cap nhat chuoi rong

  if (check_soil(arr_convert) || read_button()) {
 // if ( read_button()) {
   // Serial.println(bien);
    digitalWrite(ROLE, 1);
    delay(1000);
  }else if(hour == 23 && minute == 59  ) { // min khong can full vi qua 1p phai ngung bom, nhung delay 5p
    digitalWrite(ROLE, 1);
    delay(300000);
  }else if(hour == 12 && minute == 00  || bien == 49) { // min khong can full vi qua 1p phai ngung bom, nhung delay 5p
    digitalWrite(ROLE, 1);
    delay(60000);
  }
  else {
    digitalWrite(ROLE, 0);
    delay(1000);
  }
  print_soil(arr_convert); // in toan bo gia tri cam bien
  readDS1307();
  /* Hiển thị thời gian ra Serial monitor */
  digitalClockDisplay();
  //  for (int i = 0; i < 10; i++){
  //    Serial.print (analogRead(arr_soil[i]));
  //    Serial.print("  ");
  //  }
  //  Serial.println();
  //  delay (500);
}
