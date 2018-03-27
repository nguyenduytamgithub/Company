#ifndef CKSERIAL
#define CKSERIAL

#include <string>
#include <map>
#include <vector>

class CKSerial {
private:
	std::map<std::string, std::vector<float>> dataMap;
public:
	void begin();
	void addData(std::string key, float value);
	void end();
};

#endif
