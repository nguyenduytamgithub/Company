#include <Arduino.h>
#include <led7seg.h>

Led7Seg::Led7Seg(byte dio, byte rclk, byte sclk)
{
	DIO = dio;
	RCLK = rclk;
	SCLK = sclk;
	pinMode(DIO,OUTPUT);
	pinMode(RCLK,OUTPUT);
	pinMode(SCLK,OUTPUT);
}


Led7Seg::~Led7Seg()
{
}


void Led7Seg::display()
{
	byte i;
	for(i = 0 ; i < 8 ;i ++)
	{
	   digitalWrite(RCLK, LOW);
	   shiftOut(DIO, SCLK, MSBFIRST, decodeLED7[data[i]]); 
	   shiftOut(DIO, SCLK, MSBFIRST, quet[i]);
	   digitalWrite(RCLK, HIGH);
	   delayMicroseconds(10);
	   //thoi gian nghi, tranh chong so
	   digitalWrite(RCLK, LOW);
	   shiftOut(DIO, SCLK, MSBFIRST, 0xFF);
	   shiftOut(DIO, SCLK, MSBFIRST, quet[i]);
	   digitalWrite(RCLK, HIGH);
	   delayMicroseconds(2);
	}
	
}

void Led7Seg::display_long(long x)
{

	data[0] = x % 10;
	x = x / 10;
	data[1] = x % 10;
	x = x / 10;
	data[2] = x % 10;
	x = x / 10;
	data[3] = x % 10;
	x = x / 10;
	data[4] = x % 10;
	x = x / 10;
	data[5] = x % 10;
	x = x / 10;
	data[6] = x % 10;
	x = x / 10;
	data[7] = x % 10;
	display();
}


void Led7Seg::display_error1(unsigned int gram)
{
	unsigned int x;
	
	for (int i=0; i<4; i++) {
		data[i] = 15;
	}
	
	x = gram;
	data[4] = x % 10;
	x = x / 10;
	data[5] = x % 10;
	x = x / 10;
	data[6] = x % 10;
	x = x / 10;
	data[7] = 10;
	display();
}

void Led7Seg::display_count_gram(unsigned int count, unsigned int gram)
{
	unsigned int x = gram;
	
	data[0] = x % 10;
	x = x / 10;
	data[1] = x % 10;
	x = x / 10;
	data[2] = x % 10;
	x = x / 10;
	data[3] = 10;
	
	x = count;
	data[4] = x % 10;
	x = x / 10;
	data[5] = x % 10;
	x = x / 10;
	data[6] = x % 10;
	x = x / 10;
	data[7] = 10;
	display();
}

void Led7Seg::display_count(unsigned int count)
{
	unsigned int x;
	
	data[4] = 10;
	data[5] = 10;
	data[6] = 10;
	data[7] = 10;
	
	x = count;
	data[0] = x % 10;
	x = x / 10;
	data[1] = x % 10;
	x = x / 10;
	data[2] = x % 10;
	x = x / 10;
	data[3] = 10;
	display();
}

void Led7Seg::display_count_waiting(unsigned int count)
{
	unsigned int x;
	static int offset=0;
	
	data[4] = 10;
	data[5] = 10;
	data[6] = 10;
	data[7] = 10;
	
	offset++;
	if (offset>30) {
		offset = 0;
	}
	if (offset>15) {
		for (int i=4; i<8; i++) {
			data[i] = 15;	
		}
		
	}
	
	
	x = count;
	data[0] = x % 10;
	x = x / 10;
	data[1] = x % 10;
	x = x / 10;
	data[2] = x % 10;
	x = x / 10;
	data[3] = 10;
	display();
}


void Led7Seg::display_none() {
	for (int i=0; i<8; i++) {
		data[i] = 15;
	}
	display();
}


void Led7Seg::display_long_blink(long x, bool blink)
{
	static int blink_state = 0;
	static unsigned long prev_time = 0;

	int i;
	for (i=0; i<8; i++) {
		data[i] = 10;
	}
	if (!blink || !blink_state) {

		bool neg=false;
		if (x<0) {
			x = -x;
			neg = true;
		}

		for (i=0; i<8; i++) {
			data[i] = x % 10;	
			x = x / 10;
			if (x==0) break;
		}
		if (neg && i<7) {
			data[i+1] = 15;
		}
	}

	if (blink) {
		if (millis() - prev_time > 500) {
			blink_state = 1 - blink_state;
			prev_time = millis();
		}
	} else {
		blink_state = 0;
	}

	display();
}
