#ifndef LED7SEG_h
#define LED7SEG_h

#if ARDUINO >= 100
#include "Arduino.h"
#else
#include "WProgram.h"
#endif

class Led7Seg 
{
	private:
		byte DIO; // 7
		byte RCLK; // 6
		byte SCLK; // 5
		const unsigned char decodeLED7[17] =      //seven segment digits in bits
			{
				0xC0, 0xf9, 0xA4, 0xB0, 0x99, 0x92, 0x83, 0xf8, 0x80, 0x98,
				0xff,//khong hien thi
				0x8E, 
				0xC7,// 
				0x92, 
				0x47, //11:F
				0xBF,  // -
				0x7F // .
			};

		//mang quey led , trong mot thoi dien chi co mot led 7 doan sang
		const unsigned char quet[10] = {0x01, 0x02, 0x04, 0x08,0x10,0x20,0x40,0x80}; 
		unsigned char data[10];
		
	public:
		Led7Seg(byte dio=7, byte rclk=6 , byte sclk=5);
		virtual ~Led7Seg();
		
		void display();
		void display_none();
		void display_long(long x);
		void display_long_blink(long x, bool blink);
		void display_count_gram(unsigned int count, unsigned int gram); 
		void display_count(unsigned int count);
		void display_count_waiting(unsigned int count);
		void display_error1(unsigned int gram);
};

#endif
