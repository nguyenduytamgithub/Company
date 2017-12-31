#include "CKSerial.h"
#include "sha256.h"
#include <iostream>
#include <stdlib.h>

void CKSerial::begin() {
	dataMap = std::map<std::string, std::vector<float>>();
}

void CKSerial::addData(std::string key, float value) {
	std::vector<float> vec = dataMap[key];
	vec.push_back(value);
	dataMap[key] = vec;
}

void CKSerial::end() {
	std::string msg;
	char buffer[512];
	char numBuff[50];
	for (std::map<std::string, std::vector<float>>::iterator it = dataMap.begin(); it != dataMap.end(); ++it) {
		std::vector<float> vec = it->second;
		for (int idx = 0; idx < vec.size(); ++idx) {
			dtostrf(vec[idx], 0, 2, numBuff);
			sprintf(buffer, "%s_%d:%.2f ", it->first.c_str(), idx, numBuff);
			msg.append(buffer);
		}
	}

	std::string scheck = sha256(msg);
	sprintf(buffer, "checksum:%s", scheck.c_str());
	msg.append(buffer);
	
	Serial.println(msg.c_str());
}
