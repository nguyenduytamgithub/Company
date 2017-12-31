#ifndef cbi
#define cbi(sfr, bit) (_SFR_BYTE(sfr) &= ~_BV(bit))
#endif
#ifndef sbi
#define sbi(sfr, bit) (_SFR_BYTE(sfr) |= _BV(bit))
#endif
#define DEGITS_LENGTH  6
int DIGITS  [DEGITS_LENGTH] = {7, 6, 5, 4, 3, 2};
int SEGS    [][4] = {
   {0, 1, 2, 3},
   {0, 1, 2, 3} 
};

char buf[DEGITS_LENGTH + 1];
void setup() {
  buf[DEGITS_LENGTH] = 0;
  //tương đương input pullup cho digits
  for(int i = 0; i < DEGITS_LENGTH; i++) {
    buf[i] = '0';
    cbi(DDRD,   DIGITS[i]);
    sbi(PORTD,  DIGITS[i]);
  }

  //tương đưng với input pullup cho segments
  for(int i = 0; i < 2; i++) {
    for (int j = 0; j < 4; j++) {
      cbi(( i == 0) ? DDRB : DDRC,   SEGS[i][j]);
      //sbi(( i == 0) ? PORTB : PORTC,  SEGS[i][j]);
    }
  }

  Serial.begin(115200);
  Serial.println("Let hack");
}



static byte readSeg() {
  return ~(((PINB & 0b00001111) << 4) | (PINC & 0b00001111));
}

static byte readDigit() {
  return ((~PIND) >> (8 - DEGITS_LENGTH));
}



void loop() {
  // put your main code here, to run repeatedly:
  static unsigned long atimer = 0;
  if (millis() - atimer > 100) {
    int a = -1;
    int r = readSeg();
    int t = r & 0b01111111;
    int dp = -1;
    switch (t) {
      case 0b01000000:
        a = 0;
        break;
      case 0b01111001:
        a = 1;
        break;
      case 0b00100100:
        a = 2;
        break;
      case 0b00110000:
        a = 3;
        break;
      case 0b00011001:
        a = 4;
        break;
      case 0b00010010:
        a = 5;
        break;
      case 0b00000010:
        a = 6;
        break;
      case 0b01111000:
        a = 7;
        break;
      case 0b00000000:
        a = 8;
        break;
      case 0b00010000:
        a = 9;
        break;
    }
    /*Serial.println(PINB, BIN);
    Serial.println(PINC, BIN);*/
    /*Serial.print(r, BIN);
    Serial.print(' ');
    Serial.print(t, BIN);
    Serial.print(' ');
    Serial.println(a);
    Serial.print(' ');*/
    Serial.print(readDigit(), BIN);
    Serial.print(' ');
    Serial.println(r, BIN);
    if (a > -1) {//step 1 - read segment
      int dp = (r >> 7);
      /*Serial.print(t, BIN);
      Serial.print(' ');
      Serial.println(a);
      Serial.print(' ');
      Serial.println(readDigit(), BIN);*/
      //step 2 - read digit
      int rdigit = readDigit() & 0b00111111;
      int digit = -1;
      switch (rdigit) {
        case 0b00000001:
          digit = 0;
          break;
        case 0b00000010:
          digit = 1;
          break;
        case 0b00000100:
          digit = 2;
          break;
        case 0b00001000:
          digit = 3;
          break;
        case 0b00010000:
          digit = 4;
          break;
        case 0b00100000:
          digit = 5;
          break;
      }
      if (digit >= 0) {
        buf[digit] = a + '0';
        //Serial.println(buf);
      }
    }
    atimer = millis();
  }
}
