#include "SevSeg.h" //Include thư viện SevSeg
 
SevSeg myDisplay; // Khai báo biến myDisplay là đối tượng của thư viện SegSev
 
void setup() { //Hàm Setup
 
    int displayType = COMMON_ANODE; // CÁI NÀY VÔ CÙNG QUAN TRỌNG, nếu người ta bán cho bạn một Module LED 8 đoạn chung cực dương thì bạn không cần thay đổi dòng này. Còn nếu họ bán một Module LED 8 đoạn chung cực âm cho các bạn thì bạn cần thay đổi là COMMON_CATHODE. Và nếu người bán không nói cho bạn hoặc bạn quên không hỏi thì cũng không sao, cứ đặt như thế này và lắp mạch nếu không chạy đúng như những gì đoạn code này cần thực hiện thì bạn chỉ cần thay nó là COMMON_CATHODE thôi!
    int digit1 = 2; //Pin 12 led 7 đoạn
    int digit2 = 3; //Pin 9 led 7 đoạn
    int digit3 = 4; //Pin 8 led 7 đoạn
 
    int segA = 5; //Pin 11 led 7 đoạn
    int segB = 6; //Pin 7 led 7 đoạn
    int segC = 7; //Pin 4 led 7 đoạn
    int segD = 8; //Pin 2 led 7 đoạn
    int segE = 9; //Pin 1 led 7 đoạn
    int segF = 10; //Pin 10 led 7 đoạn
    int segG = 11; //Pin 5 led 7 đoạn
    int segDP= 12; //Pin 3 led 7 đoạn
 
    int numberOfDigits =3; // số dấu chấm
 
    myDisplay.Begin(displayType, numberOfDigits, digit1, digit2, digit3, 13, segA, segB, segC, segD, segE, segF, segG, segDP); // Bắt đầu cho phép giao tiếp Module LED 7 đoạn với Arduino
    
    myDisplay.SetBrightness(100); //điều chỉnh độ sáng của Module LED
 
 
}

char buf[5];
byte i = 0;
void loop(){
    static unsigned long atimer = 0;
    if (millis() - atimer > 200) {
      atimer = millis();
      sprintf(buf, "%03d", i++);
    }
    myDisplay.DisplayString(buf, 0b00000000); // Thể hiện chữ AbcD ra bảng LED, và dãy số 0b00001000 là vị trí dấu chấm. Bạn hãy thử thay những số 0 bằng số 1 hoặc ngược lại để kiểm nghiệm
    //myDisplay.DisplayString("999", 0b11111111);
}
