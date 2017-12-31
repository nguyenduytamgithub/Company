#ifndef CHECKSUM
#define CHECKSUM

class CheckSumFactory {
private:
	static CheckSumFactory *instance;
	CheckSumFactory();

public:
	static CheckSumFactory* getInstance();

	int create(const char* str);
	bool verify(const char* str, int scheck);
};

#endif // CHECKSUM
