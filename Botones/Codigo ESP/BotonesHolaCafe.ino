#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// --- CONFIGURACIÓN DE RED ---
const char* ssid = "Nombre de la red";
const char* password = "Contraseña";

// --- CONFIGURACIÓN DE PINES ---
const int pinBoton = ;     // Pin para el switch del boton
const int pinBateria = ;   // Pin para leer la batería 
const int numeroMesa = ;   // Numero de mesa del botón 

const char* serverUrl = "URl de la pagina";

bool estadoAnterior = HIGH;

bool asegurarWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return true;
  }

  Serial.println("Wi-Fi desconectado. Intentando reconectar...");
  WiFi.disconnect();
  WiFi.begin(ssid, password);

  unsigned long inicio = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - inicio < 8000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  return WiFi.status() == WL_CONNECTED;
}

int obtenerPorcentajeBateria() {
  long sumaMv = 0;
  for (int i = 0; i < 10; i++) {
    sumaMv += analogReadMilliVolts(pinBateria);
    delay(2);
  }

  // Factor ~2.0 para divisor de dos resistencias iguales (ej. 100k + 100k)
  float voltaje = (sumaMv / 10.0 / 1000.0) * 2.0;

  int porcentaje = (int)(((voltaje - 3.20) / (4.18 - 3.20)) * 100.0);
  porcentaje = constrain(porcentaje, 0, 100);

  Serial.print("Voltaje bateria: ");
  Serial.print(voltaje, 2);
  Serial.print(" V -> ");
  Serial.print(porcentaje);
  Serial.println("%");

  return porcentaje;
}

void setup() {
  Serial.begin(115200);
  pinMode(pinBoton, INPUT_PULLUP);
  pinMode(pinBateria, INPUT);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Conectando a Wi-Fi ");
  Serial.print(ssid);

  unsigned long inicio = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - inicio < 15000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n¡Conectado a la red Wi-Fi con éxito!");
  } else {
    Serial.println("\nNo conectó al inicio; se reintentará al presionar el botón.");
  }
}

void loop() {
  bool estadoActual = digitalRead(pinBoton);

  if (estadoAnterior == HIGH && estadoActual == LOW) {
    Serial.println("\n¡Switch presionado! Calculando batería y enviando alerta...");

    int nivelBateria = obtenerPorcentajeBateria();

    if (asegurarWiFi()) {
      WiFiClientSecure client;
      client.setInsecure();

      HTTPClient http;
      if (http.begin(client, serverUrl)) {
        http.addHeader("Content-Type", "application/json");

        String jsonData = "{\"mesa\": " + String(numeroMesa) +
                          ", \"estado\": \"pendiente\"" +
                          ", \"bateria\": " + String(nivelBateria) + "}";

        int httpResponseCode = http.POST(jsonData);

        if (httpResponseCode > 0) {
          Serial.println("¡Alerta y nivel de batería enviados con éxito!");
          Serial.println("Código HTTP: " + String(httpResponseCode));
        } else {
          Serial.println("Error al enviar la petición: " + http.errorToString(httpResponseCode));
        }

        http.end();
      } else {
        Serial.println("Error al inicializar HTTPClient.");
      }
    } else {
      Serial.println("Error: Conexión Wi-Fi perdida.");
    }

    delay(2000);
  }

  estadoAnterior = estadoActual;
}