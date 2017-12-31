#include <HX711.h>
#include <EEPROM.h>
#include <CRC32.h>

#define MAX_HX 15
#define PARAM_ADDR 1
#define HOP_TIME 100


HX711 hx[] = {
  HX711(22,23),
  HX711(24,25),
  HX711(26,27),
  HX711(28,29),
  HX711(30,31),
  HX711(32,33),
  HX711(34,35),
  HX711(36,37),
  HX711(38,39),
  HX711(40,41),
  HX711(42,43),
  HX711(44,45),
  HX711(46,47),
  HX711(48,49),
  HX711(50,51)  
};

double weights[MAX_HX];

typedef struct {
  double scale[MAX_HX];  
  uint32_t CHECKSUM;
} PARAM;

PARAM param;

bool stringComplete;
int count_buffer=0;
char buffer[256];

uint32_t compute_checksum(PARAM * p) {
  int i;
  CRC32 crc;

  uint8_t *x;
  x = (uint8_t *)p->scale;
  for (i=0; i<MAX_HX*sizeof(double); i++) {
    crc.update(x[i]);
  }
   
  return crc.finalize();
}

void init_param(PARAM * p) {
  int i;
  for (i=0; i<MAX_HX; i++) {
    p->scale[i] = 1;
  }
  p->CHECKSUM = compute_checksum(p);
}

void load_from_eeprom(PARAM * p) {
  int i;
  int addr = PARAM_ADDR;
  
  uint8_t *x;
  x = (uint8_t *)p->scale;
  for (i=0; i<MAX_HX*sizeof(double); i++) {
    x[i] = EEPROM.read(addr);
    addr+=1;
  }

  uint32_t cs;
  x = (uint8_t *) &cs;
  for (i=0; i<sizeof(uint32_t); i++) {
    x[i] = EEPROM.read(addr);
    addr+=1;
  }

  p->CHECKSUM = cs;
  
}

void upload_to_eeprom(PARAM * p) {
  int i;
  int addr = PARAM_ADDR;
  p->CHECKSUM = compute_checksum(p);

  //Serial.print("length=");
  //Serial.println(EEPROM.length());
  
  uint8_t *x;
  //Serial.println(addr);
  x = (uint8_t *)p->scale;
  for (i=0; i<MAX_HX*sizeof(double); i++) {
    EEPROM.write(addr, x[i]);
    addr+=1;
  }
  //Serial.println(addr);
  uint32_t cs = p->CHECKSUM;
  x = (uint8_t *) &cs;
  for (i=0; i<sizeof(uint32_t); i++) {
    EEPROM.write(addr, x[i]);
    addr+=1;
  }
  //Serial.println(addr);
}

void upload_to_eeprom_idx(PARAM * p, int idx) {
  int i;
  int addr = PARAM_ADDR;
  p->CHECKSUM = compute_checksum(p);

  //Serial.print("length=");
  //Serial.println(EEPROM.length());
  
  uint8_t *x;
  //Serial.println(addr);
  x = (uint8_t *)p->scale;
  for (i=0; i<MAX_HX*sizeof(double); i++) {
    if ((i >= (idx * sizeof(double))) && (i < ((idx+1) * sizeof(double))) ) {
      EEPROM.write(addr, x[i]);
    }
    addr+=1;
  }
  //Serial.println(addr);
  uint32_t cs = p->CHECKSUM;
  x = (uint8_t *) &cs;
  for (i=0; i<sizeof(uint32_t); i++) {
    EEPROM.write(addr, x[i]);
    addr+=1;
  }
  //Serial.println(addr);
}


void setup() {
  // put your setup code here, to run once:
  
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB
  }
  Serial.println("OK");
  
  // load param from eeprom
  load_from_eeprom(&param);

  // checksum
  uint32_t cs = compute_checksum(&param);

  if (cs == param.CHECKSUM) {
    Serial.println("load param: OK");
    // data from eeprom is ok.
  } else {
    Serial.println("load param: FAIL");
    // no data from eeprom
    // initial new data and upload to eeprom
    Serial.println("init param");
    init_param(&param);
    Serial.println("upload param to EEPROM");
    upload_to_eeprom(&param);
  }

  int i;
  for (i=0; i<MAX_HX; i++) {
    hx[i].set_scale(param.scale[i]);
    hx[i].tare();
    weights[i] = hx[i].get_units(1);
  }
  Serial.println("Let's go!");
}

bool is_tare_cmd(char *buf) {
  String cmd = "TARE";
  for (int i=0; i< cmd.length(); i++) {
    if (buf[i] != cmd[i]) return false; 
  }
  return true;
}

void do_tare(char * buf) {
  int idx;
  sscanf(buf,"TARE %d", &idx);

  Serial.print("do tare ");
  Serial.println(idx);
  if ((idx>=0) && (idx<MAX_HX)) {
    hx[idx].tare();
  }
}


void do_calib_scale(int idx, double w0) {
  double OFFSET;
  OFFSET = hx[idx].read_average();
  // wait for user putting 500g on the scale
  Serial.print("S1 ");
  Serial.println(idx);
  while (true) {
    if (hx[idx].read() - OFFSET > 10000) {
      break;
    }
  }
  // wait for stable
  delay(1000); 
  Serial.print("S2 ");
  Serial.println(idx);
  double mu, SCALE;
  mu = hx[idx].read_average();
  // compute scale
  SCALE = (mu - OFFSET) / w0;

  hx[idx].set_offset(OFFSET);
  hx[idx].set_scale(SCALE);
  param.scale[idx] = SCALE;
  upload_to_eeprom_idx(&param, idx);
  Serial.print("S3 ");
  Serial.println(idx);
}

void do_calib(char * buf) {
  Serial.println("do calib");
  int idx, w0;
  double w1;
  int c = sscanf(buf,"CALIB %d %d", &idx, &w0);
  Serial.println(idx);
  Serial.println(w0);
  Serial.println(c);
  if (c!=2) {
    Serial.println("CALIB <idx> <weight>");
    return;
  }
  if (idx>=0 && idx<MAX_HX) {
    do_calib_scale(idx, w0);
    
  }

}

bool is_calib_cmd(char *buf) {
  String cmd = "CALIB";
  for (int i=0; i< cmd.length(); i++) {
    if (buf[i] != cmd[i]) return false; 
  }
  return true;
}

void update_hx() {
  for (int i=0; i<MAX_HX; i++) {
    if (hx[i].is_ready())
      weights[i] = hx[i].get_units(1);
  }
}

void my_print(long x) {
  if (x<0) {
    Serial.print("-");
    x = -x;
  } else {
    Serial.print(" ");
  }
  Serial.print(x/100000);
  Serial.print((x/10000)%10);
  Serial.print((x/1000)%10);
  Serial.print((x/100)%10);
  Serial.print((x/10)%10);
  Serial.print(x%10) ;
}

void broadcast_hx_data() {
  static unsigned long prev_time = 0;
  unsigned long t = millis(); 
  if (prev_time + HOP_TIME > t) return;

  prev_time = t;
  for (int i=0; i<MAX_HX; i++) {
    my_print(round(weights[i]));
    
    Serial.print(", ");
  }
  //Serial.print(weights[12]);
  Serial.println();
}

void loop() {
  if (stringComplete) {
    Serial.println(buffer);
    count_buffer = 0;
    stringComplete = false;
    if (is_tare_cmd(buffer)) {
      do_tare(buffer);
    } else if (is_calib_cmd(buffer)) {
      do_calib(buffer);
    }
  }
  update_hx();
  broadcast_hx_data();
}


void serialEvent() {
  while (Serial.available()) {
    // get the new byte:
    char inChar = (char)Serial.read();
    buffer[count_buffer] = inChar;
    if (count_buffer<256) count_buffer += 1;
    
    // if the incoming character is a newline, set a flag
    // so the main loop can do something about it:
    if (inChar == '\n') {
      stringComplete = true;
      break;
    }
  }
}


