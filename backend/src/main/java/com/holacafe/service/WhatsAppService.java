package com.holacafe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.holacafe.dto.EnviarWhatsAppRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WhatsAppService {

    private final ObjectMapper objectMapper;
    private final TicketPdfService ticketPdfService;

    @Value("${meta.whatsapp.token:}")
    private String accessToken;

    @Value("${meta.whatsapp.phone-number-id:}")
    private String phoneNumberId;

    @Value("${meta.whatsapp.api-version:v22.0}")
    private String apiVersion;

    @Value("${meta.whatsapp.template-name:}")
    private String templateName;

    @Value("${meta.whatsapp.template-lang:en_US}")
    private String templateLang;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public Map<String, Object> enviarMensajeWhatsApp(EnviarWhatsAppRequest request) {
        String soloDigitos = request.getTelefono().replaceAll("\\D", "");
        if (soloDigitos.length() < 10) {
            throw new IllegalArgumentException("Ingresa un número de WhatsApp válido de al menos 10 dígitos.");
        }

        String numeroDestino = (soloDigitos.length() == 10) ? "52" + soloDigitos : soloDigitos;

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("destino", "+" + numeroDestino);

        boolean credencialesValidas = accessToken != null && !accessToken.isBlank()
                && !accessToken.contains("PLACEHOLDER")
                && phoneNumberId != null && !phoneNumberId.isBlank()
                && !phoneNumberId.contains("PLACEHOLDER");

        if (!credencialesValidas) {
            respuesta.put("enviado", false);
            respuesta.put("configurado", false);
            respuesta.put(
                    "mensaje",
                    "Configura meta.whatsapp.token y meta.whatsapp.phone-number-id en application.properties para enviar mensajes con Meta Cloud API."
            );
            return respuesta;
        }

        try {
            boolean usarPlantilla = templateName != null && !templateName.isBlank();
            boolean enviarComoPdf = !usarPlantilla && (request.getEnviarPdf() == null || request.getEnviarPdf());

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("recipient_type", "individual");
            payload.put("to", numeroDestino);

            String modoEnviado;
            if (enviarComoPdf) {
                String folioLimpio = (request.getFolio() != null && !request.getFolio().isBlank())
                        ? request.getFolio().replaceAll("[^A-Za-z0-9_-]", "")
                        : "Ticket";
                String fileName = "Ticket_HolaCafe_" + folioLimpio + ".pdf";

                byte[] pdfBytes = ticketPdfService.generarTicketPdf(request);
                String mediaId = subirPdfAMeta(pdfBytes, fileName);

                String caption = String.format(
                        "¡Hola, Café! ☕ Gracias por tu visita. Adjuntamos tu ticket %s (%s).",
                        request.getFolio() != null ? request.getFolio() : "",
                        request.getTotal() != null ? request.getTotal() : ""
                ).trim();

                payload.put("type", "document");
                Map<String, Object> document = new LinkedHashMap<>();
                document.put("id", mediaId);
                document.put("filename", fileName);
                document.put("caption", caption);
                payload.put("document", document);
                modoEnviado = "pdf";
                respuesta.put("filename", fileName);
            } else if (usarPlantilla) {
                payload.put("type", "template");
                Map<String, Object> template = new LinkedHashMap<>();
                template.put("name", templateName.trim());
                template.put("language", Map.of("code", templateLang.trim()));

                if (!"hello_world".equalsIgnoreCase(templateName.trim())) {
                    Map<String, Object> bodyComponent = new LinkedHashMap<>();
                    bodyComponent.put("type", "body");
                    bodyComponent.put("parameters", List.of(
                            Map.of("type", "text", "text", safeVar(request.getFolio(), "N/A")),
                            Map.of("type", "text", "text", safeVar(request.getTotal(), "$0.00 MXN")),
                            Map.of("type", "text", "text", safeVar(request.getMesa(), "Mesa")),
                            Map.of("type", "text", "text", safeVar(request.getFecha(), "Hoy")),
                            Map.of("type", "text", "text", safeVar(request.getResumen(), "Consumo en ¡Hola, Café!"))
                    ));
                    template.put("components", List.of(bodyComponent));
                }
                payload.put("template", template);
                modoEnviado = "template";
            } else {
                payload.put("type", "text");
                payload.put("text", Map.of(
                        "preview_url", false,
                        "body", request.getMensaje()
                ));
                modoEnviado = "text";
            }

            String url = String.format(
                    "https://graph.facebook.com/%s/%s/messages",
                    apiVersion.trim(),
                    phoneNumberId.trim()
            );

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Bearer " + accessToken.trim())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() >= 200 && httpResponse.statusCode() < 300) {
                JsonNode json = objectMapper.readTree(httpResponse.body());
                String messageId = json.path("messages").path(0).path("id").asText("");
                respuesta.put("enviado", true);
                respuesta.put("configurado", true);
                respuesta.put("modo", modoEnviado);
                respuesta.put("messageId", messageId);
                respuesta.put(
                        "mensaje",
                        "pdf".equals(modoEnviado)
                                ? "Ticket PDF enviado correctamente por WhatsApp a +" + numeroDestino
                                : "Ticket enviado correctamente por WhatsApp a +" + numeroDestino
                );
                return respuesta;
            }

            String detalleError = extraerErrorMeta(httpResponse.body(), httpResponse.statusCode());
            throw new IllegalArgumentException(detalleError);

        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Error al conectar con Meta WhatsApp Cloud API: " + ex.getMessage());
        }
    }

    private String subirPdfAMeta(byte[] pdfBytes, String fileName) throws Exception {
        String boundary = "----HolaCafeBoundary" + UUID.randomUUID().toString().replace("-", "");
        ByteArrayOutputStream body = new ByteArrayOutputStream();

        // Campo 1: messaging_product=whatsapp
        body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.write("Content-Disposition: form-data; name=\"messaging_product\"\r\n\r\n".getBytes(StandardCharsets.UTF_8));
        body.write("whatsapp\r\n".getBytes(StandardCharsets.UTF_8));

        // Campo 2: type=application/pdf
        body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.write("Content-Disposition: form-data; name=\"type\"\r\n\r\n".getBytes(StandardCharsets.UTF_8));
        body.write("application/pdf\r\n".getBytes(StandardCharsets.UTF_8));

        // Campo 3: archivo PDF
        body.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
        body.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + fileName + "\"\r\n").getBytes(StandardCharsets.UTF_8));
        body.write("Content-Type: application/pdf\r\n\r\n".getBytes(StandardCharsets.UTF_8));
        body.write(pdfBytes);
        body.write(("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));

        String uploadUrl = String.format(
                "https://graph.facebook.com/%s/%s/media",
                apiVersion.trim(),
                phoneNumberId.trim()
        );

        HttpRequest uploadRequest = HttpRequest.newBuilder()
                .uri(URI.create(uploadUrl))
                .timeout(Duration.ofSeconds(25))
                .header("Authorization", "Bearer " + accessToken.trim())
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body.toByteArray()))
                .build();

        HttpResponse<String> uploadResponse = httpClient.send(uploadRequest, HttpResponse.BodyHandlers.ofString());
        if (uploadResponse.statusCode() >= 200 && uploadResponse.statusCode() < 300) {
            JsonNode json = objectMapper.readTree(uploadResponse.body());
            String mediaId = json.path("id").asText("");
            if (!mediaId.isBlank()) {
                return mediaId;
            }
        }

        throw new IllegalArgumentException(extraerErrorMeta(uploadResponse.body(), uploadResponse.statusCode()));
    }

    private String safeVar(String value, String fallback) {
        if (value == null || value.isBlank()) return fallback;
        return value.replaceAll("[\\r\\n\\t]+", " ").replaceAll("\\s{2,}", " ").trim();
    }

    private String extraerErrorMeta(String body, int statusCode) {
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode err = root.path("error");
            int code = err.path("code").asInt(0);
            String msg = err.path("message").asText("");

            if (code == 131030) {
                return "Ese número no está en la lista de destinatarios de prueba de Meta. Agrégalo en Meta for Developers → WhatsApp → API Setup → To.";
            }
            if (code == 190) {
                return "El token temporal de Meta expiró o es inválido. Genera uno nuevo en Meta for Developers y actualiza meta.whatsapp.token.";
            }
            if (!msg.isBlank()) {
                return "Meta WhatsApp (" + statusCode + "): " + msg;
            }
        } catch (Exception ignored) { }
        return "Error de Meta WhatsApp Cloud API (HTTP " + statusCode + ").";
    }
}
