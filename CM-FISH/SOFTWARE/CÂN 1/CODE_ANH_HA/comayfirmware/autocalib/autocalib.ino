/* sample for digital weight scale of hx711, display with a HD44780 liquid crtstal monitor
 *
 * hardware design: syyyd
 * available at http://syyyd.taobao.com
 *
 * library design: Weihong Guan (@aguegu)
 * http://aguegu.net
 *
 * library host on
 * https://github.com/aguegu/Arduino
 */

// Hx711.DOUT - pin #A1
// Hx711.SCK - pin #A0

#include "HX711.h"

HX711 scale(A1, A0);//A1;A0;4;3

#define LED 2

int led_state = 2;

long OFFSET=0;
double AUTO_SCALE=1;

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
  OFFSET = scale.read();
  // wait for user putting 500g on the scale
  led_state = 4;
  while (true) {
    if (scale.read() - OFFSET > 10000) {
      break;
    }
    showLed();
    delay(1);
  }
  // wait for stable
  delay(1000); 
  led_state = 3;
  double mu, w;
  mu = scale.read();
  for (int i=0; i<30; i++) {
    w = scale.read();
    mu = 0.5 * mu + 0.5 * w;
    showLed();
    delay(1);    
  }
  // compute scale
  AUTO_SCALE = (mu - OFFSET) / 500;


  Serial.println(OFFSET);
  Serial.println(AUTO_SCALE);
  scale.set_offset(OFFSET);
  scale.set_scale(AUTO_SCALE);
  

}

void setup() {

  Serial.begin(9600);

  pinMode(LED,OUTPUT);
 
  autoCalib();
}


void loop() {

  Serial.print(scale.get_units(), 1);
  Serial.println(" g");

  showLed();

}

