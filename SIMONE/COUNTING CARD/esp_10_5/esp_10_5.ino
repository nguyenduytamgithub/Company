
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#define stick D5

const char* ssid = "Simone.TG";
const char* password = "simone1987@";
const char* mqtt_server = "192.168.7.223";
int a = 0;
WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
//== button
int stt = 0;
int pre_stt = 0;
int count = 0;
unsigned long time_count = 0;
void setup_wifi() {

  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}
void sent_msg (String msg_data, int code){
    Wire.beginTransmission(8); // transmit to device #8
    Wire.write(code);
    Wire.write(msg_data.c_str());        // sends five bytes             // sends one byte
    Wire.endTransmission();   
}
void callback(String topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  String msg_data;
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
    msg_data += (char)payload[i];
  }
  Serial.println();
 if (topic == "counting/percent1"){
    Wire.beginTransmission(8); // transmit to device #8
    Wire.write(9);
    Wire.write(msg_data.toInt());        // sends five bytes             // sends one byte
    Wire.endTransmission(); 
 }if (topic == "counting/name1"){
    sent_msg(msg_data,11);
 }else if (topic == "counting/id1"){
    sent_msg(msg_data,12);
 }else if (topic == "counting/work1"){
   sent_msg(msg_data,13);
 }else if (topic == "counting/timeslot" || topic == "counting/timeslot1"){
    count = 0;  
    Wire.beginTransmission(8); // transmit to device #8
    Wire.write(15);
    Wire.write(msg_data.toInt());        // sends five bytes             // sends one byte
    Wire.endTransmission();
 }else if (topic == "counting/target1"){
    Wire.beginTransmission(8); // transmit to device #8
    Wire.write(14);
    Wire.write(msg_data.toInt());        // sends five bytes             // sends one byte
    Wire.endTransmission(); 
 }
}

void reconnect() {
  // Loop until we're reconnected
 // while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe("counting/name1");
      client.subscribe("counting/id1");
      client.subscribe("counting/work1");
      client.subscribe("counting/target1");
      client.subscribe("counting/timeslot");
      client.subscribe("counting/timeslot1");
      client.subscribe("counting/percent1");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
    //  delay(5000);
    }
 // }
}

void setup() {

  Wire.begin(D1,D2);
  Serial.begin(9600);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  pinMode(D5,INPUT_PULLUP);

}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  if (a == 0) {
    //delay(10000);
    client.publish("counting/intime1", "1");
    a = 1;
  }
  stt =digitalRead(D5);
  if (stt != pre_stt){
    if (stt == 0){
        count ++;
        if (count > 255) count = 255; // khong qua 255sp
        Wire.beginTransmission(8); // transmit to device #8
        Wire.write(10);
        Wire.write(count); 
        Wire.write((millis()-time_count)/1000); 
        Wire.endTransmission(); 
        time_count = millis();
    }
  }
  pre_stt = stt;
  Serial.print(stt);
   Serial.print(" ");
   Serial.println(count);
 
   
}
