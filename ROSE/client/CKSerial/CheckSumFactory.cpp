#include "CheckSumFactory.h"
#include <string>


CheckSumFactory *CheckSumFactory::instance = new CheckSumFactory();

CheckSumFactory* CheckSumFactory::getInstance() {
	return instance;
}

CheckSumFactory::CheckSumFactory() {
}

int CheckSumFactory::create(const char* str) {
	int len = strlen(str), sum = 0;
	for (int iCh = 0; iCh < len; iCh++) {
		sum += str[iCh];
	}
	int checksum = ~sum;
	return checksum;
}

bool CheckSumFactory::verify(const char* str, int scheck) {
	int len = strlen(str), sum = 0;
	for (int iCh = 0; iCh < len; iCh++) {
		sum += str[iCh];
	}
	sum = sum + scheck;
	int checksum = ~sum;
	return (checksum == 0);
}
