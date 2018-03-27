#define ROLE 2
#define BT_ROLE 8
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
//====================
int read_button() { // doc gia tri nut bam ROLE
  return !digitalRead(BT_ROLE);
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
}
void loop () {
  //=========== doc chuoi dai tu monitor
//  if(Serial.available() > 0){
//   // Đọc giá trị nhận được từ bluetooth
//   bien = Serial.read();
// }
 //========== cap nhat chuoi rong

  if (read_button()) {
    digitalWrite(ROLE, 1);
    Serial.println("shot by button");
    delay(500);
  }else if(hour % 2== 0 && minute == 0) { // min khong can full vi qua 1p phai ngung bom, nhung delay 5p
    digitalWrite(ROLE, 1); 
    Serial.println("shot by time");
  } else {
    digitalWrite(ROLE, 0);
    Serial.println("off");
    delay(500);
  }

  readDS1307();
  /* Hiển thị thời gian ra Serial monitor */
  digitalClockDisplay();

}
