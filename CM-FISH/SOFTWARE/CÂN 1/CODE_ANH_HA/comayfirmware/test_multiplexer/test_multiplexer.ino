#include "HX711.h"
#define Sel0 10
#define Sel1 8
#define Sel2 9

#define DT 7
#define SCK 6

HX711 hx711(DT, SCK);

class WeightAcc {
    private:
        int max;
        int idx;
        long ws[20];
        double offset;
        double scale;
        
    public:
        int first_tare;
        WeightAcc(){ 
            idx = 0; 
            max = 10;
            offset = 0;
            scale = 1;
            first_tare = 2; 
        }
        ~WeightAcc(){}
        void set_params(double o, double s) {
            offset = o;
            scale = s;
        }
        void add(long x) {
            ws[idx] = x;
            idx ++;
            if (idx>max) { 
              idx = 0;
              if (first_tare==0) {
                offset = get_average();
                first_tare = -1;
              } else if (first_tare>0) {
                first_tare -= 1;
              }
            }
        }

        double get_average() {
            double sum=0; 
            for (int i=0; i<max; i++) sum += ws[i];
            sum = sum/max;
            return sum;
          
        }

        double get_value() {
            return (get_average()-offset)/scale;
        } 
};

WeightAcc wa[16];


void select_scale(byte x)
{
    digitalWrite(Sel0,x&1);
    digitalWrite(Sel1,(x>>1)&1 );
    digitalWrite(Sel2,(x>>2)&1 );
}


void setup()
{
    Serial.begin(115200);
    pinMode(Sel0, OUTPUT);
    pinMode(Sel1, OUTPUT);
    pinMode(Sel2, OUTPUT);
    //pinMode(DT,OUTPUT);
    //pinMode(SCK,OUTPUT);
    Serial.println("Reading");

    //wa[0].set_params(8575277.6,(9240810.4 - 8575277.6)/500.0);     
    //wa[1].set_params(8335815.2,(9042653.0 - 8335815.2)/500.0);     
}

void loop()
{
   
    int i;
    static int show = 0;
    for (i=0; i<8; i++) {
        select_scale(1);
        delay(10);
        if (hx711.is_ready()) {
            wa[i].add(hx711.read());
            show += 1;
        }
        
    }
    if (show>7) {
      for (i=0; i<8; i++) {
          Serial.print(round(wa[i].get_value()));
          Serial.print("(");
          Serial.print(wa[i].first_tare);
          Serial.print(")");
          Serial.print(";\t");
      }
      Serial.println();
      show = 0;
    }

}
